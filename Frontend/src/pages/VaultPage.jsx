import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { useNavigate } from "react-router-dom";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export default function VaultPage({ user , setUser}) {
      const [messages,setMessages] = useState([]);
      const [input , setInput] = useState("");
      const [loading, setLoading] = useState(false);
      const [file, setFile] = useState(null);
      const [uploaded, setUploaded] = useState(false);
      const [status, setStatus] = useState("");
      const [chats, setChats] = useState([]);
       const [activeChatId, setActiveChatId] = useState(null);
      const messageEndRef = useRef(null);
       const navigate = useNavigate();
    
 const fetchChats = async()=>{
   try{
      const response = await fetch("http://localhost:8080/api/chats?mode=vault",{
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


const handleUpload = async () => {
  if (!file) return;
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("userId", user?._id);
  formData.append("chatId", activeChatId || "");

  const response = await fetch("http://localhost:8080/api/vault/upload", {
    method: "POST",
     headers: {
      Authorization: `Bearer ${user.accessToken}`
    },
    body: formData,
  });

  const data = await response.json();

  if (data.success) {
    setUploaded(true);
     setFile(null);
     setActiveChatId(data.chatId);

    setMessages(prev => [
  ...prev,
  {
    role: "assistant",
    type: "pdf",                 
    fileName: file.name,         
    fileUrl: URL.createObjectURL(file) 
  }
]);
  }
  if (data.success) {
    setUploaded(true);
  }
};
    
    const handleSend =  async ()=>{
    
      if (!user) {
      navigate("/login");
      return;
      }
        if (file && !uploaded) {
      await handleUpload();
      }

    if(!input.trim()) return;
    const userMessage = 
      {
        role:'user',
        content: input
      }
      setMessages((prev)=>[...prev , userMessage]);
      setInput("");
      setLoading(true);

      await fetchEventSource("http://localhost:8080/api/retrieval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          message: input,
          chatId: activeChatId
        }),

       onmessage(event) {
      const data = JSON.parse(event.data);


      if(data.type === "vault"){
         setActiveChatId(data.payload.chatId);
   }
      if (data.type === "status") {
        setStatus(data.payload.message);
      }

    /*   if (data.type === "final") {
  setMessages((prev) => [
    ...prev,
    {
      role: "assistant",
      content: data.payload,
    },
  ]);
  setStatus("");       
  setLoading(false);
} */

  if (data.type === "final") {
  setStatus("");
  setLoading(false);

  if (activeChatId) {
    fetchChatMessages(activeChatId);
  }
}
   },
        onerror(err) {
          console.error("SSE error:", err);
        }
      });
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
           

    
           <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                handleUpload={handleUpload}
                setFile={setFile}
                vaultMode={true}
                file={file}
                />
           </div>
            </div>
        </>
  )
}
