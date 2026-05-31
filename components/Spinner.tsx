export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
  }

  return (
    <div
      className={className}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: '2px solid rgba(17, 24, 39, 0.2)',
        borderTop: '2px solid #111827',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  )
}
