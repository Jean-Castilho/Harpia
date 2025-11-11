import express from "express";
import UserControllers from "../controllers/userControllers.js";

const userControllers = new UserControllers();

const router = express.Router();

router.post("/regist
    er", async (req, res) => {

    const creatUser = await userControllers.creatUser(req, res);

    return res.cookie("token", creatUser.token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    }).json({ message: "Usuário criado com sucesso.", user: creatUser.user }).status(201);

});



export default router;