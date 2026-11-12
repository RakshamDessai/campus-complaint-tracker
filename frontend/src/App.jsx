import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ComplaintProvider } from './context/ComplaintContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages - All 22 Figma Frames Implemented
import WelcomeGateway from './pages/WelcomeGateway';                 // Frame 01
import StudentAuth from './pages/StudentAuth';                       // Frame 02
import StaffAdminAuth from './pages/StaffAdminAuth';                 // Frame 03
import StudentDashboard from './pages/StudentDashboard';             // Frame 04
import FileComplaint from './pages/FileComplaint';                   // Frame 05
import ComplaintSuccess from './pages/ComplaintSuccess';             // Frame 06
import MyComplaints from './pages/MyComplaints';                     // Frame 07
import ComplaintDetail from './pages/ComplaintDetail';               // Frame 08
import LiveStatusTimelinePage from './pages/LiveStatusTimelinePage'; // Frame 09
import StaffQueueDashboard from './pages/StaffQueueDashboard';       // Frame 10
import StaffTicketAction from './pages/StaffTicketAction';           // Frame 11 & 12
import StaffHistory from './pages/StaffHistory';                     // Frame 13
import WardenHostelDashboard from './pages/WardenHostelDashboard';   // Frame 14 & 15
import WardenEscalations from './pages/WardenEscalations';           // Frame 16 & 17
import WardenStaffWorkload from './pages/WardenStaffWorkload';       // Staff Workload
import AdminDashboard from './pages/AdminDashboard';                 // Frame 18
import AdminSlaConfig from './pages/AdminSlaConfig';                 // Frame 19
import AdminStaffRoster from './pages/AdminStaffRoster';             // Frame 20
import AdminAnalytics from './pages/AdminAnalytics';                 // Frame 21

export default function App() {
  const [currentRole, setCurrentRole] = useState('Student');

  return (
    <ComplaintProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        
        {/* Top Header Navbar with Frame 22 Notifications Drawer */}
        <Navbar currentRole={currentRole} onRoleChange={setCurrentRole} />

        <Routes>
          {/* Public Welcome & Authentication */}
          <Route path="/" element={<WelcomeGateway />} />
          <Route path="/login" element={<StudentAuth />} />
          <Route path="/staff-login" element={<StaffAdminAuth />} />

          {/* Student Workspace Layout */}
          <Route
            path="/student/*"
            element={
              <div className="flex flex-1">
                <Sidebar role="Student" />
                <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
                  <Routes>
                    <Route path="/" element={<StudentDashboard />} />
                    <Route path="/new" element={<FileComplaint />} />
                    <Route path="/success" element={<ComplaintSuccess />} />
                    <Route path="/complaints" element={<MyComplaints />} />
                    <Route path="/complaints/:id" element={<ComplaintDetail />} />
                    <Route path="/complaints/:id/timeline" element={<LiveStatusTimelinePage />} />
                    <Route path="*" element={<Navigate to="/student" replace />} />
                  </Routes>
                </main>
              </div>
            }
          />

          {/* Staff Workspace Layout */}
          <Route
            path="/staff/*"
            element={
              <div className="flex flex-1">
                <Sidebar role="Staff" />
                <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
                  <Routes>
                    <Route path="/" element={<StaffQueueDashboard />} />
                    <Route path="/ticket/:id" element={<StaffTicketAction />} />
                    <Route path="/history" element={<StaffHistory />} />
                    <Route path="*" element={<Navigate to="/staff" replace />} />
                  </Routes>
                </main>
              </div>
            }
          />

          {/* Warden Workspace Layout */}
          <Route
            path="/warden/*"
            element={
              <div className="flex flex-1">
                <Sidebar role="Warden" />
                <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
                  <Routes>
                    <Route path="/" element={<WardenHostelDashboard />} />
                    <Route path="/escalations" element={<WardenEscalations />} />
                    <Route path="/staff" element={<WardenStaffWorkload />} />
                    <Route path="*" element={<Navigate to="/warden" replace />} />
                  </Routes>
                </main>
              </div>
            }
          />

          {/* Admin Workspace Layout */}
          <Route
            path="/admin/*"
            element={
              <div className="flex flex-1">
                <Sidebar role="Admin" />
                <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/sla" element={<AdminSlaConfig />} />
                    <Route path="/roster" element={<AdminStaffRoster />} />
                    <Route path="/analytics" element={<AdminAnalytics />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Routes>
                </main>
              </div>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </div>
    </ComplaintProvider>
  );
}
