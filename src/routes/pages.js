import express from "express";

import {getHome, getRegister, getLogin, getProfile, changePassword ,getFavoritesPage ,getCartPage, getContact,getAbout,getProducts,getOrders} from "../controllers/pagesControllers.js";

import {
  generateCsrfToken
} from "../middleware/csrfMiddleware.js";
import {checkUserRole,ensureAuthenticated} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(checkUserRole);

router.get("/", generateCsrfToken, getHome);
router.get("/register", getRegister);
router.get("/login", getLogin);

router.get("/contact", getContact);
router.get("/about", getAbout);
router.get("/products", generateCsrfToken, getProducts);

router.get("/profile", ensureAuthenticated,generateCsrfToken,getProfile);
router.get("/orders", getOrders);

router.get("/change-password", generateCsrfToken, changePassword);


router.get('/favorites',generateCsrfToken, getFavoritesPage);
router.get('/cart',generateCsrfToken, getCartPage);



export default router;