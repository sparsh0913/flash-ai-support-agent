import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function SignupPage() {

const navigate = useNavigate();
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleSignup = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        username,
        email,
        password
      })
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
   navigate("/login");
}

  } catch (error) {
    console.log(error);
  }
};

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      
      <div className="w-full max-w-md bg-zinc-900 border border-purple-500/30 rounded-2xl p-8 shadow-xl">
        
        <h1 className="text-3xl font-bold text-center mb-2">
          Create Account
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Join Flash and start using your AI workspace
        </p>

        <form className="space-y-4" onSubmit={handleSignup}>
          
          <input
            type="text"
            placeholder="Username"
            value={username}
             onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-purple-500"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-purple-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black border border-zinc-700 focus:outline-none focus:border-purple-500"
          />

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 transition py-3 rounded-lg font-semibold"
          >
            Sign Up
          </button>

        </form>

          <p className="text-sm text-gray-400 text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:text-purple-300">
                login
            </Link>
            </p>
      </div>
    </div>
  );
}

export default SignupPage;