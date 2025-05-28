import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Home, Volume2, MessageSquare, User, Stethoscope } from 'lucide-react';

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
    // Obtener datos reales del paciente desde localStorage (guardados en Banner.jsx)
    const savedPatient = localStorage.getItem('Patient');
    if (savedPatient) {
      const patient = JSON.parse(savedPatient);
      setPatientInfo(patient);
      console.log('Paciente cargado:', patient);
    } else {
      // Si no hay paciente registrado, redirigir a home
      alert('No hay información de paciente. Redirigiendo al inicio...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return;
    }

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
    
    // Generar sessionId único
    const sessionId = `triage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    // Datos para el backend (formato original)
    const triageData = {
      patientId: patientInfo._id,
      document: patientInfo.document,
      visitDetail: visitDetail
    };

    // Estructura completa para Panelmedico (compatible)
    const conversationData = {
      sessionId: sessionId,
      patientInfo: {
        name: patientInfo.fullname,
        age: patientInfo.age || 'No especificada',
        gender: patientInfo.gender || 'No especificado',
        email: patientInfo.email,
        phone: patientInfo.phone || 'No especificado',
        document: patientInfo.document
      },
      messages: messages,
      visitDetail: visitDetail,
      timestamp: timestamp,
      status: 'pending',
      triageResult: null, // Se llenará con IA/ML
      doctorNotes: '',
      reviewedAt: null,
      // Datos adicionales para integración con backend
      backendData: triageData
    };

    setIsLoading(true);
    
    try {
      // 1. GUARDAR EN BACKEND - Crear registro en base de datos
      // await axios.post('http://localhost:3000/triage/', triageData)
      //   .then((response) => {
      //     if (response.data.ok) {
      //       console.log('Triage creado en BD:', response.data.triage);
      //     }
      //   });

      // 2. ENVIAR A MÓDULO DE IA/ML PYTHON para análisis
      // const aiAnalysis = await axios.post('http://localhost:5000/analyze-triage', {
      //   visitDetail: visitDetail,
      //   patientData: patientInfo
      // });
      
      // // Actualizar con resultado de IA
      // if (aiAnalysis.data.success) {
      //   conversationData.triageResult = {
      //     level: aiAnalysis.data.triageLevel,
      //     recommendation: aiAnalysis.data.recommendation, 
      //     color: aiAnalysis.data.priority, // 'error', 'warning', 'info', 'success'
      //     score: {
      //       high: aiAnalysis.data.scores.high,
      //       medium: aiAnalysis.data.scores.medium,
      //       low: aiAnalysis.data.scores.low
      //     },
      //     aiConfidence: aiAnalysis.data.confidence,
      //     symptoms: aiAnalysis.data.detectedSymptoms
      //   };
      // }

      // SIMULACIÓN DEL MÓDULO IA - Remover cuando integres Python real
      const mockAIResult = generateMockTriageResult(visitDetail);
      conversationData.triageResult = mockAIResult;

      // 3. GUARDAR EN LOCALSTORAGE PARA PANELMEDICO
      const existingConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
      existingConversations.push(conversationData);
      localStorage.setItem('conversations', JSON.stringify(existingConversations));
      
      // 4. BACKUP EN LOCALSTORAGE ORIGINAL
      localStorage.setItem('TriageData', JSON.stringify(triageData));
      
      console.log('✅ Datos guardados correctamente:', {
        backend: triageData,
        conversation: conversationData
      });
      
      setIsLoading(false);
      
      // Redirigir a /home después de 3 segundos
      setTimeout(() => {
        alert('Redirigiéndote a la página principal...');
        window.location.href = '/'
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error al procesar triaje:', error);
      alert('Error al procesar el triaje. Intenta nuevamente.');
      setIsLoading(false);
    }
  };

  // Función para simular resultado de IA (REMOVER cuando integres Python)
  const generateMockTriageResult = (visitDetail) => {
    const text = visitDetail.toLowerCase();
    let level, color, recommendation;
    
    // Lógica básica para simular IA
    if (text.includes('dolor severo') || text.includes('dificultad respirar') || text.includes('fiebre alta')) {
      level = 'NIVEL 2 - URGENTE';
      color = 'warning';
      recommendation = 'Consulta médica urgente recomendada. Acuda al servicio de urgencias.';
    } else if (text.includes('dolor') || text.includes('fiebre') || text.includes('náuseas')) {
      level = 'NIVEL 3 - PRIORITARIO';
      color = 'info';
      recommendation = 'Consulta médica en las próximas 24 horas. Monitoree síntomas.';
    } else {
      level = 'NIVEL 4 - ESTÁNDAR';
      color = 'success';
      recommendation = 'Consulta médica de rutina. Puede programar cita en días próximos.';
    }
    
    return {
      level: level,
      recommendation: recommendation,
      color: color,
      score: {
        high: Math.floor(Math.random() * 30),
        medium: Math.floor(Math.random() * 50),
        low: Math.floor(Math.random() * 40)
      },
      aiGenerated: true,
      processedAt: new Date().toISOString()
    };
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
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-pink-500 transition-colors" 
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
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Datos que se guardarán:</strong>
                  </p>
                  <div className="text-xs text-gray-500 text-left">
                    <p><strong>• Paciente ID:</strong> {patientInfo?._id}</p>
                    <p><strong>• Documento:</strong> {patientInfo?.document}</p>
                    <p><strong>• Nombre:</strong> {patientInfo?.fullname}</p>
                    <p><strong>• Email:</strong> {patientInfo?.email}</p>
                    <p><strong>• Detalles:</strong> {visitDetail.length} caracteres</p>
                  </div>
                  {visitDetail && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 max-h-20 overflow-y-auto">
                      <strong>Resumen de síntomas:</strong><br/>
                      {visitDetail.substring(0, 200)}...
                    </div>
                  )}
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