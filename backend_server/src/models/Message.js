const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, default: 'global', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    username: { type: String, required: true }, // denormalized for faster rendering
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

MessageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
