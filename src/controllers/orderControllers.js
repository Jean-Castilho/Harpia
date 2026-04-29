import { ObjectId } from "mongodb";
import { getDataBase } from "../config/db.js";
import crypto from 'crypto'; // Importar o módulo crypto

import { gerarPix } from './paymantControllers.js';

import { consultarPix } from './paymantControllers.js'; // Importar consultarPix
import { validateOrderItems } from '../services/orderService.js';
import { ValidationError } from "../errors/customErrors.js";
import { GeneralError } from "../errors/customErrors.js";

// Função auxiliar para validar a assinatura do webhook do Mercado Pago
function isValidMercadoPagoSignature(req, secret) {
  const signatureHeader = req.headers['x-signature'];
  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split(',');
  let timestamp = null;
  let signature = null;

  for (const part of parts) {
    if (part.startsWith('ts=')) timestamp = part.substring(3);
    if (part.startsWith('v1=')) signature = part.substring(3);
  }

  if (!timestamp || !signature) {
    console.warn('Cabeçalho x-signature mal formatado ou faltando ts/v1.');
    return false;
  }

  // O ID usado na assinatura é o ID da notificação.
  // O Mercado Pago geralmente usa o ID do payload de notificação no topo do JSON,
  // mas em alguns casos o webhook pode vir apenas com data.id.
  const notificationId = req.body.id || req.body?.data?.id;

  if (!notificationId) {
    console.warn('ID da notificação ausente no corpo da requisição para validação da assinatura.');
    return false;
  }

  const signedContent = `id:${notificationId};ts:${timestamp};`; // Conteúdo a ser assinado
  const hmac = crypto.createHmac('sha256', secret).update(signedContent).digest('hex');
  return hmac === signature;
}

