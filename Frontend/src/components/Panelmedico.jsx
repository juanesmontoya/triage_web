import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle, User, Search, LogOut, RefreshCw, FileText, Calendar, Download, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthProvider';
import toast from 'react-hot-toast';

const Panelmedico = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [notes, setNotes] = useState('');
    const [isEditingTriage, setIsEditingTriage] = useState(false);
    const [editedTriage, setEditedTriage] = useState({});
    const [isEditingPatient, setIsEditingPatient] = useState(false);
    const [editedPatient, setEditedPatient] = useState({});
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [authUser, setAuthUser] = useAuth();

    // Función de logout personalizada para redirigir a home
    const handleLogout = () => {
        try {
            setAuthUser({
                ...authUser,
                user: null,
            });
            localStorage.removeItem("Users");
            localStorage.removeItem("doctorAuth");
            toast.success("Sesión cerrada exitosamente");
            
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);
        } catch (error) {
            toast.error("Error al cerrar sesión: " + error);
        }
    };

    // Función para mostrar notificaciones
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // Cargar al inicializar componente
    useEffect(() => {
        loadConversations();
        
        // Establecer autenticación del doctor si no existe
        if (!localStorage.getItem('doctorAuth')) {
            localStorage.setItem('doctorAuth', 'true');
        }
    }, []);

    // Cargar conversaciones desde localStorage
    const loadConversations = () => {
        try {
            const storedConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
            setConversations(storedConversations);
        } catch (error) {
            console.error('Error cargando conversaciones:', error);
            setConversations([]);
        }
    };

    // Iniciar edición de información del paciente
    const startEditingPatient = () => {
        setEditedPatient({
            name: selectedConversation.patientInfo?.name || '',
            age: selectedConversation.patientInfo?.age || '',
            gender: selectedConversation.patientInfo?.gender || '',
            email: selectedConversation.patientInfo?.email || '',
            phone: selectedConversation.patientInfo?.phone || '',
            document: selectedConversation.patientInfo?.document || ''
        });
        setIsEditingPatient(true);
    };

    // Guardar cambios en la información del paciente
    const savePatientChanges = () => {
        if (selectedConversation) {
            const updatedPatientInfo = {
                ...selectedConversation.patientInfo,
                ...editedPatient
            };

            const updatedConversation = {
                ...selectedConversation,
                patientInfo: updatedPatientInfo
            };

            const updatedConversations = conversations.map(conv =>
                conv.sessionId === selectedConversation.sessionId ? updatedConversation : conv
            );

            setConversations(updatedConversations);
            setSelectedConversation(updatedConversation);
            localStorage.setItem('conversations', JSON.stringify(updatedConversations));

            setIsEditingPatient(false);
            showNotification('Información del paciente actualizada correctamente', 'success');
        }
    };

    // Cancelar edición de paciente
    const cancelEditPatient = () => {
        setIsEditingPatient(false);
        setEditedPatient({});
    };

    // Función para generar y descargar PDF
    const generatePDF = () => {
        if (!selectedConversation) return;

        const pdfContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reporte Médico - ${selectedConversation.patientInfo?.name || 'Paciente Anónimo'}</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                        .page-break { page-break-after: always; }
                    }
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        line-height: 1.6; 
                        color: #333;
                        font-size: 12px;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 3px solid #ff1c98; 
                        padding: 20px;
                        margin-bottom: 30px; 
                        background-color: #f8fafc;
                        border-radius: 8px;
                    }
                    .header h1 { 
                        color: #ff1c98; 
                        margin: 0; 
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .header p { 
                        margin: 5px 0; 
                        color: #64748b;
                    }
                    .section { 
                        margin-bottom: 25px; 
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    .section-title { 
                        background: linear-gradient(135deg, #ff1c98, #b80f6b);
                        color: white;
                        padding: 12px 15px; 
                        font-weight: bold; 
                        font-size: 14px;
                        margin: 0;
                    }
                    .section-content {
                        padding: 20px;
                    }
                    .patient-info { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 15px; 
                    }
                    .patient-info div {
                        padding: 8px;
                        background-color: #f8fafc;
                        border-radius: 4px;
                        border-left: 3px solid #ff1c98;
                    }
                    .triage-result { 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin: 15px 0;
                        border: 2px solid;
                    }
                    .triage-alta { 
                        background-color: #fef2f2; 
                        border-color: #dc2626;
                        color: #7f1d1d;
                    }
                    .triage-media { 
                        background-color: #fffbeb; 
                        border-color: #d97706;
                        color: #92400e;
                    }
                    .triage-baja { 
                        background-color: #f0fdf4; 
                        border-color: #059669;
                        color: #14532d;
                    }
                    .conversation { 
                        background-color: #f9fafb; 
                        padding: 12px; 
                        margin: 8px 0; 
                        border-radius: 6px;
                        border-left: 4px solid #6b7280;
                    }
                    .user-message { 
                        background-color: #dbeafe; 
                        border-left-color: #ff1c98;
                    }
                    .bot-message { 
                        background-color: #f3f4f6; 
                        border-left-color: #6b7280;
                    }
                    .notes { 
                        background-color: #fffbeb; 
                        padding: 20px; 
                        border-radius: 8px; 
                        border: 2px solid #f59e0b;
                        color: #92400e;
                    }
                    .footer { 
                        margin-top: 40px; 
                        text-align: center; 
                        font-size: 10px; 
                        color: #6b7280;
                        border-top: 1px solid #e5e7eb;
                        padding-top: 20px;
                    }
                    .print-button {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #ff1c98;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .print-button:hover {
                        background: #ff1293;
                    }
                </style>
            </head>
            <body>
                <button class="print-button no-print" onclick="window.print()">📄 Guardar como PDF</button>
                
                <div class="header">
                    <h1>REPORTE MÉDICO DE TRIAJE</h1>
                    <p><strong>TriageWeb - Sistema de Triaje Virtual</strong></p>
                    <p>Fecha de generación: ${new Date().toLocaleString('es-ES')}</p>
                    <p>ID de Sesión: ${selectedConversation.sessionId}</p>
                </div>

                <div class="section">
                    <div class="section-title">📋 INFORMACIÓN DEL PACIENTE</div>
                    <div class="section-content">
                        <div class="patient-info">
                            <div><strong>👤 Nombre:</strong><br>${selectedConversation.patientInfo?.name || 'No especificado'}</div>
                            <div><strong>🎂 Edad:</strong><br>${selectedConversation.patientInfo?.age || 'No especificada'}</div>
                            <div><strong>⚧ Género:</strong><br>${selectedConversation.patientInfo?.gender || 'No especificado'}</div>
                            <div><strong>📧 Email:</strong><br>${selectedConversation.patientInfo?.email || 'No especificado'}</div>
                            <div><strong>📱 Teléfono:</strong><br>${selectedConversation.patientInfo?.phone || 'No especificado'}</div>
                            <div><strong>🆔 Documento:</strong><br>${selectedConversation.patientInfo?.document || 'No especificado'}</div>
                            <div><strong>🕐 Fecha consulta:</strong><br>${new Date(selectedConversation.timestamp).toLocaleString('es-ES')}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">🚨 RESULTADO DEL TRIAJE</div>
                    <div class="section-content">
                        <div class="triage-result ${selectedConversation.triageResult?.color === 'error' ? 'triage-alta' : selectedConversation.triageResult?.color === 'warning' ? 'triage-media' : 'triage-baja'}">
                            <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
                                🎯 <strong>Nivel:</strong> ${selectedConversation.triageResult?.level || 'No evaluado'}
                            </div>
                            <div style="margin-bottom: 15px;">
                                💡 <strong>Recomendación:</strong><br>
                                ${selectedConversation.triageResult?.recommendation || 'Sin recomendaciones'}
                            </div>
                            ${selectedConversation.triageResult?.editedBy ? `
                                <div style="font-size: 11px; opacity: 0.8; margin-top: 10px;">
                                    ✏️ Editado por: ${selectedConversation.triageResult.editedBy} el ${new Date(selectedConversation.triageResult.editedAt).toLocaleString('es-ES')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">💬 CONVERSACIÓN CON EL PACIENTE</div>
                    <div class="section-content">
                        ${selectedConversation.messages ? selectedConversation.messages.map(msg => `
                            <div class="conversation ${msg.sender === 'user' ? 'user-message' : 'bot-message'}">
                                <strong>${msg.sender === 'user' ? '👤 Paciente' : '🤖 Asistente Virtual'}:</strong><br>
                                ${msg.text}
                            </div>
                        `).join('') : '<p>No hay conversación disponible</p>'}
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">🩺 NOTAS DEL MÉDICO</div>
                    <div class="section-content">
                        <div class="notes">
                            ${selectedConversation.doctorNotes || 'Sin notas del médico registradas.'}
                        </div>
                        ${selectedConversation.reviewedAt ? `
                            <p style="margin-top: 15px; font-size: 11px; color: #6b7280;">
                                <strong>📅 Fecha de revisión médica:</strong> ${new Date(selectedConversation.reviewedAt).toLocaleString('es-ES')}
                            </p>
                        ` : ''}
                    </div>
                </div>

                <div class="footer">
                    <p><strong>TriageWeb - Sistema de Triaje Virtual</strong></p>
                    <p>Este reporte fue generado automáticamente por el sistema</p>
                    <p>Para más información, contacte con el equipo médico</p>
                    <p style="margin-top: 10px;">⚠️ <em>Este triaje es una evaluación preliminar y no sustituye una consulta médica profesional</em></p>
                </div>

                <script>
                    // Auto-print después de cargar (opcional)
                    // window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(pdfContent);
            printWindow.document.close();
            
            printWindow.onload = function() {
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            };
            
            showNotification('Abriendo ventana para guardar como PDF...', 'success');
        } else {
            const blob = new Blob([pdfContent], { type: 'text/html;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte-medico-${selectedConversation.patientInfo?.name || 'paciente'}-${selectedConversation.sessionId.substring(0, 8)}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            showNotification('Reporte descargado como HTML (ábrelo y usa Ctrl+P para PDF)', 'success');
        }
    };

    // Iniciar edición de triaje
    const startEditingTriage = () => {
        setEditedTriage({
            level: selectedConversation.triageResult?.level || '',
            recommendation: selectedConversation.triageResult?.recommendation || '',
            color: selectedConversation.triageResult?.color || 'success'
        });
        setIsEditingTriage(true);
    };

    // Guardar cambios en el triaje
    const saveTriageChanges = () => {
        if (selectedConversation) {
            const updatedTriageResult = {
                ...selectedConversation.triageResult,
                ...editedTriage,
                editedBy: 'doctor',
                editedAt: new Date().toISOString()
            };

            const updatedConversation = {
                ...selectedConversation,
                triageResult: updatedTriageResult
            };

            const updatedConversations = conversations.map(conv =>
                conv.sessionId === selectedConversation.sessionId ? updatedConversation : conv
            );

            setConversations(updatedConversations);
            setSelectedConversation(updatedConversation);
            localStorage.setItem('conversations', JSON.stringify(updatedConversations));

            setIsEditingTriage(false);
            showNotification('Triaje actualizado correctamente', 'success');
        }
    };

    // Cancelar edición de triaje
    const cancelEditTriage = () => {
        setIsEditingTriage(false);
        setEditedTriage({});
    };

    // Seleccionar una conversación para ver detalles
    const viewConversation = (conversation) => {
        setSelectedConversation(conversation);
        setNotes(conversation.doctorNotes || '');
        setIsEditingTriage(false);
        setIsEditingPatient(false);
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
            localStorage.setItem('conversations', JSON.stringify(updatedConversations));

            showNotification('Notas guardadas correctamente', 'success');
        }
    };

    // Filtrar conversaciones según búsqueda y filtro de estado
    const filteredConversations = conversations.filter(conversation => {
        const matchesSearch =
            (conversation.patientInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (conversation.sessionId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (conversation.patientInfo?.document?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus =
            statusFilter === 'all' ||
            conversation.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Formatear fecha para mejor visualización
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('es-ES');
    };

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
                        <div className="flex items-center gap-2">
                            <button 
                                className="btn btn-ghost gap-2" 
                                onClick={loadConversations}
                                title="Actualizar lista de triajes"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="hidden sm:inline">Actualizar</span>
                            </button>
                            
                            <button 
                                className="btn btn-error gap-2 text-white" 
                                onClick={handleLogout}
                                title="Cerrar sesión"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                        
                        <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden ml-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                        </label>
                    </div>
                </div>

                {/* Notification Toast */}
                {notification.show && (
                    <div className="toast toast-top toast-end">
                        <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                            <CheckCircle className="w-6 h-6" />
                            <span>{notification.message}</span>
                        </div>
                    </div>
                )}

                {/* Main content */}
                <div className="flex-1">
                    {!selectedConversation ? (
                        <div className="hero min-h-screen bg-base-200">
                            <div className="hero-content text-center">
                                <div className="max-w-md">
                                    <FileText className="w-16 h-16 mx-auto text-base-content opacity-40" />
                                    <h1 className="text-2xl font-bold mt-4">Seleccione un triaje</h1>
                                    <p className="py-4">Seleccione una conversación de triaje de la lista para ver los detalles y añadir sus notas médicas.</p>
                                    {conversations.length === 0 && (
                                        <div className="mt-4 p-4 bg-info bg-opacity-20 rounded-lg">
                                            <p className="text-sm text-info-content">
                                                No hay triajes disponibles. Los triajes completados en la página de síntomas aparecerán aquí automáticamente.
                                            </p>
                                        </div>
                                    )}
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
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={generatePDF}
                                        className="btn btn-sm btn-error gap-1"
                                    >
                                        <Download className="w-4 h-4" />
                                        Descargar PDF
                                    </button>
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
                                    <div className="flex justify-between items-center">
                                        <h3 className="card-title">
                                            <User className="w-5 h-5" />
                                            Información del Paciente
                                        </h3>
                                        {!isEditingPatient && (
                                            <button
                                                onClick={startEditingPatient}
                                                className="btn btn-sm btn-outline gap-1"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Editar
                                            </button>
                                        )}
                                    </div>

                                    {isEditingPatient ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="label">
                                                        <span className="label-text font-semibold">Nombre Completo:</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editedPatient.name}
                                                        onChange={(e) => setEditedPatient({...editedPatient, name: e.target.value})}
                                                        className="input input-bordered w-full"
                                                        placeholder="Nombre del paciente"
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="label">
                                                        <span className="label-text font-semibold">Edad:</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={editedPatient.age}
                                                        onChange={(e) => setEditedPatient({...editedPatient, age: e.target.value})}
                                                        className="input input-bordered w-full"
                                                        placeholder="Edad en años"
                                                        min="0"
                                                        max="120"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="label">
                                                        <span className="label-text font-semibold">Género:</span>
                                                    </label>
                                                    <select
                                                        value={editedPatient.gender}
                                                        onChange={(e) => setEditedPatient({...editedPatient, gender: e.target.value})}
                                                        className="select select-bordered w-full"
                                                    >
                                                        <option value="">Seleccionar género</option>
                                                        <option value="Masculino">Masculino</option>
                                                        <option value="Femenino">Femenino</option>
                                                        <option value="Otro">Otro</option>
                                                        <option value="Prefiero no decir">Prefiero no decir</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="label">
                                                        <span className="label-text font-semibold">Teléfono:</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={editedPatient.phone}
                                                        onChange={(e) => setEditedPatient({...editedPatient, phone: e.target.value})}
                                                        className="input input-bordered w-full"
                                                        placeholder="Número de teléfono"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="label">
                                                        <span className="label-text font-semibold">Email:</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={editedPatient.email}
                                                        onChange={(e) => setEditedPatient({...editedPatient, email: e.target.value})}
                                                        className="input input-bordered w-full"
                                                        placeholder="Correo electrónico"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="label">
                                                        <span className="label-text font-semibold">Documento:</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editedPatient.document}
                                                        onChange={(e) => setEditedPatient({...editedPatient, document: e.target.value})}
                                                        className="input input-bordered w-full"
                                                        placeholder="Número de documento"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-4">
                                                <button
                                                    onClick={savePatientChanges}
                                                    className="btn btn-success gap-1"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Guardar Cambios
                                                </button>
                                                <button
                                                    onClick={cancelEditPatient}
                                                    className="btn btn-outline gap-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
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
                                            <div>
                                                <div className="stat-title">Email</div>
                                                <div className="stat-value text-lg">{selectedConversation.patientInfo?.email || 'No especificado'}</div>
                                            </div>
                                            <div>
                                                <div className="stat-title">Documento</div>
                                                <div className="stat-value text-lg">{selectedConversation.patientInfo?.document || 'No especificado'}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Triage results */}
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <div className="flex justify-between items-center">
                                        <h3 className="card-title">
                                            <AlertTriangle className="w-5 h-5" />
                                            Resultado del Triaje
                                        </h3>
                                        {!isEditingTriage && (
                                            <button
                                                onClick={startEditingTriage}
                                                className="btn btn-sm btn-outline gap-1"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Editar
                                            </button>
                                        )}
                                    </div>

                                    {selectedConversation.triageResult ? (
                                        <div className="space-y-4">
                                            {isEditingTriage ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="label">
                                                            <span className="label-text font-semibold">Nivel de Triaje:</span>
                                                        </label>
                                                        <select
                                                            value={editedTriage.level}
                                                            onChange={(e) => setEditedTriage({...editedTriage, level: e.target.value})}
                                                            className="select select-bordered w-full"
                                                        >
                                                            <option value="">Seleccionar nivel</option>
                                                            <option value="NIVEL 1 - EMERGENCIA">NIVEL 1 - EMERGENCIA</option>
                                                            <option value="NIVEL 2 - URGENTE">NIVEL 2 - URGENTE</option>
                                                            <option value="NIVEL 3 - PRIORITARIO">NIVEL 3 - PRIORITARIO</option>
                                                            <option value="NIVEL 4 - ESTÁNDAR">NIVEL 4 - ESTÁNDAR</option>
                                                            <option value="NIVEL 5 - NO URGENTE">NIVEL 5 - NO URGENTE</option>
                                                        </select>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="label">
                                                            <span className="label-text font-semibold">Color/Prioridad:</span>
                                                        </label>
                                                        <select
                                                            value={editedTriage.color}
                                                            onChange={(e) => setEditedTriage({...editedTriage, color: e.target.value})}
                                                            className="select select-bordered w-full"
                                                        >
                                                            <option value="error">Rojo - Crítico</option>
                                                            <option value="warning">Naranja - Urgente</option>
                                                            <option value="info">Amarillo - Prioritario</option>
                                                            <option value="success">Verde - Estándar</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="label">
                                                            <span className="label-text font-semibold">Recomendación:</span>
                                                        </label>
                                                        <textarea
                                                            value={editedTriage.recommendation}
                                                            onChange={(e) => setEditedTriage({...editedTriage, recommendation: e.target.value})}
                                                            className="textarea textarea-bordered w-full h-24"
                                                            placeholder="Escriba la recomendación médica..."
                                                        />
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={saveTriageChanges}
                                                            className="btn btn-success gap-1"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={cancelEditTriage}
                                                            className="btn btn-outline gap-1"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className={`alert alert-${selectedConversation.triageResult.color}`}>
                                                        <AlertTriangle className="w-5 h-5" />
                                                        <div>
                                                            <h4 className="font-bold">{selectedConversation.triageResult.level}</h4>
                                                            <div className="text-sm">{selectedConversation.triageResult.recommendation}</div>
                                                        </div>
                                                    </div>

                                                    {selectedConversation.triageResult.editedBy && (
                                                        <div className="text-sm opacity-70">
                                                            Editado por: {selectedConversation.triageResult.editedBy} el {formatDate(selectedConversation.triageResult.editedAt)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
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
                                        Conversación
                                    </h3>

                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                                            selectedConversation.messages.map((msg, idx) => (
                                                <div key={idx} className={`chat ${msg.sender === 'user' ? 'chat-start' : 'chat-end'}`}>
                                                    <div className="chat-header">
                                                        {msg.sender === 'user' ? 'Paciente' : 'Asistente'}
                                                    </div>
                                                    <div className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'}`}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center opacity-70">No hay mensajes disponibles</p>
                                        )}
                                    </div>
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
                        <h2 className="text-xl font-bold text-primary">Triajes realizados ({conversations.length})</h2>

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

                                        {conversation.triageResult && (
                                            <div className="mt-1">
                                                <div className={`badge ${
                                                    conversation.triageResult.color === 'error' ? 'badge-error' :
                                                    conversation.triageResult.color === 'warning' ? 'badge-warning' :
                                                    conversation.triageResult.color === 'info' ? 'badge-info' :
                                                    'badge-success'
                                                }`}>
                                                    {conversation.triageResult.level}
                                                </div>
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