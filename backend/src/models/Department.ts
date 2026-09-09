import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  hospitalId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  headDoctorId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  name: { type: String, required: true },
  description: { type: String },
  headDoctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

departmentSchema.index({ hospitalId: 1, name: 1 }, { unique: true });

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
