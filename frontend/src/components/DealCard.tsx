import React from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from './GlassCard'

interface DealCardProps {
  id: number
  title: string
  price: number
  status: string
  role: string
}

const statusMap: Record<string, { label: string; color: string }> = {
  created: { label: 'Создана', color: 'text-yellow-400' },
  accepted: { label: 'Принята', color: 'text-blue-400' },
  secured: { label: 'В гаранте', color: 'text-neon-green' },
  completed: { label: 'Завершена', color: 'text-gray-400' },
  disputed: { label: 'Спор', color: 'text-red-500' }
}

const DealCard: React.FC<DealCardProps> = ({ id, title, price, status, role }) => {
  const navigate = useNavigate()
  const statusInfo = statusMap[status] || { label: status, color: 'text-white' }

  return (
    <GlassCard
      onClick={() => navigate(`/deal/${id}`)}
      className="cursor-pointer hover:border-neon-blue/50 transition-all duration-200"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-white/50">Ты — {role === 'buyer' ? 'Покупатель' : 'Продавец'}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-neon-blue">{price} USDT</p>
          <p className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</p>
        </div>
      </div>
      <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            status === 'completed' ? 'bg-neon-green' :
            status === 'disputed' ? 'bg-red-500' :
            status === 'secured' ? 'bg-neon-blue' :
            'bg-white/20'
          }`}
          style={{ width: status === 'completed' ? '100%' : status === 'secured' ? '70%' : status === 'accepted' ? '40%' : '10%' }}
        />
      </div>
    </GlassCard>
  )
}

export default DealCard
