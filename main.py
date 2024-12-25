from telegram import Update, KeyboardButton, ReplyKeyboardMarkup, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackContext
import asyncpg
import logging

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.INFO)
logger = logging.getLogger(__name__)

async def get_db_connection():
    conn = await asyncpg.connect(
        user="postgres",
        password="1488",
        database="tbg",
        host="tbg-db-admin07237.db-msk0.amvera.tech"
    )
    return conn

async def is_user_registered(tg_id: str) -> bool:
    conn = await get_db_connection()
    result = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM users WHERE tg_id = $1)", tg_id)
    await conn.close()
    return result

async def start(update: Update, context: CallbackContext) -> None:
    user = update.message.from_user
    tg_id = str(user.id)


    registered = await is_user_registered(tg_id)

    if registered:

        keyboard = [
            [InlineKeyboardButton("Открыть приложение", url="https://t.me/TBG123_bot/TBG_miniApp07")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text("Добро пожаловать! Откройте приложение:", reply_markup=reply_markup)
    else:
        keyboard = [
            [KeyboardButton("Поделиться номером телефона", request_contact=True)]
        ]
        reply_markup = ReplyKeyboardMarkup(keyboard, one_time_keyboard=True)
        await update.message.reply_text("Зарегистрироваться:", reply_markup=reply_markup)

async def handle_contact(update: Update, context: CallbackContext) -> None:
    user = update.message.from_user
    phone_number = update.message.contact.phone_number
    tg_id = str(user.id)
    first_name = user.first_name

    try:
        conn = await get_db_connection()
        await conn.execute(
            "INSERT INTO users (phone_number, tg_id, first_name) VALUES ($1, $2, $3)",
            phone_number, tg_id, first_name
        )
        await conn.close()

        keyboard = [
            [InlineKeyboardButton("Открыть приложение", url="https://t.me/TBG123_bot/TBG_miniApp07")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await update.message.reply_text(
            f"Спасибо за регистрацию, {first_name}! Ваш номер {phone_number} успешно зарегистрирован.",
            reply_markup=reply_markup
        )
    except Exception as e:
        keyboard = [
            [InlineKeyboardButton("Открыть приложение", url="https://t.me/TBG123_bot/TBG_miniApp07")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)

        await update.message.reply_text("Вы уже зарегестрированы!",reply_markup=reply_markup)

async def help_command(update: Update, context: CallbackContext) -> None:
    await update.message.reply_text('Для регистрации используйте кнопку "Поделиться номером телефона".')

def main() -> None:
    token = "7730435576:AAHrenVphhzLK6jnTcFVGKT5seNaQPU7HSs"

    application = Application.builder().token(token).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.CONTACT, handle_contact))
    application.add_handler(CommandHandler("help", help_command))

    application.run_polling()

if __name__ == '__main__':
    main()
