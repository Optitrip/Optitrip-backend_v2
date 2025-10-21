import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    load: { type: Number, default: 0 },
    unload: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 },
    status: { type: String, required: true },
}, { versionKey: false });

const assignedBySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
}, { _id: false });

const routeSchema = new mongoose.Schema({
    url: { type: String, required: true },
    selectedOption: { type: Number, required: true },
    origin: pointSchema,
    waypoints: [pointSchema],
    destination: pointSchema,
    tolls_total: { type: Number, required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: assignedBySchema,
    createdAt: { type: Date, default: Date.now },
    codeRoute: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    distance: { type: Number, required: true },
    durationTrip: { type: String, required: true },
    status: { type: String, required: true },
    avoidAreas: [{
        name: String,
        points: [[Number]], // Array de [lat, lng]
        color: String
    }],
    avoidParameters: [String], // ["tollRoad", "ferry", "tunnel", etc.]
    avoidHighways: [String], // ["ET", "A", "B", "C", "D"]
    transportation: {
        type: String,
        default: 'truck'
    },
    mode: {
        type: String,
        default: 'fast'
    },
    traffic: {
        type: Boolean,
        default: false
    },
    timeType: {
        type: String,
        default: 'Salir ahora'
    },
    scheduledTime: String
}, { 
    timestamps: true,
    versionKey: false 
});

const Route = mongoose.model('Route', routeSchema, 'routes');

export default Route;
