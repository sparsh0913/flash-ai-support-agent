import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";
import { useNavigate } from "react-router-dom";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import toast from "react-hot-toast";
import { authFetch } from "../utils/authFetch";
import { getValidAccessToken } from "../utils/getValidAccessToken";

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
      const [selectedFile, setSelectedFile] = useState(null);
      const [uploading, setUploading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
       const navigate = useNavigate();
    
 const fetchChats = async()=>{
   try{
      /* const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chats?mode=vault`,{
         headers:{
            Authorization:`Bearer ${user.accessToken}`
         }
      }); */
       const response = await authFetch(
   `${import.meta.env.VITE_BACKEND_URL}/api/chats?mode=vault`,
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


const handleUpload = async () => {

   if (!file) return;
   setUploading(true);
   setInput("");
   const toastId = toast.loading("Uploading PDF...");

   try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("userId", user?._id);
      formData.append("chatId", activeChatId || "");

      const response = await fetch(
         `${import.meta.env.VITE_BACKEND_URL}/api/vault/upload`,
         {
            method: "POST",
            headers: {
               Authorization: `Bearer ${user.accessToken}`
            },
            body: formData,
         }
      );

      if (!response.ok) {
  const text = await response.text();

  toast.error("Upload service unavailable", {
    id: toastId,
  });

  console.log(text);

  return;
}

     /*  const data = await response.json(); */
     let data;

try {
  data = await response.json();
} catch {
  toast.error("Server returned invalid response", {
    id: toastId,
  });

  return;
}

      if (data.success) {
         toast.success("PDF uploaded successfully", {
            id: toastId
         });

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
      } else {
         toast.error(data.message || "Upload failed", {
            id: toastId
         });
      }
   } catch (error) {
      toast.error("PDF upload failed", {
         id: toastId
      });
      console.log(error);
   } finally {
      setUploading(false);
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


      await fetchEventSource(`${import.meta.env.VITE_BACKEND_URL}/api/retrieval`, {
        method: "POST",
        headers,
        /* headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        }, */
        body: JSON.stringify({
          message: input,
          chatId: activeChatId
        }),

       onmessage(event) {
      const data = JSON.parse(event.data);


      if(data.type === "vault"){
         setActiveChatId(data.payload.chatId);
         fetchChats();
   }
      if (data.type === "status") {
        setStatus(data.payload.message);
      }
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
         <div className="h-dvh w-full overflow-hidden flex bg-[#05010a] text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/10 blur-3xl"></div>
             <Sidebar  user={user}
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
            <div className="flex-1 overflow-y-auto">
           <ChatMessages
           messages={messages}
            messageEndRef={messageEndRef}
            loading={loading}
             status={status}
             mode="vault"/>
             </div>
           
           <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                handleUpload={handleUpload}
                setFile={setFile}
                vaultMode={true}
                file={file}
                  uploading={uploading}
                />
           </div>
            </div>
        </>
  )
}
