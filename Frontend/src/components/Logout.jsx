import React from 'react'
import { useAuth } from '../context/AuthProvider'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

function Logout() {
    const navigate = useNavigate();
    const [authUser, setAuthUser]= useAuth()
    const handleLogout=()=>{
        try {
            setAuthUser({
                ...authUser,
                user:null,
            })
            localStorage.removeItem("Users");
            toast.success("Logout successfully");
            
          setTimeout(() => {
            navigate('/');
            window.location.reload();
          },3000);
        } catch (error) {
            toast.error("Error: " + error)
            setTimeout(() =>{},2000)    
        }
    };
  return (
    <div>
      <button className='px-3 py-2 bg-red-500 text-white rounded-md cursor-pointer'
      onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

export default Logout
