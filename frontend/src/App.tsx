import React, { useState, useEffect } from 'react';

// ============================================================
// ТИПЫ ДАННЫХ
// ============================================================
interface NFTItem {
  id: number;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  price: number;
  image: string;
  status: 'available' | 'in_escrow' | 'transferred';
  mintNumber: string;
}

interface DealHistory {
  id: number;
  nftName: string;
  from: string;
  to: string;
  date: string;
  status: 'completed' | 'pending';
}

interface Referral {
  id: number;
  username: string;
  date: string;
  bonus: number;
}

// ============================================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================================
const App: React.FC = () => {
  // ------------------------------------------------------------
  // СОСТОЯНИЯ
  // ------------------------------------------------------------
  const [currentTab, setCurrentTab] = useState<'exchange' | 'inventory' | 'profile'>('exchange');
  const [tgUser, setTgUser] = useState<any>(null);

  // --- Обмен ---
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [exchangeStatus, setExchangeStatus] = useState<'idle' | 'ready' | 'processing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // --- Инвентарь ---
  const [inventory, setInventory] = useState<NFTItem[]>([
    { id: 1, name: 'Снежный Шар', rarity: 'Epic', price: 250, image: '❄️', status: 'available', mintNumber: '#1245' },
    { id: 2, name: 'Рождественская Елка', rarity: 'Rare', price: 180, image: '🎄', status: 'in_escrow', mintNumber: '#1246' },
    { id: 3, name: 'Красный Дракон', rarity: 'Legendary', price: 750, image: '🐉', status: 'available', mintNumber: '#1247' },
    { id: 4, name: 'Неоновый Сигнал', rarity: 'Rare', price: 210, image: '💡', status: 'available', mintNumber: '#1248' },
    { id: 5, name: 'Золотой Кубок', rarity: 'Legendary', price: 990, image: '🏆', status: 'transferred', mintNumber: '#1249' },
    { id: 6, name: 'Кибер-Панк Очки', rarity: 'Epic', price: 320, image: '🕶️', status: 'in_escrow', mintNumber: '#1250' },
  ]);

  // --- Каталог всех NFT ---
  const allNFTs: NFTItem[] = [
    { id: 101, name: 'Снежный Шар', rarity: 'Epic', price: 250, image: '❄️', status: 'available', mintNumber: '#1245' },
    { id: 102, name: 'Рождественская Елка', rarity: 'Rare', price: 180, image: '🎄', status: 'available', mintNumber: '#1246' },
    { id: 103, name: 'Красный Дракон', rarity: 'Legendary', price: 750, image: '🐉', status: 'available', mintNumber: '#1247' },
    { id: 104, name: 'Неоновый Сигнал', rarity: 'Rare', price: 210, image: '💡', status: 'available', mintNumber: '#1248' },
    { id: 105, name: 'Золотой Кубок', rarity: 'Legendary', price: 990, image: '🏆', status: 'available', mintNumber: '#1249' },
    { id: 106, name: 'Кибер-Панк Очки', rarity: 'Epic', price: 320, image: '🕶️', status: 'available', mintNumber: '#1250' },
    { id: 107, name: 'Розовый Фламинго', rarity: 'Rare', price: 160, image: '🦩', status: 'available', mintNumber: '#1251' },
    { id: 108, name: 'Звездная Пыль', rarity: 'Epic', price: 280, image: '✨', status: 'available', mintNumber: '#1252' },
  ];

  // --- История сделок ---
  const [dealHistory, setDealHistory] = useState<DealHistory[]>([
    { id: 1, nftName: 'Красный Дракон', from: '@john_doe', to: '@jane_smith', date: '12.07.2026', status: 'completed' },
    { id: 2, nftName: 'Золотой Кубок', from: '@mike_rogers', to: '@alex_johnson', date: '10.07.2026', status: 'completed' },
  ]);

  // --- Профиль ---
  const [referrals, setReferrals] = useState<Referral[]>([
    { id: 1, username: '@friend_one', date: '01.07.2026', bonus: 15 },
    { id: 2, username: '@friend_two', date: '03.07.2026', bonus: 10 },
    { id: 3, username: '@friend_three', date: '05.07.2026', bonus: 20 },
  ]);
  const [referralBonus, setReferralBonus] = useState(45);
  const [referralLink, setReferralLink] = useState('t.me/safehold_garant_bot?start=ref_12345');
  const [copyStatus, setCopyStatus] = useState('');

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
  // ЛОГИКА ОБМЕНА
  // ------------------------------------------------------------
  const handleSelectNFT = (nft: NFTItem) => {
    setSelectedNFT(nft);
    setExchangeStatus('idle');
    setProgress(0);
  };

  const handleInitiateExchange = () => {
    if (!selectedNFT || !recipientUsername) {
      alert('Пожалуйста, выберите NFT и укажите получателя');
      return;
    }

    setIsLoading(true);
    setExchangeStatus('processing');
    setProgress(0);

    // Симуляция прогресса
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Завершаем обмен
          const updatedInventory = inventory.map(item =>
            item.id === selectedNFT.id ? { ...item, status: 'transferred' } : item
          );
          setInventory(updatedInventory);

          // Добавляем в историю
          const newDeal: DealHistory = {
            id: Date.now(),
            nftName: selectedNFT.name,
            from: tgUser?.username || 'anonymous',
            to: recipientUsername,
            date: new Date().toLocaleDateString('ru-RU'),
            status: 'completed'
          };
          setDealHistory([newDeal, ...dealHistory]);

          setExchangeStatus('completed');
          setIsLoading(false);
          setSelectedNFT(null);
          setRecipientUsername('');
          return 100;
        }
        return prev + 5;
      });
    }, 80);
  };

  // ------------------------------------------------------------
  // ЛОГИКА РЕФЕРАЛКИ
  // ------------------------------------------------------------
  const handleCopyReferralLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink).then(() => {
        setCopyStatus('Скопировано!');
        setTimeout(() => setCopyStatus(''), 3000);
      }).catch(() => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopyStatus('Скопировано!');
        setTimeout(() => setCopyStatus(''), 3000);
      });
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyStatus('Скопировано!');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  };

  // ------------------------------------------------------------
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ------------------------------------------------------------
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#6b7280';
      case 'Rare': return '#3b82f6';
      case 'Epic': return '#8b5cf6';
      case 'Legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'in_escrow': return '#00f3ff';
      case 'transferred': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Доступен';
      case 'in_escrow': return 'В сейфе гаранта';
      case 'transferred': return 'Передан';
      default: return status;
    }
  };

  // ------------------------------------------------------------
  // РЕНДЕР ВКЛАДОК
  // ------------------------------------------------------------
  const renderExchangeTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00f3ff', letterSpacing: '-0.5px' }}>
        🤝 Создать сделку
      </div>

      {/* Трехполосная витрина */}
      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px', alignItems: 'stretch' }}>
          {/* Отправитель */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: '#1a142f', borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid #231c3c' }}>
              <div style={{ fontSize: '32px' }}>{tgUser?.first_name?.[0] || '👤'}</div>
              <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: '500' }}>@{tgUser?.username || 'you'}</div>
            </div>
            <div style={{
              background: exchangeStatus === 'ready' || exchangeStatus === 'completed' ? '#10b98120' : '#1a142f',
              border: `1px solid ${exchangeStatus === 'ready' || exchangeStatus === 'completed' ? '#10b981' : '#231c3c'}`,
              borderRadius: '12px',
              padding: '8px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: exchangeStatus === 'ready' || exchangeStatus === 'completed' ? '#10b981' : '#6b7280',
              transition: 'all 0.3s'
            }}>
              {exchangeStatus === 'ready' || exchangeStatus === 'completed' ? '🟢 ГОТОВ' : '⏳ ОЖИДАНИЕ'}
            </div>
          </div>

          {/* Центр - выбранный NFT */}
          <div style={{
            background: '#1a142f',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: selectedNFT ? `2px solid ${getRarityColor(selectedNFT.rarity)}` : '2px dashed #231c3c',
            transition: 'all 0.4s',
            boxShadow: selectedNFT ? `0 0 30px ${getRarityColor(selectedNFT.rarity)}40` : 'none',
            minHeight: '100px'
          }}>
            {selectedNFT ? (
              <>
                <div style={{ fontSize: '48px', animation: 'pulseGlow 2s infinite' }}>{selectedNFT.image}</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', marginTop: '4px' }}>{selectedNFT.name}</div>
                <div style={{ fontSize: '12px', color: getRarityColor(selectedNFT.rarity) }}>{selectedNFT.rarity}</div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>Mint {selectedNFT.mintNumber}</div>
              </>
            ) : (
              <div style={{ color: '#6b7280', fontSize: '14px' }}>Выберите NFT ниже</div>
            )}
          </div>

          {/* Получатель */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
              placeholder="@username"
              style={{
                width: '100%',
                background: '#1a142f',
                border: '1px solid #231c3c',
                borderRadius: '12px',
                padding: '12px',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.border = '1px solid #00f3ff'}
              onBlur={(e) => e.currentTarget.style.border = '1px solid #231c3c'}
            />
            <div style={{
              background: '#1a142f',
              border: '1px solid #231c3c',
              borderRadius: '12px',
              padding: '8px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#6b7280'
            }}>
              ⏳ ОЖИДАНИЕ ТОВАРА
            </div>
          </div>
        </div>
      </div>

      {/* Каталог NFT */}
      <div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#bf77ff', marginBottom: '12px' }}>
          🎁 Выбрать NFT для обмена
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {allNFTs.map(nft => (
            <div
              key={nft.id}
              onClick={() => handleSelectNFT(nft)}
              style={{
                background: selectedNFT?.id === nft.id ? '#00f3ff20' : '#141023',
                border: selectedNFT?.id === nft.id ? `2px solid #00f3ff` : '1px solid #231c3c',
                borderRadius: '16px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: selectedNFT?.id === nft.id ? '0 0 20px rgba(0, 243, 255, 0.2)' : 'none'
              }}
              onMouseEnter={(e) => { if (selectedNFT?.id !== nft.id) e.currentTarget.style.border = '1px solid #00f3ff40'; }}
              onMouseLeave={(e) => { if (selectedNFT?.id !== nft.id) e.currentTarget.style.border = '1px solid #231c3c'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '28px' }}>{nft.image}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>{nft.name}</div>
                  <div style={{ fontSize: '10px', color: getRarityColor(nft.rarity) }}>{nft.rarity}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280' }}>{nft.price} USDT</div>
                </div>
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>Mint {nft.mintNumber}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка действия и прогресс */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {isLoading && (
          <div style={{ width: '100%', background: '#1a142f', borderRadius: '12px', height: '6px', overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00f3ff, #bf77ff)',
              transition: 'width 0.1s linear'
            }} />
          </div>
        )}
        <button
          onClick={handleInitiateExchange}
          disabled={isLoading || !selectedNFT || !recipientUsername}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #00f3ff, #bf77ff)',
            color: '#000000',
            fontWeight: 'bold',
            fontSize: '18px',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            cursor: isLoading || !selectedNFT || !recipientUsername ? 'not-allowed' : 'pointer',
            opacity: isLoading || !selectedNFT || !recipientUsername ? 0.5 : 1,
            boxShadow: '0 0 30px rgba(0, 243, 255, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && selectedNFT && recipientUsername) {
              e.currentTarget.style.boxShadow = '0 0 50px rgba(0, 243, 255, 0.5)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 243, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isLoading ? `Обмен ${progress}%` : '🚀 Инициировать NFT Обмен'}
        </button>
      </div>

      {/* История сделок */}
      <div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginBottom: '12px' }}>
          📋 История обменов
        </div>
        {dealHistory.length === 0 ? (
          <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#6b7280' }}>
            Нет завершенных сделок
          </div>
        ) : (
          dealHistory.map(deal => (
            <div key={deal.id} style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '12px', padding: '12px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#ffffff' }}>{deal.nftName}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{deal.from} → {deal.to}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#10b981' }}>✅ {deal.status === 'completed' ? 'Завершена' : 'В процессе'}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280' }}>{deal.date}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderInventoryTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', letterSpacing: '-0.5px' }}>
        🎒 Инвентарь
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {inventory.map(item => (
          <div key={item.id} style={{
            background: '#141023',
            border: `1px solid ${getRarityColor(item.rarity)}40`,
            borderRadius: '16px',
            padding: '12px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 30% 30%, ${getRarityColor(item.rarity)}10, transparent 70%)`,
              pointerEvents: 'none'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div style={{ fontSize: '48px', marginBottom: '4px' }}>{item.image}</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: getRarityColor(item.rarity) }}>{item.rarity}</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>Mint {item.mintNumber}</div>
              <div style={{
                fontSize: '12px',
                marginTop: '8px',
                padding: '4px 16px',
                borderRadius: '20px',
                background: `${getStatusColor(item.status)}20`,
                color: getStatusColor(item.status),
                border: `1px solid ${getStatusColor(item.status)}30`
              }}>
                {getStatusLabel(item.status)}
              </div>
              {item.status === 'available' && (
                <button
                  onClick={() => {
                    setCurrentTab('exchange');
                    const nftFromInventory = allNFTs.find(n => n.name === item.name);
                    if (nftFromInventory) handleSelectNFT(nftFromInventory);
                  }}
                  style={{
                    marginTop: '8px',
                    background: '#00f3ff20',
                    color: '#00f3ff',
                    border: '1px solid #00f3ff40',
                    borderRadius: '12px',
                    padding: '6px 16px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#00f3ff30'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#00f3ff20'}
                >
                  Выбрать для сделки
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#bf77ff', letterSpacing: '-0.5px' }}>
        👤 Профиль
      </div>

      {/* Аватар и основная информация */}
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
          width: '96px',
          height: '96px',
          margin: '0 auto',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00f3ff, #bf77ff)',
          padding: '3px',
          boxShadow: '0 0 40px rgba(0, 243, 255, 0.4)',
          animation: 'pulseGlow 3s infinite'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#141023',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
            {tgUser?.first_name?.[0] || tgUser?.username?.[0] || 'U'}
          </div>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginTop: '12px' }}>
          {tgUser?.first_name || 'Пользователь'} {tgUser?.last_name || ''}
        </div>
        <div style={{ color: '#6b7280', fontSize: '14px' }}>@{tgUser?.username || 'нет_username'}</div>
        <div style={{
          display: 'inline-block',
          marginTop: '8px',
          background: '#bf77ff20',
          color: '#bf77ff',
          border: '1px solid #bf77ff40',
          padding: '2px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ⭐ VIP Верифицирован
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
          <div>
            <div style={{ color: '#fbbf24', fontSize: '18px' }}>⭐ 5.0</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Рейтинг</div>
          </div>
          <div>
            <div style={{ color: '#10b981', fontSize: '18px' }}>100%</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Успешность</div>
          </div>
          <div>
            <div style={{ color: '#00f3ff', fontSize: '18px' }}>{dealHistory.length}</div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>Обменов</div>
          </div>
        </div>
      </div>

      {/* Реферальная система */}
      <div style={{ background: '#141023', border: '1px solid #231c3c', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '12px' }}>
          🔗 Пригласи друга
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a142f', borderRadius: '12px', padding: '8px 12px', marginBottom: '8px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>💰 Заработано бонусов</span>
          <span style={{ color: '#00f3ff', fontWeight: 'bold', fontSize: '16px' }}>{referralBonus} USDT</span>
        </div>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
          Приглашенные друзья:
        </div>
        {referrals.map(ref => (
          <div key={ref.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #231c3c', padding: '6px 0' }}>
            <span style={{ color: '#ffffff', fontSize: '14px' }}>{ref.username}</span>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>{ref.date} • +{ref.bonus} USDT</span>
          </div>
        ))}
      </div>

      {/* Поддержка */}
      <button
        onClick={() => window.open('https://t.me/SafeHold_Support', '_blank')}
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
        📞 Связаться с Арбитражем (@SafeHold_Support)
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
            🔐 SafeHold NFT
          </div>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>v3.0</div>
        </div>

        {currentTab === 'exchange' && renderExchangeTab()}
        {currentTab === 'inventory' && renderInventoryTab()}
        {currentTab === 'profile' && renderProfileTab()}
      </div>

      {/* Нижний таб-бар - 3 кнопки */}
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
        padding: '12px 8px',
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        borderRadius: '24px 24px 0 0'
      }}>
        {[
          { id: 'exchange', icon: '🤝', label: 'Создать сделку' },
          { id: 'inventory', icon: '🎒', label: 'Инвентарь' },
          { id: 'profile', icon: '👤', label: 'Профиль' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as any)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 16px',
              borderRadius: '16px',
              background: currentTab === tab.id ? '#00f3ff20' : 'transparent',
              border: currentTab === tab.id ? '1px solid #00f3ff40' : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s',
              flex: 1,
              maxWidth: '120px'
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
            <span style={{ fontSize: '28px' }}>{tab.icon}</span>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              marginTop: '4px',
              color: currentTab === tab.id ? '#00f3ff' : '#6b7280',
              transition: 'color 0.3s'
            }}>
              {tab.label}
            </span>
            {currentTab === tab.id && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#00f3ff',
                marginTop: '4px',
                animation: 'pulseGlow 1.5s infinite'
              }} />
            )}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; box-shadow: 0 0 10px rgba(0, 243, 255, 0.2); }
          50% { opacity: 1; box-shadow: 0 0 30px rgba(0, 243, 255, 0.6); }
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
