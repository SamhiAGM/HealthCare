import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  nicHash?: string;        // bcrypt/argon2 hash for NIC lookup
  nicEncrypted?: string;   // AES-256 encrypted NIC for display to authorized users
  email?: string;
  mobile?: string;
  staffId?: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  status: 'Active' | 'Locked' | 'Suspended';
  failedLoginAttempts: number;
  lockedAt?: Date;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  hospitalId?: mongoose.Types.ObjectId; // for hospital-scoped staff
  districtId?: mongoose.Types.ObjectId;
  provinceId?: mongoose.Types.ObjectId;
}

export type UserRole =
  | 'CITIZEN'
  | 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'LAB_STAFF' | 'RADIOLOGY_STAFF'
  | 'BLOOD_BANK_STAFF' | 'RECEPTION_STAFF' | 'HR_STAFF'
  | 'HOSPITAL_ADMIN' | 'DISTRICT_ADMIN' | 'PROVINCIAL_ADMIN'
  | 'MINISTRY_ADMIN' | 'AUDITOR' | 'SUPER_ADMIN';

export const USER_ROLES: UserRole[] = [
  'CITIZEN',
  'DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_STAFF', 'RADIOLOGY_STAFF',
  'BLOOD_BANK_STAFF', 'RECEPTION_STAFF', 'HR_STAFF',
  'HOSPITAL_ADMIN', 'DISTRICT_ADMIN', 'PROVINCIAL_ADMIN',
  'MINISTRY_ADMIN', 'AUDITOR', 'SUPER_ADMIN',
];

const userSchema = new Schema<IUser>({
  nicHash:            { type: String, sparse: true, select: false },
  nicEncrypted:       { type: String, sparse: true, select: false },
  email:              { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  mobile:             { type: String, unique: true, sparse: true },
  staffId:            { type: String, unique: true, sparse: true, uppercase: true },
  passwordHash:       { type: String, required: true, select: false },
  role:               { type: String, enum: USER_ROLES, required: true, default: 'CITIZEN' },
  isVerified:         { type: Boolean, default: false },
  status:             { type: String, enum: ['Active', 'Locked', 'Suspended'], default: 'Active' },
  failedLoginAttempts:{ type: Number, default: 0 },
  lockedAt:           { type: Date },
  lastLoginAt:        { type: Date },
  lastLoginIp:        { type: String },
  hospitalId:         { type: Schema.Types.ObjectId, ref: 'Hospital' },
  districtId:         { type: Schema.Types.ObjectId, ref: 'District' },
  provinceId:         { type: Schema.Types.ObjectId, ref: 'Province' },
}, { timestamps: true });

userSchema.pre('save', function (next) {
  if (!this.nicHash && !this.email && !this.mobile && !this.staffId) {
    return next(new Error('At least one of NIC, email, mobile, or Staff ID must be provided.'));
  }
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
