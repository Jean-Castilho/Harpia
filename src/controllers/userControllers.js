import { getDataBase } from "../config/db.js";


export default class UserControllers {
    constructor(parameters) {
        
    }

    getCollection() {
    const db = getDataBase();
    return db.collection("users");
  }
    
    async allUsers (){

        return await this.getCollection().find().toArray()

    }

    async creatUser (req,res){

      const dataUser = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
      }

      return await this.getCollection().insertOne(dataUser);

    }

}