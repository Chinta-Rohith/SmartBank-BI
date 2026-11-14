import React from 'react';

const VARIANT_MAP = {
  // Risks
  'Low Risk': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Low': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Medium Risk': 'bg-amber-50 text-amber-700 border-amber-200',
  'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
  'High Risk': 'bg-rose-50 text-rose-700 border-rose-200',
  'High': 'bg-rose-50 text-rose-700 border-rose-200',
  'Critical': 'bg-red-100 text-red-800 border-red-300 font-semibold',

  // Loan & Complaint Statuses
  'Approved': 'bg-blue-50 text-blue-700 border-blue-200',
  'In Repayment': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Fully Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Defaulted': 'bg-rose-50 text-rose-700 border-rose-200',
  'Rejected': 'bg-slate-100 text-slate-700 border-slate-300',
  'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Open': 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',

  // Recommendations
  'Recommended for Approval': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Requires Manual Review': 'bg-amber-50 text-amber-700 border-amber-200',
  'Not Recommended': 'bg-rose-50 text-rose-700 border-rose-200',

  // Customer Segments
  'Premium Customers': 'bg-purple-50 text-purple-700 border-purple-200 font-medium',
  'Regular Customers': 'bg-blue-50 text-blue-700 border-blue-200',
  'Emerging Customers': 'bg-teal-50 text-teal-700 border-teal-200',
  'High-Risk Customers': 'bg-amber-50 text-amber-700 border-amber-200',

  // Roles
  'Admin': 'bg-indigo-100 text-indigo-800 border-indigo-300 font-semibold',
  'Banking Manager': 'bg-sky-100 text-sky-800 border-sky-300 font-semibold',
  'Loan Officer': 'bg-blue-100 text-blue-800 border-blue-300 font-semibold',
};

export default function Badge({ text, variant, size = 'sm' }) {
  const matchedClass = VARIANT_MAP[variant || text] || 'bg-slate-100 text-slate-700 border-slate-200';
  const sizeClass = size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${sizeClass} font-medium tracking-wide ${matchedClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {text}
    </span>
  );
}
