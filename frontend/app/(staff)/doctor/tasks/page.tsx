'use client';

import { CheckSquare, Search } from 'lucide-react';

export default function DoctorTasks() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="text-teal-600" /> Tasks
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage tasks for your clinical practice.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No data available</h3>
        </div>
      </div>
    </div>
  );
}