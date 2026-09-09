import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshSession extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;  // SHA-256 hash of the refresh token
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
  revokedAt?: Date;
  isRevoked: boolean;
}

const refreshSessionSchema = new Schema<IRefreshSession>({
  userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash:  { type: String, required: true, select: false },
  deviceInfo: { type: String },
  ipAddress:  { type: String },
  expiresAt:  { type: Date, required: true },
  revokedAt:  { type: Date },
  isRevoked:  { type: Boolean, default: false },
}, { timestamps: true });

refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshSessionSchema.index({ userId: 1 });
refreshSessionSchema.index({ tokenHash: 1 });

export const RefreshSession = mongoose.model<IRefreshSession>('RefreshSession', refreshSessionSchema);
