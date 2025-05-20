import React from "react";
import Home from "./home/Home";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Signup from "./components/Signup";
import Sintomas from "./components/sintomas";
import Panelmedico from "./components/Panelmedico";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";


function App() {
  const [authUser, setAuthUser]=useAuth();
    console.log(authUser, setAuthUser);
  return (
    <>
      <div className="dark:text-white">
        
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/sintomas" element={authUser?<Sintomas />:<Navigate to="/signup"/>} />
            <Route path="/panelmedico" element={<Panelmedico />} />
          </Routes>
          <Toaster />
        
      </div>
    </>
  
  );
}

export default App
