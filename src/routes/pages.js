import express from "express";

import { 
  getHome, 
  getRegister,
  getLogin, 
  getContact,
  getAbout,
  getProducts,
  getProfile,
  getSolicitOtp,
  getVerifyOtp,
  getFavoritesPage, 
  getCartPage, 
  getOrders, 
  getCheckout
  } from "../controllers/pagesControllers.js";

  import {
    postSendFedBack,
  } from "../controllers/ContactControllers.js";

import {
  generateCsrfToken,
  validateCsrfToken
} from "../middleware/csrfMiddleware.js";

import { checkUserRole, ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(checkUserRole);

router.get("/", generateCsrfToken, getHome);
router.get("/register", getRegister);
router.get("/login", getLogin);

router.get("/profile", ensureAuthenticated, generateCsrfToken, getProfile);

router.get("/solicit-otp", generateCsrfToken, getSolicitOtp);
router.get("/verify-otp", getVerifyOtp);

/*
router.get("/reset-password", generateCsrfToken, getResetPassword);
router.post("/atualiz", generateCsrfToken, getSolicit_otp);
*/

router.get("/contact", getContact);
router.post("/send-fedback", postSendFedBack);

router.get("/about", getAbout);
router.get("/products", generateCsrfToken, getProducts);

router.get("/orders", getOrders);

router.get('/favorites', generateCsrfToken, getFavoritesPage);
router.get('/cart', generateCsrfToken, getCartPage);

router.get("/checkout/:id", getCheckout);



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