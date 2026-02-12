const express = require('express');
const healthController = require('../controllers/health');
const authController = require('../controllers/auth');
const messagesController = require('../controllers/messages');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: alice
 *               email:
 *                 type: string
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/auth/signup', authController.signup.bind(authController));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with username or email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Logged in
 */
router.post('/auth/login', authController.login.bind(authController));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Unauthorized
 */
router.get('/auth/me', requireAuth, authController.me.bind(authController));

/**
 * @swagger
 * /messages:
 *   get:
 *     tags: [Messages]
 *     summary: Get recent messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *         description: Room id (default global)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max messages (default 50, max 200)
 *     responses:
 *       200:
 *         description: List of messages
 *       401:
 *         description: Unauthorized
 */
router.get('/messages', requireAuth, messagesController.list.bind(messagesController));

/**
 * @swagger
 * /messages:
 *   post:
 *     tags: [Messages]
 *     summary: Post a message (REST)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               roomId:
 *                 type: string
 *                 example: global
 *               text:
 *                 type: string
 *                 example: Hello everyone!
 *     responses:
 *       201:
 *         description: Message created
 *       401:
 *         description: Unauthorized
 */
router.post('/messages', requireAuth, messagesController.create.bind(messagesController));

/**
 * @swagger
 * /ws-help:
 *   get:
 *     tags: [WebSocket]
 *     summary: WebSocket connection help
 *     description: |
 *       Connect to WebSocket at `/ws`:
 *       - URL: `ws(s)://<host>/ws?token=<JWT>&roomId=global`
 *       - Send: `{ "type": "message", "text": "hello", "roomId": "global" }`
 *       - Receive: `{ "type":"message", "message": { ... } }`
 *     responses:
 *       200:
 *         description: WebSocket usage info
 */
router.get('/ws-help', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    websocket: {
      path: '/ws',
      query: { token: '<JWT>', roomId: 'global' },
      send: { type: 'message', text: 'hello', roomId: 'global' },
    },
  });
});

module.exports = router;
