
export const sendSuccess = (
  res,
  data,
  mensagem = "Operação realizada com sucesso",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    mensagem,
    data,
  });
};

export const sendError = (
  res,
  mensagem = "Ocorreu um erro",
  statusCode = 500,
) => {
  return res.status(statusCode).json({
    success: false,
    mensagem,
  });
};

export const sendNotFound = (res, mensagem = "Recurso não encontrado") => {
  return res.status(404).json({
    success: false,
    mensagem,
  });
};

export const sendUnauthorized = (res, mensagem = "Não autorizado") => {
  return res.status(401).json({
    success: false,
    mensagem,
  });
};

export const sendBadRequest = (res, mensagem = "Requisição inválida") => {
  return res.status(400).json({
    success: false,
    mensagem,
  });
};