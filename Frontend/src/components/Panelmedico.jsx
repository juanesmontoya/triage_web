import React, { useState, useEffect } from "react";
import axios from "axios";
import { Save, X, Download, Moon, Sun, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Logout from "./Logout";

const labelMap = {
  patientDocument: "Documento del paciente",
  doctorDocument: "Documento del doctor",
  diagnosis: "Diagnóstico",
  visitDetail: "Motivo de consulta",
  symptoms: "Síntomas",
  triageLevel: "Nivel de triage",
  state: "Estado",
  createdAt: "Fecha de creación",
};

const API_BASE = import.meta.env.VITE_API_URL;

const PanelMedico = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [triages, setTriages] = useState([]);
  const [selectedTriage, setSelectedTriage] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Open");
  const [sortAsc, setSortAsc] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState({ diagnosis: "", triageLevel: "" });
  const [authUser] = useState(() => {
    const stored = localStorage.getItem("Users");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    loadTriages();
  }, []);

  // Función para ir hacia atrás
  const handleGoBack = () => {
    navigate("/");
  };

  const loadTriages = async () => {
    try {
      const res = await axios.get(`${API_BASE}triage/triages`);
      if (res.data.triages) {
        setTriages(res.data.triages);
        return res.data.triages;
      } else {
        toast.error("No se recibieron triages del servidor");
        return [];
      }
    } catch (err) {
      toast.error("Error al cargar triages");
      return [err];
    }
  };

  const filteredTriages = triages
    .filter((t) => t.patientDocument !== authUser?.document)
    .sort((a, b) =>
      sortAsc
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    )
    .filter(
      (t) =>
        t.state === statusFilter &&
        (t.patientDocument?.includes(searchTerm) ||
          String(t._id).includes(searchTerm))
    );

  const handleSelectTriage = (triage) => {
    triage.doctorDocument = authUser?.document || "";
    delete triage.doctorId;
    delete triage.patientId;
    delete triage.updatedAt;
    delete triage.__v;

    setSelectedTriage(triage);
    setEditData({
      diagnosis: triage.diagnosis || "",
      triageLevel: triage.triageLevel || "",
    });
  };

  const handleSave = async () => {
    const diagnosis = editData.diagnosis.trim();
    const level = parseInt(editData.triageLevel, 10);

    if (!diagnosis) return toast.error("El diagnóstico es obligatorio");
    if (diagnosis.length < 5 || diagnosis.length > 300)
      return toast.error("El diagnóstico debe tener entre 5 y 300 caracteres");
    if (isNaN(level) || level < 1 || level > 5)
      return toast.error("El nivel de triage debe ser un número entre 1 y 5");

    try {
      await axios.put(`${API_BASE}triage/updateTriage`, {
        id: selectedTriage._id,
        doctorId: authUser._id,
        doctorDocument: authUser.document,
        diagnosis: editData.diagnosis,
        triageLevel: editData.triageLevel,
        state: selectedTriage.state,
      });
      toast.success("Triage actualizado");
      const updated = await loadTriages();
      const current = updated.find((t) => t._id === selectedTriage._id);
      if (current) handleSelectTriage(current);
    } catch (err) {
      toast.error("Error al guardar cambios");
      return [err];
    }
  };

  const handleCloseTriage = async () => {
    const diagnosis = editData.diagnosis.trim();
    const level = parseInt(editData.triageLevel, 10);

    if (!diagnosis) return toast.error("El diagnóstico es obligatorio");
    if (diagnosis.length < 5 || diagnosis.length > 300)
      return toast.error("El diagnóstico debe tener entre 5 y 300 caracteres");
    if (isNaN(level) || level < 1 || level > 5)
      return toast.error("El nivel de triage debe ser un número entre 1 y 5");
    try {
      await axios.put(`${API_BASE}triage/updateTriage`, {
        id: selectedTriage._id,
        doctorId: authUser._id,
        doctorDocument: authUser.document,
        diagnosis: editData.diagnosis,
        triageLevel: editData.triageLevel,
        state: "Closed",
      });
      toast.success("Triage cerrado");
      const updated = await loadTriages();
      const current = updated.find((t) => t._id === selectedTriage._id);
      if (current) handleSelectTriage(current);
    } catch (err) {
      toast.error("Error al cerrar triage");
      return [err];
    }
  };

  // Función generatePDF simplificada pero intuitiva
  const generatePDF = () => {
    if (!selectedTriage) {
      toast.error("Selecciona un triage para generar el PDF");
      return;
    }

    const pdfContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Reporte Médico - ${
                  selectedTriage.patientDocument
                }</title>
                <style>
                    * { box-sizing: border-box; }
                    
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        margin: 0;
                        padding: 20px;
                        line-height: 1.6;
                        color: #2c3e50;
                        background: #f8f9fa;
                    }
                    
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        overflow: hidden;
                    }
                    
                    .header {
                        background: linear-gradient(135deg, #3b82f6, #1e40af);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                    }
                    
                    .header p {
                        margin: 10px 0 0 0;
                        opacity: 0.9;
                        font-size: 14px;
                    }
                    
                    .content {
                        padding: 30px;
                    }
                    
                    .info-row {
                        display: flex;
                        margin-bottom: 20px;
                        border-bottom: 1px solid #e9ecef;
                        padding-bottom: 15px;
                    }
                    
                    .info-label {
                        font-weight: 600;
                        color: #495057;
                        width: 200px;
                        flex-shrink: 0;
                    }
                    
                    .info-value {
                        color: #212529;
                        flex: 1;
                    }
                    
                    .section {
                        margin: 30px 0;
                    }
                    
                    .section-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #1e40af;
                        margin-bottom: 15px;
                        padding-bottom: 8px;
                        border-bottom: 2px solid #e9ecef;
                    }
                    
                    .highlight-box {
                        background: linear-gradient(135deg, #f8f9ff, #e6f2ff);
                        border: 1px solid #3b82f6;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    
                    .symptoms-list {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 10px 0;
                    }
                    
                    .symptoms-list ul {
                        margin: 0;
                        padding-left: 20px;
                    }
                    
                    .symptoms-list li {
                        margin: 5px 0;
                        color: #495057;
                    }
                    
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                    }
                    
                    .status-open {
                        background: #d4edda;
                        color: #155724;
                    }
                    
                    .status-closed {
                        background: #f8d7da;
                        color: #721c24;
                    }
                    
                    .footer {
                        background: #f8f9fa;
                        padding: 20px 30px;
                        text-align: center;
                        font-size: 12px;
                        color: #6c757d;
                        border-top: 1px solid #dee2e6;
                    }
                    
                    .print-btn {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                        transition: all 0.3s ease;
                    }
                    
                    .print-btn:hover {
                        background: #2563eb;
                        transform: translateY(-2px);
                    }
                    
                    @media print {
                        .print-btn { display: none; }
                        body { background: white; }
                        .container { box-shadow: none; }
                    }
                </style>
            </head>
            <body>
                <button class="print-btn" onclick="window.print()">📄 Imprimir / Guardar PDF</button>
                
                <div class="container">
                    <div class="header">
                        <h1>🏥 Reporte Médico de Triage</h1>
                        <p>Sistema de Gestión Médica - ${new Date().toLocaleDateString(
                          "es-ES"
                        )}</p>
                    </div>
                    
                    <div class="content">
                        <div class="section">
                            <div class="section-title">📋 Información del Paciente</div>
                            <div class="info-row">
                                <div class="info-label">Documento:</div>
                                <div class="info-value">${
                                  selectedTriage.patientDocument ||
                                  "No especificado"
                                }</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">Doctor:</div>
                                <div class="info-value">${
                                  authUser?.fullname || "No especificado"
                                } (${authUser?.document || "N/A"})</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">Estado:</div>
                                <div class="info-value">
                                    <span class="status-badge ${
                                      selectedTriage.state === "Open"
                                        ? "status-open"
                                        : "status-closed"
                                    }">
                                        ${
                                          selectedTriage.state ||
                                          "No especificado"
                                        }
                                    </span>
                                </div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">Fecha de ingreso:</div>
                                <div class="info-value">${new Date().toLocaleString(
                                  "es-ES"
                                )}</div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">🩺 Motivo de Consulta</div>
                            <div class="info-value" style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                                ${
                                  selectedTriage.visitDetail ||
                                  "No se especificó motivo de consulta"
                                }
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">🎯 Nivel de Triage</div>
                            <div class="highlight-box">
                                <strong style="font-size: 18px; color: #1e40af;">
                                    ${
                                      selectedTriage.triageLevel ||
                                      editData.triageLevel ||
                                      "No evaluado"
                                    }
                                </strong>
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">🩹 Síntomas Reportados</div>
                            <div class="symptoms-list">
                                ${
                                  selectedTriage.symptoms &&
                                  selectedTriage.symptoms.length > 0
                                    ? `
                                    <ul>
                                        ${selectedTriage.symptoms
                                          .map(
                                            (symptom) => `<li>${symptom}</li>`
                                          )
                                          .join("")}
                                    </ul>
                                `
                                    : '<p style="text-align: center; color: #6c757d; font-style: italic;">No se reportaron síntomas específicos</p>'
                                }
                            </div>
                        </div>
                        
                        <div class="section">
                            <div class="section-title">📋 Diagnóstico Médico</div>
                            <div class="highlight-box" style="background: linear-gradient(135deg, #e6f7ff, #f0f8ff); border-color: #1e40af;">
                                <strong style="color: #1e40af; font-size: 16px;">
                                    ${
                                      selectedTriage.diagnosis ||
                                      editData.diagnosis ||
                                      "Pendiente de evaluación médica"
                                    }
                                </strong>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Sistema de Gestión Médica</strong></p>
                        <p>Este documento es confidencial y está protegido por las leyes de protección de datos médicos</p>
                        <p style="margin-top: 10px;">ID del Triage: ${
                          selectedTriage._id
                        }</p>
                    </div>
                </div>
            </body>
            </html>
        `;

    // Abrir en nueva ventana
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(pdfContent);
      newWindow.document.close();

      // Cerrar ventana después de imprimir (opcional)
      newWindow.onafterprint = function () {
        newWindow.close();
      };

      toast.success("PDF abierto en nueva ventana");
    } else {
      toast.error("Permite ventanas emergentes para generar el PDF");
    }
  };

  return (
    <div className="flex flex-col h-screen pt-20 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex flex-1">
        <div className="w-1/3 p-4 border-r bg-gray-100 dark:bg-gray-800">
          <h2 className="text-2xl font-bold mb-4">Triages ({statusFilter})</h2>
          <input
            type="text"
            placeholder="Buscar por documento"
            className="input input-bordered w-full mb-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex mb-4 gap-2">
            <button
              className={`btn ${
                statusFilter === "Open" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setStatusFilter("Open")}
            >
              Open
            </button>
            <button
              className={`btn ${
                statusFilter === "Closed" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setStatusFilter("Closed")}
            >
              Closed
            </button>
          </div>
          <div className="mb-4">
            <button
              className="btn btn-sm btn-outline w-full"
              onClick={() => setSortAsc(!sortAsc)}
            >
              Orden: {sortAsc ? "Más antigua primero" : "Más reciente primero"}
            </button>
          </div>
          <div className="overflow-y-auto h-[80vh]">
            {filteredTriages.length > 0 ? (
              filteredTriages.map((t) => (
                <div
                  key={t._id}
                  className={`card mb-2 p-3 cursor-pointer transition-colors ${
                    selectedTriage?._id === t._id
                      ? "bg-blue-100 dark:bg-blue-900 border-blue-300"
                      : "bg-gray-200 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-800"
                  }`}
                  onClick={() => handleSelectTriage(t)}
                >
                  <h3 className="font-semibold">
                    Documento: {t.patientDocument}
                  </h3>
                  <p className="text-sm">Nivel: {t.triageLevel || "N/A"}</p>
                  <p className="text-xs">Estado: {t.state}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 mt-8">
                <p>No hay triages {statusFilter.toLowerCase()}</p>
                <p className="text-xs mt-1">
                  Intenta cambiar el filtro o buscar algo diferente
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="w-2/3 p-6 overflow-y-auto">
          {selectedTriage ? (
            <div className="space-y-4">
              <h2 className="text-3xl font-bold mb-4">Detalle del Triage</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedTriage)
                  .filter(([key]) => !["_id", "__v"].includes(key))
                  .map(([key, value]) => (
                    <div key={key}>
                      <label className="font-semibold capitalize">
                        {labelMap[key] || key}
                      </label>
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                        {key === "createdAt"
                          ? new Date(value).toLocaleString("es-CO", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : Array.isArray(value)
                          ? value.join(", ")
                          : String(value)}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Agregar diagnóstico</label>
                  <input
                    className="input input-bordered w-full"
                    onChange={(e) =>
                      setEditData({ ...editData, diagnosis: e.target.value })
                    }
                    placeholder="Ingrese el diagnóstico..."
                    disabled={selectedTriage?.state === "Closed"}
                  />
                </div>
                <div>
                  <label className="font-semibold">Nivel de triage</label>
                  <input
                    className="input input-bordered w-full"
                    value={editData.triageLevel}
                    onChange={(e) =>
                      setEditData({ ...editData, triageLevel: e.target.value })
                    }
                    placeholder="Ej: 1,2,3,4,5"
                    disabled={selectedTriage?.state === "Closed"}
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6 flex-wrap">
                <button
                  className="btn btn-success gap-2"
                  onClick={handleSave}
                  disabled={selectedTriage?.state === "Closed"}
                >
                  <Save className="w-4 h-4" /> Guardar Cambios
                </button>
                {selectedTriage.state === "Open" && (
                  <button
                    className="btn btn-warning gap-2"
                    onClick={handleCloseTriage}
                  >
                    <X className="w-4 h-4" /> Cerrar Triage
                  </button>
                )}
                {selectedTriage.state === "Closed" && (
                  <button className="btn btn-info gap-2" onClick={generatePDF}>
                    <Download className="w-4 h-4" /> Generar PDF
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-400">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-lg">Selecciona un triage de la lista</p>
              <p className="text-sm mt-2">
                Haz clic en cualquier triage para ver sus detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelMedico;
