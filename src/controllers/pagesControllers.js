import { ObjectId } from "mongodb";
import UserControllers from "./userControllers.js";
import ProductControllers from "./productControllers.js";
import OrdersControllers from "./orderControllers.js";
import formatters from "../utils/formatters.js";

const userControllers = new UserControllers();
const productControllers = new ProductControllers();
const orderControllers = new OrdersControllers();

const handleError = (res, error, page, data) => {
  console.error(`Error on page ${page}:`, error.message);
  renderPage(res, page, data);
};
const renderPage = (res, page, options = {}) => {
  res.render(res.locals.layout, {
    page,
    ...options,
  });
};

export const getHome = async (req, res) => {
  const products = await productControllers
    .getCollection()
    .find()
    .limit(10)
    .toArray();

  renderPage(res, "../pages/public/home", {
    titulo: "Encanto Rústico",
    estilo: "home",
    message: "Bem-vindo à nossa loja de móveis e decorações!",
    products: products,
  });
};

export const getRegister = (req, res) => {
  renderPage(res, "../pages/auth/register", {
    titulo: "Registrar Conta",
    estilo: "register",
    message: "Crie sua conta para começar a comprar!",
  });
};

export const getLogin = (req, res) => {
  renderPage(res, "../pages/auth/login", {
    titulo: "Realizar Login",
    estilo: "login",
    message: "seja Bem vindo de volta...",
  });
};

export const getContact = (req, res) => {
  renderPage(res, "../pages/public/contact", {
    titulo: "Contato",
    estilo: "contact",
    message: "Entre em contato conosco!",
  });
};

export const getAbout = (req, res) => {
  renderPage(res, "../pages/public/about", {
    titulo: "Sobre Nós",
    estilo: "about",
    message: "Saiba mais sobre nossa loja!",
  });
};


export const getProducts = async (req, res) => {
  const allProducts = await productControllers.getCollection().find().toArray();

  renderPage(res, "../pages/public/products", {
    titulo: "Produtos",
    estilo: "products",
    message: "Confira nossos produtos!",
    products: allProducts,
  });
};


export const getProfile = (req, res) => {
  res.locals.layout = "./layout/auth";

  console.log("User Session:", req.session.user);

  if (!req.session.user) {
    return res.redirect("/login");
  }

  renderPage(res, "../pages/auth/profile", {
    titulo: "configuraçao",
    estilo: "peofile",
    message: "sessao profile...",
  });
};

export const getSolicitOtp = (req, res) => {
  renderPage(res, "../pages/auth/solicit-otp", {
    titulo: "Alterar Senha",
    message: "solicite o codigo para redefinir senha",
  });
};

export const getVerifyOtp = (req, res) => {
  renderPage(res, "../pages/auth/verifyOtp", {
    titulo: "Alterar Senha",
    message: "solicite o codigo para redefinir senha",
  });
};


export const getFavoritesPage = async (req, res) => {
  const pageOptions = {
    titulo: "Meus Favoritos",
    favorites: [],
  };

  if (!req.session.user) {
    return renderPage(res, "../pages/public/favorites", {
      ...pageOptions,
      message: "Usuário não autenticado",
    });
  }

  const { favorites: favoritProducts } = req.session.user;

  if (!favoritProducts || favoritProducts.length === 0) {
    return renderPage(res, "../pages/public/favorites", {
      ...pageOptions,
      message: "Você ainda não adicionou nenhum produto aos seus favoritos.",
    });
  }

  try {
    // Converte o array de strings de IDs para um array de ObjectIds
    const favoriteObjectIds = favoritProducts.map((id) => new ObjectId(id));
    const favoriteItems = await productControllers
      .getCollection()
      .find({ _id: { $in: favoriteObjectIds } })
      .toArray();

    console.log("Favorit Products IDs:", favoritProducts);
    //intere o id de favoritItems para o productIdnomais, substituido o _id:objet... para apenas
    console.log("Favorit Items:", favoriteItems);



    renderPage(res, "../pages/public/favorites", {
      ...pageOptions,
      favorites: favoriteItems,
      message: "Seus produtos favoritos.",
    });
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    renderPage(res, "../pages/public/favorites", {
      ...pageOptions,
      message: "Erro ao carregar seus favoritos. Tente novamente mais tarde.",
    });
  }
};

export const getCartPage = async (req, res) => {
  const pageOptions = {
    titulo: "Carrinho",
    cart: { items: [] },
    estilo: "cart",
    totalPrice: 0,
    totalItems: 0,
  };
  if (
    !req.session.user ||
    !req.session.user.cart ||
    req.session.user.cart.length === 0
  ) {
    return renderPage(res, "../pages/public/cart", {
      ...pageOptions,
      message: "Seu carrinho está vazio.",
    });
  }

  const { cart: productIds } = req.session.user;

  try {
    const quantityMap = productIds.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    const uniqueProductIds = Object.keys(quantityMap).map(
      (id) => new ObjectId(id)
    );

    const productsDetails = await productControllers
      .getCollection()
      .find({ _id: { $in: uniqueProductIds } })
      .toArray();

    const itemsWithQuantity = productsDetails.map((product) => ({
      ...product,
      quantity: quantityMap[product._id.toString()],
    }));

    const totalPrice = itemsWithQuantity.reduce(
      (acc, item) => acc + item.preco * item.quantity,
      0
    );

    const totalItems = productIds.length; // O total de itens é simplesmente o tamanho do array original

    renderPage(res, "../pages/public/cart", {
      ...pageOptions,
      cart: { items: itemsWithQuantity },
      totalPrice,
      totalItems,
      message: "Seus produtos no carrinho.",
    });

  } catch (error) {
    console.error("Erro ao carregar o carrinho:", error);
    renderPage(res, "../pages/public/cart", {
      ...pageOptions,
      message: "Erro ao carregar seu carrinho. Tente novamente mais tarde.",
    });
  }
};

