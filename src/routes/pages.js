import express from "express";

import {checkUserRole} from "../middleware/authMiddleware.js";
import {getHome, getRegister, getLogin, getProfile, changePassword ,getFavoritesPage ,getCartPage} from "../controllers/pagesControllers.js";

import {
  generateCsrfToken
} from "../middleware/csrfMiddleware.js";

const router = express.Router();

router.use(checkUserRole);

router.get("/", generateCsrfToken, getHome);
router.get("/register", getRegister);
router.get("/login", getLogin);

router.get("/profile", generateCsrfToken,getProfile);
router.get("/change-password", generateCsrfToken, changePassword);

router.get('/favorites', getFavoritesPage);
router.get('/cart', getCartPage);



export default router;