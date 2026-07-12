const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navOverlay = document.querySelector(".nav-overlay");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    navOverlay.classList.toggle("active");
});

document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    navOverlay.classList.remove("active");
}));

navOverlay.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    navOverlay.classList.remove("active");
});

const NOTIFICATION_CONTAINER_ID = 'notification-root';

function createNotificationContainer() {
    let container = document.getElementById(NOTIFICATION_CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = NOTIFICATION_CONTAINER_ID;
        Object.assign(container.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '1050',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'flex-end',
            pointerEvents: 'none'
        });
        document.body.appendChild(container);
    }
    return container;
};

function showNotification(message, type = 'info', duration = 3000) {
    const container = createNotificationContainer();
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = [
        'min-width: 220px',
        'max-width: 320px',
        'padding: 12px 16px',
        'border-radius: 10px',
        'color: #fff',
        'background-color: #007bff',
        'box-shadow: 0 10px 30px rgba(0,0,0,0.15)',
        'font-size: 0.95rem',
        'line-height: 1.4',
        'opacity: 0',
        'transform: translateY(-10px)',
        'transition: opacity 200ms ease, transform 200ms ease',
        'pointer-events: auto'
    ].join(';');

    switch (type) {
        case 'success':
            toast.style.backgroundColor = '#28a745';
            break;
        case 'error':
            toast.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            toast.style.backgroundColor = '#ffc107';
            toast.style.color = '#212529';
            break;
        case 'info':
        default:
            toast.style.backgroundColor = '#007bff';
            break;
    }

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            toast.remove();
        }, 200);
    }, duration);
};
 
window.NotificationSystem = {
    show: showNotification,
    success: (message, duration) => showNotification(message, 'success', duration),
    error: (message, duration) => showNotification(message, 'error', duration),
    warning: (message, duration) => showNotification(message, 'warning', duration),
    info: (message, duration) => showNotification(message, 'info', duration)
};
