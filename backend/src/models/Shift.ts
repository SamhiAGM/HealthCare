import mongoose, { Schema, Document } from 'mongoose';

export interface IShift extends Document {
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  name: string; // e.g., 'Morning Shift', 'Night Shift'
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
}

const shiftSchema = new Schema<IShift>({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  name: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Shift = mongoose.model<IShift>('Shift', shiftSchema);
