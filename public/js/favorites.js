import { getLocalStorageFavorites, addLocalStorageFavorite, removeLocalStorageFavorite, setLocalStorageFavorites, safeNotify, postJson } from '/js/utils.js';

export const FAVORITES_MESSAGES = {
  added_local: 'Produto adicionado aos favoritos.',
  already_local: 'Produto já estava nos favoritos.',
  removed_local: 'Produto removido dos favoritos.',
  added_server: 'Produto adicionado aos favoritos.',
  removed_server: 'Produto removido dos favoritos.',
  sync_success: 'Favoritos sincronizados.',
  sync_error: 'Não foi possível sincronizar os favoritos.'
};

// Estado global para rastrear sincronização
let isSyncingFavorites = false;

export function initFavoriteButtons({ selector = '.favorite-btn', isAuthenticated = false, csrfToken = null } = {}) {
  const buttons = document.querySelectorAll(selector);
  if (!buttons || buttons.length === 0) return;

  // Rastrear botões em processamento para evitar múltiplos cliques;
  const processingButtons = new Set();

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
      if (!productId || processingButtons.has(productId)) return;

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

      // Adiciona feedback visual de loading e desabilita o botão
      processingButtons.add(productId);
      button.style.opacity = '0.6';
      button.style.pointerEvents = 'none';
      button.style.cursor = 'wait';

      try {
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
      } catch (error) {
        console.error('Erro ao processar favorito:', error);
        safeNotify('Erro ao processar favorito. Tente novamente.', false);
      } finally {
        // Remove feedback visual e reabilita o botão
        processingButtons.delete(productId);
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
        button.style.cursor = 'pointer';
      }
    });
  });
}

export async function syncLocalFavoritesToServer(csrfToken, { silent = true } = {}) {
  const localFavs = getLocalStorageFavorites();
  if (!localFavs.length) return { synced: 0 };

  if (isSyncingFavorites) return { synced: 0 };
  isSyncingFavorites = true;

  const productIds = [...new Set(localFavs)];
  let synced = 0;

  for (const productId of productIds) {
    try {
      const result = await postJson('/auth/favorites/add', { productId }, csrfToken);
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
      safeNotify(`${synced} favoritos sincronizados com sucesso!`, true, 3000);
    } else if (productIds.length > 0) {
      safeNotify(FAVORITES_MESSAGES.sync_error, false);
    }
  }

  isSyncingFavorites = false;
  return { synced };
}

/**
 * Sincroniza favoritos locais quando o usuário faz login
 * Deve ser chamada após autenticação bem-sucedida
 * @param {string} csrfToken - Token CSRF para requisições
 */
export async function syncFavoritesOnLogin(csrfToken) {
  return syncLocalFavoritesToServer(csrfToken, { silent: false });
}
