import mongoose from "mongoose";

const triageSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true
    },
    doctorId: {
        type: String
    },
    symptoms: {
        type: mongoose.Schema.Types.Mixed,
        trim: true
    },
    diagnosis: {
        type: String,
        trim: true
    },
    triageLevel: {
        type: String,
        trim: true
    },
    visitDetail: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        default: 'Open',
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Triage', triageSchema);