import mongoose from 'mongoose';

const chatShareSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    shareId: {
      type: String,
      unique: true,
      required: true,
    },
    documentName: {
      type: String,
    },
    documentCategory: {
      type: String,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ChatShare', chatShareSchema);
