import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  superior_account: { 
    type: String,
    default: null,
    index: true 
  },
  type_user: { 
    type: String,
    required: true,
    enum: ['Super Administrador', 'Distribuidor', 'Administrador', 'Cliente', 'Conductor']
  },
  name: { 
    type: String,
    required: true 
  },
  email: { 
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String,
    required: true 
  },
  phone: { type: String },
  fcmToken: { type: String },
  created_at: { type: Date, default: Date.now },
  rol_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Role',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { versionKey: false });

// Índices compuestos para mejorar rendimiento
userSchema.index({ superior_account: 1, type_user: 1 });
userSchema.index({ email: 1, rol_id: 1 });

const User = mongoose.model('User', userSchema, 'users');

export default User;