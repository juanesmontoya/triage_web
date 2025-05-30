import { response } from "express";
import Triage from "../model/triage.model.js";
import axios from "axios";

const PYTHON_URL = process.env.PYTHON_URL || 'http://localhost:3002/processData';

export const createTriage = async (req, res = response) => {
    const { patientId, patientDocument, visitDetail } = req.body;
    try {
        const triage = new Triage({
            patientId,
            patientDocument,
            doctorId: '', // Initially no doctor assigned
            doctorDocument: '', // Initially no doctor assigned
            diagnosis: '', // Initially no diagnosis
            state: 'Open', // Default state
            visitDetail
        });

        triage.patientId = patientId;
        triage.patientDocument = patientDocument;
        triage.visitDetail = visitDetail;

        await triage.save();

        // Llamar al servicio de Python para procesar la data
        const pythonResponse = await axios.post(PYTHON_URL, {
            text: visitDetail
        });

        // Verificar respuesta de Python con los datos esperados
        const { found_keywords, triage_level } = pythonResponse.data;

        // Actualizar triage con datos obtenidos de Python
        await Triage.findByIdAndUpdate(triage._id, {
            symptoms: found_keywords,
            triageLevel: triage_level
        });

        return res.status(201).json({
            ok: true,
            message: "Triage created successfully",
            triage
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getAllTriage = async (req, res = response) => {
    try {
        const triages = await Triage.find();
        if (!triages) {
            return res.status(404).json({
                ok: false,
                message: "No triages found",
            });
        }
        return res.status(200).json({
            ok: true,
            triages
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updateTriage = async (req, res = response) => {
    const { id, ...data } = req.body;

    try {
        const triage = await Triage.findById(id);
        if (!triage) {
            return res.status(404).json({
                ok: false,
                message: "Triage not found",
            });
        }

        // Elimina campos que no deberían modificarse
        delete data._id;
        delete data.createdAt;
        delete data.updatedAt;

        // Aplica los cambios válidos
        triage.set(data);

        await triage.save();

        return res.status(200).json({
            ok: true,
            message: "Triage updated successfully",
            triage
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
