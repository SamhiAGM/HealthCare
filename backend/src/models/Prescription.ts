import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescriptionItem {
  medicineName: string;
  dosage: string;      // e.g., "500mg"
  frequency: string;   // e.g., "Twice a day"
  durationDays: number;
  quantity: number;
  notes?: string;
}

export interface IPrescription extends Document {
  citizenId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  recordId?: mongoose.Types.ObjectId;

  prescriptionNumber: string;
  items: IPrescriptionItem[];
  
  status: 'Active' | 'Completed' | 'Cancelled';
  dispenseStatus: 'Pending' | 'Partial' | 'Dispensed';
  
  issueDate: Date;
  expireDate: Date;

  createdAt: Date;
  updatedAt: Date;
}

const prescriptionItemSchema = new Schema<IPrescriptionItem>({
  medicineName: { type: String, required: true },
  dosage:       { type: String, required: true },
  frequency:    { type: String, required: true },
  durationDays: { type: Number, required: true },
  quantity:     { type: Number, required: true },
  notes:        { type: String },
});

const prescriptionSchema = new Schema<IPrescription>({
  citizenId:  { type: Schema.Types.ObjectId, ref: 'Citizen', required: true },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  doctorId:   { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  recordId:   { type: Schema.Types.ObjectId, ref: 'HealthRecord' },

  prescriptionNumber: { type: String, required: true, unique: true },
  items: [prescriptionItemSchema],

  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active',
  },

  dispenseStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Dispensed'],
    default: 'Pending',
  },

  issueDate:  { type: Date, default: Date.now, required: true },
  expireDate: { type: Date, required: true },
}, { timestamps: true });

prescriptionSchema.index({ citizenId: 1, issueDate: -1 });
prescriptionSchema.index({ prescriptionNumber: 1 });

export const Prescription = mongoose.model<IPrescription>('Prescription', prescriptionSchema);
