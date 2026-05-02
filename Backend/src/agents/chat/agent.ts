import { graph } from "./graph.js";

export async function runChat(query: string) {
  const stream = await graph.stream({
    messages: [
      {
        role: "user",
        content: query
      }
    ]
  },{
      streamMode:"messages"
    });

 /*  const lastMessage = result.messages[result.messages.length - 1] as any;

  return lastMessage.content; */
  return stream;
}