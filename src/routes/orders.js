import express from "express";
import OrderControllers from "../controllers/orderControllers.js";

const orderControllers = new OrderControllers();
const router = express.Router();

router.post("/", async (req,res)=>{
try{
    const creatOrder = await orderControllers.creatOrder(req,res);
}catch(error){
    console.log(error);
}
});

export default router;