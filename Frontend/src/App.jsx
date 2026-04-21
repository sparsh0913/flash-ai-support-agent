import { useState, userffect , useRef, useEffect } from "react";
import Sidebar from "./components/sidebar";
import Header from "./components/Header";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import { BrowserRouter, createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import ResearchPage from "./pages/ResearchPage";


const router = createBrowserRouter(
  [
    {
      path: "/",
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