export const getOrders = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const pageOptions = {
    titulo: "Meus Pedidos",
    orders: [],
  };
  const userId = req.session.user._id;

  try {

    const orders = await orderControllers.getOrdersByUserId(userId);

    if (!orders || orders.length === 0) {
      return renderPage(res, "../pages/public/orders", {
        ...pageOptions,
        formatters,
        message: "Você ainda não fez nenhum pedido.",
      });
    }

    pageOptions.orders = orders;

    if (!orders || orders.length === 0) {
      return renderPage(res, "../pages/public/orders", {
        ...pageOptions,
        formatters,
        message: "Você ainda não fez nenhum pedido.",
      });
    }

    renderPage(res, "../pages/public/orders", {
      ...pageOptions,
      formatters,
      message: "Seu histórico de pedidos.",
    });
  } catch (error) {
    const apiMessage = (error && error.data && (error.data.message || error.data.msg)) || error.message || "Erro ao carregar seu histórico de pedidos.";
    console.error("Erro ao buscar orders para usuário:", apiMessage, error);
    return renderPage(res, "../pages/public/orders", {
      ...pageOptions,
      message: apiMessage,
    });
  }
};

export const getCheckout = async (req, res) => {
  const pageOptions = {
    titulo: "Checkout",
    order: null,
    totalPrice: 0,
    totalItems: 0,
  };

  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      throw new Error("ID de pedido inválido.");
    };

    console.log(req.body);

    const order = await orderControllers
      .getCollection()
      .findOne({ _id: new ObjectId(id) });

    if (!order) {
      return handleError(res, new Error("Pedido não encontrado."), '../pages/public/checkout', { ...pageOptions, mensagem: 'Pedido não encontrado.' });
    };
    const totalPrice = order.items.reduce((acc, item) => acc + item.preco * Number(item.quantidade), 0);
    const totalItems = order.items.reduce((acc, item) => acc + Number(item.quantidade), 0);

    pageOptions.order = order;
    pageOptions.totalPrice = totalPrice;
    pageOptions.totalItems = totalItems;

    renderPage(res, "../pages/public/checkout", { ...pageOptions, mensagem: "Detalhes da ordem." });

  } catch (error) {
    handleError(res, error, '../pages/public/checkout', { ...pageOptions, mensagem: 'Erro ao carregar os detalhes do pedido. Tente novamente mais tarde.' });
  }
};

export const getPayment = async (req, res) => {

  const pageOptions = {
    titulo: "payment",
  };
  const id = req.params.id;
  const data = req.body;

  try {
    console.log("endereço", data.endereco);

    // Atualizar o pedido com os dados do endereço
    if (data && Object.keys(data).length > 0) {
      await orderControllers
        .getCollection()
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { endereco: data.endereco } }
        );
    }

    const order = await orderControllers
      .getCollection()
      .findOne({ _id: new ObjectId(id) });

    pageOptions.qr_code = order.payment.data.qr_code;
    pageOptions.qr_code_base64 = order.payment.data.qr_code_base64;

    renderPage(res, "../pages/public/payment", { ...pageOptions, mensagem: "Detalhes da ordem." });

  } catch (error) {
    handleError(res, error, '../pages/public/payment', { ...pageOptions, mensagem: 'Erro ao carregar os detalhes do pagamento. Tente novamente mais tarde.' });
  }
};

export const updateUserAddress = (req, res) => {
  const { cep } = req.body;

  if (!req.session.user) {
    return res.redirect("/login");
  }

  req.session.user.cep = cep;
  res.redirect("/profile");
};

export const getAddressByCep = async (req, res) => {
  const { cep } = req.params;
  const cepLimpo = cep.replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    return res.status(400).json({ success: false, message: 'CEP inválido.' });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!response.ok) {
      return res.status(500).json({ success: false, message: 'Erro ao consultar o CEP.' });
    }

    const address = await response.json();

    if (address.erro) {
      return res.status(404).json({ success: false, message: 'CEP não encontrado.' });
    }

    const filteredAddress = {
      rua: address.logradouro,
      bairro: address.bairro,
      cidade: address.localidade,
      estado: address.uf,
    };

    res.json({ success: true, data: filteredAddress });
  } catch (error) {
    console.error('Erro ao consultar o CEP:', error);
    res.status(500).json({ success: false, message: 'Erro ao consultar o CEP.' });
  }
};