import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isAuthenticated: { type: Boolean, default: false },
    location: {
        latitude: { type: Number },
        longitude: { type: Number },
        timestamp: { type: Date }
    },
    superior_account: { type: String },
    status: { type: String, default: 'Fuera de línea', enum: ['Disponible', 'Activo', 'Fuera de línea'] },
    routeProgress: {
        percentage: { type: Number, default: 0, min: 0, max: 100 }, 
        etaMinutes: { type: Number, default: null }, 
        totalDistance: { type: Number, default: 0 }, 
        traveledDistance: { type: Number, default: 0 },
        activeRouteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null }, 
        lastUpdated: { type: Date, default: Date.now } 
    }
}, { versionKey: false });

const Tracking = mongoose.model('Tracking', trackingSchema, 'tracking');
export default Tracking;
