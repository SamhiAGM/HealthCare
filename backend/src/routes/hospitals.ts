import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Hospital } from '../models/Hospital';
import { Province } from '../models/Province';
import { District } from '../models/District';
import { Doctor } from '../models/Doctor';
import { Clinic } from '../models/Clinic';
import { BedInventory } from '../models/BedInventory';
import { BloodInventory } from '../models/BloodInventory';
import { MedicineInventory } from '../models/MedicineInventory';
import { validateQuery } from '../middleware/validate';

const router = Router();

/* ─── Query Schema ─────────────────────────────────────────────────── */
const hospitalQuerySchema = z.object({
  search:       z.string().optional(),
  province:     z.string().optional(),
  district:     z.string().optional(),
  type:         z.string().optional(),
  emergency:    z.string().optional(),   // 'true'|'false'
  pharmacy:     z.string().optional(),
  laboratory:   z.string().optional(),
  bloodBank:    z.string().optional(),
  sort:         z.enum(['name', 'district', 'type']).optional().default('name'),
  page:         z.string().optional().default('1'),
  limit:        z.string().optional().default('20'),
});

/* ─── GET /api/v1/hospitals ──────────────────────────────────────────── */
router.get('/', validateQuery(hospitalQuerySchema), async (req: Request, res: Response) => {
  try {
    const {
      search, province, district, type,
      emergency, pharmacy, laboratory, bloodBank,
      sort, page, limit,
    } = req.query as z.infer<typeof hospitalQuerySchema>;

    const filter: Record<string, unknown> = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (province) filter.province = { $regex: province, $options: 'i' };
    if (district) filter.district = { $regex: district, $options: 'i' };
    if (type)     filter.hospitalType = { $regex: type, $options: 'i' };
    if (emergency === 'true')  filter.emergencyAvailable = true;
    if (pharmacy  === 'true')  filter.pharmacyAvailable = true;
    if (laboratory === 'true') filter.laboratoryAvailable = true;
    if (bloodBank  === 'true') filter.bloodBankAvailable = true;

    const pageNum  = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip     = (pageNum - 1) * limitNum;

    const sortMap: Record<string, [string, 1 | -1][]> = {
      name:     [['officialName', 1]],
      district: [['district', 1], ['officialName', 1]],
      type:     [['hospitalType', 1], ['officialName', 1]],
    };
    const sortQuery = sortMap[sort] || [['officialName', 1]];

    const [hospitals, total] = await Promise.all([
      Hospital.find(filter)
        .select('-departments')
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Hospital.countDocuments(filter),
    ]);

    res.json({
      hospitals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('[HOSPITALS GET]', err);
    res.status(500).json({ error: 'Failed to retrieve hospitals' });
  }
});

/* ─── GET /api/v1/hospitals/nearby ──────────────────────────────────── */
router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = '20000', limit = '10' } = req.query as Record<string, string>;

    if (!lat || !lng) {
      res.status(400).json({ error: 'latitude (lat) and longitude (lng) are required' });
      return;
    }

    const latitude  = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusM   = parseInt(radius, 10);
    const limitN    = Math.min(20, parseInt(limit, 10));

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(400).json({ error: 'Invalid coordinates' });
      return;
    }

    // Fallback: use approximate distance without geospatial index
    const hospitals = await Hospital.find({
      isActive: true,
      latitude: { $ne: null },
      longitude: { $ne: null },
    })
      .select('officialName shortName slug hospitalType district province latitude longitude emergencyAvailable pharmacyAvailable verificationStatus')
      .lean();

    // Sort by haversine distance
    const withDistance = hospitals.map(h => ({
      ...h,
      distance: haversineDistance(latitude, longitude, h.latitude!, h.longitude!),
    }))
    .filter(h => h.distance <= radiusM / 1000)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limitN);

    res.json({ hospitals: withDistance });
  } catch (err) {
    console.error('[HOSPITALS NEARBY]', err);
    res.status(500).json({ error: 'Failed to retrieve nearby hospitals' });
  }
});

/* ─── GET /api/v1/hospitals/:slug ───────────────────────────────────── */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const hospital = await Hospital.findOne({ slug, isActive: true })
      .populate('provinceId', 'nameEn')
      .populate('districtId', 'nameEn')
      .lean();

    if (!hospital) {
      res.status(404).json({ error: 'Hospital not found' });
      return;
    }

    // Fetch related data in parallel
    const [doctors, clinics, beds, blood, medicines] = await Promise.all([
      Doctor.find({ hospitalId: (hospital as any)._id, active: true })
        .select('name title specialty subSpecialty verificationStatus dataAvailable')
        .lean(),
      Clinic.find({ hospitalId: (hospital as any)._id, status: 'Active' })
        .select('name day startTime endTime capacity bookingOpen status lastUpdatedAt')
        .lean(),
      BedInventory.find({ hospitalId: (hospital as any)._id })
        .select('wardType total available publicStatus lastUpdatedAt')
        .lean(),
      BloodInventory.find({ hospitalId: (hospital as any)._id })
        .select('bloodGroup status lastUpdatedAt')
        .lean(),
      MedicineInventory.find({ hospitalId: (hospital as any)._id })
        .select('medicineName genericName strength form availability lastUpdatedAt')
        .limit(20)
        .lean(),
    ]);

    res.json({ hospital, doctors, clinics, beds, blood, medicines });
  } catch (err) {
    console.error('[HOSPITAL DETAIL]', err);
    res.status(500).json({ error: 'Failed to retrieve hospital' });
  }
});

/* ─── GET /api/v1/provinces ─────────────────────────────────────────── */
router.get('/provinces/all', async (_req: Request, res: Response) => {
  try {
    const provinces = await Province.find().sort({ nameEn: 1 }).lean();
    res.json({ provinces });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve provinces' });
  }
});

/* ─── GET /api/v1/districts ─────────────────────────────────────────── */
router.get('/districts/all', async (req: Request, res: Response) => {
  try {
    const { province } = req.query;
    const filter = province ? { nameEn: { $regex: province, $options: 'i' } } : {};
    const districts = await District.find(filter)
      .populate('provinceId', 'nameEn')
      .sort({ nameEn: 1 })
      .lean();
    res.json({ districts });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve districts' });
  }
});

/* ─── Haversine helper ──────────────────────────────────────────────── */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export default router;
