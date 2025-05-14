import mongoose from "mongoose";

const pacientSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    document:{
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Pacient', pacientSchema);