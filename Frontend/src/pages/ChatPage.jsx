import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export default function ChatPage({ user , setUser}) {

      const [messages,setMessages] = useState([]);
      const [input , setInput] = useState("");
      const [loading, setLoading] = useState(false);
      const messageEndRef = useRef(null);
       const [activeChatId, setActiveChatId] = useState(null);
     const isCalendarConnected = Boolean(user?.googleCalendar?.connected);
       const [status, setStatus] = useState("");
       const [chats, setChats] = useState([]);
    



        const fetchChats = async()=>{
   try{
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chats?mode=calendar`,{
         headers:{
            Authorization:`Bearer ${user.accessToken}`
         }
      });
      const data = await response.json();
      setChats(data.chats);
   }catch(error){
      console.log(error);
   }
}

const fetchChatMessages = async(chatId) => {
  try{
    
    const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}`,
        {
            headers:{
                Authorization:`Bearer ${user.accessToken}`
            }
        }
    );
    const data = await response.json();
    setMessages(data.chat.messages);
}catch(error){
    console.log(error);
}
}

useEffect(()=>{
   if(user){
      fetchChats();
   }else{
      setChats([]);
      setMessages([]);
      setActiveChatId(null);
   }
},[user]);

    
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
      await fetchEventSource(`${import.meta.env.VITE_BACKEND_URL}/chat`,{
       
      method:"POST",
      headers:{
        "content-type": "application/JSON",
        Authorization:`Bearer ${user.accessToken}`
      },
      body : JSON.stringify({
        message:input,
        chatId: activeChatId
        
      }),
       onmessage(event){
      const data = JSON.parse(event.data);

      if(data.type === "calendar"){
   setActiveChatId(data.payload.chatId);
    fetchChats();
}
      if(data.type === "status"){
   setStatus(data.payload.message);
}
if(data.type === "response"){
  setStatus("");
  /* if(!data.payload.content || !data.payload.content.trim()) return; */
  setMessages((prevMessages) => {

      const lastMessage = prevMessages[prevMessages.length - 1];

      if (lastMessage && lastMessage.role === "assistant") {

        const clonedMessages = [...prevMessages];

        clonedMessages[clonedMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + data.payload.content,
        };

        return clonedMessages;
      } else {
        return [
          ...prevMessages,
          {
            role: "assistant",
            content: data.payload.content,
          },
        ];
      }
    });
}

   },
  onclose() {
    setLoading(false);
  },
  onerror(error) {
    console.log(error);
    setLoading(false);
  },});
    }

      useEffect(() => {
    if(activeChatId){
        fetchChatMessages(activeChatId);
    }
}, [activeChatId]);
    
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
         <Sidebar
            user={user}
            chats={chats}
            setActiveChatId={setActiveChatId}
            activeChatId={activeChatId}
            setMessages={setMessages}
            setInput={setInput}
            setStatus={setStatus}
            setChats={setChats}
          />
              <div className="flex-1 relative z-10 flex flex-col">
           <div className="padding-4 border-b border-purple-900/40">
                  <Header user={user} setUser={setUser} />
           </div>
           {
 isCalendarConnected ? (
<>
<ChatMessages
 messages={messages}
 messageEndRef={messageEndRef}
 loading={loading}
 status={status}
   mode="manager"
/>

<ChatInput
 input={input}
 setInput={setInput}
 handleSend={handleSend}
/>
</>

) : (
  
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
`${import.meta.env.VITE_BACKEND_URL}/auth?token=${user.accessToken}`;
 }}
 className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-2xl font-medium transition-all"
>
 Connect Calendar
</button>
</div>
</div>
)
}
</div>
</div>
        </>
  )
}
