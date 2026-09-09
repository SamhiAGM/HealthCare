import mongoose, { Schema, Document } from 'mongoose';

export interface IHospital extends Document {
  hospitalCode?: string;
  officialName: string;
  shortName?: string;
  slug: string;

  province: string;
  district: string;
  provinceId?: mongoose.Types.ObjectId;
  districtId?: mongoose.Types.ObjectId;

  hospitalType: string;

  address?: string;
  phoneNumbers?: string[];
  email?: string | null;
  website?: string | null;

  latitude?: number | null;
  longitude?: number | null;

  emergencyAvailable?: boolean | null;
  pharmacyAvailable?: boolean | null;
  laboratoryAvailable?: boolean | null;
  bloodBankAvailable?: boolean | null;

  departments?: string[];
  services?: string[];

  sourceName?: string;
  sourceUrl?: string | null;
  importedAt?: Date;
  verifiedAt?: Date | null;
  verificationStatus: 'Verified' | 'Pending' | 'Unverified';

  lastVerifiedAt?: Date;
  isActive: boolean;
}

const hospitalSchema = new Schema<IHospital>({
  hospitalCode:   { type: String, sparse: true },
  officialName:   { type: String, required: true },
  shortName:      { type: String },
  slug:           { type: String, required: true, unique: true, lowercase: true, trim: true },

  province:       { type: String, required: true },
  district:       { type: String, required: true },
  provinceId:     { type: Schema.Types.ObjectId, ref: 'Province' },
  districtId:     { type: Schema.Types.ObjectId, ref: 'District' },

  hospitalType:   { type: String, required: true },

  address:        { type: String },
  phoneNumbers:   [{ type: String }],
  email:          { type: String, default: null },
  website:        { type: String, default: null },

  latitude:       { type: Number, default: null },
  longitude:      { type: Number, default: null },

  emergencyAvailable:    { type: Boolean, default: null },
  pharmacyAvailable:     { type: Boolean, default: null },
  laboratoryAvailable:   { type: Boolean, default: null },
  bloodBankAvailable:    { type: Boolean, default: null },

  departments:    [{ type: String }],
  services:       [{ type: String }],

  sourceName:     { type: String },
  sourceUrl:      { type: String, default: null },
  importedAt:     { type: Date },
  verifiedAt:     { type: Date, default: null },
  verificationStatus: {
    type: String,
    enum: ['Verified', 'Pending', 'Unverified'],
    default: 'Unverified',
  },

  lastVerifiedAt: { type: Date },
  isActive:       { type: Boolean, default: true },
}, { timestamps: true });

hospitalSchema.index({ slug: 1 });
hospitalSchema.index({ district: 1 });
hospitalSchema.index({ province: 1 });
hospitalSchema.index({ hospitalType: 1 });
hospitalSchema.index({ officialName: 'text', shortName: 'text', district: 'text', province: 'text' });
hospitalSchema.index({
  latitude: 1,
  longitude: 1,
});

export const Hospital = mongoose.model<IHospital>('Hospital', hospitalSchema);
