import express from "express";
import UserControllers from "../controllers/userControllers.js";

const userControllers = new UserControllers();

const router = express.Router();

router.post("/register", async (req, res) => {

    const creatUser = await userControllers.creatUser(req, res);

    return res.status(201).json({ message: "Usuário criado com sucesso.", user: creatUser.user });

});



export default router;