// lib/websocket-server.ts (Complete WebSocket server with messaging)
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

interface MessageData {
  id: string
  content: string
  senderId: string
  receiverId: string
  isRead: boolean
  createdAt: string
}

interface GameSession {
  id: string;
  gameId: number;
  players: Set<string>;
  gameState: any;
  createdAt: Date;
}

class MessagingWebSocketServer {
  private wss: WebSocketServer
  private clients: Map<string, Client> = new Map()
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
        console.log(`User ${userId} disconnected`)
        this.clients.delete(userId)
        this.updateUserPresence(userId, false)
        // Clear any typing indicators
        this.clearTypingIndicator(userId)
      })

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        this.clients.delete(userId)
        this.updateUserPresence(userId, false)
        this.clearTypingIndicator(userId)
      })

      // Send initial presence data
      this.sendPresenceUpdate(userId)
    })
  }

  private handleMessage(userId: string, message: { type: string; [key: string]: any }) {
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

      case 'send_message':
        this.handleSendMessage(userId, message.message)
        break

      case 'message_read':
        this.handleMessageRead(userId, message.messageId, message.senderId)
        break

      case 'typing_start':
        this.handleTypingIndicator(userId, message.receiverId, true)
        break

      case 'typing_stop':
        this.handleTypingIndicator(userId, message.receiverId, false)
        break

      case 'request_unread_count':
        this.sendUnreadCount(userId)
        break

      case 'game_start':
        this.handleGameStart(userId, message.gameSessionId)
        break

      case 'game_move':
        this.handleGameMove(userId, message.gameSessionId, message.data)
        break

      case 'chat_message':
        this.handleGameChat(userId, message.gameSessionId, message.data)
        break

      case 'game_end':
        this.handleGameEnd(message.gameSessionId, message.data)
        break
    }
  }

  private async handleSendMessage(senderId: string, messageData: MessageData) {
    try {
      const receiverId = messageData.receiverId

      // Send message to receiver if they're online
      const receiverClient = this.clients.get(receiverId)
      if (receiverClient) {
        receiverClient.ws.send(JSON.stringify({
          type: 'new_message',
          message: messageData
        }))

        // Send updated unread count to receiver
        this.sendUnreadCount(receiverId)
      }

      // Send confirmation to sender
      const senderClient = this.clients.get(senderId)
      if (senderClient) {
        senderClient.ws.send(JSON.stringify({
          type: 'message_sent',
          messageId: messageData.id,
          tempId: messageData.tempId || null
        }))
      }

      // Clear typing indicator since message was sent
      this.handleTypingIndicator(senderId, receiverId, false)

    } catch (error) {
      console.error('Error handling send message:', error)
    }
  }

  private async handleMessageRead(userId: string, messageId: string, senderId: string) {
    try {
      // Notify sender that message was read
      const senderClient = this.clients.get(senderId)
      if (senderClient) {
        senderClient.ws.send(JSON.stringify({
          type: 'message_read',
          messageId,
          readBy: userId
        }))
      }

      // Send updated unread count to the user who read the message
      this.sendUnreadCount(userId)

    } catch (error) {
      console.error('Error handling message read:', error)
    }
  }

  private handleTypingIndicator(senderId: string, receiverId: string, isTyping: boolean) {
    try {
      const receiverClient = this.clients.get(receiverId)
      if (!receiverClient) return

      const typingKey = `${senderId}-${receiverId}`

      if (isTyping) {
        // Clear existing timer
        const existingTimer = this.typingTimers.get(typingKey)
        if (existingTimer) {
          clearTimeout(existingTimer)
        }

        // Send typing indicator
        receiverClient.ws.send(JSON.stringify({
          type: 'typing_indicator',
          senderId,
          isTyping: true
        }))

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

        receiverClient.ws.send(JSON.stringify({
          type: 'typing_indicator',
          senderId,
          isTyping: false
        }))
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
      const client = this.clients.get(userId)
      if (!client) return

      // Get unread message count for this user
      const unreadCount = await prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      })

      client.ws.send(JSON.stringify({
        type: 'unread_count',
        count: unreadCount
      }))
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
          this.clearTypingIndicator(userId)
        } else {
          // Send ping
          client.ws.send(JSON.stringify({ type: 'ping' }))
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
    const client = this.clients.get(userId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message))
      return true
    }
    return false
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.clients.size
  }

  // Get connected user IDs
  public getConnectedUserIds(): string[] {
    return Array.from(this.clients.keys())
  }

  private handleGameStart(userId: string, gameSessionId: string) {
    console.log(`🎮 handleGameStart: User ${userId} joining session ${gameSessionId}`);
    
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
      const client = this.clients.get(userId);
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

    if (session.gameState) {
      client.ws.send(JSON.stringify({
        type: 'game_state',
        data: session.gameState
      }))
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

  private handleGameMove(userId: string, gameSessionId: string, moveData: any) {
    const session = this.gameSessions.get(gameSessionId);
    if (!session) return;

    // Update game state
    session.gameState = moveData;

    // Broadcast move to all players in the session
    this.broadcastToGameSession(gameSessionId, {
      type: 'game_move',
      playerId: userId,
      data: moveData
    }, userId);
  }

  private handleGameChat(userId: string, gameSessionId: string, chatData: any) {
    this.broadcastToGameSession(gameSessionId, {
      type: 'chat_message',
      data: chatData
    });
  }

  private handleGameEnd(gameSessionId: string, resultData: any) {
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
      
      const client = this.clients.get(playerId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
        console.log(`✅ Sent message to ${playerId}:`, message);
        sentCount++;
      } else {
        console.warn(`⚠️ Could not send to ${playerId} - client not found or connection not open`);
      }
    });
    
    return sentCount;
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