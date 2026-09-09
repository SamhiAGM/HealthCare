import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthRecord extends Document {
  citizenId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  
  diagnosis: string;
  symptoms: string[];
  clinicalNotes: string;
  treatmentPlan?: string;
  
  recordDate: Date;
  attachments: string[]; // Array of URLs to PDFs/Images

  createdAt: Date;
  updatedAt: Date;
}

const healthRecordSchema = new Schema<IHealthRecord>({
  citizenId:      { type: Schema.Types.ObjectId, ref: 'Citizen', required: true },
  hospitalId:     { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  doctorId:       { type: Schema.Types.ObjectId, ref: 'Doctor' },
  appointmentId:  { type: Schema.Types.ObjectId, ref: 'Appointment' },
  
  diagnosis:      { type: String, required: true },
  symptoms:       { type: [String], default: [] },
  clinicalNotes:  { type: String, required: true },
  treatmentPlan:  { type: String },
  
  recordDate:     { type: Date, default: Date.now, required: true },
  attachments:    { type: [String], default: [] },
}, { timestamps: true });

healthRecordSchema.index({ citizenId: 1, recordDate: -1 });
healthRecordSchema.index({ hospitalId: 1 });

export const HealthRecord = mongoose.model<IHealthRecord>('HealthRecord', healthRecordSchema);
