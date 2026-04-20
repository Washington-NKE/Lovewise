// lib/websocket-server.ts (Complete WebSocket server with messaging)
import { WebSocketServer, WebSocket } from 'ws'
import { PrismaClient, Prisma } from '@prisma/client'
import { IncomingMessage } from 'http'
import { parse } from 'url'

const prisma = new PrismaClient()

interface Client {
  ws: WebSocket
  userId: string
  lastPing: Date
  currentGameSessionId?: string
}

interface MessageData {
  id: string
  content: string
  senderId: string
  receiverId: string
  isRead: boolean
  createdAt: string
  tempId?: string
}

interface GameSession {
  id: string;
  gameId: number;
  players: Set<string>;
  gameState: unknown;
  createdAt: Date;
}

class MessagingWebSocketServer {
  private wss: WebSocketServer
  private clients: Map<string, Set<Client>> = new Map()
  private pingInterval!: NodeJS.Timeout
  private typingTimers: Map<string, NodeJS.Timeout> = new Map()
  private gameSessions: Map<string, GameSession> = new Map();

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

      const client: Client = { ws, userId, lastPing: new Date() }
      const userConnections = this.clients.get(userId) ?? new Set<Client>()
      userConnections.add(client)
      this.clients.set(userId, userConnections)

      // Update user's online status
      this.updateUserPresence(userId, true)

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(userId, ws, message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      })

      ws.on('close', () => {
        console.log(`User ${userId} disconnected`)
        this.removeClientConnection(userId, ws)
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        this.removeClientConnection(userId, ws)
      })

      // Send initial presence data
      this.sendPresenceUpdate(userId)
    })
  }

  private handleMessage(userId: string, sourceWs: WebSocket, message: { type: string; [key: string]: string | number | boolean | object | null }) {
    const connections = this.clients.get(userId)
    if (!connections || connections.size === 0) return

    const sourceClient = Array.from(connections).find((entry) => entry.ws === sourceWs)

    switch (message.type) {
      case 'ping':
        if (sourceClient) {
          sourceClient.lastPing = new Date()
        }
        sourceWs.send(JSON.stringify({ type: 'pong' }))
        break
      
      case 'presence_update':
        this.updateUserPresence(userId, true)
        break
      
      case 'request_presence':
        this.sendPresenceUpdate(userId)
        break

      case 'send_message':
        this.handleSendMessage(userId, message.message as MessageData)
        break

      case 'message_read':
        this.handleMessageRead(userId, message.messageId as string, message.senderId as string)
        break

      case 'typing_start':
        this.handleTypingIndicator(userId, message.receiverId as string, true)
        break

      case 'typing_stop':
        this.handleTypingIndicator(userId, message.receiverId as string, false)
        break

      case 'request_unread_count':
        this.sendUnreadCount(userId)
        break

      case 'game_start':
        void this.handleGameStart(userId, sourceWs, message.gameSessionId as string)
        break

      case 'game_move':
        void this.handleGameMove(userId, message.gameSessionId as string, message.data)
        break

      case 'chat_message':
        this.handleGameChat(userId, message.gameSessionId as string, message.data)
        break

      case 'game_end':
        this.handleGameEnd(message.gameSessionId as string, message.data)
        break
    }
  }

  private async handleSendMessage(senderId: string, messageData: MessageData) {
    try {
      const receiverId = messageData.receiverId

      // Send message to receiver if they're online
      const receiverOnline = this.sendToUser(receiverId, {
        type: 'new_message',
        message: messageData
      }) > 0

      if (receiverOnline) {
        // Send updated unread count to receiver
        this.sendUnreadCount(receiverId)
      }

      // Send confirmation to sender
      this.sendToUser(senderId, {
        type: 'message_sent',
        messageId: messageData.id,
        tempId: messageData.tempId || null
      })

      // Clear typing indicator since message was sent
      this.handleTypingIndicator(senderId, receiverId, false)

    } catch (error) {
      console.error('Error handling send message:', error)
    }
  }

  private async handleMessageRead(userId: string, messageId: string, senderId: string) {
    try {
      // Notify sender that message was read
      this.sendToUser(senderId, {
        type: 'message_read',
        messageId,
        readBy: userId
      })

      // Send updated unread count to the user who read the message
      this.sendUnreadCount(userId)

    } catch (error) {
      console.error('Error handling message read:', error)
    }
  }

  private handleTypingIndicator(senderId: string, receiverId: string, isTyping: boolean) {
    try {
      const receiverClients = this.getOpenConnections(receiverId)
      if (receiverClients.length === 0) return

      const typingKey = `${senderId}-${receiverId}`

      if (isTyping) {
        // Clear existing timer
        const existingTimer = this.typingTimers.get(typingKey)
        if (existingTimer) {
          clearTimeout(existingTimer)
        }

        // Send typing indicator
        for (const receiverClient of receiverClients) {
          receiverClient.ws.send(JSON.stringify({
            type: 'typing_indicator',
            senderId,
            isTyping: true
          }))
        }

        // Auto-clear typing after 3 seconds
        const timer = setTimeout(() => {
          receiverClient.ws.send(JSON.stringify({
            type: 'typing_indicator',
            senderId,
            isTyping: false
          }))
          this.typingTimers.delete(typingKey)
        }, 3000)

        this.typingTimers.set(typingKey, timer)
      } else {
        // Clear typing indicator immediately
        const timer = this.typingTimers.get(typingKey)
        if (timer) {
          clearTimeout(timer)
          this.typingTimers.delete(typingKey)
        }

        for (const receiverClient of receiverClients) {
          receiverClient.ws.send(JSON.stringify({
            type: 'typing_indicator',
            senderId,
            isTyping: false
          }))
        }
      }
    } catch (error) {
      console.error('Error handling typing indicator:', error)
    }
  }

  private clearTypingIndicator(userId: string) {
    // Clear all typing timers for this user
    const keysToDelete: string[] = []
    this.typingTimers.forEach((timer, key) => {
      if (key.startsWith(userId)) {
        clearTimeout(timer)
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.typingTimers.delete(key))
  }

  private async sendUnreadCount(userId: string) {
    try {
      // Get unread message count for this user
      const unreadCount = await prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      })

      this.sendToUser(userId, {
        type: 'unread_count',
        count: unreadCount
      })
    } catch (error) {
      console.error('Error sending unread count:', error)
    }
  }

  private async updateUserPresence(userId: string, isOnline: boolean) {
    try {
      // Check if user exists before updating
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
        if (this.getOpenConnections(partnerId).length > 0) {
          this.sendToUser(partnerId, {
            type: 'presence_change',
            userId,
            isOnline,
            timestamp: new Date().toISOString()
          })
        }
      })
    } catch (error) {
      console.error('Error notifying partners about presence change:', error)
    }
  }

  private async sendPresenceUpdate(userId: string) {
    try {
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

      this.sendToUser(userId, {
        type: 'presence_update',
        partners: partnerPresence
      })
    } catch (error) {
      console.error('Error sending presence update:', error)
    }
  }

  private startPingPong() {
    this.pingInterval = setInterval(() => {
      const now = new Date()
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000)

      this.clients.forEach((connections, userId) => {
        for (const client of Array.from(connections)) {
          if (client.lastPing < thirtySecondsAgo) {
            // Connection hasn't responded to ping in 30 seconds, remove it.
            client.ws.terminate()
            this.removeClientConnection(userId, client.ws)
          } else if (client.ws.readyState === WebSocket.OPEN) {
            // Send ping
            client.ws.send(JSON.stringify({ type: 'ping' }))
          } else {
            this.removeClientConnection(userId, client.ws)
          }
        }
      })
    }, 15000) // Check every 15 seconds
  }

  public close() {
    clearInterval(this.pingInterval)
    // Clear all typing timers
    this.typingTimers.forEach(timer => clearTimeout(timer))
    this.typingTimers.clear()
    this.wss.close()
  }

  // Utility method to send message to specific user
  public sendToUser(userId: string, message: object) {
    let sent = false
    for (const client of this.getOpenConnections(userId)) {
      client.ws.send(JSON.stringify(message))
      sent = true
    }
    return sent
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    let total = 0
    this.clients.forEach((connections) => {
      total += Array.from(connections).filter((entry) => entry.ws.readyState === WebSocket.OPEN).length
    })
    return total
  }

  // Get connected user IDs
  public getConnectedUserIds(): string[] {
    return Array.from(this.clients.keys()).filter((userId) => this.getOpenConnections(userId).length > 0)
  }

  private async handleGameStart(userId: string, sourceWs: WebSocket, gameSessionId: string) {
    console.log(`🎮 handleGameStart: User ${userId} joining session ${gameSessionId}`);

    const sourceClient = this.findClientConnection(userId, sourceWs)
    if (sourceClient) {
      sourceClient.currentGameSessionId = gameSessionId
      sourceClient.lastPing = new Date()
    }
    
    let session = this.gameSessions.get(gameSessionId);
    
    if (!session) {
      // First player creates the session
      console.log(`🎮 Creating new session for ${gameSessionId}`);
      session = {
        id: gameSessionId,
        gameId: 0,
        players: new Set([userId]),
        gameState: null,
        createdAt: new Date()
      };
      this.gameSessions.set(gameSessionId, session);
      console.log(`🎮 Session created. Player count: ${session.players.size}`);
    } else {
      // Subsequent players join existing session
      console.log(`🎮 Session exists. Current players:`, Array.from(session.players));
      
      // First, notify the NEW player about ALL existing players
      const client = sourceClient;
      if (client && client.ws.readyState === WebSocket.OPEN) {
        session.players.forEach(existingPlayerId => {
          if (existingPlayerId !== userId) {
            console.log(`🎮 Notifying ${userId} that ${existingPlayerId} is already in the game`);
            client.ws.send(JSON.stringify({
              type: 'player_joined',
              playerId: existingPlayerId,
              playerCount: session!.players.size + 1 // Future count after this player joins
            }));
          }
        });
      } else {
        console.error(`❌ Client ${userId} not found or connection not open`);
      }
      
      // Add new player to session
      session.players.add(userId);
      console.log(`🎮 Added ${userId} to session. New player count: ${session.players.size}`);
    }

    // Load persisted game state from DB if present.
    if (!session.gameState) {
      try {
        const persistedSession = await prisma.gameSession.findUnique({
          where: { id: gameSessionId },
          select: { gameState: true }
        })
        if (persistedSession?.gameState) {
          session.gameState = persistedSession.gameState
        }
      } catch (error) {
        console.error('Error loading persisted game state:', error)
      }
    }

    if (session.gameState) {
      const client = sourceClient;
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          type: 'game_state',
          data: session.gameState
        }))
      }
    }

    // Notify ALL OTHER players that this player joined
    console.log(`🎮 Broadcasting ${userId} joined to other players`);
    const broadcastCount = this.broadcastToGameSession(gameSessionId, {
      type: 'player_joined',
      playerId: userId,
      playerCount: session.players.size
    }, userId);
    
    console.log(`🎮 Broadcast sent to ${broadcastCount} players`);
  }

  private async handleGameMove(userId: string, gameSessionId: string, moveData: unknown) {
    const session = this.gameSessions.get(gameSessionId);
    if (!session) return;

    // Update game state
    session.gameState = moveData;

    // Persist state for reconnects / refreshes.
    try {
      await prisma.gameSession.update({
        where: { id: gameSessionId },
        data: { gameState: moveData as Prisma.InputJsonValue }
      })
    } catch (error) {
      console.error('Error persisting game state:', error)
    }

    // Broadcast move to all players in the session
    this.broadcastToGameSession(gameSessionId, {
      type: 'game_move',
      playerId: userId,
      data: moveData
    }, userId);
  }

  private handleGameChat(userId: string, gameSessionId: string, chatData: unknown) {
    this.broadcastToGameSession(gameSessionId, {
      type: 'chat_message',
      data: chatData
    });
  }

  private handleGameEnd(gameSessionId: string, resultData: unknown) {
    const session = this.gameSessions.get(gameSessionId);
    if (!session) return;

    this.broadcastToGameSession(gameSessionId, {
      type: 'game_end',
      data: resultData
    });

    // Clean up session after a delay
    setTimeout(() => {
      this.gameSessions.delete(gameSessionId);
    }, 60000); // 1 minute
  }

  private broadcastToGameSession(gameSessionId: string, message: object, excludeUserId?: string): number {
    const session = this.gameSessions.get(gameSessionId);
    if (!session) {
      console.warn(`⚠️ Session ${gameSessionId} not found for broadcast`);
      return 0;
    }

    let sentCount = 0;
    console.log(`📢 Broadcasting to session ${gameSessionId}, excluding ${excludeUserId || 'none'}`);
    console.log(`📢 Players in session:`, Array.from(session.players));

    session.players.forEach(playerId => {
      if (playerId === excludeUserId) {
        console.log(`⏭️ Skipping ${playerId} (excluded)`);
        return;
      }
      
      const connections = this.getOpenConnections(playerId).filter(
        (client) => client.currentGameSessionId === gameSessionId
      )

      if (connections.length > 0) {
        for (const client of connections) {
          client.ws.send(JSON.stringify(message));
          sentCount++;
        }
        console.log(`✅ Sent message to ${playerId}:`, message);
      } else {
        console.warn(`⚠️ Could not send to ${playerId} - no open game socket for session ${gameSessionId}`);
      }
    });
    
    return sentCount;
  }

  private findClientConnection(userId: string, ws: WebSocket): Client | undefined {
    const connections = this.clients.get(userId)
    if (!connections) return undefined
    return Array.from(connections).find((entry) => entry.ws === ws)
  }

  private getOpenConnections(userId: string): Client[] {
    const connections = this.clients.get(userId)
    if (!connections) return []
    return Array.from(connections).filter((entry) => entry.ws.readyState === WebSocket.OPEN)
  }

  private removeClientConnection(userId: string, ws: WebSocket) {
    const connections = this.clients.get(userId)
    if (!connections) return

    for (const client of Array.from(connections)) {
      if (client.ws === ws) {
        connections.delete(client)
      }
    }

    if (connections.size === 0) {
      this.clients.delete(userId)
      this.updateUserPresence(userId, false)
      this.clearTypingIndicator(userId)
    }
  }
}

// START THE SERVER
const PORT = process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT) : 3001;

let server: MessagingWebSocketServer;

try {
  console.log('🚀 Starting WebSocket server...');
  server = new MessagingWebSocketServer(PORT);
  console.log(`✅ WebSocket server started successfully on port ${PORT}`);
  console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}?userId=YOUR_USER_ID`);
  console.log('📋 Available message types:');
  console.log('  - send_message: Send a new message');
  console.log('  - message_read: Mark message as read');
  console.log('  - typing_start: Start typing indicator');
  console.log('  - typing_stop: Stop typing indicator');
  console.log('  - presence_update: Update user presence');
  console.log('  - request_presence: Request partner presence');
  console.log('  - request_unread_count: Request unread message count');
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

export { MessagingWebSocketServer }