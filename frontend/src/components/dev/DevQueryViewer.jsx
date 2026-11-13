import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '../../lib/api';

/* ─── SQL Catalog for Academic / Lab Demonstration ─── */
const SQL_CATALOG = [
  {
    id: 1,
    label: 'Student Sign In & Join',
    trigger: 'POST /api/auth/student/login',
    table: 'student JOIN hostel',
    type: 'SELECT JOIN',
    tags: ['Auth', 'JWT'],
    sql: `-- Step 1: Query student profile with foreign key join to hostel
SELECT s.student_id,
       s.first_name,
       s.last_name,
       s.room_no,
       s.email,
       s.password_hash,
       h.hostel_id,
       h.hostel_name
FROM   student s
JOIN   hostel  h ON s.hostel_id = h.hostel_id
WHERE  LOWER(s.email) = LOWER($1);

-- Step 2: Backend verifies bcrypt password hash and generates signed JWT token.`,
  },
  {
    id: 2,
    label: 'Student Registration (Bcrypt Hash)',
    trigger: 'POST /api/auth/student/register',
    table: 'student',
    type: 'INSERT',
    tags: ['Auth', 'Bcrypt'],
    sql: `-- Check if email is already taken
SELECT student_id FROM student WHERE LOWER(email) = LOWER($1);

-- Insert new student with hashed password
INSERT INTO student (first_name, last_name, email, room_no, hostel_id, password_hash)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING student_id, first_name, last_name, email, room_no, hostel_id;`,
  },
  {
    id: 3,
    label: 'File New Complaint & Trigger',
    trigger: 'POST /api/complaints',
    table: 'complaint + status_history',
    type: 'INSERT + TRIGGER',
    tags: ['Write', 'Trigger'],
    sql: `-- Insert complaint into base table
INSERT INTO complaint (description, student_id, category_id, status)
VALUES ($1, $2, $3, 'Open')
RETURNING complaint_id, description, status, created_at;

-- TRIGGER: trg_complaint_status_log automatically fires:
-- Inserts initial status record into status_history weak entity:
-- INSERT INTO status_history (complaint_id, history_num, status, changed_by, note)
-- VALUES (NEW.complaint_id, 1, 'Open', 'Student', 'Complaint lodged');`,
  },
  {
    id: 4,
    label: 'Complaint Details View (Complex Multi-Join)',
    trigger: 'GET /api/complaints',
    table: 'v_complaint_details',
    type: 'SELECT VIEW',
    tags: ['View', 'Joins'],
    sql: `-- View definition executed:
SELECT c.complaint_id,
       c.description,
       c.status,
       c.created_at,
       c.updated_at,
       c.category_id,
       cat.category_name,
       cat.sla_days,
       d.dept_id,
       d.dept_name,
       s.student_id,
       s.first_name || ' ' || s.last_name AS student_name,
       s.room_no,
       s.email AS student_email,
       h.hostel_id,
       h.hostel_name,
       (c.created_at + (cat.sla_days || ' days')::INTERVAL) AS sla_due,
       (c.status != 'Resolved' AND now() > (c.created_at + (cat.sla_days || ' days')::INTERVAL)) AS is_escalated
FROM   complaint c
JOIN   category cat     ON c.category_id = cat.category_id
JOIN   department d     ON cat.dept_id   = d.dept_id
JOIN   student s        ON c.student_id  = s.student_id
JOIN   hostel h         ON s.hostel_id   = h.hostel_id
ORDER  BY c.created_at DESC;`,
  },
  {
    id: 5,
    label: 'Status History (Weak Entity)',
    trigger: 'GET /api/complaints/:id',
    table: 'status_history',
    type: 'WEAK ENTITY SELECT',
    tags: ['Weak Entity'],
    sql: `-- Composite Primary Key: (complaint_id, history_num)
SELECT history_num,
       complaint_id,
       status,
       changed_at,
       changed_by,
       note
FROM   status_history
WHERE  complaint_id = $1
ORDER  BY history_num ASC;`,
  },
  {
    id: 6,
    label: 'N:M Staff Assignment & Trigger',
    trigger: 'POST /api/complaints/:id/assign',
    table: 'staff_assignment',
    type: 'INSERT + TRIGGER',
    tags: ['N:M', 'Trigger'],
    sql: `-- Insert junction row linking staff member to complaint
INSERT INTO staff_assignment (staff_id, complaint_id, assigned_at)
VALUES ($1, $2, now())
RETURNING *;

-- TRIGGER: trg_assignment_sets_status fires:
-- UPDATE complaint SET status = 'Assigned', updated_at = now()
-- WHERE complaint_id = NEW.complaint_id;`,
  },
  {
    id: 7,
    label: 'SLA Auto-Escalation Stored Procedure',
    trigger: 'POST /api/analytics/escalate-overdue',
    table: 'complaint + category',
    type: 'RPC / STORED PROC',
    tags: ['SLA', 'PL/pgSQL'],
    sql: `-- Call stored database function:
SELECT escalate_overdue_complaints();

-- Stored procedure implementation:
-- UPDATE complaint c
-- SET    status     = 'Escalated',
--        updated_at = now()
-- FROM   category cat
-- WHERE  c.category_id = cat.category_id
--   AND  c.status NOT IN ('Resolved', 'Escalated')
--   AND  c.created_at < now() - (cat.sla_days * INTERVAL '1 day');`,
  },
  {
    id: 8,
    label: 'Executive Dashboard Aggregates',
    trigger: 'GET /api/analytics/dashboard-stats',
    table: 'complaint',
    type: 'AGGREGATION',
    tags: ['Analytics'],
    sql: `SELECT
  COUNT(*)                                             AS total,
  COUNT(*) FILTER (WHERE status = 'Open')             AS open_count,
  COUNT(*) FILTER (WHERE status = 'Assigned')         AS assigned_count,
  COUNT(*) FILTER (WHERE status = 'In-Progress')      AS in_progress,
  COUNT(*) FILTER (WHERE status = 'Resolved')         AS resolved,
  COUNT(*) FILTER (WHERE status = 'Escalated')        AS escalated
FROM complaint;`,
  },
  {
    id: 9,
    label: 'Staff Workload Aggregated View',
    trigger: 'GET /api/analytics/staff-workload',
    table: 'v_staff_workload',
    type: 'GROUP BY VIEW',
    tags: ['View', 'Group By'],
    sql: `-- View definition with filtered counts:
SELECT s.staff_id,
       s.first_name || ' ' || s.last_name AS full_name,
       s.designation,
       d.dept_name,
       COUNT(sa.assignment_id) FILTER (WHERE sa.unassigned_at IS NULL) AS active_assignments,
       COUNT(sa.assignment_id) FILTER (WHERE c.status = 'Resolved')    AS resolved_total
FROM   staff s
JOIN   department d         ON s.dept_id      = d.dept_id
LEFT JOIN staff_assignment sa ON sa.staff_id  = s.staff_id
LEFT JOIN complaint c        ON c.complaint_id = sa.complaint_id
GROUP  BY s.staff_id, s.first_name, s.last_name, s.designation, d.dept_name
ORDER  BY active_assignments DESC;`,
  },
];

