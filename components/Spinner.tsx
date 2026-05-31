export function Spinner({ size = 'md', className = '', color = 'dark' }: { size?: 'sm' | 'md' | 'lg'; className?: string; color?: 'dark' | 'white' }) {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
  }

  const colorMap = {
    dark: {
      border: '2px solid rgba(17, 24, 39, 0.2)',
      borderTop: '2px solid #111827',
    },
    white: {
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
    },
  }

  return (
    <div
      className={className}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        ...colorMap[color],
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  )
}
