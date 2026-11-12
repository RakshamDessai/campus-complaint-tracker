// Realistic mock data strictly aligned with our 3NF Relational Database Schema

export const departments = [
  { Dept_ID: 'D101', Dept_Name: 'Estate & Infrastructure Maintenance', Dept_Head: 'Dr. Suresh Varma' },
  { Dept_ID: 'D102', Dept_Name: 'Hostel Affairs & Student Residence', Dept_Head: 'Prof. Ramesh Naik' },
  { Dept_ID: 'D103', Dept_Name: 'Campus IT & Network Systems', Dept_Head: 'Er. Ananya Sen' },
  { Dept_ID: 'D104', Dept_Name: 'Dining & Mess Quality Control', Dept_Head: 'Mr. Pradeep Joshi' }
];

export const categories = [
  { Category_ID: 'CAT-01', Category_Name: 'Hostel Room & Furniture', Dept_ID: 'D102', SLA_Days: 2 },
  { Category_ID: 'CAT-02', Category_Name: 'Electrical & Power Supply', Dept_ID: 'D101', SLA_Days: 1 },
  { Category_ID: 'CAT-03', Category_Name: 'Plumbing & Water Sanitation', Dept_ID: 'D101', SLA_Days: 1 },
  { Category_ID: 'CAT-04', Category_Name: 'Mess Food & Hygiene', Dept_ID: 'D104', SLA_Days: 1 },
  { Category_ID: 'CAT-05', Category_Name: 'Campus Wi-Fi & LAN Network', Dept_ID: 'D103', SLA_Days: 3 },
  { Category_ID: 'CAT-06', Category_Name: 'Classroom & Lab Facilities', Dept_ID: 'D101', SLA_Days: 4 }
];

export const hostels = [
  { Hostel_ID: 'H1', Hostel_Name: 'Mandovi Hostel (Boys Block A)', Warden_ID: 'STF-01', Capacity: 320 },
  { Hostel_ID: 'H2', Hostel_Name: 'Zuari Hostel (Boys Block B)', Warden_ID: 'STF-02', Capacity: 280 },
  { Hostel_ID: 'H3', Hostel_Name: 'Netravati Hostel (Girls Block)', Warden_ID: 'STF-03', Capacity: 300 }
];

export const staffMembers = [
  { Staff_ID: 'STF-01', First_Name: 'Mahesh', Last_Name: 'Bhandari', Designation: 'Chief Warden & Officer', Email: 'warden.mandovi@campus.edu', Dept_ID: 'D102', Role: 'Warden' },
  { Staff_ID: 'STF-02', First_Name: 'Sunil', Last_Name: 'Kamat', Designation: 'Hostel Warden', Email: 'warden.zuari@campus.edu', Dept_ID: 'D102', Role: 'Warden' },
  { Staff_ID: 'STF-03', First_Name: 'Pooja', Last_Name: 'Deshmukh', Designation: 'Hostel Warden', Email: 'warden.netravati@campus.edu', Dept_ID: 'D102', Role: 'Warden' },
  { Staff_ID: 'STF-11', First_Name: 'Vinod', Last_Name: 'Sawant', Designation: 'Senior Electrician', Email: 'vinod.sawant@campus.edu', Dept_ID: 'D101', Role: 'Staff' },
  { Staff_ID: 'STF-12', First_Name: 'Kailash', Last_Name: 'Prasad', Designation: 'Plumbing Lead', Email: 'kailash.p@campus.edu', Dept_ID: 'D101', Role: 'Staff' },
  { Staff_ID: 'STF-13', First_Name: 'Gaurav', Last_Name: 'Nair', Designation: 'Network Engineer', Email: 'gaurav.nair@campus.edu', Dept_ID: 'D103', Role: 'Staff' },
  { Staff_ID: 'ADM-01', First_Name: 'Dr. Anita', Last_Name: 'Roy', Designation: 'Chief Campus Administrator', Email: 'admin.director@campus.edu', Dept_ID: 'D101', Role: 'Admin' }
];

export const currentStudent = {
  Student_ID: 'STU-2026-042',
  First_Name: 'Aarav',
  Last_Name: 'Deshmukh',
  Email: 'aarav.deshmukh@campus.edu',
  Hostel_ID: 'H1',
  Hostel_Name: 'Mandovi Hostel (Boys Block A)',
  Room_No: 'B-204',
  Phone_Numbers: ['+91 98765 43210', '+91 87654 32109'],
  Total_Complaints_Filed: 4
};

