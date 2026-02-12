const WebSocket = require('ws');
const { verifyToken } = require('../utils/jwt');
const Message = require('../models/Message');

const CLIENTS = new Set();

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

function send(ws, payload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const client of CLIENTS) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

/**
 * PUBLIC_INTERFACE
 * Attach a WebSocket server to an existing HTTP server.
 *
 * Client should connect:
 *   ws(s)://<host>/ws?token=<JWT>&roomId=global
 *
 * Incoming messages:
 *   { "type": "message", "text": "hello", "roomId": "global" }
 *
 * Outgoing messages:
 *   { "type":"message", "message": { id, roomId, userId, username, text, createdAt } }
 */
function attachWebSocketServer(httpServer) {
  const wss = new WebSocket.Server({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    const roomId = (url.searchParams.get('roomId') || 'global').toString();

    if (!token) {
      send(ws, { type: 'error', message: 'Missing token' });
      ws.close(1008, 'Missing token');
      return;
    }

    let user;
    try {
      const decoded = verifyToken(token);
      user = { userId: decoded.userId, username: decoded.username };
    } catch (err) {
      send(ws, { type: 'error', message: 'Invalid token' });
      ws.close(1008, 'Invalid token');
      return;
    }

    ws._chat = { user, roomId };
    CLIENTS.add(ws);

    send(ws, { type: 'ready', user, roomId });

    ws.on('message', async (data) => {
      const parsed = safeJsonParse(data.toString());
      if (!parsed || typeof parsed !== 'object') {
        send(ws, { type: 'error', message: 'Invalid JSON' });
        return;
      }

      if (parsed.type !== 'message') {
        send(ws, { type: 'error', message: 'Unsupported message type' });
        return;
      }

      const text = (parsed.text || '').toString().trim();
      const msgRoomId = (parsed.roomId || ws._chat.roomId || 'global').toString();

      if (!text) {
        send(ws, { type: 'error', message: 'text is required' });
        return;
      }

      // Persist message
      const saved = await Message.create({
        roomId: msgRoomId,
        userId: user.userId,
        username: user.username,
        text,
      });

      broadcast({
        type: 'message',
        message: {
          id: String(saved._id),
          roomId: saved.roomId,
          userId: String(saved.userId),
          username: saved.username,
          text: saved.text,
          createdAt: saved.createdAt,
        },
      });
    });

    ws.on('close', () => {
      CLIENTS.delete(ws);
    });

    ws.on('error', () => {
      CLIENTS.delete(ws);
    });
  });

  return wss;
}

module.exports = {
  attachWebSocketServer,
};
