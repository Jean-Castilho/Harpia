import express from "express";

import UserControllers from "#src/controllers/userControllers.js";
import { sendOtpEmail } from "#src/controllers/ContactControllers.js"

// 1. Importe o middleware de validação CSRF
import {
  validateCsrfToken,
  generateCsrfToken,
} from "#src/middleware/csrfMiddleware.js";

import {ensureAuthenticated} from "#src/middleware/authMiddleware.js";

import { ObjectId } from "mongodb";
import { getProductsByIds } from "#src/controllers/pagesControllers.js"; // Importar a nova função
import { GeneralError } from "#src/errors/customErrors.js";

const userControllers = new UserControllers();
const router = express.Router();

const isProduction = process.env.NODE_ENV === "production";
const hostUrl = process.env.CLIENT_URL || "http://localhost:3080";
const isLocalhost = /localhost|127\.0\.0\.1/.test(hostUrl);
const cookieSecure = isProduction && !isLocalhost;
const cookieSameSite = cookieSecure ? "none" : "lax";

router.post("/register", generateCsrfToken, async (req, res, next) => {
  try {
    const creatUser = await userControllers.creatUser(req, res);

    req.session.save((err) => {
      if (err) {
        console.error('Error saving session after registration:', err);
        return next(err);
      }

      return res
        .cookie("token", creatUser.token, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: cookieSameSite,
        })
        .status(201) // 201 Created é mais apropriado aqui;
        .json({ message: "Usuário criado com sucesso.", user: creatUser.user });
    });
  } catch (error) {
    next(error); // Passa o erro para o middleware de erro;
  }
});

router.post("/login", generateCsrfToken, async (req, res, next) => {
  try {
    const dataLogin = await userControllers.login(req, res);

    console.log('Login successful, session ID:', req.sessionID);
    console.log('Session user:', req.session.user);

    req.session.save((err) => {
      if (err) {
        console.error('Error saving session after login:', err);
        return next(err);
      }

      return res
        .cookie("token", dataLogin.token, {
          httpOnly: true,
          secure: cookieSecure,
          sameSite: cookieSameSite,
        })
        .status(200)
        .json({ message: "Login realizado", user: dataLogin.user });
    });
  } catch (error) {
    next(error); // Passa o erro para o middleware de erro;
  }
});

router.put("/updatedUser", ensureAuthenticated, validateCsrfToken, async (req, res, next) => {
  try {
    const id = req.session.user._id;
    const userUpdated = await userControllers.updateUser(id, req.body);

    req.session.user = userUpdated;

    return res.status(200).json({ message: "Usuario atualizado", userUpdated });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", validateCsrfToken, async (req, res, next) => {

  console.log("req.body:", req.body);

  const {contact, send_method } = req.body;

  if (send_method == 'email') {
    
    const verifUser = await userControllers.getUserByEmail(contact);
    console.log("send Code for email",verifUser);
    if (verifUser == null) {
      return next(new GeneralError("Ussuario nao encontrado", 301));

    }else{
      const sendemail = await sendOtpEmail(contact);
      console.log("send email:", sendemail);
      return res.status(201).json({mensagem:"email enviado",})
    }
  };

  if (send_method == 'sms') {
    const verifUser = await userControllers.getUserByPhone(contact);
    console.log("send Code for SMS",verifUser);
  };

});

router.post("/favorites/add", ensureAuthenticated, validateCsrfToken, async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    // Usando o fluxo de erro padronizado
    return next(new GeneralError("ID do produto é obrigatório.", 400));
  }

  try {
    const updatedUser = await userControllers.getCollection().findOneAndUpdate(
      { _id: new ObjectId(req.userId) },
      { $addToSet: { favorites: productId } },
      { returnDocument: "after" }
    );

    if (updatedUser) {
      req.session.user = updatedUser; // Atualiza a sessão
      return res.status(200).json({ success: true, message: "Produto adicionado aos favoritos.", favorites: updatedUser.favorites });
    }
    // Se não encontrou o usuário, lança um erro 404
    throw new GeneralError("Usuário não encontrado.", 404);
  } catch (error) {
    next(error);
  }
});

router.post("/favorites/remove", ensureAuthenticated, validateCsrfToken, async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: "ID do produto é obrigatório." });
  }

  try {
    const updatedUser = await userControllers.getCollection().findOneAndUpdate(
      { _id: new ObjectId(req.userId) },
      { $pull: { favorites: productId } },
      { returnDocument: "after" }
    );

    if (updatedUser) {
      req.session.user = updatedUser; // Atualiza a sessão
      return res.status(200).json({ success: true, message: "Produto removido dos favoritos.", favorites: updatedUser.favorites });
    }
    throw new GeneralError("Usuário não encontrado.", 404);
  } catch (error) {
    next(error);
  }
});

router.post("/cart/add", ensureAuthenticated, validateCsrfToken, async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.userId;

  if (!productId) {
    return res.status(400).json({ success: false, message: "ID do produto é obrigatório." });
  }

  try {
    const updatedUser = await userControllers.getCollection().findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $addToSet: { cart: productId } },
      { returnDocument: "after" }
    );

    if (updatedUser) {
      req.session.user = updatedUser; // Atualiza a sessão
      return res.status(200).json({ success: true, message: "Produto adicionado ao carrinho.", cart: updatedUser.cart });
    }
    throw new GeneralError("Usuário não encontrado.", 404);
  } catch (error) {
    next(error);
  }
});

router.post("/cart/remove", ensureAuthenticated, validateCsrfToken, async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: "ID do produto é obrigatório." });
  }

  try {
    const updatedUser = await userControllers.getCollection().findOneAndUpdate(
      { _id: new ObjectId(req.userId) },
      { $pull: { cart: productId } },
      { returnDocument: "after" }
    );

    if (updatedUser) {
      req.session.user = updatedUser; // Atualiza a sessão
      return res.status(200).json({ success: true, message: "Produto removido do carrinho.", cart: updatedUser.cart });
    }
    throw new GeneralError("Usuário não encontrado.", 404);
  } catch (error) {
    next(error);
  }
});

export default router;
