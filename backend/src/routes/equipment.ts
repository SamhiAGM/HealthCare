import express, { Response } from 'express';
import { Equipment } from '../models/Equipment';
import { authenticate, AuthRequest, requirePermission, requireHospitalScope } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';

const router = express.Router();

// GET /api/v1/equipment - List hospital equipment
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId || req.query.hospitalId;
    const { status, type, departmentId } = req.query;
    const filter: any = {};
    
    if (hospitalId) filter.hospitalId = hospitalId;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (departmentId) filter.departmentId = departmentId;

    const equipment = await Equipment.find(filter)
      .populate('hospitalId', 'officialName district')
      .populate('departmentId', 'name')
      .sort({ type: 1, name: 1 });

    res.json({ success: true, count: equipment.length, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching equipment' });
  }
});

// POST /api/v1/equipment - Add new equipment
const createEquipmentSchema = z.object({
  name: z.string().min(2),
  type: z.string().min(2),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  departmentId: z.string().optional(),
  status: z.enum(['Operational', 'Maintenance', 'Broken', 'Decommissioned']).optional(),
  lastMaintenanceDate: z.string().optional(),
  nextMaintenanceDate: z.string().optional(),
  notes: z.string().optional()
});

router.post('/', authenticate, requirePermission('inventory.manage'), requireHospitalScope, validateBody(createEquipmentSchema), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const data = { ...req.body, hospitalId };
    
    if (data.lastMaintenanceDate) data.lastMaintenanceDate = new Date(data.lastMaintenanceDate);
    if (data.nextMaintenanceDate) data.nextMaintenanceDate = new Date(data.nextMaintenanceDate);

    const item = new Equipment(data);
    await item.save();

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating equipment' });
  }
});

// PATCH /api/v1/equipment/:id - Update equipment
router.patch('/:id', authenticate, requirePermission('inventory.manage'), requireHospitalScope, validateBody(createEquipmentSchema.partial()), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const hospitalId = req.user?.hospitalId;
    const data = { ...req.body };

    if (data.lastMaintenanceDate) data.lastMaintenanceDate = new Date(data.lastMaintenanceDate);
    if (data.nextMaintenanceDate) data.nextMaintenanceDate = new Date(data.nextMaintenanceDate);

    const item = await Equipment.findOneAndUpdate(
      { _id: req.params.id, hospitalId },
      data,
      { new: true }
    );
    
    if (!item) return res.status(404).json({ success: false, message: 'Equipment not found' });

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating equipment' });
  }
});

export default router;
