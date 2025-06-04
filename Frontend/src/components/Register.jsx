import React from 'react'
import axios from 'axios'; // Import axios
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/panelmedico"
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
  await axios
    .post(`${import.meta.env.VITE_API_URL}register`, userInfo)
    .then((res) => {
      console.log(res.data);
      if (res.data) {
        toast.success("Register Successfully!");
        navigate (from, {replace: true});
      }
      localStorage.setItem("Users", JSON.stringify(res.data.user));
    })
    .catch((err) =>{
      if(err.response){
        console.log(err);
        toast.error("Error: " + err.response.data.message);
      }
    });
    
      
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
                <button className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200">
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