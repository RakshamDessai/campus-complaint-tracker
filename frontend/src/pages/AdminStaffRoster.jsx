import React from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import { Users, Mail, Phone, Building, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminStaffRoster() {
  const { staffMembers, departments, complaints, toggleStaffAvailability } = useComplaints();
  const { toast } = useToast();

  const handleToggle = (staff) => {
    toggleStaffAvailability(staff.Staff_ID);
    const newStatus = staff.isAvailable === false ? 'ON-DUTY' : 'OFF-DUTY';
    toast.info(
      `${staff.First_Name} ${staff.Last_Name} (${staff.Designation}) marked as ${newStatus}. Central automated dispatch algorithm synchronized.`,
      {
        title: `Roster Shift Updated: ${newStatus}`,
        badge: 'Staff Roster'
      }
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Campus Personnel &amp; Staff Roster</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete institutional directory of maintenance technicians, wardens, and administrative staff.
          </p>
        </div>
        <div className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200">
          <span>{staffMembers.length} Registered Staff Members</span>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Role &amp; Designation</th>
                <th className="py-3 px-4">Assigned Department</th>
                <th className="py-3 px-4">Active Tickets</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Status Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffMembers.map(staff => {
                const dept = departments.find(d => d.Dept_ID === staff.Dept_ID);
                const activeCount = complaints.filter(
                  c => c.Assigned_Staff_ID === staff.Staff_ID && (c.Status === 'Assigned' || c.Status === 'In-Progress')
                ).length;
                const isAvailable = staff.isAvailable !== false;

                return (
                  <tr key={staff.Staff_ID} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {staff.Staff_ID}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {staff.First_Name} {staff.Last_Name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{staff.Designation}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{staff.Role}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {dept ? dept.Dept_Name : 'General'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        activeCount > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {activeCount} active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="text-[11px]">{staff.Email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {staff.Role === 'Staff' ? (
                        <button
                          onClick={() => handleToggle(staff)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm ${
                            isAvailable 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200' 
                              : 'bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                          <span>{isAvailable ? 'On-Duty' : 'Off-Duty'}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Permanent</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
