'use client';

import { Pill, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DoctorPrescriptions() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="text-teal-600" /> Prescriptions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage requested and dispensed medications.</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Prescription
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Pill className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No prescriptions found</h3>
          <p className="text-slate-500 mt-1">You haven't issued any prescriptions recently.</p>
        </div>
      </div>
    </div>
  );
}
