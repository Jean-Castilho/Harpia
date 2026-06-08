import WebSocket from 'ws';

const clients = new Set();

export function registerWebSocketClient(ws, orderId) {
  ws.orderId = orderId;
  clients.add(ws);
}

export function unregisterWebSocketClient(ws) {
  clients.delete(ws);
}

export function broadcastPaymentStatusUpdate(orderId, payload) {
  const message = JSON.stringify({ type: 'paymentStatus', orderId, ...payload });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN && client.orderId === orderId) {
      client.send(message);
    }
  }
}
