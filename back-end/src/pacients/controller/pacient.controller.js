import { response } from "express";
import Pacient from "../model/pacient.model.js";

export const createPacient = async (req, res = response) => {
    const { fullname, document, email } = req.body;
    try {
        let pacient = new Pacient({ fullname, document, email });

        const pacientExists = await Pacient.findOne({ document: document });
        if (pacientExists) {
            return res.status(403).json({
                ok: false,
                message: "Document is already registered, please use another one",
            });
        }

        const emailExists = await Pacient.findOne({ email: email });
        if (emailExists) {
            return res.status(403).json({
                ok: false,
                message: "Email is already registered, please use another one",
            });
        }

        await pacient.save();

        return res.status(201).json({
            ok: true,
            message: "Pacient created successfully",
            pacient,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getPacients = async (req, res = response) => {
    try {
        const pacients = await Pacient.find();
        return res.status(200).json({
            ok: true,
            message: "Pacients retrieved successfully",
            pacients
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const getPacient = async (req, res = response) => {
    const { document } = req.body;
    if (!document) {
        return res.status(400).json({
            ok: false,
            message: "Pacient document is required",
        });
    }
    try {
        const pacient = await Pacient.find({ document: document });
        if (!pacient) {
            return res.status(404).json({
                ok: false,
                message: "Pacient not found",
            });
        }
        return res.status(200).json({
            ok: true,
            message: "Pacient retrieved successfully",
            pacient
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}