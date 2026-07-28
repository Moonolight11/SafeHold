import React, { useState, useEffect } from 'react';

// ============================================================
// 1. ГЛОБАЛЬНЫЕ ТИПЫ
// ============================================================
interface Match {
  id: string;
  category: 'dota2' | 'cs2' | 'tanks' | 'football' | 'hockey';
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: 'live' | 'upcoming' | 'finished';
  oddsA: number;
  oddsB: number;
  oddsDraw?: number;
  time: string;
}

interface Bet {
  id: string;
  matchId: string;
  matchName: string;
  prediction: string;
  odds: number;
  amount: number;
  potentialWin: number;
  status: 'active' | 'won' | 'lost';
  date: string;
}

interface Referral {
  id: number;
  username: string;
  date: string;
}

// ============================================================
// 2. ОСНОВНОЙ КОМПОНЕНТ APP
// ============================================================
export default function App() {
  // ------------------------------------------------------------
  // 3. СОСТОЯНИЯ (useState)
  // ------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'line' | 'mybets' | 'profile' | 'rules'>('line');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tgUser, setTgUser] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [myBets, setMyBets] = useState<Bet[]>([]);
  const [betFilter, setBetFilter] = useState<'active' | 'history'>('active');
  const [referrals, setReferrals] = useState<Referral[]>([
    { id: 1, username: '@john_doe', date: '10.07.2026' },
    { id: 2, username: '@jane_smith', date: '12.07.2026' },
  ]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [starsAmountInput, setStarsAmountInput] = useState<string>('50');
  const [walletModalAction, setWalletModalAction] = useState<'deposit' | 'withdraw'>('deposit');

  // ------------------------------------------------------------
  // 4. ЭФФЕКТЫ (useEffect)
  // ------------------------------------------------------------
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#0b0813');
      setTgUser(tg.initDataUnsafe?.user || null);
    }
  }, []);

  // Генерация реферальной ссылки
  const getReferralLink = () => {
    const userId = tgUser?.id || 'unknown';
    return `t.me/safehold_garant_bot?start=ref_${userId}`;
  };

  // ------------------------------------------------------------
  // 5. ХЭНДЛЕРЫ (Handlers)
  // ------------------------------------------------------------
  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyReferralLink = () => {
    triggerHaptic();
    const link = getReferralLink();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        showToast('Ссылка успешно скопирована в буфер обмена! 🚀', 'success');
      }).catch(() => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Ссылка успешно скопирована в буфер обмена! 🚀', 'success');
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Ссылка успешно скопирована в буфер обмена! 🚀', 'success');
    }
  };

  const handleWalletAction = () => {
    triggerHaptic();
    const amount = parseInt(starsAmountInput);
    if (isNaN(amount) || amount <= 0) {
      showToast('Введите корректную сумму', 'error');
      return;
    }
    if (walletModalAction === 'deposit') {
      setUserBalance(prev => prev + amount);
      showToast(`Начислено ★ ${amount}`, 'success');
    } else {
      if (amount > userBalance) {
        showToast('Недостаточно звезд для вывода', 'error');
        return;
      }
      setUserBalance(prev => prev - amount);
      showToast(`Заявка на вывод ★ ${amount} отправлена!`, 'success');
    }
    setShowWalletModal(false);
  };

  // ------------------------------------------------------------
  // 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ------------------------------------------------------------
  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      dota2: 'Dota 2',
      cs2: 'CS 2',
      tanks: 'Танки',
      football: 'Футбол',
      hockey: 'Хоккей',
    };
    return map[category] || category;
  };

  const getCategoryEmoji = (category: string) => {
    const map: Record<string, string> = {
      dota2: '🎮',
      cs2: '🔫',
      tanks: '🚜',
      football: '⚽',
      hockey: '🏒',
    };
    return map[category] || '🎯';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00f3ff';
      case 'won': return '#10b981';
      case 'lost': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'won': return '✅ Выиграна';
      case 'lost': return '❌ Проиграна';
      default: return status;
    }
  };

  const categories = [
    { id: 'all', label: 'Все', emoji: '🌐' },
    { id: 'dota2', label: 'Dota 2', emoji: '🎮' },
    { id: 'cs2', label: 'CS 2', emoji: '🔫' },
    { id: 'tanks', label: 'Танки', emoji: '🚜' },
    { id: 'football', label: 'Футбол', emoji: '⚽' },
    { id: 'hockey', label: 'Хоккей', emoji: '🏒' },
  ];

  const filteredMatches = selectedCategory === 'all'
    ? liveMatches
    : liveMatches.filter(m => m.category === selectedCategory);

  const activeBets = myBets.filter(b => b.status === 'active');
  const historyBets = myBets.filter(b => b.status !== 'active');

  // ------------------------------------------------------------
  // 7. РЕНДЕР ВКЛАДОК
  // ------------------------------------------------------------
  const renderLineTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Категории */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', flexWrap: 'nowrap' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { triggerHaptic(); setSelectedCategory(cat.id); }}
            style={{
              flexShrink: 0,
              padding: '10px 18px',
              borderRadius: '20px',
              border: selectedCategory === cat.id ? '1px solid #00f3ff' : '1px solid #231c3c',
              background: selectedCategory === cat.id ? '#00f3ff20' : '#141023',
              color: selectedCategory === cat.id ? '#00f3ff' : '#6b7280',
              fontWeight: selectedCategory === cat.id ? 'bold' : 'normal',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Список матчей или пустая заглушка */}
      {filteredMatches.length === 0 ? (
        <div
          style={{
            background: '#141023',
            border: '1px solid #231c3c',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '48px' }}>📡</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00f3ff', letterSpacing: '0.5px' }}>
            Поиск активных трансляций...
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', maxWidth: '320px' }}>
            В данный момент нет доступных матчей для ставок в реальном времени.
            Пожалуйста, ожидайте начала официальных событий по Dota 2, CS 2 и спорту.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMatches.map(match => (
            <div
              key={match.id}
              style={{
                background: '#141023',
                border: '1px solid #231c3c',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{getCategoryEmoji(match.category)}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{getCategoryLabel(match.category)}</span>
                  {match.status === 'live' && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#10b981',
                        animation: 'pulseGlow 1s infinite'
                      }}
                    />
                  )}
                </div>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{match.time}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '16px' }}>{match.teamA}</div>
                <div style={{ fontWeight: 'bold', color: '#00f3ff', fontSize: '20px' }}>{match.scoreA} : {match.scoreB}</div>
                <div style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '16px' }}>{match.teamB}</div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    flex: 1,
                    background: '#bf77ff20',
                    border: '1px solid #bf77ff40',
                    borderRadius: '12px',
                    padding: '12px',
                    color: '#bf77ff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  П1 КФ {match.oddsA.toFixed(2)}
                </button>
                {match.oddsDraw && (
                  <button
                    style={{
                      flex: 1,
                      background: '#f59e0b20',
                      border: '1px solid #f59e0b40',
                      borderRadius: '12px',
                      padding: '12px',
                      color: '#f59e0b',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    X КФ {match.oddsDraw.toFixed(2)}
                  </button>
                )}
                <button
                  style={{
                    flex: 1,
                    background: '#bf77ff20',
                    border: '1px solid #bf77ff40',
                    borderRadius: '12px',
                    padding: '12px',
                    color: '#bf77ff',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                >
                  П2 КФ {match.oddsB.toFixed(2)}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMyBetsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => { triggerHaptic(); setBetFilter('active'); }}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: betFilter === 'active' ? '1px solid #00f3ff' : '1px solid #231c3c',
            background: betFilter === 'active' ? '#00f3ff20' : '#141023',
            color: betFilter === 'active' ? '#00f3ff' : '#6b7280',
            fontWeight: betFilter === 'active' ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Активные ⏳ ({activeBets.length})
        </button>
        <button
          onClick={() => { triggerHaptic(); setBetFilter('history'); }}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: betFilter === 'history' ? '1px solid #00f3ff' : '1px solid #231c3c',
            background: betFilter === 'history' ? '#00f3ff20' : '#141023',
            color: betFilter === 'history' ? '#00f3ff' : '#6b7280',
            fontWeight: betFilter === 'history' ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Рассчитанные ✅ ({historyBets.length})
        </button>
      </div>

      {myBets.length === 0 ? (
        <div
          style={{
            background: '#141023',
            border: '1px solid #231c3c',
            borderRadius: '16px',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ fontSize: '48px' }}>🎟️</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#bf77ff' }}>
            Вы еще не сделали ни одной ставки
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', maxWidth: '320px' }}>
            Перейдите во вкладку Линия, чтобы заключить первое пари на Telegram Stars!
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(betFilter === 'active' ? activeBets : historyBets).map(bet => (
            <div
              key={bet.id}
              style={{
                background: '#141023',
                border: `1px solid ${getStatusColor(bet.status)}40`,
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '15px' }}>{bet.matchName}</div>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 12px',
                    borderRadius: '20px',
                    border: `1px solid ${getStatusColor(bet.status)}30`,
                    color: getStatusColor(bet.status)
                  }}
                >
                  {getStatusLabel(bet.status)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6b7280' }}>
                <span>Прогноз: <span style={{ color: '#ffffff' }}>{bet.prediction}</span></span>
                <span>КФ: <span style={{ color: '#00f3ff' }}>{bet.odds.toFixed(2)}</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingTop: '4px', borderTop: '1px solid #231c3c' }}>
                <span style={{ color: '#6b7280' }}>Ставка: <span style={{ color: '#eab308', fontWeight: 'bold' }}>★ {bet.amount}</span></span>
                <span style={{ color: '#6b7280' }}>Потенциал: <span style={{ color: '#10b981', fontWeight: 'bold' }}>★ {bet.potentialWin.toFixed(0)}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Карточка игрока */}
      <div
        style={{
          background: '#141023',
          border: '1px solid #231c3c',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, #00f3ff20, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00f3ff, #bf77ff)',
            padding: '3px',
            boxShadow: '0 0 30px rgba(0, 243, 255, 0.3)',
            animation: 'pulseGlow 2s infinite'
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#141023',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#ffffff'
            }}
          >
            {tgUser?.first_name?.[0] || tgUser?.username?.[0] || 'U'}
          </div>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginTop: '12px' }}>
          {tgUser?.first_name || 'Пользователь'} {tgUser?.last_name || ''}
        </div>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>@{tgUser?.username || 'нет_username'}</div>
        <div
          style={{
            display: 'inline-block',
            marginTop: '6px',
            background: '#bf77ff20',
            color: '#bf77ff',
            border: '1px solid #bf77ff40',
            padding: '2px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          ⭐ VIP Клиент
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          <div>
            <div style={{ color: '#fbbf24', fontSize: '18px' }}>⭐ 5.0</div>
            <div style={{ color: '#6b7280', fontSize: '11px' }}>Рейтинг</div>
          </div>
          <div>
            <div style={{ color: '#10b981', fontSize: '18px' }}>{myBets.filter(b => b.status === 'won').length}</div>
            <div style={{ color: '#6b7280', fontSize: '11px' }}>Побед</div>
          </div>
          <div>
            <div style={{ color: '#00f3ff', fontSize: '18px' }}>{myBets.length}</div>
            <div style={{ color: '#6b7280', fontSize: '11px' }}>Всего ставок</div>
          </div>
        </div>
      </div>

      {/* Баланс */}
      <div
        style={{
          background: '#141023',
          border: '1px solid #231c3c',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}
      >
        <div style={{ color: '#6b7280', fontSize: '14px' }}>Ваш баланс</div>
        <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '36px', marginTop: '4px' }}>
          ⭐ {userBalance} Stars
        </div>
        <button
          onClick={() => {
            triggerHaptic();
            setWalletModalAction('deposit');
            setShowWalletModal(true);
          }}
          style={{
            marginTop: '12px',
            width: '100%',
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            color: '#000000',
            fontWeight: 'bold',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.2s',
            fontSize: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 50px rgba(245, 158, 11, 0.5)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 30px rgba(245, 158, 11, 0.3)'}
        >
          💰 Пополнить баланс через Telegram Stars
        </button>
      </div>

      {/* Реферальная система */}
      <div
        style={{
          background: '#141023',
          border: '1px solid #231c3c',
          borderRadius: '16px',
          padding: '16px'
        }}
      >
        <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
          🔗 Пригласи друга и получай 10% от его побед
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={getReferralLink()}
            readOnly
            style={{
              flex: 1,
              background: '#1a142f',
              border: '1px solid #231c3c',
              borderRadius: '12px',
              padding: '10px 12px',
              color: '#6b7280',
              fontSize: '12px',
              outline: 'none',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          />
          <button
            onClick={handleCopyReferralLink}
            style={{
              background: '#00f3ff20',
              color: '#00f3ff',
              border: '1px solid #00f3ff40',
              borderRadius: '12px',
              padding: '10px 16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#00f3ff30'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#00f3ff20'}
          >
            🔗 Копировать
          </button>
        </div>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginTop: '8px' }}>
          Ваши рефералы:
        </div>
        {referrals.length === 0 ? (
          <div style={{ color: '#6b7280', fontSize: '13px', padding: '8px 0' }}>
            Пока нет приглашённых друзей
          </div>
        ) : (
          referrals.map(ref => (
            <div
              key={ref.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid #231c3c',
                padding: '6px 0',
                fontSize: '14px'
              }}
            >
              <span style={{ color: '#ffffff' }}>{ref.username}</span>
              <span style={{ color: '#6b7280', fontSize: '12px' }}>{ref.date}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderRulesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          background: '#141023',
          border: '1px solid #231c3c',
          borderRadius: '16px',
          padding: '20px'
        }}
      >
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginBottom: '16px' }}>
          ℹ️ Правила и регламент
        </div>
        <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '8px' }}>
            <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>1.</span> Все ставки принимаются исключительно в Звёздах Telegram (⭐️ Stars).
          </p>
          <p style={{ marginBottom: '8px' }}>
            <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>2.</span> Коэффициенты формируются автоматически на основе вероятности исхода.
          </p>
          <p style={{ marginBottom: '8px' }}>
            <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>3.</span> Ставка считается выигрышной, если выбранная команда побеждает по итогу матча.
          </p>
          <p style={{ marginBottom: '8px' }}>
            <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>4.</span> При ничьей в спортивных матчах ставки возвращаются с коэффициентом 1.00.
          </p>
          <p style={{ marginBottom: '8px' }}>
            <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>5.</span> Расчёт происходит автоматически после завершения матча.
          </p>
          <p>
            <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>6.</span> В спорных ситуациях решение принимает арбитр.
          </p>
        </div>
      </div>

      <button
        onClick={() => window.open('https://t.me/SafeHold_Bet_Support', '_blank')}
        style={{
          width: '100%',
          background: '#bf77ff20',
          color: '#bf77ff',
          border: '1px solid #bf77ff40',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: '16px',
          boxShadow: '0 0 20px rgba(191, 119, 255, 0.2)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#bf77ff30';
          e.currentTarget.style.boxShadow = '0 0 40px rgba(191, 119, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#bf77ff20';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(191, 119, 255, 0.2)';
        }}
      >
        📞 Связаться с поддержкой @SafeHold_Bet_Support
      </button>
    </div>
  );

  // ------------------------------------------------------------
  // 8. ОСНОВНАЯ ОТРИСОВКА
  // ------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100vh',
        maxHeight: '100vh',
        background: '#0b0813',
        color: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflowX: 'hidden',
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch',
        width: '100%',
        paddingBottom: '100px',
        position: 'relative'
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          margin: '0 auto',
          padding: '16px 16px 20px'
        }}
      >
        {/* Шапка */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#00f3ff',
              letterSpacing: '-0.5px'
            }}
          >
            ⚡ SafeHold Bet
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ color: '#eab308', fontSize: '14px' }}>⭐ {userBalance}</span>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>v1.0</span>
          </div>
        </div>

        {/* Рендер активной вкладки */}
        {activeTab === 'line' && renderLineTab()}
        {activeTab === 'mybets' && renderMyBetsTab()}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'rules' && renderRulesTab()}
      </div>

      {/* ------------------------------------------------------------
          9. ТОСТ-УВЕДОМЛЕНИЕ
          ------------------------------------------------------------ */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '16px',
            right: '16px',
            zIndex: 9999,
            padding: '14px 20px',
            borderRadius: '16px',
            border: toast.type === 'success' ? '1px solid #10b98140' : '1px solid #ef444440',
            background: toast.type === 'success' ? '#10b98120' : '#ef444420',
            backdropFilter: 'blur(12px)',
            boxShadow: toast.type === 'success' ? '0 0 30px rgba(16, 185, 129, 0.2)' : '0 0 30px rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: toast.type === 'success' ? '#10b981' : '#ef4444',
            fontWeight: 'bold',
            fontSize: '14px',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ------------------------------------------------------------
          10. МОДАЛКА КОШЕЛЬКА
          ------------------------------------------------------------ */}
      {showWalletModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#141023',
              border: '1px solid #231c3c',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '380px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <h4
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#ffffff'
              }}
            >
              {walletModalAction === 'deposit' ? 'Пополнить баланс' : 'Вывести звезды'}
            </h4>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              {walletModalAction === 'deposit'
                ? 'Укажите количество Звёзд для пополнения баланса.'
                : 'Укажите сумму для вывода. Средства перейдут на ваш Telegram-баланс.'}
            </p>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#eab308'
                }}
              >
                ⭐
              </span>
              <input
                type="number"
                value={starsAmountInput}
                onChange={(e) => setStarsAmountInput(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1a142f',
                  border: '1px solid #231c3c',
                  borderRadius: '12px',
                  padding: '14px 14px 14px 48px',
                  color: '#ffffff',
                  fontSize: '16px',
                  outline: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
                placeholder="Введите сумму"
                onFocus={(e) => e.currentTarget.style.border = '1px solid #00f3ff'}
                onBlur={(e) => e.currentTarget.style.border = '1px solid #231c3c'}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { triggerHaptic(); setShowWalletModal(false); }}
                style={{
                  flex: 1,
                  background: '#1a142f',
                  border: '1px solid #231c3c',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#6b7280',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleWalletAction}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                  color: '#000000',
                  fontWeight: 'bold',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------
          11. НИЖНЕЕ МЕНЮ (fixed)
          ------------------------------------------------------------ */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: '420px',
          margin: '0 auto',
          background: '#141023',
          borderTop: '1px solid #231c3c',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '8px 4px',
          zIndex: 9999,
          backdropFilter: 'blur(12px)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.5)'
        }}
      >
        {[
          { id: 'line', icon: '🔥', label: 'Линия' },
          { id: 'mybets', icon: '🎟️', label: 'Мои ставки' },
          { id: 'profile', icon: '👤', label: 'Профиль' },
          { id: 'rules', icon: 'ℹ️', label: 'Правила' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { triggerHaptic(); setActiveTab(tab.id as any); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '6px 12px',
              borderRadius: '16px',
              background: activeTab === tab.id ? '#00f3ff20' : 'transparent',
              border: activeTab === tab.id ? '1px solid #00f3ff40' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s',
              flex: 1,
              maxWidth: '76px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            <span style={{ fontSize: '24px' }}>{tab.icon}</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: '600',
                marginTop: '2px',
                color: activeTab === tab.id ? '#00f3ff' : '#6b7280',
                transition: 'color 0.3s'
              }}
            >
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#00f3ff',
                  marginTop: '2px',
                  animation: 'pulseGlow 1.5s infinite'
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------
          12. ГЛОБАЛЬНЫЕ СТИЛИ (keyframes)
          ------------------------------------------------------------ */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * {
          -webkit-tap-highlight-color: transparent;
          box-sizing: border-box;
        }
        input, textarea, button {
          -webkit-appearance: none;
          appearance: none;
        }
        ::-webkit-scrollbar {
          width: 0;
          height: 0;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
