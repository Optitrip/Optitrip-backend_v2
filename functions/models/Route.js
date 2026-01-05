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

const deviationSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true,
        enum: ['DEVIATION_DETECTED', 'ORIGINAL_ROUTE', 'NEW_DESTINATION'] 
    },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    seenByAdmin: { type: Boolean, default: false },
    address: { type: String, default: '' },
    recalculatedRoute: {
        polyline: String, 
        sections: [{
            polyline: String,
            distance: Number,
            duration: Number
        }],
        timestamp: Date
    }
});

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
    reminderSent: { type: Boolean, default: false },
    startNotificationSent: { type: Boolean, default: false },
    deviations: [deviationSchema],
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
    scheduledTime: String,
    routeSections: [{
        polyline: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return v && v.length > 0;
                },
                message: 'Polyline no puede estar vacío'
            }
        },
        departureTime: String,
        arrivalTime: String,
        distance: Number,
    }],
    deviationAlertEnabled: {
        type: Boolean,
        default: false
    },
    deviationAlertDistance: {
        type: Number,
        default: 50, // 50 metros por defecto
        min: 10,
        max: 1000
    }
}, {
    timestamps: true,
    versionKey: false
});

const Route = mongoose.model('Route', routeSchema, 'routes');

export default Route;
