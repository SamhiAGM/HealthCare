import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  name?: string;
  title?: string;
  specialty?: string;
  subSpecialty?: string;

  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;

  clinicSchedules?: mongoose.Types.ObjectId[];

  sourceName?: string;
  sourceUrl?: string | null;

  verifiedAt?: Date | null;
  verificationStatus: 'Verified' | 'Pending' | 'Unverified' | 'NoData';

  active: boolean;
  dataAvailable: boolean; // false = display "awaiting official source" message
}

const doctorSchema = new Schema<IDoctor>({
  name:           { type: String },
  title:          { type: String },
  specialty:      { type: String },
  subSpecialty:   { type: String },

  hospitalId:     { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  departmentId:   { type: Schema.Types.ObjectId, ref: 'Department' },

  clinicSchedules:[{ type: Schema.Types.ObjectId, ref: 'ClinicSchedule' }],

  sourceName:     { type: String },
  sourceUrl:      { type: String, default: null },
  verifiedAt:     { type: Date, default: null },
  verificationStatus: {
    type: String,
    enum: ['Verified', 'Pending', 'Unverified', 'NoData'],
    default: 'NoData',
  },

  active:         { type: Boolean, default: true },
  dataAvailable:  { type: Boolean, default: false },
}, { timestamps: true });

doctorSchema.index({ hospitalId: 1 });
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ name: 'text', specialty: 'text' });

export const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema);
