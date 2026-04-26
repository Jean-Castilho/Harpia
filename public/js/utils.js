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
        return true; // Adicionado com sucesso
    }
    return false; // Já estava nos favoritos
}

export function removeLocalStorageFavorite(productId) {
    let favorites = getLocalStorageFavorites();
    favorites = favorites.filter(id => id !== productId);
    setLocalStorageFavorites(favorites);
    return true; // Removido com sucesso
}

// --- Função para exibir notificações ---
export function showNotification(message, isSuccess, notificationElementId) {
    const notification = document.getElementById(notificationElementId);
    if (!notification) {
        console.error(`Elemento de notificação com ID '${notificationElementId}' não encontrado.`);
        return;
    }
    notification.textContent = message;
    notification.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545';
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}