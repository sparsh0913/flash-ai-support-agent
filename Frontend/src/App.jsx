import { useState, userffect , useRef, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Header from "./components/Header";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import { BrowserRouter, createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import ResearchPage from "./pages/ResearchPage";
import HomePage from "./pages/HomePage";


const router = createBrowserRouter(
  [
     {
      path: "/",
      element:<HomePage/>
    },
    {
      path: "/chat",
      element:<ChatPage/>
    },
    {
      path: "/research",
      element:<ResearchPage/>
    }
  ]
)

function App() {
   
    return <RouterProvider router={router} />;
  
}

export default App
