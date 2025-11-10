

const renderPage = (res, page, options = {}) => {
    res.render(res.locals.layout, {
        page,
        ...options,
    });
}


const getHomePage = (req, res) => {
  renderPage(res, '../pages/public/home', {
    titulo: 'Encanto Rústico',
    estilo: 'home',
    mensagem: 'Bem-vindo à nossa loja de móveis e decorações!',
  });
};

export {
  getHomePage
}