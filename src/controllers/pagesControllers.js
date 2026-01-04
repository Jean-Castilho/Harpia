import { ObjectId } from "mongodb";
import UserControllers from "./userControllers.js";
import ProductControllers from "./productControllers.js";
import OrdersControllers from "./orderControllers.js";
import formatters from "../utils/formatters.js";
import { GeneralError } from "../errors/customErrors.js";

const userControllers = new UserControllers();
const productControllers = new ProductControllers();
const orderControllers = new OrdersControllers();

const renderPage = (req, res, page, options = {}) => {
  if (req.headers["hx-request"]) {
    res.render(page.replace("../", ""), options);
  } else {
    res.render(res.locals.layout || './layout/main', {
      page,
      ...options,
    });
  }
};

export const getHome = async (req, res, next) => {
  try {
    const products = await productControllers
      .getCollection()
      .find()
      .limit(10)
      .toArray();

    renderPage(req, res, "../pages/public/home", {
      titulo: "Encanto Rústico",
      estilo: "home",
      message: "Bem-vindo à nossa loja de móveis e decorações!",
      products: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getRegister = (req, res) => {
  renderPage(req, res, "../pages/auth/register", {
    titulo: "Registrar Conta",
    estilo: "register",
    message: "Crie sua conta para começar a comprar!",
  });
};

export const getLogin = (req, res) => {
  renderPage(req, res, "../pages/auth/login", {
    titulo: "Realizar Login",
    estilo: "login",
    message: "seja Bem vindo de volta...",
  });
};

export const getContact = (req, res) => {
  renderPage(req, res, "../pages/public/contact", {
    titulo: "Contato",
    estilo: "contact",
    message: "Entre em contato conosco!",
  });
};

export const getAbout = (req, res) => {
  renderPage(req, res, "../pages/public/about", {
    titulo: "Sobre Nós",
    estilo: "about",
    message: "Saiba mais sobre nossa loja!",
  });
};

export const getProducts = async (req, res, next) => {
  try {
    const allProducts = await productControllers.getCollection().find().toArray();
    renderPage(req, res, "../pages/public/products", {
      titulo: "Produtos",
      estilo: "products",
      message: "Confira nossos produtos!",
      products: allProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  renderPage(req, res, "../pages/auth/profile", {
    titulo: "configuraçao",
    estilo: "peofile",
    message: "sessao profile...",
  });
};

export const getSolicitOtp = (req, res) => {
  renderPage(req, res, "../pages/auth/solicit-otp", {
    titulo: "Alterar Senha",
    message: "solicite o codigo para redefinir senha",
  });
};

export const getVerifyOtp = (req, res) => {
  renderPage(req, res, "../pages/auth/verifyOtp", {
    titulo: "Alterar Senha",
    message: "solicite o codigo para redefinir senha",
  });
};

export const getFavoritesPage = async (req, res, next) => {
  try {
    const pageOptions = {
      titulo: "Meus Favoritos",
      favorites: [],
    };

    if (!req.session.user) {
      return renderPage(req, res, "../pages/public/favorites", {
        ...pageOptions,
        message: "Usuário não autenticado",
      });
    }

    const { favorites: favoritProducts } = req.session.user;

    if (!favoritProducts || favoritProducts.length === 0) {
      return renderPage(req, res, "../pages/public/favorites", {
        ...pageOptions,
        message: "Você ainda não adicionou nenhum produto aos seus favoritos.",
      });
    }

    const favoriteObjectIds = favoritProducts.map((id) => new ObjectId(id));
    const favoriteItems = await productControllers
      .getCollection()
      .find({ _id: { $in: favoriteObjectIds } })
      .toArray();

    renderPage(req, res, "../pages/public/favorites", {
      ...pageOptions,
      favorites: favoriteItems,
      message: "Seus produtos favoritos.",
    });
  } catch (error) {
    next(error);
  }
};

export const getCartPage = async (req, res, next) => {
  try {
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
      return renderPage(req, res, "../pages/public/cart", {
        ...pageOptions,
        message: "Seu carrinho está vazio.",
      });
    }

    const { cart: productIds } = req.session.user;

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

    const totalItems = productIds.length;

    renderPage(req, res, "../pages/public/cart", {
      ...pageOptions,
      cart: { items: itemsWithQuantity },
      totalPrice,
      totalItems,
      message: "Seus produtos no carrinho.",
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const pageOptions = {
      titulo: "Meus Pedidos",
      orders: [],
    };
    const userId = req.session.user._id;

    const orders = await orderControllers.getOrdersByUserId(userId);

    pageOptions.orders = orders || [];

    renderPage(req, res, "../pages/public/orders", {
      ...pageOptions,
      formatters,
      message: orders && orders.length > 0 ? "Seu histórico de pedidos." : "Você ainda não fez nenhum pedido.",
    });
  } catch (error) {
    next(error);
  }
};

export const getCheckout = async (req, res, next) => {
  try {
    const pageOptions = {
      titulo: "Checkout",
      order: null,
      totalPrice: 0,
      totalItems: 0,
    };
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      throw new GeneralError("ID de pedido inválido.", 400);
    }

    const order = await orderControllers
      .getCollection()
      .findOne({ _id: new ObjectId(id) });

    if (!order) {
      throw new GeneralError("Pedido não encontrado.", 404);
    }

    const totalPrice = order.items.reduce(
      (acc, item) => acc + item.preco * Number(item.quantidade),
      0
    );
    const totalItems = order.items.reduce(
      (acc, item) => acc + Number(item.quantidade),
      0
    );

    pageOptions.order = order;
    pageOptions.totalPrice = totalPrice;
    pageOptions.totalItems = totalItems;

    renderPage(req, res, "../pages/public/checkout", {
      ...pageOptions,
      mensagem: "Detalhes da ordem.",
    });
  } catch (error) {
    next(error);
  }
};

export const getPayment = async (req, res, next) => {
  try {
    const pageOptions = {
      titulo: "payment",
    };
    const id = req.params.id;
    const data = req.body;

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
      
    if (!order) {
      throw new GeneralError("Pedido não encontrado.", 404);
    }

    pageOptions.qr_code = order.payment.data.qr_code;
    pageOptions.qr_code_base64 = order.payment.data.qr_code_base64;

    renderPage(req, res, "../pages/public/payment", {
      ...pageOptions,
      mensagem: "Detalhes da ordem.",
    });
  } catch (error) {
    next(error);
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

export const getAddressByCep = async (req, res, next) => {
  try {
    const { cep } = req.params;
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      throw new GeneralError("CEP inválido.", 400);
    }

    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!response.ok) {
      throw new GeneralError("Erro ao consultar o CEP.", 500);
    }

    const address = await response.json();

    if (address.erro) {
      throw new GeneralError("CEP não encontrado.", 404);
    }

    const filteredAddress = {
      rua: address.logradouro,
      bairro: address.bairro,
      cidade: address.localidade,
      estado: address.uf,
    };

    res.json({ success: true, data: filteredAddress });
  } catch (error) {
    next(error);
  }
};