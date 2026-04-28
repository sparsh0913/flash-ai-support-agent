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
import VaultPage from "./pages/VaultPage";


function App() {
const [user, setUser] = useState(null);
const hasRun = useRef(false);

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
    {
       path: "/vault",
       element: <VaultPage user={user} setUser={setUser} />
}
  ]
)

 useEffect(() => {
  if (hasRun.current) return;
    hasRun.current = true;
  const checkUser = async () => {
    try {
      const refreshResponse = await fetch(
        "http://localhost:8080/api/auth/refreshToken",
        {
          credentials: "include",
        }
      );

      console.log(refreshResponse.status);
      if (!refreshResponse.ok) return;

      const refreshData = await refreshResponse.json();
      console.log(refreshData);

      const token = refreshData.accessToken;

      const response = await fetch(
        "http://localhost:8080/api/auth/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
