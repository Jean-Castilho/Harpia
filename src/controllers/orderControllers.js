import { ObjectId } from "mongodb";
import { getDataBase } from "../config/db.js";

export default class ProductController {
  getCollection() {
    const db = getDataBase();
    return db.collection("orders");
  }

  async allOrders() {
    return this.getCollection().find({}).toArray();
  }

}