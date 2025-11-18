import express from "express";
import multer from 'multer';
import {
    generateCsrfToken,
    validateCsrfToken
} from '../middleware/csrfMiddleware.js';



const router = express.Router();

import {
    getAdminDashboard,
    getInventoryPage,
    getOrdersPage,
    getUsersPage,
    getAddProductPage,
    deleteProduct,
    getDelivery
} from '../controllers/adminControllers.js';

router.get('/dashboard', getAdminDashboard);
router.get('/inventory', generateCsrfToken, getInventoryPage);
router.get('/orders', getOrdersPage); 
router.get('/users', getUsersPage);

router.get('/add-product', generateCsrfToken,  getAddProductPage);

router.get('/delivery', getDelivery);

router.delete('/delete-product/:id', validateCsrfToken, deleteProduct);


export default router;