import { getLocalStorageFavorites, addLocalStorageFavorite, removeLocalStorageFavorite, setLocalStorageFavorites } from '/js/utils.js';

export const FAVORITES_MESSAGES = {
  added_local: 'Produto adicionado aos favoritos (local).',
  already_local: 'Produto já estava nos favoritos (local).',
  removed_local: 'Produto removido dos favoritos (local).',
  added_server: 'Produto adicionado aos favoritos.',
  removed_server: 'Produto removido dos favoritos.',
  sync_success: 'Favoritos sincronizados.',
  sync_error: 'Não foi possível sincronizar os favoritos.'
};

function safeNotify(message, isSuccess, duration) {
  if (!message) return;
  if (window.NotificationSystem) {
    if (typeof duration === 'number') {
      window.NotificationSystem.show(message, isSuccess ? 'success' : 'error', duration);
    } else {
      window.NotificationSystem.show(message, isSuccess ? 'success' : 'error');
    }
    return;
  }
  console[isSuccess ? 'log' : 'error'](message);
}

async function postJson(url, body, csrfToken) {
  const headers = { 'Content-Type': 'application/json' };
  if (csrfToken) headers['x-csrf-token'] = csrfToken;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    credentials: 'include'
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export function initFavoriteButtons({ selector = '.favorite-btn', isAuthenticated = false, csrfToken = null } = {}) {
  const buttons = document.querySelectorAll(selector);
  if (!buttons || buttons.length === 0) return;

  if (!isAuthenticated) {
    const localFavs = getLocalStorageFavorites();
    buttons.forEach(btn => {
      if (localFavs.includes(btn.dataset.productId)) {
        btn.classList.add('favorited');
        const icon = btn.querySelector('i');
        if (icon) icon.textContent = 'favorite';
      }
    });
  }

  buttons.forEach(button => {
    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const productId = button.dataset.productId;
      if (!productId) return;

      const currentlyFavorited = button.classList.contains('favorited');

      if (!isAuthenticated) {
        if (currentlyFavorited) {
          removeLocalStorageFavorite(productId);
          safeNotify(FAVORITES_MESSAGES.removed_local, true);
        } else {
          const added = addLocalStorageFavorite(productId);
          safeNotify(added ? FAVORITES_MESSAGES.added_local : FAVORITES_MESSAGES.already_local, added);
        }
        button.classList.toggle('favorited');
        const icon = button.querySelector('i');
        if (icon) icon.textContent = currentlyFavorited ? 'favorite_border' : 'favorite';
        return;
      }

      const url = currentlyFavorited ? '/auth/favorites/remove' : '/auth/favorites/add';
      const result = await postJson(url, { productId, _csrf: csrfToken }, csrfToken);
      const success = result.ok && result.data && result.data.success;

      if (success) {
        button.classList.toggle('favorited');
        const icon = button.querySelector('i');
        if (icon) icon.textContent = currentlyFavorited ? 'favorite_border' : 'favorite';
        safeNotify(result.data.message || (currentlyFavorited ? FAVORITES_MESSAGES.removed_server : FAVORITES_MESSAGES.added_server), true);
      } else {
        safeNotify(result.data?.message || 'Erro ao atualizar favoritos.', false);
      }
    });
  });
}

export async function syncLocalFavoritesToServer(csrfToken, { silent = true } = {}) {
  const localFavs = getLocalStorageFavorites();
  if (!localFavs.length) return { synced: 0 };

  const productIds = [...new Set(localFavs)];
  let synced = 0;

  for (const productId of productIds) {
    try {
      const result = await postJson('/auth/favorites/add', { productId, _csrf: csrfToken }, csrfToken);
      if (result.ok && result.data && result.data.success) {
        synced += 1;
      }
    } catch (error) {
      console.error('Erro ao sincronizar favorito', productId, error);
    }
  }

  if (synced > 0) {
    setLocalStorageFavorites([]);
  }

  if (!silent) {
    if (synced > 0) {
      safeNotify(`${synced} ${FAVORITES_MESSAGES.sync_success}`, true);
    } else {
      safeNotify(FAVORITES_MESSAGES.sync_error, false);
    }
  }

  return { synced };
}
