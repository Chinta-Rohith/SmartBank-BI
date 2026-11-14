import React, { useState } from 'react';
import { Building2, Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@smartbank.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#0f172a] to-[#1e293b] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 shadow-xl shadow-blue-500/20 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SmartBank BI</h1>
          <p className="text-sm text-slate-400 mt-1">Intelligent Banking Decision Support System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-8 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Enterprise Authentication</h2>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smartbank.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Access Decision Support Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-5 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              One-Click Demo Credentials
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@smartbank.com', 'Admin@123')}
                className="px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-center transition-colors cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700">Admin</div>
                <div className="text-[9px] text-slate-500">CRO Vance</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('manager@smartbank.com', 'Manager@123')}
                className="px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-center transition-colors cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700">Manager</div>
                <div className="text-[9px] text-slate-500">Operations</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('loanofficer@smartbank.com', 'Officer@123')}
                className="px-2.5 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-center transition-colors cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700">Officer</div>
                <div className="text-[9px] text-slate-500">Underwriter</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400">
          Secure FFIEC & Basel III Standardized Analytical Platform
        </div>
      </div>
    </div>
  );
}
