import React, { useState } from 'react'
import banner from "../../public/doc.png";
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

//linea para guardar cambios

function Banner() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerPatient, handleSubmit: handleSubmitPatient, reset: resetPatient, formState: { errors: errorsPatient } } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  
  const onInitiateTriage = async (data) => {
    setIsLoading(true);
    const patientData = { document: data.document };
    
    await axios
      .post(`${import.meta.env.VITE_API_URL}pacient/validatePacient`, patientData)
      .then((res) => {
        console.log(res.data);
        if (res.data.ok && res.data.pacient) {
          // Verificar que realmente encontró un paciente
          const pacientFound = Array.isArray(res.data.pacient) ? res.data.pacient[0] : res.data.pacient;
          
          if (pacientFound && pacientFound._id) {
            // Guardar todos los datos del paciente incluyendo timestamps
            const fullPacientData = {
              _id: pacientFound._id,
              fullname: pacientFound.fullname,
              document: pacientFound.document,
              email: pacientFound.email,
              createdAt: pacientFound.createdAt,
              updatedAt: pacientFound.updatedAt
            };
            
            localStorage.setItem("Patient", JSON.stringify(fullPacientData));
            toast.success("Documento verificado. Iniciando triage...");
            navigate('/sintomas', { state: { paciente: fullPacientData } });
          } else {
            // No se encontró paciente válido
            toast.error("Documento no encontrado. Por favor regístrese primero.");
            reset();
          }
        } else {
          // Respuesta no válida del servidor
          toast.error("Documento no encontrado. Por favor regístrese primero.");
          reset();
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(err);
          if (err.response.status === 404) {
            toast.error("Documento no encontrado. Por favor regístrese primero.");
          } else if (err.response.status === 400) {
            toast.error("Documento es requerido.");
          } else {
            toast.error("Error: " + (err.response.data.message || "Error del servidor"));
          }
        } else {
          toast.error("Error de conexión");
        }
        reset(); // Limpiar el formulario en caso de error
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Función para abrir modal de registro
  const openRegistrationModal = () => {
    setIsModalOpen(true);
  };

  // Función para registrar nuevo paciente
  const onSubmitPatient = async (data) => {
    setIsLoading(true);
    const patientInfo = {
      fullname: data.fullname,
      document: data.document,
      email: data.email
    };

    await axios
      .post(`${import.meta.env.VITE_API_URL}pacient/createPacient`, patientInfo)
      .then((res) => {
        console.log(res.data);
        if (res.data.ok && res.data.pacient) {
          // Guardar todos los datos completos del paciente según el modelo
          const fullPacientData = {
            _id: res.data.pacient._id,
            fullname: res.data.pacient.fullname,
            document: res.data.pacient.document,
            email: res.data.pacient.email,
            createdAt: res.data.pacient.createdAt,
            updatedAt: res.data.pacient.updatedAt
          };
          
          localStorage.setItem("Patient", JSON.stringify(fullPacientData));
          toast.success("Registro exitoso! Iniciando triage...");
          

          
          // Cerrar modal y limpiar formularios
          setIsModalOpen(false);
          resetPatient();
          reset();
          
          // Redirigir automáticamente a síntomas después del registro
          navigate('/sintomas', { 
            state: { paciente: fullPacientData },
            replace: true 
          });
        } else {
          toast.error("Error en el registro. Datos incompletos del servidor.");
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(err);
          if (err.response.status === 403) {
            // Manejar errores específicos de documento o email duplicado
            toast.error("Error: " + err.response.data.message);
          } else {
            toast.error("Error: " + (err.response.data.message || "Error del servidor"));
          }
        } else {
          toast.error("Error de conexión");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetPatient();
  };

  return (
    <>
      <div className="max-w-screen-2xl container mx-auto md:px-20 px-4 flex flex-col md:flex-row pt-24 pb-10">
        <div className="w-full order-2 md:order-1 md:w-1/2 mt-12 md:mt-20">
          <div className="space-y-8">
            <h1 className="text-2xl md:text-4xl font-bold">
              Bienvenido {" "}
              <span className="text-pink-500">¿Experimentas síntomas o malestar?</span>
            </h1>
            <p className="text-sm md:text-xl">
              Utiliza nuestro sistema de triaje automatizado con IA y 
              procesamiento de lenguaje natural para una orientación precisa en minutos.
            </p>
            
            {/* Formulario principal */}
            <form onSubmit={handleSubmit(onInitiateTriage)} className="space-y-4">
              <label className="input input-bordered flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                <input 
                  type="text" 
                  className="grow" 
                  placeholder="Ingrese su número de documento"
                  {...register("document", { 
                    required: "El documento es requerido",
                    minLength: {
                      value: 5,
                      message: "El documento debe tener al menos 5 caracteres"
                    }
                  })}
                />
              </label>
              
              {errors.document && (
                <p className="text-red-500 text-sm">{errors.document.message}</p>
              )}
              
              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn btn-info flex-1 sm:flex-none sm:min-w-[140px]"
                >
                  {isLoading ? 'Verificando...' : 'Iniciar Triage'}
                </button>
                <button 
                  type="button" 
                  onClick={openRegistrationModal}
                  disabled={isLoading}
                  className="btn btn-secondary flex-1 sm:flex-none sm:min-w-[140px]"
                >
                  Registro Pacientes
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="order-1 w-full mt-20 md:w-1/2">
          <img
            src={banner}
            className="md:w-[550px] md:h-[460px] md:ml-12"
            alt="Banner médico"
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
                disabled={isLoading}
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
                  disabled={isLoading}
                  {...registerPatient("fullname", { required: "El nombre completo es requerido" })}
                />
                {errorsPatient.fullname && (
                  <p className="text-red-500 text-sm mt-1">{errorsPatient.fullname.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Ingrese su documento"
                  disabled={isLoading}
                  {...registerPatient("document", { required: "El documento es requerido" })}
                />
                {errorsPatient.document && (
                  <p className="text-red-500 text-sm mt-1">{errorsPatient.document.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="Ingrese su email"
                  disabled={isLoading}
                  {...registerPatient("email", { 
                    required: "El email es requerido",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Email inválido"
                    }
                  })}
                />
                {errorsPatient.email && (
                  <p className="text-red-500 text-sm mt-1">{errorsPatient.email.message}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="btn btn-outline flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-secondary flex-1"
                >
                  {isLoading ? 'Registrando...' : 'Registrar'}
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