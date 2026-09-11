import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import hospitalRoutes from './routes/hospitals';
import clinicRoutes from './routes/clinics';
import appointmentRoutes from './routes/appointments';
import queueRoutes from './routes/queue';
import doctorRoutes from './routes/doctors';
import medicineRoutes from './routes/medicines';
import bloodRoutes from './routes/blood';
import bedRoutes from './routes/beds';
import citizenRoutes from './routes/citizen';
import adminRoutes from './routes/admin';
import superAdminRoutes from './routes/super-admin';
import { globalErrorHandler } from './middleware/validate';

const app = express();

/* ─── Security headers ──────────────────────────────────────────────── */
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
}));

/* ─── CORS ──────────────────────────────────────────────────────────── */
app.use(cors({
  origin: (origin, cb) => {
    const allowed = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3001',
    ];
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* ─── Body parsing ──────────────────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

/* ─── Logging ───────────────────────────────────────────────────────── */
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

/* ─── Global rate limit ──────────────────────────────────────────────── */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', globalLimiter);

/* ─── Trust proxy (for Render/Railway deployment) ─────────────────── */
app.set('trust proxy', 1);

/* ─── Routes ────────────────────────────────────────────────────────── */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/clinics', clinicRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/queue', queueRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/medicines', medicineRoutes);
app.use('/api/v1/blood', bloodRoutes);
app.use('/api/v1/beds', bedRoutes);
app.use('/api/v1/citizen', citizenRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/super-admin', superAdminRoutes);

app.use(globalErrorHandler);

export default app;
