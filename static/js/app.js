const initData = window.Telegram.WebApp.initDataUnsafe;
const userId = initData.user?.id;
const userName = initData.user?.first_name || "Неизвестный пользователь";


function detectTheme() {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    return darkModeQuery.matches ? 'dark' : 'light';
}


const currentTheme = detectTheme();
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
} else {
    document.body.classList.add('light-theme');
}

if (userId) {
    fetch('/get-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: userId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('greeting').innerText = `Привет, ${data.name}!`;
            setTimeout(() => {
            document.getElementById('greeting-container').style.display = 'none';
            const mainForm = document.getElementById('main-form');
            mainForm.classList.add('visible');
        }, 1500);
        } else {
            document.getElementById('greeting').innerText = 'Пользователь не найден.';
        }
    })
    .catch(error => {
        document.getElementById('greeting').innerText = 'Ошибка подключения.';
        console.error(error);
    });
} else {
    document.getElementById('greeting').innerText = 'Ошибка получения данных Telegram.';
}


document.getElementById('expense-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        date: formData.get('date'),
        amount: formData.get('amount'),
        expense_item: formData.get('expense_item'),
        spender: formData.get('spender') || userName
    };

    fetch('/save-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Данные успешно сохранены!');
            // Очистить форму или показать сообщение
            event.target.reset();
        } else {
            alert('Ошибка при сохранении данных');
        }
    })
    .catch(error => {
        console.error('Ошибка при отправке данных:', error);
        alert('Ошибка подключения');
    });
});

const SHEET_ID = "1bgfPwBe9vqXnFF8QXo9_oeaOW886T7Z9CHSgYEmwPF0";
const API_KEY = "AIzaSyC5o_tzqjoK0AVTE73x4DI4RfeJiK5P2Tc";


const EXPENSE_ITEMS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Expense!A:A?key=${API_KEY}`;
const SPENDERS_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Spenders!A:A?key=${API_KEY}`;
// https://sheets.googleapis.com/v4/spreadsheets/1bgfPwBe9vqXnFF8QXo9_oeaOW886T7Z9CHSgYEmwPF0/values/Expense!A:A?key=AIzaSyC5o_tzqjoK0AVTE73x4DI4RfeJiK5P2Tc




function populateDropdown(url, dropdownId) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById(dropdownId);
            dropdown.innerHTML = '';

            if (data.values && data.values.length > 0) {
                data.values.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item[0];
                    option.textContent = item[0];
                    dropdown.appendChild(option);
                });
            } else {
                console.error('Нет данных для этого листа');
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке данных:', error);
        });
}


populateDropdown(EXPENSE_ITEMS_URL, 'expense_item');
populateDropdown(SPENDERS_URL, 'spender');
