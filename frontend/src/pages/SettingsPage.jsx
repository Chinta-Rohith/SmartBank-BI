import React, { useState, useEffect } from 'react';
import {
  Settings, Sliders, Shield, RefreshCw, Database, CheckCircle2,
  AlertTriangle, Key, Users, Building2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Policy edit state
  const [policies, setPolicies] = useState({});
  const [savingPolicy, setSavingPolicy] = useState(false);

  // ML Retrain State
  const [retraining, setRetraining] = useState(false);
  const [retrainResult, setRetrainResult] = useState(null);

  // DB Reseed State
  const [reseeding, setReseeding] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      setSettingsData(res);
      const polMap = {};
      res.policies?.forEach((p) => {
        polMap[p.key] = p.value;
      });
      setPolicies(polMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSavePolicy = async (key, val) => {
    setSavingPolicy(true);
    try {
      await api.updatePolicy(key, val);
      alert(`Policy '${key}' successfully updated to '${val}'.`);
      fetchSettings();
    } catch (err) {
      alert('Failed to update policy: ' + err.message);
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    setRetrainResult(null);
    try {
      const res = await api.retrainModel();
      setRetrainResult(res);
      alert('Random Forest & Logistic Regression models retrained on latest database records!');
    } catch (err) {
      alert('Retraining failed: ' + err.message);
    } finally {
      setRetraining(false);
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('Reset and re-synthesize database with 5,000 fresh customer and loan records?')) {
      return;
    }
    setReseeding(true);
    try {
      const res = await api.reseedDatabase(5000);
      alert(res.message);
      fetchSettings();
    } catch (err) {
      alert('Reseed failed: ' + err.message);
    } finally {
      setReseeding(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving system configuration..." />;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          System Administration & Governance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configurable underwriting thresholds, ML model lifecycle operations, and role access controls
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Underwriting Policy Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Configurable Banking Policies</h3>
                <p className="text-xs text-slate-500">Live regulatory decision parameters enforced by eligibility engines</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {settingsData?.policies?.map((pol) => (
                <div key={pol.key} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block font-mono">{pol.key}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{pol.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={policies[pol.key] || ''}
                      onChange={(e) => setPolicies({ ...policies, [pol.key]: e.target.value })}
                      className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-center text-xs"
                    />
                    <button
                      onClick={() => handleSavePolicy(pol.key, policies[pol.key])}
                      disabled={savingPolicy}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Access Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Shield className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
                <p className="text-xs text-slate-500">Active permissions by organizational title</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3">Admin</th>
                    <th className="py-2.5 px-3">Banking Manager</th>
                    <th className="py-2.5 px-3">Loan Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2 px-3 font-medium">Executive Dashboard</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Full</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">ML Default Prediction & Underwriting</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Full</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Customer Segmentation & Clustering</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="py-2 px-3 text-slate-400">Read-Only</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Revenue Analytics & Profit Margins</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="py-2 px-3 text-slate-400">Restricted</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">ETL File Upload & Cleansing Pipeline</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">✓ Full</td>
                    <td className="py-2 px-3 text-slate-400">Restricted</td>
                    <td className="py-2 px-3 text-slate-400">Restricted</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: ML Operations & Maintenance (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active User Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Active Session Profile</h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Staff Member:</span>
                <span className="font-bold text-slate-900">{user?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Username:</span>
                <span className="font-mono text-slate-700">{user?.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email Address:</span>
                <span className="text-slate-700">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">Current Role:</span>
                <Badge text={user?.role} variant={user?.role} />
              </div>
            </div>
          </div>

          {/* Machine Learning Retraining Trigger */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">ML Model Lifecycle & Retraining</h3>
            <p className="text-xs text-slate-500 mb-4">
              Re-train Random Forest classifier on all current database records to incorporate recent ETL ingestions.
            </p>

            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
              <span>{retraining ? 'Retraining Models...' : 'Trigger ML Retraining Pipeline'}</span>
            </button>

            {retrainResult && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Models Retrained Successfully</span>
                </div>
                <div className="text-[11px] space-y-0.5">
                  <div>RF Accuracy: <strong>{(retrainResult.metrics?.random_forest?.accuracy * 100).toFixed(1)}%</strong></div>
                  <div>ROC-AUC: <strong>{retrainResult.metrics?.random_forest?.roc_auc}</strong></div>
                  <div>Trained on: {retrainResult.metrics?.train_samples} samples</div>
                </div>
              </div>
            )}
          </div>

          {/* Database Reseed Trigger */}
          <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-rose-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Database Reset & Generation</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Purges current ledger and generates 5,000 fresh realistic synthetic customer records with calibrated financial distributions.
            </p>

            <button
              onClick={handleReseed}
              disabled={reseeding}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Database className="w-4 h-4" />
              <span>{reseeding ? 'Generating 5,000 Records...' : 'Reseed Synthetic Database (5,000)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
