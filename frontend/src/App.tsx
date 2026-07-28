import React, { useState, useEffect } from 'react';

// ============================================================
// ГЛОБАЛЬНЫЙ ТИП ДЛЯ СДЕЛОК
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

// ============================================================
// ГЛАВНЫЙ КОМПОНЕНТ APP
// ============================================================
const App: React.FC = () => {
  // ------------------------------------------------------------
  // СОСТОЯНИЯ (ВСЕ ВКЛАДКИ)
  // ------------------------------------------------------------
  const [currentTab, setCurrentTab] = useState<'deals' | 'create' | 'wallet' | 'exchange' | 'inventory' | 'profile'>('deals');

  // --- Данные пользователя из Telegram ---
  const [tgUser, setTgUser] = useState<any>(null);
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.ready();
      setTgUser(tg.initDataUnsafe?.user || null);
    }
  }, []);

  // --- Сделки ---
  const [deals, setDeals] = useState<Deal[]>([
    {
      id: 1,
      title: 'Аккаунт Fortnite',
      amount: 85,
      role: 'seller',
      opponent: '@john_doe',
      category: 'Аккаунты',
      status: 'created'
    },
    {
      id: 2,
      title: 'Логотип для бренда',
      amount: 120,
      role: 'buyer',
      opponent: '@design_pro',
      category: 'Дизайн',
      status: 'deposited'
    },
    {
      id: 3,
      title: 'Бот для Telegram',
      amount: 250,
      role: 'seller',
      opponent: '@coder_dev',
      category: 'Кодинг',
      status: 'completed'
    }
  ]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDealModal, setShowDealModal] = useState(false);

  // --- Создание сделки ---
  const [createForm, setCreateForm] = useState({
    title: '',
    amount: '',
    role: 'seller' as 'buyer' | 'seller',
    opponent: '',
    category: 'Аккаунты',
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
  const exchangeRate = 92.5; // 1 USDT = 92.5 RUB

  // --- Инвентарь ---
  const [inventoryItems, setInventoryItems] = useState([
    { id: 1, name: 'Аккаунт Steam', status: 'В сейфе гаранта', price: 60 },
    { id: 2, name: 'Дизайн-пак', status: 'Готов к выдаче', price: 45 },
    { id: 3, name: 'Скрипт парсинга', status: 'В сейфе гаранта', price: 120 }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  // ------------------------------------------------------------
  // ЛОГИКА РАБОТЫ СО СДЕЛКАМИ
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
    setCreateForm({ title: '', amount: '', role: 'seller', opponent: '', category: 'Аккаунты', description: '' });
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

  // ------------------------------------------------------------
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ------------------------------------------------------------
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'text-yellow-400 border-yellow-400/30';
      case 'accepted': return 'text-blue-400 border-blue-400/30';
      case 'deposited': return 'text-cyan-400 border-cyan-400/30';
      case 'completed': return 'text-emerald-400 border-emerald-400/30';
      case 'disputed': return 'text-red-400 border-red-400/30';
      default: return 'text-white/40 border-white/10';
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
  // ОТРИСОВКА ТАБОВ
  // ------------------------------------------------------------
  const renderDealsTab = () => (
    <div className="space-y-4">
      {/* Статистика */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3 text-center">
          <p className="text-white/40 text-xs">Активных</p>
          <p className="text-cyan-400 font-bold text-xl">{deals.filter(d => d.status !== 'completed' && d.status !== 'disputed').length}</p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3 text-center">
          <p className="text-white/40 text-xs">Завершено</p>
          <p className="text-emerald-400 font-bold text-xl">{deals.filter(d => d.status === 'completed').length}</p>
        </div>
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3 text-center">
          <p className="text-white/40 text-xs">В спорах</p>
          <p className="text-red-400 font-bold text-xl">{deals.filter(d => d.status === 'disputed').length}</p>
        </div>
      </div>

      {/* Список сделок */}
      {deals.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 text-center">
          <p className="text-white/40">Нет сделок</p>
          <p className="text-white/20 text-sm">Создайте первую сделку</p>
        </div>
      ) : (
        deals.map(deal => (
          <div key={deal.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-white">{deal.title}</h3>
                <p className="text-white/40 text-xs">#{deal.id} • {deal.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(deal.status)}`}>
                    {getStatusLabel(deal.status)}
                  </span>
                  <span className="text-xs text-white/30">{deal.role === 'buyer' ? 'Покупатель' : 'Продавец'}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-cyan-400">{deal.amount} USDT</p>
                <p className="text-white/30 text-xs">@{deal.opponent.replace('@', '')}</p>
              </div>
            </div>
            <button
              onClick={() => { setSelectedDeal(deal); setShowDealModal(true); }}
              className="w-full mt-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl py-2 text-sm font-medium hover:bg-cyan-500/30 active:scale-[0.98] transition-all"
            >
              Управлять
            </button>
          </div>
        ))
      )}

      {/* Модалка управления сделкой */}
      {showDealModal && selectedDeal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-3xl w-full max-w-md p-6 space-y-4 animate-slide-up">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{selectedDeal.title}</h3>
              <button onClick={() => setShowDealModal(false)} className="text-white/40 text-2xl">✕</button>
            </div>
            <div className="space-y-2">
              <p className="text-white/40 text-sm">Сумма: <span className="text-cyan-400 font-bold">{selectedDeal.amount} USDT</span></p>
              <p className="text-white/40 text-sm">Оппонент: <span className="text-white">{selectedDeal.opponent}</span></p>
              <p className="text-white/40 text-sm">Статус: <span className={`${getStatusColor(selectedDeal.status)}`}>{getStatusLabel(selectedDeal.status)}</span></p>
            </div>
            <div className="flex flex-col gap-2">
              {selectedDeal.status === 'created' && (
                <button
                  onClick={() => handleDealAction(selectedDeal.id, 'deposit')}
                  className="bg-cyan-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all"
                >
                  Внести депозит
                </button>
              )}
              {selectedDeal.status === 'deposited' && (
                <button
                  onClick={() => handleDealAction(selectedDeal.id, 'release')}
                  className="bg-emerald-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
                >
                  Подтвердить получение
                </button>
              )}
              {(selectedDeal.status === 'accepted' || selectedDeal.status === 'deposited') && (
                <button
                  onClick={() => handleDealAction(selectedDeal.id, 'dispute')}
                  className="bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-3 rounded-xl active:scale-[0.98] transition-all"
                >
                  Открыть спор
                </button>
              )}
              <button
                onClick={() => setShowDealModal(false)}
                className="bg-white/5 text-white/60 font-medium py-3 rounded-xl border border-white/10 active:scale-[0.98] transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCreateTab = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-cyan-400">🚀 Создать сделку</h2>
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 space-y-4">
        <div>
          <label className="text-white/50 text-sm block mb-1">Название товара</label>
          <input
            type="text"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
            placeholder="Например: Аккаунт Valorant"
          />
        </div>
        <div>
          <label className="text-white/50 text-sm block mb-1">Сумма (USDT)</label>
          <input
            type="number"
            value={createForm.amount}
            onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
            placeholder="100"
            min="1"
          />
        </div>
        <div>
          <label className="text-white/50 text-sm block mb-1">Твоя роль</label>
          <div className="flex gap-2">
            {['seller', 'buyer'].map(role => (
              <button
                key={role}
                onClick={() => setCreateForm({ ...createForm, role: role as 'buyer' | 'seller' })}
                className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                  createForm.role === role
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400'
                    : 'bg-slate-800/50 border border-slate-700/50 text-white/40'
                }`}
              >
                {role === 'seller' ? 'Продавец' : 'Покупатель'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-white/50 text-sm block mb-1">Юзернейм оппонента</label>
          <input
            type="text"
            value={createForm.opponent}
            onChange={(e) => setCreateForm({ ...createForm, opponent: e.target.value })}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
            placeholder="@username"
          />
        </div>
        <div>
          <label className="text-white/50 text-sm block mb-1">Категория</label>
          <select
            value={createForm.category}
            onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
          >
            <option>Аккаунты</option>
            <option>Дизайн</option>
            <option>Кодинг</option>
            <option>Игровые услуги</option>
            <option>Другое</option>
          </select>
        </div>
        <div>
          <label className="text-white/50 text-sm block mb-1">Описание (опционально)</label>
          <textarea
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all resize-none h-20"
            placeholder="Условия сделки..."
          />
        </div>
        <button
          onClick={handleCreateDeal}
          className="w-full bg-cyan-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all"
        >
          Создать сделку
        </button>
      </div>
    </div>
  );

  const renderWalletTab = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-400">💼 Кошелёк</h2>
      {/* Баланс */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white/40 text-sm">Доступно</p>
            <p className="text-3xl font-bold text-cyan-400">{balance.available.toFixed(2)} USDT</p>
            <p className="text-white/20 text-sm">≈ {(balance.available * 92.5).toFixed(0)} RUB</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-sm">Заморожено</p>
            <p className="text-xl font-bold text-white/60">{balance.frozen.toFixed(2)} USDT</p>
          </div>
        </div>
      </div>

      {/* Пополнить */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4">
        <h3 className="text-white font-bold text-lg">📥 Пополнить</h3>
        <div className="flex gap-2 mt-2">
          {['TRC-20', 'TON', 'СБП'].map(net => (
            <button
              key={net}
              onClick={() => setDepositNetwork(net)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                depositNetwork === net
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-400'
                  : 'bg-slate-800/50 border border-slate-700/50 text-white/40'
              }`}
            >
              {net}
            </button>
          ))}
        </div>
        <div className="mt-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
          <p className="text-white/40 text-xs">Адрес для {depositNetwork}</p>
          <p className="text-cyan-400 text-sm font-mono break-all">TQY...7kLp</p>
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
            placeholder="Сумма"
          />
          <button
            onClick={() => {
              if (depositAmount) {
                setBalance({ ...balance, available: balance.available + parseFloat(depositAmount) });
                setDepositAmount('');
              }
            }}
            className="bg-cyan-500 text-black font-bold px-6 rounded-xl shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all"
          >
            Пополнить
          </button>
        </div>
      </div>

      {/* Вывести */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4">
        <h3 className="text-white font-bold text-lg">📤 Вывести</h3>
        <div className="space-y-2 mt-2">
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
            placeholder="Сумма"
          />
          <input
            type="text"
            value={withdrawAddress}
            onChange={(e) => setWithdrawAddress(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
            placeholder="Адрес кошелька"
          />
          <button
            onClick={() => {
              if (withdrawAmount && withdrawAddress) {
                const amount = parseFloat(withdrawAmount);
                if (amount <= balance.available) {
                  setBalance({ ...balance, available: balance.available - amount });
                  setWithdrawAmount('');
                  setWithdrawAddress('');
                } else {
                  alert('Недостаточно средств');
                }
              }
            }}
            className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
          >
            Вывести
          </button>
        </div>
      </div>
    </div>
  );

  const renderExchangeTab = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-purple-400">💱 Обмен</h2>
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 space-y-4">
        <div>
          <label className="text-white/40 text-sm block mb-1">Вы отдаёте</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={exchangeFrom.amount}
              onChange={(e) => {
                const val = e.target.value;
                setExchangeFrom({ ...exchangeFrom, amount: val });
                if (val) {
                  const converted = parseFloat(val) * exchangeRate;
                  setExchangeTo({ ...exchangeTo, amount: converted.toFixed(2) });
                } else {
                  setExchangeTo({ ...exchangeTo, amount: '' });
                }
              }}
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
              placeholder="0.00"
            />
            <select
              value={exchangeFrom.currency}
              onChange={(e) => setExchangeFrom({ ...exchangeFrom, currency: e.target.value })}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
            >
              <option>USDT</option>
              <option>BTC</option>
              <option>TON</option>
            </select>
          </div>
        </div>
        <div className="text-center text-2xl text-white/20">🔄</div>
        <div>
          <label className="text-white/40 text-sm block mb-1">Вы получаете</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={exchangeTo.amount}
              onChange={(e) => {
                const val = e.target.value;
                setExchangeTo({ ...exchangeTo, amount: val });
                if (val) {
                  const converted = parseFloat(val) / exchangeRate;
                  setExchangeFrom({ ...exchangeFrom, amount: converted.toFixed(2) });
                } else {
                  setExchangeFrom({ ...exchangeFrom, amount: '' });
                }
              }}
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
              placeholder="0.00"
            />
            <select
              value={exchangeTo.currency}
              onChange={(e) => setExchangeTo({ ...exchangeTo, currency: e.target.value })}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
            >
              <option>RUB</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
        </div>
        <div className="text-white/30 text-xs text-center">Курс: 1 USDT ≈ {exchangeRate} RUB</div>
        <button
          onClick={() => {
            if (exchangeFrom.amount) {
              alert(`Обмен ${exchangeFrom.amount} ${exchangeFrom.currency} → ${exchangeTo.amount} ${exchangeTo.currency} выполнен (демо)`);
              setExchangeFrom({ ...exchangeFrom, amount: '' });
              setExchangeTo({ ...exchangeTo, amount: '' });
            }
          }}
          className="w-full bg-purple-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all"
        >
          Обменять
        </button>
      </div>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-orange-400">🎒 Инвентарь</h2>
      {/* Сетка товаров */}
      <div className="grid grid-cols-2 gap-3">
        {inventoryItems.map(item => (
          <div key={item.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3">
            <div className="aspect-square bg-slate-800/50 rounded-xl flex items-center justify-center text-4xl">📦</div>
            <p className="font-bold text-white text-sm mt-2 truncate">{item.name}</p>
            <p className="text-xs text-white/30">{item.price} USDT</p>
            <p className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${
              item.status === 'В сейфе гаранта' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {item.status}
            </p>
          </div>
        ))}
      </div>

      {/* Форма добавления товара */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4">
        <h3 className="text-white font-bold text-lg">➕ Добавить товар</h3>
        <div className="space-y-2 mt-2">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
            placeholder="Название товара"
          />
          <input
            type="number"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-all"
            placeholder="Цена в USDT"
          />
          <button
            onClick={() => {
              if (newItemName && newItemPrice) {
                setInventoryItems([...inventoryItems, {
                  id: Date.now(),
                  name: newItemName,
                  status: 'В сейфе гаранта',
                  price: parseFloat(newItemPrice)
                }]);
                setNewItemName('');
                setNewItemPrice('');
              }
            }}
            className="w-full bg-orange-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all"
          >
            Загрузить в хранилище
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-pink-400">👤 Профиль</h2>
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 p-1 shadow-lg shadow-cyan-500/25">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold text-white">
            {tgUser?.first_name?.[0] || tgUser?.username?.[0] || 'U'}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mt-3">{tgUser?.first_name || 'Пользователь'} {tgUser?.last_name || ''}</h3>
        <p className="text-white/40">@{tgUser?.username || 'нет_username'}</p>
        <div className="flex justify-center items-center gap-1 mt-1 text-yellow-400">
          {'★'.repeat(5)} <span className="text-white/40 text-sm ml-1">5.0</span>
        </div>
        <p className="text-emerald-400 text-sm mt-1">✓ 100% успешных сделок</p>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
          <span className="text-white/50">Всего сделок</span>
          <span className="text-white font-bold">{deals.length}</span>
        </div>
        <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
          <span className="text-white/50">Завершено</span>
          <span className="text-emerald-400 font-bold">{deals.filter(d => d.status === 'completed').length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/50">В спорах</span>
          <span className="text-red-400 font-bold">{deals.filter(d => d.status === 'disputed').length}</span>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4">
        <h4 className="text-white font-bold text-sm mb-2">🔒 Безопасность</h4>
        <div className="flex justify-between items-center border-b border-slate-800/60 py-2">
          <span className="text-white/40 text-sm">2FA</span>
          <span className="text-emerald-400 text-sm">Включена</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-white/40 text-sm">Сессии</span>
          <span className="text-white/60 text-sm">1 активная</span>
        </div>
      </div>

      <button
        onClick={() => window.open('https://t.me/SafeHold_Support', '_blank')}
        className="w-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold py-3 rounded-xl active:scale-[0.98] transition-all"
      >
        📞 Вызвать арбитраж (@SafeHold_Support)
      </button>
    </div>
  );

  // ------------------------------------------------------------
  // ОСНОВНАЯ ОТРИСОВКА
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans antialiased">
      {/* Основной контейнер */}
      <div className="max-w-md mx-auto px-4 pt-6 pb-24">
        {/* Шапка */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-cyan-400 tracking-tight">🔐 SafeHold</h1>
          <span className="text-white/20 text-xs">v2.0</span>
        </div>

        {/* Рендер активной вкладки */}
        {currentTab === 'deals' && renderDealsTab()}
        {currentTab === 'create' && renderCreateTab()}
        {currentTab === 'wallet' && renderWalletTab()}
        {currentTab === 'exchange' && renderExchangeTab()}
        {currentTab === 'inventory' && renderInventoryTab()}
        {currentTab === 'profile' && renderProfileTab()}
      </div>

      {/* Нижний таб-бар */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 flex justify-around items-center py-2 px-1 z-50">
        {[
          { id: 'deals', icon: '🤝', label: 'Сделки' },
          { id: 'create', icon: '➕', label: 'Создать' },
          { id: 'wallet', icon: '💼', label: 'Кошелёк' },
          { id: 'exchange', icon: '💱', label: 'Обмен' },
          { id: 'inventory', icon: '🎒', label: 'Инвентарь' },
          { id: 'profile', icon: '👤', label: 'Профиль' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              currentTab === tab.id
                ? 'text-cyan-400 scale-105'
                : 'text-white/30 hover:text
