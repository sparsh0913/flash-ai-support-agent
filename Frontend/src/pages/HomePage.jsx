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
      const chatIdRef = useRef(null);
      const messageEndRef = useRef(null);
      const [chats,setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

      const fetchChats = async()=>{
   try{
      /* const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chats?mode=chat`,{
         headers:{
            Authorization:`Bearer ${user.accessToken}`
         }
      }); */

      const response = await authFetch(
   `${import.meta.env.VITE_BACKEND_URL}/api/chats?mode=chat`,
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
    if(!input.trim()) return;
    
    const userMessage = 
      {
        role:'user',
        content: input
      }
    
      /* setMessages((prev)=>[...prev , userMessage]); */
      setMessages((prev)=>[
   ...prev,
   userMessage,
   {
      role:"assistant",
      content:""
   }
]);
      setInput("");
      setLoading(true);
      console.log("user.token is",user.accessToken);


      try{
      const validToken = await getValidAccessToken(
   user,
   setUser
); 

    await fetchEventSource(`${import.meta.env.VITE_BACKEND_URL}/`, {
      method: "POST",
  headers: {
    "Content-Type": "application/json",
     Authorization: `Bearer ${validToken}`
  },
  body: JSON.stringify({
    query: input,
    chatId: activeChatId
  }),
  onmessage(event) {
     
  const parsedData = JSON.parse(event.data);
    
  if(parsedData.type === "chat"){
   chatIdRef.current = parsedData.payload.chatId;
    setActiveChatId(parsedData.payload.chatId);
    fetchChats();
   console.log("active chat id", parsedData.payload.chatId);
}
  if (parsedData.type === "ai") {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
     /*  if (lastMessage && lastMessage.role === "assistant") {
        const clonedMessages = [...prevMessages];
        clonedMessages[clonedMessages.length - 1] = {
          ...lastMessage,
          content: lastMessage.content + parsedData.payload.text,
        };
        return clonedMessages;
      } else {
        return [
          ...prevMessages,
          {
            role: "assistant",
            content: parsedData.payload.text,
          },
        ];
      } */
       setMessages((prevMessages)=>{

   const clonedMessages = [...prevMessages];

   clonedMessages[clonedMessages.length - 1] = {
      ...clonedMessages[clonedMessages.length - 1],
      content:
         clonedMessages[clonedMessages.length - 1].content
         + parsedData.payload.text
   };

   return clonedMessages;
});
      });
  }


  },
  onclose() {
    setLoading(false);
  },
  onerror(error) {
    console.log(error);
    setLoading(false);
  },
})
      }catch(err){

   console.log(err);
   toast.error("Session expired");
   setLoading(false);
   setUser(null);
   navigate("/login");
   return;
}
    }
    
    useEffect(()=>{
     messageEndRef.current?.scrollIntoView({behavior:"smooth"})
    },[messages])

    useEffect(() => {
    if(activeChatId){
        fetchChatMessages(activeChatId);
    }
}, [activeChatId]);
    
  return (
    <>
         <div className="h-dvh w-full overflow-hidden flex bg-[#05010a] text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/10 blur-3xl"></div>
             <Sidebar user={user}
            chats={chats}
            setActiveChatId={setActiveChatId}
            activeChatId={activeChatId}
            setMessages={setMessages}
            setInput={setInput}
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
              mode="chat"/>
              </div>
    
           <ChatInput input={input} setInput={setInput} handleSend={handleSend}/>
           </div>
            </div>
        </>
  )
}
