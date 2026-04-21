import { graph } from "./graph.js";

export async function runChat(query: string) {
  const result = await graph.invoke({
    messages: [
      {
        role: "user",
        content: query
      }
    ]
  });

  const lastMessage = result.messages[result.messages.length - 1] as any;

  return lastMessage.content;
}