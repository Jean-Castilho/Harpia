import { getLocalStorageFavorites, addLocalStorageFavorite, removeLocalStorageFavorite } from '/js/utils.js';

const showHomeNotification = (message, isSuccess) => window.NotificationSystem?.show(message, isSuccess ? 'success' : 'error');

function initHomePage() {
  const serverDataElement = document.getElementById('server-data-home');
  if (!serverDataElement) return;

  const serverData = JSON.parse(serverDataElement.textContent);
  const isAuthenticated = serverData.isAuthenticated;
  const csrfToken = serverData.csrfToken;

  const favoriteButtons = document.querySelectorAll('.favorite-btn');
  favoriteButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const productId = button.dataset.productId;
      if (!productId) return;

      if (!isAuthenticated) {
        event.preventDefault();
        const isCurrentlyFavorited = button.classList.contains('favorited');

        if (isCurrentlyFavorited) {
          removeLocalStorageFavorite(productId);
          showHomeNotification('Produto removido dos favoritos (local).', true);
        } else {
          addLocalStorageFavorite(productId);
          showHomeNotification('Produto adicionado aos favoritos (local).', true);
        }

        button.classList.toggle('favorited');
        const icon = button.querySelector('i');
        if (icon) icon.textContent = isCurrentlyFavorited ? 'favorite_border' : 'favorite';
        return;
      }

      event.preventDefault();
      const isFavorited = button.classList.contains('favorited');
      const url = isFavorited ? '/auth/favorites/remove' : '/auth/favorites/add';

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken
          },
          body: JSON.stringify({ productId, _csrf: csrfToken })
        });

        const result = await response.json();
        showHomeNotification(result.message, response.ok);

        if (result.success) {
          button.classList.toggle('favorited');
          const icon = button.querySelector('i');
          if (icon) icon.textContent = isFavorited ? 'favorite_border' : 'favorite';
        }
      } catch (error) {
        showHomeNotification('Erro de conexão. Tente novamente.', false);
      }
    });
  });

  const cartButtons = document.querySelectorAll('.add-to-cart-btn');
  cartButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();

      if (button.classList.contains('in-cart')) {
        window.location.href = '/cart';
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
        showHomeNotification(result.message, result.success);

        if (result.success) {
          button.classList.add('in-cart');
          const icon = button.querySelector('i');
          if (icon) icon.textContent = 'shopping_cart_checkout';
        }
      } catch (error) {
        showHomeNotification('faça login e tente novamente.', false);
      }
    });
  });

  if (!isAuthenticated) {
    const localFavorites = getLocalStorageFavorites();
    favoriteButtons.forEach(button => {
      if (localFavorites.includes(button.dataset.productId)) {
        button.classList.add('favorited');
        const icon = button.querySelector('i');
        if (icon) icon.textContent = 'favorite';
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage);
} else {
  initHomePage();
}
