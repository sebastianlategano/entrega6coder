// buttonHandlers.js
document.addEventListener('DOMContentLoaded', function () {
    const btnHome = document.getElementById('btnHome');
    const btnRealTimeProducts = document.getElementById('btnRealTimeProducts');

    btnHome.addEventListener('click', function () {
        // Lógica para redirigir a la página Home
        window.location.href = '/home';  // Ajusta la ruta según tu configuración
    });

    btnRealTimeProducts.addEventListener('click', function () {
        // Lógica para redirigir a la página Real Time Products
        window.location.href = '/realTimeProducts';  // Ajusta la ruta según tu configuración
    });
});
