export default function LetterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ 
      backgroundColor: '#282a36', 
      color: '#f8f8f2',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {children}
    </div>
  )
}