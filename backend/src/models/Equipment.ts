import mongoose, { Schema, Document } from 'mongoose';

export interface IEquipment {
  hospitalId: mongoose.Types.ObjectId;
  departmentId?: mongoose.Types.ObjectId;
  name: string;
  type: string;
  model?: string;
  serialNumber?: string;
  status: 'Operational' | 'Maintenance' | 'Broken' | 'Decommissioned';
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  notes?: string;
}

const equipmentSchema = new Schema<IEquipment>({
  hospitalId:          { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  departmentId:        { type: Schema.Types.ObjectId, ref: 'Department' },
  name:                { type: String, required: true },
  type:                { type: String, required: true },
  model:               { type: String },
  serialNumber:        { type: String },
  status:              { type: String, enum: ['Operational', 'Maintenance', 'Broken', 'Decommissioned'], default: 'Operational' },
  lastMaintenanceDate: { type: Date },
  nextMaintenanceDate: { type: Date },
  notes:               { type: String },
}, { timestamps: true });

equipmentSchema.index({ hospitalId: 1, type: 1 });

export const Equipment = mongoose.model<IEquipment>('Equipment', equipmentSchema);
