import { initFavoriteButtons, syncLocalFavoritesToServer } from '/js/favorites.js';

function showNotification(message, isSuccess) {
  window.NotificationSystem?.show(message, isSuccess ? 'success' : 'error');
}

async function initHomePage() {
  const serverDataElement = document.getElementById('server-data-home');
  if (!serverDataElement) return;

  const serverData = JSON.parse(serverDataElement.textContent);
  const isAuthenticated = serverData.isAuthenticated;
  const csrfToken = serverData.csrfToken;

  // Inicializa botões de favorito (módulo reutilizável)
  initFavoriteButtons({ isAuthenticated, csrfToken });

  // Sincroniza favoritos locais com o servidor após login
  if (isAuthenticated) {
    try {
      const res = await syncLocalFavoritesToServer(csrfToken);
      if (res && res.synced && res.synced > 0) {
        showNotification(`${res.synced} favoritos sincronizados.`, true);
      }
    } catch (e) {
      console.error('Erro ao sincronizar favoritos locais:', e);
    }
  }

  const cartButtons = document.querySelectorAll('.add-to-cart-btn');
  cartButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();

      if (button.classList.contains('in-cart')) {
        window.location.href = '/cart';
        return;
      }

      if (!isAuthenticated) {
        showNotification('faça login e tente novamente.', false);
        return;
      }
      
      const productId = button.dataset.productId;
      if (!productId) return;

      try {
        const response = await fetch('/auth/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ productId, _csrf: csrfToken })
        });

        const result = await response.json();
        showNotification(result.message, result.success);

        if (result.success) {
          button.classList.add('in-cart');
          const icon = button.querySelector('i');
          if (icon) icon.textContent = 'shopping_cart_checkout';
        }
      } catch (error) {
        showNotification('erro tente novamente.', false);
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage);
} else {
  initHomePage();
}
