import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";

export default function ChatPage({ user , setUser}) {

      const [messages,setMessages] = useState([]);
      const [input , setInput] = useState("");
      const [loading, setLoading] = useState(false);
      const messageEndRef = useRef(null);
      const isCalendarConnected = user?.googleCalendar?.connected;
    
    
    const handleSend =  async ()=>{
    
    if(!input.trim()) return;
    const userMessage = 
      {
        role:'user',
        content: input
      }
    
      setMessages((prev)=>[...prev , userMessage]);
      setInput("");
    
      setLoading(true);
      const response = await fetch("http://localhost:8080/chat",{
       
      method:"POST",
      headers:{
        "content-type": "application/JSON",
        Authorization:`Bearer ${user.accessToken}`
      },
      body : JSON.stringify({
        message:input,
      })
      });
      const data = await response.json();
      console.log(data);
    
      const assistantMessage = {
        role:"assistant",
        content:data.reply
      };
      setLoading(false);
      setMessages((prev)=>[...prev,assistantMessage]);
    
    }
    
    useEffect(()=>{
     messageEndRef.current?.scrollIntoView({behavior:"smooth"})
    },[messages])

    useEffect(() => {

const params = new URLSearchParams(window.location.search);

const connected = params.get("connected");

if (connected === "true") {
   window.location.reload();
}

}, []);
    
  return (
    <>
          <div className="h-screen flex bg-[#05010a] text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/10 blur-3xl"></div>
             <Sidebar user={user} />
              <div className="flex-1 relative z-10 flex flex-col">
           <div className="padding-4 border-b border-purple-900/40">
                  <Header user={user} setUser={setUser} />
           </div>
          {/*  <ChatMessages
           messages={messages}
            messageEndRef={messageEndRef}
            loading={loading}/>
    
           <ChatInput input={input} setInput={setInput} handleSend={handleSend}/> */}
           {
 !isCalendarConnected ? (

<div className="flex-1 flex items-center justify-center">

<div className="bg-[#14061f] border border-purple-500/20 rounded-3xl p-8 max-w-md w-full text-center">

<h2 className="text-2xl font-bold mb-4">
 Connect Google Calendar
</h2>

<p className="text-gray-400 mb-6">
 Connect your calendar to schedule meetings,
 check events, manage availability,
 and use Calendar AI features.
</p>

<button
 onClick={() => {
   window.location.href =
`http://localhost:8080/auth?token=${user.accessToken}`;
 }}
 className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-2xl font-medium transition-all"
>
 Connect Calendar
</button>
</div>
</div>

 ) : (

<>
<ChatMessages
 messages={messages}
 messageEndRef={messageEndRef}
 loading={loading}
/>

<ChatInput
 input={input}
 setInput={setInput}
 handleSend={handleSend}
/>
</>

)
}
           </div>
            </div>
        </>
  )
}
