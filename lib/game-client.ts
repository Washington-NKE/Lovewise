// lib/game-client.ts - DEBUG VERSION

'use client'

export interface GameMessage {
  type: 'game_move' | 'game_start' | 'game_end' | 'game_state' | 'player_joined' | 'player_left' | 'chat_message';
  gameSessionId: string;
  playerId?: string;
  data?: any;
  timestamp?: string;
}

export class GameClient {
  private ws: WebSocket | null = null;
  private userId: string;
  private gameSessionId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(userId: string, gameSessionId: string) {
    this.userId = userId;
    this.gameSessionId = gameSessionId;
    console.log(`🎮 GameClient created for user ${userId} in session ${gameSessionId}`);
  }

  connect() {
    try {
      const wsUrl = `ws://localhost:3001?userId=${this.userId}&gameSessionId=${this.gameSessionId}`;
      console.log(`🎮 Connecting to: ${wsUrl}`);
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ Game WebSocket connected');
        this.reconnectAttempts = 0;
        this.startPinging();
        
        // Send game_start message
        const startMessage = {
          type: 'game_start',
          gameSessionId: this.gameSessionId,
          playerId: this.userId
        };
        console.log('📤 Sending game_start:', startMessage);
        this.send(startMessage);
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📥 Received message:', message);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Error parsing game message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`🔌 Game WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
        this.stopPinging();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ Game WebSocket error:', error);
      };
    } catch (error) {
      console.error('❌ Error connecting to game WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private handleMessage(message: GameMessage) {
    console.log(`🎯 Handling message type: ${message.type}`);
    
    switch (message.type) {
      case 'ping':
        this.send({ type: 'pong', gameSessionId: this.gameSessionId });
        break;
      
      case 'game_move':
        console.log('🎮 Game move received:', message.data);
        this.onGameMove?.(message.data);
        break;
      
      case 'game_state':
        console.log('🎮 Game state received:', message.data);
        this.onGameState?.(message.data);
        break;
      
      case 'player_joined':
        console.log(`👤 Player joined event: ${message.playerId}`);
        this.onPlayerJoined?.(message.playerId!);
        break;
      
      case 'player_left':
        console.log(`👋 Player left event: ${message.playerId}`);
        this.onPlayerLeft?.(message.playerId!);
        break;
      
      case 'chat_message':
        console.log('💬 Chat message received:', message.data);
        this.onChatMessage?.(message.data);
        break;
      
      case 'game_end':
        console.log('🏁 Game ended:', message.data);
        this.onGameEnd?.(message.data);
        break;
        
      default:
        console.log('❓ Unknown message type:', message.type);
    }
  }

  private startPinging() {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping', gameSessionId: this.gameSessionId });
    }, 30000);
  }

  private stopPinging() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Reconnecting in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  send(message: Partial<GameMessage>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const fullMessage = {
        ...message,
        gameSessionId: this.gameSessionId,
        playerId: this.userId,
        timestamp: new Date().toISOString()
      };
      console.log('📤 Sending message:', fullMessage);
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('⚠️ Cannot send message - WebSocket not open. ReadyState:', this.ws?.readyState);
    }
  }

  makeMove(moveData: any) {
    console.log('🎯 Making move:', moveData);
    this.send({
      type: 'game_move',
      data: moveData
    });
  }

  sendChatMessage(message: string) {
    console.log('💬 Sending chat message:', message);
    this.send({
      type: 'chat_message',
      data: { message, senderId: this.userId }
    });
  }

  disconnect() {
    console.log('🔌 Disconnecting GameClient');
    this.stopPinging();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Event handlers
  onGameMove?: (moveData: any) => void;
  onGameState?: (state: any) => void;
  onPlayerJoined?: (playerId: string) => void;
  onPlayerLeft?: (playerId: string) => void;
  onChatMessage?: (data: any) => void;
  onGameEnd?: (result: any) => void;
}