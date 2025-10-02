import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String},
  description: { type: String},
  created_at: { type: Date, default: Date.now }
});

const Role = mongoose.model('Role', roleSchema, 'roles');

export default Role;
