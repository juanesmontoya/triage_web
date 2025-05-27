import { response } from "express";
import Triage from "../model/triage.model.js";

export const createTriage = async (req, res = response) => {
    const { patientId, visitDetail } = req.body;
    try {
        let triage = new Triage({ patientId, visitDetail});

        await triage.save();

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
    const { id } = req.params;
    const { doctorId, diagnosis, triageLevel, state } = req.body;
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
    const { id } = req.params;
    const { triageLevel } = req.body;
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