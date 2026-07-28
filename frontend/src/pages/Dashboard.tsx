import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'
import DealCard from '../components/DealCard'
import { getDashboard } from '../utils/api'
import { useTelegram } from '../hooks/useTelegram'

const Dashboard: React.FC = () => {
  const [balance, setBalance] = useState(0)
  const [deals, setDeals] = useState([])
  const navigate = useNavigate()
  const { impact } = useTelegram()

  useEffect(() => {
    getDashboard().then(res => {
      setBalance(res.data.balance)
      setDeals(res.data.deals || [])
    }).catch(console.error)
  }, [])

  return (
    <Layout>
      <GlassCard neon className="bg-gradient-to-r from-neon-blue/10 to-neon-green/10 border-neon-blue/30">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/50 text-sm">Баланс</p>
            <p className="text-3xl font-bold text-neon-blue">{balance} USDT</p>
          </div>
          <button
            onClick={() => { impact('heavy'); navigate('/wallet') }}
            className="btn-secondary text-sm py-2 px-4"
          >
            Пополнить
          </button>
        </div>
      </GlassCard>

      <div className="flex justify-between items-center mt-2">
        <h2 className="text-xl font-bold text-white">Активные сделки</h2>
        <button
          onClick={() => { impact('medium'); navigate('/create') }}
          className="btn-primary text-sm py-2 px-4"
        >
          + Создать
        </button>
      </div>

      {deals.length === 0 ? (
        <GlassCard className="text-center py-10 border-dashed border-white/10">
          <p className="text-white/40">Нет активных сделок</p>
          <p className="text-white/20 text-sm">Нажми «Создать», чтобы начать</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {deals.map(deal => (
            <DealCard key={deal.id} {...deal} />
          ))}
        </div>
      )}
    </Layout>
  )
}

export default Dashboard
