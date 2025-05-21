import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle, User, Search, LogOut, RefreshCw, FileText, Calendar } from 'lucide-react';

const Panelmedico = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [notes, setNotes] = useState('');
    
    // Verificar autenticación al cargar
    useEffect(() => {
        const doctorAuth = localStorage.getItem('doctorAuth');
        if (doctorAuth === 'true') {
            setIsAuthenticated(true);
            loadConversations();
        }
    }, []);

    // Cargar conversaciones desde localStorage (en producción sería de una API)
    const loadConversations = () => {
        const storedConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        setConversations(storedConversations);
    };

    // Manejar cambios en el formulario de login
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData({
            ...loginData,
            [name]: value
        });
    };

    // Intentar login
    const handleLogin = (e) => {
        e.preventDefault();
        
        // En producción, esto sería una verificación contra una API
        // Para demo, usamos credenciales de ejemplo
        if (loginData.username === 'doctor' && loginData.password === 'medico123') {
            localStorage.setItem('doctorAuth', 'true');
            setIsAuthenticated(true);
            loadConversations();
        } else {
            alert('Credenciales inválidas');
        }
    };

    // Cerrar sesión
    const handleLogout = () => {
        localStorage.removeItem('doctorAuth');
        setIsAuthenticated(false);
        setSelectedConversation(null);
    };

    // Seleccionar una conversación para ver detalles
    const viewConversation = (conversation) => {
        setSelectedConversation(conversation);
        setNotes(conversation.doctorNotes || '');
    };

    // Actualizar estado de una conversación
    const updateConversationStatus = (status) => {
        if (selectedConversation) {
            const updatedConversation = { ...selectedConversation, status };
            const updatedConversations = conversations.map(conv => 
                conv.sessionId === selectedConversation.sessionId ? updatedConversation : conv
            );
            
            setConversations(updatedConversations);
            setSelectedConversation(updatedConversation);
            
            // Guardar en localStorage
            localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        }
    };

    // Guardar notas del médico
    const saveNotes = () => {
        if (selectedConversation) {
            const updatedConversation = { 
                ...selectedConversation, 
                doctorNotes: notes,
                reviewedAt: new Date().toISOString()
            };
            
            const updatedConversations = conversations.map(conv => 
                conv.sessionId === selectedConversation.sessionId ? updatedConversation : conv
            );
            
            setConversations(updatedConversations);
            setSelectedConversation(updatedConversation);
            
            // Guardar en localStorage
            localStorage.setItem('conversations', JSON.stringify(updatedConversations));
            
            // Mostrar toast con DaisyUI
            document.getElementById('save-toast').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('save-toast').classList.add('hidden');
            }, 3000);
        }
    };

    // Filtrar conversaciones según búsqueda y filtro de estado
    const filteredConversations = conversations.filter(conversation => {
        const matchesSearch = 
            (conversation.patientInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (conversation.sessionId?.toLowerCase().includes(searchTerm.toLowerCase()));
            
        const matchesStatus = 
            statusFilter === 'all' || 
            conversation.status === statusFilter;
            
        return matchesSearch && matchesStatus;
    });

    // Formatear fecha para mejor visualización
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Si no está autenticado, mostrar formulario de login
    if (!isAuthenticated) {
        return (
            <div className="hero min-h-screen bg-base-200">
                
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl font-bold">Panel Médico</h1>
                        <p className="py-6">Acceso exclusivo para personal médico autorizado. Inicie sesión para revisar las consultas de pacientes y los resultados del triaje.</p>
                    </div>
                    <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                        
                        <div className="card-body">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Usuario</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="username"
                                    placeholder="usuario" 
                                    className="input input-bordered" 
                                    value={loginData.username}
                                    onChange={handleLoginChange}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Contraseña</span>
                                </label>
                                <input 
                                    type="password" 
                                    name="password"
                                    placeholder="contraseña" 
                                    className="input input-bordered" 
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                />
                            </div>
                            <div className="form-control mt-6">
                                <button className="btn btn-secondary" onClick={handleLogin}>Iniciar Sesión</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col p-4">
                {/* Navbar */}
                <div className="navbar bg-base-100 shadow rounded-box mb-4">
                    <div className="flex-1">
                        <div className="text-xl font-bold text-secondary">Panel Médico de Triaje</div>
                    </div>
                    <div className="flex-none">
                        <button className="btn btn-ghost" onClick={loadConversations}>
                            <RefreshCw className="w-5 h-5" />
                        </button>
                        <button className="btn btn-ghost" onClick={handleLogout}>
                            <LogOut className="w-5 h-5" />
                            <span className="hidden md:inline ml-2">Cerrar sesión</span>
                        </button>
                        <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                        </label>
                    </div>
                </div>
                
                {/* Toast notification */}
                <div id="save-toast" className="toast toast-top toast-end hidden">
                    <div className="alert alert-success">
                        <CheckCircle className="w-6 h-6" />
                        <span>Notas guardadas correctamente</span>
                    </div>
                </div>
                
                {/* Main content */}
                <div className="flex-1">
                    {!selectedConversation ? (
                        <div className="hero min-h-screen bg-base-200">
                            <div className="hero-content text-center">
                                <div className="max-w-md">
                                    <FileText className="w-16 h-16 mx-auto text-base-content opacity-40" />
                                    <h1 className="text-2xl font-bold mt-4">Seleccione un triaje</h1>
                                    <p className="py-4">Seleccione una conversación de triaje de la lista para ver los detalles y añadir sus notas médicas.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {/* Header with buttons */}
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <h2 className="text-2xl font-bold">
                                    Paciente: {selectedConversation.patientInfo?.name || 'Anónimo'}
                                </h2>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => updateConversationStatus('pending')}
                                        className="btn btn-sm btn-warning gap-1"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Pendiente
                                    </button>
                                    <button 
                                        onClick={() => updateConversationStatus('reviewed')}
                                        className="btn btn-sm btn-success gap-1"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Revisado
                                    </button>
                                </div>
                            </div>
                            
                            {/* Patient info */}
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <User className="w-5 h-5" />
                                        Información del Paciente
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="stat-title">Nombre</div>
                                            <div className="stat-value text-lg">{selectedConversation.patientInfo?.name || 'No especificado'}</div>
                                        </div>
                                        <div>
                                            <div className="stat-title">Edad</div>
                                            <div className="stat-value text-lg">{selectedConversation.patientInfo?.age || 'No especificada'}</div>
                                        </div>
                                        <div>
                                            <div className="stat-title">Género</div>
                                            <div className="stat-value text-lg">{selectedConversation.patientInfo?.gender || 'No especificado'}</div>
                                        </div>
                                        <div>
                                            <div className="stat-title">Teléfono</div>
                                            <div className="stat-value text-lg">{selectedConversation.patientInfo?.phone || 'No especificado'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Triage results */}
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <AlertTriangle className="w-5 h-5" />
                                        Resultado del Triaje
                                    </h3>
                                    
                                    {selectedConversation.triageResult ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">Prioridad:</span>
                                                {selectedConversation.triageResult.priority === 'alta' && (
                                                    <div className="badge badge-error gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        ALTA
                                                    </div>
                                                )}
                                                {selectedConversation.triageResult.priority === 'media' && (
                                                    <div className="badge badge-warning gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        MEDIA
                                                    </div>
                                                )}
                                                {selectedConversation.triageResult.priority === 'baja' && (
                                                    <div className="badge badge-success gap-1">
                                                        <CheckCircle className="w-3 h-3" />
                                                        BAJA
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <div className="font-semibold">Recomendación:</div>
                                                <div className="p-2 bg-base-200 rounded-lg mt-1">
                                                    {selectedConversation.triageResult.recommendation || 'No hay recomendaciones'}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className="font-semibold">Síntomas reportados:</div>
                                                <div className="p-2 bg-base-200 rounded-lg mt-1">
                                                    {selectedConversation.triageResult.symptoms || 'No se reportaron síntomas'}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="alert">No hay resultados de triaje disponibles</div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Conversation */}
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <FileText className="w-5 h-5" />
                                        Resumen de la Conversación
                                    </h3>
                                    
                                    {selectedConversation.summary ? (
                                        <div className="whitespace-pre-line bg-base-200 p-4 rounded-lg">
                                            {selectedConversation.summary}
                                        </div>
                                    ) : (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {selectedConversation.messages ? (
                                                selectedConversation.messages.map((msg, idx) => (
                                                    <div key={idx} className={`chat ${msg.role === 'user' ? 'chat-start' : 'chat-end'}`}>
                                                        <div className="chat-header">
                                                            {msg.role === 'user' ? 'Paciente' : 'Asistente'}
                                                        </div>
                                                        <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'}`}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center opacity-70">No hay mensajes disponibles</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Doctor notes */}
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <h3 className="card-title">
                                        <Calendar className="w-5 h-5" />
                                        Notas del Médico
                                    </h3>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="textarea textarea-bordered w-full h-32"
                                        placeholder="Añada sus notas aquí..."
                                    ></textarea>
                                    
                                    <div className="card-actions justify-end mt-2">
                                        <div className="text-sm opacity-70">
                                            {selectedConversation.reviewedAt && 
                                                `Última revisión: ${formatDate(selectedConversation.reviewedAt)}`
                                            }
                                        </div>
                                        <button
                                            onClick={saveNotes}
                                            className="btn btn-primary"
                                        >
                                            Guardar Notas
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Sidebar */}
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
                <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-primary">Triajes realizados</h2>
                        
                        <div className="join w-full mt-4">
                            <div className="join-item w-full">
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar paciente..." 
                                        className="input input-bordered w-full" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button className="btn btn-square">
                                        <Search className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="tabs tabs-boxed mt-4">
                            <button 
                                className={`tab ${statusFilter === 'all' ? 'tab-active' : ''}`}
                                onClick={() => setStatusFilter('all')}
                            >
                                Todos
                            </button>
                            <button 
                                className={`tab ${statusFilter === 'pending' ? 'tab-active' : ''}`}
                                onClick={() => setStatusFilter('pending')}
                            >
                                Pendientes
                            </button>
                            <button 
                                className={`tab ${statusFilter === 'reviewed' ? 'tab-active' : ''}`}
                                onClick={() => setStatusFilter('reviewed')}
                            >
                                Revisados
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto max-h-screen pb-20">
                        {filteredConversations.length === 0 ? (
                            <div className="alert">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>No se encontraron resultados</span>
                            </div>
                        ) : (
                            filteredConversations.map((conversation) => (
                                <div 
                                    key={conversation.sessionId}
                                    className={`card mb-2 cursor-pointer hover:bg-base-300 ${selectedConversation?.sessionId === conversation.sessionId ? 'bg-primary bg-opacity-10 border border-primary' : 'bg-base-100'}`}
                                    onClick={() => viewConversation(conversation)}
                                >
                                    <div className="card-body p-3">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold">
                                                {conversation.patientInfo?.name || 'Anónimo'}
                                            </h3>
                                            {conversation.status === 'pending' ? (
                                                <div className="badge badge-warning gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Pendiente
                                                </div>
                                            ) : (
                                                <div className="badge badge-success gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Revisado
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="text-sm opacity-70">
                                            {formatDate(conversation.timestamp)}
                                        </div>
                                        
                                        {conversation.triageResult?.priority && (
                                            <div className="mt-1">
                                                {conversation.triageResult.priority === 'alta' && (
                                                    <div className="badge badge-error">PRIORIDAD ALTA</div>
                                                )}
                                                {conversation.triageResult.priority === 'media' && (
                                                    <div className="badge badge-warning">PRIORIDAD MEDIA</div>
                                                )}
                                                {conversation.triageResult.priority === 'baja' && (
                                                    <div className="badge badge-success">PRIORIDAD BAJA</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Panelmedico;
