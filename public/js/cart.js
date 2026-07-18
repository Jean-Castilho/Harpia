import { postJson, safeNotify } from '/js/utils.js';

const CART_MESSAGES = {
    added: 'Produto adicionado ao carrinho!',
    error: 'Erro ao adicionar produto ao carrinho.',
    login_required: 'Você precisa fazer login para adicionar itens ao carrinho.',
};

/**
 * Inicializa os botões "Adicionar ao Carrinho" em toda a página.
 * @param {object} options
 * @param {string} [options.selector='.add-to-cart-btn'] - O seletor para os botões de carrinho.
 * @param {boolean} [options.isAuthenticated=false] - Se o usuário está autenticado.
 * @param {string|null} [options.csrfToken=null] - O token CSRF para requisições.
 */
export function initCartButtons({ selector = '.add-to-cart-btn', isAuthenticated = false, csrfToken = null } = {}) {
    const buttons = document.querySelectorAll(selector);
    if (buttons.length === 0) return;

    const processingButtons = new Set();

    buttons.forEach(button => {
        button.addEventListener('click', async (event) => {
            event.preventDefault();
            const productId = button.dataset.productId;

            if (!productId || processingButtons.has(productId)) {
                return;
            }

            // Se o usuário não está logado, redireciona para a página de login.
            if (!isAuthenticated) {
                window.location.href = '/login';
                return;
            }

            // Se o botão já indica que o item está no carrinho, redireciona para o carrinho.
            if (button.classList.contains('in-cart') || button.textContent.includes('Ver no Carrinho')) {
                window.location.href = '/cart';
                return;
            }

            processingButtons.add(productId);
            button.disabled = true;
            button.style.opacity = '0.7';

            try {
                const result = await postJson('/auth/cart/add', { productId }, csrfToken);

                if (result.ok && result.data?.success) {
                    safeNotify(result.data.message || CART_MESSAGES.added, true);
                    // Atualiza a aparência do botão para indicar sucesso
                    button.textContent = 'Ver no Carrinho';
                    button.classList.add('in-cart');
                    
                    // Se for um botão de ícone, troca o ícone
                    const icon = button.querySelector('i.material-icons');
                    if (icon) {
                        icon.textContent = 'shopping_cart'; 
                    }

                } else {
                    safeNotify(result.data?.message || CART_MESSAGES.error, false);
                }
            } catch (error) {
                console.error('Erro ao adicionar ao carrinho:', error);
                safeNotify(CART_MESSAGES.error, false);
            } finally {
                processingButtons.delete(productId);
                button.disabled = false;
                button.style.opacity = '1';
            }
        });
    });
}