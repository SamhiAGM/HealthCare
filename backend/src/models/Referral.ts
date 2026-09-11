import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  fromHospitalId: mongoose.Types.ObjectId;
  toHospitalId: mongoose.Types.ObjectId;
  citizenId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  reason: string;
  urgency: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>({
  fromHospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  toHospitalId:   { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  citizenId:      { type: Schema.Types.ObjectId, ref: 'Citizen', required: true },
  doctorId:       { type: Schema.Types.ObjectId, ref: 'Doctor' },
  reason:         { type: String, required: true },
  urgency:        { type: String, enum: ['Routine', 'Urgent', 'Emergency'], default: 'Routine' },
  status:         { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Completed'], default: 'Pending' },
  notes:          { type: String },
}, { timestamps: true });

referralSchema.index({ fromHospitalId: 1, status: 1 });
referralSchema.index({ toHospitalId: 1, status: 1 });

export const Referral = mongoose.model<IReferral>('Referral', referralSchema);
