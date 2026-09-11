'use client';

import { Stethoscope, Search, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DoctorConsultations() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Stethoscope className="text-teal-600" /> Consultations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review active, drafted, and completed clinical notes.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by patient name or ID..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
          <p className="font-medium text-slate-600 dark:text-slate-300">No active consultations</p>
          <p className="text-sm mt-1">Start a consultation from the Live Queue.</p>
        </div>
      </div>
    </div>
  );
}
