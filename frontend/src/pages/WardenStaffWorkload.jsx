import React, { useState, useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { getStaffWorkload } from '../lib/db';
import { Users, Phone, Mail, CheckCircle2, AlertCircle, Wrench, Building } from 'lucide-react';

export default function WardenStaffWorkload() {
  const { staffMembers, complaints, departments, toggleStaffAvailability } = useComplaints();
  const [workloadData, setWorkloadData] = useState(null);
  const [workloadLoading, setWorkloadLoading] = useState(true);
  const [workloadError, setWorkloadError] = useState(null);

  useEffect(() => {
    async function fetchWorkload() {
      setWorkloadLoading(true);
      const { data, error } = await getStaffWorkload();
      if (error) {
        // Fallback: compute from complaints + staffMembers in context
        setWorkloadError(error.message);
      } else {
        setWorkloadData(data);
      }
      setWorkloadLoading(false);
    }
    fetchWorkload();
  }, []);

  // Maintenance staff only (from context, used for display)
  const technicians = staffMembers.filter(s => s.Role === 'Staff' || s.role === 'Staff');

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

      {workloadLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Staff Cards Grid */}
      {!workloadLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {technicians.map(staff => {
            const staffId = staff.Staff_ID || staff.staff_id;
            const dept = departments.find(d => d.Dept_ID === staff.Dept_ID || d.dept_id === staff.Dept_ID);

            // Use real workload data from db if available; fallback to context computation
            const workloadRow = workloadData?.find(w => w.staff_id === staffId);
            const activeOrders = workloadRow
              ? workloadRow.active_assignments
              : complaints.filter(
                  c => (c.Assigned_Staff_ID === staffId || c.assigned_staff_id === staffId)
                    && (c.Status === 'Assigned' || c.Status === 'In-Progress')
                ).length;
            const completedOrders = workloadRow
              ? workloadRow.resolved_total
              : complaints.filter(
                  c => (c.Assigned_Staff_ID === staffId || c.assigned_staff_id === staffId)
                    && c.Status === 'Resolved'
                ).length;

            const isAvailable = staff.isAvailable !== false;
            const firstName = staff.First_Name || staff.first_name || '';
            const lastName = staff.Last_Name || staff.last_name || '';
            const designation = staff.Designation || staff.designation || '';
            const email = staff.Email || staff.email || '';
            const deptName = dept?.Dept_Name || dept?.dept_name || workloadRow?.dept_name || 'General Maintenance';

            return (
              <div key={staffId} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{firstName} {lastName}</h3>
                      <p className="text-xs text-indigo-600 font-medium">{designation}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{deptName}</p>
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
                      <span className="text-lg font-bold text-blue-600">{activeOrders}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Resolved</span>
                      <span className="text-lg font-bold text-emerald-600">{completedOrders}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>+91 98765 432{String(staffId).slice(-2)}</span>
                    </div>
                  </div>
                </div>

                {/* Duty Toggle Button */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => toggleStaffAvailability(staffId)}
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
      )}

      {!workloadLoading && technicians.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          No staff members found. Staff data will appear here when loaded.
        </div>
      )}

    </div>
  );
}