export const complaints = [
  {
    Complaint_ID: 'CMP-2026-081',
    Title: 'Water leakage and low pressure in bathroom faucet',
    Description: 'The bathroom faucet in room B-204 has persistent dripping and very low pressure during morning hours.',
    Category_ID: 'CAT-03',
    Category_Name: 'Plumbing & Water Sanitation',
    Dept_ID: 'D101',
    Student_ID: 'STU-2026-042',
    Student_Name: 'Aarav Deshmukh',
    Hostel_ID: 'H1',
    Room_No: 'B-204',
    Status: 'In-Progress',
    Priority: 'High',
    Created_At: '2026-11-05 09:30 AM',
    Updated_At: '2026-11-06 02:15 PM',
    SLA_Due: '2026-11-06 09:30 AM',
    Is_Escalated: false,
    Assigned_Staff: 'Kailash Prasad (Plumbing Lead)',
    Assigned_Staff_ID: 'STF-12'
  },
  {
    Complaint_ID: 'CMP-2026-084',
    Title: 'Study table light fixture sparks when switched on',
    Description: 'The electrical socket near bed 2 sparks intermittently whenever the switch is toggled. Poses an electric shock risk.',
    Category_ID: 'CAT-02',
    Category_Name: 'Electrical & Power Supply',
    Dept_ID: 'D101',
    Student_ID: 'STU-2026-042',
    Student_Name: 'Aarav Deshmukh',
    Hostel_ID: 'H1',
    Room_No: 'B-204',
    Status: 'Assigned',
    Priority: 'Critical',
    Created_At: '2026-11-06 11:00 AM',
    Updated_At: '2026-11-06 01:20 PM',
    SLA_Due: '2026-11-07 11:00 AM',
    Is_Escalated: false,
    Assigned_Staff: 'Vinod Sawant (Senior Electrician)',
    Assigned_Staff_ID: 'STF-11'
  },
  {
    Complaint_ID: 'CMP-2026-072',
    Title: 'Wi-Fi Access Point frequent disconnects on 2nd floor',
    Description: 'Students on 2nd floor block A experiencing signal drops every 10 minutes during evening study hours.',
    Category_ID: 'CAT-05',
    Category_Name: 'Campus Wi-Fi & LAN Network',
    Dept_ID: 'D103',
    Student_ID: 'STU-2026-042',
    Student_Name: 'Aarav Deshmukh',
    Hostel_ID: 'H1',
    Room_No: 'B-204',
    Status: 'Escalated',
    Priority: 'Medium',
    Created_At: '2026-11-01 10:15 AM',
    Updated_At: '2026-11-05 08:00 AM',
    SLA_Due: '2026-11-04 10:15 AM',
    Is_Escalated: true,
    Assigned_Staff: 'Gaurav Nair (Network Engineer)',
    Assigned_Staff_ID: 'STF-13'
  },
  {
    Complaint_ID: 'CMP-2026-061',
    Title: 'Ceiling fan regulator replacement',
    Description: 'Ceiling fan was running only at speed 5. Regulator replaced and speed control verified.',
    Category_ID: 'CAT-02',
    Category_Name: 'Electrical & Power Supply',
    Dept_ID: 'D101',
    Student_ID: 'STU-2026-042',
    Student_Name: 'Aarav Deshmukh',
    Hostel_ID: 'H1',
    Room_No: 'B-204',
    Status: 'Resolved',
    Priority: 'Low',
    Created_At: '2026-10-25 04:00 PM',
    Updated_At: '2026-10-26 11:30 AM',
    SLA_Due: '2026-10-26 04:00 PM',
    Is_Escalated: false,
    Assigned_Staff: 'Vinod Sawant (Senior Electrician)',
    Assigned_Staff_ID: 'STF-11',
    Resolution_Note: 'Replaced rotary regulator with genuine Anchor modular switch. Tested operational.'
  },
  {
    Complaint_ID: 'CMP-2026-089',
    Title: 'Undercooked evening dinner mess meals',
    Description: 'Mess hall served undercooked rice and lentils on Friday evening. Multiple students reported stomach distress.',
    Category_ID: 'CAT-04',
    Category_Name: 'Mess Food & Hygiene',
    Dept_ID: 'D104',
    Student_ID: 'STU-2026-088',
    Student_Name: 'Rohan Mehta',
    Hostel_ID: 'H2',
    Room_No: 'A-108',
    Status: 'Open',
    Priority: 'High',
    Created_At: '2026-11-07 08:30 AM',
    Updated_At: '2026-11-07 08:30 AM',
    SLA_Due: '2026-11-08 08:30 AM',
    Is_Escalated: false,
    Assigned_Staff: 'Unassigned',
    Assigned_Staff_ID: null
  }
];

export const complaintTimelines = {
  'CMP-2026-081': [
    { historyNum: 1, status: 'Open', timestamp: '2026-11-05 09:30 AM', user: 'Aarav Deshmukh (Student)', note: 'Complaint lodged online through Student Portal.' },
    { historyNum: 2, status: 'Assigned', timestamp: '2026-11-05 11:15 AM', user: 'Warden Mahesh Bhandari', note: 'Assigned to Estate Plumber Kailash Prasad.' },
    { historyNum: 3, status: 'In-Progress', timestamp: '2026-11-06 02:15 PM', user: 'Kailash Prasad (Plumber)', note: 'Inspected valve; replacement spindle dispatched from warehouse.' }
  ],
  'CMP-2026-072': [
    { historyNum: 1, status: 'Open', timestamp: '2026-11-01 10:15 AM', user: 'Aarav Deshmukh (Student)', note: 'Wi-Fi AP disconnections reported.' },
    { historyNum: 2, status: 'Assigned', timestamp: '2026-11-02 09:00 AM', user: 'System Auto-Router', note: 'Assigned to Network Engineer Gaurav Nair.' },
    { historyNum: 3, status: 'Escalated', timestamp: '2026-11-05 08:00 AM', user: 'Database Trigger [TRG_SLA_AUTO_ESCALATE]', note: 'SLA deadline exceeded 72 hours without resolution. Auto-escalated to Chief Admin.' }
  ]
};
