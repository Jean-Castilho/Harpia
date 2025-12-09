import { ObjectId } from "mongodb";
import { getDataBase } from "../config/db.js";

import { validateOrderItems } from '../services/orderService.js';
import { sendSuccess } from "../services/responseService.js";

export default class OrderControllers {
  getCollection() {
    const db = getDataBase();
    return db.collection("orders");
  };

  async getOrdersByUserId(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuário inválido");
    }

    const objectId = new ObjectId(userId);
    const orders = await this.getCollection().find({ userId: objectId }).toArray();
    return orders;
  }

  async creatOrder(req, res) {
    const validatedItems = await validateOrderItems(req.body.items);
    const { _id, name, role, phone } = req.session.user;

    const payment_data = {
      description: 'Pagamento PIX - Encanto Rústico',
      payment_method: 'pix',
    };

    const number = phone.number;

    const payloadOrder = {
      user: { _id, name, role, number },
      endereco: {},
      payment: payment_data,
      items: validatedItems,
  
      createdAt: new Date(),
      updatedAt: new Date
    };
    
    const orderCreat = await this.getCollection().insertOne(payloadOrder);
    console.log("order creat",orderCreat);

    return res.redirect(`/checkout/${orderCreat.insertedId.toString()}`);

  };

  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        throw new ValidationError("ID de pedido inválido.");
      }
      const order = await this.getCollection().findOne({ _id: new ObjectId(id) });
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }
}