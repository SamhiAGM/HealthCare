import mongoose, { Schema, Document } from 'mongoose';

export interface ICitizen extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  address?: string;
  provinceId?: mongoose.Types.ObjectId;
  districtId?: mongoose.Types.ObjectId;
}

const citizenSchema = new Schema<ICitizen>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  address: { type: String },
  provinceId: { type: Schema.Types.ObjectId, ref: 'Province' },
  districtId: { type: Schema.Types.ObjectId, ref: 'District' }
}, { timestamps: true });

export const Citizen = mongoose.model<ICitizen>('Citizen', citizenSchema);
