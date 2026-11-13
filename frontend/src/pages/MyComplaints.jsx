import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import { Search, Filter, PlusCircle, ArrowRight, Calendar, User, Copy } from 'lucide-react';

export default function MyComplaints() {
  const { complaints, currentUser, loading } = useComplaints();
  const { toast } = useToast();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const studentId = currentUser?.student_id || currentUser?.studentId || currentUser?.rollNo || currentUser?.id;
  const filteredByStudent = complaints.filter(c => {
    const cid = c.Student_ID || c.student_id;
    return studentId && String(cid) === String(studentId);
  });
  const myComplaints = filteredByStudent.length > 0 ? filteredByStudent : complaints;

  const filtered = myComplaints.filter(c => {
    const status = c.Status || c.status;
    const title = c.Title || c.title || c.description || '';
    const ticketId = String(c.Complaint_ID || c.complaint_id || '');
    const catName = c.Category_Name || c.category_name || '';

    const matchesFilter = filter === 'All' ? true : status === filter;
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                          ticketId.toLowerCase().includes(search.toLowerCase()) ||
                          catName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleFilterChange = (status) => {
    setFilter(status);
    const count = status === 'All' ? myComplaints.length : myComplaints.filter(c => (c.Status || c.status) === status).length;
    toast.info(`Displaying ${count} grievance record(s) matching filter "${status}".`, {
      title: `Filter: ${status}`,
      badge: 'Filter Active'
    });
  };

  const handleCopyId = (id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
    }
    toast.info(`Grievance reference #${id} copied to clipboard.`, {
      title: 'Copied to Clipboard',
      badge: 'Clipboard'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Registered Grievances</h1>
          <p className="text-xs text-slate-500">Track and inspect all historical complaints filed under your student roll ID.</p>
        </div>
        <Link
          to="/student/new"
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Grievance</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {['All', 'Open', 'Assigned', 'In-Progress', 'Resolved', 'Escalated'].map(status => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === status 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, keyword, category..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

      </div>

      {/* Complaints List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-slate-200 rounded h-20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No complaints found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Filed</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => {
                  const ticketId = c.Complaint_ID || c.complaint_id;
                  const title = c.Title || c.title || c.description;
                  const catName = c.Category_Name || c.category_name;
                  const priority = c.Priority || c.priority || 'Medium';
                  const status = c.Status || c.status;
                  const createdAt = c.Created_At || (c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Recent');

                  return (
                    <tr key={ticketId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        <button
                          onClick={() => handleCopyId(ticketId)}
                          title="Click to copy Ticket ID"
                          className="hover:underline flex items-center gap-1 group/btn"
                        >
                          <span>{ticketId}</span>
                          <Copy className="w-3 h-3 text-slate-400 group-hover/btn:text-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {catName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                          priority === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {createdAt}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/student/complaints/${ticketId}`}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded"
                        >
                          <span>Track</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
