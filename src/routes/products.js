import express from "express";
import ProductControllers from "../controllers/productControllers.js";

const productControllers = new ProductControllers();

const router = express.Router();

router.get("/", async (req, res) => {
  const allProducts = await productControllers.allProducts();

  console.log(allProducts);

  res.status(201).json(allProducts);
});

export default router;
