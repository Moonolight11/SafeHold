import os
from aiogram import Bot, Dispatcher, types
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.contrib.middlewares.logging import LoggingMiddleware
import asyncio

BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN")
APP_URL = os.getenv("APP_URL", "https://your-frontend.vercel.app")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(bot)
dp.middleware.setup(LoggingMiddleware())

@dp.message_handler(commands=['start'])
async def start_cmd(message: types.Message):
    kb = InlineKeyboardMarkup(row_width=1)
    kb.add(InlineKeyboardButton("🚀 Launch SafeHold Escrow", web_app=types.WebAppInfo(url=APP_URL)))
    await message.answer("Добро пожаловать в SafeHold! Нажмите кнопку ниже, чтобы открыть гарант-платформу.", reply_markup=kb)

@dp.callback_query_handler(lambda c: c.data.startswith("deal_"))
async def deal_callback(callback_query: types.CallbackQuery):
    deal_id = callback_query.data.split("_")[1]
    kb = InlineKeyboardMarkup(row_width=1)
    kb.add(InlineKeyboardButton("📋 Открыть сделку", web_app=types.WebAppInfo(url=f"{APP_URL}/deal/{deal_id}")))
    await bot.send_message(callback_query.from_user.id, f"Сделка #{deal_id} готова к просмотру.", reply_markup=kb)
    await callback_query.answer()

if __name__ == "__main__":
    from aiogram import executor
    executor.start_polling(dp, skip_updates=True)
