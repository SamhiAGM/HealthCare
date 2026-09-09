import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  citizenId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  clinicId?: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;

  appointmentNumber: string;
  qrCode?: string;

  date: Date;
  timeSlot?: string;

  status: 'Pending' | 'Confirmed' | 'Arrived' | 'In-Consultation' | 'Completed' | 'Cancelled' | 'NoShow' | 'Rescheduled';

  reason?: string;
  notes?: string;
  cancelReason?: string;

  remindersEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  citizenId:          { type: Schema.Types.ObjectId, ref: 'Citizen', required: true },
  hospitalId:         { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  clinicId:           { type: Schema.Types.ObjectId, ref: 'Clinic' },
  doctorId:           { type: Schema.Types.ObjectId, ref: 'Doctor' },
  departmentId:       { type: Schema.Types.ObjectId, ref: 'Department' },

  appointmentNumber:  { type: String, required: true, unique: true },
  qrCode:             { type: String },

  date:               { type: Date, required: true },
  timeSlot:           { type: String },

  status: {
    type: String,
    enum: ['Pending','Confirmed','Arrived','In-Consultation','Completed','Cancelled','NoShow','Rescheduled'],
    default: 'Pending',
  },

  reason:         { type: String },
  notes:          { type: String },
  cancelReason:   { type: String },
  remindersEnabled: { type: Boolean, default: true },
}, { timestamps: true });

appointmentSchema.index({ citizenId: 1, date: -1 });
appointmentSchema.index({ hospitalId: 1, date: 1 });
appointmentSchema.index({ appointmentNumber: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
