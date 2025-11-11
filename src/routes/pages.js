import express from "express";

import {checkUserRole} from "../middleware/authMiddleware.js";
import {getHome, getRegister, getLogin} from "../controllers/pagesControllers.js";

const router = express.Router();

router.use(checkUserRole);

router.get("/", getHome);
router.get("/register", getRegister);
router.get("/login", getLogin);


export default router;