import { initFavoriteButtons, syncLocalFavoritesToServer, safeNotify } from '/js/favorites.js'; // Assumindo que safeNotify foi movido para utils.js e re-exportado por favorites.js ou importado diretamente de utils.js

async function initHomePage() {
  const serverDataElement = document.getElementById('server-data-home');
  if (!serverDataElement) return;

  const serverData = JSON.parse(serverDataElement.textContent);
  const isAuthenticated = serverData.isAuthenticated;
  const csrfToken = serverData.csrfToken;

  // Inicializa botões de favorito (módulo reutilizável);
  initFavoriteButtons({ isAuthenticated, csrfToken });

  // Sincroniza favoritos locais com o servidor após login;
  if (isAuthenticated) {
    try {
      const res = await syncLocalFavoritesToServer(csrfToken);
      if (res && res.synced && res.synced > 0) {
        safeNotify(`${res.synced} favoritos sincronizados.`, true);
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
        safeNotify('faça login e tente novamente.', false);
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
        safeNotify(result.message, result.success);

        if (result.success) {
          button.classList.add('in-cart');
          const icon = button.querySelector('i');
          if (icon) icon.textContent = 'shopping_cart_checkout';
        }
      } catch (error) { // Usar safeNotify aqui também
        safeNotify('Erro ao adicionar ao carrinho. Tente novamente.', false);
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage);
} else {
  initHomePage();
}
