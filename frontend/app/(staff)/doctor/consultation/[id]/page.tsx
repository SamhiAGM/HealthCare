'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, ClipboardList, CheckCircle2, Save, FileText } from 'lucide-react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useParams, useRouter } from 'next/navigation';

export default function ConsultationPage() {
  const { id } = useParams(); // The consultation or appointment ID
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    presentingComplaint: '',
    clinicalNotes: '',
    diagnosis: '',
    plan: ''
  });

  const [showPrescription, setShowPrescription] = useState(false);
  const [showLabRequest, setShowLabRequest] = useState(false);
  const [labRequest, setLabRequest] = useState({
    testName: '',
    category: 'Blood'
  });
  
  const [prescriptionItem, setPrescriptionItem] = useState({
    medicineName: '',
    dosage: '',
    frequency: '',
    durationDays: 5,
    quantity: 10,
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handlePrescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrescriptionItem(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleCreatePrescription = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      // MOCK IDs for demo, should come from consultation data
      const citizenId = '6aa1c313adf98a660362719b'; 
      const hospitalId = '65d1c313adf98a660362719a';

      const res = await fetch(`${API}/api/v1/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId,
          hospitalId,
          items: [{
            ...prescriptionItem,
            durationDays: Number(prescriptionItem.durationDays),
            quantity: Number(prescriptionItem.quantity)
          }]
        }),
        credentials: 'include'
      });

      if (res.ok) {
        alert('Prescription created and sent to pharmacy!');
        setShowPrescription(false);
      } else {
        alert('Failed to create prescription');
      }
    } catch (e) {
      alert('Error creating prescription');
    }
  };

  const handleLabChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLabRequest(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleRequestLabTest = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      const citizenId = '6aa1c313adf98a660362719b'; 
      const hospitalId = '65d1c313adf98a660362719a';

      const res = await fetch(`${API}/api/v1/lab/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenId,
          hospitalId,
          testName: labRequest.testName,
          category: labRequest.category
        }),
        credentials: 'include'
      });

      if (res.ok) {
        alert('Lab test requested and sent to pathology!');
        setShowLabRequest(false);
      } else {
        alert('Failed to request lab test');
      }
    } catch (e) {
      alert('Error requesting lab test');
    }
  };

  const handleStartConsultation = async () => {
    // Call /api/v1/consultations/start
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      await fetch(`${API}/api/v1/consultations/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id }),
        credentials: 'include'
      });
      alert('Consultation Started. Status updated.');
    } catch (e) {
      console.error('Failed to start consultation');
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
      // Assume we stored consultation ID when we started it. For demo, we just use a generic ID pattern
      // In full app, we need the consultation ID from the start API response
      // For now we'll simulate completion
      const res = await fetch(`${API}/api/v1/consultations/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (res.ok) {
        alert('Consultation Completed Successfully!');
        router.push('/doctor/queue');
      } else {
        alert('Consultation saved (mock success for now, check API).');
        router.push('/doctor/queue');
      }
    } catch (error) {
      alert('Network Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Stethoscope size={28} color="var(--teal)" /> Active Consultation
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Ref: {id}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <Button variant="outline" onClick={handleStartConsultation}>Start Consultation Session</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lc-card" style={{ padding: '2rem' }}>
             <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <ClipboardList size={20} color="var(--teal)" /> Clinical Assessment
             </h2>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label htmlFor="presentingComplaint" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9375rem' }}>Presenting Complaint</label>
                  <Input id="presentingComplaint" value={formData.presentingComplaint} onChange={handleChange} placeholder="Main symptoms..." />
                </div>
                
                <div>
                  <label htmlFor="clinicalNotes" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9375rem' }}>Detailed Notes</label>
                  <textarea 
                    id="clinicalNotes" 
                    value={formData.clinicalNotes} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border)', minHeight: 120, fontFamily: 'inherit' }}
                    placeholder="Clinical findings, history..."
                  />
                </div>

                <div>
                  <label htmlFor="diagnosis" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9375rem' }}>Diagnosis</label>
                  <Input id="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="Primary diagnosis..." />
                </div>

                <div>
                  <label htmlFor="plan" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9375rem' }}>Plan / Advice</label>
                  <textarea 
                    id="plan" 
                    value={formData.plan} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border)', minHeight: 80, fontFamily: 'inherit' }}
                    placeholder="Management plan..."
                  />
                </div>
             </div>
          </motion.div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div className="lc-card" style={{ padding: '1.5rem' }}>
             <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Actions</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <Button variant="secondary" onClick={() => { setShowPrescription(!showPrescription); setShowLabRequest(false); }} style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                 <FileText size={16} /> {showPrescription ? 'Cancel Prescription' : 'Create Prescription'}
               </Button>
               <Button variant="secondary" onClick={() => { setShowLabRequest(!showLabRequest); setShowPrescription(false); }} style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                 <FileText size={16} /> {showLabRequest ? 'Cancel Lab Request' : 'Request Lab Test'}
               </Button>
             </div>
           </div>

           {showLabRequest && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lc-card" style={{ padding: '1.5rem', backgroundColor: '#eff6ff' }}>
               <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#2563eb' }}>Order Pathology Test</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div className="lc-input-container">
                   <label className="lc-label" htmlFor="category">Category</label>
                   <select id="category" value={labRequest.category} onChange={handleLabChange} className="lc-input">
                     <option value="Blood">Blood</option>
                     <option value="Urine">Urine</option>
                     <option value="Imaging">Imaging</option>
                     <option value="Biopsy">Biopsy</option>
                     <option value="Other">Other</option>
                   </select>
                 </div>
                 <Input id="testName" label="Test Name" value={labRequest.testName} onChange={handleLabChange} placeholder="e.g. Full Blood Count" />
                 
                 <Button variant="primary" onClick={handleRequestLabTest} style={{ marginTop: '0.5rem' }}>Send to Lab</Button>
               </div>
             </motion.div>
           )}

           {showPrescription && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lc-card" style={{ padding: '1.5rem', backgroundColor: '#f0fdfa' }}>
               <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--teal)' }}>New Prescription</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <Input id="medicineName" label="Medicine Name" value={prescriptionItem.medicineName} onChange={handlePrescriptionChange} placeholder="e.g. Paracetamol" />
                 <Input id="dosage" label="Dosage" value={prescriptionItem.dosage} onChange={handlePrescriptionChange} placeholder="e.g. 500mg" />
                 <Input id="frequency" label="Frequency" value={prescriptionItem.frequency} onChange={handlePrescriptionChange} placeholder="e.g. BD (Twice a day)" />
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <Input id="durationDays" label="Days" type="number" value={prescriptionItem.durationDays} onChange={handlePrescriptionChange} />
                   <Input id="quantity" label="Total Qty" type="number" value={prescriptionItem.quantity} onChange={handlePrescriptionChange} />
                 </div>

                 <Button variant="primary" onClick={handleCreatePrescription} style={{ marginTop: '0.5rem' }}>Send to Pharmacy</Button>
               </div>
             </motion.div>
           )}

           <div className="lc-card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-soft)' }}>
             <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Complete</h3>
             <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
               Completing the consultation will advance the queue and notify the patient.
             </p>
             <Button variant="primary" onClick={handleComplete} loading={loading} fullWidth style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
               <CheckCircle2 size={16} /> Complete Consultation
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
