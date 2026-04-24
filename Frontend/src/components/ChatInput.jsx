export default function ChatInput({ input, setInput, handleSend }){

  const handleKeyDown = (e)=>{
    if(e.key === 'Enter'){
      e.preventDefault();
      handleSend();
    }
  }

    return(

        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-6 pt-10 
                       bg-gradient-to-t from-[#05010a] via-[#05010a]/80 to-transparent">
         
         <div className="max-w-3xl mx-auto">
  <div className="flex items-center bg-white/5 backdrop-blur-xl border border-purple-900/40 rounded-2xl px-4 py-3">
    
    <input
      type="text"
      placeholder="Ask anything..."
      value={input}
      onChange={(e)=>setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
    />

    <button className="ml-3 bg-purple-600 hover:bg-purple-500 transition px-4 py-2 rounded-xl" onClick={handleSend}>
      Send
       </button>

    </div>
   </div>
       </div>

    )
}