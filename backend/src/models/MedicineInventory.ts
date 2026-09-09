import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicineInventory extends Document {
  hospitalId: mongoose.Types.ObjectId;
  medicineName: string;
  genericName?: string;
  strength?: string;
  form?: string;       // 'Tablet', 'Capsule', 'Syrup', etc.
  availability: 'available' | 'limited' | 'low-stock' | 'out-of-stock' | 'unknown';
  lastUpdatedBy?: mongoose.Types.ObjectId;
  lastUpdatedAt: Date;
  expiryDate?: Date;
  notes?: string;
}

const medicineInventorySchema = new Schema<IMedicineInventory>({
  hospitalId:      { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  medicineName:    { type: String, required: true },
  genericName:     { type: String },
  strength:        { type: String },
  form:            { type: String },
  availability: {
    type: String,
    enum: ['available', 'limited', 'low-stock', 'out-of-stock', 'unknown'],
    default: 'unknown',
  },
  lastUpdatedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedAt:   { type: Date, default: Date.now },
  expiryDate:      { type: Date },
  notes:           { type: String },
}, { timestamps: true });

medicineInventorySchema.index({ hospitalId: 1, medicineName: 1 });
medicineInventorySchema.index({ medicineName: 'text', genericName: 'text' });
medicineInventorySchema.index({ availability: 1 });

export const MedicineInventory = mongoose.model<IMedicineInventory>('MedicineInventory', medicineInventorySchema);
