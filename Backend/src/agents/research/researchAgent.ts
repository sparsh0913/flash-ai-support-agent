import { graph } from "./graph.js";

export async function runResearch(query: string) {
  const app = graph.compile();

  const result = await app.invoke({
    messages: [
      {
        role: "user",
        content: query,
      },
    ],
  });

  const lastMessage = result.messages[result.messages.length - 1].content;

  try {
   return JSON.parse(lastMessage as string);
} catch {
   return { answer: lastMessage };
}
}