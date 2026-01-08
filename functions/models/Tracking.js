import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isAuthenticated: { type: Boolean, default: false },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        timestamp: { type: Date }
    },
    superior_account: { type: String},
    status: { type: String, default: 'Fuera de línea', enum: ['Disponible', 'Activo', 'Fuera de línea'] },
}, { versionKey: false });

const Tracking = mongoose.model('Tracking', trackingSchema, 'tracking');
export default Tracking;
