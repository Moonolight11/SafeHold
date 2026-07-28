import React, { useState, useEffect } from 'react';

// ============================================================
// ГЛОБАЛЬНЫЕ ТИПЫ
// ============================================================
interface Deal {
  id: number;
  title: string;
  amount: number;
  role: 'buyer' | 'seller';
  opponent: string;
  category: string;
  status: 'created' | 'accepted' | 'deposited' | 'completed' | 'disputed';
  description?: string;
}

interface InventoryItem {
  id: number;
  name: string;
  status: string;
  price: number;
}

// ============================================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================================
const App: React.FC = () => {
  // ------------------------------------------------------------
  // СОСТОЯНИЯ
  // ------------------------------------------------------------
  const [currentTab, setCurrentTab] = useState<'deals' | 'create' | 'wallet' | 'exchange' | 'inventory' | 'profile'>('deals');
  const [tgUser, setTgUser] = useState<any>(null);

  // --- Сделки ---
  const [deals, setDeals] = useState<Deal[]>([
    { id: 1, title: 'Аккаунт Fortnite', amount: 85, role: 'seller', opponent: '@john_doe', category: 'Игры', status: 'created' },
    { id: 2, title: 'Логотип для бренда', amount: 120, role: 'buyer', opponent: '@design_pro', category: 'Дизайн', status: 'deposited' },
    { id: 3, title: 'Бот для Telegram', amount: 250, role: 'seller', opponent: '@coder_dev', category: 'Кодинг', status: 'completed' }
  ]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDealModal, setShowDealModal] = useState(false);

  // --- Создание ---
  const [createForm, setCreateForm] = useState({
    title: '',
    amount: '',
    role: 'seller' as 'buyer' | 'seller',
    opponent: '',
    category: 'Игры',
    description: ''
  });

  // --- Кошелёк ---
  const [balance, setBalance] = useState({ available: 1240.50, frozen: 350.00 });
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNetwork, setDepositNetwork] = useState('TRC-20');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  // --- Обменник ---
  const [exchangeFrom, setExchangeFrom] = useState({ amount: '', currency: 'USDT' });
  const [exchangeTo, setExchangeTo] = useState({ amount: '', currency: 'RUB' });
  const exchangeRate = 92.5;

  // --- Инвентарь ---
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    { id: 1, name: 'Аккаунт Steam', status: 'В сейфе гаранта', price: 60 },
    { id: 2, name: 'Дизайн-пак', status: 'Готов к выдаче', price: 45 },
    { id: 3, name: 'Скрипт парсинга', status: 'В сейфе гаранта', price: 120 }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // ------------------------------------------------------------
  // ЭФФЕКТЫ
  // ------------------------------------------------------------
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.ready();
      setTgUser(tg.initDataUnsafe?.user || null);
    }
  }, []);

  // ------------------------------------------------------------
  // ЛОГИКА
  // ------------------------------------------------------------
  const handleCreateDeal = () => {
    const newDeal: Deal = {
      id: Date.now(),
      title: createForm.title,
      amount: parseFloat(createForm.amount) || 0,
      role: createForm.role,
      opponent: createForm.opponent,
      category: createForm.category,
      status: 'created',
      description: createForm.description
    };
    setDeals([newDeal, ...deals]);
    setCreateForm({ title: '', amount: '', role: 'seller', opponent: '', category: 'Игры', description: '' });
    setCurrentTab('deals');
  };

  const handleDealAction = (dealId: number, action: 'deposit' | 'release' | 'dispute') => {
    setDeals(deals.map(deal => {
      if (deal.id === dealId) {
        let newStatus = deal.status;
        if (action === 'deposit' && deal.status === 'accepted') newStatus = 'deposited';
        if (action === 'release' && deal.status === 'deposited') newStatus = 'completed';
        if (action === 'dispute' && (deal.status === 'deposited' || deal.status === 'accepted')) newStatus = 'disputed';
        return { ...deal, status: newStatus };
      }
      return deal;
    }));
    setSelectedDeal(null);
    setShowDealModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return '#fbbf24';
      case 'accepted': return '#60a5fa';
      case 'deposited': return '#00f3ff';
      case 'completed': return '#10b981';
      case 'disputed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'created': return 'Создана';
      case 'accepted': return 'Принята';
      case 'deposited': return 'Депозит внесён';
      case 'completed': return 'Завершена';
      case 'disputed': return 'Спор';
      default: return status;
    }
  };

  // ------------------------------------------------------------
  // РЕНДЕР ВКЛАДОК
  // ------------------------------------------------------------
  const renderDealsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Статистика */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>Активных</div>
          <div style={{ color: '#00f3ff', fontWeight: 'bold', fontSize: '20px' }}>{deals.filter(d => d.status !== 'completed' && d.status !== 'disputed').length}</div>
        </div>
        <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>Завершено</div>
          <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '20px' }}>{deals.filter(d => d.status === 'completed').length}</div>
        </div>
        <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>Споры</div>
          <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '20px' }}>{deals.filter(d => d.status === 'disputed').length}</div>
        </div>
      </div>

      {/* Список сделок */}
      {deals.length === 0 ? (
        <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <div style={{ color: '#6b7280' }}>Нет сделок</div>
          <div style={{ color: '#4b5563', fontSize: '14px' }}>Создайте первую сделку</div>
        </div>
      ) : (
        deals.map(deal => (
          <div key={deal.id} style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#ffffff' }}>{deal.title}</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>#{deal.id} • {deal.category}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', padding: '2px 12px', borderRadius: '20px', border: `1px solid ${getStatusColor(deal.status)}30`, color: getStatusColor(deal.status) }}>
                    {getStatusLabel(deal.status)}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{deal.role === 'buyer' ? 'Покупатель' : 'Продавец'}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', color: '#00f3ff' }}>{deal.amount} USDT</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>{deal.opponent}</div>
              </div>
            </div>
            <button
              onClick={() => { setSelectedDeal(deal); setShowDealModal(true); }}
              style={{ width: '100%', marginTop: '12px', background: '#00f3ff20', color: '#00f3ff', border: '1px solid #00f3ff40', borderRadius: '12px', padding: '8px', fontWeight: '500', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#00f3ff30'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#00f3ff20'; }}
            >
              Управлять
            </button>
          </div>
        ))
      )}

      {/* Модалка сделки */}
      {showDealModal && selectedDeal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>{selectedDeal.title}</div>
              <button onClick={() => setShowDealModal(false)} style={{ color: '#6b7280', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Сумма: <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>{selectedDeal.amount} USDT</span></div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Оппонент: <span style={{ color: '#ffffff' }}>{selectedDeal.opponent}</span></div>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Статус: <span style={{ color: getStatusColor(selectedDeal.status) }}>{getStatusLabel(selectedDeal.status)}</span></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedDeal.status === 'created' && (
                <button onClick={() => handleDealAction(selectedDeal.id, 'deposit')} style={{ background: '#00f3ff', color: '#000000', fontWeight: 'bold', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(0, 243, 255, 0.25)', transition: 'all 0.2s' }}>
                  Внести депозит
                </button>
              )}
              {selectedDeal.status === 'deposited' && (
                <button onClick={() => handleDealAction(selectedDeal.id, 'release')} style={{ background: '#10b981', color: '#000000', fontWeight: 'bold', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)', transition: 'all 0.2s' }}>
                  Подтвердить получение
                </button>
              )}
              {(selectedDeal.status === 'accepted' || selectedDeal.status === 'deposited') && (
                <button onClick={() => handleDealAction(selectedDeal.id, 'dispute')} style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', fontWeight: 'bold', padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  Открыть спор
                </button>
              )}
              <button onClick={() => setShowDealModal(false)} style={{ background: '#ffffff10', color: '#6b7280', fontWeight: '500', padding: '12px', borderRadius: '12px', border: '1px solid #ffffff20', cursor: 'pointer', transition: 'all 0.2s' }}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCreateTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00f3ff' }}>🚀 Создать сделку</div>
      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Название товара</label>
          <input type="text" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} style={{ width: '100%', background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none', transition: 'border 0.2s' }} placeholder="Например: Аккаунт Valorant" onFocus={(e) => e.currentTarget.style.border = '1px solid #00f3ff'} onBlur={(e) => e.currentTarget.style.border = '1px solid #231c3c'} />
        </div>
        <div>
          <label style={{ color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Сумма (USDT)</label>
          <input type="number" value={createForm.amount} onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })} style={{ width: '100%', background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none', transition: 'border 0.2s' }} placeholder="100" min="1" onFocus={(e) => e.currentTarget.style.border = '1px solid #00f3ff'} onBlur={(e) => e.currentTarget.style.border = '1px solid #231c3c'} />
        </div>
        <div>
          <label style={{ color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Твоя роль</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['seller', 'buyer'].map(role => (
              <button key={role} onClick={() => setCreateForm({ ...createForm, role: role as 'buyer' | 'seller' })} style={{ flex: 1, padding: '10px', borderRadius: '12px', fontWeight: '500', border: '1px solid #231c3c', cursor: 'pointer', transition: 'all 0.2s', background: createForm.role === role ? '#00f3ff20' : '#1a142f', color: createForm.role === role ? '#00f3ff' : '#6b7280' }}>
                {role === 'seller' ? 'Я Продавец' : 'Я Покупатель'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Юзернейм оппонента</label>
          <input type="text" value={createForm.opponent} onChange={(e) => setCreateForm({ ...createForm, opponent: e.target.value })} style={{ width: '100%', background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none', transition: 'border 0.2s' }} placeholder="@username" onFocus={(e) => e.currentTarget.style.border = '1px solid #00f3ff'} onBlur={(e) => e.currentTarget.style.border = '1px solid #231c3c'} />
        </div>
        <div>
          <label style={{ color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Категория</label>
          <select value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} style={{ width: '100%', background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }}>
            <option>Игры</option>
            <option>Дизайн</option>
            <option>Кодинг</option>
            <option>Аккаунты</option>
            <option>Другое</option>
          </select>
        </div>
        <div>
          <label style={{ color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Описание (опционально)</label>
          <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} style={{ width: '100%', background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none', resize: 'vertical', minHeight: '80px' }} placeholder="Условия сделки..." />
        </div>
        <button onClick={handleCreateDeal} style={{ background: '#00f3ff', color: '#000000', fontWeight: 'bold', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 25px rgba(0, 243, 255, 0.3)', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 243, 255, 0.5)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 243, 255, 0.3)'}>
          Открыть безопасную сделку
        </button>
      </div>
    </div>
  );

  const renderWalletTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>💼 Кошелёк</div>
      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Доступно</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#00f3ff' }}>{balance.available.toFixed(2)} USDT</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>≈ {(balance.available * 92.5).toFixed(0)} RUB</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>Заморожено</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#bf77ff' }}>{balance.frozen.toFixed(2)} USDT</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>📥 Пополнить</div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          {['TRC-20', 'TON', 'СБП'].map(net => (
            <button key={net} onClick={() => setDepositNetwork(net)} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', border: '1px solid #231c3c', cursor: 'pointer', transition: 'all 0.2s', background: depositNetwork === net ? '#00f3ff20' : '#1a142f', color: depositNetwork === net ? '#00f3ff' : '#6b7280' }}>
              {net}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '8px', background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px' }}>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>Адрес для {depositNetwork}</div>
          <div style={{ color: '#00f3ff', fontSize: '14px', fontFamily: 'monospace', wordBreak: 'break-all' }}>TQY...7kLp</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} style={{ flex: 1, background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }} placeholder="Сумма" />
          <button onClick={() => { if (depositAmount) { setBalance({ ...balance, available: balance.available + parseFloat(depositAmount) }); setDepositAmount(''); } }} style={{ background: '#00f3ff', color: '#000000', fontWeight: 'bold', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(0, 243, 255, 0.25)' }}>
            Пополнить
          </button>
        </div>
      </div>

      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>📤 Вывести</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} style={{ width: '100%', background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }} placeholder="Сумма" />
          <input type="text" value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)} style={{ width: '100%', background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }} placeholder="Адрес кошелька" />
          <button onClick={() => { if (withdrawAmount && withdrawAddress) { const amount = parseFloat(withdrawAmount); if (amount <= balance.available) { setBalance({ ...balance, available: balance.available - amount }); setWithdrawAmount(''); setWithdrawAddress(''); } else { alert('Недостаточно средств'); } } }} style={{ background: '#bf77ff', color: '#000000', fontWeight: 'bold', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(191, 119, 255, 0.25)' }}>
            Вывести
          </button>
        </div>
      </div>
    </div>
  );

  const renderExchangeTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#bf77ff' }}>💱 Обмен</div>
      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Вы отдаёте</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" value={exchangeFrom.amount} onChange={(e) => { const val = e.target.value; setExchangeFrom({ ...exchangeFrom, amount: val }); if (val) { const converted = parseFloat(val) * exchangeRate; setExchangeTo({ ...exchangeTo, amount: converted.toFixed(2) }); } else { setExchangeTo({ ...exchangeTo, amount: '' }); } }} style={{ flex: 1, background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }} placeholder="0.00" />
            <select value={exchangeFrom.currency} onChange={(e) => setExchangeFrom({ ...exchangeFrom, currency: e.target.value })} style={{ background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }}>
              <option>USDT</option>
              <option>BTC</option>
              <option>TON</option>
            </select>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '24px', color: '#6b7280' }}>🔄</div>
        <div>
          <label style={{ color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Вы получаете</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" value={exchangeTo.amount} onChange={(e) => { const val = e.target.value; setExchangeTo({ ...exchangeTo, amount: val }); if (val) { const converted = parseFloat(val) / exchangeRate; setExchangeFrom({ ...exchangeFrom, amount: converted.toFixed(2) }); } else { setExchangeFrom({ ...exchangeFrom, amount: '' }); } }} style={{ flex: 1, background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }} placeholder="0.00" />
            <select value={exchangeTo.currency} onChange={(e) => setExchangeTo({ ...exchangeTo, currency: e.target.value })} style={{ background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }}>
              <option>RUB</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
        </div>
        <div style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center' }}>Курс: 1 USDT ≈ {exchangeRate} RUB</div>
        <button onClick={() => { if (exchangeFrom.amount) { alert(`Обмен ${exchangeFrom.amount} ${exchangeFrom.currency} → ${exchangeTo.amount} ${exchangeTo.currency} выполнен (демо)`); setExchangeFrom({ ...exchangeFrom, amount: '' }); setExchangeTo({ ...exchangeTo, amount: '' }); } }} style={{ background: '#bf77ff', color: '#000000', fontWeight: 'bold', padding: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 25px rgba(191, 119, 255, 0.3)' }}>
          Обменять
        </button>
      </div>
    </div>
  );

  const renderInventoryTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>🎒 Сейф / Инвентарь</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {inventoryItems.map(item => (
          <div key={item.id} style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '12px' }}>
            <div style={{ aspectRatio: '1', background: '#1a142f', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📦</div>
            <div style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '14px', marginTop: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>{item.price} USDT</div>
            <div style={{ fontSize: '12px', marginTop: '4px', padding: '2px 12px', borderRadius: '20px', display: 'inline-block', background: item.status === 'В сейфе гаранта' ? '#00f3ff20' : '#10b98120', color: item.status === 'В сейфе гаранта' ? '#00f3ff' : '#10b981' }}>
              {item.status}
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>➕ Добавить товар</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} style={{ width: '100%', background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }} placeholder="Название товара" />
          <input type="number" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} style={{ width: '100%', background: '#1a142f', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', color: '#ffffff', outline: 'none' }} placeholder="Цена в USDT" />
          <button onClick={() => { if (newItemName && newItemPrice) { setInventoryItems([...inventoryItems, { id: Date.now(), name: newItemName, status: 'В сейфе гаранта', price: parseFloat(newItemPrice) }]); setNewItemName(''); setNewItemPrice(''); } }} style={{ background: '#f59e0b', color: '#000000', fontWeight: 'bold', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)' }}>
            Загрузить в хранилище
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#bf77ff' }}>👤 Профиль</div>
      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
        <div style={{ width: '96px', height: '96px', margin: '0 auto', borderRadius: '50%', background: 'linear-gradient(135deg, #00f3ff, #bf77ff)', padding: '3px', boxShadow: '0 0 30px rgba(0, 243, 255, 0.3)' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#141023', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: '#ffffff' }}>
            {tgUser?.first_name?.[0] || tgUser?.username?.[0] || 'U'}
          </div>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginTop: '12px' }}>{tgUser?.first_name || 'Пользователь'} {tgUser?.last_name || ''}</div>
        <div style={{ color: '#6b7280' }}>@{tgUser?.username || 'нет_username'}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '8px', color: '#fbbf24' }}>
          {'★'.repeat(5)} <span style={{ color: '#6b7280', marginLeft: '8px', fontSize: '14px' }}>5.0</span>
        </div>
        <div style={{ color: '#10b981', fontSize: '14px', marginTop: '4px' }}>✓ 100% успешных сделок</div>
      </div>

      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #231c3c', paddingBottom: '8px' }}>
          <span style={{ color: '#6b7280' }}>Всего сделок</span>
          <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{deals.length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #231c3c', paddingBottom: '8px' }}>
          <span style={{ color: '#6b7280' }}>Завершено</span>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>{deals.filter(d => d.status === 'completed').length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>В спорах</span>
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{deals.filter(d => d.status === 'disputed').length}</span>
        </div>
      </div>

      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>🔒 Безопасность</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #231c3c', padding: '8px 0' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>2FA</span>
          <span style={{ color: '#10b981', fontSize: '14px' }}>Включена</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>Сессии</span>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>1 активная</span>
        </div>
      </div>

      <button onClick={() => window.open('https://t.me/SafeHold_Support', '_blank')} style={{ background: '#00f3ff20', color: '#00f3ff', border: '1px solid #00f3ff40', fontWeight: 'bold', padding: '14px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#00f3ff30'} onMouseLeave={(e) => e.currentTarget.style.background = '#00f3ff20'}>
        📞 Вызвать арбитраж (@SafeHold_Support)
      </button>
    </div>
  );

  // ------------------------------------------------------------
  // ОСНОВНАЯ ОТРИСОВКА
  // ------------------------------------------------------------
  return (
    <div style={{ minHeight: '100vh', background: '#0b0813', color: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00f3ff', letterSpacing: '-0.5px' }}>🔐 SafeHold</div>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>v2.0</div>
        </div>

        {currentTab === 'deals' && renderDealsTab()}
        {currentTab === 'create' && renderCreateTab()}
        {currentTab === 'wallet' && renderWalletTab()}
        {currentTab === 'exchange' && renderExchangeTab()}
        {currentTab === 'inventory' && renderInventoryTab()}
        {currentTab === 'profile' && renderProfileTab()}
      </div>

      {/* Нижний таб-бар */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: '420px', margin: '0 auto', background: '#141023', borderTop: '1px solid #231c3c', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 4px', zIndex: 50, backdropFilter: 'blur(12px)' }}>
        {[
          { id: 'deals', icon: '🤝', label: 'Сделки' },
          { id: 'create', icon: '➕', label: 'Создать' },
          { id: 'wallet', icon: '💼', label: 'Кошелёк' },
          { id: 'exchange', icon: '💱', label: 'Обмен' },
          { id: 'inventory', icon: '🎒', label: 'Сейф' },
          { id: 'profile', icon: '👤', label: 'Профиль' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: '12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: currentTab === tab.id ? '#00f3ff' : '#6b7280'
            }}
          >
            <span style={{ fontSize: '24px' }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: '500', marginTop: '2px' }}>{tab.label}</span>
            {currentTab === tab.id && (
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#00f3ff', marginTop: '4px', animation: 'pulse 1.5s infinite' }} />
            )}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default App;
