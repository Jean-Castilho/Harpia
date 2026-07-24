import { ObjectId } from "mongodb";
import ProductControllers from "../controllers/productControllers.js";
import { GeneralError } from "../errors/customErrors.js";

const productControllers = new ProductControllers();

export const validateOrderItems = async (items) => {
  // Validar e mapear IDs para ObjectId, ignorando IDs inválidos
  const productIds = items.map(item => {
    if (!ObjectId.isValid(item.id)) {
      throw new GeneralError(`ID de produto inválido encontrado: ${item.id}`, 400);
    }
    return new ObjectId(item.id);
  });

  const productsSelec = await productControllers.getCollection().find({ _id: { $in: productIds } }).toArray();

  if (!productsSelec || productsSelec.length === 0) {
    throw new GeneralError('Não foi possível validar os produtos do carrinho. Nenhum produto encontrado.', 404);
  }

  const foundIds = productsSelec.map(p => p._id.toString());
  const notFound = items.filter(item => !foundIds.includes(item.id));

  if (notFound.length > 0) {
    const notFoundIds = notFound.map(item => item.id).join(', ');
    throw new GeneralError(`Os seguintes produtos não foram encontrados: ${notFoundIds}`, 404);
  }

  const itemsResumidos = productsSelec.map(item => {
    const cartItem = items.find(cartItem => cartItem.id === item._id.toString());
    return {
      id: item._id,
      nome: item.nome,
      preco: item.preco, // Certifique-se de que o preço vem do banco de dados, não do cliente
      quantidade: cartItem ? cartItem.quantity : 0,
      garantia: item.garantia,
      imagens: item.imagens,
    };
  });

  return itemsResumidos;
};