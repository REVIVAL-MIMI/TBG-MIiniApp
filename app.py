from flask import Flask, request, jsonify, send_from_directory
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

app = Flask(__name__)

DB_CONFIG = {
    'dbname': 'tbg',
    'user': 'postgres',
    'password': '1488',
    'host': 'tbg-db-admin07237.db-msk0.amvera.tech',
    'port': 5432
}

@app.route('/')
def index():
    today_date = datetime.today().strftime('%Y-%m-%d')
    return send_from_directory('templates', 'index.html')

@app.route('/get-user', methods=['POST'])
def get_user():
    print("Received request at /get-user")
    print(f"Request JSON: {request.json}")
    data = request.json

    if not data or 'telegramId' not in data:
        return jsonify({'success': False, 'message': 'No Telegram ID provided'})

    telegram_id = str(data['telegramId'])  # Преобразуем в строку для совместимости
    print(f"Telegram ID: {telegram_id}")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        print(f"Executing SQL: SELECT first_name FROM users WHERE tg_id = {telegram_id}")
        cursor.execute("SELECT first_name FROM users WHERE tg_id = %s", (telegram_id,))
        result = cursor.fetchone()
        print(f"Query result: {result}")
        if result:
            return jsonify({'success': True, 'name': result['first_name']})
        else:
            return jsonify({'success': False, 'message': 'User not found'})
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn:
            conn.close()

@app.route('/save-expense', methods=['POST'])
def save_expense():
    data = request.json

    date = data['date']
    amount = data['amount']
    expense_item = data['expense_item']
    spender = data['spender']

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO expenses (date, amount, expense_item, spender)
            VALUES (%s, %s, %s, %s)
        """, (date, amount, expense_item, spender))

        conn.commit()

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn:
            conn.close()

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
