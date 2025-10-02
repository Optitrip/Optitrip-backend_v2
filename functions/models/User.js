import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  superior_account: { type: String},
  type_user: { type: String},
  name: { type: String},
  email: { type: String},
  password: { type: String},
  phone: { type: String},
  created_at: { type: Date, default: Date.now },
  rol_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
}, { versionKey: false });

const User = mongoose.model('User', userSchema, 'users');

export default User;
