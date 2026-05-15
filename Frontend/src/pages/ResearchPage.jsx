import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { authFetch } from "../utils/authFetch";
import { getValidAccessToken } from "../utils/getValidAccessToken";

export default function ResearchPage({ user , setUser}) {
  
    const [messages,setMessages] = useState([]);
          const [input , setInput] = useState("");
          const [loading, setLoading] = useState(false);
          const messageEndRef = useRef(null);
          const [status, setStatus] = useState("");
          const [chats, setChats] = useState([]);
          const [activeChatId, setActiveChatId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
          const chatIdRef = useRef(null);
                  
 const fetchChats = async()=>{
   try{
     /*  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chats?mode=research`,{
         headers:{
            Authorization:`Bearer ${user.accessToken}`
         }
      }); */
          const response = await authFetch(
         `${import.meta.env.VITE_BACKEND_URL}/api/chats?mode=research`,
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
    
    /* const response = await fetch(
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
      let currentChatId = activeChatId;
        if(!input.trim()) return;
        const userMessage = 
          {
            role:'user',
            content: input
          }
          setMessages((prev)=>[...prev , userMessage]);
          setInput("");
          setLoading(true);

             let headers = {
            "Content-Type":"application/json"
         };
         if(user){
            const validToken = await getValidAccessToken(
               user,
               setUser
            );
         
            headers.Authorization = `Bearer ${validToken}`;
         }
          await fetchEventSource(`${import.meta.env.VITE_BACKEND_URL}/api/research`,{
          method:"POST",
          headers,

          body: JSON.stringify({
            query: input,
              chatId: activeChatId
          }),

          onmessage(event){
            const data = JSON.parse(event.data);
            if(data.type === "status"){
           setStatus(data.payload.message);
          }

         if(data.type === "research"){
    currentChatId = data.payload.chatId;
    setActiveChatId(currentChatId);
     if(user){
      fetchChats();
   }
}
        if(data.type === "ai"){
          setStatus("");
          setLoading(false);
          if(currentChatId){
              fetchChatMessages(currentChatId);
          }
}
        }})
  }        
    useEffect(() => {
    if(activeChatId){
        fetchChatMessages(activeChatId);
    }
}, [activeChatId]);
        useEffect(()=>{
         messageEndRef.current?.scrollIntoView({behavior:"smooth"})
        },[messages])
        
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
                               className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 z-50 text-2xl"
                               onClick={() => setIsSidebarOpen(true)}
                             >
                               ☰
                             </button>
                            <Header user={user} setUser={setUser} />
                           </div>

                            <div className="flex-1 overflow-y-auto">
               <ChatMessages
               messages={messages}
                messageEndRef={messageEndRef}
                loading={loading}
                status={status}
                mode="research"/>
                </div>
                
               <ChatInput input={input} setInput={setInput} handleSend={handleSend}/>
               </div>
                </div>
            </>
      )
}