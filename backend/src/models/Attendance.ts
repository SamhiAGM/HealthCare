import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  hospitalId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  shiftId?: mongoose.Types.ObjectId;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE';
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  correctedBy?: mongoose.Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'LEAVE', 'LATE'], required: true },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  notes: { type: String },
  correctedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

attendanceSchema.index({ hospitalId: 1, userId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
