'use client'

import { ReactNode } from 'react'
import { useState, useEffect } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [rotationDegree, setRotationDegree] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotationDegree(prev => (prev + 1) % 360)
    }, 50)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-white dark:from-rose-950 dark:to-gray-950 p-4 overflow-hidden">
      <div className="relative">
        {/* Revolving gradient animation */}
        <div 
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-rose-400 via-red-500 to-amber-400 dark:from-rose-600 dark:via-red-500 dark:to-amber-500 opacity-80 blur-lg"
          style={{ 
            transform: `rotate(${rotationDegree}deg)`,
            width: 'calc(100% + 40px)',
            height: 'calc(100% + 40px)',
            left: '-20px',
            top: '-20px'
          }}
        ></div>
        
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  )
}