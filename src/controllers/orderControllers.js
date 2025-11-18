import { ObjectId } from "mongodb";
import { getDataBase } from "../config/db.js";

export default class OrderControllers {
  getCollection() {
    const db = getDataBase();
    return db.collection("orders");
  }

}