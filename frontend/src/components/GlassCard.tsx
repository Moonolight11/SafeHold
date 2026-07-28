import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  neon?: boolean
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', neon = false }) => {
  return (
    <div className={`glass-card ${neon ? 'neon-border' : ''} ${className}`}>
      {children}
    </div>
  )
}

export default GlassCard
