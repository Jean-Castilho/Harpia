import dotenv from "dotenv"
import UserControllers from "../controllers/userControllers.js";
import ProductControllers from "../controllers/productControllers.js";
import OrderControllers from "../controllers/orderControllers.js"

dotenv.config();

const userControllers = new UserControllers();
const productControllers = new ProductControllers();
const orderControllers = new OrderControllers();



const renderPage = (res, page, options = {}) => {
  res.render(res.locals.layout, {
    page,
    ...options,
  });
}

const renderAdminPage = (res, page, options = {}) => {
  res.render(res.locals.layout || './layout/admin', { page, ...options });
};

const handleError = (res, error, page, data) => {
  console.error(`Error on admin page ${page}:`, error.message);
  renderAdminPage(res, page, { ...data, error: `Não foi possível carregar os dados: ${error.message}` });
};

export const getAdminDashboard = async (req, res) => {

  if (!req.session.user) {
    return res.redirect('/login');
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).send('Acesso negado. Você não tem permissão para acessar esta página.');
  }

  const users = await userControllers.allUsers();

  const products = await productControllers.allProducts();

  const orders = await orderControllers.getCollection().find({}).toArray();

  const ordernsApproved = orders.filter(order => order.status === 'approved');
  const totalPriceApproved = parseFloat(ordernsApproved.reduce((total, order) => total + order.valor, 0).toFixed(3));

  renderAdminPage(res, '../pages/admin/dashboard', {
    titulo: 'Dashboard',
    totalPriceApproved, totalPriceApproved,
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: ordernsApproved.length,
  });

};

export const getInventoryPage = async (req, res) => {

  const pageOptions = {
    titulo: 'Gerenciar Estoque',
    products: [],
  };

  try {
    const products = await productControllers.allProducts();

    renderAdminPage(res, '../pages/admin/inventory', { ...pageOptions, products });
  } catch (error) {
    handleError(res, error, '../pages/admin/inventory', pageOptions);
  }
};

export const getOrdersPage = async (req, res) => {

  const pageOptions = {
    titulo: 'Gerenciar Pedidos',
    totalApproved: 0,
    totalDelivered: 0,
    ordernsEnviada: 0,
    orders: []
  };

  try {
    const orders = await orderControllers.getCollection().find({}).toArray();
    const ordernsApproved = orders.filter(order => order.status === 'approved');
    pageOptions.totalApproved = ordernsApproved.length;

    const ordernsDelivered = orders.filter(order => order.status === 'delivered');
    pageOptions.totalDelivered = ordernsDelivered.length;

    const ordernsEnviada = orders.filter(order => order.status === 'shipped');
    pageOptions.ordernsEnviada = ordernsEnviada.length;

    pageOptions.orders = [...ordernsEnviada, ...ordernsApproved, ...ordernsDelivered]

    renderAdminPage(res, '../pages/admin/orders', { ...pageOptions });

  } catch (error) {
    handleError(res, error, '../pages/admin/orders', pageOptions);
  }
};

export const getUsersPage = async (req, res) => {

  const pageOptions = {
    titulo: 'Gerenciar Usuários',
    users: [],
  };

  try {
    const users = await userControllers.allUsers();

    renderAdminPage(res, '../pages/admin/users', { ...pageOptions, users });
  } catch (error) {
    handleError(res, error, '../pages/admin/users', pageOptions);
  }
};

export const getEditUserPage = async (req, res) => {
  const { id } = req.params;

  const pageOptions = {
    titulo: 'Editar Usuário',
    user: null,
  };

  try {
    const user = await userControllers.getCollection.findOne({ id });

    pageOptions.user = user;
    renderAdminPage(res, '../pages/admin/editUser', { ...pageOptions });

  } catch (error) {
    handleError(res, error, '../pages/admin/editUser', pageOptions);
  }

};

//if user == admin;
export const getAddProductPage = (req, res) => {
  renderAdminPage(res, '../pages/admin/addProduct', {
    titulo: 'Adicionar Produto',
  });
};




export const deleteProduct = async (req, res) => {
  const { id } = req.body;
  try {
    res.redirect('/admin/inventory');
  } catch (error) {
    console.error('Erro ao excluir produto:', error.message);
    res.status(error.status || 500).send('Erro ao excluir o produto.');
  }
};

export const postEditProduct = async (req, res) => {

  const { id } = req.params;
  const { nome, slug, preco, ambientes, ativo, colecao, requerMontagem, garantia, categoria, estoque, descricao, peso } = req.body;
  // dimensoes podem vir como campos aninhados: dimensoes[altura]
  const altura = req.body['dimensoes[altura]'] || req.body.altura;
  const largura = req.body['dimensoes[largura]'] || req.body.largura;
  const profundidade = req.body['dimensoes[profundidade]'] || req.body.profundidade;
  const existingImages = Array.isArray(req.body['existingImages[]']) ? req.body['existingImages[]'] : (req.body['existingImages[]'] ? [req.body['existingImages[]']] : []);
  const files = [].concat(req.files || req.file || []);
  const filenames = files.map(file => file.filename);

  try {
    res.redirect('/admin/inventory');
  } catch (error) {
    console.error('Erro ao editar produto:', error.message);
    res.status(error.status || 500).send('Erro interno do servidor ao editar o produto.');
  }
};

export const getDelivery = async (req, res) => {

  res.locals.layout = './layout/delivery'

  const pageOptions = {
    titulo: 'Página de Entrega',
    mensagem: 'Página de entrega é rota',
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    orders: [],
  };

  try {

    const orders = await orderControllers.getCollection().find({}).toArray();

    const ordernsShipped = orders.filter(order => order.status === 'shipped');
    const ordernsApproved = orders.filter(order => order.status === 'approved');

    pageOptions.orders = [...ordernsShipped, ...ordernsApproved] || [];

    renderPage(res, '../pages/admin/delivery/dashboard', { ...pageOptions, mensagem: 'Página de entrega é rota' });
  } catch (error) {
    console.error('Erro ao buscar pedidos para entrega:', error);
    renderPage(res, '../pages/admin/delivery/dashboard', { ...pageOptions, mensagem: 'Erro ao carregar pedidos para entrega.' });
  }
};