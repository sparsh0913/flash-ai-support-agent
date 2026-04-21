import "dotenv/config";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tools } from "../tools/tool.js";
import { AIMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { model } from "../config/model.js";

const toolModel = model.bindTools(tools);

//Assistant node
async function callModel(state : typeof MessagesAnnotation.State){

const response = await toolModel.invoke(state.messages);
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

