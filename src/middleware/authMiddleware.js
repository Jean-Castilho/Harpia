import { UnauthorizedError } from "../errors/customErrors.js";

export const checkUserRole = (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  
  let layout = './layout/main';
  if (req.session.user) {
    switch (req.session.user.role) {
      case 'admin':
        layout = './layout/admin-layout';
        break;
      case 'delivery':
        layout = './layout/delivery';
        break;
    }
  }
  res.locals.layout = layout;
  next();
};


// Middleware para garantir que o usuário está autenticado
export const ensureAuthenticated = (req, res, next) => {
  console.log('Checking authentication - Session user:', req.session?.user);
  console.log('Session ID:', req.sessionID);
  console.log('Cookies:', req.headers.cookie);
  console.log('HX-Request:', req.headers['hx-request']);

  if (!req.session.user || !req.session.user._id) {
    console.log('User not authenticated, redirecting to login');

    // URL de perfil sem autenticação -> redireciona para login
    if (req.headers['hx-request']) {
      res.set('HX-Redirect', '/login');
      return res.status(302).redirect('/login');
    }

    if (req.accepts('html')) {
      return res.redirect('/login');
    }

    return res.status(401).json({
      success: false,
      message: 'Acesso não autorizado. Por favor, faça login.',
    });
  }

  console.log('User authenticated:', req.session.user._id);
  req.userId = req.session.user._id; // Anexa o ID do usuário à requisição
  next();
};

export const ensureAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acesso negado. Somente administradores podem realizar esta ação.' });
  }
  next();
};