import React from "react";
import Home from "./home/Home";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sintomas from "./components/sintomas";
import Panelmedico from "./components/Panelmedico";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import Register from "./components/Register";
import Navbar from "./components/Navbar";

function App({ darkMode, setDarkMode }) {
  const [authUser, setAuthUser] = useAuth();
  console.log(authUser, setAuthUser);
  return (
    <>
      <div
        className="min-h-screen transition-colors duration-300"
        data-theme={darkMode ? "dark" : "light"}
      >
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route path="/" element={<Home darkMode={darkMode} setDarkMode={setDarkMode}/>} />
          <Route path="/register" element={<Register />} />
          <Route path="/sintomas" element={<Sintomas />} />
          <Route path="/panelmedico" element={<Panelmedico darkMode={darkMode} setDarkMode={setDarkMode}/>} />
        </Routes>
        <Toaster />
      </div>
    </>
  );
}

export default App;
