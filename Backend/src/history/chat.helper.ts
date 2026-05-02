import Chat from "../auth/models/chat.model.js";

export async function createChat(
  userId: string,
  mode: string,
  firstMessage: string
) {
  const title = firstMessage.trim().slice(0, 40);

  const chat = await Chat.create({
    userId,
    mode,
    title: title || "New Chat",
    messages: [],
  });

  return chat;
}