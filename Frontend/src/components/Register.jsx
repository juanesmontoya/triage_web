import React from 'react'
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/"
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

const onSubmit = async (data) => { 
  const userInfo = {
    fullname: data.fullname,
    document: data.document,
    email: data.email,
    password: data.password,
  }
  
  console.log("Datos enviados:", userInfo); // Datos enviados
  
  try {
    const res = await axios.post("http://localhost:3000/triage/register", userInfo);
    
    console.log("Respuesta completa:", res.data);
    
    
    if (res.data && (res.data.ok || res.data.success || res.status === 200)) {
      toast.success("Registration Successful!");
      
      
      const userData = res.data.user || res.data.data || res.data;
      console.log("Datos del usuario a guardar:", userData); 
      
      if (userData) {
        localStorage.setItem("Users", JSON.stringify(userData));
        console.log("Guardado en localStorage:", localStorage.getItem("Users")); 
      } else {
        console.warn("No se encontraron datos del usuario en la respuesta");
      }
      
      navigate(from, {replace: true});
    } else {
      console.log("Respuesta no exitosa:", res.data);
      toast.error("Error en el registro: " + (res.data.message || "Error desconocido"));
    }
  } catch (err) {
    console.error("Error completo:", err); // ver error completo
    if (err.response) {
      console.log("Error de respuesta:", err.response.data);
      toast.error("Error: " + (err.response.data.message || "Error del servidor"));
    } else if (err.request) {
      console.log("Error de red:", err.request);
      toast.error("Error de red, verifica tu conexión");
    } else {
      console.log("Error:", err.message);
      toast.error("Error inesperado, intenta de nuevo");
    }
  }
};

  return (
    <>
      <div className='flex h-screen items-center justify-center'>
        <div className="border-[1px] shadow-md p-5 rounded-md border-gray-600">
          <div className="">
            <form onSubmit={handleSubmit(onSubmit)} method="dialog"> 
              <Link
                to="/"
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => document.getElementById("my_modal_3")?.close()}
              >
                ✕
              </Link>
            
              <h3 className="font-bold text-lg">Crear cuenta</h3>
              
              {/* Name */}
              <div className='mt-4 space-y-2'>
                <span>Nombre completo</span>
                <br />
                <input 
                  type='text' 
                  placeholder='Ingresa tu nombre completo' 
                  className='w-80 px-3 py-1 border rounded-md outline-none'
                  {...register("fullname", { required: true })}
                />
                {errors.fullname && <span className='text-sm text-red-500'><br />Este campo es requerido</span>}
              </div>

              {/* Document */}
              <div className='mt-4 space-y-2'>
                <span>Documento</span>
                <br />
                <input 
                  type='text' 
                  placeholder='Ingresa tu documento' 
                  className='w-80 px-3 py-1 border rounded-md outline-none'
                  {...register("document", { required: true })}
                />
                {errors.document && <span className='text-sm text-red-500'><br />Este campo es requerido</span>}
              </div>

              {/* Email */}
              <div className='mt-4 space-y-2'>
                <span>Email</span>
                <br />
                <input 
                  type='email' 
                  placeholder='Ingresa tu email' 
                  className='w-80 px-3 py-1 border rounded-md outline-none'
                  {...register("email", { required: true })}
                />
                {errors.email && <span className='text-sm text-red-500'><br />Este campo es requerido</span>}
              </div>

              {/* Password */}
              <div className='mt-4 space-y-2'>
                <span>Contraseña</span>
                <br />
                <input 
                  type='password' 
                  placeholder='Ingresa tu contraseña' 
                  className='w-80 px-3 py-1 border rounded-md outline-none'
                  {...register("password", { required: true })} 
                />
                {errors.password && <span className='text-sm text-red-500'><br />Este campo es requerido</span>}
              </div>
              
              {/* Button */}
              <div className='flex justify-around mt-4'>
                <button 
                  type="submit"
                  className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200"
                >
                  Registrarse
                </button>
                <p className='text-sm'>
                  ¿Ya tienes cuenta?{" "} 
                  <button 
                    type="button"
                    className="underline text-blue-500 cursor-pointer"
                    onClick={() => document.getElementById("my_modal_3")?.showModal()}
                  >
                    Login
                  </button>
                  <Login />  
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register