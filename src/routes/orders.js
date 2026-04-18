import express from "express";
import { ObjectId } from "mongodb"; // Importar ObjectId
import OrderControllers from "../controllers/orderControllers.js";
import { ensureAuthenticated } from "#src/middleware/authMiddleware.js";
import { validateCsrfToken } from "#src/middleware/csrfMiddleware.js";
import formatters from "#src/utils/formatters.js"; // Importar formatters

const orderControllers = new OrderControllers();
const router = express.Router();

router.post("/", async (req,res)=>{
try{
    const creatOrder = await orderControllers.creatOrder(req,res);
}catch(error){
    console.log(error);
}
});

router.get("/pay/:id", async (req,res)=>{



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