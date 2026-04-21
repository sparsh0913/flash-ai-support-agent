import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { GraphState, questionAnswerSchema} from "./state.js";
import { model } from "../../config/model.js";
import { AIMessage, SystemMessage } from "@langchain/core/messages"
import  {searchExecutor}  from "./tool.js";



async function responderNode(state: typeof GraphState.State){

    const currentDateTime = new Date().toLocaleString('sv-SE');

const SYSTEM_PROMPT = `You are an expert researcher.
Current time: ${currentDateTime}

1. Provide a detailed ~250 word answer.
2. Reflect and critique your answer. Be severe to maximize improvement.
3. Recommend max 3 search queries to research information and improve your answer.`;

const llmWithStructure = model.withStructuredOutput(questionAnswerSchema);

const response = await llmWithStructure.invoke([
     new SystemMessage(SYSTEM_PROMPT),
     ...state.messages,
     new SystemMessage(`Reflect on the user's original question and the actions taken thus far. Respond
                        using structured output`)
])

    return {
        messages: [new AIMessage(JSON.stringify(response))],
        iteration:0
    }
}

//Revisor Node
async function revisorNode(state: typeof GraphState.State){

const currentDateTime = new Date().toLocaleString('sv-SE');
/* const SYSTEM_PROMPT = `You are an expert researcher.
Current time: ${currentDateTime}

Your task is to revise your previous answer using the search results provided.

CRITICAL -- Answer Format Requirements:
Your "answer" field MUST have this exact structure:

[Main answer content with citations like [1], [2], [3]...]

References:
- [1] https://actual-url-from-search-results.com
- [2] https://another-url-from-search-results.com
- [3] https://third-url-from-search-results.com

Instructions:
1. Write your main answer (~250 words) using information from the search results.
2. Use inline citations [1], [2], [3] in your answer text when referencing sources.
3. MANDATORY: End your answer field with a "References:" section listing all URLs.
4. The References section is PART of the answer field, not a separate field.
5. Extract actual URLs from the search results provided in the conversation.
6. Use the previous critique to remove speculative, weak, or unsupported information.
7. Improve clarity, accuracy, and conciseness.
8. Recommend max 3 new search queries to further improve the answer.

Example answer field format:

JavaScript is evolving rapidly with new features [1]. WebAssembly integration continues to improve performance for browser-based workloads [2].

References:
- [1] https://example.com/js-features
- [2] https://example.com/webassembly`
 */

const SYSTEM_PROMPT = `
You are an expert researcher.

Return JSON with these fields:

1. answer → improved final researched answer with inline citations like [1], [2]
2. missing → what was missing in previous answer
3. superfluous → what was weak / unnecessary
4. Return EXACTLY 3 or fewer searchQueries.
Never exceed 3.

Keep answer concise and factual.
`;

    const llmWithStructure = model.withStructuredOutput(questionAnswerSchema);

const response = await llmWithStructure.invoke([
     new SystemMessage(SYSTEM_PROMPT),
     ...state.messages,
     new SystemMessage(`Reflect on the user's original question and the actions taken thus far. Respond
                        using structured output`)
])

    return {
        messages: [new AIMessage(JSON.stringify(response))],
        iteration: state.iteration+1
    }
};

function shouldContinue(state: typeof GraphState.State){

const MAX_ITERATIONS = 2;

if(state.iteration >= MAX_ITERATIONS){
    return "__end__";
}
return "searchExecutor"
}

export const graph = new StateGraph(GraphState)
.addNode("responder" , responderNode)
.addNode("searchExecutor" , searchExecutor)
.addNode("revisor", revisorNode)

.addEdge(START, "responder")
.addEdge("responder","searchExecutor")
.addEdge("searchExecutor", "revisor")

.addConditionalEdges("revisor" , shouldContinue, {

    searchExecutor: "searchExecutor",
    __end__ : END
})




