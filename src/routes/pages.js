import express from "express";

import {checkUserRole} from "../middleware/authMiddleware.js";
import {getHome, getRegister, getLogin, getProfile} from "../controllers/pagesControllers.js";

import {
  generateCsrfToken
} from "../middleware/csrfMiddleware.js";

const router = express.Router();

router.use(checkUserRole);

router.get("/", getHome);
router.get("/register", getRegister);
router.get("/login", getLogin);
router.get("/profile", generateCsrfToken,getProfile);


export default router;