// Helper function for retries
async function retryOperation(operation, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) {
        throw error; // Re-throw if it's the last attempt
      }
      console.warn(`Tentativa ${i + 1} falhou. Retentando em ${delay / 1000}s...`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

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

  /**
   * Obtém um pedido pelo seu ID.
   * @param {string} id - O ID do pedido.
   * @returns {Promise<object|null>} O objeto do pedido ou null se não encontrado.
   * @throws {ValidationError} Se o ID do pedido for inválido.
   */
  async getOrderById(id) {
    if (!ObjectId.isValid(id)) {
      throw new ValidationError("ID de pedido inválido.");
    }
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  };
  
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
  };

  async cancelOrder(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new ValidationError("ID de pedido inválido.");
      }

      const objectId = new ObjectId(id);
      const result = await this.getCollection().updateOne(
        { _id: objectId },
        { $set: { status: 'cancelled', updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        throw new ValidationError("Pedido não encontrado ou já cancelado.");
      }
      
      return { message: "Pedido cancelado com sucesso." };
    } catch (error) {
      throw error; // Re-throw the error for the caller to handle
    }
  };

  /**
   * Confirma o pagamento de um pedido e atualiza seu status.
   * @param {string} orderId - O ID do pedido a ser confirmado.
   * @param {object} paymentDetails - Detalhes adicionais do pagamento (ex: ID da transação do gateway).
   * @returns {Promise<object>} Um objeto com uma mensagem de sucesso.
   * @throws {ValidationError} Se o ID do pedido for inválido, o pedido não for encontrado, ou já estiver pago.
   */
  async confirmPayment(orderId, mercadoPagoPaymentInfo = {}) {
    if (!ObjectId.isValid(orderId)) {
      throw new ValidationError("ID de pedido inválido.");
    }

    const objectId = new ObjectId(orderId);

    // Prepara o objeto de atualização
    const update = {
      $set: {
        status: 'paid', // Atualiza o status principal do pedido para 'paid'
        updatedAt: new Date(),
      }
    };

    // Atualiza campos específicos dentro do subdocumento 'payment.data'
    // Isso garante que as novas informações sejam mescladas com os dados de pagamento existentes
    if (mercadoPagoPaymentInfo.status) {
      update.$set['payment.data.status'] = mercadoPagoPaymentInfo.status;
    }
    if (mercadoPagoPaymentInfo.date_approved) {
      update.$set['payment.data.date_approved'] = new Date(mercadoPagoPaymentInfo.date_approved);
    }
    if (mercadoPagoPaymentInfo.transaction_amount) {
      update.$set['payment.data.transaction_amount'] = mercadoPagoPaymentInfo.transaction_amount;
    }
    // Adicione outros campos relevantes do objeto paymentInfo do Mercado Pago que você deseja armazenar
    // Ex: transaction_details, payer, etc.
    if (mercadoPagoPaymentInfo.transaction_details) {
      update.$set['payment.data.transaction_details'] = mercadoPagoPaymentInfo.transaction_details;
    }

    const result = await this.getCollection().updateOne(
      { _id: objectId, status: { $ne: 'paid' } }, // Garante que só atualiza se não estiver 'paid'
      update
    );

    if (result.matchedCount === 0) {
      const order = await this.getCollection().findOne({ _id: objectId });
      if (order && order.status === 'paid') throw new ValidationError("Pedido já está com status de pago.");
      throw new ValidationError("Pedido não encontrado ou não pôde ser atualizado.");
    }
    return { message: "Pagamento confirmado e status da ordem atualizado com sucesso." };
  }

  /**
   * Obtém um pedido pelo ID de pagamento do Mercado Pago.
   * @param {string} mercadoPagoPaymentId - O ID de pagamento retornado pelo Mercado Pago.
   * @returns {Promise<object|null>} O objeto do pedido ou null se não encontrado.
   */
  async getOrderByMercadoPagoPaymentId(mercadoPagoPaymentId) {
    if (!mercadoPagoPaymentId) {
      throw new ValidationError("ID de pagamento do Mercado Pago inválido.");
    }
    return await this.getCollection().findOne({ 'payment.data.id': mercadoPagoPaymentId });
  }

  /**
   * Lida com as notificações de webhook do Mercado Pago para atualizar o status do pedido.
   *
   * Para a validação da assinatura do webhook, o Mercado Pago envia um cabeçalho 'x-signature' que contém
   * um timestamp (ts) e uma assinatura (v1). A assinatura é um HMAC-SHA256 do conteúdo `id:{notification_id};ts:{timestamp};`
   * usando a chave secreta do webhook. O `notification_id` é o campo `id` do payload do webhook.
   *
   * @param {object} req - O objeto de requisição do Express.
   * @param {object} res - O objeto de resposta do Express.
   */
  async handleMercadoPagoWebhook(req, res) {
    const { type, topic, data, id: notificationId } = req.body;
    const eventType = type || topic;
    const mercadoPagoPaymentId = data?.id || req.body?.id;

    console.log('Webhook do Mercado Pago recebido:', {
      eventType,
      notificationId,
      dataId: data?.id,
      fallbackId: req.body?.id,
    });

    // --- CRÍTICO: Validação da Assinatura do Webhook ---
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('MERCADOPAGO_WEBHOOK_SECRET não está configurado. A validação da assinatura do webhook será ignorada.');
      // Em um ambiente de produção, você pode querer lançar um erro ou retornar 500 aqui.
    } else {
      if (!isValidMercadoPagoSignature(req, webhookSecret)) {
        console.warn('Webhook recebido com assinatura inválida.');
        return res.status(403).send('Assinatura inválida');
      }
    }
    
    if ((eventType === 'payment' || eventType === 'payment.created' || eventType === 'payment.updated') && mercadoPagoPaymentId) {
      try {
        // Consulta o status oficial do pagamento no Mercado Pago para evitar inconsistências
        const paymentInfo = await retryOperation(async () => {
          return await consultarPix(mercadoPagoPaymentId);
        }, 5, 2000); // 5 retries, 2-second delay between retries

        if (paymentInfo && !paymentInfo.error && (paymentInfo.status === 'approved' || paymentInfo.status === 'paid')) {
          const order = await this.getOrderByMercadoPagoPaymentId(mercadoPagoPaymentId);

          if (order) {
            await this.confirmPayment(order._id.toString(), paymentInfo); // Passa o objeto completo paymentInfo
            console.log(`Pedido ${order._id} atualizado para 'paid' via webhook.`);
          } else {
            console.warn(`Pedido não encontrado para o ID de pagamento do Mercado Pago: ${mercadoPagoPaymentId}`);
          }
        } else if (paymentInfo && paymentInfo.error) {
          console.warn(`Consulta de pagamento retornou erro para ID ${mercadoPagoPaymentId}:`, paymentInfo.error);
        }
      } catch (error) {
        console.error(`Erro ao processar webhook para pagamento ${mercadoPagoPaymentId}:`, error);
      }
    } else {
      console.warn('Webhook ignorado por não ser evento de pagamento ou por faltar ID:', { eventType, mercadoPagoPaymentId });
    }

    res.status(200).send('OK'); // Sempre responda com 200 OK para o Mercado Pago
  }
}