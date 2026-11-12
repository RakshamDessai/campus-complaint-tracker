import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Clock, UploadCloud, CheckCircle2 } from 'lucide-react';

export default function FileComplaint() {
  const navigate = useNavigate();
  const { categories, addComplaint, currentUser } = useComplaints();
  const { toast } = useToast();
  
  const [selectedCat, setSelectedCat] = useState(categories[0] ? categories[0].Category_ID : 'CAT-01');
  const [priority, setPriority] = useState('High');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(currentUser.room || 'Hostel Block B, Room 204');
  const [fileName, setFileName] = useState('');

  const activeCategory = categories.find(c => c.Category_ID === selectedCat) || categories[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please provide a title and description for your grievance.');
      return;
    }

    const createdTicket = addComplaint({
      categoryId: selectedCat,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      priority,
      attachmentUrl: fileName ? `uploads/${fileName}` : null
    });

    toast.success(
      `Your complaint has been submitted to Estate Maintenance under a ${activeCategory?.SLA_Days || 2}-day resolution SLA. An automated tracking timeline has been initialized.`,
      {
        title: `Grievance #${createdTicket.Complaint_ID} Lodged`,
        badge: 'Central Registry'
      }
    );

    navigate('/student/success', { 
      state: { 
        ticketId: createdTicket.Complaint_ID, 
        category: createdTicket.Category_Name,
        title: createdTicket.Title,
        slaDays: activeCategory ? activeCategory.SLA_Days : 2,
        location: createdTicket.Room_No
      } 
    });
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
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full text-xs font-medium px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          >
            {categories.map((cat) => (
              <option key={cat.Category_ID} value={cat.Category_ID}>
                {cat.Category_Name} (Expected SLA: {cat.SLA_Days} {cat.SLA_Days === 1 ? 'day' : 'days'})
              </option>
            ))}
          </select>
          {activeCategory && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Standard resolution turnaround: <strong>{activeCategory.SLA_Days * 24} hours</strong></span>
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
                onClick={() => setPriority(p)}
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Grievance to Department</span>
          </button>
        </div>

      </form>

    </div>
  );
}