/* ─── Tag Colour Map ─── */
const TAG_COLORS = {
  Auth: 'bg-blue-900 text-blue-200 border-blue-700',
  JWT: 'bg-indigo-900 text-indigo-200 border-indigo-700',
  Bcrypt: 'bg-cyan-900 text-cyan-200 border-cyan-700',
  Write: 'bg-amber-900 text-amber-200 border-amber-700',
  Trigger: 'bg-rose-900 text-rose-200 border-rose-700',
  View: 'bg-emerald-900 text-emerald-200 border-emerald-700',
  'Weak Entity': 'bg-yellow-900 text-yellow-200 border-yellow-700',
  'N:M': 'bg-pink-900 text-pink-200 border-pink-700',
  SLA: 'bg-red-900 text-red-200 border-red-700',
  'PL/pgSQL': 'bg-violet-900 text-violet-200 border-violet-700',
  Analytics: 'bg-teal-900 text-teal-200 border-teal-700',
  Joins: 'bg-sky-900 text-sky-200 border-sky-700',
  'Group By': 'bg-fuchsia-900 text-fuchsia-200 border-fuchsia-700',
};

/* ─── SQL Syntax Highlighter ─── */
const SQL_KEYWORDS = /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|IS|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|INTO|VALUES|SET|RETURNING|CREATE|OR\s+REPLACE|FUNCTION|VIEW|TABLE|TRIGGER|AFTER|BEFORE|FOR|EACH|ROW|BEGIN|END|DECLARE|RETURNS|LANGUAGE|SECURITY|DEFINER|EXISTS|WITH|COALESCE|COUNT|ROUND|FILTER|INTERVAL|USING|INTEGER|BOOLEAN|TEXT|NOW)\b/gi;

