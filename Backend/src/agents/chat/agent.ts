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

  return stream;
}