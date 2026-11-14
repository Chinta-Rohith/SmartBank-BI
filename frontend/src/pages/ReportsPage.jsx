import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Printer, Filter, Calendar, CheckCircle2,
  Table, RefreshCw, ArrowDownToLine
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const REPORT_OPTIONS = [
  { id: 'loan-default-risk', title: 'Loan Default Risk & Credit Performance Audit', description: 'Borrower credit scores, debt ratios, loan sizes, and delinquency classifications' },
  { id: 'customer-segmentation', title: 'Customer Segmentation & Cross-Sell Analysis', description: 'Customer balances, income bands, assigned K-Means behavioral segments, and risk ratings' },
  { id: 'loan-distribution', title: 'Loan Distribution & Portfolio Exposure Report', description: 'Principal amounts, repayment tenures, monthly EMIs, and outstanding asset balances' },
  { id: 'customer-complaint', title: 'Customer Service & Grievance Resolution Audit', description: 'Complaint categories, priority SLAs, resolution times, and customer satisfaction ratings' },
  { id: 'revenue-profitability', title: 'Revenue Yield & Customer Profitability Ledger', description: 'Gross interest revenues, operating fee income, and net contribution rankings' }
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('loan-default-risk');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (repId) => {
    setLoading(true);
    try {
      const res = await api.getReportPreview(repId);
      setReportData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedReport);
  }, [selectedReport]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const url = api.getReportExportUrl(selectedReport);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Regulatory Reports & Analytical Export
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-grade banking reports formatted for executive presentations, FFIEC compliance, and CSV data lakes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytical CSV</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {REPORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedReport(opt.id)}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedReport === opt.id
                ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-white border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <div>
              <span className={`text-xs font-bold block ${selectedReport === opt.id ? 'text-blue-900' : 'text-slate-800'}`}>
                {opt.title}
              </span>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                {opt.description}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-semibold">
              <span className={selectedReport === opt.id ? 'text-blue-700' : 'text-slate-400'}>
                {selectedReport === opt.id ? '● Active View' : 'Select'}
              </span>
              <FileText className={`w-3.5 h-3.5 ${selectedReport === opt.id ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>
          </button>
        ))}
      </div>

      {/* Report Data Preview Document */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 overflow-hidden">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">SmartBank BI Executive Audit</div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">{reportData?.report_name}</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Compiled on {new Date(reportData?.generated_at || Date.now()).toUTCString()} | Showing top {reportData?.total_records} audit entries
            </div>
          </div>
          <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
            Status: Fully Reconciled
          </span>
        </div>

        {/* Content Table */}
        {loading ? (
          <LoadingSpinner text="Compiling analytical tabular ledger..." />
        ) : !reportData?.data || reportData.data.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No records available for this audit specification.</div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  {reportData.columns?.map((col, idx) => (
                    <th key={idx} className="py-2.5 px-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.data.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/80">
                    {Object.values(row).map((val, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-3 font-medium">
                        {typeof val === 'number' && val > 999 ? `$${val.toLocaleString()}` : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
