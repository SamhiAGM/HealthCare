import mongoose, { Schema, Document } from 'mongoose';

export interface IBedInventory extends Document {
  hospitalId: mongoose.Types.ObjectId;
  wardType: 'Medical' | 'Surgical' | 'ICU' | 'HDU' | 'Maternity' | 'Pediatric' | 'Isolation' | 'Emergency';
  total: number;
  occupied: number;
  available: number;
  reserved: number;
  unavailable: number;
  publicStatus: 'Available' | 'Limited' | 'Near Capacity' | 'Critical' | 'Full' | 'Unknown';
  lastUpdatedBy?: mongoose.Types.ObjectId;
  lastUpdatedAt: Date;
}

const bedInventorySchema = new Schema<IBedInventory>({
  hospitalId:     { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  wardType: {
    type: String,
    enum: ['Medical','Surgical','ICU','HDU','Maternity','Pediatric','Isolation','Emergency'],
    required: true,
  },
  total:          { type: Number, default: 0 },
  occupied:       { type: Number, default: 0 },
  available:      { type: Number, default: 0 },
  reserved:       { type: Number, default: 0 },
  unavailable:    { type: Number, default: 0 },
  publicStatus: {
    type: String,
    enum: ['Available','Limited','Near Capacity','Critical','Full','Unknown'],
    default: 'Unknown',
  },
  lastUpdatedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedAt:  { type: Date, default: Date.now },
}, { timestamps: true });

bedInventorySchema.index({ hospitalId: 1, wardType: 1 }, { unique: true });

export const BedInventory = mongoose.model<IBedInventory>('BedInventory', bedInventorySchema);
