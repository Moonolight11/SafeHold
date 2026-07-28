import React from 'react'
import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'

const Wallet: React.FC = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-neon-green">💳 Кошелёк</h1>
      <GlassCard neon className="bg-gradient-to-r from-neon-green/5 to-neon-blue/5">
        <p className="text-white/50">Доступно</p>
        <p className="text-4xl font-bold text-neon-blue">245.50 USDT</p>
        <div className="flex gap-3 mt-4">
          <button className="btn-primary flex-1">Пополнить</button>
          <button className="btn-secondary flex-1">Вывести</button>
        </div>
      </GlassCard>
      <h3 className="text-lg font-semibold text-white/70">История</h3>
      <div className="space-y-2">
        {[1,2,3].map(i => (
          <GlassCard key={i} className="flex justify-between items-center">
            <div>
              <p className="font-medium">Сделка #{i}000</p>
              <p className="text-xs text-white/30">12.07.2026</p>
            </div>
            <span className={`font-bold ${i % 2 === 0 ? 'text-neon-green' : 'text-red-400'}`}>
              {i % 2 === 0 ? '+' : '-'} {i * 10} USDT
            </span>
          </GlassCard>
        ))}
      </div>
    </Layout>
  )
}

export default Wallet
