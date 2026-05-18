import { BeatLoader } from "react-spinners";
import EmptyState from "./EmptyState";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export default function StateMessages({ messages, messageEndRef ,loading, status,mode}){

    return(
        <div className="flex-1 p-6  overflow-y-auto space-y-4 pb-32">

            {messages.length === 0 && (
              <EmptyState mode={mode} />
            )}
        <div className="max-w-3xl mx-auto space-y-4">

       {
        messages.map((msg,index)=>(
       <div
            key={index}
              /* className={`flex ${
           msg.role === "user" ? "justify-end" : "justify-start"
             }`} */
             className={`flex min-w-0 ${
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
/*  <div className="prose prose-invert max-w-none">
  <ReactMarkdown
    rehypePlugins={[rehypeHighlight]}
  >
    {msg.content}
  </ReactMarkdown>
</div> */
<div className="prose prose-invert max-w-none break-words overflow-hidden">
  <ReactMarkdown
    rehypePlugins={[rehypeHighlight]}
    components={{
     pre: ({ children }) => (
  <div className="max-w-full overflow-x-auto">
    <pre className="min-w-0 rounded-xl p-4 text-sm">
      {children}
    </pre>
  </div>
),

      code: ({ children, className }) => (
        <code className={`${className || ""} break-words`}>
          {children}
        </code>
      )
    }}
  >
    {msg.content}
  </ReactMarkdown>
</div>
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