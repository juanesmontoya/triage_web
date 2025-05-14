import mongoose from "mongoose";

const triageSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true
    },
    doctorId: {
        type: String,
        required: true
    },
    symptoms: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    diagnosis: {
        type: String,
        required: true,
        trim: true
    },
    triageLevel: {
        type: String,
        required: true,
        trim: true
    },
    fullConsultation: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Triage', triageSchema);