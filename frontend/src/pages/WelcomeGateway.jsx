import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CampusLogo from '../components/common/CampusLogo';
import { useToast } from '../context/ToastContext';
import { 
  ArrowRight, 
  User, 
  Building2, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      damping: 20, 
      stiffness: 260 
    }
  }
};

export default function WelcomeGateway() {
  const { toast } = useToast();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">
      
      {/* Hero Banner with Ambient Glowing Orbs */}
      <section className="bg-slate-900 text-white relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        
        {/* Animated Background Glow Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-float-slow" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Official Animated Logo Emblem */}
          <div className="flex justify-center mb-5">
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 220 }}
            >
              <CampusLogo size="xl" showText={false} />
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-400/40 text-blue-300 text-xs font-semibold mb-6 shadow-inner"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="tracking-wide uppercase">CAMPUS GRIEVANCE PORTAL</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-5 leading-tight"
          >
            Campus Complaint &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">Grievance Tracker</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg mb-8 leading-relaxed font-normal"
          >
            A single unified campus system to lodge, monitor, and resolve student complaints across Hostel, Mess, Infrastructure, Electrical, Plumbing, and Wi-Fi.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 text-xs font-medium text-slate-300"
          >
            <span className="bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/80 flex items-center gap-2 shadow-sm hover:border-slate-600 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fast SLA Resolution
            </span>
            <span className="bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/80 flex items-center gap-2 shadow-sm hover:border-slate-600 transition-colors">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Real-Time Live Status Tracking
            </span>
            <span className="bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/80 flex items-center gap-2 shadow-sm hover:border-slate-600 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Transparent Escalation System
            </span>
          </motion.div>
        </div>
      </section>

      {/* 3 Dedicated Role Cards with Staggered Entrance & Interactive Hover Lift */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-16 relative z-20 w-full">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >

          {/* Card 1: Student Portal */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200/90 p-7 flex flex-col justify-between hover:shadow-2xl hover:border-blue-300 transition-all group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 border border-blue-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <User className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                  Student Services
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Student Portal</h3>
              <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">
                Lodge complaints for hostel rooms, electricity, plumbing, Wi-Fi, or mess food. Track real-time progress until resolved.
              </p>
              <ul className="text-xs text-slate-500 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✔</span> Instant Ticket ID generation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✔</span> Live milestone timeline &amp; audit trail
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✔</span> Feedback &amp; resolution rating
                </li>
              </ul>
            </div>
            <Link
              to="/student"
              onClick={() => toast.info('Accessing Student Resident Portal. Lodging, tracking, and feedback desk.', { title: 'Opening Student Portal', badge: 'Student Desk' })}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md group-hover:shadow-blue-500/25 active:scale-95"
            >
              <span>Enter Student Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Card 2: Staff & Warden Portal */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200/90 p-7 flex flex-col justify-between hover:shadow-2xl hover:border-indigo-300 transition-all group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 border border-indigo-100 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Wrench className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                  Maintenance Operations
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Staff &amp; Warden Desk</h3>
              <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">
                View assigned work orders, update repair progress, add resolution notes, and monitor hostel-wide grievances.
              </p>
              <ul className="text-xs text-slate-500 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500 font-bold">✔</span> Assigned technician work orders
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500 font-bold">✔</span> Progress updates &amp; resolution modal
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-500 font-bold">✔</span> Staff re-assignment by hostel warden
                </li>
              </ul>
            </div>
            <Link
              to="/staff"
              onClick={() => toast.info('Accessing Maintenance Operations Desk. Diagnostic queues and active work orders.', { title: 'Opening Staff Desk', badge: 'Technician Ops' })}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md active:scale-95"
            >
              <span>Enter Staff Desk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Card 3: Administration */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200/90 p-7 flex flex-col justify-between hover:shadow-2xl hover:border-slate-400 transition-all group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-6 border border-slate-200 group-hover:scale-110 group-hover:bg-slate-800 group-hover:text-white transition-all duration-300 shadow-sm">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                  Campus Governance
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Campus Administration</h3>
              <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">
                Campus-wide complaint trends, department performance monitoring, average resolution times, and staff roster management.
              </p>
              <ul className="text-xs text-slate-500 space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-slate-600 font-bold">✔</span> Department-wise complaint counts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-slate-600 font-bold">✔</span> SLA target editor &amp; escalation rule
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-slate-600 font-bold">✔</span> Real-time staff roster &amp; duty toggle
                </li>
              </ul>
            </div>
            <Link
              to="/admin"
              onClick={() => toast.info('Accessing Central Administration & Executive Analytics Suite.', { title: 'Opening Admin Portal', badge: 'Governance' })}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-md active:scale-95"
            >
              <span>Enter Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

        </motion.div>
      </section>

      {/* Footer Info */}
      <footer className="mt-auto border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700 mb-1">
          Campus Complaint &amp; Grievance Tracker
        </p>
        <p>&copy; {new Date().getFullYear()} Campus Maintenance &amp; Student Welfare Administration. All rights reserved.</p>
      </footer>
    </div>
  );
}
