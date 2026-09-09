import mongoose, { Schema, Document } from 'mongoose';

export interface IBloodInventory extends Document {
  hospitalId: mongoose.Types.ObjectId;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  status: 'adequate' | 'moderate' | 'low' | 'critical';
  units?: number;  // Operational only — never expose to public
  lastUpdatedBy?: mongoose.Types.ObjectId;
  lastUpdatedAt: Date;
}

const bloodInventorySchema = new Schema<IBloodInventory>({
  hospitalId:   { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  bloodGroup: {
    type: String,
    enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'],
    required: true,
  },
  status: {
    type: String,
    enum: ['adequate','moderate','low','critical'],
    default: 'adequate',
  },
  units:          { type: Number, select: false }, // never sent to public API
  lastUpdatedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedAt:  { type: Date, default: Date.now },
}, { timestamps: true });

bloodInventorySchema.index({ hospitalId: 1, bloodGroup: 1 }, { unique: true });

export const BloodInventory = mongoose.model<IBloodInventory>('BloodInventory', bloodInventorySchema);
