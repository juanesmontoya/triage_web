import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Login from "./Login";
import Logout from "./Logout";
import { useAuth } from "../context/AuthProvider";

export default function Navbar({ darkMode, setDarkMode }) {
  const [authUser] = useAuth();
  const location = useLocation();
  const [sticky, setSticky] = useState(false);

  const userData = JSON.parse(localStorage.getItem("Users"));
  const fullname = userData?.fullname || "";
  const documentId = userData?.document || "";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isUserLoggedIn = () => {
    return authUser && authUser !== null;
  };

  const navItems = (
    <>
      {/* commentando el boton de Home para que no aparezca en el navbar ya que no es necesario
      {location.pathname !== "/panelmedico" && (
        <li>
          <a href="/">Home</a>
        </li>
      )} */}
      {isUserLoggedIn() && location.pathname !== "/panelmedico" && (
        <li>
          <a href="./panelmedico">Doctor Panel</a>
        </li>
      )}
    </>
  );

  return (
    <>
      <div
        className={`w-full fixed top-0 left-1 z-50  ${sticky
          ? "sticky-navbar shadow-md bg-base-200 duration-300 transition-all ease-in-out"
          : ""
          }`}
      >
        <div className="navbar bg-base-100">
          <div className="navbar-start">
            <div className="dropdown">
              <label tabIndex={0} className="btn btn-ghost lg:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                {navItems}
              </ul>
            </div>
            <a className=" text-2xl font-bold cursor-pointer">Triage WEB</a>
            {location.pathname === "/panelmedico" && (
              <button
                className="ml-4 btn btn-sm btn-info"
                onClick={() => window.open('/symptoms-table', '_blank')}
              >
                Síntomología
              </button>
            )}
          </div>
          <div className="navbar-end space-x-3">
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1">{navItems}</ul>
            </div>

            <label className="swap swap-rotate">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              {/* 🌙 Oscuro (cuando darkMode es true) */}
              <svg
                className="swap-on fill-current w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 0010.17 9.79z" />
              </svg>
              {/* ☀️ Claro (cuando darkMode es false) */}
              <svg
                className="swap-off fill-current w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M5 12a7 7 0 1114 0 7 7 0 01-14 0zm7-9a1 1 0 011 1v1a1..." />
              </svg>
            </label>

            {userData && (
              <div className="text-right text-sm mr-2">
                <div className="font-semibold">Nombre: {fullname}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Doc: {documentId}
                </div>
              </div>
            )}

            {authUser ? (
              <Logout />
            ) : (
              <div className="">
                <a
                  className="bg-black text-white px-3 py-2 rounded-md hover:bg-slate-800 duration-300 cursor-pointer"
                  onClick={() =>
                    document.getElementById("my_modal_3").showModal()
                  }
                >
                  Login Salud
                </a>
                <Login />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
