import mongoose, { Types } from "mongoose";

const symptomSchema = new mongoose.Schema({
    symptom: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    triageLevel: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Symptom', symptomSchema);