import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultation extends Document {
  appointmentId: mongoose.Types.ObjectId;
  citizenId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  clinicId?: mongoose.Types.ObjectId;

  presentingComplaint?: string;
  clinicalNotes?: string;
  observations?: {
    bloodPressure?: string;
    temperature?: number;
    pulse?: number;
    oxygenSaturation?: number;
    weight?: number;
  };
  diagnosis?: string;
  plan?: string;

  status: 'Draft' | 'Completed';
  startedAt: Date;
  completedAt?: Date;
}

const consultationSchema = new Schema<IConsultation>({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  citizenId: { type: Schema.Types.ObjectId, ref: 'Citizen', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic' },

  presentingComplaint: { type: String },
  clinicalNotes: { type: String },
  observations: {
    bloodPressure: { type: String },
    temperature: { type: Number },
    pulse: { type: Number },
    oxygenSaturation: { type: Number },
    weight: { type: Number },
  },
  diagnosis: { type: String },
  plan: { type: String },

  status: { type: String, enum: ['Draft', 'Completed'], default: 'Draft' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
}, { timestamps: true });

consultationSchema.index({ appointmentId: 1 });
consultationSchema.index({ citizenId: 1, startedAt: -1 });

export const Consultation = mongoose.model<IConsultation>('Consultation', consultationSchema);
