
import { getDataBase } from "../config/db.js";
import { validationUser, criarHashPass, creatToken } from "../services/validationData.js";

export default class UserControllers {
  constructor(parameters) {

  }

  async getCollection() {
    const db = getDataBase();
    return db.collection("users");
  }

  async allUsers() {

    return await this.getCollection().find().toArray()

  }

  async creatUser(req, res) {

    const dataUser = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    };

    console.log(dataUser);
    
    dataUser.email = String(dataUser.email).trim().toLowerCase();
    dataUser.phone = String(dataUser.phone).trim();

    const validation = validationUser(dataUser);

    if (!validation.valid) {
      return res.status(400).json({ message: validation.messagem });
    };

    const userExists = await this.verifieldUser({ email: dataUser.email, number: dataUser.phone });

    if (userExists) {
      return res.status(409).json({ message: "Usuário já existe." });
    };

    dataUser.password = await criarHashPass(dataUser.password);

    const userCreated = {
      name: dataUser.name,
      password: dataUser.password,
      phone: { verified: false, number: dataUser.phone},
      email: { verified: false, endereco: dataUser.email },

      role: "user",
      isActive: true,

      createdAt: new Date(),
      updatedAt: new Date(),

      pedidos: [],
      cart: [],
      favorites: [],
    }

    const newUser = await this.getCollection().insertOne(userCreated);

    const token = creatToken({
      _id: newUser.insertedId,
      email: newUser.email.endereco,
    });

    
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });

    req.session.user = newUser;

    return { messagem: "Usuário criado com sucesso.", token: token , user: userCreated };

  }


  async verifieldUser({ email, number } = {}) {
    const query = {};
    if (email) query["email"] = email;
    if (number) query["phone"] = number;
    if (Object.keys(query).length === 0) return null;
    const user = await this.getCollection().findOne(query);
    return user;
}

}