import mongoose, { Schema, Document } from 'mongoose';

export interface IClinic extends Document {
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;

  name: string;
  day: string;           // 'Monday', 'Tuesday', etc.
  startTime: string;     // '08:00'
  endTime: string;       // '12:00'
  capacity?: number;

  bookingOpen: boolean;
  bookingOpenAt?: Date;
  bookingCloseAt?: Date;

  status: 'Active' | 'Cancelled' | 'Postponed' | 'Completed';
  cancellationReason?: string;
  lastUpdatedAt: Date;
}

const clinicSchema = new Schema<IClinic>({
  hospitalId:     { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  departmentId:   { type: Schema.Types.ObjectId, ref: 'Department' },
  doctorId:       { type: Schema.Types.ObjectId, ref: 'Doctor' },

  name:           { type: String, required: true },
  day:            { type: String, required: true },
  startTime:      { type: String, required: true },
  endTime:        { type: String, required: true },
  capacity:       { type: Number },

  bookingOpen:    { type: Boolean, default: false },
  bookingOpenAt:  { type: Date },
  bookingCloseAt: { type: Date },

  status: {
    type: String,
    enum: ['Active', 'Cancelled', 'Postponed', 'Completed'],
    default: 'Active',
  },
  cancellationReason: { type: String },
  lastUpdatedAt:  { type: Date, default: Date.now },
}, { timestamps: true });

clinicSchema.index({ hospitalId: 1, day: 1 });

export const Clinic = mongoose.model<IClinic>('Clinic', clinicSchema);
