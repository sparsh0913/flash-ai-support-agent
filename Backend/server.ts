import "dotenv/config";
import { agent } from "./src/agents/calendar/agent.js";
import express from "express";
import cors from "cors";
import {google} from "googleapis";
import { connectDB } from "./src/config/db.js";
import { runResearch } from "./src/agents/research/researchAgent.js";
import { runChat } from "./src/agents/chat/agent.js";
import authRouter from "./src/auth/routes/auth.routes.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import graph from "./src/graph/graph.js";
import { HumanMessage } from "@langchain/core/messages";
import Chat from "./src/history/chat.model.js";
import { optionalAuth ,requireAuth} from "./src/auth/middleware/auth.middleware.js";
import { createChat , appendMessage} from "./src/history/chat.helper.js";
import chatRoutes from "./src/history/chat.routes.js";

/* import {agent} from "./agent.js"; */

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(morgan('dev')); //logger
app.use(cookieParser());
app.use("/api", chatRoutes);
app.use("/api/auth", authRouter);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

app.get("/auth",(req,res)=>{

const scopes = ['https://www.googleapis.com/auth/calendar']; //the permission we want from user
const url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  prompt:'consent',

  // If you only need one scope, you can pass it as a string
  scope: scopes
});
   console.log("url", url);
    res.redirect(url);
})

app.get("/callback", async (req,res)=>{

    const code = req.query.code as string;

    //exchange code with access tokens/refresh token
    const {tokens} = await oauth2Client.getToken(code);
    console.log(tokens);

    process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token!;
    process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token!;

    res.send("Connected! You can close this tab now.")

})


//calendar agent------------------------------------------------------------------------------------------------------------
app.post("/chat" , async(req,res)=>{

  const timeZoneString = "Asia/Kolkata";
const now = new Date();
const todayLocal = now.toLocaleString('sv-SE', { timeZone: timeZoneString }).replace(' ', 'T');
    try{
        const {message} = req.body;
        if(!message){
            return res.status(404).json({error: "Message is required"})
        }
       const systemPrompt =  `
                        You are a smart AI assistant with tool-calling abilities.

                        CURRENT CONTEXT:
                            - Current datetime: ${todayLocal}
                            - User timezone: ${timeZoneString}
                            - Always interpret dates in user's timezone.

                        TIMEZONE RULES (CRITICAL):
                            - Always use "Asia/Kolkata" as timeZone. NEVER "Asia/Calcutta".
                            - Pass dateTime as bare IST local time with NO 'Z' suffix.
                            Example: "2026-04-11T21:00:00" — NOT "2026-04-11T21:00:00Z"
                            - NEVER convert to UTC. The API handles it via the timeZone field.

                        TOOLS:
                            - webSearchTool → use for live or current information.
                            - getEventsTool → use to retrieve meetings.
                            - createEventTool → use to schedule meetings.
                            - deleteEventTool → use to remove meetings.
                            - updateEventTool → use to modify meetings.

                        INSTRUCTIONS:
                            - Use tools only when required.
                            - For simple conversation, do NOT call tools.
                            - For calendar actions, choose the correct calendar tool.
                            - Ask for clarification if information is ambiguous.
                            - Never hallucinate calendar events.
                            - Prefer tool results over assumptions.
                            - Respond clearly and concisely.

                        When deleting:
                            - If multiple events match, ask user which one to delete.
                            - Do not delete multiple events without confirmation.

                        When updating:
                            - Update only requested fields.

                        When calling tools:
                                    - Always provide valid JSON arguments
                                    - Match schema exactly
                                    - Do not omit required fields
                                    - Use ISO datetime format
                            `
        const result = await agent.invoke(
            {
            messages:[
                {
                  role:'system',
                  content: systemPrompt
                },
                {
                    role:'user',
                    content:message,
                }
            ]
        },{
            configurable:{thread_id:'1'}
        }
    );

    const reply = result.messages[result.messages.length -1].content;

    res.send({reply});

    }catch(error){
        console.log("error:" , error);
        res.status(500).json({error:"something went wrong"});
    }
})

