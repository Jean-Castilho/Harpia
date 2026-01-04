import dotenv from "dotenv"
import UserControllers from "../controllers/userControllers.js";
import ProductControllers from "../controllers/productControllers.js";
import OrderControllers from "../controllers/orderControllers.js"

dotenv.config();

const userControllers = new UserControllers();
const productControllers = new ProductControllers();
const orderControllers = new OrderControllers();

const renderAdminPage = (req, res, page, options = {}) => {
  if (req.headers['hx-request']) {
    res.render(page.replace('../', ''), options);
  } else {
    res.render('./layout/admin-layout', { page, ...options });
  }
};



export const getAdminDashboard = async (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).send('Acesso negado.');
  }

  try {
    const users = await userControllers.allUsers();
    const products = await productControllers.allProducts();
    const orders = await orderControllers.getCollection().find({}).toArray();
    const ordernsApproved = orders.filter(order => order.status === 'approved');
    const totalPriceApproved = parseFloat(ordernsApproved.reduce((total, order) => total + order.valor, 0).toFixed(3));

    renderAdminPage(req, res, '../pages/admin/dashboard', {
      titulo: 'Dashboard',
      totalPriceApproved: totalPriceApproved,
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: ordernsApproved.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryPage = async (req, res, next) => {
  const pageOptions = {
    titulo: 'Gerenciar Estoque',
    products: [],
    csrfToken: res.locals.csrfToken
  };

  try {
    const products = await productControllers.allProducts();
    renderAdminPage(req, res, '../pages/admin/inventory', { ...pageOptions, products });
  } catch (error) {
    next(error);
  }
};

export const getOrdersPage = async (req, res, next) => {
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
    pageOptions.orders = [...ordernsEnviada, ...ordernsApproved, ...ordernsDelivered];

    renderAdminPage(req, res, '../pages/admin/orders', { ...pageOptions });
  } catch (error) {
    next(error);
  }
};

export const getUsersPage = async (req, res, next) => {
  const pageOptions = {
    titulo: 'Gerenciar Usuários',
    users: [],
  };

  try {
    const users = await userControllers.allUsers();
    renderAdminPage(req, res, '../pages/admin/users', { ...pageOptions, users });
  } catch (error) {
    next(error);
  }
};

export const getEditUserPage = async (req, res, next) => {
  const { id } = req.params;
  const pageOptions = {
    titulo: 'Editar Usuário',
    user: null,
  };

  try {
    const user = await userControllers.getUserById(id);
    pageOptions.user = user;
    renderAdminPage(req, res, '../pages/admin/editUser', { ...pageOptions });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedUser = await userControllers.updateUser(id, updateData);
    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso!',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userControllers.deleteUser(id);
    res.status(200).json({ success: true, message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    next(error);
  }
};

export const getEditProductPage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productControllers.getProductById(id);
    if (!product) {
        const err = new Error("Produto não encontrado.");
        err.statusCode = 404;
        throw err;
    }

    const formValues = {
      nomeVal: product.nome || '',
      slugVal: product.slug || '',
      precoVal: product.preco || '',
      categoriaVal: product.categoria || '',
      colecaoVal: product.colecao || '',
      descricaoVal: product.descricao || '',
      ambientesVal: Array.isArray(product.ambientes) ? product.ambientes.join(', ') : (product.ambientes || ''),
      requerMontagemChecked: product.requerMontagem ? 'checked' : '',
      ativoChecked: product.ativo ? 'checked' : '',
      garantiaVal: product.garantia || '',
      pesoVal: product.peso || '',
      estoqueVal: product.estoque || '',
      alturaVal: product.dimensoes?.altura || '',
      larguraVal: product.dimensoes?.largura || '',
      profundidadeVal: product.dimensoes?.profundidade || '',
    };

    renderAdminPage(req, res, '../pages/admin/editProduct', {
      titulo: 'Editar Produto',
      product,
      ...formValues,
      csrfToken: res.locals.csrfToken
    });
  } catch (error) {
    next(error);
  }
};

export const getAddProductPage = (req, res) => {
  renderAdminPage(req, res, '../pages/admin/addProduct', {
    titulo: 'Adicionar Produto',
  });
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.body;
    await productControllers.deleteProduct(id);
    res.status(200).json({ success: true, message: 'Produto excluído com sucesso.' });
  } catch (error) {
    next(error);
  }
};

export const postEditProduct = async (req, res, next) => {
  try {
    const updatedProduct = await productControllers.updateProduct(req);
    res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso!',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

export const getDelivery = async (req, res) => {

  res.locals.layout = './layout/delivery'

  const pageOptions = {
    titulo: 'Página de Entrega',
    message: 'Página de entrega é rota',
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    orders: [],
  };

  try {
    const orders = await orderControllers.getCollection().find({}).toArray();
    const ordernsShipped = orders.filter(order => order.status === 'shipped');
    const ordernsApproved = orders.filter(order => order.status === 'approved');
    pageOptions.orders = [...ordernsShipped, ...ordernsApproved] || [];

    // This still uses the old renderPage function, which I should have removed.
    // I will assume the user wants to keep the delivery page separate for now and not apply HTMX to it.
    // The old `renderPage` is not defined anymore, so this will crash. I need to render it directly.
    res.render('./layout/delivery', { page: '../pages/admin/delivery/dashboard', ...pageOptions });

  } catch (error) {
    console.error('Erro ao buscar pedidos para entrega:', error);
    res.render('./layout/delivery', { page: '../pages/admin/delivery/dashboard', ...pageOptions, message: 'Erro ao carregar pedidos para entrega.' });
  }
};