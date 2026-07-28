import React from 'react'
import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'
import { useTelegram } from '../hooks/useTelegram'

const Profile: React.FC = () => {
  const { user } = useTelegram()

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-neon-purple">👤 Профиль</h1>
      <GlassCard neon className="text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-neon-blue to-neon-green mx-auto flex items-center justify-center text-3xl font-bold text-black">
          {user?.first_name?.[0] || 'U'}
        </div>
        <h2 className="text-xl font-bold mt-2">{user?.first_name} {user?.last_name}</h2>
        <p className="text-white/40">@{user?.username || 'нет'}</p>
        <p className="text-xs text-white/20">ID: {user?.id}</p>
      </GlassCard>
      <GlassCard>
        <div className="space-y-2">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/50">Всего сделок</span>
            <span className="font-bold">12</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-white/50">Завершено</span>
            <span className="text-neon-green">9</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">В спорах</span>
            <span className="text-red-400">1</span>
          </div>
        </div>
      </GlassCard>
      <button className="btn-secondary w-full text-red-400 border-red-500/30">
        Выйти из аккаунта
      </button>
    </Layout>
  )
}

export default Profile
