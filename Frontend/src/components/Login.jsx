import React from 'react'
import { Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        const userInfo = {
            document: data.document,
            password: data.password,
        };
        await axios
            .post("http://localhost:3000/login", userInfo)
            .then((res) => {
                console.log(res.data);
                if (res.data) {
                    toast.success("Loggedin Successfully!");
                    document.getElementById("my_modal_3").close();
                    localStorage.setItem("Users", JSON.stringify(res.data.user));
                    setTimeout(() => {
                        navigate('/panelmedico');
                        window.location.reload();
                    }, 1000);
                }
            })
            .catch((err) => {
                if (err.response) {
                    console.log(err);
                    toast.error("Error: " + err.response.data.message);
                    setTimeout(() => {

                    }, 2000);

                }
            });
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
                            <button className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200">
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