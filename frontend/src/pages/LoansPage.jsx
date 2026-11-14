import React, { useState, useEffect } from 'react';
import {
  CreditCard, Search, Filter, AlertTriangle, CheckCircle2,
  Clock, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [loanType, setLoanType] = useState('All');
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        ...(search ? { search } : {}),
        ...(loanType !== 'All' ? { loan_type: loanType } : {}),
        ...(status !== 'All' ? { status } : {})
      };
      const res = await api.getLoans(params);
      setLoans(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [page, loanType, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLoans();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Credit Facilities & Portfolio Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time management of {total.toLocaleString()} active, repaid, and monitored loan accounts
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by loan ID, borrower full name, or customer code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Type:</span>
          </div>
          <select
            value={loanType}
            onChange={(e) => { setLoanType(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Loan Types</option>
            <option value="Personal Loan">Personal Loan</option>
            <option value="Home Loan">Home Loan</option>
            <option value="Vehicle Loan">Vehicle Loan</option>
            <option value="Education Loan">Education Loan</option>
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="In Repayment">In Repayment</option>
            <option value="Fully Paid">Fully Paid</option>
            <option value="Defaulted">Defaulted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Loans Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving portfolio ledger records..." />
        ) : loans.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No credit records found matching selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Loan Account</th>
                  <th className="py-3 px-4">Borrower Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Sanctioned Principal</th>
                  <th className="py-3 px-4">Tenure & Rate</th>
                  <th className="py-3 px-4">Monthly EMI</th>
                  <th className="py-3 px-4">Outstanding Balance</th>
                  <th className="py-3 px-4">DTI Ratio</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">
                      {l.loan_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{l.customer?.full_name || 'Borrower'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{l.customer?.customer_id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {l.loan_type}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${l.loan_amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>{l.tenure_months} months</div>
                      <div className="text-[11px] text-slate-400">{(l.interest_rate * 100).toFixed(2)}% APR</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      ${l.monthly_emi?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-700">
                      ${l.outstanding_balance?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-medium ${
                        l.debt_to_income_ratio > 0.45 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {(l.debt_to_income_ratio * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge text={l.status} variant={l.status} size="xs" />
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
    </div>
  );
}
