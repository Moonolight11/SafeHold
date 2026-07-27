# SafeHold – Telegram Mini App Escrow

## Настройка
1. Клонируйте репозиторий.
2. Установите зависимости:
   - Backend: `pip install fastapi uvicorn sqlalchemy aiogram python-dotenv`
   - Frontend: `npm install`
3. Создайте `.env` с BOT_TOKEN и DATABASE_URL.
4. Запустите:
   - Backend: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
   - Bot: `python bot/bot.py`
   - Frontend: `npm run dev`
