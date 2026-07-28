import { useEffect, useState } from 'react'

interface TelegramUser {
  id: number
  username?: string
  first_name?: string
  last_name?: string
  photo_url?: string
}

export const useTelegram = () => {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [haptic, setHaptic] = useState<any>(null)

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (!tg) return

    tg.expand()
    tg.ready()
    setTheme(tg.colorScheme || 'dark')
    setHaptic(tg.HapticFeedback)
    setUser(tg.initDataUnsafe?.user || null)

    tg.onEvent('themeChanged', () => setTheme(tg.colorScheme))
    return () => tg.offEvent('themeChanged')
  }, [])

  const impact = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if (haptic) haptic.impactOccurred(style)
  }

  return { user, theme, impact }
}
