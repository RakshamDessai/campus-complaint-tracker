import React from 'react';
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

export default function StatusBadge({ status }) {
  const configs = {
    'Open': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: Clock,
      dot: 'bg-amber-500'
    },
    'Assigned': {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: UserCheck,
      dot: 'bg-indigo-500'
    },
    'In-Progress': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: AlertCircle,
      dot: 'bg-blue-500'
    },
    'Resolved': {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      dot: 'bg-emerald-500'
    },
    'Escalated': {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: AlertTriangle,
      dot: 'bg-rose-500'
    }
  };

  const config = configs[status] || configs['Open'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`}></span>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}
