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
  }

  connect() {
    try {
      this.ws = new WebSocket(`ws://localhost:3001?userId=${this.userId}&gameSessionId=${this.gameSessionId}`);
      
      this.ws.onopen = () => {
        console.log('🎮 Game WebSocket connected');
        this.reconnectAttempts = 0;
        this.startPinging();
        this.send({
          type: 'game_start',
          gameSessionId: this.gameSessionId,
          playerId: this.userId
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing game message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🎮 Game WebSocket disconnected');
        this.stopPinging();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('🎮 Game WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to game WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private handleMessage(message: GameMessage) {
    switch (message.type) {
      case 'ping':
        this.send({ type: 'pong', gameSessionId: this.gameSessionId });
        break;
      
      case 'game_move':
        this.onGameMove?.(message.data);
        break;
      
      case 'game_state':
        this.onGameState?.(message.data);
        break;
      
      case 'player_joined':
        this.onPlayerJoined?.(message.playerId!);
        break;
      
      case 'player_left':
        this.onPlayerLeft?.(message.playerId!);
        break;
      
      case 'chat_message':
        this.onChatMessage?.(message.data);
        break;
      
      case 'game_end':
        this.onGameEnd?.(message.data);
        break;
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
      
      setTimeout(() => {
        console.log(`🎮 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('🎮 Max reconnection attempts reached');
    }
  }

  send(message: Partial<GameMessage>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        gameSessionId: this.gameSessionId,
        playerId: this.userId,
        timestamp: new Date().toISOString()
      }));
    }
  }

  makeMove(moveData: any) {
    this.send({
      type: 'game_move',
      data: moveData
    });
  }

  sendChatMessage(message: string) {
    this.send({
      type: 'chat_message',
      data: { message, senderId: this.userId }
    });
  }

  disconnect() {
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