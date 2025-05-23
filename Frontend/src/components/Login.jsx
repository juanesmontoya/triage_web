import React from 'react'
import { Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import axios from 'axios';
import toast from 'react-hot-toast';

function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    
    const onSubmit = async (data) => {
        const userInfo = {
            document: data.document,
            password: data.password,
        }
        
        console.log("Datos enviados:", userInfo); 
        
        try {
            const res = await axios.post("http://localhost:3000/triage/login", userInfo);
            
            console.log("Respuesta completa:", res.data); 
            
            
            if (res.data && (res.data.ok || res.data.success || res.status === 200)) {
                toast.success("Login exitoso!");
                document.getElementById("my_modal_3")?.close();
                
                
                const userData = res.data.user || res.data.data || res.data;
                console.log("Datos del usuario a guardar:", userData); 
                
                if (userData) {
                    localStorage.setItem("Users", JSON.stringify(userData));
                    console.log("Guardado en localStorage:", localStorage.getItem("Users")); 
                } else {
                    console.warn("No se encontraron datos del usuario en la respuesta");
                }
                
                setTimeout(() => {
                    window.location.reload();
                }, 1000);  
            } else {
                console.log("Respuesta no exitosa:", res.data);
                toast.error("Error en el login: " + (res.data.message || "Error desconocido"));
            }
        } catch (err) {
            console.error("Error completo:", err); 
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
        <div>
            <dialog id="my_modal_3" className="modal">
                <div className="modal-box">
                    <form onSubmit={handleSubmit(onSubmit)} method="dialog"> 
                        <Link
                            to="/"
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={() => document.getElementById("my_modal_3")?.close()}
                        >
                            ✕
                        </Link>
                    
                        <h3 className="font-bold text-lg">Login</h3> 
                        
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
                                Login
                            </button>
                            <p>
                                ¿No estás registrado?{" "} 
                                <Link to="/register" className="underline text-blue-500 cursor-pointer">
                                    Registrarse
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
}

export default Login