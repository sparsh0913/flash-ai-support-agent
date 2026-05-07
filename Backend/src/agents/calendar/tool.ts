import "dotenv/config";
import { tool } from "@langchain/core/tools";
import * as z from "zod";
import { google } from "googleapis";
import { TavilySearch } from "@langchain/tavily";
import { getGoogleCalendarClient } from "./helper/getGoogleCalendarClient.js";

/* const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

oauth2Client.setCredentials({
    access_token:process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token:process.env.GOOGLE_REFRESH_TOKEN
});

 const calendar = google.calendar({version: 'v3', auth:oauth2Client});


 */
 //get events tool
 type Params = {
    q:string,
    timeMin:string,
    timeMax:string,
    userId:string;
 }
export const getEventsTool = tool(

    async(params)=>{
    const {q,timeMin,timeMax,userId} = params as Params;
      
        try{
            console.log(" Get Event user id" , userId);
         const calendar = await getGoogleCalendarClient(userId);
       const response = await calendar.events.list({
                calendarId: 'primary',
                q,
             timeMin: timeMin ? new Date(timeMin.endsWith('Z') || timeMin.includes('+') ? timeMin : timeMin + '+05:30').toISOString() : undefined,
             timeMax: timeMax ? new Date(timeMax.endsWith('Z') || timeMax.includes('+') ? timeMax : timeMax + '+05:30').toISOString() : undefined,
                maxResults: 10,
                singleEvents: true,
                orderBy: "startTime"
});

        const result = response.data.items?.map(event=>{
              return {
                id:event.id,
                summary:event.summary,
                status:event.status,
                organizer:event.organizer,
                start:event.start,
                end:event.end,
                attendees:event.attendees,
                meetingLink:event.hangoutLink,
                eventType:event.eventType
               }
        }) || [];

         return JSON.stringify(result);

        } catch(err){
            console.log("ERROR:", err);
             
        }

        return "Failed to connect to the calendar";
    },
    {
     name:'get-events',
     description: `
            Use this tool to retrieve calendar events.
            Call this when the user asks about:
            - upcoming meetings
            - today's schedule
            - events on a specific date
            - meetings with a specific person
            - checking availability

            This tool only reads calendar events and does NOT modify anything.
                                                                             `,
     schema: z.object({
        q: z.string().describe(
         'Only use for keyword search (e.g. "standup", "interview"). OMIT this field when fetching all events for a time range.'
                             ).optional(),
        timeMin: z.string().describe('Start of time range in IST. Format: 2026-04-10T00:00:00').optional(),
         timeMax: z.string().describe('End of time range in IST. Format: 2026-04-10T23:59:59').optional(),
         userId: z.string()
     }
    )
    }
);

//Create event tool---------------------------------------------

type attendee = {
    email:string;
    displayName:string;
}

const createEventSchema = z.object({
        summary: z.string().describe("The title of the event"),
        start:z.object({
            dateTime:z.string().describe( "Local datetime in user's timezone (DO NOT convert to UTC, no Z). Example: 2026-04-09T10:00:00 (Asia/Kolkata)"),
            timeZone:z.string().describe("IANA timezone like Asia/Kolkata")
        }),
        end:z.object({
            dateTime:z.string().describe("Local datetime in user's timezone (DO NOT convert to UTC, no Z)."),
            timeZone:z.string().describe("IANA timezone like Asia/Kolkata")
        }),
        attendees: z.array(z.object({
            email:z.string().describe("The email of the attendee"),
            displayName:z.string().describe("The display name of the attendee"),
        })).min(1),
        userId:z.string()

     })

   type EventData =  z.infer<typeof createEventSchema>

 const stripUTCSuffix = (dt: string) => dt.endsWith('Z') ? dt.slice(0, -1) : dt;
               const normalizeTZ = (tz:string) =>
             tz === "Asia/Calcutta" ? "Asia/Kolkata" : tz;
               
export const createEventTool = tool(

    async(eventData)=>{
        const {summary,start,end,attendees,userId} = eventData as EventData;
        
                        const startDateTime = {
            dateTime: stripUTCSuffix(start.dateTime),
            timeZone: normalizeTZ(start.timeZone)
        };
        const endDateTime = {
            dateTime: stripUTCSuffix(end.dateTime),
            timeZone: normalizeTZ(end.timeZone)
        };
      
        try{
            console.log("Create event user id", userId);
      const calendar = await getGoogleCalendarClient(userId);
     const response = await calendar.events.insert(
        {
        calendarId:'primary', 
        sendUpdates:'all',
        conferenceDataVersion:1,
        requestBody: {
            summary,
            start: startDateTime,
            end: endDateTime,
            attendees,
            conferenceData: {
                createRequest:{
                    requestId:crypto.randomUUID(),
                    conferenceSolutionKey:{
                        type:'hangoutsMeet'
                    },
                }
            }

        }
    }
)
             if(response.statusText === 'OK'){
                return "The meeting has been created!"
             }

    }catch(err){
        console.log(err);
    }
           return "Could not create a meeting";
    },
    {
     name:'create-event',
     description:'Call to create the calendar events',
     schema:  createEventSchema,
    }
)

//Delete event tool

export const deleteEventTool = tool(

async({eventId,userId})=>{
   
    try{
  const calendar = await getGoogleCalendarClient(userId);
    const response = await calendar.events.delete(
        {
            calendarId:'primary',
            eventId,
            sendNotifications:true,
            sendUpdates:"all"
        }
    )

    return "Event deleted Successfully!";

} catch(err){
    console.log("error: ",err);
}},
{
    name:'delete-event',
    description:'Use this tool to delete a calendar event using its eventId. Only call when user explicitly requests deletion.',
    schema: z.object({
         eventId: z.string().describe("The Id of the event to delete"),
         userId:z.string()
    }),
}
)

//Update event tool

const updateEventSchema = z.object({
     eventId: z.string().describe("The Id of the event to update"),
     summary: z.string().optional(),
     start:z.object({
        dateTime: z.string(),
          timeZone: z.string()
     }).optional(),

     end:z.object({
        dateTime: z.string(),
          timeZone: z.string()
     }).optional(),
    
     attendees: z.array(
        z.object({
            email:z.string(),
            displayName: z.string()
        })
     ).optional(),
      userId:z.string()
})

export const updateEventTool = tool(

async(data:z.infer<typeof updateEventSchema>)=>{
     
    const {eventId ,userId,...updates} = data;
    if (updates.start) {
    updates.start = {
        dateTime: stripUTCSuffix(updates.start.dateTime),
        timeZone: normalizeTZ(updates.start.timeZone)
    };
}
if (updates.end) {
    updates.end = {
        dateTime: stripUTCSuffix(updates.end.dateTime),
        timeZone: normalizeTZ(updates.end.timeZone)
    };
}
    try{
        const calendar = await getGoogleCalendarClient(userId);
    const response = await calendar.events.patch(
        {
            calendarId:'primary',
            eventId,
            requestBody:updates,

        }
    )
      console.log(response);
    return JSON.stringify({
       success:true,
     message:"Event updated successfully"
     })

} catch(err){
    console.log(err);
}
},
{
    name:'update-event',
    description:'Update a calendar event',
    schema: updateEventSchema
}
)

//Web search tool
export const webSearchTool = new TavilySearch({
  maxResults: 3,
  topic: "general"
});

//exporting
export const tools = [
  webSearchTool,
  getEventsTool,
  createEventTool,
  deleteEventTool,
  updateEventTool
];

