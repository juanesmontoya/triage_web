import React from "react";
import Home from "./home/Home";
import { Route, Routes } from 'react-router-dom';
import Signup from "./components/Signup";
import Sintomas from "./components/sintomas";


function App() {
  return (
    <>
      <div className="dark:text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/sintomas" element={<Sintomas />} />
        </Routes>
      </div>
    </>
  
  );
}

export default App