//Research Agent-------------------------------------------------------------------------------------------------
app.post("/api/research" ,optionalAuth, async(req,res)=>{

try{
const {query,chatId} = req.body;

if(!query){
    return res.status(400).json({
        error:"Query is required"
    })
}

res.writeHead(200, {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
});


    let activeChatId = chatId;
    if((req as any).user){

   if(!activeChatId){
      const newChat = await createChat(
         (req as any).user.id,
         "research",
         query
      );

      activeChatId = newChat._id.toString();

      const chatEvent = {
   type: "research",
   payload: {
      chatId: activeChatId
   }
};
res.write(`data:${JSON.stringify(chatEvent)}\n\n`);
   }
   if(activeChatId){
   await appendMessage(
      activeChatId,
      {
         role:"user",
         content:query
      }
   );
}
}


const stream = await runResearch(query);
const statusEvent = {
  type: "status",
  payload: {
    message: "Searching web...",
  },
};
res.write(`data:${JSON.stringify(statusEvent)}\n\n`);

await new Promise((resolve) => setTimeout(resolve, 2000));

const reviewingEvent = {
  type: "status",
  payload: {
    message: "Reviewing sources...",
  },
};

res.write(`data:${JSON.stringify(reviewingEvent)}\n\n`);

await new Promise((resolve) => setTimeout(resolve, 2000));

const generatingEvent = {
  type: "status",
  payload: {
    message: "Generating final answer...",
  },
};

res.write(`data:${JSON.stringify(generatingEvent)}\n\n`);

let finalAnswer = "";
for await (const chunk of stream) {
console.log(chunk);
const metadata = chunk[1];
if(metadata.langgraph_node !== "revisor") continue;

const messageChunk = chunk[0];
if(!messageChunk?.content) continue;

const content = messageChunk.content as string;
const parsed = JSON.parse(content);
const aiEvent = {
  type: "ai",
  payload: {
    text: parsed.answer,
  },
};
finalAnswer = parsed.answer;
res.write(`data:${JSON.stringify(aiEvent)}\n\n`);
}
if(activeChatId){
   await appendMessage(
      activeChatId,
      {
         role:"assistant",
         content: finalAnswer
      }
   )
}
res.end();

} catch(err){
console.log(err);

res.status(500).json({
    error: "Research Failed"
})
}
})


//Chat Agent------------------------------------------------------------------------------------------------------
app.post("/", optionalAuth,async (req, res) => {
  try {
    const { query , chatId } = req.body;

    res.writeHead(200, {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
});

    let activeChatId = chatId;
    if((req as any).user){

   if(!activeChatId){
      const newChat = await createChat(
         (req as any).user.id,
         "chat",
         query
      );

      activeChatId = newChat._id.toString();

      const chatEvent = {
   type: "chat",
   payload: {
      chatId: activeChatId
   }
};
res.write(`data:${JSON.stringify(chatEvent)}\n\n`);
   }
   if(activeChatId){
   await appendMessage(
      activeChatId,
      {
         role:"user",
         content:query
      }
   );
}
}
    
    const stream = await runChat(query);
    let fullResponse = "";
    for await(const chunk of stream){
      const [messageChunk] = chunk;

      if (!messageChunk.content) continue;

    if(messageChunk.constructor.name !== "AIMessageChunk"){
        continue;
    }
      fullResponse += messageChunk.content;

      const message = {
        type: "ai",
        payload: {
          text: messageChunk.content
        }
      };
      res.write(`data: ${JSON.stringify(message)}\n\n`);
    }
    if(activeChatId){
   await appendMessage(
      activeChatId,
      {
         role:"assistant",
         content:fullResponse
      }
   );
}
  res.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Chat failed"
    });
  }
});


//Retrieval node-----------------------------------------------------------------------------------
   app.post("/api/retrieval",requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }
    res.writeHead(200,{
    "Content-Type":"text/event-stream",
    "Cache-Control":"no-cache",
    Connection:"keep-alive"
     });

    const stream = await graph.stream({
      messages: [new HumanMessage(message)],
      userId: (req as any).user.id,
      iterations: 0,
      finalAnswer: "",
    },
  {
    streamMode:"messages"
    });

const nodeStatusMap: Record<string, string> = {
  router: "Understanding request...",
  query: "Searching...",
  retrieval: "Retrieving documents...",
  draft: "Generating answer...",
  critique: "Refining answer...",
};
    let lastNode = "";
    let currentDraftId = 0;
    let latestDraft = "";
  /*  let isFinal = false; */
for await(const chunk of stream){
    const metadata = chunk[1];
    const node = metadata?.langgraph_node;
    const content = chunk[0]?.content;

    if (node === "draft" && content) {
     latestDraft = content as string;
   }

    if (node === "draft" && lastNode !== "draft") {
        currentDraftId++;
  console.log("NEW DRAFT STARTED -> ID:", currentDraftId);
}

/* if (node === "critique" && content) {
  const text =
    typeof content === "string"
      ? content
      : JSON.stringify(content);

  if (text.toLowerCase().includes("done")) {
    isFinal = true;
  }
}
 */


if (node && node !== lastNode) {
  const status = nodeStatusMap[node] || "Processing...";
  const statusEvent = {
    type: "status",
    payload: {
      message: status
    }
  };
  res.write(`data: ${JSON.stringify(statusEvent)}\n\n`);
  lastNode = node;
}
}
const finalResponse = latestDraft || "Sorry, I couldn't generate a response.";

res.write(
  `data: ${JSON.stringify({
    type: "final",
    payload: finalResponse,
  })}\n\n`
);

res.end();
res.end();
  } catch (err) {
    console.log(err);

    res.write(`data: ${JSON.stringify({
        type: "error",
        payload: { message: "Something went wrong" }
    })}\n\n`);
    res.end();
}
}); 


  await connectDB();
app.listen(8080 , ()=>{
    console.log("listening to port 8080");
});

