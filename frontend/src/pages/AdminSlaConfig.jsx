import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import { Settings, Clock, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminSlaConfig() {
  const { categories, departments, updateCategorySla } = useComplaints();
  const { toast } = useToast();
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (categoryId, val) => {
    updateCategorySla(categoryId, val);
    const cat = categories.find(c => c.Category_ID === categoryId);
    toast.success(
      `SLA turnaround for "${cat?.Category_Name || categoryId}" set to ${val} Business Day(s). Database trigger [TRG_SLA_AUTO_ESCALATE] updated across departments.`,
      {
        title: `Institutional Policy Updated • ${categoryId}`,
        badge: 'Governance Policy'
      }
    );
    setSuccessMsg('SLA configuration saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>Department SLA Threshold Configuration</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure expected resolution turnaround days for each grievance category across campus departments.
          </p>
        </div>

        {successMsg && (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMsg}
          </span>
        )}
      </div>

      {/* SLA Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Active Category SLA Rules
          </span>
          <span className="text-xs text-slate-500">
            {categories.length} Categories Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Category Code</th>
                <th className="py-3 px-4">Grievance Category</th>
                <th className="py-3 px-4">Jurisdiction Department</th>
                <th className="py-3 px-4">SLA Deadline (Days)</th>
                <th className="py-3 px-4 text-right">Target Turnaround</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(cat => {
                const dept = departments.find(d => d.Dept_ID === cat.Dept_ID);
                return (
                  <tr key={cat.Category_ID} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {cat.Category_ID}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {cat.Category_Name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {dept ? dept.Dept_Name : 'General Services'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={cat.SLA_Days}
                          onChange={e => handleChange(cat.Category_ID, e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="1">1 Day (Urgent)</option>
                          <option value="2">2 Days (Standard)</option>
                          <option value="3">3 Days (Normal)</option>
                          <option value="4">4 Days (Extended)</option>
                          <option value="7">7 Days (Weekly)</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                      {cat.SLA_Days * 24} Hours
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
