import mongoose from "mongoose";

const triageSchema = new mongoose.Schema({
    patientId: {
        type: String,
        required: true
    },
    patientDocument: {
        type: String,
        required: true,
        trim: true
    },
    doctorId: {
        type: String
    },
    doctorDocument: {
        type: String,
        trim: true
    },
    symptoms: {
        type: [String],
        default: []
    },
    diagnosis: {
        type: String,
        trim: true
    },
    triageLevel: {
        type: Number,
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