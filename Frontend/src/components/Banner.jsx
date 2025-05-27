import React, { useState } from 'react'
import banner from "../../public/doc.png";
import { useForm } from 'react-hook-form';

function Banner() {
  const { register, handleSubmit, reset } = useForm();
  const { register: registerPatient, handleSubmit: handleSubmitPatient, reset: resetPatient } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSubmit = (data) => {
    console.log('Documento ingresado:', data);
    // Abrir el modal cuando se envía el formulario del documento
    setIsModalOpen(true);
  };

  const userExists = (data) => {
    console.log('Documento ingresado:', data);
    // Abrir el modal cuando se envía el formulario del documento
    setIsModalOpen(true);
  };

  const onSubmitPatient = (data) => {
    console.log('Datos del paciente:', data);
    
    // lógica para enviar los datos del paciente
    setIsModalOpen(false);
    resetPatient(); // Limpiar el formulario del modal
    reset(); // Limpiar el formulario principal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetPatient(); // Limpiar el formulario cuando se cierre el modal
  };

  return (
    <>
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col md:flex-row my-10">
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
            <form onSubmit={handleSubmit(userExists)}>
              <label className="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                </svg>
              </label>
              <button type="submit" className="btn mt-4 btn-primary">Iniciar triage</button>
            </form>
            <form onSubmit={handleSubmit(onSubmit)}>
              <button type="submit" className="btn mt-4 btn-secondary">Registro</button>
            </form>
          </div>
        </div>
        
        <div className="order-1 w-full mt-20 md:w-1/2">
          <img
            src={banner}
            className="md:w-[550px] md:h-[460px] md:ml-12"
            alt=""
          />
        </div>
      </div>

      {/* Modal de Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Registro de Paciente</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitPatient(onSubmitPatient)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Ingrese su nombre completo"
                  {...registerPatient("fullname", { required: "El nombre completo es requerido" })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Ingrese su documento"
                  {...registerPatient("document", { required: "El documento es requerido" })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="Ingrese su email"
                  {...registerPatient("email", { 
                    required: "El email es requerido",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Email inválido"
                    }
                  })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-outline flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-secondary flex-1"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Banner