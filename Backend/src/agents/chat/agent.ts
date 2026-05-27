import { graph } from "./graph.js";


export async function runChat(query: string,threadId: string) {
  const stream = await graph.stream({
    messages: [
      {
        role: "user",
        content: query
      }
    ]
  },{
      streamMode:"messages",
       configurable: {
   thread_id: threadId
  }
    });

  return stream;
}