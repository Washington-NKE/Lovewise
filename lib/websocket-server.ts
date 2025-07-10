// lib/websocket-server.ts (Complete WebSocket server setup)
import { WebSocketServer, WebSocket } from 'ws'
import { PrismaClient } from '@prisma/client'
import { IncomingMessage } from 'http'
import { parse } from 'url'

const prisma = new PrismaClient()

interface Client {
  ws: WebSocket
  userId: string
  lastPing: Date
}

class PresenceWebSocketServer {
  private wss: WebSocketServer
  private clients: Map<string, Client> = new Map()
  private pingInterval!: NodeJS.Timeout

  constructor(port: number = 3001) {
    this.wss = new WebSocketServer({ port })
    this.setupEventHandlers()
    this.startPingPong()
    console.log(`WebSocket server running on port ${port}`)
  }

  private setupEventHandlers() {
  this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const { query } = parse(req.url || '', true)
    const userId = query.userId as string

    if (!userId || typeof userId !== 'string') {
      console.warn('Invalid or missing userId in WebSocket connection')
      ws.close(1008, 'Valid User ID required')
      return
    }

    console.log(`User ${userId} connected to WebSocket`)
    
    // Remove existing connection if any
    const existingClient = this.clients.get(userId)
    if (existingClient) {
      existingClient.ws.close(1000, 'New connection established')
    }

    // Store client connection
    this.clients.set(userId, { ws, userId, lastPing: new Date() })

      // Update user's online status
      this.updateUserPresence(userId, true)

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(userId, message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      })

      ws.on('close', () => {
        this.clients.delete(userId)
        this.updateUserPresence(userId, false)
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        this.clients.delete(userId)
        this.updateUserPresence(userId, false)
      })

      // Send initial presence data
      this.sendPresenceUpdate(userId)
    })
  }

  private handleMessage(userId: string, message: { type: string; [key: string]: unknown }) {
    const client = this.clients.get(userId)
    if (!client) return

    switch (message.type) {
      case 'ping':
        client.lastPing = new Date()
        client.ws.send(JSON.stringify({ type: 'pong' }))
        break
      
      case 'presence_update':
        this.updateUserPresence(userId, true)
        break
      
      case 'request_presence':
        this.sendPresenceUpdate(userId)
        break
    }
  }

  private async updateUserPresence(userId: string, isOnline: boolean) {
    try {
      //Check if user exists before updating
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) {
        console.warn(`User ${userId} not found when updating presence.`)
        return
      }

      await prisma.user.update({
        where: { id: userId },
        data: { lastActive: new Date() }
      })

      // Notify connected partners about presence change
      await this.notifyPartnersAboutPresenceChange(userId, isOnline)
    } catch (error) {
      console.error('Error updating user presence:', error)
    }
  }

  private async notifyPartnersAboutPresenceChange(userId: string, isOnline: boolean) {
    try {
      // Get user's relationships
      const relationships = await prisma.relationship.findMany({
        where: {
          OR: [
            { userId: userId, status: 'ACTIVE' },
            { partnerId: userId, status: 'ACTIVE' }
          ]
        },
        include: {
          user: true,
          partner: true
        }
      })

      // Get partner IDs
      const partnerIds = relationships.map(rel => 
        rel.userId === userId ? rel.partnerId : rel.userId
      )

      // Send presence update to connected partners
      partnerIds.forEach(partnerId => {
        const partnerClient = this.clients.get(partnerId)
        if (partnerClient) {
          partnerClient.ws.send(JSON.stringify({
            type: 'presence_change',
            userId,
            isOnline,
            timestamp: new Date().toISOString()
          }))
        }
      })
    } catch (error) {
      console.error('Error notifying partners about presence change:', error)
    }
  }

  private async sendPresenceUpdate(userId: string) {
    try {
      const client = this.clients.get(userId)
      if (!client) return

      // Get user's partner presence
      const relationships = await prisma.relationship.findMany({
        where: {
          OR: [
            { userId: userId, status: 'ACTIVE' },
            { partnerId: userId, status: 'ACTIVE' }
          ]
        },
        include: {
          user: true,
          partner: true
        }
      })

      const partnerPresence = relationships.map(rel => {
        const partner = rel.userId === userId ? rel.partner : rel.user
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const isOnline = partner.lastActive ? partner.lastActive > fiveMinutesAgo : false

        return {
          userId: partner.id,
          name: partner.name,
          profileImage: partner.profileImage,
          isOnline,
          lastSeen: partner.lastActive
        }
      })

      client.ws.send(JSON.stringify({
        type: 'presence_update',
        partners: partnerPresence
      }))
    } catch (error) {
      console.error('Error sending presence update:', error)
    }
  }

  private startPingPong() {
    this.pingInterval = setInterval(() => {
      const now = new Date()
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)

      this.clients.forEach((client, userId) => {
        if (client.lastPing < thirtySecondsAgo) {
          // Client hasn't responded to ping in 30 seconds, consider offline
          client.ws.terminate()
          this.clients.delete(userId)
          this.updateUserPresence(userId, false)
        } else {
          // Send ping
          client.ws.send(JSON.stringify({ type: 'ping' }))
        }
      })
    }, 15000) // Check every 15 seconds
  }

  public close() {
    clearInterval(this.pingInterval)
    this.wss.close()
  }
}

// START THE SERVER - This is what was missing!
const PORT = process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT) : 3001;

let server: PresenceWebSocketServer;

try {
  console.log('🚀 Starting WebSocket server...');
  server = new PresenceWebSocketServer(PORT);
  console.log(`✅ WebSocket server started successfully on port ${PORT}`);
  console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}?userId=YOUR_USER_ID`);
} catch (error) {
  console.error('❌ Failed to start WebSocket server:', error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down WebSocket server...');
  if (server) {
    server.close();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  if (server) {
    server.close();
  }
  process.exit(0);
});

// Keep the process alive
console.log('📡 WebSocket server is running. Press Ctrl+C to stop.');

export { PresenceWebSocketServer }