function highlightSQL(sql) {
  if (!sql) return null;
  const lines = sql.split('\n');
  return lines.map((line, lineIdx) => {
    if (line.trimStart().startsWith('--')) {
      return (
        <div key={lineIdx} className="text-slate-500 italic">
          {line}
        </div>
      );
    }

    const tokens = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      const strMatch = remaining.match(/^('[^']*')/);
      if (strMatch) {
        tokens.push(<span key={key++} className="text-emerald-400">{strMatch[1]}</span>);
        remaining = remaining.slice(strMatch[1].length);
        continue;
      }

      const commentMatch = remaining.match(/^(--.*)/);
      if (commentMatch) {
        tokens.push(<span key={key++} className="text-slate-500 italic">{commentMatch[1]}</span>);
        remaining = '';
        continue;
      }

      const kwMatch = remaining.match(SQL_KEYWORDS);
      if (kwMatch && remaining.toUpperCase().startsWith(kwMatch[0].toUpperCase())) {
        tokens.push(<span key={key++} className="text-sky-400 font-bold">{remaining.slice(0, kwMatch[0].length)}</span>);
        remaining = remaining.slice(kwMatch[0].length);
        continue;
      }

      const tableMatch = remaining.match(/^(v_complaint_details|v_staff_workload|v_student_summary|complaint|student|staff|hostel|category|department|staff_assignment|status_history|notification)\b/i);
      if (tableMatch) {
        tokens.push(<span key={key++} className="text-amber-300 font-semibold">{tableMatch[1]}</span>);
        remaining = remaining.slice(tableMatch[1].length);
        continue;
      }

      tokens.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }

    return <div key={lineIdx}>{tokens}</div>;
  });
}

