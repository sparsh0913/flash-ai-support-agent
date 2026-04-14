export default function Header(){


return(

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
    <button className="hover:text-white transition">Dashboard</button>
    <button className="hover:text-white transition">Login</button>

    {/* Profile circle */}
    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
      S
    </div>
  </div>

</div>
)


}