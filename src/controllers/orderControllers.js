import { ObjectId } from "mongodb";
import { getDataBase } from "../config/db.js";

import { gerarPix } from './paymantControllers.js';

import { validateOrderItems } from '../services/orderService.js';
import { sendSuccess } from "../services/responseService.js";
import { ValidationError } from "../errors/customErrors.js";

export default class OrderControllers {
  getCollection() {
    const db = getDataBase();
    return db.collection("orders");
  };

  async getOrdersByUserId(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuário inválido");
    }
    const orders = await this.getCollection().find({ "user._id": userId }).toArray();
    return orders;
  }

  async creatOrder(req, res) {
    const validatedItems = await validateOrderItems(req.body.items);
    const { _id, name, role, phone } = req.session.user;

    const totalPrice = validatedItems.reduce((acc, item) => acc + item.preco * Number(item.quantidade), 0);

    const number = phone.number;
    const data = await gerarPix(totalPrice);

    const payment_data = {
      description: 'Pagamento PIX - Encanto Rústico',
      payment_method: 'pix',
      data,
    };
    const payloadOrder = {
      user: { _id, name, role, number },
      endereco: {},
      payment: payment_data,
      items: validatedItems,
      valor: totalPrice,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const orderCreat = await this.getCollection().insertOne(payloadOrder);

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
  
  async getOrderByIdUser(req, res, next) {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        throw new ValidationError("ID de usuário inválido.");
      }
      const orders = await this.getCollection().find({ "user._id": new ObjectId(id) }).toArray();
      
      console.log("Orders to User:", orders)
      
      return sendSuccess(res, orders);
    } catch (error) {
      next(error);
    }
  }
}