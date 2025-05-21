
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // instalar: npm install uuid

const Sintomas = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hola, soy el asistente médico virtual. ¿Qué síntomas presentas hoy?",
            sender: "bot"
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [patientInfo, setPatientInfo] = useState({
        name: "",
        age: "",
        gender: "",
        email: "",
        phone: ""
    });
    const [showPatientForm, setShowPatientForm] = useState(false);
    const [triageResult, setTriageResult] = useState(null);
    const [chatSessionId, setChatSessionId] = useState(null);
    const [showTriageResult, setShowTriageResult] = useState(false);
    
    const chatEndRef = useRef(null);
    const [recognition, setRecognition] = useState(null);
    const navigate = useNavigate();

    // Inicializar ID de sesión de chat
    useEffect(() => {
        const newSessionId = uuidv4();
        setChatSessionId(newSessionId);
    }, []);

    useEffect(() => {
        // Configuración de reconocimiento de voz
        if ('webkitSpeechRecognition' in window) {
            const recognitionInstance = new window.webkitSpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'es-ES';

            recognitionInstance.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                
                setInputText(transcript);
            };

            recognitionInstance.onend = () => {
                setIsRecording(false);
            };

            setRecognition(recognitionInstance);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handlePatientInfoChange = (e) => {
        const { name, value } = e.target;
        setPatientInfo({
            ...patientInfo,
            [name]: value
        });
    };

    const savePatientInfo = () => {
        // Validar que los campos obligatorios estén llenos
        if (!patientInfo.name || !patientInfo.age || !patientInfo.gender || !patientInfo.email) {
            alert("Por favor, completa los campos obligatorios");
            return;
        }

        // Guardar información de paciente junto con el ID de sesión
        const patientData = {
            ...patientInfo,
            sessionId: chatSessionId,
            timestamp: new Date().toISOString()
        };

        // Guardar en localStorage (en producción sería en una base de datos)
        const existingPatients = JSON.parse(localStorage.getItem('patients') || '[]');
        localStorage.setItem('patients', JSON.stringify([...existingPatients, patientData]));

        // Cerrar formulario y continuar con el chat
        setShowPatientForm(false);
        
        // Mensaje de confirmación
        const confirmationMessage = {
            id: messages.length + 1,
            text: `Gracias ${patientInfo.name}. Tus datos han sido registrados. Ahora cuéntame, ¿qué síntomas estás experimentando?`,
            sender: "bot"
        };
        
        setMessages(prev => [...prev, confirmationMessage]);
    };

    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    const toggleRecording = () => {
        if (isRecording) {
            recognition?.stop();
            setIsRecording(false);
        } else {
            try {
                recognition?.start();
                setIsRecording(true);
            } catch (error) {
                console.error("Error al iniciar grabación:", error);
            }
        }
    };

    // Función para analizar los síntomas y determinar el nivel de triaje
    const analyzeSymptomsAndTriageLevel = (conversation) => {
        // Palabras clave de emergencia alta
        const highPriorityKeywords = [
            "dolor intenso pecho", "no puedo respirar", "infarto", 
            "desmayo", "inconsciente", "asfixia", "sangrado abundante",
            "convulsiones", "parálisis", "accidente grave", "ictus", "derrame"
        ];
        
        // Palabras clave de prioridad media
        const mediumPriorityKeywords = [
            "fiebre alta", "vómitos constantes", "deshidratación", 
            "dolor agudo", "quemadura", "fractura", "lesión", "respirar con dificultad",
            "dolor abdominal severo", "migraña severa"
        ];

        // Palabras clave de prioridad baja
        const lowPriorityKeywords = [
            "dolor de cabeza leve", "resfriado", "tos", "dolor de garganta",
            "malestar general", "náuseas", "mareo leve", "erupción", "picazón"
        ];

        // Convertir la conversación a texto
        const fullText = conversation
            .filter(msg => msg.sender === "user")
            .map(msg => msg.text.toLowerCase())
            .join(" ");

        // Contar ocurrencias de palabras clave
        let highPriorityScore = 0;
        let mediumPriorityScore = 0;
        let lowPriorityScore = 0;

        // Verificar palabras clave de alta prioridad
        highPriorityKeywords.forEach(keyword => {
            if (fullText.includes(keyword.toLowerCase())) {
                highPriorityScore += 10;
            }
        });

        // Verificar palabras clave de prioridad media
        mediumPriorityKeywords.forEach(keyword => {
            if (fullText.includes(keyword.toLowerCase())) {
                mediumPriorityScore += 5;
            }
        });

        // Verificar palabras clave de prioridad baja
        lowPriorityKeywords.forEach(keyword => {
            if (fullText.includes(keyword.toLowerCase())) {
                lowPriorityScore += 2;
            }
        });

        // Determinar nivel de triaje basado en puntuación
        let triageLevel;
        let recommendation;
        let color;

        if (highPriorityScore >= 10) {
            triageLevel = "NIVEL 1 - EMERGENCIA";
            recommendation = "Acude INMEDIATAMENTE a urgencias o llama al número de emergencias (112/911).";
            color = "error"; // rojo
        } else if (highPriorityScore > 0 || mediumPriorityScore >= 10) {
            triageLevel = "NIVEL 2 - URGENTE";
            recommendation = "Acude a urgencias en las próximas horas o programa una consulta médica urgente para hoy.";
            color = "warning"; // naranja
        } else if (mediumPriorityScore > 0 || lowPriorityScore >= 6) {
            triageLevel = "NIVEL 3 - PRIORITARIO";
            recommendation = "Programa una consulta médica en los próximos 1-2 días.";
            color = "info"; // amarillo
        } else if (lowPriorityScore > 0) {
            triageLevel = "NIVEL 4 - ESTÁNDAR";
            recommendation = "Programa una consulta médica en la próxima semana.";
            color = "success"; // verde
        } else {
            triageLevel = "NIVEL 5 - NO URGENTE";
            recommendation = "Considera medidas de autocuidado y consulta a tu médico si los síntomas persisten.";
            color = "success"; // verde claro
        }

        return {
            level: triageLevel,
            recommendation,
            color,
            score: {
                high: highPriorityScore,
                medium: mediumPriorityScore,
                low: lowPriorityScore
            }
        };
    };

    const saveConversationAndShowResult = () => {
        // Analizar la conversación y obtener nivel de triaje
        const triageResult = analyzeSymptomsAndTriageLevel(messages);
        setTriageResult(triageResult);
        
        // Guardar la conversación completa
        const conversationData = {
            sessionId: chatSessionId,
            patientInfo,
            messages,
            triageResult,
            timestamp: new Date().toISOString(),
            status: "pendiente" // pendiente, en_revision, completado
        };
        
        // Guardar en localStorage (en producción sería en una base de datos)
        const existingConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        localStorage.setItem('conversations', JSON.stringify([...existingConversations, conversationData]));
        
        // Mostrar resultados
        setShowTriageResult(true);
    };

    const handleSend = () => {
        if (inputText.trim() === "") return;

        // Agregar mensaje del usuario
        const newUserMessage = {
            id: messages.length + 1,
            text: inputText,
            sender: "user"
        };

        setMessages([...messages, newUserMessage]);
        setInputText("");
        setIsTyping(true);

        // Si es el primer mensaje del usuario y no tenemos info, solicitar datos
        if (messages.length === 1 && !showPatientForm && !patientInfo.name) {
            setTimeout(() => {
                const askForInfoMessage = {
                    id: messages.length + 2,
                    text: "Para poder brindarte una mejor atención, necesito algunos datos personales. Por favor, completa el siguiente formulario:",
                    sender: "bot"
                };
                setMessages(prev => [...prev, askForInfoMessage]);
                setIsTyping(false);
                setShowPatientForm(true);
            }, 1000);
            return;
        }

        // Simular respuesta del bot después de un breve retraso
        setTimeout(() => {
            const botResponses = {
                "dolor de cabeza": "El dolor de cabeza puede tener múltiples causas como estrés, deshidratación, tensión muscular o problemas de visión. ¿Hace cuánto tiempo tienes este síntoma y qué tan intenso es en una escala del 1 al 10?",
                "fiebre": "La fiebre es una respuesta natural del cuerpo ante infecciones. ¿Qué temperatura has registrado y desde hace cuánto la tienes? ¿Tienes otros síntomas como tos, dolor de garganta o malestar general?",
                "tos": "La tos puede ser seca o con flema. ¿Podrías especificar qué tipo de tos tienes y si va acompañada de otros síntomas como fiebre o dolor de garganta? ¿Hace cuánto comenzó?",
                "dolor de estómago": "El dolor de estómago puede deberse a indigestión, gastritis o estrés. ¿Dónde específicamente sientes el dolor y es constante o intermitente? ¿Has notado si empeora después de comer?",
                "mareo": "El mareo puede relacionarse con problemas de presión arterial, infecciones del oído o ansiedad. ¿Te sientes mareado al cambiar de posición o es constante? ¿Experimentas también náuseas o sudoración?"
            };

            let botResponse = "Entiendo que no te sientes bien. ¿Podrías darme más detalles sobre tus síntomas y desde cuándo los presentas?";
            
            // Buscar palabras clave en el mensaje del usuario
            Object.keys(botResponses).forEach(keyword => {
                if (inputText.toLowerCase().includes(keyword)) {
                    botResponse = botResponses[keyword];
                }
            });

            // Verificar si es momento de finalizar el chat y mostrar resultados
            const messageCount = messages.length;
            if (messageCount >= 6) { // Después de cierto número de intercambios
                botResponse += " Basado en la información que me has proporcionado, puedo darte una evaluación preliminar. ¿Te gustaría ver el resultado?";
                
                const newBotMessage = {
                    id: messages.length + 2,
                    text: botResponse,
                    sender: "bot",
                    showFinishButton: true
                };
                
                setMessages(prev => [...prev, newBotMessage]);
            } else {
                const newBotMessage = {
                    id: messages.length + 2,
                    text: botResponse,
                    sender: "bot"
                };
                
                setMessages(prev => [...prev, newBotMessage]);
            }
            
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div className="card bg-base-100 shadow-xl">
                {/* Header */}
                <div className="card-title bg-primary text-primary-content p-6 rounded-t-xl flex justify-between items-center bg-pink-700">
                    <div className="flex items-center">
                        <div className="avatar placeholder">
                            <div className="bg-primary-content text-primary rounded-full w-12">
                                <span className="text-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w 11" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <h1 className="text-xl font-bold">TrigeWeb</h1>
                            <p className="text-sm opacity-75">Asistente Virtual</p>
                        </div>
                    </div>
                    <div className="badge badge-success animate-pulse">En línea</div>
                </div>

                {/* Chat y Triage Resultados */}
                <div className="card-body p-4 ">
                    {showTriageResult ? (
                        <div className="flex flex-col items-center">
                            <h2 className="text-2xl font-bold mb-4">Resultado de la Evaluación</h2>
                            
                            <div className={`alert alert-${triageResult.color} mb-4`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h3 className="font-bold">{triageResult.level}</h3>
                                    <div className="text-sm">{triageResult.recommendation}</div>
                                </div>
                            </div>
                            
                            <p className="text-center mb-6 ">
                                Hemos guardado tu consulta. Un profesional médico revisará tus síntomas y podrá contactarte si es necesario.
                            </p>
                            
                            <div className="flex gap-2">
                                <button className="btn btn-primary" onClick={() => navigate('/')}>
                                    Volver al inicio
                                </button>
                                <button className="btn btn-outline" onClick={() => {
                                    setShowTriageResult(false);
                                    // Opcionalmente resetear el chat si quieres permitir más consultas
                                    // setMessages([{id: 1, text: "Hola, soy el asistente médico virtual. ¿Qué síntomas presentas hoy?", sender: "bot"}]);
                                }}>
                                    Continuar conversación
                                </button>
                            </div>
                            
                            <div className="divider">ID de consulta</div>
                            <div className="text-sm opacity-70">
                                {chatSessionId}
                            </div>
                        </div>
                    ) : (
                        <>
                            {showPatientForm ? (
                                <div className="form-control">
                                    <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Nombre completo*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                name="name" 
                                                value={patientInfo.name} 
                                                onChange={handlePatientInfoChange} 
                                                className="input input-bordered w-full" 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Edad*</span>
                                            </label>
                                            <input 
                                                type="number" 
                                                name="age" 
                                                value={patientInfo.age} 
                                                onChange={handlePatientInfoChange} 
                                                className="input input-bordered w-full" 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Género*</span>
                                            </label>
                                            <select 
                                                name="gender" 
                                                value={patientInfo.gender} 
                                                onChange={handlePatientInfoChange} 
                                                className="select select-bordered w-full" 
                                                required
                                            >
                                                <option value="">Seleccionar</option>
                                                <option value="masculino">Masculino</option>
                                                <option value="femenino">Femenino</option>
                                                <option value="otro">Otro</option>
                                                <option value="prefiero_no_decir">Prefiero no decir</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Email*</span>
                                            </label>
                                            <input 
                                                type="email" 
                                                name="email" 
                                                value={patientInfo.email} 
                                                onChange={handlePatientInfoChange} 
                                                className="input input-bordered w-full" 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Teléfono</span>
                                            </label>
                                            <input 
                                                type="tel" 
                                                name="phone" 
                                                value={patientInfo.phone} 
                                                onChange={handlePatientInfoChange} 
                                                className="input input-bordered w-full" 
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        className="btn btn-primary mt-6" 
                                        onClick={savePatientInfo}
                                    >
                                        Continuar
                                    </button>
                                    <p className="text-xs text-center mt-4">
                                        * Campos obligatorios. Tu información está protegida según nuestra política de privacidad.
                                    </p>
                                </div>
                            ) : (
                                <div className="chat-container h-[calc(100vh-300px)] min-h-[300px] overflow-y-auto flex flex-col">
                                    {messages.map(message => (
                                        <div 
                                            key={message.id} 
                                            className={`chat ${message.sender === 'user' ? 'chat-end' : 'chat-start'}`}
                                        >
                                            <div className={`chat-bubble ${message.sender === 'user' ? 'chat-bubble-accent' : 'chat-bubble-primary'}`}>
                                                {message.text}
                                                {message.showFinishButton && (
                                                    <div className="mt-4">
                                                        <button 
                                                            className="btn btn-sm btn-primary" 
                                                            onClick={saveConversationAndShowResult}
                                                        >
                                                            Ver mi evaluación
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="chat chat-start">
                                            <div className="chat-bubble chat-bubble-primary">
                                                <span className="loading loading-dots loading-sm"></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Input Area*/}
                {!showTriageResult && !showPatientForm && (
                    <div className="card-actions justify-center p-4 bg-base-200 rounded-b-xl">
                        <div className="join w-full">
                            <button 
                                onClick={toggleRecording}
                                className={`btn join-item ${isRecording ? 'btn-error animate-pulse' : 'btn-ghost'}`}
                                title={isRecording ? "Detener grabación" : "Iniciar grabación de voz"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </button>
                            <input
                                type="text"
                                className="input input-bordered w-full join-item"
                                placeholder="Escribe tus síntomas aquí..."
                                value={inputText}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                onClick={handleSend}
                                className="btn btn-primary join-item"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        
                        {isRecording && (
                            <div className="text-error text-sm mt-2 animate-pulse">
                                Grabando... Habla para convertir tu voz en texto.
                            </div>
                        )}
                        
                        <div className="text-xs text-base-content opacity-70 mt-2 text-center">
                            * Este chat es solo para consultas informativas, no reemplaza la visita a un médico profesional.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sintomas;