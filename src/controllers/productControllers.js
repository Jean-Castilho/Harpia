import { getDataBase } from "../config/db.js";

export default class ProductController {
  getCollection() {
    const db = getDataBase();
    return db.collection("products");
  }

  async AllProducts() {
    return this.getCollection().find({}).toArray();
  }
}
