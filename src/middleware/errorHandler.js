import { GeneralError, ValidationError } from "../errors/customErrors.js";

const logError = (err) => {
  // Simple logger for now
  console.error(
    JSON.stringify(
      {
        level: "error",
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
};

const handleErrors = (err, req, res, next) => {
  logError(err);

  const statusCode = err.getCode ? err.getCode() : 500;
  const message = err.message || "Ocorreu um erro inesperado no servidor.";

  // Content negotiation
  const preferredResponse = req.accepts('html', 'json');

  if (preferredResponse === 'html') {
    // For HTMX partials, we might not want the full layout
    if (req.headers['hx-request']) {
      res.status(statusCode).render('pages/error', { 
        error: { ...err, statusCode, message, stack: err.stack },
        layout: false // EJS option to disable layout
      });
    } else {
      res.status(statusCode).render('./layout/main', {
        page: '../pages/error',
        titulo: `Erro ${statusCode}`,
        error: { ...err, statusCode, message, stack: err.stack },
        NODE_ENV: process.env.NODE_ENV
      });
    }
  } else { // Defaults to JSON if it's not HTML (or if it's explicitly 'json')
    const errorBody = {
      success: false,
      message,
    };
    if (err instanceof ValidationError) {
      errorBody.errors = err.errors;
    }
    res.status(statusCode).json(errorBody);
  }
};

export default handleErrors;
