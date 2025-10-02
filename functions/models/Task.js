import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },  // URL de la imagen o nombre de archivo si guardado localmente
}, { _id: false });

const pointSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
}, { _id: false });

const taskSchema = new mongoose.Schema({
    signature: { type: String, required: true },  // URL de la firma o nombre de archivo si guardado localmente
    taskStatus: { type: String, required: true },   // Estado de la tarea
    deliveryStatus: { type: String, required: true },  // Estado de la entrega
    comments: { type: String },  // Comentarios opcionales
    codeRoute: { type: String, required: true },  // Código de la ruta
    images: [imageSchema],  // Arreglo de imágenes
    point: [pointSchema], // Objeto con el tipo y nombre dle punto
    createdAt: { type: Date, default: Date.now },  // Fecha de creación
}, { versionKey: false });

const Task = mongoose.model('Task', taskSchema, 'tasks');

export default Task;
