import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import GlassCard from '../components/GlassCard'
import { createDeal } from '../utils/api'
import { useTelegram } from '../hooks/useTelegram'

const CreateDeal: React.FC = () => {
  const navigate = useNavigate()
  const { impact } = useTelegram()
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    partner: '',
    role: 'seller'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    impact('heavy')
    setLoading(true)
    try {
      const res = await createDeal({
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        partner_username: form.partner,
        role: form.role
      })
      navigate(`/deal/${res.data.deal_id}`)
    } catch (err) {
      alert('Ошибка создания сделки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-neon-blue">🚀 Новая сделка</h1>
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-white/50 block mb-1">Название</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none transition-all"
              placeholder="Например: Продажа игрового аккаунта"
              required
            />
          </div>
          <div>
            <label className="text-sm text-white/50 block mb-1">Описание</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none transition-all resize-none h-20"
              placeholder="Условия сделки..."
            />
          </div>
          <div>
            <label className="text-sm text-white/50 block mb-1">Сумма (USDT)</label>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none transition-all"
              placeholder="100"
              required
              min="1"
            />
          </div>
          <div>
            <label className="text-sm text-white/50 block mb-1">Контрагент (@username)</label>
            <input
              type="text"
              value={form.partner}
              onChange={e => setForm({ ...form, partner: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none transition-all"
              placeholder="@partner"
              required
            />
          </div>
          <div>
            <label className="text-sm text-white/50 block mb-1">Твоя роль</label>
            <div className="flex gap-3">
              {['buyer', 'seller'].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    form.role === role
                      ? 'bg-neon-blue/20 border border-neon-blue text-neon-blue'
                      : 'bg-white/5 border border-white/10 text-white/50'
                  }`}
                >
                  {role === 'buyer' ? '🛒 Покупатель' : '📦 Продавец'}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать сделку'}
          </button>
        </form>
      </GlassCard>
    </Layout>
  )
}

export default CreateDeal
