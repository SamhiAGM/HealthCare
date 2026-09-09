import mongoose, { Schema, Document } from 'mongoose';

export interface IProvince extends Document {
  nameEn: string;
  nameSi?: string;
  nameTa?: string;
}

const provinceSchema = new Schema<IProvince>({
  nameEn: { type: String, required: true, unique: true },
  nameSi: { type: String },
  nameTa: { type: String }
}, { timestamps: true });

export const Province = mongoose.model<IProvince>('Province', provinceSchema);
