import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  complaints as initialComplaints, 
  complaintTimelines as initialTimelines,
  categories as initialCategories,
  departments,
  hostels,
  staffMembers as initialStaff,
  currentStudent
} from '../data/mockData';

const ComplaintContext = createContext();

export function ComplaintProvider({ children }) {
  // Complaints list
  const [complaintList, setComplaintList] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_complaints');
      return saved ? JSON.parse(saved) : initialComplaints;
    } catch {
      return initialComplaints;
    }
  });

  // Timelines dictionary
  const [timelines, setTimelines] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_timelines');
      return saved ? JSON.parse(saved) : initialTimelines;
    } catch {
      return initialTimelines;
    }
  });

  // Categories with SLA
  const [categoryList, setCategoryList] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_categories');
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  // Staff members
  const [staffList, setStaffList] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_staff');
      return saved ? JSON.parse(saved) : initialStaff;
    } catch {
      return initialStaff;
    }
  });

  // Feedbacks
  const [feedbacks, setFeedbacks] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_feedbacks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('campus_complaints', JSON.stringify(complaintList));
  }, [complaintList]);

  useEffect(() => {
    localStorage.setItem('campus_timelines', JSON.stringify(timelines));
  }, [timelines]);

  useEffect(() => {
    localStorage.setItem('campus_categories', JSON.stringify(categoryList));
  }, [categoryList]);

  useEffect(() => {
    localStorage.setItem('campus_staff', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('campus_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Current active user / role
  const [currentUser, setCurrentUser] = useState({
    role: 'Student',
    name: `${currentStudent.First_Name} ${currentStudent.Last_Name}`,
    rollNo: currentStudent.Student_ID,
    email: currentStudent.Email,
    hostel: currentStudent.Hostel_Name,
    room: currentStudent.Room_No
  });

  // Add a new complaint
  const addComplaint = ({ categoryId, title, description, location, priority, attachmentUrl }) => {
    const category = categoryList.find(c => c.Category_ID === categoryId) || categoryList[0];
    const ticketNum = Math.floor(100 + Math.random() * 900);
    const newId = `CMP-2026-${ticketNum}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    // SLA due calculation
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (category.SLA_Days || 2));
    const formattedDue = dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const newTicket = {
      Complaint_ID: newId,
      Title: title,
      Description: description,
      Category_ID: category.Category_ID,
      Category_Name: category.Category_Name,
      Dept_ID: category.Dept_ID,
      Student_ID: currentUser.rollNo || currentStudent.Student_ID,
      Student_Name: currentUser.name || `${currentStudent.First_Name} ${currentStudent.Last_Name}`,
      Hostel_ID: currentStudent.Hostel_ID,
      Room_No: location || currentStudent.Room_No,
      Status: 'Open',
      Priority: priority || 'Medium',
      Created_At: formattedDate,
      Updated_At: formattedDate,
      SLA_Due: formattedDue,
      Is_Escalated: false,
      Assigned_Staff: 'Pending Assignment',
      Assigned_Staff_ID: null,
      Attachment_Url: attachmentUrl || null
    };

    setComplaintList(prev => [newTicket, ...prev]);

    // Initial timeline
    setTimelines(prev => ({
      ...prev,
      [newId]: [
        {
          historyNum: 1,
          status: 'Open',
          timestamp: formattedDate,
          user: `${newTicket.Student_Name} (Student)`,
          note: `Grievance registered under ${category.Category_Name}. Awaiting staff assignment.`
        }
      ]
    }));

    return newTicket;
  };

  // Update status (e.g. from Staff action)
  const updateStatus = (complaintId, newStatus, note, staffName = 'Staff Technician') => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    setComplaintList(prev => prev.map(t => {
      if (t.Complaint_ID === complaintId) {
        return {
          ...t,
          Status: newStatus,
          Updated_At: formattedDate,
          Resolution_Note: newStatus === 'Resolved' ? (note || 'Issue inspected and fixed.') : t.Resolution_Note,
          Is_Escalated: newStatus === 'Escalated' ? true : t.Is_Escalated
        };
      }
      return t;
    }));

    setTimelines(prev => {
      const existing = prev[complaintId] || [];
      return {
        ...prev,
        [complaintId]: [
          ...existing,
          {
            historyNum: existing.length + 1,
            status: newStatus,
            timestamp: formattedDate,
            user: staffName,
            note: note || `Status transitioned to ${newStatus}.`
          }
        ]
      };
    });
  };

  // Assign staff to ticket (from Warden action)
  const assignStaffToTicket = (complaintId, staffId, wardenName = 'Warden Mahesh Bhandari') => {
    const staff = staffList.find(s => s.Staff_ID === staffId);
    if (!staff) return;

    const staffDisplayName = `${staff.First_Name} ${staff.Last_Name} (${staff.Designation})`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    setComplaintList(prev => prev.map(t => {
      if (t.Complaint_ID === complaintId) {
        return {
          ...t,
          Status: 'Assigned',
          Assigned_Staff: staffDisplayName,
          Assigned_Staff_ID: staff.Staff_ID,
          Updated_At: formattedDate
        };
      }
      return t;
    }));

    setTimelines(prev => {
      const existing = prev[complaintId] || [];
      return {
        ...prev,
        [complaintId]: [
          ...existing,
          {
            historyNum: existing.length + 1,
            status: 'Assigned',
            timestamp: formattedDate,
            user: wardenName,
            note: `Work order dispatched to ${staffDisplayName}.`
          }
        ]
      };
    });
  };

  // Submit student feedback for a resolved ticket
  const submitFeedback = (complaintId, rating, comments) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    setFeedbacks(prev => ({
      ...prev,
      [complaintId]: {
        rating,
        comments,
        submittedAt: formattedDate
      }
    }));

    setTimelines(prev => {
      const existing = prev[complaintId] || [];
      return {
        ...prev,
        [complaintId]: [
          ...existing,
          {
            historyNum: existing.length + 1,
            status: 'Resolved',
            timestamp: formattedDate,
            user: `${currentUser.name} (Student)`,
            note: `Student submitted ${rating}-Star satisfaction rating: "${comments || 'No comment provided'}"`
          }
        ]
      };
    });
  };

  // Update category SLA days (from Admin SLA Config)
  const updateCategorySla = (categoryId, newDays) => {
    setCategoryList(prev => prev.map(c => {
      if (c.Category_ID === categoryId) {
        return { ...c, SLA_Days: parseInt(newDays) || 1 };
      }
      return c;
    }));
  };

  // Toggle staff availability
  const toggleStaffAvailability = (staffId) => {
    setStaffList(prev => prev.map(s => {
      if (s.Staff_ID === staffId) {
        return { ...s, isAvailable: s.isAvailable !== false ? false : true };
      }
      return s;
    }));
  };

  return (
    <ComplaintContext.Provider value={{
      complaints: complaintList,
      timelines,
      categories: categoryList,
      departments,
      hostels,
      staffMembers: staffList,
      feedbacks,
      currentUser,
      setCurrentUser,
      addComplaint,
      updateStatus,
      assignStaffToTicket,
      submitFeedback,
      updateCategorySla,
      toggleStaffAvailability
    }}>
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
}
