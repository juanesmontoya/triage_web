import React, { useState, useEffect } from 'react';
import axios from 'axios';


import { Save, X, Download, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import Logout from './Logout';


const labelMap = {
    patientDocument: 'Documento del paciente',
    doctorDocument: 'Documento del doctor',
    diagnosis: 'Diagnóstico',
    visitDetail: 'Motivo de consulta',
    symptoms: 'Síntomas',
    triageLevel: 'Nivel de triage',
};

const API_BASE = 'http://localhost:3000';

const PanelMedico = () => {
    const [triages, setTriages] = useState([]);
    const [selectedTriage, setSelectedTriage] = useState(null);
    const [statusFilter, setStatusFilter] = useState('Open');
    const [searchTerm, setSearchTerm] = useState('');
    const [editData, setEditData] = useState({ diagnosis: '', triageLevel: '' });
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [authUser] = useState(() => {
        const stored = localStorage.getItem('Users');
        return stored ? JSON.parse(stored) : null;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        loadTriages();
    }, []);

    const loadTriages = async () => {
        try {
            const res = await axios.get(`${API_BASE}/triage/triages`);
            if (res.data.triages) {
                setTriages(res.data.triages);
                return res.data.triages;
            } else {
                toast.error('No se recibieron triages del servidor');
                return [];
            }
        } catch (err) {
            toast.error('Error al cargar triages');
            return [err];
        }
    };

    const filteredTriages = triages.filter(t =>
        t.state === statusFilter &&
        (t.patientDocument?.includes(searchTerm) || t._id.includes(searchTerm))
    );

    const handleSelectTriage = (triage) => {
        triage.doctorDocument = authUser?.document || '';
        delete triage.doctorId;
        delete triage.patientId;
        delete triage.createdAt;
        delete triage.updatedAt;
        delete triage.__v;

        setSelectedTriage(triage);
        setEditData({
            diagnosis: triage.diagnosis || '',
            triageLevel: triage.triageLevel || ''
        });
    };

    const handleSave = async () => {
        try {
            await axios.put(`${API_BASE}/triage/updateTriage`, {
                id: selectedTriage._id,
                doctorId: authUser._id,
                doctorDocument: authUser.document,
                diagnosis: editData.diagnosis,
                triageLevel: editData.triageLevel,
                state: selectedTriage.state
            });
            toast.success('Triage actualizado');
            const updated = await loadTriages();
            const current = updated.find(t => t._id === selectedTriage._id);
            if (current) handleSelectTriage(current);
        } catch (err) {
            toast.error('Error al guardar cambios');
            return [err];
        }

    };

    const handleCloseTriage = async () => {
        try {
            await axios.put(`${API_BASE}/triage/updateTriage`, {
                id: selectedTriage._id,
                doctorId: authUser._id,
                doctorDocument: authUser.document,
                diagnosis: editData.diagnosis,
                triageLevel: editData.triageLevel,
                state: 'Closed'
            });
            toast.success('Triage cerrado');
            const updated = await loadTriages();
            const current = updated.find(t => t._id === selectedTriage._id);
            if (current) handleSelectTriage(current);
        } catch (err) {
            toast.error('Error al cerrar triage');
            return [err];
        }
    };

    const generatePDF = () => {
        if (!selectedTriage) return;
    
        const pdfContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Triage - ${selectedTriage.patientDocument}</title>
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
                        border-bottom: 3px solid #1e40af; 
                        padding: 20px;
                        margin-bottom: 30px; 
                        background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                        border-radius: 12px;
                        box-shadow: 0 4px 6px rgba(30, 64, 175, 0.1);
                    }
                    .header h1 { 
                        color: #1e40af; 
                        margin: 0; 
                        font-size: 28px;
                        font-weight: bold;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                    }
                    .header p { 
                        margin: 5px 0; 
                        color: #475569;
                        font-weight: 500;
                    }
                    .section { 
                        margin-bottom: 25px; 
                        border: 2px solid #64748b;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 2px 4px rgba(100, 116, 139, 0.1);
                    }
                    .section-title { 
                        background: linear-gradient(135deg, #334155, #475569);
                        color: white;
                        padding: 15px 20px; 
                        font-weight: bold; 
                        font-size: 16px;
                        margin: 0;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                    }
                    .section-content {
                        padding: 20px;
                        background: rgba(248, 250, 252, 0.8);
                    }
                    .info-grid { 
                        display: grid; 
                        grid-template-columns: 1fr 1fr; 
                        gap: 15px; 
                        margin-bottom: 15px;
                    }
                    .info-item {
                        padding: 12px;
                        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                        border-radius: 8px;
                        border-left: 4px solid #1e40af;
                        box-shadow: 0 1px 3px rgba(30, 64, 175, 0.1);
                    }
                    .info-item strong {
                        color: #1e40af;
                        display: block;
                        margin-bottom: 5px;
                        font-size: 13px;
                    }
                    .info-value {
                        color: #374151;
                        font-size: 14px;
                        font-weight: 500;
                    }
                    .full-width {
                        grid-column: 1 / -1;
                    }
                    .triage-level {
                        text-align: center;
                        padding: 20px;
                        border-radius: 12px;
                        margin: 15px 0;
                        border: 3px solid #059669;
                        background: linear-gradient(135deg, #ecfdf5, #d1fae5);
                        box-shadow: 0 4px 8px rgba(5, 150, 105, 0.2);
                    }
                    .triage-level h3 {
                        color: #059669;
                        font-size: 20px;
                        margin: 0 0 10px 0;
                        font-weight: bold;
                    }
                    .symptoms-list {
                        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid #cbd5e1;
                    }
                    .symptoms-list ul {
                        margin: 0;
                        padding-left: 20px;
                    }
                    .symptoms-list li {
                        margin: 8px 0;
                        color: #374151;
                        font-weight: 500;
                    }
                    .diagnosis-box {
                        background: linear-gradient(135deg, #1e40af, #1d4ed8);
                        color: white;
                        padding: 20px;
                        border-radius: 12px;
                        margin: 15px 0;
                        text-align: center;
                        box-shadow: 0 4px 8px rgba(30, 64, 175, 0.3);
                    }
                    .diagnosis-box h3 {
                        margin: 0 0 10px 0;
                        font-size: 18px;
                    }
                    .diagnosis-text {
                        font-size: 16px;
                        font-weight: 500;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                    }
                    .footer { 
                        margin-top: 40px; 
                        text-align: center; 
                        font-size: 11px; 
                        color: #475569;
                        border-top: 2px solid #64748b;
                        padding-top: 20px;
                        background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
                        border-radius: 8px;
                        padding: 20px;
                    }
                    .print-button {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, #1e40af, #1d4ed8);
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                        box-shadow: 0 4px 8px rgba(30, 64, 175, 0.3);
                        transition: all 0.3s ease;
                    }
                    .print-button:hover {
                        background: linear-gradient(135deg, #1d4ed8, #2563eb);
                        transform: translateY(-2px);
                        box-shadow: 0 6px 12px rgba(30, 64, 175, 0.4);
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .status-open {
                        background-color: #dcfce7;
                        color: #166534;
                        border: 1px solid #bbf7d0;
                    }
                    .status-closed {
                        background-color: #fee2e2;
                        color: #991b1b;
                        border: 1px solid #fecaca;
                    }
                </style>
            </head>
            <body>
                <button class="print-button no-print" onclick="window.print()">📄 Guardar como PDF</button>
                
                <div class="header">
                    <h1>🏥 REPORTE DE TRIAGE MÉDICO</h1>
                    <p><strong>Sistema de Gestión Médica</strong></p>
                    <p>Fecha de generación: ${new Date().toLocaleString('es-ES')}</p>
                    <p>ID del Triage: ${selectedTriage._id}</p>
                </div>
    
                <div class="section">
                    <div class="section-title">📋 INFORMACIÓN DEL PACIENTE</div>
                    <div class="section-content">
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>🆔 Documento del Paciente:</strong>
                                <div class="info-value">${selectedTriage.patientDocument || 'No especificado'}</div>
                            </div>
                            <div class="info-item">
                                <strong>👨‍⚕️ Documento del Doctor:</strong>
                                <div class="info-value">${selectedTriage.doctorDocument || authUser?.document || 'No especificado'}</div>
                            </div>
                            <div class="info-item">
                                <strong>📅 Estado del Triage:</strong>
                                <div class="info-value">
                                    <span class="status-badge ${selectedTriage.state === 'Open' ? 'status-open' : 'status-closed'}">
                                        ${selectedTriage.state || 'No especificado'}
                                    </span>
                                </div>
                            </div>
                            <div class="info-item">
                                <strong>🕐 Fecha de Creación:</strong>
                                <div class="info-value">${selectedTriage.createdAt ? new Date(selectedTriage.createdAt).toLocaleString('es-ES') : 'No especificada'}</div>
                            </div>
                        </div>
                    </div>
                </div>
    
                <div class="section">
                    <div class="section-title">🩺 MOTIVO DE CONSULTA</div>
                    <div class="section-content">
                        <div class="info-item full-width">
                            <strong>📝 Detalle de la visita:</strong>
                            <div class="info-value" style="margin-top: 8px; line-height: 1.6;">
                                ${selectedTriage.visitDetail || 'No se especificó motivo de consulta'}
                            </div>
                        </div>
                    </div>
                </div>
    
                <div class="section">
                    <div class="section-title">🚨 NIVEL DE TRIAGE</div>
                    <div class="section-content">
                        <div class="triage-level">
                            <h3>🎯 Nivel de Prioridad</h3>
                            <div style="font-size: 18px; font-weight: bold;">
                                ${selectedTriage.triageLevel || 'No evaluado'}
                            </div>
                        </div>
                    </div>
                </div>
    
                <div class="section">
                    <div class="section-title">🩹 SÍNTOMAS REPORTADOS</div>
                    <div class="section-content">
                        <div class="symptoms-list">
                            ${selectedTriage.symptoms && selectedTriage.symptoms.length > 0 ? `
                                <ul>
                                    ${selectedTriage.symptoms.map(symptom => `<li>• ${symptom}</li>`).join('')}
                                </ul>
                            ` : '<p style="text-align: center; color: #6b7280; font-style: italic;">No se reportaron síntomas específicos</p>'}
                        </div>
                    </div>
                </div>
    
                <div class="section">
                    <div class="section-title">🩺 DIAGNÓSTICO MÉDICO</div>
                    <div class="section-content">
                        <div class="diagnosis-box">
                            <h3>📋 Diagnóstico</h3>
                            <div class="diagnosis-text">
                                ${selectedTriage.diagnosis || 'Pendiente de evaluación médica'}
                            </div>
                        </div>
                    </div>
                </div>
    
                <div class="footer">
                    <p><strong>🏥 Sistema de Gestión Médica</strong></p>
                    <p>Este reporte fue generado automáticamente por el sistema</p>
                    <p>Doctor responsable: ${authUser?.fullname || 'No especificado'}</p>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #64748b;">
                        <p>⚠️ <em>Este documento es confidencial y está protegido por la ley de protección de datos médicos</em></p>
                    </div>
                </div>
    
                <script>
                    // Función para imprimir automáticamente al cargar (opcional)
                    function autoPrint() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    }
                    
                    // Descomenta la siguiente línea si quieres que se imprima automáticamente
                    // window.onload = autoPrint;
                </script>
            </body>
            </html>
        `;
    
        // Crear un nuevo documento HTML
        const newWindow = window.open('', '_blank');
        newWindow.document.write(pdfContent);
        newWindow.document.close();
        
        // Opcional: cerrar la ventana después de imprimir
        newWindow.onafterprint = function() {
            newWindow.close();
        };
        
        toast.success('PDF generado correctamente');
    };

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="p-2 flex justify-between items-center shadow bg-gray-100 dark:bg-gray-800">
                <div className="text-sm font-medium">
                    {authUser ? (
                        <span>👤 {authUser.fullname} ({authUser.document})</span>
                    ) : (
                        <span>No autenticado</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setDarkMode(!darkMode)} className="btn btn-sm">
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} {darkMode ? 'Claro' : 'Oscuro'}
                    </button>
                    <Logout />
                </div>
            </div>

            <div className="flex flex-1">
                <div className="w-1/3 p-4 border-r bg-gray-100 dark:bg-gray-800">
                    <h2 className="text-2xl font-bold mb-4">Triages ({statusFilter})</h2>
                    <input
                        type="text"
                        placeholder="Buscar por documento o ID..."
                        className="input input-bordered w-full mb-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex mb-4 gap-2">
                        <button className={`btn ${statusFilter === 'Open' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('Open')}>Open</button>
                        <button className={`btn ${statusFilter === 'Closed' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('Closed')}>Closed</button>
                    </div>
                    <div className="overflow-y-auto h-[80vh]">
                        {filteredTriages.map(t => (
                            <div
                                key={t._id}
                                className={`card mb-2 p-3 cursor-pointer ${selectedTriage?._id === t._id ? 'bg-pink-100 dark:bg-pink-900' : 'bg-gray-200 dark:bg-gray-700 hover:bg-pink-50 dark:hover:bg-pink-800'}`}
                                onClick={() => handleSelectTriage(t)}
                            >
                                <h3 className="font-semibold">Documento: {t.patientDocument}</h3>
                                <p className="text-sm">Nivel: {t.triageLevel || 'N/A'}</p>
                                <p className="text-xs">Estado: {t.state}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-2/3 p-6 overflow-y-auto">
                    {selectedTriage ? (
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold mb-4">Detalle del Triage</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(selectedTriage).filter(([key]) => !['_id', '__v'].includes(key)).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="font-semibold capitalize">{labelMap[key] || key}</label>
                                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                            {Array.isArray(value) ? value.join(', ') : String(value)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold">Agregar diagnóstico</label>
                                    <input
                                        className="input input-bordered w-full"
                                        value={editData.diagnosis}
                                        onChange={(e) => setEditData({ ...editData, diagnosis: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold">Nivel de triage</label>
                                    <input
                                        className="input input-bordered w-full"
                                        value={editData.triageLevel}
                                        onChange={(e) => setEditData({ ...editData, triageLevel: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button className="btn btn-success gap-1" onClick={handleSave}>
                                    <Save className="w-4 h-4" /> Guardar Cambios
                                </button>
                                {selectedTriage.state === 'Open' && (
                                    <button className="btn btn-warning gap-1" onClick={handleCloseTriage}>
                                        <X className="w-4 h-4" /> Cerrar Triage
                                    </button>
                                )}
                                {selectedTriage.state === 'Closed' && (
                                    <button className="btn btn-error gap-1" onClick={generatePDF}>
                                        <Download className="w-4 h-4" /> Exportar PDF
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-full text-gray-400">
                            <p>Seleccione un triage de la lista</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PanelMedico;