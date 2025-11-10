import express from "express";

import {checkUserRole} from "../middleware/authMiddleware.js";
import {getHomePage} from "../controllers/pagesControllers.js";

const router = express.Router();

router.use(checkUserRole);

router.get("/", getHomePage)

export default router;