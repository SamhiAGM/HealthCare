import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { initSocket } from './services/socket';
import { connectDB } from './db';
import { Hospital } from './models/Hospital';
import { Province } from './models/Province';
import { District } from './models/District';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import hospitalRoutes from './routes/hospitals';
import consultationRoutes from './routes/consultations';
import prescriptionRoutes from './routes/prescriptions';
import pharmacyRoutes from './routes/pharmacy';
import ministryRoutes from './routes/ministry';
import healthRecordRoutes from './routes/health-records';
import labRoutes from './routes/lab';
import adminRoutes from './routes/admin';
import hospitalAdminRoutes from './routes/hospital-admin';
import bedsRoutes from './routes/beds';
import bloodRoutes from './routes/blood';
import medicinesRoutes from './routes/medicines';
import equipmentRoutes from './routes/equipment';
import queuesRoutes from './routes/queues';
import admissionsRoutes from './routes/admissions';
import referralsRoutes from './routes/referrals';
import auditRoutes from './routes/audit';
import districtRoutes from './routes/district';
import { restoreDatabase } from './utils/dbRestore';
import { dumpDatabase } from './utils/dbDump';

const PORT = process.env.PORT || 5000;

/* ─── Mount routes ──────────────────────────────────────────────────── */
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/pharmacy', pharmacyRoutes);
app.use('/api/v1/ministry', ministryRoutes);
app.use('/api/v1/health-records', healthRecordRoutes);
app.use('/api/v1/lab', labRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/hospital-admin', hospitalAdminRoutes);
app.use('/api/v1/beds', bedsRoutes);
app.use('/api/v1/blood', bloodRoutes);
app.use('/api/v1/medicines', medicinesRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/queues', queuesRoutes);
app.use('/api/v1/admissions', admissionsRoutes);
app.use('/api/v1/referrals', referralsRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/district', districtRoutes);
app.use('/api/v1/provinces', (_req, res) => res.redirect('/api/v1/hospitals/provinces/all'));
app.use('/api/v1/districts', (_req, res) => res.redirect('/api/v1/hospitals/districts/all'));

/* ─── System health ─────────────────────────────────────────────────── */
app.get('/api/v1/system/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

/* ─── Data health ────────────────────────────────────────────────────── */
app.get('/api/v1/system/data-health', async (_req, res) => {
  try {
    const [provinceCount, districtCount, hospitalCount] = await Promise.all([
      Province.countDocuments(),
      District.countDocuments(),
      Hospital.countDocuments({ isActive: true }),
    ]);

    const kinniya = await Hospital.findOne({ officialName: /Kinniya/i });

    const productionReady =
      provinceCount === 9 &&
      districtCount === 25 &&
      hospitalCount > 0 &&
      kinniya !== null;

    res.json({
      databaseConnected: mongoose.connection.readyState === 1,
      provincesLoaded:   { count: provinceCount, pass: provinceCount === 9 },
      districtsLoaded:   { count: districtCount, pass: districtCount === 25 },
      hospitalsLoaded:   { count: hospitalCount, pass: hospitalCount > 0 },
      kinniyaPresent:    { pass: kinniya !== null },
      doctorCount:       0,
      clinicCount:       0,
      productionReady,
      timestamp:         new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data health' });
  }
});

/* ─── 404 handler ───────────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

/* ─── Seed data if empty ─────────────────────────────────────────────── */
async function seedData() {
  const hospitalCount = await Hospital.countDocuments();
  if (hospitalCount > 0) {
    console.log(`[SEED] ${hospitalCount} hospitals already in database. Skipping seed.`);
    return;
  }

  console.log('[SEED] Seeding hospital data...');

  const { default: fs } = await import('fs');
  const { default: path } = await import('path');

  const dataPath = path.resolve(process.cwd(), 'data/raw/moh_hospitals_2026.json');
  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  let hospitalTotal = 0;

  for (const provinceData of rawData) {
    let province = await Province.findOne({ nameEn: provinceData.province });
    if (!province) {
      province = await Province.create({ nameEn: provinceData.province });
    }

    for (const districtData of provinceData.districts) {
      let district = await District.findOne({ nameEn: districtData.district });
      if (!district) {
        district = await District.create({
          nameEn: districtData.district,
          provinceId: province._id,
        });
      }

      for (const h of districtData.hospitals) {
        const slug = h.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        const exists = await Hospital.findOne({ slug });
        if (!exists) {
          await Hospital.create({
            officialName: h.name,
            slug,
            province: provinceData.province,
            district: districtData.district,
            provinceId: province._id,
            districtId: district._id,
            hospitalType: h.type,
            address: h.city,
            latitude: h.lat ?? null,
            longitude: h.lng ?? null,
            emergencyAvailable: h.emergency ?? null,
            pharmacyAvailable: h.pharmacy ?? null,
            laboratoryAvailable: h.lab ?? null,
            bloodBankAvailable: h.blood ?? null,
            verificationStatus: 'Verified',
            sourceName: 'Ministry of Health Sri Lanka',
            sourceUrl: 'https://www.health.gov.lk',
            importedAt: new Date(),
            isActive: true,
          });
          hospitalTotal++;
        }
      }
    }
  }

  console.log(`[SEED] Completed: ${hospitalTotal} hospitals seeded across all 9 provinces.`);

  // Create demo staff accounts for testing
  const { User } = await import('./models/User.js');
  const argon2 = await import('argon2');
  
  const staffToCreate = [
    { email: 'dr.smith@example.com', role: 'DOCTOR', name: 'Dr. Smith', id: 'D001', nic: '198011111111' },
    { email: 'admin@lankacare.lk', role: 'HOSPITAL_ADMIN', name: 'Admin', id: 'A001', nic: '198122222222' },
    { email: 'reception@example.com', role: 'RECEPTION_STAFF', name: 'Reception', id: 'R001', nic: '198233333333' },
    { email: 'lab@example.com', role: 'LAB_STAFF', name: 'Lab Tech', id: 'L001', nic: '198344444444' },
    { email: 'pharmacy@example.com', role: 'PHARMACIST', name: 'Pharmacist', id: 'P001', nic: '198455555555' },
    { email: 'ministry@lankacare.lk', role: 'MINISTRY_ADMIN', name: 'Ministry', id: 'M001', nic: '198566666666' },
  ];

  const defaultHospital = await Hospital.findOne({ slug: 'national-hospital-sri-lanka' });
  const hospitalId = defaultHospital ? defaultHospital._id : undefined;

  for (const staff of staffToCreate) {
    const existing = await User.findOne({ email: staff.email });
    if (!existing) {
      const passwordHash = await argon2.hash('password123', { type: argon2.argon2id });
      const crypto = await import('crypto');
      const nicHash = crypto.createHash('sha256').update(staff.nic.toUpperCase()).digest('hex');
      
      await User.create({
        email: staff.email,
        nicHash,
        mobile: '+9477000' + Math.floor(1000 + Math.random() * 9000),
        passwordHash,
        role: staff.role,
        staffId: staff.id,
        isVerified: true,
        status: 'Active',
        hospitalId: staff.role !== 'MINISTRY_ADMIN' ? hospitalId : undefined
      });
    }
  }
  console.log(`[SEED] Completed: Seeded demo staff accounts.`);
}

/* ─── Start server ──────────────────────────────────────────────────── */
const server = http.createServer(app);

connectDB().then(async () => {
  const restored = await restoreDatabase();
  
  if (!restored) {
    await seedData();
  }

  // Initialize Socket.io
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`[SERVER] LankaCare backend running on port ${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[API]    Health: http://localhost:${PORT}/api/v1/system/health`);
    console.log(`[API]    Data:   http://localhost:${PORT}/api/v1/system/data-health`);
  });
}).catch((err) => {
  console.error('[SERVER] Failed to start:', err);
  process.exit(1);
});

// Graceful shutdown to dump data
const gracefulShutdown = async () => {
  console.log('\n[SERVER] Shutting down... Saving database to local dump.');
  await dumpDatabase();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Used by nodemon
