import React, { useState, useEffect } from 'react';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
interface Match {
  id: string;
  category: 'dota2' | 'cs2' | 'tanks' | 'football' | 'hockey';
  teamA: string;
  teamB: string;
  logoA: string;
  logoB: string;
  scoreA: number;
  scoreB: number;
  status: 'live' | 'upcoming' | 'finished';
  oddsA: number;
  oddsB: number;
  oddsDraw?: number;
  time: string;
  period: string;
}

interface Bet {
  id: string;
  matchId: string;
  teamA: string;
  teamB: string;
  category: string;
  prediction: 'teamA' | 'teamB' | 'draw';
  predictionName: string;
  odds: number;
  amount: number;
  status: 'pending' | 'won' | 'lost';
}

// ==========================================
// 2. INLINE SVG ICONS (Zero NPM dependency!)
// ==========================================
const Icons = {
  Star: () => (
    <svg className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
  Dashboard: ({ active }: { active: boolean }) => (
    <svg className={`w-6 h-6 ${active ? 'text-[#00E5FF]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  MyBets: ({ active }: { active: boolean }) => (
    <svg className={`w-6 h-6 ${active ? 'text-[#00E5FF]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Wallet: ({ active }: { active: boolean }) => (
    <svg className={`w-6 h-6 ${active ? 'text-[#00E5FF]' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Dota2: () => (
    <span className="font-extrabold tracking-tighter text-red-500 text-xs">⚔️ DOTA 2</span>
  ),
  CS2: () => (
    <span className="font-extrabold tracking-tighter text-orange-500 text-xs">🎯 CS 2</span>
  ),
  Tanks: () => (
    <span className="font-extrabold tracking-tighter text-green-500 text-xs">🚜 TANKS</span>
  ),
  Football: () => (
    <span className="font-extrabold tracking-tighter text-blue-500 text-xs">⚽ FOOTBALL</span>
  ),
  Hockey: () => (
    <span className="font-extrabold tracking-tighter text-sky-500 text-xs">🏒 HOCKEY</span>
  ),
};

export default function App() {
  // ==========================================
  // 3. REACT STATE MANAGEMENT
  // ==========================================
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-bets' | 'wallet'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  const [userBalance, setUserBalance] = useState<number>(250);
  
  const [betSlip, setBetSlip] = useState<{
    match: Match;
    prediction: 'teamA' | 'teamB' | 'draw';
    odds: number;
  } | null>(null);
  const [betAmount, setBetAmount] = useState<string>('10');

  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [walletModalAction, setWalletModalAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [starsAmountInput, setStarsAmountInput] = useState<string>('50');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [matches, setMatches] = useState<Match[]>([
    {
      id: 'm1',
      category: 'dota2',
      teamA: 'Team Spirit',
      teamB: 'Gaimin Gladiators',
      logoA: '🐉',
      logoB: '🛡️',
      scoreA: 12,
      scoreB: 9,
      status: 'live',
      oddsA: 1.65,
      oddsB: 2.20,
      time: '34:12',
      period: 'Map 1'
    },
    {
      id: 'm2',
      category: 'cs2',
      teamA: 'Natus Vincere',
      teamB: 'FaZe Clan',
      logoA: '👑',
      logoB: '❌',
      scoreA: 11,
      scoreB: 12,
      status: 'live',
      oddsA: 2.10,
      oddsB: 1.75,
      time: 'Round 24',
      period: 'Map 2'
    },
    {
      id: 'm3',
      category: 'tanks',
      teamA: 'Tornado Energy',
      teamB: 'Rush Club',
      logoA: '⚡',
      logoB: '🐻',
      scoreA: 4,
      scoreB: 2,
      status: 'live',
      oddsA: 1.35,
      oddsB: 3.10,
      time: '04:15',
      period: 'Match 1'
    },
    {
      id: 'm4',
      category: 'football',
      teamA: 'Real Madrid',
      teamB: 'Manchester City',
      logoA: '⚪',
      logoB: '🔵',
      scoreA: 2,
      scoreB: 2,
      status: 'live',
      oddsA: 2.85,
      oddsB: 2.90,
      oddsDraw: 3.20,
      time: '74:45',
      period: '2nd Half'
    },
    {
      id: 'm5',
      category: 'hockey',
      teamA: 'Boston Bruins',
      teamB: 'Toronto Maple Leafs',
      logoA: '🐻',
      logoB: '🍁',
      scoreA: 0,
      scoreB: 0,
      status: 'upcoming',
      oddsA: 1.85,
      oddsB: 2.05,
      oddsDraw: 3.90,
      time: '21:45',
      period: 'Today'
    },
    {
      id: 'm6',
      category: 'dota2',
      teamA: 'Virtus.pro',
      teamB: 'LGD Gaming',
      logoA: '🐻',
      logoB: '🏮',
      scoreA: 0,
      scoreB: 0,
      status: 'upcoming',
      oddsA: 2.45,
      oddsB: 1.55,
      time: 'Tomorrow',
      period: 'Bo3'
    },
    {
      id: 'm7',
      category: 'cs2',
      teamA: 'Vitality',
      teamB: 'G2 Esports',
      logoA: '🐝',
      logoB: '⚔️',
      scoreA: 0,
      scoreB: 0,
      status: 'upcoming',
      oddsA: 1.90,
      oddsB: 1.90,
      time: '23:00',
      period: 'Map 1'
    }
  ]);

  const [myBets, setMyBets] = useState<Bet[]>([
    {
      id: 'b1',
      matchId: 'm4',
      teamA: 'Real Madrid',
      teamB: 'Manchester City',
      category: 'football',
      prediction: 'teamA',
      predictionName: 'Real Madrid',
      odds: 2.85,
      amount: 25,
      status: 'pending'
    }
  ]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ==========================================
  // 4. REAL-TIME SPORTS SIMULATOR ENGINE
  // ==========================================
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#0F0F12');
    }

    const interval = setInterval(() => {
      setMatches(prevMatches => {
        return prevMatches.map(match => {
          if (match.status !== 'live') return match;

          const chance = Math.random();
          let newScoreA = match.scoreA;
          let newScoreB = match.scoreB;
          let newTime = match.time;

          if (match.category === 'football') {
            const [min, sec] = match.time.split(':').map(Number);
            let totalSec = min * 60 + sec + 5;
            if (totalSec >= 5400) totalSec = 5400;
            const nextMin = Math.floor(totalSec / 60);
            const nextSec = totalSec % 60;
            newTime = `${nextMin.toString().padStart(2, '0')}:${nextSec.toString().padStart(2, '0')}`;
            if (chance > 0.985) newScoreA += 1;
            else if (chance > 0.97) newScoreB += 1;
          } else if (match.category === 'dota2') {
            const [min, sec] = match.time.split(':').map(Number);
            let totalSec = min * 60 + sec + 10;
            const nextMin = Math.floor(totalSec / 60);
            const nextSec = totalSec % 60;
            newTime = `${nextMin.toString().padStart(2, '0')}:${nextSec.toString().padStart(2, '0')}`;
            if (chance > 0.85) newScoreA += 1;
            if (chance > 0.82 && chance <= 0.85) newScoreB += 1;
          } else if (match.category === 'cs2') {
            if (chance > 0.90) {
              const currentRounds = newScoreA + newScoreB;
              if (currentRounds < 24) {
                if (Math.random() > 0.5) newScoreA += 1;
                else newScoreB += 1;
                newTime = `Round ${newScoreA + newScoreB + 1}`;
              } else {
                return { ...match, status: 'finished' };
              }
            }
          } else if (match.category === 'tanks') {
            if (chance > 0.95) {
              if (newScoreA + newScoreB < 7) {
                Math.random() > 0.65 ? newScoreA += 1 : newScoreB += 1;
              }
            }
          }

          let baseOddsA = 1.9;
          let baseOddsB = 1.9;
          const scoreDiff = newScoreA - newScoreB;

          if (match.category === 'dota2' || match.category === 'cs2') {
            baseOddsA = Math.max(1.05, 1.9 - (scoreDiff * 0.08));
            baseOddsB = Math.max(1.05, 1.9 + (scoreDiff * 0.08));
          } else {
            baseOddsA = Math.max(1.02, 2.0 - (scoreDiff * 0.4));
            baseOddsB = Math.max(1.02, 2.0 + (scoreDiff * 0.4));
          }

          const finalOddsA = parseFloat(baseOddsA.toFixed(2));
          const finalOddsB = parseFloat(baseOddsB.toFixed(2));

          return {
            ...match,
            scoreA: newScoreA,
            scoreB: newScoreB,
            oddsA: finalOddsA,
            oddsB: finalOddsB,
            time: newTime
          };
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      const current = matches.find(m => m.id === selectedMatch.id);
      if (current) setSelectedMatch(current);
    }
  }, [matches, selectedMatch]);

  // ==========================================
  // 5. HANDLERS
  // ==========================================
  const triggerHaptic = () => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  const handleOpenBetSlip = (match: Match, prediction: 'teamA' | 'teamB' | 'draw', odds: number) => {
    triggerHaptic();
    setBetSlip({ match, prediction, odds });
  };

  const handlePlaceBet = () => {
    triggerHaptic();
    if (!betSlip) return;

    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Введите корректную сумму', 'error');
      return;
    }

    if (amount > userBalance) {
      showToast('Недостаточно звезд на балансе', 'error');
      return;
    }

    setUserBalance(prev => prev - amount);

    const newBet: Bet = {
      id: 'bet_' + Date.now(),
      matchId: betSlip.match.id,
      teamA: betSlip.match.teamA,
      teamB: betSlip.match.teamB,
      category: betSlip.match.category,
      prediction: betSlip.prediction,
      predictionName: betSlip.prediction === 'teamA' ? betSlip.match.teamA : betSlip.prediction === 'teamB' ? betSlip.match.teamB : 'Ничья',
      odds: betSlip.odds,
      amount: amount,
      status: 'pending'
    };

    setMyBets(prev => [newBet, ...prev]);
    showToast(`Ставка в ★ ${amount} успешно принята!`, 'success');
    setBetSlip(null);
  };

  const handleWalletAction = () => {
    triggerHaptic();
    const amount = parseInt(starsAmountInput);
    if (isNaN(amount) || amount <= 0) {
      showToast('Введите верную сумму', 'error');
      return;
    }

    if (walletModalAction === 'deposit') {
      setUserBalance(prev => prev + amount);
      showToast(`Начислено ★ ${amount}`, 'success');
    } else {
      if (amount > userBalance) {
        showToast('Недостаточный баланс для вывода', 'error');
        return;
      }
      setUserBalance(prev => prev - amount);
      showToast(`Заявка на вывод ★ ${amount} отправлена!`, 'success');
    }
    setShowWalletModal(false);
  };

  const filteredMatches = selectedCategory === 'all' 
    ? matches 
    : matches.filter(m => m.category === selectedCategory);

  const activeLiveMatches = filteredMatches.filter(m => m.status === 'live');
  const activeUpcomingMatches = filteredMatches.filter(m => m.status === 'upcoming');

  // ==========================================
  // 6. RENDER
  // ==========================================
  return (
    <div className="bg-[#0F0F12] text-[#E2E8F0] min-h-screen flex flex-col font-sans select-none overflow-hidden max-h-screen">
      
      <header className="h-16 border-b border-[#2A2B36] px-4 flex items-center justify-between bg-[#15161E] shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#00FF87] flex items-center justify-center font-black text-black text-sm shadow-[0_0_12px_rgba(0,229,255,0.4)]">
            SB
          </div>
          <span className="text-lg font-black tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">STARBET</span>
        </div>
        
        <div 
          onClick={() => { triggerHaptic(); setActiveTab('wallet'); }} 
          className="flex items-center space-x-2 bg-slate-900/80 border border-amber-500/30 px-3 py-1.5 rounded-full cursor-pointer hover:border-amber-400 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
        >
          <Icons.Star />
          <span className="text-amber-400 font-extrabold text-sm tracking-wide">★ {userBalance}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 h-[calc(100vh-128px)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        
        {activeTab === 'dashboard' && !selectedMatch && (
          <div className="p-4 space-y-6">
            
            <div className="bg-gradient-to-r from-slate-900 via-[#1C1E2A] to-slate-900 border border-[#00E5FF]/20 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden shadow-[0_0_15px_rgba(0,229,255,0.1)]">
              <div className="space-y-1 relative z-10">
                <span className="text-[10px] text-[#00E5FF] tracking-widest uppercase font-bold">Акция недели</span>
                <h3 className="text-md font-extrabold text-white">Страховка первой ставки</h3>
                <p className="text-xs text-slate-400">Поставьте до 100 звезд без риска потерь!</p>
              </div>
              <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">🛡️</div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Категории</span>
              <div className="flex space-x-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[
                  { id: 'all', label: '🔥 Все' },
                  { id: 'dota2', label: '⚔️ Dota 2' },
                  { id: 'cs2', label: '🎯 CS 2' },
                  { id: 'tanks', label: '🚜 Танки' },
                  { id: 'football', label: '⚽ Футбол' },
                  { id: 'hockey', label: '🏒 Хоккей' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { triggerHaptic(); setSelectedCategory(cat.id); }}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap border transition-all duration-300 ${
                      selectedCategory === cat.id 
                        ? 'bg-gradient-to-r from-[#00E5FF] to-[#0087FF] text-black border-transparent shadow-[0_0_12px_rgba(0,229,255,0.3)]' 
                        : 'bg-[#15161E] text-slate-400 border-[#2A2B36]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                <span className="text-xs font-bold text-red-500 tracking-wider uppercase">В эфире LIVE ({activeLiveMatches.length})</span>
              </div>

              {activeLiveMatches.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">Нет активных Live матчей в данной категории</div>
              ) : (
                <div className="space-y-4">
                  {activeLiveMatches.map(match => (
                    <div 
                      key={match.id}
                      className="bg-[#15161E]/90 border border-[#2A2B36] rounded-2xl p-4 space-y-4 shadow-lg relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center text-xs text-slate-400">
                        <div className="flex items-center space-x-1">
                          {match.category === 'dota2' && <Icons.Dota2 />}
                          {match.category === 'cs2' && <Icons.CS2 />}
                          {match.category === 'tanks' && <Icons.Tanks />}
                          {match.category === 'football' && <Icons.Football />}
                          {match.category === 'hockey' && <Icons.Hockey />}
                        </div>
                        <span className="text-red-500 font-extrabold tracking-widest">{match.period} | {match.time}</span>
                      </div>

                      <div 
                        onClick={() => { triggerHaptic(); setSelectedMatch(match); }}
                        className="grid grid-cols-7 items-center justify-center gap-1 cursor-pointer"
                      >
                        <div className="col-span-3 flex flex-col items-center space-y-2 text-center">
                          <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">{match.logoA}</span>
                          <span className="text-xs font-bold text-white truncate max-w-[100px]">{match.teamA}</span>
                        </div>
                        
                        <div className="col-span-1 flex flex-col items-center justify-center">
                          <div className="bg-[#212330] px-2 py-1 rounded-lg text-sm font-black text-[#00FF87] border border-[#00FF87]/15">
                            {match.scoreA}:{match.scoreB}
                          </div>
                        </div>

                        <div className="col-span-3 flex flex-col items-center space-y-2 text-center">
                          <span className="text-3xl filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">{match.logoB}</span>
                          <span className="text-xs font-bold text-white truncate max-w-[100px]">{match.teamB}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <button 
                          onClick={() => handleOpenBetSlip(match, 'teamA', match.oddsA)}
                          className="bg-[#1C1D2A] hover:bg-[#25273B] border border-[#2A2B36] rounded-xl py-2 flex flex-col items-center justify-center transition-all duration-200"
                        >
                          <span className="text-[10px] text-slate-500">Победа 1</span>
                          <span className="text-xs font-black text-[#00E5FF]">{match.oddsA}</span>
                        </button>

                        {match.oddsDraw ? (
                          <button 
                            onClick={() => handleOpenBetSlip(match, 'draw', match.oddsDraw || 3.0)}
                            className="bg-[#1C1D2A] hover:bg-[#25273B] border border-[#2A2B36] rounded-xl py-2 flex flex-col items-center justify-center transition-all duration-200"
                          >
                            <span className="text-[10px] text-slate-500">Ничья</span>
                            <span className="text-xs font-black text-[#FFB300]">{match.oddsDraw}</span>
                          </button>
                        ) : (
                          <div className="bg-[#1C1D2A]/30 rounded-xl flex items-center justify-center text-slate-600 text-[10px] font-bold">
                            Нет ничьей
                          </div>
                        )}

                        <button 
                          onClick={() => handleOpenBetSlip(match, 'teamB', match.oddsB)}
                          className="bg-[#1C1D2A] hover:bg-[#25273B] border border-[#2A2B36] rounded-xl py-2 flex flex-col items-center justify-center transition-all duration-200"
                        >
                          <span className="text-[10px] text-slate-500">Победа 2</span>
                          <span className="text-xs font-black text-[#00E5FF]">{match.oddsB}</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Ближайшие матчи ({activeUpcomingMatches.length})</span>

              <div className="space-y-3">
                {activeUpcomingMatches.map(match => (
                  <div 
                    key={match.id}
                    onClick={() => { triggerHaptic(); setSelectedMatch(match); }}
                    className="bg-[#15161E]/60 border border-[#2A2B36] rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-[#15161E] transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-center">
                        <span className="text-xl">{match.logoA}</span>
                        <span className="text-[10px] text-slate-500 mt-1">vs</span>
                        <span className="text-xl">{match.logoB}</span>
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">{match.teamA} - {match.teamB}</div>
                        <div className="text-[10px] text-[#00E5FF] mt-1">{match.time} | {match.period}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <div className="bg-[#1F2130] px-3 py-1.5 rounded-lg border border-[#2A2B36] text-center">
                        <div className="text-[8px] text-slate-500">П1</div>
                        <div className="text-xs font-bold text-white">{match.oddsA}</div>
                      </div>
                      <div className="bg-[#1F2130] px-3 py-1.5 rounded-lg border border-[#2A2B36] text-center">
                        <div className="text-[8px] text-slate-500">П2</div>
                        <div className="text-xs font-bold text-white">{match.oddsB}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {selectedMatch && (
          <div className="p-4 space-y-6">
            <button 
              onClick={() => { triggerHaptic(); setSelectedMatch(null); }}
              className="flex items-center space-x-1.5 text-xs text-[#00E5FF] font-bold bg-[#1C1D2A] px-3 py-1.5 rounded-lg border border-[#2A2B36]"
            >
              ← Назад в ленту
            </button>

            <div className="bg-gradient-to-b from-[#1C1E2B] to-[#12131C] border border-[#2A2B36] rounded-2xl p-6 text-center space-y-4">
              <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 font-bold uppercase tracking-widest">{selectedMatch.status === 'live' ? 'LIVE ЭФИР' : 'СКОРО'}</span>
              
              <div className="flex items-center justify-around">
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-5xl filter drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]">{selectedMatch.logoA}</span>
                  <span className="text-sm font-black text-white">{selectedMatch.teamA}</span>
                </div>
                <div className="text-center">
                  <span className="text-3xl font-black text-white bg-[#15161E] px-4 py-2 rounded-xl border border-[#2A2B36]">
                    {selectedMatch.scoreA} : {selectedMatch.scoreB}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-3">{selectedMatch.period} | {selectedMatch.time}</div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-5xl filter drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]">{selectedMatch.logoB}</span>
                  <span className="text-sm font-black text-white">{selectedMatch.teamB}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Основные исходы</span>
              
              <div className="bg-[#15161E] border border-[#2A2B36] rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-[#2A2B36]">
                  <span>Исход матча (П1 - Ничья - П2)</span>
                  <span className="text-[#00E5FF] font-bold">1X2</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div 
                    onClick={() => handleOpenBetSlip(selectedMatch, 'teamA', selectedMatch.oddsA)}
                    className="bg-[#1F2130] p-3 rounded-xl border border-[#2A2B36] hover:border-[#00E5FF] transition-all cursor-pointer flex flex-col items-center justify-center"
                  >
                    <span className="text-[10px] text-slate-500">Победа 1</span>
                    <span className="text-lg font-black text-white mt-1">{selectedMatch.oddsA}</span>
                  </div>

                  <div 
                    onClick={() => {
                      if (selectedMatch.oddsDraw) {
                        handleOpenBetSlip(selectedMatch, 'draw', selectedMatch.oddsDraw);
                      } else {
                        showToast('Ничья недоступна', 'error');
                      }
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      selectedMatch.oddsDraw 
                        ? 'bg-[#1F2130] border-[#2A2B36] hover:border-[#FFB300]' 
                        : 'bg-[#1F2130]/20 border-transparent opacity-45'
                    }`}
                  >
                    <span className="text-[10px] text-slate-500">Ничья</span>
                    <span className="text-lg font-black text-white mt-1">{selectedMatch.oddsDraw || '-'}</span>
                  </div>

                  <div 
                    onClick={() => handleOpenBetSlip(selectedMatch, 'teamB', selectedMatch.oddsB)}
                    className="bg-[#1F2130] p-3 rounded-xl border border-[#2A2B36] hover:border-[#00E5FF] transition-all cursor-pointer flex flex-col items-center justify-center"
                  >
                    <span className="text-[10px] text-slate-500">Победа 2</span>
                    <span className="text-lg font-black text-white mt-1">{selectedMatch.oddsB}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#15161E] border border-[#2A2B36] rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-[#2A2B36]">
                  <span>Двойной шанс</span>
                  <span className="text-[#00FF87] font-bold">DC</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1F2130] p-3 rounded-xl border border-[#2A2B36] flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold">1X (Поб. 1 или Ничья)</span>
                    <span className="text-sm font-black text-white">{(selectedMatch.oddsA * 0.75).toFixed(2)}</span>
                  </div>
                  <div className="bg-[#1F2130] p-3 rounded-xl border border-[#2A2B36] flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold">2X (Поб. 2 или Ничья)</span>
                    <span className="text-sm font-black text-white">{(selectedMatch.oddsB * 0.75).toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'my-bets' && (
          <div className="p-4 space-y-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">История ваших ставок</span>

            {myBets.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <span className="text-3xl block mb-2">📦</span>
                У вас пока нет оформленных ставок
              </div>
            ) : (
              <div className="space-y-4">
                {myBets.map(bet => (
                  <div key={bet.id} className="bg-[#15161E] border border-[#2A2B36] rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{bet.category}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                        bet.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
                      }`}>
                        {bet.status === 'pending' ? 'В ожидании' : 'Выиграна'}
                      </span>
                    </div>

                    <div className="text-sm font-black text-white">{bet.teamA} vs {bet.teamB}</div>
                    
                    <div className="grid grid-cols-2 gap-2 bg-[#1C1D2A] p-2.5 rounded-xl border border-[#2A2B36]">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Прогноз:</span>
                        <span className="text-xs font-bold text-white truncate max-w-[120px] block">{bet.predictionName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Коэффициент:</span>
                        <span className="text-xs font-black text-[#00E5FF] block">{bet.odds}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-xs">
                      <div>
                        <span className="text-slate-400">Ставка:</span>
                        <span className="text-white font-bold ml-1">★ {bet.amount}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Возможный выигрыш:</span>
                        <span className="text-[#00FF87] font-black ml-1">★ {Math.floor(bet.amount * bet.odds)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="p-4 space-y-6">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Ваш кошелек</span>

            <div className="bg-gradient-to-br from-[#1C1E2C] to-[#12131C] border border-amber-500/30 rounded-3xl p-6 text-center space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.07)]">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Текущий баланс</span>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-5xl filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">★</span>
                <span className="text-4xl font-black text-amber-400 tracking-wide">{userBalance}</span>
              </div>
              <p className="text-xs text-slate-500">1 Звезда (★) Telegram = 1 Звезда внутри приложения</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  triggerHaptic();
                  setWalletModalAction('deposit');
                  setShowWalletModal(true);
                }}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black rounded-2xl py-3.5 font-black text-sm tracking-wide shadow-lg hover:shadow-amber-500/10 active:scale-95 transition-all duration-150"
              >
                Купить ★ Stars
              </button>
              <button 
                onClick={() => {
                  triggerHaptic();
                  setWalletModalAction('withdraw');
                  setShowWalletModal(true);
                }}
                className="bg-[#1C1E2B] border border-[#2A2B36] text-white rounded-2xl py-3.5 font-bold text-sm tracking-wide hover:bg-[#252839] active:scale-95 transition-all duration-150"
              >
                Вывод Звезд
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">История платежей</span>
              <div className="bg-[#15161E] border border-[#2A2B36] rounded-2xl p-4 divide-y divide-[#2A2B36]">
                <div className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-white font-bold block">Пополнение через Bot API</span>
                    <span className="text-[10px] text-slate-500">22.07.2026 14:15</span>
                  </div>
                  <span className="text-green-400 font-bold">+ ★ 250</span>
                </div>
                <div className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-white font-bold block">Авторизация профиля</span>
                    <span className="text-[10px] text-slate-500">22.07.2026 14:12</span>
                  </div>
                  <span className="text-green-400 font-bold">+ ★ 10</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 z-50 p-4 rounded-xl border shadow-xl flex items-center space-x-2 animate-bounce ${
          toast.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {betSlip && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-end justify-center transition-all duration-300">
          <div className="bg-[#151620] border-t border-[#00E5FF]/30 w-full max-w-md rounded-t-3xl p-6 space-y-6 shadow-[0_-10px_30px_rgba(0,229,255,0.15)]" style={{ animation: 'slideUp 0.3s ease-out' }}>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-[#00E5FF] tracking-widest uppercase font-bold">КУПОН СТАВКИ</span>
                <h4 className="text-sm font-black text-white">{betSlip.match.teamA} vs {betSlip.match.teamB}</h4>
              </div>
              <button 
                onClick={() => { triggerHaptic(); setBetSlip(null); }}
                className="text-slate-400 hover:text-white text-sm bg-slate-900 px-3 py-1 rounded-lg border border-[#2A2B36]"
              >
                Закрыть
              </button>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-[#2A2B36] flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-500 block">Ваш прогноз:</span>
                <span className="text-white font-black">
                  {betSlip.prediction === 'teamA' ? betSlip.match.teamA : betSlip.prediction === 'teamB' ? betSlip.match.teamB : 'Ничья'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Коэффициент:</span>
                <span className="text-[#00FF87] font-black text-lg">{betSlip.odds}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Сумма ставки (в ★ Stars)</span>
                <span>Доступно: ★ {userBalance}</span>
              </div>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-amber-400">★</span>
                <input 
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-slate-900/80 border border-[#2A2B36] focus:border-[#00E5FF] outline-none rounded-xl py-3.5 pl-10 pr-4 text-white font-extrabold text-sm"
                  placeholder="Введите сумму"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs bg-[#1C1D2A] p-3 rounded-xl">
              <span className="text-slate-400">Возможная выплата:</span>
              <span className="text-[#00FF87] font-black text-sm">
                ★ {Math.floor((parseFloat(betAmount) || 0) * betSlip.odds)}
              </span>
            </div>

            <button 
              onClick={handlePlaceBet}
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#0087FF] text-black rounded-2xl py-4 font-black tracking-wide text-sm active:scale-95 transition-all duration-150 shadow-[0_0_20px_rgba(0,229,255,0.25)]"
            >
              Сделать ставку на ★ {betAmount || 0}
            </button>
          </div>
        </div>
      )}

      {showWalletModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-[#151620] border border-[#2A2B36] rounded-3xl p-6 w-full max-w-sm space-y-5">
            <h4 className="text-md font-black text-white">
              {walletModalAction === 'deposit' ? 'Пополнить баланс через Telegram' : 'Вывести звезды из приложения'}
            </h4>
            
            <p className="text-xs text-slate-400">
              {walletModalAction === 'deposit' 
                ? 'Укажите количество звезд, которое вы хотите внести на баланс через встроенную платежную систему Stars.' 
                : 'Ваша заявка будет отправлена на модерацию. Средства переведутся на ваш ТГ баланс.'}
            </p>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-amber-400">★</span>
              <input 
                type="number"
                value={starsAmountInput}
                onChange={(e) => setStarsAmountInput(e.target.value)}
                className="w-full bg-slate-900/80 border border-[#2A2B36] focus:border-amber-400 outline-none rounded-xl py-3 pl-10 pr-4 text-white font-extrabold text-sm"
              />
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => { triggerHaptic(); setShowWalletModal(false); }}
                className="w-1/2 bg-[#1C1D2A] border border-[#2A2B36] text-white rounded-xl py-2.5 text-xs font-bold"
              >
                Отмена
              </button>
              <button 
                onClick={handleWalletAction}
                className="w-1/2 bg-amber-500 text-black rounded-xl py-2.5 text-xs font-extrabold"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="h-16 border-t border-[#2A2B36] bg-[#15161E] fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around shrink-0">
        <button 
          onClick={() => { triggerHaptic(); setSelectedMatch(null); setActiveTab('dashboard'); }} 
          className="flex flex-col items-center justify-center w-20 h-full space-y-1"
        >
          <Icons.Dashboard active={activeTab === 'dashboard'} />
          <span className={`text-[10px] font-bold ${activeTab === 'dashboard' ? 'text-[#00E5FF]' : 'text-slate-400'}`}>События</span>
        </button>

        <button 
          onClick={() => { triggerHaptic(); setSelectedMatch(null); setActiveTab('my-bets'); }} 
          className="flex flex-col items-center justify-center w-20 h-full space-y-1"
        >
          <Icons.MyBets active={activeTab === 'my-bets'} />
          <span className={`text-[10px] font-bold ${activeTab === 'my-bets' ? 'text-[#00E5FF]' : 'text-slate-400'}`}>Мои ставки</span>
        </button>

        <button 
          onClick={() => { triggerHaptic(); setSelectedMatch(null); setActiveTab('wallet'); }} 
          className="flex flex-col items-center justify-center w-20 h-full space-y-1"
        >
          <Icons.Wallet active={activeTab === 'wallet'} />
          <span className={`text-[10px] font-bold ${activeTab === 'wallet' ? 'text-[#00E5FF]' : 'text-slate-400'}`}>Кошелек</span>
        </button>
      </footer>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}
