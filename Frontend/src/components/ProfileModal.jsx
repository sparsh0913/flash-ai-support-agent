export default function ProfileModal({ user, setShowProfile }) {

  return (

    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-[#141414] border border-purple-500/20 rounded-3xl p-8 w-full max-w-md text-white relative">

        <button
          onClick={() => setShowProfile(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>

        <div className="flex flex-col items-center">

          <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-4xl font-bold mb-4">
            {user.username[0].toUpperCase()}
          </div>

          <h2 className="text-2xl font-bold">
            {user.username}
          </h2>

          <p className="text-gray-400 mt-1">
            {user.email}
          </p>

        </div>

        <div className="mt-8 space-y-4">

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-gray-400 text-sm">
              Google Calendar
            </p>

            <p className="mt-1 font-medium">
              {
                user.googleCalendar?.connected
                  ? "Connected ✅"
                  : "Not Connected"
              }
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-gray-400 text-sm">
              Member Since
            </p>

            <p className="mt-1 font-medium">
              {
                new Date(user.createdAt).toLocaleDateString()
              }
            </p>
          </div>

        </div>

      </div>

    </div>

  )
}