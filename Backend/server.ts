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


await connectDB();
app.listen(8080 , ()=>{
    console.log("listening to port 8080");
});

//Research Agent

app.post("/api/research" , async(req,res)=>{

try{
const {query} = req.body;

if(!query){
    return res.status(400).json({
        error:"Query is required"
    })
}

const result = await runResearch(query);
res.json(result);

} catch(err){
console.log(err);

res.status(500).json({
    error: "Research Failed"
})
}
})


//Chat Agent
app.post("/", async (req, res) => {
  try {
    const { query } = req.body;

    const reply = await runChat(query);

    res.json({ reply });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Chat failed"
    });
  }
});

/* {
  "username":"shubh",
  "password":"123456"
} */