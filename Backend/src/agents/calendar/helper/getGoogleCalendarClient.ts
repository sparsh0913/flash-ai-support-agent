import { google } from "googleapis";
import userModel from "../../../auth/models/user.model.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function getGoogleCalendarClient(userId:string) {
  console.log("HELPER USER ID:", userId);
    const user = await userModel.findById(userId);
    if(!user?.googleCalendar?.connected){
    throw new Error("Google Calendar not connected");
}
console.log("FOUND USER:", user);

oauth2Client.setCredentials({
    access_token:user.googleCalendar.accessToken,
    refresh_token:user.googleCalendar.refreshToken
});

const calendar = google.calendar({
    version:"v3",
    auth:oauth2Client
});

return calendar;
}