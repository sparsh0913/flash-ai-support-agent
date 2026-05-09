import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import ProfileModal from "./ProfileModal";

export default function Header({ user,setUser }){
  const [showDropdown, setShowDropdown] = useState(false);
const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const handleLogout = async () => {
  const response = await fetch("http://localhost:8080/api/auth/logout", {
    method: "POST",
    credentials: "include"
  });

  if (response.ok) {
   toast.success("Logged out");
    setUser(null);
    navigate("/");
  } else{
     toast.error("Logout failed");
  }
};
return(
<>
    <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/30 bg-black/20 backdrop-blur-lg">
  
  {/* Left Section */}
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
      <i className="fa-solid fa-brain text-white"></i>
      </div>
    <h1 className="text-lg font-semibold">Flash</h1>
  </div>

 {/* Right Section */}
<div className="flex items-center gap-6 text-sm text-gray-300">

  <Link to="/" className="hover:text-white transition">
    Dashboard
  </Link>

  {!user ? (
    <>
      <Link to="/login" className="hover:text-white transition">
        Login
      </Link>

      <Link to="/signup" className="hover:text-white transition">
        Signup
      </Link>
    </>
  ) : (
    <>
      <button className="hover:text-red-400 transition" onClick={handleLogout}>
        Logout
      </button>

<div className="relative">

  <button
    onClick={() => setShowDropdown(!showDropdown)}
    className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white"
  >
    {user.username[0].toUpperCase()}
  </button>

  {
    showDropdown && (

      <div className="absolute right-0 mt-3 w-52 bg-[#141414] border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden z-50">

        <button
          onClick={() => {
            setShowProfile(true);
            setShowDropdown(false);
          }}
          className="w-full text-left px-4 py-3 hover:bg-white/5 transition"
        >
          Profile
        </button>

        <button
          className="w-full text-left px-4 py-3 hover:bg-white/5 transition"
        >
          Settings
        </button>
      </div>

    )
  }
</div>

    </>
  )}
 </div>
</div>

{
  showProfile && (
    <ProfileModal
      user={user}
      setShowProfile={setShowProfile}
    />
  )
}

</>
)
}
