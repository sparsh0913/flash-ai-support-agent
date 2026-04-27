import { StateGraph, START, END } from "@langchain/langgraph";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { retrievalTool } from "./tools/retrieval.tool.js";
import { model } from "./model.js";
import { State } from "./state.js";

//Router node
export async function routerNode(state: typeof State.State) {

  const SYSTEM_PROMPT = `
You are a routing assistant.

Decide whether the user message needs knowledge-base retrieval.

Return only one word:

query  -> if user asks question, asks info, asks summary, asks help from documents
end    -> if greeting, thanks, casual chat, confirmation, small talk
`;
   
const lastMessage = state.messages[state.messages.length -1];
  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(lastMessage.content as string),
  ]);

  return {
    messages: [new AIMessage(response.content as string)],
  };
}

//Query Node
export async function queryNode(state: typeof State.State){

const messages = state.messages;

const lastHumanMessage = [...messages]
.reverse()
.find((msg) => msg.getType() === 'human');

const SYSTEM_PROMPT = `
You are an expert retrieval query generator.

Your task is to convert a user question into search queries
optimized for vector database retrieval.

Rules:

1. Generate exactly 2 search queries.
2. Keep each query short and keyword-rich.
3. Preserve company names, product names, course names, people names if mentioned.
4. Use alternate wording for broader recall.
5. Do NOT answer the question.
6. Do NOT explain anything.
7. Do NOT use numbering.
8. Output only plain text.
9. One query per line.
10. No extra words before or after output.

Good Example:

User: What is CodersGyan vision?

Output:
codersgyan company vision
codersgyan mission statement

User: Tell me refund policy

Output:
refund policy
payment refund rules
`;

const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(lastHumanMessage?.content as string)
])

 return {
    messages: [new AIMessage(response.content as string)],
  };
}

//Retrieval Node
export async function retrievalNode(state: typeof State.State){

    const messages = state.messages;
    const lastMessage = messages[messages.length-1];
    const content = String(lastMessage.content);

    const queries = content
    .split("\n")
    .map((query) => query.trim())
    .filter(Boolean);

    const userId = state.userId;
  const result = await retrievalTool(queries, userId);

  return {
    messages: [
      new AIMessage(JSON.stringify(result)),
    ],
  };
}

//Draft Node
async function draftNode(state: typeof State.State) {
  const messages = state.messages;

  const lastHumanMessage = [...messages]
    .reverse()
    .find((msg) => msg.getType() === "human");

  const lastMessage = messages[messages.length - 1];

  const retrievedDocs = String(lastMessage.content);

  const SYSTEM_PROMPT = `
You are a reliable AI assistant answering questions using retrieved knowledge.

Your task is to answer the user's question only using the provided retrieved knowledge.

Rules:

1. Use only facts supported by the retrieved knowledge.
2. Do not invent, assume, or guess missing details.
3. If the retrieved knowledge is insufficient, clearly say:
   "I couldn't find enough information in the uploaded documents."
4. Give a direct, clear, helpful answer.
5. Prefer concise responses unless the question requires detail.
6. If multiple relevant points exist, combine them cleanly.
7. Do not mention JSON, vectors, retrieval, internal tools, or system process.
8. Do not say "based on the context provided" unless necessary.
9. Maintain a professional and natural tone.
10. If exact wording exists in retrieved docs, preserve meaning faithfully.

Your priority is factual accuracy over sounding confident.
`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`
USER QUESTION:
${lastHumanMessage?.content}

RETRIEVED KNOWLEDGE:
${retrievedDocs}

Write the best possible answer.
`)
  ]);

 const answer = String(response.content);

return {
  messages: [new AIMessage(answer)],
  finalAnswer: answer,
};
}

//critique node
async function critiqueNode(state: typeof State.State) {
  const messages = state.messages;

  const draftAnswer = messages[messages.length - 1];

  const lastHumanMessage = [...messages]
    .reverse()
    .find((msg) => msg.getType() === "human");

  const SYSTEM_PROMPT = `
You are an answer evaluator.

Decide whether the draft answer is good enough or needs improvement.

Return only one word:

done  -> if the answer clearly addresses the user's question and seems sufficient
retry -> if the answer is weak, incomplete, vague, unsupported, or likely needs better retrieval

Do not explain anything.
Return only: done OR retry
`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(
      `User Question:
${lastHumanMessage?.content}

Draft Answer:
${draftAnswer.content}`
    ),
  ]);

  return {
    messages: [
      new AIMessage(
        String(response.content).trim().toLowerCase()
      ),
    ],
    iterations: state.iterations + 1,
  };
}


//Connect Graph

const graph = new StateGraph(State)

  .addNode("router", routerNode)
  .addNode("query", queryNode)
  .addNode("retrieval", retrievalNode)
  .addNode("draft", draftNode)
  .addNode("critique", critiqueNode)

  .addEdge(START, "router")
  .addEdge("query", "retrieval")
  .addEdge("retrieval", "draft")
  .addEdge("draft", "critique")

    .addConditionalEdges(
    "router",
    (state) => {
      const lastMessage =
        state.messages[state.messages.length - 1];

      const decision = String(
        lastMessage.content
      ).trim().toLowerCase();

      if (decision === "end") {
        return END;
      }

      return "query";
    }
  )

    .addConditionalEdges(
    "critique",
    (state) => {
      const lastMessage =
        state.messages[state.messages.length - 1];

      const decision = String(
        lastMessage.content
      ).trim().toLowerCase();

      if (
        decision === "retry" &&
        state.iterations < 1
      ) {
        return "query";
      }

      return END;
    }
  )
    .compile();

export default graph;