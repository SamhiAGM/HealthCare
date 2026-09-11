'use client';

import { motion } from 'framer-motion';
import { 
  Users, Calendar, Clock, CheckCircle, 
  TestTube2, FileOutput, Stethoscope, Pill, 
  ArrowRight, Activity 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DoctorDashboard() {
  const router = useRouter();

  return (
    <div className="w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Stethoscope size={250} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2">Good Morning, Dr. Smith</h1>
          <div className="flex items-center gap-4 text-teal-100 font-medium mb-6">
            <span>Base Hospital Kinniya</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Cardiology Department</span>
          </div>
          <div className="text-lg text-teal-50">
            You have <span className="font-bold text-white">42 appointments</span> today. 
            <br />
            <span className="font-bold text-white">14 patients</span> are currently waiting in your queue.
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KPICard title="Appointments" value="42" icon={Calendar} color="bg-blue-500" />
        <KPICard title="Waiting" value="14" icon={Users} color="bg-amber-500" />
        <KPICard title="Current" value="Token A012" icon={Clock} color="bg-teal-500" />
        <KPICard title="Completed" value="28" icon={CheckCircle} color="bg-emerald-500" />
        <KPICard title="Pending Results" value="3" icon={TestTube2} color="bg-rose-500" />
        <KPICard title="Referrals" value="2" icon={FileOutput} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Activity className="text-teal-600" /> Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickActionCard 
              title="Call Next Patient" 
              desc="Atomically call the next eligible patient in queue" 
              icon={Users} 
              onClick={() => router.push('/doctor/queue')}
              primary
            />
            <QuickActionCard 
              title="Open Consultation" 
              desc="Resume active patient consultation notes" 
              icon={Stethoscope} 
              onClick={() => router.push('/doctor/consultations/current')}
            />
            <QuickActionCard 
              title="Create Prescription" 
              desc="Order medications for pharmacy dispensing" 
              icon={Pill} 
              onClick={() => router.push('/doctor/prescriptions/new')}
            />
            <QuickActionCard 
              title="Request Lab Test" 
              desc="Order clinical lab investigations" 
              icon={TestTube2} 
              onClick={() => router.push('/doctor/lab-orders/new')}
            />
          </div>
        </div>

        {/* Today's Workload / Alerts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tasks & Alerts</h2>
          
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 space-y-4">
            
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900 rounded-lg flex gap-3">
              <TestTube2 className="text-rose-600 shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-semibold text-rose-900 dark:text-rose-200 text-sm">Critical Lab Result</div>
                <div className="text-rose-700 dark:text-rose-400 text-xs mt-1">Patient A005 Troponin levels require immediate review.</div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900 rounded-lg flex gap-3">
              <Clock className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Queue Pressure</div>
                <div className="text-amber-700 dark:text-amber-400 text-xs mt-1">Average wait time has exceeded 45 minutes.</div>
              </div>
            </div>

            <button className="w-full py-2 text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center justify-center gap-1 transition-colors">
              View all tasks <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm cursor-pointer transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color} text-white`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</div>
    </motion.div>
  );
}

function QuickActionCard({ title, desc, icon: Icon, onClick, primary = false }: { title: string, desc: string, icon: any, onClick: () => void, primary?: boolean }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`text-left p-5 rounded-xl border transition-all ${
        primary 
          ? 'bg-teal-600 border-teal-600 text-white shadow-md hover:bg-teal-700' 
          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon size={24} className={primary ? 'text-teal-100' : 'text-teal-600 dark:text-teal-400'} />
        <div className={`font-bold ${primary ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>{title}</div>
      </div>
      <div className={`text-sm ${primary ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}>
        {desc}
      </div>
    </motion.button>
  );
}
