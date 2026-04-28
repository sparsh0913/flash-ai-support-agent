import { useNavigate } from "react-router-dom";
export default function Sidebar({user}){
  const navigate = useNavigate();
    {/* sidebar */}
    return(
        <div className="w-64 border-r border-purple-900/40 p-4 bg-black/40 backdrop-blur-lg relative z-10">
                <div className="mb-6">
                <button onClick={() => navigate("/")}
                className="w-full bg-purple-600 hover:bg-purple-500 transition py-2 rounded-xl">
                  <i class="fa-solid fa-pen-to-square"></i> New Chat
                </button>
              </div>


              <div className="mt-6 text-gray-400 text-xs">MODES</div>
              <div onClick={() => navigate("/chat")} 
                className="mt-2 p-3 rounded-xl cursor-pointer 
             bg-purple-600/20 border border-purple-500/30
             hover:bg-purple-600/30 transition-all
             text-white font-medium text-base"
              >
                 <i className="fa-solid fa-calendar-check"></i> Flash Manager
                </div>

                <div onClick={() => navigate("/research")}
                  className="mt-2 p-3 rounded-xl cursor-pointer 
             bg-purple-600/20 border border-purple-500/30
             hover:bg-purple-600/30 transition-all
             text-white font-medium text-base"
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
                  className="mt-2 p-3 rounded-xl cursor-pointer
                  bg-purple-600/20 border border-purple-500/30
                  hover:bg-purple-600/30 transition-all
                  text-white font-medium text-base"
                >
                  <i className="fa-solid fa-folder-open"></i> Flash Vault
                </div>
        </div>
    )
          



}