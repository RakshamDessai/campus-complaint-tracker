import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Clock, UploadCloud, CheckCircle2 } from 'lucide-react';

export default function FileComplaint() {
  const navigate = useNavigate();
  const { categories, addComplaint, currentUser, loading: contextLoading } = useComplaints();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    categoryId: categories[0]?.Category_ID || categories[0]?.category_id || 'CAT-01',
    description: '',
  });
  const [priority, setPriority] = useState('High');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(currentUser?.room_no || currentUser?.room || 'Hostel Block B, Room 204');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState(categories[0]?.Category_ID || categories[0]?.category_id || 'CAT-01');

  const activeCategory = categories.find(c => (c.Category_ID || c.category_id) === selectedCat) || categories[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please provide a title and description for your grievance.');
      return;
    }

    setLoading(true);
    try {
      const result = await addComplaint({
        description: description.trim(),
        categoryId: parseInt(selectedCat) || selectedCat,
        studentId: currentUser?.id || currentUser?.student_id,
        // legacy fields kept for mock-compat
        title: title.trim(),
        location: location.trim(),
        priority,
        attachmentUrl: fileName ? `uploads/${fileName}` : null
      });

      const createdTicket = result?.data || result;
      const complaintId = createdTicket?.complaint_id || createdTicket?.Complaint_ID || 'N/A';

      toast.success(
        `Your complaint has been submitted to Estate Maintenance under a ${activeCategory?.SLA_Days || activeCategory?.sla_days || 2}-day resolution SLA. An automated tracking timeline has been initialized.`,
        {
          title: `Grievance #${complaintId} Lodged`,
          badge: 'Central Registry'
        }
      );

      navigate('/student/success', { 
        state: { 
          ticketId: complaintId,
          category: createdTicket?.Category_Name || createdTicket?.category_name || activeCategory?.Category_Name,
          title: createdTicket?.Title || title.trim(),
          slaDays: activeCategory ? (activeCategory.SLA_Days || activeCategory.sla_days || 2) : 2,
          location: createdTicket?.Room_No || location
        } 
      });
    } catch (err) {
      toast.error('Failed to submit complaint. Please try again.', { title: 'Submission Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0].name;
      setFileName(selected);
      toast.info(`Inspection media "${selected}" attached and queued for technician diagnostic review.`, {
        title: 'Evidence Uploaded',
        badge: 'File Attached'
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Breadcrumb / Back button */}
      <div>
        <Link to="/student" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Lodge a New Campus Grievance</h1>
        <p className="text-xs text-slate-500">
          Submit your grievance with location details and description. It will be assigned to the responsible department staff for prompt resolution.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        
        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            1. Select Grievance Category
          </label>
          <select
            value={selectedCat}
            onChange={(e) => {
              const catId = e.target.value;
              setSelectedCat(catId);
              const found = categories.find(c => c.Category_ID === catId);
              toast.info(`Selected category "${found?.Category_Name}". Expected SLA is ${found?.SLA_Days} business day(s).`, {
                title: 'Category Selected',
                badge: 'SLA Policy'
              });
            }}
            className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          >
            {categories.map((cat) => (
              <option key={cat.Category_ID || cat.category_id} value={cat.Category_ID || cat.category_id}>
                {cat.Category_Name || cat.category_name} (Expected SLA: {cat.SLA_Days || cat.sla_days || 2} {(cat.SLA_Days || cat.sla_days) === 1 ? 'day' : 'days'})
              </option>
            ))}
          </select>
          {activeCategory && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Standard resolution turnaround: <strong>{(activeCategory.SLA_Days || activeCategory.sla_days || 2) * 24} hours</strong></span>
            </div>
          )}
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            2. Priority Urgency
          </label>
          <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
            {['Low', 'Medium', 'High', 'Critical'].map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => {
                  setPriority(p);
                  toast.info(`Urgency priority adjusted to "${p}". Escalation thresholds calibrated.`, {
                    title: `Priority Tier: ${p}`,
                    badge: 'Urgency'
                  });
                }}
                className={`py-2 rounded-lg border text-center transition-all ${
                  priority === p
                    ? p === 'Critical' ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : p === 'High' ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Specific Location */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            3. Specific Location Details
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Mandovi Hostel Block B, Room 204"
            className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Grievance Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            4. Grievance Subject / Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ceiling fan humming loudly and not spinning"
            className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Description Body */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            5. Comprehensive Description
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail (when it started, exact problem, any risk)..."
            className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Attachment Upload Simulator */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            6. Evidence Photo / Proof (Optional)
          </label>
          <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-colors">
            <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
            <span className="text-xs font-semibold text-slate-700">
              {fileName ? `Attached: ${fileName}` : 'Click to select photo or screenshot'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Submitting...' : 'Submit Grievance to Department'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
