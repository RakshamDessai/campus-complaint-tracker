# Campus Complaint & Grievance Tracker

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%206-61DAFB?logo=react&logoColor=black)](frontend/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%203.4-38B2AC?logo=tailwind-css&logoColor=white)](frontend/)
[![Schema](https://img.shields.io/badge/Schema-3NF%20Relational-blue)](docs/Phase3_Normalization.pdf)
[![Wireframes](https://img.shields.io/badge/Figma%20Wireframes-22%20Screens-blueviolet)](figma_wireframes/)

> **Database Management Systems (DBMS) Mini-Project**  
> A multi-department campus grievance and complaint lifecycle management system for university students, hostel wardens, maintenance staff, and administration.

---

## 👥 Team Members

| Member | Student Name | Roll No. | Email |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Chirag Nikant Simepurushkar** | 24B-CO-015 | simepurushkarchirag84@gmail.com |
| **Member 2** | **Raksham R. Dessai** | 24B-CO-019 | rakshamdessai2006@gmail.com |
| **Member 3** | **Aayushi Rajesh Prabhu** | 24B-CO-001 | aayushiprabhu99@gmail.com |

---

## 🌿 Git Branches

* **`main`**: Evaluated submission deliverables, project documentation, ER diagrams, and presentation slides.
* **`develop`**: Shared integration branch for team features.
* **`frontend`**: Frontend web application workspace (React, Vite, Tailwind CSS).
* **`backend`**: Dedicated workspace for backend and database development.

---

## 📁 Repository Directory Structure

```plaintext
campus-complaint-tracker/
├── docs/                                # Official Academic Submission Deliverables
│   ├── main Project_Synopsis.pdf         # Project abstract, problem definition & scope
│   ├── main Requirement_Analysis_DBMS.pdf# Functional & Non-Functional Requirements
│   ├── main ER_Document.pdf             # Comprehensive ER modeling & entity dictionary
│   ├── main_ER_Document.docx            # Editable Word report source
│   ├── Phase2_ER_Modeling.pdf           # Phase 2 Entity-Relationship diagrams
│   ├── Phase3_Normalization.pdf         # Phase 3 Relational mapping & 3NF validation
│   ├── Campus_Complaint_Tracker.pptx    # Official team defense presentation slides
│   └── Complete_Execution_Plan.pdf      # Timeline, sprint breakdown & deliverables
├── figma_wireframes/                    # 22 High-Fidelity SVG Wireframes (Screens 01 - 22)
│   ├── 01_Welcome_Gateway.svg           # Public gateway & portal selector
│   ├── 02_Student_Login_Register.svg    # Student registration & authentication
│   ├── 04_Student_Dashboard.svg         # Student analytics & recent grievances
│   ├── 05_File_New_Complaint.svg        # Multipart grievance filing form with auto-routing
│   ├── 08_Complaint_Detail_View.svg     # Audit log & resolution details
│   ├── 09_Live_Status_Timeline.svg      # SLA progress tracker with timestamps
│   ├── 10_Staff_Queue_Dashboard.svg     # Maintenance staff ticket queue
│   ├── 14_Warden_Hostel_Dashboard.svg   # Hostel warden escalation & staff assignment
│   └── 18_Admin_Executive_Dashboard.svg # Institutional executive analytics & SLA matrix
├── images/                              # Relational & Conceptual Diagrams
│   ├── main_er_diagram.svg              # Scalable vector Chen & Crow's foot ER diagrams
│   └── er diagram.jpeg                  # High-resolution raster diagram
└── frontend/                            # React 18 + Vite SPA (Raksham's Workspace)
    ├── src/
    │   ├── components/common/           # Navbar, Sidebar, StatusBadge
    │   ├── pages/                       # Role-specific view components
    │   ├── data/mockData.js             # Relational mock state
    │   ├── App.jsx                      # Client routing & layout shells
    │   └── main.jsx                     # Application entry point
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Running the Frontend Locally

```bash
# Clone the repository
git clone https://github.com/RakshamDessai/campus-complaint-tracker.git
cd campus-complaint-tracker

# Switch to the frontend branch
git checkout frontend

# Navigate to frontend folder and install dependencies
cd frontend
npm install

# Start Vite live development server
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 📄 Academic Attribution
This project was developed for academic evaluation in the **Department of Computer Engineering**.  
All rights reserved © 2026 Chirag Simepurushkar, Raksham Dessai, Aayushi Prabhu.
