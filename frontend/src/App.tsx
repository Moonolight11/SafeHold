import React, { useState, useEffect } from 'react';

// ============================================================
// ТИПЫ ДАННЫХ
// ============================================================
interface Match {
  id: number;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  time: string;
  category: string;
  coef1: number;
  coef2: number;
  isLive: boolean;
  status: 'upcoming' | 'live' | 'finished';
}

interface Bet {
  id: number;
  matchId: number;
  matchName: string;
  selectedTeam: string;
  coefficient: number;
  amount: number;
  potentialWin: number;
  status: 'active' | 'won' | 'lost';
  date: string;
}

interface Referral {
  id: number;
  username: string;
  date: string;
  bets: number;
}

// ============================================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================================
const App: React.FC = () => {
  // ------------------------------------------------------------
  // СОСТОЯНИЯ
  // ------------------------------------------------------------
  const [currentTab, setCurrentTab] = useState<'line' | 'mybets' | 'profile' | 'rules'>('line');
  const [tgUser, setTgUser] = useState<any>(null);
  const [balance, setBalance] = useState(1250);

  // --- Фильтр категорий ---
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = [
    { id: 'all', label: 'Все', emoji: '🌐' },
    { id: 'dota', label: 'Dota 2', emoji: '🎮' },
    { id: 'cs', label: 'CS 2', emoji: '🔫' },
    { id: 'tanks', label: 'Танки', emoji: '🚜' },
    { id: 'football', label: 'Футбол', emoji: '⚽' },
    { id: 'hockey', label: 'Хоккей', emoji: '🏒' }
  ];

  // --- Матчи ---
  const [matches, setMatches] = useState<Match[]>([
    { id: 1, team1: 'Team Spirit', team2: 'Gaimin Gladiators', score1: 12, score2: 8, time: '25:00', category: 'dota', coef1: 1.85, coef2: 2.10, isLive: true, status: 'live' },
    { id: 2, team1: 'Natus Vincere', team2: 'Vitality', score1: 7, score2: 9, time: '18:00', category: 'cs', coef1: 2.20, coef2: 1.75, isLive: true, status: 'live' },
    { id: 3, team1: 'Wargaming', team2: 'ESL Team', score1: 3, score2: 2, time: '12:00', category: 'tanks', coef1: 1.95, coef2: 1.90, isLive: false, status: 'upcoming' },
    { id: 4, team1: 'Real Madrid', team2: 'Barcelona', score1: 1, score2: 1, time: '65:00', category: 'football', coef1: 2.50, coef2: 2.80, isLive: true, status: 'live' },
    { id: 5, team1: 'CSKA', team2: 'SKA', score1: 2, score2: 3, time: '45:00', category: 'hockey', coef1: 2.30, coef2: 1.70, isLive: true, status: 'live' },
    { id: 6, team1: 'PSG.LGD', team2: 'OG', score1: 5, score2: 5, time: '32:00', category: 'dota', coef1: 1.90, coef2: 2.00, isLive: true, status: 'live' },
    { id: 7, team1: 'FaZe Clan', team2: 'Cloud9', score1: 0, score2: 0, time: '00:00', category: 'cs', coef1: 1.65, coef2: 2.40, isLive: false, status: 'upcoming' },
  ]);

  // --- Ставки ---
  const [bets, setBets] = useState<Bet[]>([
    { id: 1, matchId: 1, matchName: 'Team Spirit vs Gaimin', selectedTeam: 'Team Spirit', coefficient: 1.85, amount: 100, potentialWin: 185, status: 'active', date: '12.07.2026' },
    { id: 2, matchId: 2, matchName: 'NaVi vs Vitality', selectedTeam: 'Vitality', coefficient: 1.75, amount: 50, potentialWin: 87.5, status: 'won', date: '11.07.2026' },
    { id: 3, matchId: 3, matchName: 'Wargaming vs ESL', selectedTeam: 'Wargaming', coefficient: 1.95, amount: 30, potentialWin: 58.5, status: 'lost', date: '10.07.2026' },
  ]);

  // --- Профиль ---
  const [referrals, setReferrals] = useState<Referral[]>([
    { id: 1, username: '@john_doe', date: '05.07.2026', bets: 3 },
    { id: 2, username: '@jane_smith', date: '07.07.2026', bets: 5 },
    { id: 3, username: '@mike_rogers', date: '09.07.2026', bets: 2 },
  ]);
  const [referralLink, setReferralLink] = useState('t.me/safehold_bet_bot?start=ref_12345');
  const [copyStatus, setCopyStatus] = useState('');

  // --- Купон (окно ставки) ---
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [betCoef, setBetCoef] = useState(0);
  const [betPotential, setBetPotential] = useState(0);

  // --- Фильтр моих ставок ---
  const [betFilter, setBetFilter] = useState<'active' | 'history'>('active');

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

  // Симуляция LIVE-обновлений
  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(prevMatches =>
        prevMatches.map(match => {
          if (match.status === 'live') {
            const newScore1 = match.score1 + (Math.random() > 0.7 ? 1 : 0);
            const newScore2 = match.score2 + (Math.random() > 0.7 ? 1 : 0);
            const newCoef1 = match.coef1 + (Math.random() - 0.5) * 0.2;
            const newCoef2 = match.coef2 + (Math.random() - 0.5) * 0.2;
            return {
              ...match,
              score1: newScore1,
              score2: newScore2,
              coef1: Math.max(1.1, Math.round(newCoef1 * 100) / 100),
              coef2: Math.max(1.1, Math.round(newCoef2 * 100) / 100),
              time: `${Math.floor(Math.random() * 30 + 15)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
            };
          }
          return match;
        })
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Расчет потенциального выигрыша
  useEffect(() => {
    const amount = parseFloat(betAmount);
    if (!isNaN(amount) && amount > 0 && betCoef > 0) {
      setBetPotential(amount * betCoef);
    } else {
      setBetPotential(0);
    }
  }, [betAmount, betCoef]);

  // ------------------------------------------------------------
  // ЛОГИКА СТАВОК
  // ------------------------------------------------------------
  const handleOpenBetModal = (match: Match, team: 'team1' | 'team2') => {
    setSelectedMatch(match);
    setSelectedTeam(team);
    setBetCoef(team === 'team1' ? match.coef1 : match.coef2);
    setBetAmount('');
    setBetPotential(0);
    setShowBetModal(true);
  };

  const handlePlaceBet = () => {
    if (!selectedMatch || !selectedTeam || !betAmount) return;

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Введите корректную сумму');
      return;
    }

    if (amount > balance) {
      alert('Недостаточно Звёзд');
      return;
    }

    const teamName = selectedTeam === 'team1' ? selectedMatch.team1 : selectedMatch.team2;
    const newBet: Bet = {
      id: Date.now(),
      matchId: selectedMatch.id,
      matchName: `${selectedMatch.team1} vs ${selectedMatch.team2}`,
      selectedTeam: teamName,
      coefficient: betCoef,
      amount: amount,
      potentialWin: betPotential,
      status: 'active',
      date: new Date().toLocaleDateString('ru-RU')
    };

    setBets([newBet, ...bets]);
    setBalance(balance - amount);
    setShowBetModal(false);
    setSelectedMatch(null);
    setSelectedTeam(null);
    setBetAmount('');
    setBetCoef(0);
    setBetPotential(0);
  };

  // ------------------------------------------------------------
  // ЛОГИКА РЕФЕРАЛКИ
  // ------------------------------------------------------------
  const handleCopyReferralLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink).then(() => {
        setCopyStatus('Ссылка скопирована!');
        setTimeout(() => setCopyStatus(''), 3000);
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopyStatus('Ссылка скопирована!');
        setTimeout(() => setCopyStatus(''), 3000);
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyStatus('Ссылка скопирована!');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  };

  // ------------------------------------------------------------
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ------------------------------------------------------------
  const getFilteredMatches = () => {
    if (selectedCategory === 'all') return matches;
    return matches.filter(m => m.category === selectedCategory);
  };

  const getMatchEmoji = (category: string) => {
    switch (category) {
      case 'dota': return '🎮';
      case 'cs': return '🔫';
      case 'tanks': return '🚜';
      case 'football': return '⚽';
      case 'hockey': return '🏒';
      default: return '🎯';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#10b981';
      case 'upcoming': return '#f59e0b';
      case 'finished': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'live': return '● LIVE';
      case 'upcoming': return 'Скоро';
      case 'finished': return 'Завершен';
      default: return status;
    }
  };

  const getBetStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00f3ff';
      case 'won': return '#10b981';
      case 'lost': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getBetStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'won': return 'Выиграла';
      case 'lost': return 'Проиграла';
      default: return status;
    }
  };

  // ------------------------------------------------------------
  // РЕНДЕР ВКЛАДОК
  // ------------------------------------------------------------
  const renderLineTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00f3ff', letterSpacing: '-0.5px' }}>
        🔥 Линия / Live
      </div>

      {/* Фильтр категорий */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', flexWrap: 'nowrap' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              borderRadius: '20px',
              border: selectedCategory === cat.id ? '1px solid #00f3ff' : '1px solid #231c3c',
              background: selectedCategory === cat.id ? '#00f3ff20' : '#141023',
              color: selectedCategory === cat.id ? '#00f3ff' : '#6b7280',
              fontWeight: selectedCategory === cat.id ? 'bold' : 'normal',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => { if (selectedCategory !== cat.id) e.currentTarget.style.border = '1px solid #00f3ff40'; }}
            onMouseLeave={(e) => { if (selectedCategory !== cat.id) e.currentTarget.style.border = '1px solid #231c3c'; }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Список матчей */}
      {getFilteredMatches().length === 0 ? (
        <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          Нет матчей в этой категории
        </div>
      ) : (
        getFilteredMatches().map(match => (
          <div key={match.id} style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{getMatchEmoji(match.category)}</span>
                <span style={{ fontSize: '12px', color: getStatusColor(match.status) }}>
                  {getStatusLabel(match.status)}
                </span>
                {match.isLive && (
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    animation: 'pulseGlow 1s infinite'
                  }} />
                )}
              </div>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>{match.time}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '16px' }}>{match.team1}</div>
              <div style={{ fontWeight: 'bold', color: '#00f3ff', fontSize: '20px' }}>{match.score1} : {match.score2}</div>
              <div style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '16px' }}>{match.team2}</div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleOpenBetModal(match, 'team1')}
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
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#bf77ff30'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#bf77ff20'}
              >
                П1 КФ {match.coef1.toFixed(2)}
              </button>
              <button
                onClick={() => handleOpenBetModal(match, 'team2')}
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
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#bf77ff30'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#bf77ff20'}
              >
                П2 КФ {match.coef2.toFixed(2)}
              </button>
            </div>
          </div>
        ))
      )}

      {/* Модалка ставки */}
      {showBetModal && selectedMatch && selectedTeam && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            background: '#141023',
            border: '1px solid #231c3c',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
                {selectedMatch.team1} vs {selectedMatch.team2}
              </div>
              <button onClick={() => setShowBetModal(false)} style={{ color: '#6b7280', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              Ставка на: <span style={{ color: '#bf77ff', fontWeight: 'bold' }}>
                {selectedTeam === 'team1' ? selectedMatch.team1 : selectedMatch.team2}
              </span>
            </div>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              Коэффициент: <span style={{ color: '#00f3ff', fontWeight: 'bold' }}>{betCoef.toFixed(2)}</span>
            </div>
            <div>
              <label style={{ color: '#6b7280', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                Сумма ставки (⭐️ Звёзды)
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1a142f',
                  border: '1px solid #231c3c',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#ffffff',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
                placeholder="Введите количество Звёзд"
                onFocus={(e) => e.currentTarget.style.border = '1px solid #00f3ff'}
                onBlur={(e) => e.currentTarget.style.border = '1px solid #231c3c'}
                min="1"
              />
            </div>
            {betPotential > 0 && (
              <div style={{ background: '#10b98120', border: '1px solid #10b98140', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Ваш возможный выигрыш:</span>
                <span style={{ color: '#eab308', fontWeight: 'bold', fontSize: '18px', marginLeft: '8px' }}>⭐️ {betPotential.toFixed(0)}</span>
              </div>
            )}
            <button
              onClick={handlePlaceBet}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #00f3ff, #bf77ff)',
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '18px',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(0, 243, 255, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 50px rgba(0, 243, 255, 0.5)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 243, 255, 0.3)'}
            >
              🔥 Сделать ставку на ⭐️ {betAmount || '0'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMyBetsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', letterSpacing: '-0.5px' }}>
        🎟️ Мои ставки
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setBetFilter('active')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '12px',
            border: betFilter === 'active' ? '1px solid #00f3ff' : '1px solid #231c3c',
            background: betFilter === 'active' ? '#00f3ff20' : '#141023',
            color: betFilter === 'active' ? '#00f3ff' : '#6b7280',
            fontWeight: betFilter === 'active' ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Активные ⏳
        </button>
        <button
          onClick={() => setBetFilter('history')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '12px',
            border: betFilter === 'history' ? '1px solid #00f3ff' : '1px solid #231c3c',
            background: betFilter === 'history' ? '#00f3ff20' : '#141023',
            color: betFilter === 'history' ? '#00f3ff' : '#6b7280',
            fontWeight: betFilter === 'history' ? 'bold' : 'normal',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Рассчитанные ✅
        </button>
      </div>

      {bets.filter(b => betFilter === 'active' ? b.status === 'active' : b.status !== 'active').length === 0 ? (
        <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          {betFilter === 'active' ? 'Нет активных ставок' : 'Нет рассчитанных ставок'}
        </div>
      ) : (
        bets.filter(b => betFilter === 'active' ? b.status === 'active' : b.status !== 'active').map(bet => (
          <div key={bet.id} style={{
            background: bet.status === 'won' ? '#10b98120' : bet.status === 'lost' ? '#ef444420' : '#141023',
            border: `1px solid ${getBetStatusColor(bet.status)}40`,
            borderRadius: '16px',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#ffffff' }}>{bet.matchName}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Ставка на: {bet.selectedTeam}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>КФ: {bet.coefficient.toFixed(2)} • {bet.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#eab308', fontWeight: 'bold' }}>⭐️ {bet.amount}</div>
                {bet.status === 'won' && (
                  <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '14px' }}>+ ⭐️ {bet.potentialWin} Выигрыш!</div>
                )}
                {bet.status === 'lost' && (
                  <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>Проиграна</div>
                )}
                {bet.status === 'active' && (
                  <div style={{ color: '#00f3ff', fontWeight: 'bold', fontSize: '14px' }}>Активна</div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#bf77ff', letterSpacing: '-0.5px' }}>
        👤 Профиль
      </div>

      {/* Аватар и баланс */}
      <div style={{
        background: '#141023',
        border: '1px solid #231c3c',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, #00f3ff20, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00f3ff, #bf77ff)',
          padding: '3px',
          boxShadow: '0 0 30px rgba(0, 243, 255, 0.3)'
        }}>
          <div style={{
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
          }}>
            {tgUser?.first_name?.[0] || tgUser?.username?.[0] || 'U'}
          </div>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginTop: '8px' }}>
          {tgUser?.first_name || 'Пользователь'} {tgUser?.last_name || ''}
        </div>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>@{tgUser?.username || 'нет_username'}</div>
        <div style={{
          marginTop: '12px',
          background: '#1a142f',
          border: '1px solid #231c3c',
          borderRadius: '12px',
          padding: '12px'
        }}>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Баланс</div>
          <div style={{ color: '#eab308', fontWeight: 'bold', fontSize: '28px' }}>⭐️ {balance.toLocaleString()} Stars</div>
        </div>
        <button
          onClick={() => {
            const amount = prompt('Введите сумму пополнения в Звёздах:');
            if (amount) {
              const val = parseFloat(amount);
              if (!isNaN(val) && val > 0) {
                setBalance(balance + val);
                alert(`Пополнено на ⭐️ ${val} Stars`);
              }
            }
          }}
          style={{
            marginTop: '12px',
            width: '100%',
            background: '#00f3ff20',
            color: '#00f3ff',
            border: '1px solid #00f3ff40',
            borderRadius: '12px',
            padding: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#00f3ff30'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#00f3ff20'}
        >
          💰 Пополнить баланс через Telegram Stars
        </button>
      </div>

      {/* Статистика */}
      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>📊 Статистика</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ textAlign: 'center', background: '#1a142f', borderRadius: '12px', padding: '8px' }}>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Всего ставок</div>
            <div style={{ color: '#00f3ff', fontWeight: 'bold', fontSize: '18px' }}>{bets.length}</div>
          </div>
          <div style={{ textAlign: 'center', background: '#1a142f', borderRadius: '12px', padding: '8px' }}>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>ROI</div>
            <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '18px' }}>+68%</div>
          </div>
          <div style={{ textAlign: 'center', background: '#1a142f', borderRadius: '12px', padding: '8px' }}>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Макс. КФ</div>
            <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '18px' }}>2.80</div>
          </div>
        </div>
      </div>

      {/* Реферальная система */}
      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
          🔗 Пригласи друга и получай 10% от его ставок
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={referralLink}
            readOnly
            style={{
              flex: 1,
              background: '#1a142f',
              border: '1px solid #231c3c',
              borderRadius: '12px',
              padding: '10px',
              color: '#6b7280',
              fontSize: '12px',
              outline: 'none'
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
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#00f3ff30'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#00f3ff20'}
          >
            🔗 Копировать
          </button>
        </div>
        {copyStatus && (
          <div style={{ color: '#10b981', fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>
            ✅ {copyStatus}
          </div>
        )}
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
          Приглашенные друзья:
        </div>
        {referrals.map(ref => (
          <div key={ref.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #231c3c', padding: '6px 0' }}>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>{ref.username}</span>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>{ref.date} • {ref.bets} ставок</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRulesTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', letterSpacing: '-0.5px' }}>
        ℹ️ Правила и поддержка
      </div>

      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', marginBottom: '12px' }}>
          📋 Как рассчитываются ставки
        </div>
        <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>1. Все ставки принимаются в Звёздах Telegram (⭐️ Stars).</p>
          <p style={{ marginBottom: '8px' }}>2. Коэффициенты обновляются в реальном времени в зависимости от хода матча.</p>
          <p style={{ marginBottom: '8px' }}>3. Ставка считается выигрышной, если выбранная команда побеждает по итогу матча.</p>
          <p style={{ marginBottom: '8px' }}>4. При ничьей в спортивных матчах ставки возвращаются с коэффициентом 1.00.</p>
          <p style={{ marginBottom: '8px' }}>5. Расчет происходит автоматически после завершения матча.</p>
          <p>6. В случае спорной ситуации решение принимает арбитр @SafeHold_Bet_Support.</p>
        </div>
      </div>

      <button
        onClick={() => window.open('https://t.me/SafeHold_Bet_Support', '_blank')}
        style={{
          background: '#00f3ff20',
          color: '#00f3ff',
          border: '1px solid #00f3ff40',
          fontWeight: 'bold',
          padding: '16px',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontSize: '16px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#00f3ff30'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#00f3ff20'}
      >
        📞 Связаться с поддержкой @SafeHold_Bet_Support
      </button>
    </div>
  );

  // ------------------------------------------------------------
  // ОСНОВНАЯ ОТРИСОВКА
  // ------------------------------------------------------------
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0813',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '80px',
      overflowX: 'hidden',
      maxWidth: '100vw'
    }}>
      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00f3ff', letterSpacing: '-0.5px' }}>
            ⚡ SafeHold Bet
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#eab308', fontSize: '14px' }}>⭐️ {balance}</span>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>v1.0</span>
          </div>
        </div>

        {currentTab === 'line' && renderLineTab()}
        {currentTab === 'mybets' && renderMyBetsTab()}
        {currentTab === 'profile' && renderProfileTab()}
        {currentTab === 'rules' && renderRulesTab()}
      </div>

      {/* Нижний таб-бар - 4 кнопки */}
      <div style={{
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
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        borderRadius: '24px 24px 0 0'
      }}>
        {[
          { id: 'line', icon: '🔥', label: 'Линия' },
          { id: 'mybets', icon: '🎟️', label: 'Мои ставки' },
          { id: 'profile', icon: '👤', label: 'Профиль' },
          { id: 'rules', icon: 'ℹ️', label: 'Правила' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: '16px',
              background: currentTab === tab.id ? '#00f3ff20' : 'transparent',
              border: currentTab === tab.id ? '1px solid #00f3ff40' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s',
              flex: 1,
              maxWidth: '80px'
            }}
            onMouseEnter={(e) => {
              if (currentTab !== tab.id) {
                e.currentTarget.style.background = '#ffffff08';
                e.currentTarget.style.border = '1px solid #ffffff10';
              }
            }}
            onMouseLeave={(e) => {
              if (currentTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.border = '1px solid transparent';
              }
            }}
          >
            <span style={{ fontSize: '24px' }}>{tab.icon}</span>
            <span style={{
              fontSize: '10px',
              fontWeight: '600',
              marginTop: '2px',
              color: currentTab === tab.id ? '#00f3ff' : '#6b7280',
              transition: 'color 0.3s'
            }}>
              {tab.label}
            </span>
            {currentTab === tab.id && (
              <span style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#00f3ff',
                marginTop: '2px',
                animation: 'pulseGlow 1.5s infinite'
              }} />
            )}
          </button>
        ))}
      </div>

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
        }
        input, textarea, button {
          -webkit-appearance: none;
          appearance: none;
        }
      `}</style>
    </div>
  );
};

export default App;
