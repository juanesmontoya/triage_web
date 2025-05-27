import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Home, Volume2, MessageSquare, User, Stethoscope } from 'lucide-react';

// 
// sintomas
const Sintomas = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatCompleted, setChatCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [patientInfo, setPatientInfo] = useState(null);
  const [visitDetail, setVisitDetail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Preguntas estructuradas
  const questions = [
    "¡Hola! Soy tu asistente virtual de triaje. Vamos a evaluar tus síntomas. ¿Tienes dolor en alguna parte del cuerpo?",
    "¿El dolor es intenso o severo?",
    "¿Tienes fiebre o te sientes con temperatura elevada?",
    "¿Tienes dificultad para respirar?",
    "¿Sientes náuseas o has vomitado?",
    "¿Tienes dolor de cabeza?",
    "¿Has tenido estos síntomas por más de 24 horas?",
    "¿Deseas agregar algo más sobre tus síntomas?"
  ];

  // Obtener información del paciente al cargar
  useEffect(() => {
    // Simular carga del paciente desde localStorage
    const mockPatient = {
      _id: "6835df27e27e2a039148c1fd",
      fullname: "Juan Pérez",
      document: "12345678",
      email: "juan@email.com"
    };
    setPatientInfo(mockPatient);

    // Inicializar reconocimiento de voz
    initializeSpeechRecognition();
    
    // Iniciar con la primera pregunta
    setTimeout(() => {
      addBotMessage(questions[0]);
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

      recognitionRef.current.onerror = (event) => {
        console.error('Error de reconocimiento:', event.error);
        setIsListening(false);
        setIsRecording(false);
        alert('Error en el reconocimiento de voz. Intenta de nuevo.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsRecording(false);
      };
    } else {
      console.error('Reconocimiento de voz no soportado');
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
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
    
    // Agregar respuesta a visitDetail
    setVisitDetail(prev => prev + `P: ${questions[currentStep]} R: ${text}\n`);
  };

  // Manejar respuesta del usuario
  const handleUserResponse = (response) => {
    addUserMessage(response);
    
    // Avanzar al siguiente paso
    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        addBotMessage(questions[currentStep + 1]);
      }, 1500);
    } else {
      // Última pregunta sobre agregar más información
      setTimeout(() => {
        if (response.toLowerCase().includes('sí') || response.toLowerCase().includes('si')) {
          addBotMessage("Por favor, cuéntame qué más síntomas o información consideras importante:");
          setCurrentStep(-1); // Modo libre
        } else {
          finalizarChat();
        }
      }, 1500);
    }
  };

  // Finalizar chat y guardar información
  const finalizarChat = async () => {
    setChatCompleted(true);
    addBotMessage("Gracias por usar nuestro sistema de triaje. Te hemos registrado en la sala de espera. Un profesional de salud te estará contactando pronto. ¡Cuídate!");
    
    // Guardar en formato requerido
    const triageData = {
      patientId: patientInfo._id,
      document: patientInfo.document,
      visitDetail: visitDetail
    };

    setIsLoading(true);
    
    // Simular guardado en base de datos
    setTimeout(() => {
      console.log('Datos guardados:', triageData);
      localStorage.setItem('TriageData', JSON.stringify(triageData));
      setIsLoading(false);
      
      // Simular redirección a home después de 3 segundos
      setTimeout(() => {
        alert('Redirigiéndote al inicio...');
        // En tu código real: navigate('/');
      }, 3000);
    }, 2000);
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
    if (currentMessage.trim() === '') return;

    if (currentStep === -1) {
      // Modo libre - agregar información adicional
      addUserMessage(currentMessage);
      setVisitDetail(prev => prev + `Información adicional: ${currentMessage}\n`);
      setCurrentMessage('');
      
      setTimeout(() => {
        finalizarChat();
      }, 1000);
    } else {
      // Preguntas estructuradas
      handleUserResponse(currentMessage);
      setCurrentMessage('');
    }
  };

  // Respuesta rápida Sí/No
  const quickResponse = (response) => {
    if (currentStep === -1) {
      if (response === 'No') {
        finalizarChat();
      }
      return;
    }
    handleUserResponse(response);
  };

  // Ir al inicio
  const goHome = () => {
    alert('Redirigiéndote al inicio...');
    // En tu código real: navigate('/');
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
                  Paciente: {patientInfo?.fullname} - Doc: {patientInfo?.document}
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
              {/* Quick Response Buttons */}
              {currentStep >= 0 && currentStep < questions.length - 1 && (
                <div className="flex gap-3 mb-4 justify-center">
                  <button
                    onClick={() => quickResponse('Sí')}
                    className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-semibold text-lg shadow-lg transition-all"
                  >
                    ✅ Sí
                  </button>
                  <button
                    onClick={() => quickResponse('No')}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold text-lg shadow-lg transition-all"
                  >
                    ❌ No
                  </button>
                </div>
              )}

              {/* Voice Input - GRANDE Y VISIBLE */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-white font-bold shadow-2xl transition-all transform ${
                    isRecording 
                      ? 'bg-red-500 animate-pulse scale-110' 
                      : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
                  }`}
                  disabled={isLoading}
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
                    ? '🎤 Escuchando... Habla ahora' 
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
                  placeholder="O escribe tu respuesta aquí..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 font-semibold transition-all disabled:opacity-50"
                  disabled={!currentMessage.trim() || isLoading}
                >
                  <Send className="w-5 h-5" />
                  Enviar
                </button>
              </div>

              {/* Status Messages */}
              {currentStep === questions.length - 1 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-blue-800 text-center font-semibold">
                    💡 Esta es la última pregunta. Después podrás agregar información adicional.
                  </p>
                </div>
              )}

              {currentStep === -1 && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-800 text-center font-semibold">
                    📝 Agrega cualquier información adicional que consideres importante.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Completion Status */}
          {chatCompleted && (
            <div className="p-8 bg-green-50 border-t">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {isLoading ? (
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Volume2 className="w-10 h-10 text-green-600" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-4">
                  ✅ Evaluación Completada
                </h3>
                <p className="text-lg text-green-700 mb-4">
                  {isLoading 
                    ? 'Guardando información en el sistema...' 
                    : 'Información guardada exitosamente.'
                  }
                </p>
                <div className="bg-white p-4 rounded-xl shadow-md max-w-md mx-auto">
                  <p className="text-sm text-gray-600">
                    <strong>Datos guardados:</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    • Paciente ID: {patientInfo?._id}<br/>
                    • Documento: {patientInfo?.document}<br/>
                    • Detalles: {visitDetail.length} caracteres
                  </p>
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