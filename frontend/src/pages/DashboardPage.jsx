import React, { useState, useEffect } from 'react';
import {
  Users, CreditCard, DollarSign, AlertTriangle, CheckCircle,
  TrendingUp, RefreshCw, BarChart2, Smile
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { api } from '../services/api';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#2563eb', '#0284c7', '#0d9488', '#f59e0b', '#8b5cf6', '#ec4899'];
const RISK_COLORS = { 'Low Risk': '#10b981', 'Medium Risk': '#f59e0b', 'High Risk': '#ef4444' };

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [kpiRes, chartRes] = await Promise.all([
        api.getDashboardKPIs(),
        api.getDashboardCharts()
      ]);
      setKpis(kpiRes);
      setCharts(chartRes);
    } catch (err) {
      setError(err.message || 'Failed to fetch dynamic dashboard analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) return <LoadingSpinner text="Aggregating enterprise banking intelligence..." />;

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
        <h3 className="font-bold text-base flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          Dashboard Synchronization Error
        </h3>
        <p className="mt-1 text-sm">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
        >
          Retry Data Fetch
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Executive Banking Intelligence</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time portfolio metrics, risk exposure, and predictive performance indicators
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Database'}</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={kpis?.total_customers?.toLocaleString() || '0'}
          subtitle="Registered retail & commercial clients"
          icon={Users}
          trend="up"
          trendValue="4.2% YoY"
          color="blue"
        />
        <StatCard
          title="Active Accounts"
          value={kpis?.total_active_accounts?.toLocaleString() || '0'}
          subtitle="Non-zero ledger balance holders"
          icon={CheckCircle}
          trend="up"
          trendValue="98.1% active"
          color="emerald"
        />
        <StatCard
          title="Loans Distributed"
          value={kpis?.total_loans_distributed?.toLocaleString() || '0'}
          subtitle="Approved active credit facilities"
          icon={CreditCard}
          trend="up"
          trendValue="12.5% vs Q3"
          color="indigo"
        />
        <StatCard
          title="Total Loan Volume"
          value={`$${((kpis?.total_loan_amount || 0) / 1000000).toFixed(1)}M`}
          subtitle={`$${((kpis?.total_loan_amount || 0) / 1000).toLocaleString()} total principal`}
          icon={TrendingUp}
          trend="up"
          trendValue="+8.4%"
          color="blue"
        />
        <StatCard
          title="Outstanding Balance"
          value={`$${((kpis?.outstanding_loan_amount || 0) / 1000000).toFixed(1)}M`}
          subtitle="Current unpaid principal balance"
          icon={BarChart2}
          color="purple"
        />
        <StatCard
          title="Loan Default Rate"
          value={`${kpis?.loan_default_rate || 0}%`}
          subtitle="Basel III regulatory benchmark: < 12%"
          icon={AlertTriangle}
          trend={kpis?.loan_default_rate > 10 ? 'down' : 'up'}
          trendValue={kpis?.loan_default_rate > 10 ? 'Elevated' : 'Optimal'}
          color={kpis?.loan_default_rate > 10 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Total Revenue"
          value={`$${((kpis?.total_revenue || 0) / 1000000).toFixed(2)}M`}
          subtitle="Coupon yields + fees + charges"
          icon={DollarSign}
          trend="up"
          trendValue="+14.1% YoY"
          color="emerald"
        />
        <StatCard
          title="Customer Satisfaction"
          value={`${kpis?.customer_satisfaction_score || 4.2} / 5`}
          subtitle="Resolution audit CSAT score"
          icon={Smile}
          trend="up"
          trendValue="High CSAT"
          color="sky"
        />
      </div>

      {/* Charts Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Loan Approval Trends */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Loan Approval Trends</h3>
              <p className="text-xs text-slate-500">Origination volume ($ Thousands) over recent months</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              Disbursement ($K)
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.monthly_loan_approval_trends || []}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val) => [`$${val}K`, 'Approved Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Distribution by Loan Type */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Portfolio Distribution by Loan Type</h3>
              <p className="text-xs text-slate-500">Gross principal commitments by category</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.loan_distribution_by_type || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val) => [`$${(val / 1000000).toFixed(2)}M`, 'Total Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Segmentation Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Customer Segmentation (K-Means)</h3>
          <p className="text-xs text-slate-500 mb-4">Clustered client asset & liquidity tiers</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.customer_segmentation || []}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts?.customer_segmentation || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [val, 'Customers']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Default vs Successful Repayment */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Default vs Repayment Performance</h3>
          <p className="text-xs text-slate-500 mb-4">Performing vs delinquent exposure ($K)</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.loan_default_vs_repayment || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip
                  formatter={(val, name) => [`$${val}K`, name === 'performing' ? 'Performing Volume' : 'Defaulted Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="performing" fill="#10b981" radius={[4, 4, 0, 0]} name="Performing" />
                <Bar dataKey="defaulted" fill="#ef4444" radius={[4, 4, 0, 0]} name="Defaulted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Across Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Customer Credit Risk Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Underwriting risk classifications</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.risk_distribution || []}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts?.risk_distribution || []).map((entry, index) => {
                    const clr = RISK_COLORS[entry.name] || COLORS[index % COLORS.length];
                    return <Cell key={`cell-risk-${index}`} fill={clr} />;
                  })}
                </Pie>
                <Tooltip
                  formatter={(val) => [val, 'Accounts']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid: Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Banking Product */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Yield by Banking Product</h3>
              <p className="text-xs text-slate-500">Gross interest & fee generation ($)</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={charts?.revenue_by_product || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={130} />
                <Tooltip
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Annual Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Complaints by Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaints & Grievances by Category</h3>
              <p className="text-xs text-slate-500">Operational service bottlenecks logged</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={charts?.complaints_by_category || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={140} />
                <Tooltip
                  formatter={(val) => [val, 'Logged Complaints']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
