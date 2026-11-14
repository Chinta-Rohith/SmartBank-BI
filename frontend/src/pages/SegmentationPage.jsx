import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon, RefreshCw, Users, DollarSign, Award,
  Sparkles, CheckCircle2, TrendingUp, ShieldAlert, ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SEGMENT_COLORS = {
  'Premium Customers': '#8b5cf6',
  'Regular Customers': '#2563eb',
  'Emerging Customers': '#0d9488',
  'High-Risk Customers': '#f59e0b'
};

export default function SegmentationPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reclustering, setReclustering] = useState(false);

  const fetchSegmentation = async () => {
    setLoading(true);
    try {
      const res = await api.getSegmentation();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegmentation();
  }, []);

  const handleRecluster = async () => {
    setReclustering(true);
    try {
      await api.reclusterSegmentation();
      await fetchSegmentation();
      alert('K-Means clustering successfully re-trained!');
    } catch (err) {
      alert('Re-clustering failed: ' + err.message);
    } finally {
      setReclustering(false);
    }
  };

  if (loading) return <LoadingSpinner text="Computing K-Means multi-dimensional customer clusters..." />;

  const chartData = data?.segments?.map((s) => ({
    name: s.segment_name,
    value: s.total_customers,
    revenue: s.total_revenue
  })) || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            K-Means Customer Segmentation & Cross-Selling
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Clustering {data?.total_customers_analyzed?.toLocaleString()} customers into 4 distinct behavioral tiers
          </p>
        </div>
        <button
          onClick={handleRecluster}
          disabled={reclustering}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reclustering ? 'animate-spin text-blue-600' : ''}`} />
          <span>{reclustering ? 'Re-clustering...' : 'Re-fit K-Means Clusters'}</span>
        </button>
      </div>

      {/* 4 Segment Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.segments?.map((seg) => (
          <div
            key={seg.segment_name}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge text={seg.segment_name} variant={seg.segment_name} />
                <span className="text-xs font-bold text-slate-400">{seg.percentage}%</span>
              </div>

              <div className="text-2xl font-extrabold text-slate-900">
                {seg.total_customers?.toLocaleString()} <span className="text-xs font-normal text-slate-500">clients</span>
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">
                ${(seg.total_revenue / 1000000).toFixed(2)}M Portfolio Rev
              </div>

              <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                {seg.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Avg Income:</span>
                <span className="font-semibold text-slate-900">${seg.avg_annual_income?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Avg Balance:</span>
                <span className="font-semibold text-slate-900">${seg.avg_account_balance?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Avg Credit Score:</span>
                <span className="font-semibold text-blue-700">{seg.avg_credit_score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Volume Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Customer Share by Segment</h3>
          <p className="text-xs text-slate-500 mb-4">Cluster distribution across total banking client base</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={SEGMENT_COLORS[entry.name] || '#2563eb'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [val.toLocaleString(), 'Customers']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Contribution by Segment */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Revenue Contribution ($) by Segment</h3>
          <p className="text-xs text-slate-500 mb-4">Cumulative interest and account fee yield</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Total Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cross-Selling & Targeted Product Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Automated Cross-Selling Recommendation Matrix
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.segments?.map((seg) => (
            <div key={seg.segment_name} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="text-xs font-bold text-slate-900 block mb-2">{seg.segment_name}</span>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {seg.recommended_products?.map((prod, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{prod}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
