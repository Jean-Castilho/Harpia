import { randomBytes } from "crypto";
import { GeneralError } from "#src/errors/customErrors.js";

/**
 * Middleware para gerar e expor um token CSRF para os templates.
 * Este middleware deve ser usado em TODAS as rotas GET que renderizam formulários.
 */
export const generateCsrfToken = (req, res, next) => {
  // Gera um novo token se não houver um na sessão
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomBytes(32).toString("hex");
  }

  // Expõe o token para os templates EJS;
  res.locals.csrfToken = req.session.csrfToken;

  next();
};

/**
 * Middleware para validar o token CSRF em requisições que alteram estado.
 * Este middleware deve ser usado em rotas POST, PUT, DELETE, PATCH.
 */
export const validateCsrfToken = (req, res, next) => {
  // O token pode vir do corpo da requisição (formulários) ou de um cabeçalho (AJAX);
  const receivedToken = req.headers["x-csrf-token"] || (req.body && req.body._csrf);
  const sessionToken = req.session.csrfToken;

  // Verifica se os tokens existem e são iguais;
  if (!sessionToken || !receivedToken || sessionToken !== receivedToken) {
    console.warn("Falha na validação do token CSRF.", {
      sessionToken: sessionToken?.slice(0, 5), // Log apenas o início para segurança;
      receivedToken: receivedToken?.slice(0, 5),
      path: req.path,
      method: req.method,
    });

    // Para requisições de API, envie um erro JSON. Para outras, pode redirecionar.
    // Lança um erro que será capturado pelo errorHandler.
    return next(new GeneralError(
      "Ação não permitida. Token de segurança inválido ou ausente.",
      403, // 403 Forbidden
    ));
  } // Se a validação for bem-sucedida, continua para o próximo middleware ou controller

  next();
};

// --- Middleware de Autenticação Aprimorado ---

export const authMiddleware = (req, res, next) => {
  // Suporta token via cookie ou header Authorization: Bearer <token>
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let token = null;
  if (authHeader && String(authHeader).startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) { // Se você usa cookies para JWT, certifique-se de que é seguro (httpOnly, secure)
    token = req.cookies.token; // Esta linha pode ser removida se a autenticação for apenas via sessão
  }

  if (!token) {
    // statusCode não está definido. Assumindo 401 Unauthorized.
    return res.status(401).json({
      success: false,
      message: "Acesso negado. Nenhum token fornecido."
    });
  }

  // 'verificarToken' não está definido no contexto.
  // Você precisaria de uma função para verificar e decodificar o JWT.
  const decoded = /* verificarToken(token) */ null; // Placeholder
  if (!decoded) {
    // statusCode não está definido. Assumindo 401 Unauthorized.
    return res.status(401).json({
      success: false,
      message: "Token inválido ou expirado."
    });
  } // Adiciona os dados do usuário decodificados ao objeto de requisição para uso posterior
  req.user = decoded; // Exemplo: Anexar o usuário decodificado à requisição
  next();
};