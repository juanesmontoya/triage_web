import React from 'react'
import axios from 'axios'; // Import axios
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Login from './Login';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/"
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

const onSubmit = async (data) => { 
  const userInfo={
    fullname: data.fullname,
    email: data.email,
    password: data.password,
  }
  await axios
  .post("http://localhost:4001/user/signup", userInfo)
  .then((res) => {
    console.log(res.data);
    if (res.data) {
      toast.success("Signup Successfully!");
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
                    {/* if there is a button in form, it will close the modal */}
                    <Link
                    to="/"
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => document.getElementById("my_modal_3").close()}
                   >
                    ✕
                   </Link>
                
                <h3 className="font-bold text-lg">Crear cuenta</h3>
                   {/* Name */}
                    <div className='mt-4 space-y-2'>
                        <span>Name</span>
                        <br />
                        <input 
                        type='text' 
                        placeholder='Enter your fullname' 
                        className='w-80 px-3 py-1 border rounded-md outline-none'
                        {...register("fullname", { required: true })}
                        
                        />
                        {errors.fullname && <span className='text-sm text-red-500'><br />This field is required</span>}
                        
                            
                    </div>
                    
                   
                    
                    {/* email */}
                        <div className='mt-4 space-y-2'>
                        <span>Email</span>
                        <br />
                        <input 
                        type='email' 
                        placeholder='Enter your email' 
                        className='w-80 px-3 py-1 border rounded-md outline-none'
                        {...register("email", { required: true })}
                        
                        />
                        {errors.email && <span className='text-sm text-red-500'><br />This field is required</span>}
                        
                            
                    </div>
                    {/* password */}
                    <div className='mt-4 space-y-2'>
                        <span>Password</span>
                        <br />
                        <input 
                        type='text' 
                        placeholder='Enter your password' 
                        className='w-80 px-3 py-1 border rounded-md outline-none'
                        {...register("password", { required: true })} 
                        
                        />
                        {errors.password && <span className='text-sm text-red-500'><br />This field is required</span>}
                        
                    </div>
                    
                    {/* button */}
                    <div className='flex justify-around mt-4'>
                        <button className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200">Signup</button>
                        <p className='text-sm'>
                            Have account?{" "} 
                            <buttom 
                            className="underline text-blue-500 cursor-pointer"
                            onClick={() =>
                              document.getElementById("my_modal_3").showModal()

                            }>
                                Login
                            </buttom>{" "}
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

export default Signup
