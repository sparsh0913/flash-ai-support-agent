import { graph } from "./graph.js";

export async function runResearch(query: string) {
  const app = graph.compile();

  const stream = await app.stream({
    messages: [
      {
        role: "user",
        content: query,
      },
    ],
  },{
    streamMode:"messages"
  });

    return stream;
}