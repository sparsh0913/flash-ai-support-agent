import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export default function ResearchPage({ user , setUser}) {
  
    const [messages,setMessages] = useState([]);
          const [input , setInput] = useState("");
          const [loading, setLoading] = useState(false);
          const messageEndRef = useRef(null);
          const [status, setStatus] = useState("");
          const [chats, setChats] = useState([]);
          const [activeChatId, setActiveChatId] = useState(null);
          const chatIdRef = useRef(null);
                  
 const fetchChats = async()=>{
   try{
      const response = await fetch("http://localhost:8080/api/chats?mode=research",{
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
        `http://localhost:8080/api/chats/${chatId}`,
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
          await fetchEventSource("http://localhost:8080/api/research",{

          method:"POST",

          headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${user.accessToken}`
          },

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
         setActiveChatId(data.payload.chatId);
   }
        /* if(data.type === "ai"){
        const assistantMessage = {
            role:"assistant",
            content:data.payload.text
        }
        setMessages((prev)=>[...prev , assistantMessage]);
        setStatus("");
        setLoading(false);
       } */

        if(data.type === "ai"){
          setStatus("");
          setLoading(false);

          if(activeChatId){
            fetchChatMessages(activeChatId);
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
              <div className="h-screen flex bg-[#05010a] text-white relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/10 blur-3xl"></div>
                 <Sidebar user={user} chats={chats} setActiveChatId={setActiveChatId}  activeChatId={activeChatId}/>
                  <div className="flex-1 relative z-10 flex flex-col">
               <div className="padding-4 border-b border-purple-900/40">
                      <Header user={user} setUser={setUser} />
               </div>
               <ChatMessages
               messages={messages}
                messageEndRef={messageEndRef}
                loading={loading}
                status={status}/>
               <ChatInput input={input} setInput={setInput} handleSend={handleSend}/>
               </div>
                </div>
            </>
      )
}