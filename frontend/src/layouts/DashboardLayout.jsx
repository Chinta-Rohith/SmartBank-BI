import React, { useState } from 'react';
import {
  LayoutDashboard, Users, CreditCard, ShieldAlert, CheckCircle2,
  PieChart, BarChart3, MessageSquareWarning, DollarSign, FileText,
  Database, Settings, LogOut, ChevronDown, Building2, Bell, Menu, X, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Banking Manager', 'Loan Officer'] },
  { id: 'customers', label: 'Customers', icon: Users, roles: ['Admin', 'Banking Manager', 'Loan Officer'] },
  { id: 'loans', label: 'Loan Management', icon: CreditCard, roles: ['Admin', 'Banking Manager', 'Loan Officer'] },
  { id: 'predictions', label: 'Default Prediction', icon: ShieldAlert, roles: ['Admin', 'Banking Manager', 'Loan Officer'] },
  { id: 'eligibility', label: 'Eligibility Checker', icon: CheckCircle2, roles: ['Admin', 'Banking Manager', 'Loan Officer'] },
  { id: 'segmentation', label: 'Customer Segmentation', icon: PieChart, roles: ['Admin', 'Banking Manager'] },
  { id: 'distribution', label: 'Loan Distribution', icon: BarChart3, roles: ['Admin', 'Banking Manager', 'Loan Officer'] },
  { id: 'complaints', label: 'Complaint Management', icon: MessageSquareWarning, roles: ['Admin', 'Banking Manager'] },
  { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign, roles: ['Admin', 'Banking Manager'] },
  { id: 'reports', label: 'Reports & Export', icon: FileText, roles: ['Admin', 'Banking Manager', 'Loan Officer'] },
  { id: 'data', label: 'Data Management & ETL', icon: Database, roles: ['Admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Banking Manager', 'Loan Officer'] },
];

export default function DashboardLayout({ activeTab, onTabChange, children }) {
  const { user, logout, switchDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const demoRoles = [
    { label: 'Admin (Alexander Vance)', email: 'admin@smartbank.com', pass: 'Admin@123', role: 'Admin' },
    { label: 'Banking Manager (Sarah Jenkins)', email: 'manager@smartbank.com', pass: 'Manager@123', role: 'Banking Manager' },
    { label: 'Loan Officer (Marcus Chen)', email: 'loanofficer@smartbank.com', pass: 'Officer@123', role: 'Loan Officer' },
  ];

  const handleRoleSwitch = async (email, pass) => {
    try {
      await switchDemoRole(email, pass);
      setRoleDropdownOpen(false);
    } catch (err) {
      alert('Failed to switch role: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0f172a] text-white border-b border-slate-800 shadow-md">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onTabChange('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-inner">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  SmartBank <span className="text-sky-400 font-extrabold">BI</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block -mt-1 font-medium">
                  Decision Support System
                </span>
              </div>
            </div>
          </div>

          {/* Center Info / Consolidated Branch Indicator */}
          <div className="hidden md:flex items-center gap-3 bg-slate-800/70 border border-slate-700/80 rounded-full px-3.5 py-1 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-slate-300 font-medium">Production Node:</span>
            <span className="text-white font-semibold">Federal Reserve Connected</span>
            <span className="text-slate-500">|</span>
            <span className="text-sky-300 font-medium">6 Regional Branches</span>
          </div>

          {/* Right Profile & Demo Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Role:</span>
                <span className="text-white font-semibold">{user?.role || 'Guest'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Role Switcher (Demo)
                  </div>
                  {demoRoles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSwitch(r.email, r.pass)}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-blue-50 transition-colors cursor-pointer ${user?.role === r.role ? 'bg-blue-50/70 font-semibold text-blue-700' : 'text-slate-700'}`}
                    >
                      <span>{r.label}</span>
                      <span className="text-[10px] text-slate-400">{r.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User details */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white leading-tight">{user?.full_name || 'System User'}</span>
              <span className="text-[10px] text-slate-400">{user?.email}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#0a192f] border-r border-slate-800 text-slate-300 select-none">
          <div className="p-4 border-b border-slate-800/60">
            <div className="px-3 py-2 rounded-lg bg-blue-950/40 border border-blue-900/50">
              <div className="text-[11px] uppercase tracking-wider text-sky-400 font-bold">Banking Intelligence</div>
              <div className="text-xs text-slate-300 font-medium mt-0.5">Automated Risk & BI Suite</div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isAllowed = !user?.role || item.roles.includes(user.role);

              if (!isAllowed) return null;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer info */}
          <div className="p-4 border-t border-slate-800/60 text-[11px] text-slate-500 text-center">
            SmartBank BI v1.0.0 Enterprise
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="relative flex flex-col w-72 bg-[#0a192f] text-slate-300 p-4 border-r border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-bold text-white text-base">Navigation Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1 flex-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isAllowed = !user?.role || item.roles.includes(user.role);
                  if (!isAllowed) return null;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                        isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Page Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
