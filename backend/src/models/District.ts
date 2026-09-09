import mongoose, { Schema, Document } from 'mongoose';

export interface IDistrict extends Document {
  nameEn: string;
  nameSi?: string;
  nameTa?: string;
  provinceId: mongoose.Types.ObjectId;
}

const districtSchema = new Schema<IDistrict>({
  nameEn: { type: String, required: true, unique: true },
  nameSi: { type: String },
  nameTa: { type: String },
  provinceId: { type: Schema.Types.ObjectId, ref: 'Province', required: true }
}, { timestamps: true });

export const District = mongoose.model<IDistrict>('District', districtSchema);
