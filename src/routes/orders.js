import express from "express";
import { ObjectId } from "mongodb"; // Importar ObjectId
import OrderControllers from "../controllers/orderControllers.js";
import { ensureAuthenticated } from "#src/middleware/authMiddleware.js";
import { ensureAdmin } from "#src/middleware/authMiddleware.js"; // Import ensureAdmin
import { validateCsrfToken } from "#src/middleware/csrfMiddleware.js";
import formatters from "#src/utils/formatters.js"; // Importar formatters

const orderControllers = new OrderControllers();
const router = express.Router();

router.post("/", async (req,res,next)=>{
  try {
      await orderControllers.creatOrder(req,res);
  } catch (error) {
      next(error); // Pass error to the error handling middleware
  }
});

router.post("/webhook/mercadopago", async (req, res, next) => {
  try {
    await orderControllers.handleMercadoPagoWebhook(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/pay/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send('ID de pedido inválido.');
    }
    return res.redirect(`/payment/${id}`);
  } catch (error) {
    next(error);
  }
});

router.post("/cancel/:id", ensureAuthenticated, validateCsrfToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const objectId = new ObjectId(id); // Converter o ID para ObjectId
    await orderControllers.cancelOrder(id);

    const updatedOrder = await orderControllers.getCollection().findOne({ _id: objectId });
    if (req.headers['hx-request']) {
      // Se for uma requisição HTMX, envia de volta uma atualização parcial para o status
      return res.status(200).send(formatters.statusLabel(updatedOrder.status));
    }
    // Para requisições não-HTMX, redireciona
    res.redirect("/orders");
  } catch (error) {
    next(error);
  }
});


export default router;