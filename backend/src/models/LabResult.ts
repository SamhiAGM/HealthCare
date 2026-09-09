import mongoose, { Schema, Document } from 'mongoose';

export interface ILabResult extends Document {
  citizenId: mongoose.Types.ObjectId;
  hospitalId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;

  testName: string;
  category: 'Blood' | 'Urine' | 'Imaging' | 'Biopsy' | 'Other';
  
  resultSummary: string;
  interpretation: 'Normal' | 'Abnormal' | 'Critical' | 'Pending';
  
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  
  fileUrl?: string; // Link to detailed PDF report
  
  dateOrdered: Date;
  dateCompleted?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const labResultSchema = new Schema<ILabResult>({
  citizenId:  { type: Schema.Types.ObjectId, ref: 'Citizen', required: true },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  doctorId:   { type: Schema.Types.ObjectId, ref: 'Doctor' },

  testName: { type: String, required: true },
  category: {
    type: String,
    enum: ['Blood', 'Urine', 'Imaging', 'Biopsy', 'Other'],
    required: true,
  },

  resultSummary:  { type: String },
  interpretation: {
    type: String,
    enum: ['Normal', 'Abnormal', 'Critical', 'Pending'],
    default: 'Pending',
  },

  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
    default: 'Pending',
  },

  fileUrl:       { type: String },
  
  dateOrdered:   { type: Date, default: Date.now, required: true },
  dateCompleted: { type: Date },
}, { timestamps: true });

labResultSchema.index({ citizenId: 1, dateOrdered: -1 });
labResultSchema.index({ hospitalId: 1, status: 1 });

export const LabResult = mongoose.model<ILabResult>('LabResult', labResultSchema);
