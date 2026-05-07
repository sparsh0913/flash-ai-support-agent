import "dotenv/config";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
/* import { ToolNode } from "@langchain/langgraph/prebuilt"; */
import { tools } from "./tool.js";
import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { model } from "../../config/model.js";
import { Annotation } from "@langchain/langgraph";

async function runTools(state: typeof CalendarState.State) {
  console.log("RUNTOOLS STATE USERID:", state.userId);
   const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
   const toolCalls = lastMessage.tool_calls || [];
   const outputs = [];

   for (const toolCall of toolCalls) {
      const tool:any = tools.find(t => t.name === toolCall.name);
      if (!tool) continue;

      const result = await tool.invoke({
         ...toolCall.args,
         userId: state.userId
      });

      outputs.push(
   new ToolMessage({
      tool_call_id: toolCall.id!,
      content: result
   })
);
   }
   return {
      messages: outputs,
      userId: state.userId
   };
}

const CalendarState = Annotation.Root({
   ...MessagesAnnotation.spec,
   userId: Annotation<string>({
  reducer: (x, y) => y ?? x,
  default: () => "",
}),
})

const toolModel = model.bindTools(tools);

//Assistant node
async function callModel(state : typeof CalendarState.State){

const response = await toolModel.invoke(state.messages);
return {
  messages:[response],
userId: state.userId
};
}

//tool node
/* const toolNode = new ToolNode(tools); */

//conditional edge logic\
function shouldContinue(state:typeof CalendarState.State){

const lastMessage = state.messages[state.messages.length-1] as AIMessage;

if(lastMessage.tool_calls?.length){
    return 'tools'
}  

   return  '__end__'

}

const graph = new StateGraph(CalendarState)
.addNode("assistant" , callModel)
.addNode("tools" , runTools)
.addEdge("__start__", "assistant")
.addEdge("tools","assistant")
.addConditionalEdges("assistant",shouldContinue,{
    __end__ : END,
    tools: 'tools'
})

const checkpointer = new MemorySaver();
export const agent = graph.compile({checkpointer});

