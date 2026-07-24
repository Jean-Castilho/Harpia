// Header/Navigation Interactivity
(function() {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navOverlay = document.querySelector(".nav-overlay");
    const navLinks = document.querySelectorAll(".nav-link");

    // Verifica se os elementos essenciais do cabeçalho existem
    if (!hamburger || !navMenu || !navOverlay) {
        console.warn("Elementos do cabeçalho (hamburger, nav-menu, nav-overlay) não encontrados. A configuração da interatividade do cabeçalho será ignorada.");
        return;
    }

    // Atributos ARIA iniciais para acessibilidade
    hamburger.setAttribute("aria-expanded", "false");
    // Se o navMenu tiver um ID, use-o para aria-controls. Caso contrário, loga um aviso.
    if (navMenu.id) {
        hamburger.setAttribute("aria-controls", navMenu.id);
    } else {
        console.warn("O elemento '.nav-menu' não possui um ID. Considere adicionar um para melhor acessibilidade (aria-controls).");
    }
    navMenu.setAttribute("aria-hidden", "true");
    navOverlay.setAttribute("aria-hidden", "true");

    /**
     * Alterna o estado de abertura/fechamento do menu de navegação.
     */
    const toggleMenu = () => {
        const isExpanded = hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
        navOverlay.classList.toggle("active");
        hamburger.setAttribute("aria-expanded", isExpanded);
        navMenu.setAttribute("aria-hidden", !isExpanded);
        navOverlay.setAttribute("aria-hidden", !isExpanded);

        // Impede o scroll do corpo da página quando o menu está aberto
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = ''; // Restaura o scroll
        }
    };
    
    /**
     * Fecha o menu de navegação se estiver aberto.
     */
    const closeMenu = () => {
        if (hamburger.classList.contains("active")) {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
            navOverlay.classList.remove("active");
            
            hamburger.setAttribute("aria-expanded", "false");
            navMenu.setAttribute("aria-hidden", "true");
            navOverlay.setAttribute("aria-hidden", "true");
            document.body.style.overflow = ''; // Restaura o scroll
        }
    };
    /**
     * Adiciona a classe 'active' ao link de navegação correspondente à página atual.
     * Isso permite estilizar o link (e seus ícones) quando a página está ativa.
     */
    const highlightActiveNavLink = () => {
        const currentPath = window.location.pathname;
        navLinks.forEach(link => {
            // Remove a classe 'active' de todos os links primeiro para garantir que apenas um esteja ativo
            link.classList.remove('active');
            // Obtém o caminho do link, removendo a barra final se houver
            const linkPath = link.getAttribute('href')?.replace(/\/$/, '');
            const cleanedCurrentPath = currentPath.replace(/\/$/, '');
            // Verifica se o href do link corresponde ao caminho atual
            // Considera links como / ou /home como a página inicial
            if (linkPath === cleanedCurrentPath || (linkPath === '/' && cleanedCurrentPath === '/home')) {
                link.classList.add('active');
            }
        });
    };
    // Event Listeners
    hamburger.addEventListener("click", toggleMenu);
    navLinks.forEach(link => link.addEventListener("click", closeMenu));
    navOverlay.addEventListener("click", closeMenu);

    // Fecha o menu ao pressionar a tecla ESC
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && hamburger.classList.contains("active")) {
            closeMenu();
        }
    });
    // Chama a função para destacar o link ativo quando o DOM estiver completamente carregado
    document.addEventListener('DOMContentLoaded', highlightActiveNavLink);
    // Chama a função para destacar o link ativo após uma troca de conteúdo via HTMX
    document.body.addEventListener('htmx:afterSwap', highlightActiveNavLink);
})(); // Fim da IIFE de Interatividade do Cabeçalho/Navegação

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
