import React, { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, ShieldAlert, FileText, ArrowRight,
  Info, DollarSign, Calculator, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/common/Badge';

export default function EligibilityCheckerPage() {
  const [formData, setFormData] = useState({
    customer_id: 'CUST-10492',
    loan_type: 'Home Loan',
    annual_income: 115000,
    monthly_expenses: 3200,
    credit_score: 740,
    requested_loan_amount: 320000,
    loan_tenure: 240,
    existing_liabilities: 650,
    employment_type: 'Corporate',
    repayment_history: 0
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.checkEligibility(formData);
      setResult(res);
    } catch (err) {
      alert('Eligibility evaluation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Automated Loan Eligibility Recommendation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Rule-based underwriting policy verification combined with Machine Learning risk scoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form: 6 Cols */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Calculator className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Application & Income Assessment</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer ID (Optional)</label>
                <input
                  type="text"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Facility Type</label>
                <select
                  value={formData.loan_type}
                  onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="Home Loan">Home Loan (Mortgage)</option>
                  <option value="Personal Loan">Flexible Personal Loan</option>
                  <option value="Vehicle Loan">Express Vehicle Loan</option>
                  <option value="Education Loan">NextGen Education Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Gross Income ($)</label>
                <input
                  type="number"
                  required
                  value={formData.annual_income}
                  onChange={(e) => setFormData({ ...formData, annual_income: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Living Expenses ($)</label>
                <input
                  type="number"
                  required
                  value={formData.monthly_expenses}
                  onChange={(e) => setFormData({ ...formData, monthly_expenses: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Score (FICO)</label>
                <input
                  type="number"
                  min="300"
                  max="850"
                  required
                  value={formData.credit_score}
                  onChange={(e) => setFormData({ ...formData, credit_score: parseInt(e.target.value) || 600 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-semibold text-blue-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Existing Monthly Liabilities ($)</label>
                <input
                  type="number"
                  value={formData.existing_liabilities}
                  onChange={(e) => setFormData({ ...formData, existing_liabilities: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Loan Principal ($)</label>
                <input
                  type="number"
                  required
                  value={formData.requested_loan_amount}
                  onChange={(e) => setFormData({ ...formData, requested_loan_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tenure (Months)</label>
                <select
                  value={formData.loan_tenure}
                  onChange={(e) => setFormData({ ...formData, loan_tenure: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="12">12 Months (1 Year)</option>
                  <option value="36">36 Months (3 Years)</option>
                  <option value="60">60 Months (5 Years)</option>
                  <option value="120">120 Months (10 Years)</option>
                  <option value="180">180 Months (15 Years)</option>
                  <option value="240">240 Months (20 Years)</option>
                  <option value="360">360 Months (30 Years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Corporate">Corporate Professional</option>
                  <option value="Salaried">Salaried Employee</option>
                  <option value="Public Sector">Public Sector</option>
                  <option value="Self-Employed">Self-Employed / Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prior Missed Installments</label>
                <select
                  value={formData.repayment_history}
                  onChange={(e) => setFormData({ ...formData, repayment_history: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="0">0 Missed (Clean)</option>
                  <option value="1">1 Missed Payment</option>
                  <option value="2">2 Missed Payments</option>
                  <option value="3">3+ Delinquencies</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Verifying Statutory Underwriting Policies...</span>
              ) : (
                <>
                  <span>Evaluate Automated Eligibility</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Assessment: 6 Cols */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              {/* Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Underwriting Decision
                  </span>
                  <Badge text={result.loan_eligibility_status} variant={result.loan_eligibility_status} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    ML Risk Rating
                  </span>
                  <Badge text={result.risk_category} variant={result.risk_category} />
                </div>
              </div>

              {/* DTI and EMI Highlights */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Projected Debt-To-Income (DTI)
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {result.debt_to_income_ratio}%
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Policy Ceiling: {result.max_dti_allowed}%
                  </span>
                </div>

                <div className="border-l border-slate-200 pl-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Suggested Max Affordable Loan
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                    ${result.suggested_max_loan_amount?.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Est. EMI: ${result.estimated_monthly_emi?.toLocaleString()} /mo
                  </span>
                </div>
              </div>

              {/* Policy Rules Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Statutory Banking Policy Checklist
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(result.policy_checks || {}).map(([rule, passed], idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        passed ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
                      }`}
                    >
                      <span className="font-medium">{rule}</span>
                      <span className="font-bold text-[11px]">
                        {passed ? '✓ PASSED' : '✕ BREACHED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rationale & Reasons */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Recommendation Justification
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {result.reasons?.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Regulatory Disclaimer (Mandatory Requirement) */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-normal flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Educational Prototype Notice:</strong> {result.disclaimer}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center text-slate-400 text-xs">
              Complete applicant information to evaluate automated eligibility according to regulatory thresholds.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
