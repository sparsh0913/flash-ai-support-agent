import { useState, useRef, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Header from "./components/Header";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import { BrowserRouter, createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import ResearchPage from "./pages/ResearchPage";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";

function App() {
const [user, setUser] = useState(null);

const router = createBrowserRouter(
  [
     {
      path: "/",
      element:<HomePage user={user}  setUser={setUser}/>
    },
    {
      path: "/chat",
      element:<ChatPage user={user}  setUser={setUser}/>
    },
    {
      path: "/research",
      element:<ResearchPage user={user}  setUser={setUser}/>
    },
    {
      path: "/signup",
      element:<SignupPage/>
    },
     {
      path: "/login",
      element:<LoginPage setUser={setUser}/>
    },
  ]
)

  useEffect(() => {
  const checkUser = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/me", {
        credentials: "include"
      });

      if (!response.ok) return;

      const data = await response.json();

      setUser(data.user);

    } catch (error) {
      console.log(error);
    }
  };
  checkUser();
}, []);

    return <RouterProvider router={router} />;
  
}

export default App
