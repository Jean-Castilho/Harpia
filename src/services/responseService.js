
export const sendSuccess = (
  res,
  data,
  message = "Operação realizada com sucesso",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res,
  message = "Ocorreu um erro",
  statusCode = 500,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const sendNotFound = (res, message = "Recurso não encontrado") => {
  return res.status(404).json({
    success: false,
    message,
  });
};

export const sendUnauthorized = (res, message = "Não autorizado") => {
  return res.status(401).json({
    success: false,
    message,
  });
};

export const sendBadRequest = (res, message = "Requisição inválida") => {
  return res.status(400).json({
    success: false,
    message,
  });
};