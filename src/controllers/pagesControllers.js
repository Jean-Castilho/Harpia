const renderPage = (res, page, options = {}) => {
    res.render(res.locals.layout, {
        page,
        ...options,
    });
}

const getHome = (req, res) => {
  renderPage(res, '../pages/public/home', {
    titulo: 'Encanto Rústico',
    estilo: 'home',
    mensagem: 'Bem-vindo à nossa loja de móveis e decorações!',
  });
};

const getContact = (req, res) => {
  renderPage(res, '../pages/public/contact', {
    titulo: 'Contato',
    estilo: 'contact',
    mensagem: 'Entre em contato conosco!',
  });
};

const getAbout = (req, res) => {
  renderPage(res, '../pages/public/about', {
    titulo: 'Sobre Nós',
    estilo: 'about',
    mensagem: 'Saiba mais sobre nossa loja!',
  });
};
const getProducts = (req, res) => { 
  renderPage(res, '../pages/public/products', {
    titulo: 'Produtos',
    estilo: 'products',
    mensagem: 'Confira nossos produtos!',
  });
}





const getRegister = (req, res) => {
  renderPage(res, '../pages/auth/register', {
    titulo: 'Registrar Conta',
    estilo: 'register',
    mensagem: 'Crie sua conta para começar a comprar!',
  });
}

const getLogin = (req, res) => {
  renderPage(res,"../pages/auth/login", {
    titulo: 'Realizar Login',
    estilo: 'login',
    mensagem: 'seja Bem vindo de volta...'
  });
}






export {
  getHome,
  getContact,
  getAbout,
  getProducts,
  getRegister,
  getLogin
}