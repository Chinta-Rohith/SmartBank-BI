import React, { useState, useEffect } from 'react';
import {
  Users, Search, Filter, Plus, Eye, DollarSign, CreditCard,
  AlertCircle, ShieldCheck, UserCheck, X
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('All');
  const [riskRating, setRiskRating] = useState('All');
  const [loading, setLoading] = useState(true);

  // Selected customer for modal
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Add Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustForm, setNewCustForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    age: 35,
    gender: 'Female',
    annual_income: 75000,
    monthly_expenses: 2800,
    credit_score: 710,
    employment_status: 'Employed',
    employment_type: 'Corporate',
    account_balance: 14500,
    total_banking_products: 2,
    avg_monthly_spending: 2200
  });
  const [submittingCust, setSubmittingCust] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        ...(search ? { search } : {}),
        ...(segment !== 'All' ? { segment } : {}),
        ...(riskRating !== 'All' ? { risk_rating: riskRating } : {})
      };
      const res = await api.getCustomers(params);
      setCustomers(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, segment, riskRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleOpenDetail = async (id) => {
    setSelectedCustomerId(id);
    setLoadingDetail(true);
    try {
      const res = await api.getCustomerById(id);
      setCustomerDetail(res);
    } catch (err) {
      alert('Failed to load customer profile details: ' + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setSubmittingCust(true);
    try {
      await api.createCustomer(newCustForm);
      setIsAddModalOpen(false);
      fetchCustomers();
      alert('Customer account successfully registered!');
    } catch (err) {
      alert('Failed to create customer: ' + err.message);
    } finally {
      setSubmittingCust(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Portfolio & Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Directory of {total.toLocaleString()} individual banking profiles with segmentation & risk telemetry
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, email address, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Segment:</span>
          </div>
          <select
            value={segment}
            onChange={(e) => { setSegment(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Segments</option>
            <option value="Premium Customers">Premium</option>
            <option value="Regular Customers">Regular</option>
            <option value="Emerging Customers">Emerging</option>
            <option value="High-Risk Customers">High-Risk</option>
          </select>

          <select
            value={riskRating}
            onChange={(e) => { setRiskRating(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Risk Tiers</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving customer records..." />
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No customer accounts found matching current query parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Annual Income</th>
                  <th className="py-3 px-4">Credit Score</th>
                  <th className="py-3 px-4">Account Balance</th>
                  <th className="py-3 px-4">Segment</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">
                      {c.customer_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{c.full_name}</div>
                      <div className="text-[11px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      ${c.annual_income?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <span className={`px-2 py-0.5 rounded font-semibold ${
                        c.credit_score >= 720 ? 'text-emerald-700 bg-emerald-50' :
                        c.credit_score >= 620 ? 'text-blue-700 bg-blue-50' : 'text-rose-700 bg-rose-50'
                      }`}>
                        {c.credit_score}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      ${c.account_balance?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge text={c.segment} variant={c.segment} size="xs" />
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge text={c.risk_rating} variant={c.risk_rating} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(c.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
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

      {/* Customer Detail Profile Modal */}
      <Modal
        isOpen={!!selectedCustomerId}
        onClose={() => { setSelectedCustomerId(null); setCustomerDetail(null); }}
        title="Comprehensive Customer Dossier"
        maxWidth="max-w-3xl"
      >
        {loadingDetail || !customerDetail ? (
          <LoadingSpinner text="Compiling financial & loan ledger..." />
        ) : (
          <div className="space-y-6">
            {/* Header snapshot */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">{customerDetail.full_name}</h4>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {customerDetail.customer_id} | {customerDetail.email} | {customerDetail.phone}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge text={customerDetail.segment} variant={customerDetail.segment} />
                <Badge text={`Risk: ${customerDetail.risk_rating}`} variant={customerDetail.risk_rating} />
              </div>
            </div>

            {/* Financial attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Annual Income</span>
                <span className="text-sm font-bold text-slate-900">${customerDetail.annual_income?.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Credit Score</span>
                <span className="text-sm font-bold text-blue-700">{customerDetail.credit_score}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Balance</span>
                <span className="text-sm font-bold text-emerald-700">${customerDetail.account_balance?.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Monthly Expenses</span>
                <span className="text-sm font-bold text-slate-900">${customerDetail.monthly_expenses?.toLocaleString()}</span>
              </div>
            </div>

            {/* Loans History Table */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Active & Historical Loans ({customerDetail.loans?.length || 0})
              </h5>
              {customerDetail.loans?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No credit facilities associated with this profile.</p>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs divide-y divide-slate-100">
                    <thead className="bg-slate-50 font-semibold text-slate-500">
                      <tr>
                        <th className="py-2 px-3">Loan ID</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Sanctioned</th>
                        <th className="py-2 px-3">EMI</th>
                        <th className="py-2 px-3">Outstanding</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerDetail.loans.map((l) => (
                        <tr key={l.id}>
                          <td className="py-2 px-3 font-mono font-medium text-blue-600">{l.loan_id}</td>
                          <td className="py-2 px-3">{l.loan_type}</td>
                          <td className="py-2 px-3 font-semibold">${l.loan_amount?.toLocaleString()}</td>
                          <td className="py-2 px-3">${l.monthly_emi}</td>
                          <td className="py-2 px-3">${l.outstanding_balance?.toLocaleString()}</td>
                          <td className="py-2 px-3">
                            <Badge text={l.status} variant={l.status} size="xs" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Recent Ledger Activity
              </h5>
              {customerDetail.transactions?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No recent transactions logged.</p>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs divide-y divide-slate-100">
                    <thead className="bg-slate-50 font-semibold text-slate-500">
                      <tr>
                        <th className="py-2 px-3">Txn ID</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Channel</th>
                        <th className="py-2 px-3">Amount</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerDetail.transactions.slice(0, 5).map((t) => (
                        <tr key={t.id}>
                          <td className="py-2 px-3 font-mono text-slate-600">{t.transaction_id}</td>
                          <td className="py-2 px-3">{t.transaction_type}</td>
                          <td className="py-2 px-3">{t.channel}</td>
                          <td className="py-2 px-3 font-semibold">${t.amount?.toLocaleString()}</td>
                          <td className="py-2 px-3">
                            <span className="text-emerald-700 font-medium">{t.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Banking Customer"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={newCustForm.full_name}
                onChange={(e) => setNewCustForm({ ...newCustForm, full_name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate / Personal Email</label>
              <input
                type="email"
                required
                value={newCustForm.email}
                onChange={(e) => setNewCustForm({ ...newCustForm, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john.doe@domain.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={newCustForm.phone}
                onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1-555-0199"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min="18"
                max="90"
                value={newCustForm.age}
                onChange={(e) => setNewCustForm({ ...newCustForm, age: parseInt(e.target.value) || 18 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Income ($)</label>
              <input
                type="number"
                required
                value={newCustForm.annual_income}
                onChange={(e) => setNewCustForm({ ...newCustForm, annual_income: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Expenses ($)</label>
              <input
                type="number"
                required
                value={newCustForm.monthly_expenses}
                onChange={(e) => setNewCustForm({ ...newCustForm, monthly_expenses: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Score (FICO)</label>
              <input
                type="number"
                min="300"
                max="850"
                required
                value={newCustForm.credit_score}
                onChange={(e) => setNewCustForm({ ...newCustForm, credit_score: parseInt(e.target.value) || 650 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Account Balance ($)</label>
              <input
                type="number"
                value={newCustForm.account_balance}
                onChange={(e) => setNewCustForm({ ...newCustForm, account_balance: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Status</label>
              <select
                value={newCustForm.employment_status}
                onChange={(e) => setNewCustForm({ ...newCustForm, employment_status: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="Employed">Employed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business">Business</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Sector</label>
              <select
                value={newCustForm.employment_type}
                onChange={(e) => setNewCustForm({ ...newCustForm, employment_type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="Corporate">Corporate</option>
                <option value="Salaried">Salaried</option>
                <option value="Public Sector">Public Sector</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingCust}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              {submittingCust ? 'Registering...' : 'Register Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
