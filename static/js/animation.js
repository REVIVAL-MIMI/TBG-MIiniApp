document.addEventListener('DOMContentLoaded', function() {
    const greeting = document.getElementById('preloader');
    const content = document.getElementById('content');

    setTimeout(() => {

        greeting.classList.remove('active');
        greeting.classList.add('hidden');

        content.classList.add('active');

        setTimeout(() => {
            content.classList.add('fade-out');

            setTimeout(() => {
                window.location.href = 'next.html';
            }, 500) // Время для завершения fadeOut анимации

        }, 1500); // Задержка перед началом анимации перехода
    }, 2000);
});
