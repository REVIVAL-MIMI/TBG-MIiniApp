const initData = window.Telegram.WebApp.initDataUnsafe;
const userId = initData.user?.id;
const userName = initData.user?.first_name || "Неизвестный пользователь"; // Имя пользователя по умолчанию

// Функция для определения темы
function detectTheme() {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    return darkModeQuery.matches ? 'dark' : 'light';
}

// Устанавливаем тему в body
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
        } else {
            document.getElementById('greeting').innerText = 'Пользователь не найден.';
        }

        // После того как приветствие отображено, скрываем его и показываем основную форму с анимацией
        setTimeout(() => {
            document.getElementById('greeting-container').style.display = 'none'; // Скрываем контейнер с приветствием
            const mainForm = document.getElementById('main-form');
            mainForm.classList.add('visible'); // Показываем основную форму с плавным переходом
        }, 1500); // Задержка перед показом основной формы (можно настроить)
    })
    .catch(error => {
        document.getElementById('greeting').innerText = 'Ошибка подключения.';
        console.error(error);
    });
} else {
    document.getElementById('greeting').innerText = 'Ошибка получения данных Telegram.';
}

// Отправка данных формы
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
