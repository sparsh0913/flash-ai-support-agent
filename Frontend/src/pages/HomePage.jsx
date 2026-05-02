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
    await fetchEventSource("http://localhost:8080/", {
      method: "POST",

  headers: {
    "Content-Type": "application/json",
  },

  body: JSON.stringify({
    query: input,
  }),

  onmessage(event) {
  const parsedData = JSON.parse(event.data);
    
  if (parsedData.type === "ai") {

    setMessages((prevMessages) => {

      const lastMessage = prevMessages[prevMessages.length - 1];

      if (lastMessage && lastMessage.role === "assistant") {

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
  },
})
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
            loading={loading}/>
    
           <ChatInput input={input} setInput={setInput} handleSend={handleSend}/>
           </div>
            </div>
        </>
  )
}
