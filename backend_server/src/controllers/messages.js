const Message = require('../models/Message');

class MessagesController {
  /**
   * PUBLIC_INTERFACE
   * Get recent messages for a room.
   */
  async list(req, res, next) {
    try {
      const roomId = (req.query.roomId || 'global').toString();
      const limitRaw = Number(req.query.limit || 50);
      const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;

      const messages = await Message.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      // Reverse to chronological order for client rendering
      const ordered = messages.reverse().map((m) => ({
        id: String(m._id),
        roomId: m.roomId,
        userId: String(m.userId),
        username: m.username,
        text: m.text,
        createdAt: m.createdAt,
      }));

      return res.status(200).json({ status: 'ok', messages: ordered });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Post a message to a room (REST).
   * Note: WebSocket is the preferred real-time path; this exists for completeness.
   */
  async create(req, res, next) {
    try {
      const { roomId = 'global', text } = req.body || {};
      if (!text || !text.toString().trim()) {
        return res.status(400).json({ status: 'error', message: 'text is required' });
      }

      const msg = await Message.create({
        roomId: roomId.toString(),
        userId: req.user.userId,
        username: req.user.username,
        text: text.toString().trim(),
      });

      return res.status(201).json({
        status: 'ok',
        message: {
          id: String(msg._id),
          roomId: msg.roomId,
          userId: String(msg.userId),
          username: msg.username,
          text: msg.text,
          createdAt: msg.createdAt,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new MessagesController();
