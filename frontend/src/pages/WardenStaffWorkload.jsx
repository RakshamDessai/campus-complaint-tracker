import React from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import { Users, Phone, Mail, CheckCircle2, AlertCircle, Wrench, Building } from 'lucide-react';

export default function WardenStaffWorkload() {
  const { staffMembers, complaints, departments, toggleStaffAvailability } = useComplaints();
  const { toast } = useToast();

  const handleToggle = (staff, isAvailable) => {
    toggleStaffAvailability(staff.Staff_ID);
    const nextState = isAvailable ? 'OFF-DUTY' : 'AVAILABLE (ON-DUTY)';
    toast.info(
      `${staff.First_Name} ${staff.Last_Name} (${staff.Designation}) is now marked as ${nextState}. Warden dispatch matrix updated.`,
      {
        title: `Roster Updated: ${nextState}`,
        badge: 'Staff Availability'
      }
    );
  };

  // Maintenance staff only
  const technicians = staffMembers.filter(s => s.Role === 'Staff');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Campus Maintenance Staff Roster &amp; Workload</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status of technicians, current active work orders, and duty shifts.
          </p>
        </div>
        <div className="text-xs bg-indigo-50 text-indigo-800 font-semibold px-3 py-1.5 rounded-lg border border-indigo-200">
          <span>{technicians.length} Active Technicians On Duty</span>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {technicians.map(staff => {
          const dept = departments.find(d => d.Dept_ID === staff.Dept_ID);
          const activeOrders = complaints.filter(
            c => c.Assigned_Staff_ID === staff.Staff_ID && (c.Status === 'Assigned' || c.Status === 'In-Progress')
          );
          const completedOrders = complaints.filter(
            c => c.Assigned_Staff_ID === staff.Staff_ID && c.Status === 'Resolved'
          );
          const isAvailable = staff.isAvailable !== false;

          return (
            <div key={staff.Staff_ID} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{staff.First_Name} {staff.Last_Name}</h3>
                    <p className="text-xs text-indigo-600 font-medium">{staff.Designation}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{dept ? dept.Dept_Name : 'General Maintenance'}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {isAvailable ? '● Available' : '○ Off Duty'}
                  </span>
                </div>

                {/* Workload Stats */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-center mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Active Tasks</span>
                    <span className="text-lg font-bold text-blue-600">{activeOrders.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Resolved</span>
                    <span className="text-lg font-bold text-emerald-600">{completedOrders.length}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{staff.Email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91 98765 432{staff.Staff_ID.slice(-2)}</span>
                  </div>
                </div>
              </div>

              {/* Duty Toggle Button */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleToggle(staff, isAvailable)}
                  className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isAvailable 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isAvailable ? 'Mark as Off-Duty' : 'Set as Available'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
