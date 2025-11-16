import express from "express";
import UserControllers from "../controllers/userControllers.js";
// 1. Importe o middleware de validação CSRF
import {
  validateCsrfToken,
  generateCsrfToken,
} from "../middleware/csrfMiddleware.js";
import { ObjectId } from "mongodb";

const userControllers = new UserControllers();
const router = express.Router();

router.post("/register", generateCsrfToken, async (req, res) => {
  const creatUser = await userControllers.creatUser(req, res);

  return res
    .cookie("token", creatUser.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use 'secure' apenas em produção
      sameSite: "strict",
    })
    .json({ mensagem: "Usuário criado com sucesso.", user: creatUser.user })
    .status(200);
});

router.post("/login", generateCsrfToken, async (req, res) => {
  const dataLogin = await userControllers.login(req, res);
  console.log(dataLogin)
  return res
    .cookie("token", dataLogin.token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
    .status(200) // 200 OK é mais comum para um login bem-sucedido do que 201 Created
    .json({ mensagem: "Login realizado", user: dataLogin.user });
});

router.put("/updatedUser", validateCsrfToken, async (req, res) => {

  const id = req.session.user._id;
  const userUpdated = await userControllers.updateUser(id, req.body);

  req.session.user = userUpdated;

  return res.status(200).json({ mensagem: "Usuario atualizado", userUpdated });
});

// Middleware para garantir que o usuário está autenticado
const ensureAuthenticated = (req, res, next) => {
  if (!req.session.user || !req.session.user._id) {
    return res.status(401).json({ success: false, mensagem: "Acesso não autorizado. Por favor, faça login." });
  }
  req.userId = req.session.user._id; // Anexa o ID do usuário à requisição
  console.log(req.userId)
  next();
};

router.post("/favorites/add", ensureAuthenticated, validateCsrfToken, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, mensagem: "ID do produto é obrigatório." });
  }

  try {
    const updatedUser = await userControllers.getCollection().findOneAndUpdate(
      { _id: new ObjectId(req.userId) },
      { $addToSet: { favorites: productId } },
      { returnDocument: 'after' }
    );

    if (updatedUser) {
      req.session.user = updatedUser; // Atualiza a sessão
      return res.status(200).json({ success: true, mensagem: "Produto adicionado aos favoritos.", favorites: updatedUser.favorites });
    }
  } catch (error) {
    console.error('[FAVORITES_ADD] Erro durante a operação no banco de dados:', error);
    return res.status(500).json({ success: false, mensagem: "Ocorreu um erro no servidor ao tentar adicionar o favorito." });
  }
  return res.status(404).json({ success: false, mensagem: "Usuário não encontrado." });
});

router.post("/favorites/remove", ensureAuthenticated, validateCsrfToken, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, mensagem: "ID do produto é obrigatório." });
  }

  try {
    const updatedUser = await userControllers.getCollection().findOneAndUpdate(
      { _id: new ObjectId(req.userId) },
      { $pull: { favorites: productId } },
      { returnDocument: 'after' }
    );

    if (updatedUser) {
      req.session.user = updatedUser; // Atualiza a sessão
      return res.status(200).json({ success: true, mensagem: "Produto removido dos favoritos.", favorites: updatedUser.favorites });
    }
    return res.status(404).json({ success: false, mensagem: "Usuário não encontrado." });
  } catch (error) {
    console.error('[FAVORITES_REMOVE] Erro durante a operação no banco de dados:', error);
    return res.status(500).json({ success: false, mensagem: "Ocorreu um erro no servidor ao tentar remover o favorito." });
  }
});

router.post("/cart/add", ensureAuthenticated, validateCsrfToken, async (req, res) => {
  const { productId } = req.body;
  const userId = req.userId;

  // Logs para depuração
  console.log(`[CART_ADD] Tentando adicionar produto: ${productId} para o usuário: ${userId}`);
  console.log(`[CART_ADD] Tipo do userId: ${typeof userId}`);

  if (!productId) {
    return res.status(400).json({ success: false, mensagem: "ID do produto é obrigatório." });
  }

  try {
    const updatedUser = await userControllers.getCollection().findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $addToSet: { cart: productId } },
      { returnDocument: 'after' }
    );

    console.log('[CART_ADD] Resultado da busca no banco:', updatedUser ? 'Usuário encontrado e atualizado.' : 'Usuário NÃO encontrado.');

    if (updatedUser) {
      req.session.user = updatedUser; // Atualiza a sessão
      return res.status(200).json({ success: true, mensagem: "Produto adicionado ao carrinho.", cart: updatedUser.cart });
    }
    return res.status(404).json({ success: false, mensagem: "Usuário não encontrado." });
  } catch (error) {
    console.error('[CART_ADD] Erro durante a operação no banco de dados:', error);
    return res.status(500).json({ success: false, mensagem: "Ocorreu um erro no servidor ao tentar adicionar ao carrinho." });
  }
});


router.post("/cart/remove", ensureAuthenticated, validateCsrfToken, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, mensagem: "ID do produto é obrigatório." });
  }

  try {
    const updatedUser = await userControllers.getCollection().findOneAndUpdate(
      { _id: new ObjectId(req.userId) },
      { $pull: { cart: productId } },
      { returnDocument: 'after' }
    );

    if (updatedUser) {
      req.session.user = updatedUser; // Atualiza a sessão
      return res.status(200).json({ success: true, mensagem: "Produto removido do carrinho.", cart: updatedUser.cart });
    }
    return res.status(404).json({ success: false, mensagem: "Usuário não encontrado." });
  } catch (error) {
    console.error("Erro ao remover produto do carrinho:", error);
    return res.status(500).json({ success: false, mensagem: "Erro ao remover produto do carrinho." });
  }
});


router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao destruir a sessão:", err);
      return res.status(500).redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

export default router;
