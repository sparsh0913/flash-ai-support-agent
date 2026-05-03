import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { GraphState, questionAnswer } from "./state.js";
import {TavilySearch} from "@langchain/tavily";

const tavilySearch = new TavilySearch({
    maxResults:2,
})

export async function searchExecutor(state: typeof GraphState.State){

const lastMessage = state.messages[state.messages.length -1] as AIMessage;
const parsed = JSON.parse(lastMessage.content as string) as questionAnswer;

const searchResult = await tavilySearch.batch(parsed.searchQueries.map(query => ({query}))); //here we send the obj of each query coming from queries array

const cleanedResult = [];

for(let i=0;i<parsed.searchQueries.length;i++){
     
    const query = parsed.searchQueries[i];
    const searchOutput = searchResult[i];

    const results = searchOutput?.results || [];

    for(const result of results){
        cleanedResult.push({
            query: query,
            content:result.content.slice(0,500) || '',
            url:result.url || ''
        })
    }
}

return{
    messages: [new HumanMessage(JSON.stringify({searchResults : cleanedResult}))]
}


}