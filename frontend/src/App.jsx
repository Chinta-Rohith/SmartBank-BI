import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import LoansPage from './pages/LoansPage';
import DefaultPredictionPage from './pages/DefaultPredictionPage';
import EligibilityCheckerPage from './pages/EligibilityCheckerPage';
import SegmentationPage from './pages/SegmentationPage';
import LoanDistributionPage from './pages/LoanDistributionPage';
import ComplaintsPage from './pages/ComplaintsPage';
import RevenuePage from './pages/RevenuePage';
import ReportsPage from './pages/ReportsPage';
import DataManagementPage from './pages/DataManagementPage';
import SettingsPage from './pages/SettingsPage';
import LoadingSpinner from './components/common/LoadingSpinner';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Initializing SmartBank BI Security Context..." />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'customers':
        return <CustomersPage />;
      case 'loans':
        return <LoansPage />;
      case 'predictions':
        return <DefaultPredictionPage />;
      case 'eligibility':
        return <EligibilityCheckerPage />;
      case 'segmentation':
        return <SegmentationPage />;
      case 'distribution':
        return <LoanDistributionPage />;
      case 'complaints':
        return <ComplaintsPage />;
      case 'revenue':
        return <RevenuePage />;
      case 'reports':
        return <ReportsPage />;
      case 'data':
        return <DataManagementPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActivePage()}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
