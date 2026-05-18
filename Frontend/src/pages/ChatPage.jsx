import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { authFetch } from "../utils/authFetch";
import { getValidAccessToken } from "../utils/getValidAccessToken";

export default function ChatPage({ user , setUser}) {

      const [messages,setMessages] = useState([]);
      const [input , setInput] = useState("");
      const [loading, setLoading] = useState(false);
      const messageEndRef = useRef(null);
       const [activeChatId, setActiveChatId] = useState(null);
     const isCalendarConnected = Boolean(user?.googleCalendar?.connected);
       const [status, setStatus] = useState("");
          const hasStartedStreamingRef = useRef(false);
         const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
       const [chats, setChats] = useState([]);
    

const fetchChats = async()=>{
   try{
      /* const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chats?mode=calendar`,{
         headers:{
            Authorization:`Bearer ${user.accessToken}`
         }
      }); */
      const response = await authFetch(
  `${import.meta.env.VITE_BACKEND_URL}/api/chats?mode=calendar`,
  {},
  user,
  setUser
);
      const data = await response.json();
      setChats(data.chats);
   }catch(error){
      console.log(error);
   }
}

const fetchChatMessages = async(chatId) => {
  try{
    
   /*  const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}`,
        {
            headers:{
                Authorization:`Bearer ${user.accessToken}`
            }
        }
    ); */
    const response = await authFetch(
  `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}`,
  {},
  user,
  setUser
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

      try{
          const validToken = await getValidAccessToken(
      user,
      setUser
    );
          hasStartedStreamingRef.current = false;
      await fetchEventSource(`${import.meta.env.VITE_BACKEND_URL}/chat`,{
       
      method:"POST",
      headers:{
        "content-type": "application/JSON",
        Authorization: `Bearer ${validToken}`
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
  if(!hasStartedStreamingRef.current){
   setLoading(false);
   hasStartedStreamingRef.current = true;
  }
  setStatus("");
  
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
}catch(err){

   console.log(err);
   toast.error("Session expired");
   setLoading(false);
   setUser(null);
   navigate("/login");
   return;
}}

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
           <div className="h-dvh w-full overflow-hidden flex bg-[#05010a] text-white relative">
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
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
              <div className="flex-1 relative z-10 flex flex-col">
           <div className="relative w-full">
          
                        <button
                          className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 z-[100] text-2xl"
                          onClick={() => setIsSidebarOpen(true)}
                        >
                          ☰
                        </button>
                       <Header user={user} setUser={setUser} />
                      </div>
           {
 isCalendarConnected ? (
<>
 <div className="flex-1 overflow-y-auto">
           <ChatMessages
           messages={messages}
            messageEndRef={messageEndRef}
            loading={loading}
            status={status}
              mode="manager"/>
        </div>

<ChatInput
 input={input}
 setInput={setInput}
 handleSend={handleSend}
/>
</>

) : (
  
<div className="flex-1 flex items-center justify-center">
<div className="bg-[#14061f] border border-purple-500/20 rounded-2xl md:rounded-3xl p-5 md:p-8 max-w-sm md:max-w-md w-[90%] text-center">
<h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 leading-snug">
 Connect Google Calendar
</h2>

<p className="text-gray-400 text-sm md:text-base leading-relaxed mb-5 md:mb-6">
 Connect your calendar to schedule meetings,
 check events, manage availability,
 and use Calendar AI features.
</p>

<button
 onClick={() => {
   window.location.href =
`${import.meta.env.VITE_BACKEND_URL}/auth?token=${user.accessToken}`;
 }}
 className="bg-purple-600 hover:bg-purple-700 px-5 md:px-6 py-3 rounded-xl md:rounded-2xl text-sm md:text-base font-medium transition-all"
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
