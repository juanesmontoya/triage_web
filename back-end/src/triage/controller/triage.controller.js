import { response } from "express";
import Triage from "../model/triage.model.js";
import { exec as execCb} from "child_process";
import { promisify } from 'util';
import path from "path";
import { fileURLToPath } from 'url';

const exec = promisify(execCb);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

        // Usar ruta absoluta al script Python
        const pythonScriptPath = path.resolve(__dirname, '../../../../Python/main.py');

        // Ejecutar el módulo Python pasando el texto (visitDetail)
        const pythonCommand = `python "${pythonScriptPath}" "${visitDetail}"`;

        const { stdout, stderr } = await exec(pythonCommand);

        if (stderr) {
            console.error(`Error en Python: ${stderr}`);
        }

        let parsed;

        try {
            parsed = JSON.parse(stdout);
        } catch (parseError) {
            console.error('Error parseando salida Python:', parseError.message);
            return res.status(500).json({ ok: false, message: 'Error parseando resultado de Python' });
        }

        const { found_keywords, triage_level } = parsed;

        // Aseguramos defaults por si vienen vacíos
        const safeKeywords = Array.isArray(found_keywords) ? found_keywords : [];
        const safeTriageLevel = typeof triage_level === 'number' ? triage_level : 6;

        // Actualizar triage con datos obtenidos de Python
        await Triage.findByIdAndUpdate(triage._id, {
            symptoms: safeKeywords,
            triageLevel: safeTriageLevel
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

export const getTriage = async (req, res = response) => {
    const { id } = req.params;
    try {
        const triage = await Triage.findById(id);
        if (!triage) {
            return res.status(404).json({
                ok: false,
                message: "Triage not found",
            });
        }
        return res.status(200).json({
            ok: true,
            triage
        });
    }
    catch (error) {
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
    const { id, doctorId, diagnosis, triageLevel, state } = req.body;
    try {
        const triage = await Triage.findById(id);
        if (!triage) {
            return res.status(404).json({
                ok: false,
                message: "Triage not found",
            });
        }
        triage.doctorId = doctorId;
        triage.diagnosis = diagnosis;
        triage.triageLevel = triageLevel;
        triage.state = state;

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

export const updateTriageLevel = async (req, res = response) => {
    const { id, triageLevel } = req.body;
    try {
        const triage = await Triage.findById(id);
        if (!triage) {
            return res.status(404).json({
                ok: false,
                message: "Triage not found",
            });
        }
        triage.triageLevel = triageLevel;
        await triage.save();
        return res.status(200).json({
            ok: true,
            message: "Triage level updated successfully",
            triage
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}