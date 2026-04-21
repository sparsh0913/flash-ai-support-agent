import { StateGraph, START, END, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import { model } from "../../config/model.js";

const searchTool = new TavilySearch({
  maxResults: 3,
  topic:"general"
});

const toolNode = new ToolNode([searchTool]);

const llmWithTools = model.bindTools([searchTool]);


const State = MessagesAnnotation;
  const currentDateTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata"
  });
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;


async function chatBot(state: typeof MessagesAnnotation.State){
  const SYSTEM_PROMPT = `
You are a smart AI assistant.

You can use web search tools when user asks for:
- latest news
- recent updates
- current prices
- live information

Otherwise answer normally and clearly.

Current Time Zone: ${timeZone}
Current Date & Time: ${currentDateTime}
`;



  const response = await llmWithTools.invoke([
    {
      role: "system",
      content: SYSTEM_PROMPT
    },
    ...state.messages
  ]);

  return {
    messages: [response]
  };
}


function shouldContinue(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as any;

  if (lastMessage.tool_calls?.length) {
    return "tools";
  }

  return "__end__";
}

export const graph = new StateGraph(MessagesAnnotation)

.addNode("chatbot", chatBot)
.addNode("tools", toolNode)

.addEdge(START, "chatbot")

.addConditionalEdges("chatbot", shouldContinue , {
    tools: "tools",
    __end__: END
})

.addEdge("tools", "chatbot")

.compile();