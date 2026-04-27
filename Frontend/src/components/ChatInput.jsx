export default function ChatInput({ input, setInput, handleSend ,  setFile, vaultMode, file}){

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
    
    {vaultMode && (
  <label className="mr-3 cursor-pointer text-gray-400 hover:text-white transition">
    <i className="fa-solid fa-paperclip text-lg"></i>

    <input
      type="file"
      accept=".pdf"
      className="hidden"
      onChange={(e) => setFile(e.target.files[0])}
    />
  </label>
)}

{file && (
  <button
    onClick={() => window.open(URL.createObjectURL(file), "_blank")}
    className="mr-3 text-sm text-purple-300 hover:text-white underline"
  >
    {file.name}
  </button>
)}

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