import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ComplaintProvider } from './context/ComplaintContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages
import WelcomeGateway from './pages/WelcomeGateway';
import StudentAuth from './pages/StudentAuth';
import StaffAdminAuth from './pages/StaffAdminAuth';
import StudentDashboard from './pages/StudentDashboard';
import FileComplaint from './pages/FileComplaint';
import ComplaintSuccess from './pages/ComplaintSuccess';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetail from './pages/ComplaintDetail';
import StaffQueueDashboard from './pages/StaffQueueDashboard';
import StaffHistory from './pages/StaffHistory';
import WardenHostelDashboard from './pages/WardenHostelDashboard';
import WardenEscalations from './pages/WardenEscalations';
import WardenStaffWorkload from './pages/WardenStaffWorkload';
import AdminDashboard from './pages/AdminDashboard';
import AdminSlaConfig from './pages/AdminSlaConfig';
import AdminStaffRoster from './pages/AdminStaffRoster';
import AdminAnalytics from './pages/AdminAnalytics';

export default function App() {
  const [currentRole, setCurrentRole] = useState('Student');

  return (
    <ComplaintProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        
        {/* Top Header Navbar */}
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
