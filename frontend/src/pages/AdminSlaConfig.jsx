import React, { useState, useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import { getCategories } from '../lib/db';
import { apiRequest } from '../lib/api';
import { Settings, Clock, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminSlaConfig() {
  const { departments } = useComplaints();
  const { toast } = useToast();
  const [successMsg, setSuccessMsg] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // categoryId being saved

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (err) {
        toast.error('Failed to load categories.', { title: 'Data Load Error' });
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleChange = async (categoryId, val) => {
    setSaving(categoryId);
    try {
      // Update in Backend DB
      await apiRequest(`/categories/${categoryId}/sla`, 'PATCH', { sla_days: parseInt(val, 10) });

      // Update local state
      setCategories(prev =>
        prev.map(c =>
          (c.category_id || c.Category_ID) === categoryId
            ? { ...c, sla_days: parseInt(val, 10), SLA_Days: parseInt(val, 10) }
            : c
        )
      );

      const cat = categories.find(c => (c.category_id || c.Category_ID) === categoryId);
      toast.success(
        `SLA turnaround for "${cat?.category_name || cat?.Category_Name || categoryId}" set to ${val} Business Day(s). Database trigger [TRG_SLA_AUTO_ESCALATE] updated across departments.`,
        {
          title: `Institutional Policy Updated • ${categoryId}`,
          badge: 'Governance Policy'
        }
      );
      setSuccessMsg('SLA configuration saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      toast.error(`Failed to update SLA for ${categoryId}.`, { title: 'Update Failed' });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading SLA configurations…</p>
        </div>
      </div>
    );
  }

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
                const catId = cat.category_id || cat.Category_ID;
                const catName = cat.category_name || cat.Category_Name;
                const catDeptId = cat.dept_id || cat.Dept_ID;
                const catSlaDays = cat.sla_days ?? cat.SLA_Days ?? 3;
                const dept = departments.find(d => (d.dept_id || d.Dept_ID) === catDeptId);
                return (
                  <tr key={catId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {catId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {catName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {dept ? (dept.dept_name || dept.Dept_Name) : 'General Services'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={catSlaDays}
                          onChange={e => handleChange(catId, e.target.value)}
                          disabled={saving === catId}
                          className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
                        >
                          <option value="1">1 Day (Urgent)</option>
                          <option value="2">2 Days (Standard)</option>
                          <option value="3">3 Days (Normal)</option>
                          <option value="4">4 Days (Extended)</option>
                          <option value="7">7 Days (Weekly)</option>
                        </select>
                        {saving === catId && (
                          <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                      {catSlaDays * 24} Hours
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
