import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmission extends Document {
  hospitalId: mongoose.Types.ObjectId;
  citizenId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  wardId?: mongoose.Types.ObjectId; // References BedInventory wardType basically, or a specific Ward if available
  
  admissionDate: Date;
  dischargeDate?: Date;
  
  status: 'Admitted' | 'Discharged' | 'Transferred' | 'Deceased';
  
  diagnosis?: string;
  notes?: string;
}

const admissionSchema = new Schema<IAdmission>({
  hospitalId:   { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  citizenId:    { type: Schema.Types.ObjectId, ref: 'Citizen', required: true },
  doctorId:     { type: Schema.Types.ObjectId, ref: 'Doctor' },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  wardId:       { type: Schema.Types.ObjectId, ref: 'BedInventory' },
  
  admissionDate: { type: Date, required: true, default: Date.now },
  dischargeDate: { type: Date },
  
  status: { type: String, enum: ['Admitted', 'Discharged', 'Transferred', 'Deceased'], default: 'Admitted' },
  
  diagnosis: { type: String },
  notes:     { type: String },
}, { timestamps: true });

admissionSchema.index({ hospitalId: 1, status: 1 });
admissionSchema.index({ citizenId: 1, status: 1 });

export const Admission = mongoose.model<IAdmission>('Admission', admissionSchema);
