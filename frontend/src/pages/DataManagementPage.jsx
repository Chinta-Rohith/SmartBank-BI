import React, { useState, useEffect } from 'react';
import {
  Database, UploadCloud, Download, CheckCircle2, AlertTriangle,
  FileSpreadsheet, ShieldAlert, RefreshCw, Server
} from 'lucide-react';
import { api } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DATASETS = [
  { id: 'customers', title: 'Customers Master Dataset', file: 'sample_customers.csv', desc: 'Demographics, annual incomes, credit scores, liquid balances, and segment classifications.' },
  { id: 'loans', title: 'Credit & Loans Portfolio', file: 'sample_loans.csv', desc: 'Sanctioned amounts, interest rates, tenures, monthly EMIs, and delinquency flags.' },
  { id: 'transactions', title: 'Transactions Ledger Activity', file: 'sample_transactions.csv', desc: 'Deposit, withdrawal, card payment, and transfer transaction journals.' },
  { id: 'complaints', title: 'Customer Complaints & Service Tickets', file: 'sample_complaints.csv', desc: 'Operational grievances, resolution SLAs, priority tags, and CSAT scores.' }
];

export default function DataManagementPage() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [uploadStatus, setUploadStatus] = useState({});
  const [uploading, setUploading] = useState({});

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.getETLStats();
      setStats(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFileUpload = async (datasetId, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [datasetId]: true }));
    try {
      const res = await api.uploadDataset(datasetId, file);
      setUploadStatus((prev) => ({
        ...prev,
        [datasetId]: { success: true, ...res }
      }));
      fetchStats();
    } catch (err) {
      setUploadStatus((prev) => ({
        ...prev,
        [datasetId]: { success: false, message: err.message }
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [datasetId]: false }));
    }
  };

  const handleDownloadSample = (datasetId) => {
    const url = api.getSampleDownloadUrl(datasetId);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Data Management & ETL Ingestion Pipeline
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Automated batch data cleansing, missing value imputation, deduplication, and database persistence
        </p>
      </div>

      {/* Dataset Counts Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Customer Records</span>
          <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
            {stats?.customers_count?.toLocaleString() || 0}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Table: customers</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Loan Records</span>
          <span className="text-2xl font-extrabold text-indigo-700 mt-1 block">
            {stats?.loans_count?.toLocaleString() || 0}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Table: loans</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Transaction Ledger</span>
          <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
            {stats?.transactions_count?.toLocaleString() || 0}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Table: transactions</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Complaint Tickets</span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
            {stats?.complaints_count?.toLocaleString() || 0}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Table: complaints</span>
        </div>
      </div>

      {/* Ingestion Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DATASETS.map((ds) => {
          const status = uploadStatus[ds.id];
          const isBusy = uploading[ds.id];

          return (
            <div
              key={ds.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">{ds.title}</h3>
                  </div>
                  <button
                    onClick={() => handleDownloadSample(ds.id)}
                    title="Download Sample CSV Template"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Sample CSV</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {ds.desc}
                </p>

                {/* Upload drag/file area */}
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all text-center">
                  <UploadCloud className="w-7 h-7 text-blue-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-800">
                    {isBusy ? 'Processing & Cleaning CSV...' : 'Click to Upload CSV'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Automatic schema validation, deduplication & normalization
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    disabled={isBusy}
                    className="hidden"
                    onChange={(e) => handleFileUpload(ds.id, e.target.files?.[0])}
                  />
                </label>
              </div>

              {/* Status / Output Feedback */}
              {status && (
                <div
                  className={`mt-4 p-3 rounded-xl text-xs border ${
                    status.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {status.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ETL Ingestion Complete</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Ingestion Failed</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed">{status.message}</p>
                  {status.records_cleaned !== undefined && (
                    <div className="mt-2 pt-2 border-t border-emerald-200 flex flex-wrap gap-2 text-[10px]">
                      <span>Cleaned: <strong>{status.records_cleaned}</strong></span>
                      <span>Duplicates: <strong>{status.duplicates_removed}</strong></span>
                      <span>Imputed: <strong>{status.missing_values_handled}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
