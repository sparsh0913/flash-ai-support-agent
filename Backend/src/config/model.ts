import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { tools } from "../tools/tool.js";



//initialise the LLM
export const model = new ChatGroq({
   /*  model: "llama-3.1-8b-instant", */ //better 
                /* "llama-3.3-70b-versatile", */
   model: "llama-3.1-8b-instant",
    temperature: 0,
    maxTokens:1024,
    apiKey:process.env.GROQ_API_KEY
})

