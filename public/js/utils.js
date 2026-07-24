// public/js/utils.js

// --- Funções para gerenciar favoritos no localStorage ---
export function getLocalStorageFavorites() {
    const favorites = localStorage.getItem('localFavorites');
    return favorites ? JSON.parse(favorites) : [];
}

export function setLocalStorageFavorites(favorites) {
    localStorage.setItem('localFavorites', JSON.stringify(favorites));
}

export function addLocalStorageFavorite(productId) {
    const favorites = getLocalStorageFavorites();
    if (!favorites.includes(productId)) {
        favorites.push(productId);
        setLocalStorageFavorites(favorites);
        return true; // Adicionado com sucesso;
    }
    return false; // Já estava nos favoritos;
}

export function removeLocalStorageFavorite(productId) {
    let favorites = getLocalStorageFavorites();
    favorites = favorites.filter(id => id !== productId);
    setLocalStorageFavorites(favorites);
    return true; // Removido com sucesso;
}

// --- Funções de Comunicação e UI ---

/**
 * Exibe uma notificação usando o sistema global.
 * @param {string} message - A mensagem a ser exibida.
 * @param {boolean} isSuccess - True para sucesso (verde), false para erro (vermelho).
 * @param {number} [duration] - Duração opcional em milissegundos.
 */
export function safeNotify(message, isSuccess, duration) {
    if (!message) return;
    if (window.NotificationSystem) {
        const type = isSuccess ? 'success' : 'error';
        window.NotificationSystem.show(message, type, duration);
    } else {
        consoleisSuccess ? 'log' : 'error';
    }
}

/**
 * Realiza uma requisição POST com corpo JSON e token CSRF.
 * @param {string} url - A URL do endpoint.
 * @param {object} body - O corpo da requisição.
 * @param {string} csrfToken - O token CSRF.
 * @returns {Promise<{ok: boolean, status: number, data: object}>}
 */
export async function postJson(url, body, csrfToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (csrfToken) headers['x-csrf-token'] = csrfToken;

    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), credentials: 'include' });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
}