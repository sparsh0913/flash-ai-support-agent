import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
export default function Sidebar({user,chats,setActiveChatId,activeChatId,setInput,setStatus,setMessages,setChats,isSidebarOpen,setIsSidebarOpen}){

  const navigate = useNavigate();
  const location = useLocation();

  const handleNewChat = () => {

   setMessages([]);
   setActiveChatId(null);
   setInput("");
   setStatus("");

   navigate("/");
};

const handleDeleteChat = async (chatId) => {
 console.log("chatid",chatId);
  try {
    const response = await fetch(
     `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}`,
      {
        method: "DELETE",
        headers: {
      Authorization: `Bearer ${user.accessToken}`
    },
        credentials: "include",
      }
    );
    if (response.ok) {
      setChats((prev) =>
        prev.filter((chat) => chat._id !== chatId)
      );
    }
  } catch (error) {
    console.log(error);
  }
};
    {/* sidebar */}
    return(
            <div
          className={`
            fixed md:relative
            top-0 left-0
            h-screen w-64
            flex flex-col
            border-r border-purple-900/40
            p-4 bg-black/95 md:bg-black/40
            backdrop-blur-lg
            z-50
            transition-transform duration-300

            md:translate-x-0

            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >         
        <div className="md:hidden flex justify-end mb-4">
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-2xl text-white"
                      >
                          ×
                      </button>
                    </div>
                <div className="mb-6">
                <button onClick={handleNewChat}
                className="w-full bg-purple-600 hover:bg-purple-500 transition py-2 rounded-xl">
                  <i class="fa-solid fa-pen-to-square"></i> New Chat
                </button>
              </div>


              <div className="mt-6 text-gray-400 text-xs">MODES</div>
              <div onClick={() => {
                 if(!user) {
                  toast("Please login to use Flash Manager");
                  navigate("/login");
                  return;
                  } 
                    navigate("/chat");
                  }} 
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
                  toast("Please login to use Flash Vault");
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
                   <div className="flex-1 overflow-y-auto">
                  {
                    chats?.map((chat)=>(
                <div key={chat._id}
                className={`group px-3 py-2 rounded-xl cursor-pointer
                              transition-all duration-200
                              ${
                                activeChatId === chat._id
                                  ? "bg-white/15"
                                  : "hover:bg-white/10"
                              }`}
                          onClick={() => setActiveChatId(chat._id)}>
                             <div className="flex items-center gap-2 w-full overflow-hidden">
                            <p className="font-semibold text-white truncate flex-1 min-w-0">
                              {chat.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(chat._id);
                              }}
                           className="
                                  shrink-0
                                  opacity-100 md:opacity-0
                                  md:group-hover:opacity-100
                                  text-gray-400 hover:text-red-400
                                  transition
                                  "
                            >
                              ✕
                            </button>

                          </div>
                          </div>
                          ))
                        }
                        </div>
                             </div>
                             )}