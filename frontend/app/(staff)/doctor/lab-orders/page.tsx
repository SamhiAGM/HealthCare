'use client';

import { TestTube2, Search, Plus } from 'lucide-react';

export default function DoctorLabOrders() {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TestTube2 className="text-teal-600" /> Lab Orders
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Order and review clinical laboratory investigations.</p>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Lab Order
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <TestTube2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No active lab orders</h3>
          <p className="text-slate-500 mt-1">Create a new order to investigate patient conditions.</p>
        </div>
      </div>
    </div>
  );
}
