import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ChatMessages from "../components/ChatMessages";
import ChatInput from "../components/ChatInput";

export default function ChatPage() {

      const [messages,setMessages] = useState([]);
      const [input , setInput] = useState("");
      const [loading, setLoading] = useState(false);
      const messageEndRef = useRef(null);
    
    
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
        "content-type": "application/JSON"
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
    
  return (
    <>
          <div className="h-screen flex bg-[#05010a] text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-800/10 blur-3xl"></div>
              <Sidebar></Sidebar>
              <div className="flex-1 relative z-10 flex flex-col">
           <div className="padding-4 border-b border-purple-900/40">
                  <Header></Header>
           </div>
           <ChatMessages
           messages={messages}
            messageEndRef={messageEndRef}
            loading={loading}/>
    
           <ChatInput input={input} setInput={setInput} handleSend={handleSend}/>
           </div>
            </div>
        </>
  )
}
