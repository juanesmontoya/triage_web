import React from 'react'
import banner from "../../public/doc.png";


function Banner() {
  return (
    <>
    <div className=" max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col md:flex-row my-10">
      <div className="w-full order-2 md:order-1 md:w-1/2 mt-12 md:mt-36">
        <div className="space-y-8">
          <h1 className="text-2xl md:text-4xl font-bold">
            Hola, Bienvenido {" "}
            <span className="text-pink-500">¿Experimentas síntomas o malestar?</span>
          </h1>
          <p className="text-sm md:text-xl">
          Utiliza nuestro sistema de triaje automatizado con IA y 
          procesamiento de lenguaje natural para una orientación precisa en minutos.
          </p>
          <label className="input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 opacity-70"
            >
              <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
              
            </svg>
            <input type="text" className="grow" placeholder="Ingrese sus sintomas"/>
          </label>
        </div>
        <a href='./sintomas' className="btn mt-4 btn-secondary">Comprueba tus síntomas</a>
      </div>
      <div className=" order-1 w-full mt-20 md:w-1/2">
        <img
          src={banner}
          className="md:w-[550px] md:h-[460px] md:ml-12"
          alt=""
        />
      </div>
    </div>
  </>
  )
}

export default Banner
