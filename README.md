# 🏛️ Campus Complaint & Grievance Tracker
> **A Relational Database Management System for Institutional Campus Operations**  
> *Developed for Academic Evaluation — Department of Computer Engineering, Government Engineering College (GEC), Goa*  
> *Academic Year 2026 | Course: Database Management Systems Laboratory (CS-311)*

[![React](https://img.shields.io/badge/Frontend-React%2018%20SPA-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015%2B%20%2F%20Supabase-336791?logo=postgresql&logoColor=white)](https://supabase.com/)
[![MySQL](https://img.shields.io/badge/Reference%20RDBMS-MySQL%208.0%2B-4479A1?logo=mysql&logoColor=white)](https://mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS%203.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![JWT & Bcrypt](https://img.shields.io/badge/Security-JWT%20%2B%20Bcrypt-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite%206-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/Academic%20Project-GEC%20Goa-orange)](#-academic-attribution)

---

## 📋 Abstract

The **Campus Complaint & Grievance Tracker** is a production-grade, three-tier full-stack Relational Database Management System (RDBMS) built to solve institutional communication breakdowns across academic campuses. Designed around rigorous 3NF normalization, relational integrity constraints, and modern web architectures, the system coordinates maintenance requests, administrative workflows, and hostel welfare tracking across four distinct user roles: **Students**, **Maintenance Staff**, **Hostel Wardens**, and **Central Administrators**.

The application combines a high-performance **React 18 Single-Page Application (SPA)**, a robust **Node.js Express REST API backend**, and a **Supabase PostgreSQL 15+** relational database (with full **MySQL 8.0+** schema equivalence for academic defense). All operations — from bcrypt password hashing and foreign key cascades to automated SLA escalation stored procedures and real-time DBMS query telemetry — are engineered for transparency, security, and academic excellence.

---

## 👥 Team Members

| Name | Role / Focus Area | Department | Institution |
|:---|:---|:---|:---|
| **Chirag Nikant Simepurushkar** | Backend API Architecture, Express/JWT Security, Database Views & Query Inspector | Computer Engineering | GEC Goa |
| **Raksham Dessai** | Relational Schema Design, Normalization (3NF), PostgreSQL Triggers & Stored Procedures | Computer Engineering | GEC Goa |
| **Aayushi Prabhu** | Frontend Architecture, UI/UX Design System, Recharts Analytics & State Management | Computer Engineering | GEC Goa |

---

## 📑 Table of Contents

1. [System Overview](#-system-overview)
2. [Tech Stack](#️-tech-stack)
3. [System Architecture](#-application-architecture)
4. [Database Design & ER Modeling](#-database-design)
   - [ER Diagrams](#71-er-diagrams)
   - [Entities & Attributes](#72-entities)
   - [Relationships & Cardinalities](#73-relationships)
   - [Schema Tables (DDL Specifications)](#74-schema-tables)
   - [Normalization (1NF, 2NF, 3NF Proof)](#75-normalization--3nf)
5. [Key DBMS Concepts Implemented](#-key-dbms-concepts-implemented)
6. [User Roles & Functional Features](#-user-roles--features)
7. [REST API Architecture & Endpoints](#-backend-rest-api-architecture)
8. [SQL Queries & Procedures Documentation](#-sql-queries-documentation)
9. [Developer Live SQL Query Inspector](#-developer-sql-query-inspector)
10. [Project Directory Structure](#-project-structure)
11. [Setup & Running Instructions](#-setup--running)
12. [Security, Authentication & Bcrypt Architecture](#-security-authentication--bcrypt-architecture)
13. [Academic Documentation & Deliverables](#-academic-documentation)
14. [Git Repository & Branch Strategy](#-git-branches)
15. [Academic Attribution](#-academic-attribution)

---

## 🌐 System Overview

Campus infrastructure issues (broken electrical fixtures, plumbing leaks, Wi-Fi downtime, mess food quality concerns, hostel room maintenance) frequently suffer from delayed resolution due to paper-based logs, undocumented handoffs, and lack of accountability.

This platform replaces manual workflows with a fully automated, database-driven lifecycle:

```
[Student Files Complaint] 
       │
       ▼ (Status: 'Open') ──> Trigger logs to status_history (Weak Entity)
[Warden Reviews & Assigns Staff] 
       │
       ▼ (Status: 'Assigned') ──> Trigger updates complaint status via N:M staff_assignment
[Staff Works on Issue] 
       │
       ▼ (Status: 'In-Progress') ──> State transition logged
[Staff Resolves Ticket] 
       │
       ▼ (Status: 'Resolved') ──> Student Submits 1-5 Star Feedback & Rating
(If SLA exceeded: PL/pgSQL Stored Procedure Auto-Escalates to 'Escalated')
```

### Four User Roles

- **Student** — Lodge complaints with categorization, track live progress on visual status timelines, receive updates, and submit resolution feedback ratings.
- **Maintenance Staff** — View prioritized ticket queue filtered by trade (electrical, plumbing, IT, carpentry), transition work order states, and log work notes.
- **Hostel Warden** — Monitor all complaints originating from their assigned hostel block, assign specialized staff, monitor unresolved escalations, and audit staff workload.
- **Central Admin** — Full institutional oversight across all departments, adjust category SLA turnaround days, manage university staff rosters, and inspect compliance telemetry.

### Key Features

- 📝 **Multi-step Complaint Filing** — Guided wizard with automated department routing and category selection.
- 🔄 **Real-Time DBMS Telemetry** — Client-side query event broadcasting and server-side SQL logging.
- ⏱️ **SLA Enforcement Engine** — Every category carries an `sla_days` threshold; a PL/pgSQL stored procedure (`escalate_overdue_complaints()`) identifies overdue tickets and transitions them to `'Escalated'`.
- 🔐 **Bcrypt & JWT Security** — Industry-standard 10-round salted password hashing with JSON Web Token session management.
- 📊 **Executive Analytics Dashboards** — Recharts visualisations for volume trends, resolution velocity, category distributions, and staff load balancing.
- 🛠️ **Live Developer SQL Query Inspector** — Built-in floating inspector (`Ctrl + Shift + D`) capturing and syntax-highlighting live executed SQL queries in real-time.
- 📱 **22-Screen High-Fidelity UI** — Complete responsive interface based on university design systems.

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Frontend Framework** | React (SPA) | 18.x | Modular UI components, hooks, custom contexts |
| **Build Tool & Bundler** | Vite | 6.x | Fast HMR dev server, optimized production build |
| **Backend Runtime** | Node.js | 20.x / 24.x | Server-side JavaScript runtime |
| **Backend Framework** | Express.js | 4.x | RESTful API routing, middleware, JSON parsing |
| **Password Security** | bcryptjs | 2.4.x | 10-round salted password hashing & verification |
| **Session Security** | jsonwebtoken (JWT) | 9.x | Stateless, digitally signed user authentication |
| **Cross-Origin Handling**| CORS | 2.8.x | Controlled cross-origin resource sharing between frontend & backend |
| **Styling & Design** | TailwindCSS | 3.4 | Utility-first responsive CSS styling system |
| **Animations & Motion** | Framer Motion | 11.x | Spring physics, modals, micro-interactions, layout animations |
| **Data Visualisation** | Recharts | 2.x | Area charts, bar graphs, and SLA compliance metrics |
| **Client Routing** | React Router DOM | 6.x | Declarative client-side routing & ProtectedRoute wrappers |
| **Iconography** | Lucide React | latest | Clean, lightweight SVG icon system |
| **Primary Database** | PostgreSQL (Supabase) | 15+ | Relational DB engine with PL/pgSQL, triggers, views, and identity sequences |
| **Secondary Database** | MySQL | 8.0+ | Pure MySQL relational script for college viva and Workbench defense |
| **DB Client & PostgREST**| @supabase/supabase-js | 2.x | Database connection client utilized by the backend |

---

## 🏗️ Application Architecture

The system implements a classic **Three-Tier Architectural Model**, ensuring strict separation of presentation, business logic, and persistence:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER (CLIENT)                      │
│                                                                        │
│   React 18 SPA (Vite)  •  TailwindCSS  •  Framer Motion  •  Recharts   │
│                                                                        │
│   ├── Context Providers: AuthContext, ComplaintContext, ToastContext   │
│   ├── 22 Role-Specific Views (Student, Staff, Warden, Admin)          │
│   └── Live Developer SQL Inspector Component (Ctrl + Shift + D)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / RESTful JSON
                                    │ Authorization: Bearer <JWT_TOKEN>
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER (NODE.JS / EXPRESS)                │
│                                                                        │
│   Port: 5000  •  Express Router  •  JWT Middleware  •  Bcrypt (10)     │
│                                                                        │
│   ├── /api/auth/*       ──> Bcrypt password check, JWT token creation  │
│   ├── /api/complaints/* ──> Role-based complaint query & file tickets  │
│   ├── /api/staff/*      ──> Active technician queue & work history     │
│   ├── /api/warden/*     ──> Hostel ticket filter & escalation tracking │
│   ├── /api/analytics/*  ──> Aggregates, SLA compliance, stored procs   │
│   └── SQL Terminal Logger ──> Logs every executed DBMS query to console│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ PostgREST / Supabase Connection
                                    │ Parameterized SQL Operations
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     DATABASE TIER (SUPABASE POSTGRESQL)                │
│                                                                        │
│   PostgreSQL 15+ / MySQL 8.0+ Equivalence                              │
│                                                                        │
│   ├── 9 Relational Tables + 2 Extension Tables (Feedback, Notification)│
│   ├── 3 Complex Relational Views (v_complaint_details, workload, etc.) │
│   ├── 3 Automated DB Triggers (updated_at, status log, auto-assign)    │
│   ├── 1 PL/pgSQL Stored Procedure (escalate_overdue_complaints)        │
│   └── Referential Integrity (Foreign Keys, Domain Constraints, Checks) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Design

### 7.1 ER Diagrams

The project repository includes comprehensive visual models located in the `images/` directory:

- **`images/main_er_diagram.svg`** — Scalable vector diagram displaying both Chen Conceptual Notation and Crow's Foot Logical Notation.
- **`images/er diagram.jpeg`** — High-resolution raster diagram for printed lab reports.
- **`docs/Phase2_ER_Modeling.pdf`** — Formal Phase 2 academic report detailing cardinality ratios and participation constraints.

```
Chen ER Modeling Abstract Schema
═══════════════════════════════════════════════════════════════════════
 DEPARTMENT ──< EMPLOYS >── STAFF ──< WARDENS >── HOSTEL
      │                                               │
   OWNS                                           RESIDES_IN
      │                                               │
   CATEGORY ──< CLASSIFIED_AS >── COMPLAINT ──< FILES >── STUDENT
      │                              │                    │
   SLA_Days                    ASSIGNED_TO (N:M)      HAS_PHONE
                                     │                    │
                              STAFF_ASSIGNMENT      STUDENT_PHONE
                                     │
                              LOGS (1:N weak)
                                     │
                              STATUS_HISTORY (Weak Entity)
                                     │
                             RECEIVES (1:1 optional)
                                     │
                                  FEEDBACK
```

---

### 7.2 Entities

| Entity | Type | Primary Key | Description |
|:---|:---|:---|:---|
| **Department** | Strong Entity | `dept_id` (IDENTITY) | Academic or administrative unit (Estate, IT, Mess, etc.) |
| **Staff** | Strong Entity | `staff_id` (IDENTITY) | Campus employees; includes `designation` and `password_hash` |
| **Hostel** | Strong Entity | `hostel_id` (IDENTITY) | Student residential blocks; 1:1 association with warden staff |
| **Student** | Strong Entity | `student_id` (IDENTITY) | Enrolled students; references hostel and includes `password_hash` |
| **StudentPhone** | Multivalued Attribute | (`student_id`, `phone_number`) | Decomposed multivalued phone numbers table ensuring 1NF |
| **Category** | Strong Entity | `category_id` (IDENTITY) | Classification with `sla_days` resolution threshold |
| **Complaint** | Strong Entity | `complaint_id` (IDENTITY) | Central operational entity with lifecycle status |
| **StatusHistory** | **Weak Entity** | (`complaint_id`, `history_num`) | Weak entity dependent on Complaint; logs chronological status changes |
| **StaffAssignment** | N:M Junction Table | `assignment_id` (IDENTITY) | Resolves Many-to-Many between Staff and Complaint |
| **Feedback** | Dependent Entity | `feedback_id` (IDENTITY) | Student satisfaction rating (1-5 stars) and comments on resolved tickets |
| **Notification** | Auxiliary Entity | `notification_id` (IDENTITY) | Real-time system notifications and alerts for users |

---

### 7.3 Relationships

| Relationship | Entities Involved | Cardinality | Participation | Referential Action |
|:---|:---|:---|:---|:---|
| **Employs** | Department ↔ Staff | 1:N | Staff: Total | `ON UPDATE CASCADE ON DELETE RESTRICT` |
| **Wardens** | Staff ↔ Hostel | 1:1 | Hostel: Total | `warden_id UNIQUE`, `ON DELETE RESTRICT` |
| **Resides_In** | Student ↔ Hostel | N:1 | Student: Total | `hostel_id`, `ON DELETE RESTRICT` |
| **Has_Phone** | Student ↔ Student_Phone | 1:N (identifying) | Student_Phone: Total | Composite PK, `ON DELETE CASCADE` |
| **Owns** | Department ↔ Category | 1:N | Category: Total | `dept_id`, `ON DELETE RESTRICT` |
| **Files** | Student ↔ Complaint | 1:N | Complaint: Total | `student_id`, `ON DELETE RESTRICT` |
| **Classified_As** | Category ↔ Complaint | 1:N | Complaint: Total | `category_id`, `ON DELETE RESTRICT` |
| **Assigned_To** | Staff ↔ Complaint | **N:M** | Partial on both sides | Resolved via `staff_assignment` junction |
| **Logs** | Complaint ↔ Status_History | 1:N (identifying) | Status_History: Total | Weak entity PK (`complaint_id`, `history_num`), `ON DELETE CASCADE` |
| **Rates** | Complaint ↔ Feedback | 1:1 (optional) | Feedback: Total | `complaint_id UNIQUE`, `ON DELETE CASCADE` |

---

### 7.4 Schema Tables

#### `department`
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `dept_id` | INTEGER | PRIMARY KEY, IDENTITY | Unique department identifier |
| `dept_name` | TEXT | NOT NULL, UNIQUE | Official name (e.g., Estate & Maintenance) |
| `dept_head` | TEXT | NOT NULL | Head of department name |

#### `staff`
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `staff_id` | INTEGER | PRIMARY KEY, IDENTITY | Unique employee identifier |
| `first_name` | TEXT | NOT NULL | Staff first name |
| `last_name` | TEXT | NOT NULL | Staff surname |
| `designation` | TEXT | NOT NULL | Role designation ('Admin', 'Hostel Warden', etc.) |
| `email` | TEXT | NOT NULL, UNIQUE | Official institutional email |
| `dept_id` | INTEGER | NOT NULL, FK → department | Handling department reference |
| `password_hash` | TEXT | NULL | 10-round salted bcrypt password hash |

#### `hostel`
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `hostel_id` | INTEGER | PRIMARY KEY, IDENTITY | Hostel block identifier |
| `hostel_name` | TEXT | NOT NULL, UNIQUE | Hostel block name (e.g., Mandovi Boys Hostel) |
| `warden_id` | INTEGER | NOT NULL, UNIQUE, FK → staff | Single assigned warden employee |

#### `student`
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `student_id` | INTEGER | PRIMARY KEY, IDENTITY | Student roll number / ID |
| `first_name` | TEXT | NOT NULL | Given name |
| `last_name` | TEXT | NOT NULL | Family name |
| `email` | TEXT | NOT NULL, UNIQUE | Campus email address |
| `room_no` | TEXT | NOT NULL | Assigned hostel room number |
| `hostel_id` | INTEGER | NOT NULL, FK → hostel | Residence hostel block |
| `password_hash` | TEXT | NULL | 10-round salted bcrypt password hash |

#### `student_phone` *(Multivalued Decomposition)*
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `student_id` | INTEGER | NOT NULL, FK → student | Parent student reference |
| `phone_number` | TEXT | NOT NULL, CHECK regex | E.164 phone number format |
| — | — | PRIMARY KEY (student_id, phone_number) | Composite primary key |

#### `category`
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `category_id` | INTEGER | PRIMARY KEY, IDENTITY | Category identifier |
| `category_name` | TEXT | NOT NULL, UNIQUE | Problem type (Plumbing, Electrical, Wi-Fi) |
| `sla_days` | INTEGER | NOT NULL, CHECK (sla_days > 0) | Turnaround threshold in business days |
| `dept_id` | INTEGER | NOT NULL, FK → department | Assigned handling department |

#### `complaint` *(Central Entity)*
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `complaint_id` | INTEGER | PRIMARY KEY, IDENTITY | Ticket tracking number |
| `description` | TEXT | NOT NULL, CHECK (length ≥ 5) | Detailed description of problem |
| `status` | DOMAIN | DEFAULT 'Open', NOT NULL | 'Open' \| 'Assigned' \| 'In-Progress' \| 'Resolved' \| 'Escalated' |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Ticket submission timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp (auto-managed by trigger) |
| `student_id` | INTEGER | NOT NULL, FK → student | Filing student |
| `category_id` | INTEGER | NOT NULL, FK → category | Issue category |

#### `status_history` *(Weak Entity)*
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `complaint_id` | INTEGER | NOT NULL, FK → complaint | Identifying owner foreign key |
| `history_num` | INTEGER | NOT NULL, CHECK (> 0) | Incremental transition index (1, 2, 3...) |
| `old_status` | DOMAIN | NULL for initial log | Previous status state |
| `new_status` | DOMAIN | NOT NULL | Transitioned status state |
| `status` | DOMAIN | NOT NULL | Current state representation |
| `changed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Transition timestamp |
| `changed_by` | TEXT | NOT NULL, DEFAULT 'System' | Initiator ('Student', staff name, 'System') |
| `note` | TEXT | NULL | Work comments, notes, or feedback text |
| — | — | PRIMARY KEY (complaint_id, history_num) | Composite identifying primary key |

#### `staff_assignment` *(N:M Junction Table)*
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `assignment_id` | INTEGER | PRIMARY KEY, IDENTITY | Assignment record ID |
| `staff_id` | INTEGER | NOT NULL, FK → staff | Assigned technician/worker |
| `complaint_id` | INTEGER | NOT NULL, FK → complaint | Target complaint ticket |
| `assigned_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Dispatch timestamp |
| `unassigned_at` | TIMESTAMPTZ | NULL | NULL indicates currently active assignment |
| — | — | UNIQUE (staff_id, complaint_id) WHERE unassigned_at IS NULL | Prevents duplicate concurrent active assignments |

#### `feedback` *(Quality Assurance)*
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `feedback_id` | INTEGER | PRIMARY KEY, IDENTITY | Feedback record ID |
| `complaint_id` | INTEGER | NOT NULL, UNIQUE, FK → complaint | Single feedback per resolved complaint |
| `student_id` | INTEGER | NOT NULL, FK → student | Rating author |
| `rating` | SMALLINT | NOT NULL, CHECK (rating BETWEEN 1 AND 5) | Numeric 1 to 5 star rating |
| `comments` | TEXT | NULL | Optional student review remarks |
| `submitted_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Submission timestamp |

#### `notification` *(User Alerts)*
| Column | Type | Constraints | Description |
|:---|:---|:---|:---|
| `notification_id` | INTEGER | PRIMARY KEY, IDENTITY | Unique alert identifier |
| `user_email` | TEXT | NOT NULL | Target recipient email |
| `message` | TEXT | NOT NULL | Alert message content |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT false | Read receipt status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Broadcast timestamp |

---

### 7.5 Normalization — 3NF

The database schema strictly adheres to Third Normal Form (3NF), documented in [`docs/Phase3_Normalization.pdf`](docs/Phase3_Normalization.pdf):

#### First Normal Form (1NF)
- All attribute values are atomic (indivisible).
- The multivalued attribute `Phone_Numbers` is extracted into `student_phone(student_id, phone_number)` with a composite primary key.
- No repeating groups, arrays, or comma-separated strings exist in stored tables.

#### Second Normal Form (2NF)
- The schema is in 1NF.
- Every non-prime attribute is fully functionally dependent on the primary key.
- In weak entity `status_history(complaint_id, history_num)`, `new_status`, `changed_at`, and `changed_by` depend on the entire composite primary key, not a subset.
- In `staff_assignment(staff_id, complaint_id, assigned_at)`, timestamps depend on the full composite key.

#### Third Normal Form (3NF)
- The schema is in 2NF.
- No transitive dependencies exist ($X \to Y$ and $Y \to Z$ where $Z$ is non-prime).
- Department details (`dept_name`, `dept_head`) are not stored inside `staff` or `category`; instead, both reference `department(dept_id)`.
- Hostel names are not duplicated in `student`; only the foreign key `hostel_id` is stored.
- Computed metrics (e.g., `total_complaints_filed`, `is_overdue`) are defined within relational views, avoiding stored derived redundancies.

---

## 🎓 Key DBMS Concepts Implemented

1. **Weak Entity Modeling**:
   - `status_history` cannot exist without its identifying parent `complaint`. It uses an identifying composite primary key `(complaint_id, history_num)` with cascading deletion (`ON DELETE CASCADE`).
2. **N:M Relationship Resolution**:
   - A staff member works on multiple complaints, and a complaint can be reassigned or worked on by multiple staff members over time. Resolved via `staff_assignment` with timestamped auditing.
3. **Database Triggers**:
   - `trg_complaint_updated_at`: Maintains accurate modification timestamps automatically on `UPDATE`.
   - `trg_complaint_status_log`: Automatically creates history log entries upon status change.
   - `trg_assignment_sets_status`: Automatically moves ticket status from `'Open'` to `'Assigned'` on staff allocation.
4. **Stored Procedures / PL/pgSQL Functions**:
   - `escalate_overdue_complaints()`: Computes dynamic time differentials based on `category.sla_days` and auto-escalates overdue work orders.
5. **Relational Views & Derived Data**:
   - `v_complaint_details`: Complex 5-table join computing live SLA deadline projections.
   - `v_staff_workload`: Aggregated active vs total ticket load per employee.
   - `v_student_summary`: Clean abstraction computing total filed complaints without violating 3NF storage.
6. **Integrity Constraints**:
   - Primary Keys, Foreign Keys with explicit referential integrity rules, `CHECK` constraints on phone formats and positive durations, and `UNIQUE` constraints preventing duplicate wardens or overlapping active assignments.

---

## 👤 User Roles & Features

### 🎓 Student Portal
- **Dashboard**: Overview of open, in-progress, and resolved complaints filed by the student.
- **File Complaint**: Category picker, dynamic department routing, and description input with validation.
- **My Complaints**: Filterable table showing active tickets and SLA resolution target dates.
- **Live Status Timeline**: Visual chronological tracker showing historical state transitions with notes.
- **Resolution Feedback**: Post-resolution 5-star rating submission stored in `feedback` table.

### 🔧 Maintenance Staff Desk
- **Work Queue**: Real-time queue showing tickets assigned to the technician, prioritized by urgency.
- **Ticket Action**: Transition complaint status (`'In-Progress'`, `'Resolved'`) with technician notes.
- **Resolution History**: Archive of past resolved tickets and performance metrics.

### 🏠 Hostel Warden Dashboard
- **Hostel Overview**: Live dashboard filtered specifically to the warden's assigned hostel block.
- **Staff Dispatch**: Assign available university technicians to open tickets via modal assignment.
- **Escalation Center**: Direct oversight of SLA-breached complaints requiring administrative intervention.
- **Technician Workload**: Table of staff assignments to prevent technician overload.

### 👑 Central Administration Portal
- **Executive Overview**: Campus-wide telemetry showing total complaint counts by status.
- **Analytics & Trends**: Recharts-powered analytics for monthly filing trends and department distributions.
- **SLA Policy Manager**: Interactive interface to update SLA turnaround days for each category.
- **Staff Roster Management**: Overview of university maintenance staff and active workload metrics.

---

## 🚀 Backend REST API Architecture

The Node.js Express server runs on port `5000` (or `process.env.PORT`) and handles all business logic, authentication, and SQL execution.

### Endpoints Overview

| Method | Endpoint | Auth Required | Description |
|:---|:---|:---|:---|
| **GET** | `/api/health` | No | Server health check and uptime probe |
| **GET** | `/api/lookups` | No | Fetches categories, hostels, departments, and staff |
| **POST** | `/api/auth/student/register` | No | Student signup with bcrypt password hashing |
| **POST** | `/api/auth/student/login` | No | Student login with bcrypt validation; returns JWT |
| **POST** | `/api/auth/staff/login` | No | Staff/Warden/Admin login; returns JWT & role |
| **GET** | `/api/auth/me` | Bearer Token | Returns current authenticated user profile |
| **GET** | `/api/complaints` | Bearer Token | Role-filtered complaints list |
| **POST** | `/api/complaints` | Bearer Token | File a new complaint ticket |
| **GET** | `/api/complaints/:id` | Bearer Token | Full ticket detail, status history, and assignments |
| **PATCH**| `/api/complaints/:id/status` | Bearer Token | Update complaint status with trigger logging |
| **POST** | `/api/complaints/:id/assign` | Bearer Token | Assign staff member to complaint |
| **PATCH**| `/api/complaints/:id/unassign`| Bearer Token | Mark staff assignment as completed/unassigned |
| **GET** | `/api/staff/:id/queue` | Bearer Token | Active work queue for specific technician |
| **GET** | `/api/staff/:id/history` | Bearer Token | Resolved work history for staff member |
| **GET** | `/api/warden/:hostelId/complaints` | Bearer Token | Complaints filtered by hostel block |
| **GET** | `/api/warden/:hostelId/escalations`| Bearer Token | SLA-escalated complaints in hostel |
| **GET** | `/api/analytics/dashboard-stats` | Bearer Token | Total, open, in-progress, resolved, escalated counts |
| **GET** | `/api/analytics/by-category` | Bearer Token | Complaint distribution aggregated by category |
| **GET** | `/api/analytics/by-status` | Bearer Token | Complaint counts grouped by status |
| **GET** | `/api/analytics/monthly-trend` | Bearer Token | Monthly complaint filing volume trend |
| **GET** | `/api/analytics/sla-compliance` | Bearer Token | SLA compliance percentage per category |
| **GET** | `/api/analytics/staff-workload` | Bearer Token | Selects from `v_staff_workload` view |
| **POST** | `/api/analytics/escalate-overdue` | Bearer Token | Triggers `escalate_overdue_complaints()` stored proc |
| **PATCH**| `/api/categories/:id/sla` | Bearer Token | Update category SLA turnaround days |
| **POST** | `/api/feedback` | Bearer Token | Submit post-resolution student rating |
| **GET** | `/api/notifications` | Bearer Token | Retrieve unread user alerts |
| **PATCH**| `/api/notifications/read` | Bearer Token | Mark all user alerts as read |

---

## 📄 SQL Queries Documentation

Every query is executed by the backend and broadcast to the Developer SQL Inspector.

### 1. Student Authentication & Profile Join
```sql
SELECT s.student_id,
       s.first_name,
       s.last_name,
       s.room_no,
       s.email,
       s.password_hash,
       h.hostel_id,
       h.hostel_name
FROM   public.student s
JOIN   public.hostel  h ON s.hostel_id = h.hostel_id
WHERE  LOWER(s.email) = LOWER($1);
```

### 2. File Complaint (Trigger Auto-Chain)
```sql
INSERT INTO public.complaint (description, student_id, category_id, status)
VALUES ($1, $2, $3, 'Open')
RETURNING complaint_id, description, status, created_at;

-- TRIGGER: trg_complaint_status_log automatically fires:
-- Inserts initial status record into status_history weak entity (history_num = 1)
```

### 3. Comprehensive Complaint Details View
```sql
SELECT c.complaint_id,
       c.description,
       c.status,
       c.created_at,
       c.updated_at,
       s.student_id,
       s.first_name || ' ' || s.last_name AS student_name,
       s.room_no,
       h.hostel_name,
       cat.category_name,
       cat.sla_days,
       d.dept_name AS handling_department,
       (c.created_at + (cat.sla_days || ' days')::INTERVAL) AS sla_due,
       (c.status != 'Resolved' AND now() > (c.created_at + (cat.sla_days || ' days')::INTERVAL)) AS is_escalated
FROM   public.complaint c
JOIN   public.category cat ON c.category_id = cat.category_id
JOIN   public.department d ON cat.dept_id   = d.dept_id
JOIN   public.student s    ON c.student_id  = s.student_id
JOIN   public.hostel h     ON s.hostel_id   = h.hostel_id
ORDER  BY c.created_at DESC;
```

### 4. Status History Timeline (Weak Entity Query)
```sql
SELECT history_num,
       complaint_id,
       status,
       changed_at,
       changed_by,
       note
FROM   public.status_history
WHERE  complaint_id = $1
ORDER  BY history_num ASC;
```

### 5. Staff Assignment (N:M Insertion + Status Trigger)
```sql
INSERT INTO public.staff_assignment (staff_id, complaint_id, assigned_at)
VALUES ($1, $2, now())
RETURNING *;

-- TRIGGER: trg_assignment_sets_status fires:
-- UPDATE complaint SET status = 'Assigned', updated_at = now()
-- WHERE complaint_id = NEW.complaint_id AND status = 'Open';
```

### 6. SLA Auto-Escalation Stored Procedure
```sql
CREATE OR REPLACE FUNCTION public.escalate_overdue_complaints()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH escalated AS (
    UPDATE public.complaint c
       SET status = 'Escalated',
           updated_at = now()
      FROM public.category cat
     WHERE cat.category_id = c.category_id
       AND c.status IN ('Open', 'Assigned', 'In-Progress')
       AND c.created_at + (cat.sla_days * INTERVAL '1 day') < now()
    RETURNING c.complaint_id
  )
  SELECT COUNT(*) INTO v_count FROM escalated;
  RETURN v_count;
END;
$$;
```

### 7. Executive Dashboard Aggregation
```sql
SELECT
  COUNT(*)                                             AS total,
  COUNT(*) FILTER (WHERE status = 'Open')             AS open_count,
  COUNT(*) FILTER (WHERE status = 'Assigned')         AS assigned_count,
  COUNT(*) FILTER (WHERE status = 'In-Progress')      AS in_progress,
  COUNT(*) FILTER (WHERE status = 'Resolved')         AS resolved,
  COUNT(*) FILTER (WHERE status = 'Escalated')        AS escalated
FROM public.complaint;
```

### 8. Staff Workload Aggregated View
```sql
SELECT s.staff_id,
       s.first_name || ' ' || s.last_name AS full_name,
       s.designation,
       d.dept_name,
       COUNT(sa.assignment_id) FILTER (WHERE sa.unassigned_at IS NULL) AS active_assignments,
       COUNT(sa.assignment_id) FILTER (WHERE c.status = 'Resolved')    AS resolved_total
FROM   public.staff s
JOIN   public.department d         ON s.dept_id      = d.dept_id
LEFT JOIN public.staff_assignment sa ON sa.staff_id  = s.staff_id
LEFT JOIN public.complaint c        ON c.complaint_id = sa.complaint_id
GROUP  BY s.staff_id, s.first_name, s.last_name, s.designation, d.dept_name
ORDER  BY active_assignments DESC;
```

---

## 🔍 Developer Live SQL Query Inspector

The system includes a real-time **DBMS Query Inspector** (`src/components/dev/DevQueryViewer.jsx`), specifically engineered for laboratory defense and evaluator inspections.

```
┌─────────────────────────────────────────────────────────────┐
│ 🧑‍💻 Live DBMS Query Inspector               [Ctrl+Shift+D] │
├─────────────────────────────────────────────────────────────┤
│  ● LIVE EXECUTED (8)  │  📚 CATALOG (9)  │  🗄️ TABLES & VIEWS│
├─────────────────────────────────────────────────────────────┤
│  GET /api/complaints               14ms  ● 200   10:41:22 PM│
│  ▼ SQL:                                                     │
│    SELECT * FROM v_complaint_details ORDER BY created_at;  │
│  ─────────────────────────────────────────────────────────  │
│  POST /api/complaints              22ms  ● 201   10:40:15 PM│
│  ▼ SQL:                                                     │
│    INSERT INTO complaint (description, student_id, ...)     │
│    VALUES ($1, $2, $3, 'Open') RETURNING *;                 │
└─────────────────────────────────────────────────────────────┘
```

### Features of the Query Inspector

1. **Live Stream of Executed Queries**:
   - Intercepts and captures every REST call through custom DOM events (`dbms:query-executed`).
   - Displays exact HTTP Method, URL path, HTTP Status code, and server round-trip execution latency in milliseconds.
2. **Interactive Syntax Highlighting**:
   - Custom SQL tokenizer formatting keywords in blue, table/view names in yellow, strings in green, and comments in gray.
3. **Copy to Clipboard**:
   - One-click copy button on every query block for quick copy-paste during viva demonstrations.
4. **Session Persistence**:
   - Preserves recent query logs in `sessionStorage` so refreshing the browser retains the execution trace.
5. **Interactive Keyboard Shortcut**:
   - Press **`Ctrl + Shift + D`** anywhere in the application to toggle the inspector drawer open/closed.
6. **On-Demand Test Trigger**:
   - Contains a built-in **"▶ Test /lookups"** button allowing evaluators to trigger an instant live query.

---

## 📁 Project Structure

```plaintext
campus-complaint-tracker/
├── README.md                               ← Master Project Academic Report
├── MySQL/                                   ← SQL Database Scripts & Documentation
│   ├── 01_schema_and_seed.sql               ← Complete Supabase PostgreSQL 15+ Schema & Seed Script
│   ├── 02_additional_queries.sql            ← 14 Supplementary Advanced DBMS SQL Queries & DDL
│   ├── 03_fix_permissions.sql               ← Quick Permissions & RLS Patch Script
│   └── campus_complaint_tracker.sql         ← Pure MySQL 8.0+ Equivalent Script for Lab Defense
├── docs/                                   ← Official University Submission Deliverables
│   ├── Campus Complaint & Grievance Tracker.pdf  ← Complete Combined Academic Report
│   ├── Campus_Complaint_Tracker.pptx       ← Official Defense Presentation Slides (22 slides)
│   ├── Complete_Execution_Plan.pdf         ← Sprint Timeline & Task Breakdown
│   ├── main_ER_Document.docx               ← Editable ER Modeling Source Document
│   ├── main ER_Document.pdf                ← Phase 2 Formal ER Document
│   ├── main Project_Synopsis.pdf           ← Project Synopsis & Scope
│   ├── main Requirement_Analysis_DBMS.pdf  ← Functional & Non-Functional Specifications
│   ├── Phase2_ER_Modeling.pdf              ← Phase 2 Entity-Relationship Report
│   └── Phase3_Normalization.pdf            ← Phase 3 Relational Mapping & 3NF Proof
├── images/                                  ← Architectural Diagrams
│   ├── main_er_diagram.svg                  ← Vector Chen & Crow's Foot ER Diagram
│   └── er diagram.jpeg                      ← High-Resolution Raster ER Diagram
├── backend/                                 ← Node.js / Express Application Tier
│   ├── package.json                         ← Dependencies: express, cors, bcryptjs, jsonwebtoken, dotenv
│   ├── package-lock.json
│   ├── .env                                 ← Backend Config: PORT, SUPABASE_URL, SERVICE_ROLE_KEY, JWT_SECRET
│   └── server.js                            ← Master Server: 30+ REST endpoints, bcrypt auth, SQL logger
└── frontend/                                ← React 18 + Vite Presentation Tier
    ├── package.json                         ← Dependencies: react, tailwindcss, framer-motion, recharts
    ├── package-lock.json
    ├── vite.config.js                       ← Vite build & proxy configuration
    ├── tailwind.config.js                   ← Tailwind styling configuration
    ├── index.html
    ├── .env                                 ← Frontend Config: VITE_BACKEND_URL, VITE_SUPABASE_URL
    ├── .env.example                         ← Environment variable template
    └── src/
        ├── main.jsx                         ← App Entry Point with AuthProvider & ToastProvider
        ├── App.jsx                          ← Router & ProtectedRoute Configuration
        ├── index.css                        ← Global Tailwind directives & custom scrollbars
        ├── lib/                             ← API & Data Layer
        │   ├── api.js                       ← REST client; attaches JWT; dispatches dbms:query-executed
        │   ├── auth.js                      ← Auth methods: studentSignIn, staffSignIn, studentSignUp, getSession
        │   ├── db.js                        ← Dual-format compatible data-fetching abstraction
        │   └── supabase.js                  ← Supabase client initialization
        ├── context/                         ← Global React Context State
        │   ├── AuthContext.jsx              ← JWT session, active user, role state
        │   ├── ComplaintContext.jsx         ← Polling state, lookups cache, CRUD operations
        │   └── ToastContext.jsx             ← Modern glassmorphic audio-visual toast notifications
        ├── components/
        │   ├── common/                      ← Shared UI Components
        │   │   ├── Navbar.jsx               ← User identity avatar, role badge, sign-out handler
        │   │   ├── Sidebar.jsx              ← Dynamic role-based navigation sidebar
        │   │   ├── ProtectedRoute.jsx       ← Role-gated route authorization wrapper
        │   │   ├── StatusBadge.jsx          ← Semantic complaint status indicators
        │   │   └── CampusLogo.jsx           ← University emblem SVG component
        │   └── dev/
        │       └── DevQueryViewer.jsx       ← Floating Live DBMS Query Inspector Drawer
        └── pages/                           ← Page Views (22 screens)
            ├── WelcomeGateway.jsx           ← Public portal landing page
            ├── StudentAuth.jsx              ← Student registration & login forms
            ├── StaffAdminAuth.jsx           ← Maintenance staff, warden, and admin login
            ├── StudentDashboard.jsx         ← Student metrics and quick complaint launcher
            ├── FileComplaint.jsx            ← Multi-step guided complaint filing form
            ├── MyComplaints.jsx             ← Filterable table of student complaints
            ├── ComplaintDetail.jsx          ← Ticket overview with weak entity timeline
            ├── LiveStatusTimelinePage.jsx   ← Full status transition timeline
            ├── ComplaintSuccess.jsx         ← Ticket submission confirmation card
            ├── StaffQueueDashboard.jsx      ← Assigned technician work order queue
            ├── StaffTicketAction.jsx        ← Update status and add technician remarks
            ├── StaffHistory.jsx             ← Completed ticket history
            ├── WardenHostelDashboard.jsx    ← Hostel-specific complaint management
            ├── WardenEscalations.jsx        ← SLA breach resolution interface
            ├── WardenStaffWorkload.jsx      ← Technician assignment load monitor
            ├── AdminDashboard.jsx           ← Executive governance metrics overview
            ├── AdminAnalytics.jsx           ← Recharts charts: monthly volume & SLA performance
            ├── AdminSlaConfig.jsx           ← Department turnaround SLA threshold manager
            └── AdminStaffRoster.jsx         ← University staff roster and availability matrix
```

---

## 🚀 Setup & Running

Follow these step-by-step instructions to run the entire project locally on your machine.

### Step 1 — Clone the Repository
```bash
git clone https://github.com/RakshamDessai/campus-complaint-tracker.git
cd campus-complaint-tracker
```

### Step 2 — Deploy the Database on Supabase
1. Create a free account at [supabase.com](https://supabase.com) and create a **New Project**.
2. Go to **SQL Editor → New Query**.
3. Open [`MySQL/01_schema_and_seed.sql`](MySQL/01_schema_and_seed.sql) in your code editor, copy the entire file, and paste it into the Supabase SQL Editor.
4. Click **Run** (if prompted with *"Potential issues detected"*, click **"Run without RLS"** so the backend can manage operations cleanly).
5. All 9 tables, 3 views, triggers, stored procedures, and initial seed records are deployed immediately.

### Step 3 — Configure Environment Variables

**Backend Config (`backend/.env`):**
```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-anon-or-service-key
JWT_SECRET=campus_complaint_jwt_super_secret_key_2026
```

**Frontend Config (`frontend/.env`):**
```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Step 4 — Install Dependencies & Start the Backend Server
In your first terminal:
```bash
cd backend
npm install
node server.js
```
*The server will start at `http://localhost:5000` with real-time DBMS SQL terminal logging active.*

### Step 5 — Install Dependencies & Start the Frontend SPA
In your second terminal:
```bash
cd frontend
npm install
npm run dev
```
*Vite will start the client interface at `http://localhost:3001` (or `http://localhost:5173`).*

---

### Step 6 — Login with Seed Credentials

All pre-seeded test accounts are equipped with valid bcrypt hashes:

| Role | Portal / Login Page | Email | Password |
|:---|:---|:---|:---|
| **Central Admin** | Staff Login (`/staff-login`) | `rajesh.gawas@campus.edu` | `admin123` |
| **Hostel Warden (Mandovi)** | Staff Login (`/staff-login`) | `sunita.borkar@campus.edu` | `admin123` |
| **Hostel Warden (Zuari)** | Staff Login (`/staff-login`) | `prakash.fernandes@campus.edu` | `admin123` |
| **Hostel Warden (Chapora)** | Staff Login (`/staff-login`) | `kavita.shetty@campus.edu` | `admin123` |
| **Maintenance Staff (Electrician)** | Staff Login (`/staff-login`) | `anil.pai@campus.edu` | `admin123` |
| **Maintenance Staff (Plumber)** | Staff Login (`/staff-login`) | `joseph.dias@campus.edu` | `admin123` |
| **Maintenance Staff (Network)** | Staff Login (`/staff-login`) | `neha.kamat@campus.edu` | `admin123` |
| **Student (Raksham)** | Student Login (`/login`) | `raksham.dessai@campus.edu` | `password123` |
| **Student (Chirag)** | Student Login (`/login`) | `simepurushkarchirag84@gmail.com` | `password123` |

*(You can also click **"New Student Register"** on the login page to register a new account with your own password — the backend will hash it with 10 bcrypt salt rounds).*

---

## 🔒 Security, Authentication & Bcrypt Architecture

1. **Password Hashing (Bcrypt)**:
   - Plain text passwords are never stored in the database.
   - When a student registers, `bcrypt.hash(password, 10)` generates a salt and hash.
   - On authentication, `bcrypt.compare()` compares the plain text input with the stored hash.
2. **Stateless JWT Sessions**:
   - The backend signs a JWT using `jsonwebtoken` with user ID, email, and role claims valid for 7 days.
   - The frontend stores the token in `localStorage` and attaches it via the `Authorization: Bearer <TOKEN>` header on all requests.
3. **Role-Based Access Control (RBAC)**:
   - Handled via the `authenticateToken` middleware on the server and `ProtectedRoute.jsx` on the client.
   - A student cannot access `/admin/*` or `/warden/*` routes; an admin cannot lodge tickets as a student.
4. **Protection Against SQL Injection**:
   - All database queries utilize parameterized queries and PostgREST schema binding, protecting against injection attacks.

---

## 📚 Academic Documentation

All official academic deliverables submitted for university evaluation are available in the [`docs/`](docs/) directory:

| Deliverable | Description |
|:---|:---|
| [`Campus Complaint & Grievance Tracker.pdf`](docs/) | Comprehensive final academic report |
| [`main Project_Synopsis.pdf`](docs/) | Problem definition, project scope, and functional objectives |
| [`main Requirement_Analysis_DBMS.pdf`](docs/) | Detailed functional requirements and operational use-cases |
| [`main ER_Document.pdf`](docs/) | Entity dictionary, relationship cardinalities, and Chen ER diagram |
| [`Phase2_ER_Modeling.pdf`](docs/) | Phase 2 ER modeling deliverable |
| [`Phase3_Normalization.pdf`](docs/) | Phase 3 relational schema mapping and 3NF functional dependency proof |
| [`Campus_Complaint_Tracker.pptx`](docs/) | 22-slide official project defense presentation |
| [`Complete_Execution_Plan.pdf`](docs/) | Sprint breakdown and software development lifecycle timeline |

---

## 🌿 Git Branches

| Branch | Purpose | Status |
|:---|:---|:---|
| `main` | Production & evaluated release branch containing complete backend, frontend, SQL, and docs | **Active & Synced** |
| `frontend` | React SPA development branch | Integrated into `main` |
| `backend` | Server & API development branch | Integrated into `main` |

---

## 📄 Academic Attribution

This system was created and submitted for academic evaluation in the **Department of Computer Engineering** at **Government Engineering College (GEC), Farmagudi, Ponda, Goa** as part of the **Database Management Systems (DBMS)** mini-project curriculum.

- **Institution:** Government Engineering College (GEC), Goa  
- **Department:** Department of Computer Engineering  
- **Academic Year:** 2026  
- **Course Code:** CS-311 (Database Management Systems Laboratory)  
- **Project Team:** Chirag Nikant Simepurushkar, Raksham Dessai, Aayushi Prabhu  

All rights reserved © 2026. Built for educational and institutional research purposes.
