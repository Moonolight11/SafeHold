import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTelegram } from '../hooks/useTelegram'

const tabs = [
  { name: 'Главная', icon: '🏠', path: '/' },
  { name: 'Создать', icon: '➕', path: '/create' },
  { name: 'Кошелёк', icon: '💳', path: '/wallet' },
  { name: 'Профиль', icon: '👤', path: '/profile' }
]

const TabBar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { impact } = useTelegram()

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-dark-card/90 backdrop-blur-xl border-t border-white/10 px-2 py-1 flex justify-around items-center z-50">
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => {
              impact('light')
              navigate(tab.path)
            }}
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${
              active ? 'text-neon-blue scale-105' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className={`text-[10px] font-medium ${active ? 'text-neon-blue' : ''}`}>{tab.name}</span>
            {active && (
              <span className="w-1 h-1 rounded-full bg-neon-blue mt-0.5 animate-pulse" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default TabBar
