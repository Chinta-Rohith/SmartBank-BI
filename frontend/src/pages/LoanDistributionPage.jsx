import React, { useState, useEffect } from 'react';
import {
  BarChart3, Filter, ShieldAlert, CheckCircle, TrendingUp,
  AlertTriangle, DollarSign, Lightbulb, ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function LoanDistributionPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loanType, setLoanType] = useState('All');
  const [segment, setSegment] = useState('All');
  const [riskCategory, setRiskCategory] = useState('All');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {
        ...(loanType !== 'All' ? { loan_type: loanType } : {}),
        ...(segment !== 'All' ? { customer_segment: segment } : {}),
        ...(riskCategory !== 'All' ? { risk_category: riskCategory } : {})
      };
      const res = await api.getLoanAnalytics(params);
      setAnalytics(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [loanType, segment, riskCategory]);

  if (loading && !analytics) return <LoadingSpinner text="Computing loan portfolio exposure & defaults..." />;

  const summary = analytics?.summary || {};
  const defaults = analytics?.default_by_type || [];
  const recommendations = analytics?.recommendations || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Loan Distribution Analytics & Portfolio Quality
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed loan portfolio exposure, delinquency breakdown by facility type, and AI risk advisory
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        <select
          value={loanType}
          onChange={(e) => setLoanType(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-700"
        >
          <option value="All">All Loan Categories</option>
          <option value="Personal Loan">Personal Loan</option>
          <option value="Home Loan">Home Loan</option>
          <option value="Vehicle Loan">Vehicle Loan</option>
          <option value="Education Loan">Education Loan</option>
        </select>

        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-700"
        >
          <option value="All">All Customer Segments</option>
          <option value="Premium Customers">Premium</option>
          <option value="Regular Customers">Regular</option>
          <option value="Emerging Customers">Emerging</option>
          <option value="High-Risk Customers">High-Risk</option>
        </select>

        <select
          value={riskCategory}
          onChange={(e) => setRiskCategory(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-700"
        >
          <option value="All">All Risk Ratings</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
        </select>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Sanctioned</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            ${((summary.total_approved_amount || 0) / 1000000).toFixed(2)}M
          </span>
          <span className="text-xs text-slate-500 mt-1 block">{summary.total_approved?.toLocaleString()} facilities</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Outstanding Balance</span>
          <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
            ${((summary.outstanding_balance || 0) / 1000000).toFixed(2)}M
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Uncollected principal balance</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Declined Applications</span>
          <span className="text-2xl font-extrabold text-slate-700 mt-1 block">
            {summary.total_rejected || 0}
          </span>
          <span className="text-xs text-rose-600 mt-1 block">
            ${((summary.total_rejected_amount || 0) / 1000).toFixed(0)}K protected
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Portfolio Health</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">Optimal</span>
          <span className="text-xs text-slate-500 mt-1 block">Fully collateralized ratio: 58%</span>
        </div>
      </div>

      {/* Default Percentage by Loan Type Table & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Delinquency Rate by Facility Type</h3>
          <p className="text-xs text-slate-500 mb-4">Default percentage comparison across credit products</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defaults}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="loan_type" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} unit="%" />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Default Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="default_percentage" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Portfolio Allocation Summary</h3>
            <p className="text-xs text-slate-500 mb-4">Disbursed balance and default counts</p>

            <div className="space-y-3">
              {defaults.map((d) => (
                <div key={d.loan_type} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{d.loan_type}</span>
                    <span className="text-[11px] text-slate-500">
                      ${(d.total_amount / 1000000).toFixed(2)}M ({d.total_loans} loans)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      d.default_percentage > 12 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {d.default_percentage}% Def.
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{d.defaults} defaults</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analytical Portfolio Recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Portfolio Quality Optimization Recommendations
            </h3>
            <p className="text-xs text-slate-500">
              Data-driven risk mitigation and capital allocation policies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                  <Badge text={`${rec.priority} Priority`} variant={rec.priority} size="xs" />
                </div>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{rec.rationale}</p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{rec.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
