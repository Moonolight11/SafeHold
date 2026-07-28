import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'
import { acceptDeal, depositDeal, releaseDeal, disputeDeal } from '../utils/api'
import { useTelegram } from '../hooks/useTelegram'

const DealDetails: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { impact } = useTelegram()
  const [deal, setDeal] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // В реальном проекте — fetch по id
    setDeal({
      id: Number(id),
      title: 'Тестовая сделка',
      description: 'Обмен игрового аккаунта',
      price: 150,
      status: 'created',
      creator_role: 'seller',
      creator_username: 'creator',
      partner_username: 'partner'
    })
  }, [id])

  const handleAction = async (action: () => Promise<any>) => {
    impact('heavy')
    setLoading(true)
    try {
      await action()
      alert('Действие выполнено')
      navigate('/')
    } catch (e) {
      alert('Ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (!deal) return <Layout><p>Загрузка...</p></Layout>

  const actions: Record<string, any> = {
    created: (
      <button
        onClick={() => handleAction(() => acceptDeal(deal.id))}
        className="btn-primary w-full"
        disabled={loading}
      >
        Принять сделку
      </button>
    ),
    accepted: (
      <button
        onClick={() => handleAction(() => depositDeal(deal.id))}
        className="btn-primary w-full"
        disabled={loading}
      >
        Внести гарант
      </button>
    ),
    secured: (
      <button
        onClick={() => handleAction(() => releaseDeal(deal.id))}
        className="btn-primary w-full bg-neon-green text-black"
        disabled={loading}
      >
        Подтвердить получение
      </button>
    ),
    completed: <p className="text-center text-neon-green font-bold">✅ Сделка завершена</p>,
    disputed: <p className="text-center text-red-500 font-bold">⚖️ Открыт спор</p>
  }

  return (
    <Layout>
      <GlassCard neon>
        <h1 className="text-2xl font-bold text-neon-blue">{deal.title}</h1>
        <p className="text-white/60 text-sm">{deal.description}</p>
        <div className="flex justify-between mt-2">
          <span className="text-neon-green font-bold">{deal.price} USDT</span>
          <span className="text-white/40 text-sm">Статус: {deal.status}</span>
        </div>
      </GlassCard>
      <GlassCard>
        <div className="flex justify-between text-sm">
          <div><span className="text-white/40">Создатель:</span> @{deal.creator_username}</div>
          <div><span className="text-white/40">Участник:</span> @{deal.partner_username || '—'}</div>
        </div>
      </GlassCard>
      <div className="space-y-3">
        {actions[deal.status] || <p className="text-white/40">Нет доступных действий</p>}
        {deal.status !== 'completed' && deal.status !== 'disputed' && (
          <button
            onClick={() => handleAction(() => disputeDeal(deal.id))}
            className="btn-secondary w-full border-red-500/50 text-red-400"
            disabled={loading}
          >
            Открыть спор
          </button>
        )}
      </div>
    </Layout>
  )
}

export default DealDetails
