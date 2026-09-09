import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

const auditLogSchema = new Schema<IAuditLog>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User' },
  action:       { type: String, required: true },
  resource:     { type: String },
  resourceId:   { type: String },
  details:      { type: Schema.Types.Mixed },
  ipAddress:    { type: String },
  userAgent:    { type: String },
  success:      { type: Boolean, required: true, default: true },
  errorMessage: { type: String },
}, { timestamps: true });

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
