import Symptom from '../model/symptom.model.js';
import { response } from 'express';

export const getSymptoms = async (req, res = response) => {
    try {
        const symptoms = await Symptom.find();
        return res.status(200).json({
            ok: true,
            message: 'Symptoms retrieved successfully',
            symptoms
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const createSymptom = async (req, res = response) => {
    const { symptom, triageLevel, description } = req.body;
    try {
        let newSymptom = new Symptom({ symptom, triageLevel, description });

        const symptomExists = await Symptom.findOne({ symptom: symptom });
        if (symptomExists) {
            return res.status(403).json({
                ok: false,
                message: 'Symptom is already registered, please use another one'
            });
        }

        await newSymptom.save();

        return res.status(201).json({
            ok: true,
            message: 'Symptom created successfully',
            newSymptom
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteSymptom = async (req, res = response) => {
    const {symptomId} = req.body; 
    const symptom = Symptom.findByIdAndDelete(symptomId);
    if (!symptom) {
        return res.status(404).json({
            ok: false,
            message: 'Symptom not found'
        });
    }
    return res.status(200).json({
        ok: true,
        message: 'Symptom deleted successfully'
    });
}