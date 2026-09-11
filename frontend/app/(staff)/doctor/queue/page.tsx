'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, PlayCircle, CheckCircle, AlertTriangle, SkipForward, ArrowRightLeft, User, RotateCcw, Stethoscope } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DoctorQueue() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ waiting: 0, completed: 0, avgWait: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
  const hospitalId = 'mock-hospital-id'; // In real app, from auth context
  const departmentId = 'mock-dept-id';

  useEffect(() => {
    fetchQueue();

    const socket: Socket = io(API, { withCredentials: true });
    socket.on('connect', () => {
      socket.emit('join_clinic', departmentId);
    });

    socket.on('QUEUE_TOKEN_CALLED', (data) => handleSocketUpdate(data.token));
    socket.on('QUEUE_TOKEN_COMPLETED', (data) => handleSocketUpdate(data.token));
    socket.on('QUEUE_TOKEN_SKIPPED', (data) => handleSocketUpdate(data.token));
    socket.on('QUEUE_TOKEN_NO_RESPONSE', (data) => handleSocketUpdate(data.token));
    socket.on('PATIENT_CHECKED_IN', (data) => handleSocketUpdate(data.token));

    return () => { socket.disconnect(); };
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await fetch(`${API}/api/v1/queue/live/${hospitalId}/${departmentId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setTokens(data.data.tokens || []);
        setStats({
          waiting: data.data.waitingCount,
          completed: data.data.tokens?.filter((t: any) => t.status === 'COMPLETED').length || 0,
          avgWait: data.data.estimatedWaitTime || 0
        });
      }
    } catch (e) {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const handleSocketUpdate = (updatedToken: any) => {
    setTokens(prev => {
      const exists = prev.find(t => t._id === updatedToken._id);
      if (exists) return prev.map(t => t._id === updatedToken._id ? updatedToken : t);
      return [...prev, updatedToken].sort((a, b) => a.displayOrder - b.displayOrder);
    });
    // Re-calculate stats ideally here
  };

  const actionReq = async (url: string, method: string = 'POST', body?: any) => {
    try {
      const res = await fetch(`${API}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include'
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success('Success');
      fetchQueue();
    } catch (e: any) {
      toast.error(e.message || 'Action failed');
    }
  };

  const currentPatient = tokens.find(t => t.status === 'CALLED' || t.status === 'IN_CONSULTATION');
  const waitingPatients = tokens.filter(t => ['WAITING', 'Waiting'].includes(t.status)).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="text-teal-600" /> Live Queue Command Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage real-time patient flow and clinical consultations.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm text-center">
          <div className="text-sm font-medium text-slate-500">Waiting</div>
          <div className="text-2xl font-bold text-amber-500">{waitingPatients.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm text-center">
          <div className="text-sm font-medium text-slate-500">Avg Wait</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">12m</div>
        </div>
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm text-center">
          <div className="text-sm font-medium text-slate-500">Completed</div>
          <div className="text-2xl font-bold text-emerald-500">{stats.completed}</div>
        </div>
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm text-center">
          <div className="text-sm font-medium text-slate-500">Priority</div>
          <div className="text-2xl font-bold text-rose-500">1</div>
        </div>
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm text-center">
          <div className="text-sm font-medium text-slate-500">No Shows</div>
          <div className="text-2xl font-bold text-slate-400">0</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Clinics & Next Patients */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200">
              CLINICS
            </div>
            <div className="p-2 space-y-1">
              <div className="p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg font-medium border border-teal-100 dark:border-teal-800">
                Medical Clinic
              </div>
              <div className="p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                Cardiology
              </div>
              <div className="p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
                Pediatrics
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex-1">
            <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 flex justify-between">
              <span>NEXT PATIENTS</span>
              <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{waitingPatients.length}</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[400px] overflow-y-auto">
              {waitingPatients.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Queue is clear</div>
              ) : (
                waitingPatients.map((p, idx) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={p._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div className={`font-bold ${idx === 0 ? 'text-teal-600 text-lg' : 'text-slate-700 dark:text-slate-300'}`}>
                        {p.tokenNumber}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> {Math.floor((new Date().getTime() - new Date(p.date).getTime()) / 60000)}m
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center / Right Column - Current Patient & Actions */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Main Action Area */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="bg-teal-600 px-6 py-4 border-b border-teal-700 flex justify-between items-center text-white">
              <span className="font-bold tracking-wide">CURRENT PATIENT</span>
              {currentPatient && (
                <span className="bg-teal-800 text-teal-100 text-xs px-2 py-1 rounded shadow-inner">
                  {currentPatient.status}
                </span>
              )}
            </div>
            
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center relative">
              <AnimatePresence mode="wait">
                {currentPatient ? (
                  <motion.div 
                    key={currentPatient._id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="w-full max-w-md"
                  >
                    <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Token</div>
                    <div className="text-7xl font-extrabold text-slate-900 dark:text-white tracking-tighter mb-4 shadow-sm inline-block px-8 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {currentPatient.tokenNumber}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 font-medium mb-8">Patient Checked In & Ready</div>

                    <div className="space-y-3">
                      <button 
                        onClick={() => router.push(`/doctor/consultations/${currentPatient.appointmentId}`)}
                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
                      >
                        <Stethoscope size={24} /> Start Consultation
                      </button>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => actionReq(`/api/v1/queue/${currentPatient._id}/recall`)} className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium flex flex-col items-center gap-1 transition-colors">
                          <RotateCcw size={18} /> Recall
                        </button>
                        <button onClick={() => actionReq(`/api/v1/queue/${currentPatient._id}/no-response`)} className="py-2 bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-900/40 text-slate-700 dark:hover:text-rose-600 dark:text-slate-300 rounded-lg text-sm font-medium flex flex-col items-center gap-1 transition-colors">
                          <AlertTriangle size={18} /> No Response
                        </button>
                        <button onClick={() => actionReq(`/api/v1/queue/${currentPatient._id}/skip`)} className="py-2 bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-900/40 text-slate-700 dark:hover:text-amber-700 dark:text-slate-300 rounded-lg text-sm font-medium flex flex-col items-center gap-1 transition-colors">
                          <SkipForward size={18} /> Skip
                        </button>
                      </div>

                      <button onClick={async () => {
                        await actionReq(`/api/v1/queue/${currentPatient._id}/complete`);
                        actionReq('/api/v1/queue/call-next', 'POST', { departmentId });
                      }} className="w-full py-3 mt-4 border-2 border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-500 rounded-xl font-bold hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all flex justify-center items-center gap-2">
                        <CheckCircle size={20} /> Complete & Call Next
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-sm">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                      <User size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Active Patient</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Call the next patient from the waiting queue to begin.</p>
                    
                    <button 
                      onClick={() => actionReq('/api/v1/queue/call-next', 'POST', { departmentId })}
                      disabled={waitingPatients.length === 0}
                      className={`w-full py-4 rounded-xl font-bold text-lg shadow-md transition-all flex justify-center items-center gap-2 ${
                        waitingPatients.length > 0 
                          ? 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg text-white animate-pulse' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <PlayCircle size={24} /> CALL NEXT ({waitingPatients.length})
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
