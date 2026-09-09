import mongoose, { Schema, Document } from 'mongoose';

export interface IQueueToken extends Document {
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  citizenId?: mongoose.Types.ObjectId;

  tokenNumber: string;     // e.g. "A056"
  displayOrder: number;    // numeric for sorting
  date: Date;

  status: 'NotCheckedIn' | 'Waiting' | 'Approaching' | 'Called' | 'In-Consultation' | 'Completed' | 'Missed' | 'Cancelled';

  checkedInAt?: Date;
  calledAt?: Date;
  consultationStartAt?: Date;
  completedAt?: Date;

  estimatedWaitMinutes?: number;
}

const queueTokenSchema = new Schema<IQueueToken>({
  hospitalId:       { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  departmentId:     { type: Schema.Types.ObjectId, ref: 'Department' },
  appointmentId:    { type: Schema.Types.ObjectId, ref: 'Appointment' },
  citizenId:        { type: Schema.Types.ObjectId, ref: 'Citizen' },

  tokenNumber:      { type: String, required: true },
  displayOrder:     { type: Number, required: true },
  date:             { type: Date, required: true },

  status: {
    type: String,
    enum: ['NotCheckedIn','Waiting','Approaching','Called','In-Consultation','Completed','Missed','Cancelled'],
    default: 'NotCheckedIn',
  },

  checkedInAt:           { type: Date },
  calledAt:              { type: Date },
  consultationStartAt:   { type: Date },
  completedAt:           { type: Date },
  estimatedWaitMinutes:  { type: Number },
}, { timestamps: true });

queueTokenSchema.index({ hospitalId: 1, date: 1, displayOrder: 1 });
queueTokenSchema.index({ citizenId: 1, date: -1 });

export const QueueToken = mongoose.model<IQueueToken>('QueueToken', queueTokenSchema);
