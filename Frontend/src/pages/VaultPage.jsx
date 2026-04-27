import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";

export default function VaultPage({ user , setUser}) {
      const [messages,setMessages] = useState([]);
      const [input , setInput] = useState("");
      const [loading, setLoading] = useState(false);
      const [file, setFile] = useState(null);
      const [uploaded, setUploaded] = useState(false);
      const messageEndRef = useRef(null);
    
const handleUpload = async () => {
  if (!file) return;

  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("userId", user?.id);

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
      const response = await fetch("http://localhost:8080/api/retrieval",{
       
      method:"POST",
      headers:{
        "content-type": "application/JSON"
      },
      body : JSON.stringify({
        message:input,
        userId:user.id
      })
      });
    
      const data = await response.json();
      console.log(data);
    
      const assistantMessage = {
        role:"assistant",
        content:data.answer
      };
      setLoading(false);
    
      setMessages((prev)=>[...prev,assistantMessage]);
    
    }
    useEffect(()=>{
     messageEndRef.current?.scrollIntoView({behavior:"smooth"})
    },[messages])
    
  return (
    <>
          <div className="h-screen flex bg-[#05010a] text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/10 blur-3xl"></div>
              <Sidebar></Sidebar>
              <div className="flex-1 relative z-10 flex flex-col">
           <div className="padding-4 border-b border-purple-900/40">
                  <Header user={user} setUser={setUser} />
           </div>
           <ChatMessages
           messages={messages}
            messageEndRef={messageEndRef}
            loading={loading}/>

    
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
