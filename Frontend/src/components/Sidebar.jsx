import { useNavigate } from "react-router-dom";
export default function Sidebar(){

  const navigate = useNavigate();
    {/* sidebar */}
    return(
        <div className="w-64 border-r border-purple-900/40 p-4 bg-black/40 backdrop-blur-lg relative z-10">
                <div className="mb-6">
                <button onClick={() => navigate("/")}
                className="w-full bg-purple-600 hover:bg-purple-500 transition py-2 rounded-xl">
                  New Chat
                </button>
              </div>

              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                    Features
                  </p> 

                                      <div className="space-y-2 text-sm">
                <div className="p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <i className="fa-solid fa-bolt"></i> Tool Calling
                </div>

                <div className="p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <i className="fa-brands fa-searchengin"></i> Live Web Search
                </div>

                <div className="p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <i className="fa-solid fa-brain"></i> Context Memory
                </div>

                <div className="p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <i class="fa-solid fa-chart-simple"></i> Deep Research
                </div>

                <div className="p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <i className="fa-solid fa-list-check"></i> Summarization
                </div>
              </div>

              <div className="mt-6 text-gray-400 text-xs">MODES</div>
              <div onClick={() => navigate("/chat")} 
                className="mt-2 p-3 rounded-xl cursor-pointer 
             bg-purple-600/20 border border-purple-500/30
             hover:bg-purple-600/30 transition-all
             text-white font-medium text-base"
              >
                 <i className="fa-solid fa-calendar-check"></i> Calendar Agent
                </div>

                <div onClick={() => navigate("/research")}
                  className="mt-2 p-3 rounded-xl cursor-pointer 
             bg-purple-600/20 border border-purple-500/30
             hover:bg-purple-600/30 transition-all
             text-white font-medium text-base"
            >
                 <i className="fa-solid fa-microscope"></i> Research Agent
                </div>
        </div>
    )
          



}