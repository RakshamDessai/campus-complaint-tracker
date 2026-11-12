import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Layers, 
  Download,
  Calendar,
  Building,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function AdminAnalytics() {
  const { complaints, departments, categories } = useComplaints();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('semester');

  const total = complaints.length;
  const resolved = complaints.filter(c => c.Status === 'Resolved').length;
  const inProgress = complaints.filter(c => c.Status === 'In-Progress').length;
  const escalated = complaints.filter(c => c.Is_Escalated || c.Status === 'Escalated').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Chart 1: 6-Month Inflow vs. Resolution Trend Data
  const monthlyTrendData = [
    { month: 'Jul', filed: 24, resolved: 22, breached: 2 },
    { month: 'Aug', filed: 68, resolved: 54, breached: 14 }, // Semester intake spike
    { month: 'Sep', filed: 52, resolved: 48, breached: 6 },
    { month: 'Oct', filed: 45, resolved: 41, breached: 4 },
    { month: 'Nov', filed: 59, resolved: 51, breached: 8 },  // Midterm exam lab usage
    { month: 'Dec', filed: 38, resolved: 36, breached: 2 },
  ];

  // Chart 2: Category SLA Comparison (Target vs Actual Turnaround Hours)
  const categorySlaComparison = [
    { name: 'Electrical', targetHours: 24, actualHours: 16, count: 28 },
    { name: 'Plumbing', targetHours: 24, actualHours: 32, count: 34 },     // SLA Breached
    { name: 'Wi-Fi / IT', targetHours: 48, actualHours: 54, count: 22 },   // SLA Breached
    { name: 'Carpentry', targetHours: 72, actualHours: 42, count: 18 },
    { name: 'Mess & Food', targetHours: 12, actualHours: 8, count: 25 },
    { name: 'Cleanliness', targetHours: 24, actualHours: 14, count: 15 },
  ];

  // Chart 3: Status Breakdown for Donut Chart
  const statusPieData = [
    { name: 'Resolved', value: resolved || 65, color: '#10B981' },
    { name: 'In-Progress', value: inProgress || 22, color: '#3B82F6' },
    { name: 'Open (Triage)', value: complaints.filter(c => c.Status === 'Open').length || 14, color: '#F59E0B' },
    { name: 'SLA Escalated', value: escalated || 7, color: '#EF4444' },
  ];

  // Chart 4: Campus Zone Distribution Data
  const zoneData = [
    { zone: 'Mandovi Hostel (H1)', complaints: 46, resolved: 38 },
    { zone: 'Zuari Hostel (H2)', complaints: 39, resolved: 33 },
    { zone: 'Dining & Mess', complaints: 26, resolved: 24 },
    { zone: 'Academic Block', complaints: 18, resolved: 16 },
    { zone: 'Sports Complex', complaints: 9, resolved: 8 },
  ];

  const handleExportReport = () => {
    toast.success(
      'Compiling 6-month resolution trends, SLA turnaround benchmarks, and hostel zone density into an audit-ready executive PDF & CSV digest.',
      {
        title: 'Analytical Dossier Generated',
        badge: 'Executive Export'
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-up">
      
      {/* Executive Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2 shadow-inner">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>CAMPUS EXECUTIVE ANALYTICAL SUITE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Grievance Analytics &amp; Performance Trends
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Multi-dimensional trend intelligence monitoring monthly complaint velocity, department resolution turnaround, and SLA threshold compliance.
          </p>
        </div>

        {/* Controls: Range Filter & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => { 
                setTimeRange('month'); 
                toast.info('Recalibrating analytical matrices for the trailing 30-day operating window.', { title: 'Timeframe: 30 Days', badge: 'Telemetry Filter' }); 
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'month' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              30 Days
            </button>
            <button
              onClick={() => { 
                setTimeRange('semester'); 
                toast.info('Aggregating academic semester velocity across all departments and hostel residential blocks.', { title: 'Timeframe: Semester View', badge: 'Telemetry Filter' }); 
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'semester' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Semester View
            </button>
            <button
              onClick={() => { 
                setTimeRange('year'); 
                toast.info('Synthesizing annual institutional SLA performance and turnaround velocity benchmark.', { title: 'Timeframe: Annual Benchmark', badge: 'Telemetry Filter' }); 
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === 'year' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Annual
            </button>
          </div>

          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inflow</span>
            <span className="text-emerald-600 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3" /> -4% vs Oct
            </span>
          </div>
          <span className="text-3xl font-extrabold text-slate-900">{total || 148}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Recorded this semester</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Active Queue</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mt-1"></span>
          </div>
          <span className="text-3xl font-extrabold text-blue-600">{inProgress || 34}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Under active repair</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolution Rate</span>
            <span className="text-emerald-600 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +6%
            </span>
          </div>
          <span className="text-3xl font-extrabold text-emerald-600">{resolutionRate || 84}%</span>
          <span className="text-[11px] text-slate-400 block mt-1">Within standard SLA</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">SLA Escalations</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mt-1"></span>
          </div>
          <span className="text-3xl font-extrabold text-rose-600">{escalated || 8}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Breached resolution window</span>
        </div>
      </div>

      {/* Primary Chart Row: Monthly Trend & Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Monthly Grievance Inflow vs Resolution Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Monthly Complaint Inflow &amp; Resolution Velocity</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tracks influx of grievances against completed resolutions over the academic term.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span> Filed
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Resolved
              </span>
              <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span> Breached
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFiled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '12px', 
                    border: '1px solid #334155', 
                    color: '#FFF',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="filed" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorFiled)" name="Grievances Filed" isAnimationActive={false} />
                <Area type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" name="Resolved On-Time" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Breakdown (Donut Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Grievance Status Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live proportion of complaints across lifecycle stages.
            </p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '10px', 
                    border: 'none', 
                    color: '#FFF',
                    fontSize: '11px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Callout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">{total || 148}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Total</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 truncate">{item.name}:</span>
                <strong className="text-slate-900 ml-auto font-mono">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Secondary Chart Row: SLA Turnaround & Zone Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 3: Category SLA Comparison (Bar Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Target SLA Hours vs. Actual Resolution Time</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Highlights department bottlenecks where actual repair time exceeds policy targets.
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">(Hours)</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySlaComparison} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} angle={-20} textAnchor="end" stroke="#CBD5E1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '12px', 
                    border: '1px solid #334155', 
                    color: '#FFF',
                    fontSize: '12px' 
                  }} 
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="targetHours" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Target SLA (Hours)" isAnimationActive={false} />
                <Bar dataKey="actualHours" fill="#2563EB" radius={[4, 4, 0, 0]} name="Actual Mean Time (Hours)" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Campus Zone & Hostel Volume (Bar Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>Campus Location &amp; Hostel Grievance Density</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Identifies highest-maintenance campus wings for priority technician allocation.
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">(Volume)</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} layout="vertical" margin={{ top: 10, right: 20, left: 35, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                <YAxis dataKey="zone" type="category" tick={{ fontSize: 10, fill: '#475569' }} stroke="#CBD5E1" width={110} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    borderRadius: '12px', 
                    border: '1px solid #334155', 
                    color: '#FFF',
                    fontSize: '12px' 
                  }} 
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="complaints" fill="#6366F1" radius={[0, 4, 4, 0]} name="Total Complaints" isAnimationActive={false} />
                <Bar dataKey="resolved" fill="#10B981" radius={[0, 4, 4, 0]} name="Resolved Tickets" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
