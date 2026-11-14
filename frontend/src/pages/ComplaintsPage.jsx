import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning, Search, Filter, Plus, Clock, Smile,
  CheckCircle2, AlertCircle, Edit3, X
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COMPLAINT_CATEGORIES = [
  'Loan Processing Delays',
  'Transaction Failures',
  'Credit Card Issues',
  'Account Access Problems',
  'Incorrect Charges',
  'Customer Service Issues'
];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(15);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Analytics
  const [analytics, setAnalytics] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    customer_id: 1,
    category: 'Loan Processing Delays',
    priority: 'Medium',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit/Resolve Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: 'In Progress',
    priority: 'Medium',
    resolution_notes: '',
    satisfaction_score: 5
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        ...(search ? { search } : {}),
        ...(category !== 'All' ? { category } : {}),
        ...(status !== 'All' ? { status } : {})
      };
      const [listRes, statRes] = await Promise.all([
        api.getComplaints(params),
        api.getComplaintAnalytics()
      ]);
      setComplaints(listRes.items);
      setTotal(listRes.total);
      setTotalPages(listRes.total_pages);
      setAnalytics(statRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, category, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createComplaint(newComplaint);
      setIsAddModalOpen(false);
      setNewComplaint({ customer_id: 1, category: 'Loan Processing Delays', priority: 'Medium', description: '' });
      fetchComplaints();
      alert('Support grievance ticket logged successfully!');
    } catch (err) {
      alert('Failed to log complaint: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenUpdate = (comp) => {
    setSelectedComplaint(comp);
    setUpdateForm({
      status: comp.status,
      priority: comp.priority,
      resolution_notes: comp.resolution_notes || '',
      satisfaction_score: comp.satisfaction_score || 4
    });
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.updateComplaint(selectedComplaint.id, updateForm);
      setSelectedComplaint(null);
      fetchComplaints();
      alert('Ticket status updated successfully!');
    } catch (err) {
      alert('Failed to update ticket: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer Complaint & Grievance Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Omni-channel resolution tracking, CSAT satisfaction audit, and root cause categorizations
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Complaint</span>
        </button>
      </div>

      {/* Analytics KPI Row */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Tickets</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {analytics.summary?.total_complaints}
            </span>
            <span className="text-xs text-emerald-600 mt-1 block">
              {analytics.summary?.resolution_rate}% Resolution Rate
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Backlog</span>
            <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
              {(analytics.summary?.open_count || 0) + (analytics.summary?.in_progress_count || 0)}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              {analytics.summary?.open_count} Open | {analytics.summary?.in_progress_count} In Progress
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Avg Resolution Time</span>
            <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
              {analytics.summary?.avg_resolution_time_hours} hrs
            </span>
            <span className="text-xs text-slate-500 mt-1 block">SLA Target: &lt; 48 hours</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Audited CSAT Score</span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
              {analytics.summary?.avg_satisfaction_score} / 5.0
            </span>
            <span className="text-xs text-slate-500 mt-1 block">Post-resolution client feedback</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by ticket ID, customer name, or issue description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700"
          >
            <option value="All">All Categories</option>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving customer support queue..." />
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No complaints found matching current filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Resolution SLA</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {complaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">
                      {comp.complaint_id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {comp.customer?.full_name || 'Customer'}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {comp.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge text={comp.priority} variant={comp.priority} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={comp.description}>
                      {comp.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge text={comp.status} variant={comp.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4">
                      {comp.resolution_time_hours ? (
                        <span className="font-semibold text-emerald-700">{comp.resolution_time_hours} hrs</span>
                      ) : (
                        <span className="text-slate-400">Under Review</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenUpdate(comp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 text-xs font-medium cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>

      {/* Log Complaint Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log New Customer Complaint Ticket"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer Internal Database ID</label>
            <input
              type="number"
              required
              min="1"
              value={newComplaint.customer_id}
              onChange={(e) => setNewComplaint({ ...newComplaint, customer_id: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Complaint Category</label>
            <select
              value={newComplaint.category}
              onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
            <select
              value={newComplaint.priority}
              onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Incident Description</label>
            <textarea
              required
              rows={4}
              value={newComplaint.description}
              onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
              placeholder="Describe the transaction or banking issue reported by the customer..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Log Grievance Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Complaint Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Manage Complaint Ticket: ${selectedComplaint?.complaint_id}`}
        maxWidth="max-w-xl"
      >
        {selectedComplaint && (
          <form onSubmit={handleUpdateComplaint} className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Reported Issue:</span>
              <p className="text-slate-600">{selectedComplaint.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ticket Status</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={updateForm.priority}
                  onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Resolution Protocol Notes</label>
              <textarea
                rows={3}
                value={updateForm.resolution_notes}
                onChange={(e) => setUpdateForm({ ...updateForm, resolution_notes: e.target.value })}
                placeholder="Document steps taken to remediate the client complaint..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            {updateForm.status === 'Resolved' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Satisfaction CSAT Rating (1 to 5)</label>
                <select
                  value={updateForm.satisfaction_score}
                  onChange={(e) => setUpdateForm({ ...updateForm, satisfaction_score: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-blue-700"
                >
                  <option value="5">5 - Highly Satisfied</option>
                  <option value="4">4 - Satisfied</option>
                  <option value="3">3 - Neutral</option>
                  <option value="2">2 - Dissatisfied</option>
                  <option value="1">1 - Highly Dissatisfied</option>
                </select>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Save Resolution State
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
