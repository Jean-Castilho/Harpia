import express from "express";

import UserControllers from "../controllers/userControllers.js";

const userControllers = new UserControllers()
const router = express.Router();

router.get("/", async (req, res) =>{
    const allUsers = await userControllers.allUsers();

    res.json({allUsers});

})

router.post("/register", async (req, res) => {
    const creatUser = await userControllers.creatUser(req,res);
    res.json({creatUser});
});

export default router;