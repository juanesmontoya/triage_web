import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export default function SymptomsTable() {
  const [symptoms, setSymptoms] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}symptoms/getSymptoms`)
      .then(res => {
        const sorted = [...(res.data.symptoms || [])].sort((a, b) => b.triageLevel - a.triageLevel);
        setSymptoms(sorted);
      })
      .catch(err => console.error('Error fetching symptoms:', err));
  }, []);

  return (
    <div className="p-8 bg-base-100 min-h-screen">
      <div className="text-center mb-4 leading-tight">
        <h1 className="text-2xl font-bold">Tabla de Síntomas</h1>
        <h3 className="text-sm">Datos extraídos de un árbol de decisión elaborado en conjunto con profesionales de la salud</h3>
        <h3 className="text-sm italic">Más síntomas pueden ser agregados en el futuro</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Síntoma</th>
              <th>Nivel</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {symptoms.map((symptom, idx) => (
              <tr key={idx}>
                <td>{symptom.symptom}</td>
                <td>{symptom.triageLevel}</td>
                <td>{symptom.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}