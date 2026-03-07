import mongoose from 'mongoose';

const weightOptionSchema = new mongoose.Schema({
    weight: { type: Number, required: true },
    label: { type: String, required: true },
    available: { type: Boolean, default: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    image: { type: String },
    weightOptions: [weightOptionSchema]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
