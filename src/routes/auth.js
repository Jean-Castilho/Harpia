import express from "express";
import UserControllers from "../controllers/userControllers.js";
// 1. Importe o middleware de validação CSRF
import {
  validateCsrfToken,
  generateCsrfToken,
} from "../middleware/csrfMiddleware.js";

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
