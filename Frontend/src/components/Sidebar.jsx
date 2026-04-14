
export default function Sidebar(){

    {/* sidebar */}
    return(
        <div className="w-64 border-r border-purple-900/40 p-4 bg-black/40 backdrop-blur-lg relative z-10">
                <div className="mb-6">
                <button className="w-full bg-purple-600 hover:bg-purple-500 transition py-2 rounded-xl">
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
                  <i class="fa-solid fa-chart-simple"></i> Data Analysis
                </div>

                <div className="p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <i className="fa-solid fa-list-check"></i> Summarization
                </div>
              </div>
        </div>
    )
          



}