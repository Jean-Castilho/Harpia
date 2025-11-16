import UserControllers from "./userControllers.js";
import { ObjectId } from "mongodb";
import ProductControllers from "./productControllers.js";

const userControllers = new UserControllers();
const productControllers = new ProductControllers();
const renderPage = (res, page, options = {}) => {
  res.render(res.locals.layout, {
    page,
    ...options,
  });
}

export const getHome = async (req, res) => {

  const products = await productControllers.getCollection().find().limit(10).toArray();

  renderPage(res, '../pages/public/home', {
    titulo: 'Encanto Rústico',
    estilo: 'home',
    mensagem: 'Bem-vindo à nossa loja de móveis e decorações!',
    products: products,
  });
};

export const getContact = (req, res) => {
  renderPage(res, '../pages/public/contact', {
    titulo: 'Contato',
    estilo: 'contact',
    mensagem: 'Entre em contato conosco!',
  });
};

export const getAbout = (req, res) => {
  renderPage(res, '../pages/public/about', {
    titulo: 'Sobre Nós',
    estilo: 'about',
    mensagem: 'Saiba mais sobre nossa loja!',
  });
};

export const getProducts = (req, res) => {
  renderPage(res, '../pages/public/products', {
    titulo: 'Produtos',
    estilo: 'products',
    mensagem: 'Confira nossos produtos!',
  });
}



export const getRegister = (req, res) => {
  renderPage(res, '../pages/auth/register', {
    titulo: 'Registrar Conta',
    estilo: 'register',
    mensagem: 'Crie sua conta para começar a comprar!',
  });
}

export const getLogin = (req, res) => {
  renderPage(res, "../pages/auth/login", {
    titulo: 'Realizar Login',
    estilo: 'login',
    mensagem: 'seja Bem vindo de volta...'
  });
}



export const getProfile = (req, res) => {

  res.locals.layout = './layout/auth';

  console.log('User Session:', req.session.user);

  if(!req.session.user){
  
    return res.redirect('/login');
    
  }

  renderPage(res, "../pages/auth/profile", {
    titulo: 'configuarçao',
    estilo: 'peofile',
    mensagem: 'sessao profile...',

  });

}

export const changePassword = (req, res) => {
  renderPage(res, '../pages/auth/changePassword', {
    titulo: 'Alterar Senha',
    mensagem: 'solicite o codigo para redefinir senha',
  });
};


export const getFavoritesPage = async (req, res) => {
  const pageOptions = {
    titulo: 'Meus Favoritos',
    favorites: [],
  };

  if (!req.session.user) {
    return renderPage(res, '../pages/public/favorites', { ...pageOptions, mensagem: 'Usuário não autenticado' });
  }

  const { favorites: favoritProducts } = req.session.user;

  console.log('Favorit Products IDs:', favoritProducts);

  if (!favoritProducts || favoritProducts.length === 0) {
    return renderPage(res, '../pages/public/favorites', { ...pageOptions, mensagem: 'Você ainda não adicionou nenhum produto aos seus favoritos.' });
  }

  try {
    // Converte o array de strings de IDs para um array de ObjectIds
    const favoriteObjectIds = favoritProducts.map(id => new ObjectId(id));
    const favoriteItems = await productControllers.getCollection().find({ _id: { $in: favoriteObjectIds } }).toArray();

    renderPage(res, '../pages/public/favorites', { ...pageOptions, favorites: favoriteItems, mensagem: 'Seus produtos favoritos.' });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    renderPage(res, '../pages/public/favorites', { ...pageOptions, mensagem: 'Erro ao carregar seus favoritos. Tente novamente mais tarde.' });
  }
};

export const getCartPage = async (req, res) => {
  const pageOptions = {
    titulo: 'Carrinho',
    cart: { items: [] },
    estilo: 'cart',
    totalPrice: 0,
    totalItems: 0,
  };

  if (!req.session.user) {
    return renderPage(res, '../pages/public/cart', { ...pageOptions, mensagem: 'Você precisa estar logado para ver seu carrinho.' });
  };

  
  const { cart: cartsProduts } = req.session.user;


  try {
    const productsCart = await productControllers.getCollection().find({ _id: { $in: cartsProduts } }).toArray();

    console.log(productsCart)

    renderPage(res, '../pages/public/cart', { ...pageOptions, cart: { items }, totalPrice, totalItems, mensagem: 'Seus produtos no carrinho.' });
  } catch (error) {
    console.error('Erro ao carregar o carrinho:', error);
    renderPage(res, '../pages/public/cart', { ...pageOptions, mensagem: 'Erro ao carregar seu carrinho. Tente novamente mais tarde.' });
  };
};