/* ─── Query Card Component ─── */
function QueryCard({ item, isLive = false }) {
  const [expanded, setExpanded] = useState(isLive);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(item.sql || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={() => setExpanded(v => !v)}
      className="rounded-lg border border-slate-800 bg-slate-900/90 hover:border-slate-700 transition-all overflow-hidden cursor-pointer mb-2"
    >
      <div className="flex items-center justify-between p-3 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {isLive ? (
              <>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  item.method === 'GET' ? 'bg-blue-900/80 text-blue-300' :
                  item.method === 'POST' ? 'bg-emerald-900/80 text-emerald-300' :
                  item.method === 'PATCH' ? 'bg-amber-900/80 text-amber-300' : 'bg-rose-900/80 text-rose-300'
                }`}>
                  {item.method}
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate">{item.endpoint}</span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                  {item.durationMs ?? 0}ms
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  ● {item.status || 200}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-mono text-slate-400">#{item.id}</span>
                <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 rounded px-1.5 py-0.5 font-mono">{item.type}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-slate-400 font-mono">
              {isLive ? item.timestamp : `Target: ${item.table}`}
            </span>
            {!isLive && item.tags && (
              <div className="flex gap-1 flex-wrap">
                {item.tags.map(t => (
                  <span key={t} className={`text-[9px] px-1 py-0.2 rounded border ${TAG_COLORS[t] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className={`text-[10px] px-2 py-1 rounded font-mono border transition-all ${
              copied
                ? 'bg-emerald-800 border-emerald-600 text-emerald-100'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {copied ? '✓ Copied' : '⎘ Copy SQL'}
          </button>
          <span className="text-xs text-slate-500">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="border-t border-slate-800 bg-slate-950 p-3 overflow-x-auto">
              <pre className="text-xs font-mono leading-5 whitespace-pre-wrap break-words text-slate-300">
                {highlightSQL(item.sql || '-- No SQL attached')}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Floating Inspector Component ─── */
export default function DevQueryViewer() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('live'); // 'live' | 'catalog' | 'schema'
  const [liveQueries, setLiveQueries] = useState(() => {
    try {
      const saved = sessionStorage.getItem('campus_dbms_queries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [justExecuted, setJustExecuted] = useState(false);
  const pulseTimerRef = useRef(null);

  // Listen for queries emitted by api.js
  useEffect(() => {
    const handleQuery = (e) => {
      if (!e.detail) return;
      setLiveQueries(prev => {
        const next = [e.detail, ...prev].slice(0, 50);
        try {
          sessionStorage.setItem('campus_dbms_queries', JSON.stringify(next));
        } catch {
          // ignore storage quota error
        }
        return next;
      });

      // Pulse animation on the toggle button
      setJustExecuted(true);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => setJustExecuted(false), 1200);
    };

    window.addEventListener('dbms:query-executed', handleQuery);
    return () => window.removeEventListener('dbms:query-executed', handleQuery);
  }, []);

  // Keyboard shortcut Ctrl+Shift+D
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClear = () => {
    setLiveQueries([]);
    try {
      sessionStorage.removeItem('campus_dbms_queries');
    } catch {}
  };

  const handleRunTestQuery = async () => {
    try {
      await apiRequest('/lookups', 'GET');
    } catch (err) {
      console.error('Test query error:', err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] select-none font-sans">
      {/* Floating Pill Toggle Button */}
      {!open && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setOpen(true)}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl shadow-2xl border text-xs font-medium transition-all ${
            justExecuted
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-emerald-900/50'
              : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
          }`}
          title="Open Live DBMS Query Inspector (Ctrl+Shift+D)"
        >
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${justExecuted ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
            <span className="font-mono font-bold text-[11px] text-amber-400">DBMS Inspector</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
            {liveQueries.length} {liveQueries.length === 1 ? 'query' : 'queries'}
          </span>
          <span className="text-[9px] bg-red-950 text-red-300 border border-red-800 px-1 py-0.5 rounded font-bold uppercase tracking-wider">
            DEV
          </span>
        </motion.button>
      )}

      {/* Floating Inspector Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-[580px] max-w-[calc(100vw-32px)] max-h-[75vh] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-white font-mono">Live DBMS Query Inspector</span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  PostgreSQL / MySQL
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+D</span>
                <button
                  onClick={() => setOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs transition-colors"
                  title="Close Inspector"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/50 shrink-0 text-xs font-medium">
              <button
                onClick={() => setTab('live')}
                className={`flex-1 py-2 text-center transition-all border-b-2 font-mono ${
                  tab === 'live'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                ● Live Executed ({liveQueries.length})
              </button>
              <button
                onClick={() => setTab('catalog')}
                className={`flex-1 py-2 text-center transition-all border-b-2 font-mono ${
                  tab === 'catalog'
                    ? 'border-sky-500 text-sky-400 bg-sky-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                📚 Catalog ({SQL_CATALOG.length})
              </button>
              <button
                onClick={() => setTab('schema')}
                className={`flex-1 py-2 text-center transition-all border-b-2 font-mono ${
                  tab === 'schema'
                    ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                🗄️ Tables &amp; Views
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {/* Tab 1: Live Executed Queries */}
              {tab === 'live' && (
                <>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                    <span>Queries executed in current session:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRunTestQuery}
                        className="text-sky-400 hover:text-sky-300 text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/50 border border-sky-800 transition-colors"
                      >
                        ▶ Test /lookups
                      </button>
                      {liveQueries.length > 0 && (
                        <button
                          onClick={handleClear}
                          className="text-rose-400 hover:text-rose-300 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/50 border border-rose-800 transition-colors"
                        >
                          Clear Log
                        </button>
                      )}
                    </div>
                  </div>

                  {liveQueries.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-3">
                      <div className="text-2xl">⚡</div>
                      <p className="text-xs text-slate-300 font-medium">No live queries recorded yet.</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        Any action on the site (logging in, viewing complaints, updating status, clicking tabs) will stream the actual executed SQL query here in real time.
                      </p>
                      <button
                        onClick={handleRunTestQuery}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                      >
                        Run Live Test Query Now
                      </button>
                    </div>
                  ) : (
                    liveQueries.map(q => (
                      <QueryCard key={q.id} item={q} isLive={true} />
                    ))
                  )}
                </>
              )}

              {/* Tab 2: Catalog of Core Queries */}
              {tab === 'catalog' && (
                <>
                  <div className="text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
                    Comprehensive SQL documentation for GEC DBMS Lab demonstration:
                  </div>
                  {SQL_CATALOG.map(item => (
                    <QueryCard key={item.id} item={item} isLive={false} />
                  ))}
                </>
              )}

              {/* Tab 3: Schema & Architecture */}
              {tab === 'schema' && (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5 font-mono">
                      <span>🗄️</span> 9 Core Relational Tables
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-amber-400 font-bold">department</span>: (dept_id PK, dept_name)
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-amber-400 font-bold">staff</span>: (staff_id PK, dept_id FK, designation)
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-amber-400 font-bold">hostel</span>: (hostel_id PK, warden_id FK)
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-amber-400 font-bold">student</span>: (student_id PK, hostel_id FK, password_hash)
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-amber-400 font-bold">category</span>: (category_id PK, dept_id FK, sla_days)
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-amber-400 font-bold">complaint</span>: (complaint_id PK, student_id FK, status)
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-amber-400 font-bold">status_history</span>: (complaint_id, history_num) PK (Weak)
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-amber-400 font-bold">staff_assignment</span>: N:M Junction Table
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5 font-mono">
                      <span>👁️</span> 3 Relational Views
                    </h3>
                    <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-emerald-400 font-bold">v_complaint_details</span>: Joins complaint, student, hostel, category, department with SLA status calculation.
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-emerald-400 font-bold">v_staff_workload</span>: Aggregated count of active work assignments and resolved totals per staff member.
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-emerald-400 font-bold">v_student_summary</span>: Per-student summary of total filed, open, and resolved grievances.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-900 text-[10px] text-slate-400 shrink-0 font-mono">
              <span>Campus Complaint Tracker · GEC DBMS Lab</span>
              <span>Node.js Backend &amp; Supabase PostgreSQL</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
