import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  userId: mongoose.Types.ObjectId;
  hashedOtp: string;
  purpose: 'VERIFY_ACCOUNT' | 'RESET_PASSWORD' | 'LOGIN_MFA';
  expiresAt: Date;
  attempts: number;
  used: boolean;
  deliveredTo?: string; // masked phone/email
}

const otpSchema = new Schema<IOTP>({
  userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  hashedOtp:  { type: String, required: true, select: false },
  purpose:    { type: String, enum: ['VERIFY_ACCOUNT', 'RESET_PASSWORD', 'LOGIN_MFA'], required: true },
  expiresAt:  { type: Date, required: true },
  attempts:   { type: Number, default: 0 },
  used:       { type: Boolean, default: false },
  deliveredTo:{ type: String },
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ userId: 1, purpose: 1 });

export const OTP = mongoose.model<IOTP>('OTP', otpSchema);
