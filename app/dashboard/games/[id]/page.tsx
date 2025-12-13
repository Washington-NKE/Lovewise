'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { TicTacToe } from '@/components/games/tic-tac-toe'

export default function GamePage() {
  const params = useParams()
  const { data: session, status } = useSession()
  const [gameSessionId, setGameSessionId] = useState<string | null>(null)
  const [partner, setPartner] = useState<{ id: string; name?: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        setError(null)

        const userRes = await fetch('/api/user/current')
        if (!userRes.ok) throw new Error('Failed to fetch user')
        const user = await userRes.json()
        setUserId(user.id)

        const sessionRes = await fetch('/api/games/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameSlug: params.id })
        })
        if (!sessionRes.ok) {
          const msg = await sessionRes.text()
          throw new Error(msg || 'Failed to create game session')
        }
        const data = await sessionRes.json()

        setGameSessionId(data.sessionId || null)
        // partner can be null for solo play; set it anyway
        setPartner(data.partner || null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated' && params.id) {
      init()
    }
  }, [status, params.id])

  if (loading || status === 'loading') {
    return <div className="p-8">Loading game...</div>
  }
  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>
  }
  // Only gate on gameSessionId and userId; allow partner to be null
  if (!gameSessionId || !userId) {
    return <div className="p-8 text-rose-700">Unable to start game. Please try again.</div>
  }

  if (params.id === 'tic-tac-toe') {
    return (
      <TicTacToe
        gameSessionId={gameSessionId}
        userId={userId}
        partnerId={partner?.id || userId} // fallback to self for solo
        userName={session?.user?.name || 'You'}
        partnerName={partner?.name || 'Solo'}
      />
    )
  }

  return <div className="p-8">Game not found</div>
}