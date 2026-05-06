import mongoose from "mongoose";

/* const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false }
); */

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      default: "", 
    },

    type: {
      type: String,
      enum: ["text", "pdf"],
      default: "text",
    },

    fileName: {
      type: String,
    },

    fileUrl: {
      type: String,
    },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mode: {
      type: String,
      enum: ["vault", "research", "manager", "chat"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      default: "New Chat",
    },

    messages: {
    type: [messageSchema],
     default: [],
  }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Chat", chatSchema);