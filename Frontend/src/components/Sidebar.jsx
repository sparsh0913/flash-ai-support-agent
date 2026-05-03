import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
export default function Sidebar({user,chats,setActiveChatId,activeChatId}){

  const navigate = useNavigate();
  const location = useLocation();
    {/* sidebar */}
    return(
        <div className="w-64 h-screen flex flex-col border-r border-purple-900/40 p-4 bg-black/40 backdrop-blur-lg relative z-10">
                <div className="mb-6">
                <button onClick={() => navigate("/")}
                className="w-full bg-purple-600 hover:bg-purple-500 transition py-2 rounded-xl">
                  <i class="fa-solid fa-pen-to-square"></i> New Chat
                </button>
              </div>


              <div className="mt-6 text-gray-400 text-xs">MODES</div>
              <div onClick={() => navigate("/chat")} 
                className={`mt-2 p-3 rounded-xl cursor-pointer
                border transition-all text-white font-medium text-base
                ${
                  location.pathname === "/chat"
                    ? "bg-purple-700 border-purple-400"
                    : "bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/30"
                }`}
              >
                 <i className="fa-solid fa-calendar-check"></i> Flash Manager
                </div>

                <div onClick={() => navigate("/research")}
                className={`mt-2 p-3 rounded-xl cursor-pointer
                border transition-all text-white font-medium text-base
                ${
                  location.pathname === "/research"
                    ? "bg-purple-700 border-purple-400"
                    : "bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/30"
                }`}
            >
                 <i className="fa-solid fa-microscope"></i> Flash Research
                </div>

                <div
                onClick={() => {
                 if(!user) {
                  navigate("/login");
                  return;
                  } 
                    navigate("/vault");
                  }}
                 className={`mt-2 p-3 rounded-xl cursor-pointer
                border transition-all text-white font-medium text-base
                ${
                  location.pathname === "/vault"
                    ? "bg-purple-700 border-purple-400"
                    : "bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/30"
                }`}
                >
                  <i className="fa-solid fa-folder-open"></i> Flash Vault
                </div>
                    <h2 className="text-sm text-gray-400 mt-6 mb-3">
                    Recent Chats
                  </h2>
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900/40 scrollbar-track-transparent">
                  {
                    chats?.map((chat)=>(
                <div key={chat._id}
                className={`px-3 py-2 rounded-xl cursor-pointer
                              transition-all duration-200
                              ${
                                activeChatId === chat._id
                                  ? "bg-white/15"
                                  : "hover:bg-white/10"
                              }`}
                          onClick={() => setActiveChatId(chat._id)}>
                              <p className="font-semibold text-white truncate">
                                      {chat.title}
                                      </p>
                          </div>
                          ))
                        }
                        </div>
                             </div>
    )
          



}