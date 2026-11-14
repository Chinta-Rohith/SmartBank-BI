import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Building2, Award, PieChart as PieIcon,
  BarChart3, Info, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, AreaChart, Area
} from 'recharts';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function RevenuePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRevenueSummary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Compiling financial income statement & profitability telemetry..." />;

  const fin = data?.financial_summary || {};
  const products = data?.product_performance || [];
  const topCusts = data?.top_10_customers || [];
  const branches = data?.branch_profitability || [];
  const monthlyTrends = data?.monthly_trends || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Revenue & Profitability Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audited income streams, net margins, top 10 valuable customer relationships, and branch yield
        </p>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Gross Interest Income</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            ${((fin.interest_income || 0) / 1000000).toFixed(2)}M
          </span>
          <span className="text-xs text-emerald-600 mt-1 block">
            Loan coupon yield contribution
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Non-Interest Fee Income</span>
          <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
            ${(((fin.card_revenue || 0) + (fin.service_charges || 0)) / 1000).toFixed(0)}K
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            Cards + liquidity maintenance fees
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Operational Costs</span>
          <span className="text-2xl font-extrabold text-rose-700 mt-1 block">
            ${((fin.operational_costs || 0) / 1000000).toFixed(2)}M
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            Tech infra, branches & regulatory provisions
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Net Bank Profit</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            ${((fin.net_profit || 0) / 1000000).toFixed(2)}M
          </span>
          <span className="text-xs text-emerald-600 mt-1 font-semibold block">
            {fin.profit_margin}% Operating Margin
          </span>
        </div>
      </div>

      {/* Monthly Trends & Product Profitability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Revenue & Profit Expansion</h3>
              <p className="text-xs text-slate-500">Interest yield vs net profit trends over last 6 billing cycles</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(val) => [`$${val.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="interest_income" name="Interest Revenue" stroke="#2563eb" fillOpacity={1} fill="url(#interestGrad)" />
                <Area type="monotone" dataKey="net_profit" name="Net Profit" stroke="#10b981" fillOpacity={1} fill="url(#profitGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Profitability */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Most Profitable Banking Products</h3>
            <p className="text-xs text-slate-500 mb-4">Ranked by gross margin and portfolio volume</p>

            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.product} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{p.product}</span>
                    <span className="text-[11px] text-slate-500">
                      ${(p.revenue / 1000).toFixed(0)}K revenue ({p.volume} active units)
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {p.margin}% Margin
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Most Valuable Customers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Award className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top 10 Most Valuable Customer Relationships</h3>
            <p className="text-xs text-slate-500">Ranked by annual interest generation and liquid asset cushion</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 font-bold text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Client Identifier</th>
                <th className="py-2.5 px-3">Full Legal Name</th>
                <th className="py-2.5 px-3">Segment Tier</th>
                <th className="py-2.5 px-3">Account Balance</th>
                <th className="py-2.5 px-3">Active Loans</th>
                <th className="py-2.5 px-3">Est. Annual Revenue</th>
                <th className="py-2.5 px-3 text-right">VIP Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topCusts.map((c, idx) => (
                <tr key={c.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-3 px-3 font-mono font-medium text-blue-700">{c.customer_id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{c.full_name}</td>
                  <td className="py-3 px-3">
                    <Badge text={c.segment} variant={c.segment} size="xs" />
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">${c.account_balance?.toLocaleString()}</td>
                  <td className="py-3 px-3 font-medium">{c.active_loans} Facilities</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">${c.estimated_annual_revenue?.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                      {c.profit_tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Profitability Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Regional Branch Financial Performance & Yield</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 font-bold text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Branch Code</th>
                <th className="py-2.5 px-3">Center Name</th>
                <th className="py-2.5 px-3">City & State</th>
                <th className="py-2.5 px-3">Total Disbursed</th>
                <th className="py-2.5 px-3">Interest Income</th>
                <th className="py-2.5 px-3">Operational Overhead</th>
                <th className="py-2.5 px-3 text-right">Net Branch Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {branches.map((b) => (
                <tr key={b.branch_code} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-mono font-medium text-blue-700">{b.branch_code}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{b.branch_name}</td>
                  <td className="py-3 px-3">{b.city}</td>
                  <td className="py-3 px-3">${(b.total_disbursed / 1000000).toFixed(2)}M</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">${(b.interest_revenue / 1000).toFixed(0)}K</td>
                  <td className="py-3 px-3 text-rose-600">${(b.operational_expense / 1000).toFixed(0)}K</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700">
                    +${(b.net_contribution / 1000).toFixed(0)}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accounting Transparency Note */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-500 shrink-0" />
        <span><strong>Audit Transparency Disclaimer:</strong> {data?.transparency_note}</span>
      </div>
    </div>
  );
}
