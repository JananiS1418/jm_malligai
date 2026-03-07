import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    catname: { type: String, required: true, unique: true },
    catstatus: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
