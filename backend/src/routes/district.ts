import express, { Response } from 'express';
import { authenticate, AuthRequest, requirePermission } from '../middleware/auth';
import { Hospital } from '../models/Hospital';
import { BedInventory } from '../models/BedInventory';
import { BloodInventory } from '../models/BloodInventory';
import { MedicineInventory } from '../models/MedicineInventory';
import { Admission } from '../models/Admission';
import { LabResult } from '../models/LabResult';
import { QueueToken } from '../models/QueueToken';
import { Types } from 'mongoose';

const router = express.Router();

// GET /api/v1/district/:districtId/hospitals - List hospitals in district
router.get('/:districtId/hospitals', authenticate, requirePermission('district.view'), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { districtId } = req.params;
    const hospitals = await Hospital.find({ districtId }).select('name type status beds province district');
    res.json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/v1/district/:districtId/summary - Aggregate summary across all hospitals
router.get('/:districtId/summary', authenticate, requirePermission('district.view'), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { districtId } = req.params;
    const hospitals = await Hospital.find({ districtId }).select('_id officialName');
    const hospitalIds = hospitals.map(h => h._id);

    const [beds, blood, medicines, admissions, labs, queues] = await Promise.all([
      BedInventory.aggregate([
        { $match: { hospitalId: { $in: hospitalIds } } },
        { $group: { _id: null, totalBeds: { $sum: '$total' }, occupiedBeds: { $sum: '$occupied' }, availableBeds: { $sum: '$available' } } }
      ]),
      BloodInventory.aggregate([
        { $match: { hospitalId: { $in: hospitalIds } } },
        { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$units' } } },
        { $sort: { _id: 1 } }
      ]),
      MedicineInventory.aggregate([
        { $match: { hospitalId: { $in: hospitalIds } } },
        { $group: { _id: '$availability', count: { $sum: 1 } } }
      ]),
      Admission.countDocuments({ hospitalId: { $in: hospitalIds }, status: 'Admitted' }),
      LabResult.countDocuments({ hospitalId: { $in: hospitalIds }, status: 'Pending' }),
      QueueToken.countDocuments({ hospitalId: { $in: hospitalIds }, status: { $in: ['Waiting', 'Approaching', 'Called', 'In-Consultation'] }, date: { $gte: new Date(new Date().setHours(0,0,0,0)) } })
    ]);

    res.json({
      success: true,
      data: {
        hospitals: hospitals.length,
        beds: beds[0] || { totalBeds: 0, occupiedBeds: 0, availableBeds: 0 },
        blood,
        medicines,
        activeAdmissions: admissions,
        pendingLab: labs,
        activeQueue: queues,
        hospitalList: hospitals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/v1/district/:districtId/alerts - Cross-hospital alerts
router.get('/:districtId/alerts', authenticate, requirePermission('district.view'), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { districtId } = req.params;
    const hospitals = await Hospital.find({ districtId }).select('_id name');
    const hospitalIds = hospitals.map(h => h._id);
    const hospitalMap = Object.fromEntries(hospitals.map(h => [h._id.toString(), h.officialName]));

    const [criticalBeds, lowBlood, outOfStockMeds] = await Promise.all([
      BedInventory.find({ hospitalId: { $in: hospitalIds }, publicStatus: { $in: ['Full', 'Critical'] } }).select('wardType publicStatus occupied total hospitalId'),
      BloodInventory.find({ hospitalId: { $in: hospitalIds }, units: { $lt: 10 } }).select('bloodGroup units hospitalId'),
      MedicineInventory.find({ hospitalId: { $in: hospitalIds }, availability: 'out-of-stock' }).select('medicineName hospitalId'),
    ]);

    const alerts = [
      ...criticalBeds.map(b => ({ severity: b.publicStatus === 'Full' ? 'critical' : 'high', type: 'Beds', hospitalId: b.hospitalId, hospital: hospitalMap[b.hospitalId.toString()], message: `${b.wardType} at ${b.publicStatus} (${b.occupied}/${b.total})` })),
      ...lowBlood.map(b => ({ severity: (b.units ?? 0) < 5 ? 'critical' : 'high', type: 'Blood', hospitalId: b.hospitalId, hospital: hospitalMap[b.hospitalId.toString()], message: `${b.bloodGroup}: ${b.units ?? 0} units remaining` })),
      ...outOfStockMeds.map(m => ({ severity: 'critical', type: 'Pharmacy', hospitalId: m.hospitalId, hospital: hospitalMap[m.hospitalId.toString()], message: `${m.medicineName} out of stock` })),
    ];

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
