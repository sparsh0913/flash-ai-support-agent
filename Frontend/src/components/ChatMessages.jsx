import { BeatLoader } from "react-spinners";

export default function StateMessages({ messages, messageEndRef ,loading, status}){

    return(

        <div className="flex-1 p-6  overflow-y-auto space-y-4 pb-32">
        <div className="max-w-3xl mx-auto space-y-4">

       {
        messages.map((msg,index)=>(

       <div
            key={index}
              className={`flex ${
           msg.role === "user" ? "justify-end" : "justify-start"
             }`}
       >
        <div
          className={`max-w-xl px-4 py-3 rounded-2xl ${
          msg.role === "user"
            ? "bg-purple-600 text-white"
            : "bg-white/10 text-gray-200 backdrop-blur-lg"
        }`}>
       {msg.type === "pdf" ? (
       <span>
            <a
              href={msg.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-purple-400"
            >
              📄 {msg.fileName}
            </a>{" "}
            uploaded successfully. Ask anything about this PDF.
          </span>
        ) : (
          msg.content
        )}
        </div>
       </div>
        ))}

        {loading && (
            <div className="flex justify-start">
              <div className="max-w-xl px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-lg">
                <BeatLoader size={6} color="#a855f7" />
              </div>
            </div>  
           )}

           {status && (
          <div className="px-2 text-sm text-white-400">
              {status}
          </div>
        )}

        <div ref={messageEndRef} />
       </div>
  </div>
    )
}