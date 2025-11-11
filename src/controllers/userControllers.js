
import { getDataBase } from "../config/db.js";
import { validationUser, criarHashPass, creatToken } from "../services/validationData.js";

export default class UserControllers {
  
  getCollection() {
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
    dataUser.email = String(dataUser.email).trim().toLowerCase();
    dataUser.phone = String(dataUser.phone).trim();

    const validation = validationUser(dataUser);

    if (!validation.valid) {
      return res.status(400).json({ message: validation.messagem });
    };
    const userExists = await this.verifieldUser({ email: dataUser.email, phone: dataUser.phone });

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

      orderns: [],
      cart: [],
      favorites: [],
    }

    const newUser = await this.getCollection().insertOne(userCreated);

    console.log(newUser);

    const token = creatToken({
      _id: newUser.insertedId,
      email: userCreated.email.endereco,
    });

    req.session.user = newUser;

    return { messagem: "Usuário criado com sucesso.", token: token , user: userCreated };

  }

  async verifieldUser({ email, phone } = {}) {
    const query = {};
    if (email) query["email"] = email;
    if (phone) query["phone"] = phone;
    if (Object.keys(query).length === 0) return null;

    const user = await this.getCollection().findOne(query);

    return user;
}

}