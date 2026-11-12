import React from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { BarChart3, TrendingUp, CheckCircle, Clock, AlertTriangle, Layers } from 'lucide-react';

export default function AdminAnalytics() {
  const { complaints, departments, categories } = useComplaints();

  const total = complaints.length;
  const resolved = complaints.filter(c => c.Status === 'Resolved').length;
  const inProgress = complaints.filter(c => c.Status === 'In-Progress').length;
  const escalated = complaints.filter(c => c.Is_Escalated || c.Status === 'Escalated').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Campus Grievance Analytical Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Category trends, department efficiency metrics, and SLA compliance statistics.
          </p>
        </div>
        <div className="text-xs bg-blue-50 text-blue-800 font-semibold px-3 py-1.5 rounded-lg border border-blue-200">
          <span>Overall Resolution Rate: {resolutionRate}%</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Total Grievances</span>
          <span className="text-3xl font-extrabold text-slate-900">{total}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Recorded this semester</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-blue-600 uppercase block mb-1">Active Repair Queue</span>
          <span className="text-3xl font-extrabold text-blue-600">{inProgress}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Technicians dispatched</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600 uppercase block mb-1">Resolved Successfully</span>
          <span className="text-3xl font-extrabold text-emerald-600">{resolved}</span>
          <span className="text-[11px] text-slate-400 block mt-1">{resolutionRate}% resolution efficiency</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-rose-600 uppercase block mb-1">Escalated Tickets</span>
          <span className="text-3xl font-extrabold text-rose-600">{escalated}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Exceeded standard SLA</span>
        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Grievance Distribution by Category</h3>
        
        <div className="space-y-3">
          {categories.map(cat => {
            const count = complaints.filter(c => c.Category_ID === cat.Category_ID).length;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;

            return (
              <div key={cat.Category_ID}>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-700">{cat.Category_Name}</span>
                  <span className="text-slate-500 font-semibold">{count} tickets ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 5)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department Efficiency Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Department Performance &amp; On-Time Completion</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map(dept => {
            const deptComplaints = complaints.filter(c => c.Dept_ID === dept.Dept_ID);
            const deptResolved = deptComplaints.filter(c => c.Status === 'Resolved');
            const rate = deptComplaints.length > 0 ? Math.round((deptResolved.length / deptComplaints.length) * 100) : 100;

            return (
              <div key={dept.Dept_ID} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{dept.Dept_Name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Head: {dept.Dept_Head}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{deptComplaints.length} Total Complaints</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-blue-600">{rate}%</span>
                  <span className="block text-[10px] text-slate-500 font-medium">On-Time Rate</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
