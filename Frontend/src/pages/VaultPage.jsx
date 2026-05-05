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
      const messageEndRef = useRef(null);
       const navigate = useNavigate();
    
const handleUpload = async () => {
 
  
  if (!file) return;
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("userId", user?._id);

  const response = await fetch("http://localhost:5001/upload", {
    method: "POST",
    body: formData,
  });

  console.log("Status:", response.status);
  const data = await response.json();
 console.log("Response Data:", data);

  if (data.success) {
    setUploaded(true);
     setFile(null);

    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: `📄 ${file.name} uploaded successfully. Ask anything about this PDF.`
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
        }),

       onmessage(event) {
      const data = JSON.parse(event.data);

      if (data.type === "status") {
        setStatus(data.payload.message);
      }
    },

        onerror(err) {
          console.error("SSE error:", err);
        }
      });
      setLoading(false);
    
     /*  const assistantMessage = {
        role:"assistant",
        content:data.answer
      };
      
  
      setMessages((prev)=>[...prev,assistantMessage]); */
    }

    useEffect(()=>{
     messageEndRef.current?.scrollIntoView({behavior:"smooth"})
    },[messages])
    
  return (
    <>
          <div className="h-screen flex bg-[#05010a] text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/10 blur-3xl"></div>
              <Sidebar user={user} />
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
