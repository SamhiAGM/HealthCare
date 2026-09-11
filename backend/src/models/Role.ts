import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, USER_ROLES } from './User';

export interface IRole extends Document {
  name: UserRole;
  description: string;
  permissions: string[];
  isSystem: boolean; // System roles cannot be deleted
  scope: 'SYSTEM' | 'MINISTRY' | 'PROVINCE' | 'DISTRICT' | 'HOSPITAL' | 'DEPARTMENT' | 'GLOBAL';
}

const roleSchema = new Schema<IRole>({
  name: { type: String, enum: USER_ROLES, required: true, unique: true },
  description: { type: String, required: true },
  permissions: [{ type: String }],
  isSystem: { type: Boolean, default: false },
  scope: { 
    type: String, 
    enum: ['SYSTEM', 'MINISTRY', 'PROVINCE', 'DISTRICT', 'HOSPITAL', 'DEPARTMENT', 'GLOBAL'], 
    default: 'HOSPITAL' 
  },
}, { timestamps: true });

export const Role = mongoose.model<IRole>('Role', roleSchema);
