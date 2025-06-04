import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Home, Volume2, User, Stethoscope } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Sintomas = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatCompleted, setChatCompleted] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [visitDetail, setVisitDetail] = useState('');
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Pregunta única para el triage
  const triageQuestion = "¡Hola! Soy tu asistente virtual de triaje. Por favor, describe detalladamente todos los síntomas que estás experimentando y cualquier malestar que sientes. Puedes hablar o escribir tu respuesta.";

  // Obtener información del paciente al cargar
  useEffect(() => {
    const savedPatient = localStorage.getItem('Patient');
    if (savedPatient) {
      const patient = JSON.parse(savedPatient);
      setPatientInfo(patient);
    } else {
      toast.error('No hay información de paciente. Redirigiendo al inicio...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return;
    }

    initializeSpeechRecognition();
    
    setTimeout(() => {
      addBotMessage(triageQuestion);
    }, 1000);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inicializar reconocimiento de voz
  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setIsListening(false);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        setIsRecording(false);
        toast.error('Error en el reconocimiento de voz. Intenta de nuevo.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
    } else {
      toast.error('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
    }
  };

  // Agregar mensaje del bot
  const addBotMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Leer el mensaje en voz alta
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // Agregar mensaje del usuario
  const addUserMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
    setVisitDetail(text);
  };

  // Finalizar chat y enviar al backend
  const finalizarChat = async (userResponse) => {
    setChatCompleted(true);
    addBotMessage("Gracias por proporcionar esta información. Estamos procesando tu consulta y te hemos registrado en la sala de espera. Un profesional de salud te estará contactando pronto. ¡Cuídate!");
    
    const triageInfo = {
      patientId: patientInfo._id,
      patientDocument: patientInfo.document,
      visitDetail: userResponse
    };

    await axios
      .post(`${import.meta.env.VITE_API_URL}triage/create`, triageInfo)
      .then((res) => {
        console.log(res.data);
        if (res.data) {
          toast.success("Triage creado exitosamente!");
          
          // Guardar para compatibilidad (formato original)
          localStorage.setItem("TriageData", JSON.stringify(res.data.triage));
          
          // Crear estructura para Panel Médico
          const conversationData = {
            sessionId: res.data.triage._id || Date.now().toString(),
            patientInfo: {
              name: patientInfo.fullname,
              age: patientInfo.age || 'No especificada',
              gender: patientInfo.gender || 'No especificado',
              email: patientInfo.email,
              phone: patientInfo.phone || 'No especificado',
              document: patientInfo.document
            },
            messages: messages, // Los mensajes del chat
            triageResult: {
              level: `NIVEL ${res.data.triage.triageLevel || 6} - EVALUACIÓN AUTOMÁTICA`,
              recommendation: res.data.triage.visitDetail || userResponse,
              color: res.data.triage.triageLevel <= 2 ? 'error' : 
                     res.data.triage.triageLevel <= 4 ? 'warning' : 'success',
              score: null // Sin score automático por ahora
            },
            timestamp: new Date().toISOString(),
            status: 'pending', // Estado inicial
            doctorNotes: '', // Sin notas iniciales
            reviewedAt: null
          };

          // Agregar a la lista de conversaciones para Panel Médico
          const existingConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
          const updatedConversations = [...existingConversations, conversationData];
          localStorage.setItem('conversations', JSON.stringify(updatedConversations));
          
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(err);
          toast.error("Error: " + err.response.data.message);
        }
      });
  };

  // Iniciar grabación de voz
  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  // Detener grabación
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Enviar mensaje
  const sendMessage = () => {
    if (currentMessage.trim() === '' || chatCompleted) return;

    const userResponse = currentMessage.trim();
    
    if (!patientInfo || !patientInfo._id || !patientInfo.document) {
      toast.error('Error: Información del paciente incompleta. Redirigiendo al inicio...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return;
    }

    addUserMessage(userResponse);
    setCurrentMessage('');
    
    setTimeout(() => {
      finalizarChat(userResponse);
    }, 1000);
  };

  // Ir al inicio
  const goHome = () => {
    if (confirm('¿Estás seguro de que quieres salir del triaje? Se perderá el progreso actual.')) {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Evaluación de Síntomas</h1>
                <p className="text-sm text-gray-600">
                  Paciente: {patientInfo?.fullname || 'Cargando...'} - Doc: {patientInfo?.document || 'Cargando...'}
                </p>
              </div>
            </div>
            <button
              onClick={goHome}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Inicio
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-6 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-md border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.sender === 'bot' ? (
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.sender === 'bot' ? 'Asistente Virtual' : 'Tú'}
                    </span>
                  </div>
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-50 mt-1 block">{message.timestamp}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {!chatCompleted && (
            <div className="p-6 bg-white border-t">
              {/* Voice Input */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold shadow-2xl transition-all transform ${
                    isRecording 
                      ? 'bg-red-500 animate-pulse scale-110' 
                      : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
                  }`}
                  disabled={false}
                >
                  {isRecording ? (
                    <div className="text-center">
                      <MicOff className="w-12 h-12 mx-auto mb-2" />
                      <span className="text-sm">STOP</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Mic className="w-12 h-12 mx-auto mb-2" />
                      <span className="text-sm">HABLAR</span>
                    </div>
                  )}
                </button>
              </div>

              <div className="text-center mb-6">
                <p className="text-xl font-bold text-gray-700 mb-2">
                  {isRecording 
                    ? '🎤 Escuchando... Describe tus síntomas ahora' 
                    : '🎤 Presiona el botón azul para hablar'
                  }
                </p>
                {isListening && (
                  <p className="text-lg text-blue-600 animate-pulse font-semibold">
                    🔄 Procesando tu voz...
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  O puedes escribir tu respuesta abajo
                </p>
              </div>

              {/* Text Input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Describe tus síntomas aquí..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={false}
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 font-semibold transition-all disabled:opacity-50"
                  disabled={!currentMessage.trim()}
                >
                  <Send className="w-5 h-5" />
                  Enviar
                </button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-blue-800 text-center font-semibold">
                  💡 Describe todos tus síntomas de manera detallada para obtener la mejor evaluación.
                </p>
              </div>
            </div>
          )}

          {/* Completion Status */}
          {chatCompleted && (
            <div className="p-8 bg-green-50 border-t">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Volume2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-4">
                  ✅ Evaluación Completada
                </h3>
                <p className="text-lg text-green-700 mb-4">
                  Información guardada exitosamente. Serás redirigido al inicio.
                </p>
                <div className="bg-white p-4 rounded-xl shadow-md max-w-md mx-auto">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Datos registrados:</strong>
                  </p>
                  <div className="text-xs text-gray-500 text-left">
                    <p><strong>• Paciente:</strong> {patientInfo?.fullname}</p>
                    <p><strong>• Documento:</strong> {patientInfo?.document}</p>
                    <p><strong>• Síntomas:</strong> {visitDetail.length} caracteres</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sintomas;