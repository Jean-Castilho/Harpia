const renderPage = (res, page, options = {}) => {
  res.render(res.locals.layout, {
    page,
    ...options,
  });
}

export const getHome = (req, res) => {
  renderPage(res, '../pages/public/home', {
    titulo: 'Encanto Rústico',
    estilo: 'home',
    mensagem: 'Bem-vindo à nossa loja de móveis e decorações!',
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