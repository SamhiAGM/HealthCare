import mongoose from 'mongoose';
import { Role } from '../src/models/Role';
import { connectDB } from '../src/db';
import dotenv from 'dotenv';

dotenv.config();

const roles = [
  {
    name: 'SUPER_ADMIN',
    description: 'Complete system administration',
    scope: 'SYSTEM',
    isSystem: true,
    permissions: ['system.manage', 'roles.manage', 'users.manage', 'institutions.manage']
  },
  {
    name: 'MINISTRY_ADMIN',
    description: 'National level administration',
    scope: 'MINISTRY',
    isSystem: true,
    permissions: ['ministry.analytics.read', 'national.alerts.manage', 'users.read']
  },
  {
    name: 'PROVINCIAL_ADMIN',
    description: 'Provincial level administration',
    scope: 'PROVINCE',
    isSystem: true,
    permissions: ['province.analytics.read', 'province.alerts.manage', 'users.read']
  },
  {
    name: 'DISTRICT_ADMIN',
    description: 'District level administration',
    scope: 'DISTRICT',
    isSystem: true,
    permissions: ['district.analytics.read', 'district.alerts.manage', 'users.read']
  },
  {
    name: 'HOSPITAL_ADMIN',
    description: 'Hospital level administration',
    scope: 'HOSPITAL',
    isSystem: true,
    permissions: [
      'hospital.read', 'hospital.update', 'staff.manage', 'attendance.manage', 
      'clinic.manage', 'doctor.schedule.manage', 'equipment.manage', 'reports.read', 'audit.read'
    ]
  },
  {
    name: 'DOCTOR',
    description: 'Medical Doctor',
    scope: 'DEPARTMENT',
    isSystem: true,
    permissions: ['consultation.read', 'consultation.write', 'prescription.create', 'appointment.read', 'queue.read']
  },
  {
    name: 'NURSE',
    description: 'Nurse',
    scope: 'DEPARTMENT',
    isSystem: true,
    permissions: ['consultation.read', 'bed.read', 'bed.update', 'appointment.read', 'queue.read']
  },
  {
    name: 'PHARMACIST',
    description: 'Pharmacist',
    scope: 'HOSPITAL',
    isSystem: true,
    permissions: ['medicine.read', 'medicine.update', 'prescription.dispense']
  },
  {
    name: 'LAB_STAFF',
    description: 'Laboratory Staff',
    scope: 'DEPARTMENT',
    isSystem: true,
    permissions: ['lab.process']
  },
  {
    name: 'RADIOLOGY_STAFF',
    description: 'Radiology Staff',
    scope: 'DEPARTMENT',
    isSystem: true,
    permissions: ['radiology.process']
  },
  {
    name: 'BLOOD_BANK_STAFF',
    description: 'Blood Bank Staff',
    scope: 'DEPARTMENT',
    isSystem: true,
    permissions: ['blood.manage']
  },
  {
    name: 'RECEPTION_STAFF',
    description: 'Receptionist',
    scope: 'HOSPITAL',
    isSystem: true,
    permissions: ['appointment.manage', 'queue.manage', 'hospital.read']
  },
  {
    name: 'HR_STAFF',
    description: 'Human Resources',
    scope: 'HOSPITAL',
    isSystem: true,
    permissions: ['staff.manage', 'attendance.manage']
  },
  {
    name: 'AUDITOR',
    description: 'System Auditor',
    scope: 'SYSTEM',
    isSystem: true,
    permissions: ['audit.read', 'reports.read']
  },
  {
    name: 'CITIZEN',
    description: 'Patient/Citizen',
    scope: 'GLOBAL',
    isSystem: true,
    permissions: ['citizen.read']
  }
];

async function seed() {
  try {
    await connectDB();
    console.log('Connected to DB');
    
    for (const roleData of roles) {
      await Role.findOneAndUpdate({ name: roleData.name }, roleData, { upsert: true, new: true });
    }
    
    console.log('Roles seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
}

seed();
