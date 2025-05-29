import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
            return [];
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
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text('Reporte de Triage', 14, 20);
        doc.text(`Documento del paciente: ${selectedTriage.patientDocument}`, 14, 30);
        doc.text(`Documento del doctor: ${authUser.document}`, 14, 40);
        doc.text(`Diagnóstico: ${selectedTriage.diagnosis}`, 14, 50);
        doc.text(`Nivel de triage: ${selectedTriage.triageLevel}`, 14, 60);
        autoTable(doc, {
            startY: 70,
            head: [['Síntomas']],
            body: selectedTriage.symptoms?.map(s => [s]) || [['Sin síntomas']]
        });
        doc.save(`triage-${selectedTriage._id}.pdf`);
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