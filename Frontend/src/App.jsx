import React from "react";
import Home from "./home/Home";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Sintomas from "./components/Sintomas";
import Panelmedico from "./components/Panelmedico";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthProvider";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import SymptomsTable from "./components/SymptomsTable";
import { useLocation } from "react-router-dom";

function App({ darkMode, setDarkMode }) {
  const [authUser, setAuthUser] = useAuth();
  console.log(authUser, setAuthUser);
  const location = useLocation();
  const showNavbar = location.pathname === "/home" || location.pathname === "/panelmedico";
  return (
    <>
      <div
        className="min-h-screen transition-colors duration-300"
        data-theme={darkMode ? "dark" : "light"}
      >
        {showNavbar && <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />}
        <Routes>
          <Route
            path="/"
            element={<Home darkMode={darkMode} setDarkMode={setDarkMode} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/sintomas" element={<Sintomas />} />
          <Route
            path="/panelmedico"
            element={
              <Panelmedico darkMode={darkMode} setDarkMode={setDarkMode} />
            }
          />
          <Route path="/symptoms-table" element={<SymptomsTable />} />

        </Routes>
        <Toaster />
      </div>
    </>
  );
}

export default App;
