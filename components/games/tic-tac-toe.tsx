'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GameClient } from '@/lib/game-client'

interface TicTacToeProps {
  gameSessionId: string;
  userId: string;
  partnerId: string;
  userName: string;
  partnerName: string;
}

type Player = 'heart' | 'promise';
type Cell = Player | null;

export function TicTacToe({ gameSessionId, userId, partnerId, userName, partnerName }: TicTacToeProps) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('heart');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [gameClient, setGameClient] = useState<GameClient | null>(null);
  const [playerSymbol, setPlayerSymbol] = useState<Player>('heart');
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; message: string }>>([]);

  useEffect(() => {
    const client = new GameClient(userId, gameSessionId);
    
    client.onPlayerJoined = (playerId) => {
      console.log('🎮 Player joined:', playerId);
      if (playerId === partnerId) {
        setOpponentJoined(true);
      }
    };

    client.onGameMove = (moveData) => {
      setBoard(moveData.board);
      setCurrentPlayer(moveData.currentPlayer);
      if (moveData.winner) {
        setWinner(moveData.winner);
      }
    };

    client.onChatMessage = (data) => {
      setChatMessages(prev => [...prev, { sender: data.senderId === userId ? userName : partnerName, message: data.message }]);
    };

    client.connect();
    setGameClient(client);

    return () => {
      client.disconnect();
    };
  }, [gameSessionId, userId, partnerId]);

  useEffect(() => {
    // If partnerId equals userId, enable solo immediately
    if (partnerId === userId) {
      setOpponentJoined(true)
    }
  }, [partnerId, userId])

  const checkWinner = (squares: Cell[]): Player | 'draw' | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    if (squares.every(cell => cell !== null)) {
      return 'draw';
    }

    return null;
  };

  const handleCellClick = (index: number) => {
    if (!opponentJoined) return;
    if (board[index] || winner) return;
    if (currentPlayer !== playerSymbol) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    
    const gameWinner = checkWinner(newBoard);
    const nextPlayer: Player = currentPlayer === 'heart' ? 'promise' : 'heart';

    setBoard(newBoard);
    setCurrentPlayer(nextPlayer);
    
    if (gameWinner) {
      setWinner(gameWinner);
    }

    // Send move via WebSocket
    gameClient?.makeMove({
      board: newBoard,
      currentPlayer: nextPlayer,
      winner: gameWinner
    });
  };

  const resetGame = () => {
    const newBoard = Array(9).fill(null);
    setBoard(newBoard);
    setCurrentPlayer('heart');
    setWinner(null);
    
    gameClient?.makeMove({
      board: newBoard,
      currentPlayer: 'heart',
      winner: null
    });
  };

  const renderCell = (cell: Cell, index: number) => {
    return (
      <motion.button
        key={index}
        onClick={() => handleCellClick(index)}
        className={`
          aspect-square rounded-2xl flex items-center justify-center
          border-2 transition-all duration-300
          ${cell ? 'border-rose-300 bg-rose-50' : 'border-rose-200 bg-white hover:bg-rose-50 hover:border-rose-400'}
          ${currentPlayer === playerSymbol && !cell && !winner ? 'cursor-pointer' : 'cursor-not-allowed'}
        `}
        whileHover={!cell && !winner ? { scale: 1.05 } : {}}
        whileTap={!cell && !winner ? { scale: 0.95 } : {}}
      >
        <AnimatePresence mode="wait">
          {cell === 'heart' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <Heart className="w-12 h-12 md:w-16 md:h-16 text-rose-500 fill-rose-500" />
            </motion.div>
          )}
          {cell === 'promise' && (
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="text-4xl md:text-5xl font-bold text-fuchsia-600"
            >
              💍
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-rose-900 mb-2">
            Hearts & Promises
          </h1>
          <p className="text-rose-700">A romantic game of Tic-Tac-Toe for two ❤️</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="md:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200">
              <CardContent className="p-6">
                {/* Status */}
                <div className="mb-6 text-center">
                  {!opponentJoined ? (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center justify-center gap-2 text-rose-600"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Waiting for {partnerName} to join...</span>
                    </motion.div>
                  ) : winner ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-2xl font-bold text-rose-900">
                        {winner === 'draw' ? "It's a Draw! 💕" : 
                         winner === playerSymbol ? 'You Won! 🎉' : `${partnerName} Won! 💖`}
                      </p>
                      <Button onClick={resetGame} className="bg-gradient-to-r from-rose-500 to-fuchsia-600">
                        Play Again
                      </Button>
                    </motion.div>
                  ) : (
                    <p className="text-xl font-semibold text-rose-800">
                      {currentPlayer === playerSymbol ? 'Your Turn! 💫' : `${partnerName}'s Turn 💭`}
                    </p>
                  )}
                </div>

                {/* Board */}
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                  {board.map((cell, index) => renderCell(cell, index))}
                </div>

                {/* Player Info */}
                <div className="mt-6 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span className="text-rose-700">{userName} (You)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-fuchsia-700">{partnerName}</span>
                    <span className="text-2xl">💍</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 h-full">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-4 text-rose-900">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="font-semibold">Chat</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-96">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg text-sm ${
                        msg.sender === userName
                          ? 'bg-rose-100 text-rose-900 ml-4'
                          : 'bg-fuchsia-100 text-fuchsia-900 mr-4'
                      }`}
                    >
                      <p className="font-semibold text-xs mb-1">{msg.sender}</p>
                      <p>{msg.message}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Send a loving message..."
                    className="flex-1 px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:border-rose-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        gameClient?.sendChatMessage(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}