import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tools } from "./tool.js";
import { AIMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { writeFileSync } from "node:fs";

//initialise the LLM
const model = new ChatGroq({
   /*  model: "llama-3.1-8b-instant", */ //better 
                /* "llama-3.3-70b-versatile", */
   model: "llama-3.1-8b-instant",
    temperature: 0,
    maxTokens:1024,
    apiKey:process.env.GROQ_API_KEY
}).bindTools(tools);


//Assistant node
async function callModel(state : typeof MessagesAnnotation.State){

const response = await model.invoke(state.messages);
return {messages:[response]};
}

//tool node
const toolNode = new ToolNode(tools);

//conditional edge logic\
function shouldContinue(state:typeof MessagesAnnotation.State){

const lastMessage = state.messages[state.messages.length-1] as AIMessage;

if(lastMessage.tool_calls?.length){
    return 'tools'
}  

     // If model is requesting a tool → go to tools
   // Only allow tool call if last message is from AI
 /*  if (
    lastMessage instanceof AIMessage &&
    lastMessage.tool_calls?.length
  ) {
    return "tools";
  } */
   return  '__end__'

}

const graph = new StateGraph(MessagesAnnotation)
.addNode("assistant" , callModel)
.addNode("tools" , toolNode)
.addEdge("__start__", "assistant")
.addEdge("tools","assistant")
.addConditionalEdges("assistant",shouldContinue,{
    __end__ : END,
    tools: 'tools'
})

const checkpointer = new MemorySaver();
export const agent = graph.compile({checkpointer});

