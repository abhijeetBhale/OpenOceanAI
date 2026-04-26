import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
  {
    sessionKey: {
      type: String,
      unique: true,
      required: true,
    },
    docInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    messages: {
      type: Array,
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ChatSession", chatSessionSchema);
