import express from "express";

import {checkUserRole} from "../middleware/authMiddleware.js";
import {getHome, getRegister} from "../controllers/pagesControllers.js";

const router = express.Router();

router.use(checkUserRole);

router.get("/", getHome);
router.get("/register", getRegister);

export default router;