import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Sparkles, AlertTriangle, CheckCircle, Info,
  Sliders, ArrowRight, Gauge, BarChart, RefreshCw, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export default function DefaultPredictionPage() {
  const [formData, setFormData] = useState({
    customer_age: 38,
    annual_income: 85000,
    employment_status: 'Employed',
    credit_score: 720,
    existing_loan_amount: 12000,
    loan_amount_requested: 35000,
    loan_tenure: 36,
    monthly_expenses: 3100,
    debt_to_income_ratio: 0.35,
    previous_repayment_history: 0,
    number_of_existing_loans: 1,
    customer_identifier: 'Applicant #8042'
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);

  useEffect(() => {
    // Fetch initial model evaluation metrics
    api.getModelMetrics().then(setMetrics).catch(console.error);
    // Run initial prediction on default values
    runPrediction(formData);
  }, []);

  const runPrediction = async (dataToPredict) => {
    setLoading(true);
    try {
      const res = await api.predictDefaultRisk(dataToPredict);
      setPrediction(res);
    } catch (err) {
      alert('Prediction failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runPrediction(formData);
  };

  const handlePreFill = (profileType) => {
    let preset = {};
    if (profileType === 'low') {
      preset = {
        customer_age: 44,
        annual_income: 145000,
        employment_status: 'Employed',
        credit_score: 785,
        existing_loan_amount: 5000,
        loan_amount_requested: 40000,
        loan_tenure: 48,
        monthly_expenses: 3800,
        debt_to_income_ratio: 0.24,
        previous_repayment_history: 0,
        number_of_existing_loans: 1,
        customer_identifier: 'Eleanor Vance (Prime Tier)'
      };
    } else if (profileType === 'medium') {
      preset = {
        customer_age: 31,
        annual_income: 58000,
        employment_status: 'Self-Employed',
        credit_score: 645,
        existing_loan_amount: 18000,
        loan_amount_requested: 25000,
        loan_tenure: 36,
        monthly_expenses: 2900,
        debt_to_income_ratio: 0.44,
        previous_repayment_history: 1,
        number_of_existing_loans: 2,
        customer_identifier: 'Jordan Miller (Moderate Tier)'
      };
    } else {
      preset = {
        customer_age: 26,
        annual_income: 32000,
        employment_status: 'Unemployed',
        credit_score: 510,
        existing_loan_amount: 22000,
        loan_amount_requested: 30000,
        loan_tenure: 24,
        monthly_expenses: 2400,
        debt_to_income_ratio: 0.62,
        previous_repayment_history: 4,
        number_of_existing_loans: 3,
        customer_identifier: 'Travis Scott (Elevated Risk)'
      };
    }
    setFormData(preset);
    runPrediction(preset);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Machine Learning Loan Default Risk Predictor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calibrated Random Forest ensemble risk inference with local explainability (XAI)
          </p>
        </div>
        <button
          onClick={() => setShowMetricsModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
        >
          <BarChart className="w-4 h-4 text-blue-600" />
          <span>Model Evaluation & ROC-AUC</span>
        </button>
      </div>

      {/* Preset Fast Profile Selectors */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Automated Underwriting Simulation
            </span>
            <p className="text-xs text-slate-300 mt-1">
              Select a benchmark profile to instantly load features into the Random Forest prediction engine:
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handlePreFill('low')}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              ✓ Prime Low Risk Profile
            </button>
            <button
              onClick={() => handlePreFill('medium')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              ⚠ Borderline Moderate Risk
            </button>
            <button
              onClick={() => handlePreFill('high')}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              ✕ High Risk Subprime Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 7 Columns */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Borrower Financial Parameters</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Applicant Name / Identifier
                </label>
                <input
                  type="text"
                  value={formData.customer_identifier}
                  onChange={(e) => setFormData({ ...formData, customer_identifier: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Age: <span className="font-bold text-blue-700">{formData.customer_age} yrs</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="75"
                  value={formData.customer_age}
                  onChange={(e) => setFormData({ ...formData, customer_age: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Income ($)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={formData.annual_income}
                  onChange={(e) => setFormData({ ...formData, annual_income: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Living Expenses ($)
                </label>
                <input
                  type="number"
                  step="100"
                  value={formData.monthly_expenses}
                  onChange={(e) => setFormData({ ...formData, monthly_expenses: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Credit Score (FICO): <span className="font-bold text-blue-700">{formData.credit_score}</span>
                </label>
                <input
                  type="range"
                  min="320"
                  max="850"
                  value={formData.credit_score}
                  onChange={(e) => setFormData({ ...formData, credit_score: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Employment Status
                </label>
                <select
                  value={formData.employment_status}
                  onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Employed">Employed (Salaried)</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Business">Business Owner</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loan Amount Requested ($)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={formData.loan_amount_requested}
                  onChange={(e) => setFormData({ ...formData, loan_amount_requested: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tenure: <span className="font-bold text-blue-700">{formData.loan_tenure} Months</span>
                </label>
                <select
                  value={formData.loan_tenure}
                  onChange={(e) => setFormData({ ...formData, loan_tenure: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="12">12 Months (1 Year)</option>
                  <option value="24">24 Months (2 Years)</option>
                  <option value="36">36 Months (3 Years)</option>
                  <option value="48">48 Months (4 Years)</option>
                  <option value="60">60 Months (5 Years)</option>
                  <option value="120">120 Months (10 Years)</option>
                  <option value="240">240 Months (20 Years)</option>
                  <option value="360">360 Months (30 Years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Existing Outstanding Loan Balance ($)
                </label>
                <input
                  type="number"
                  value={formData.existing_loan_amount}
                  onChange={(e) => setFormData({ ...formData, existing_loan_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prior Missed Payments (Delinquencies)
                </label>
                <select
                  value={formData.previous_repayment_history}
                  onChange={(e) => setFormData({ ...formData, previous_repayment_history: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                >
                  <option value="0">0 Missed (Clean Record)</option>
                  <option value="1">1 Missed Payment</option>
                  <option value="2">2 Missed Payments</option>
                  <option value="3">3 Missed Payments</option>
                  <option value="4">4+ Delinquent Payments</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Executing Random Forest Inference...</span>
              ) : (
                <>
                  <span>Evaluate Loan Default Probability</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: 5 Columns */}
        <div className="lg:col-span-5 space-y-6">
          {prediction ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              {/* Risk Banner */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Prediction Classification
                  </span>
                  <Badge text={prediction.risk_category} variant={prediction.risk_category} />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Recommendation
                  </span>
                  <Badge text={prediction.recommendation} variant={prediction.recommendation} />
                </div>
              </div>

              {/* Distinction: Probability vs Confidence */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Probability of Default
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">
                    {prediction.default_probability}%
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Calibrated loss likelihood
                  </span>
                </div>

                <div className="border-l border-slate-200 pl-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Model Confidence
                  </span>
                  <div className="text-2xl font-extrabold text-blue-700 mt-1">
                    {prediction.model_confidence}%
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Tree ensemble voting agreement
                  </span>
                </div>
              </div>

              {/* Visual Risk Gauge Meter */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-600">Risk Severity Spectrum</span>
                  <span className={
                    prediction.default_probability < 25 ? 'text-emerald-600' :
                    prediction.default_probability < 60 ? 'text-amber-600' : 'text-rose-600'
                  }>
                    {prediction.default_probability}% Risk
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-[25%] opacity-70"></div>
                  <div className="h-full bg-amber-400 w-[35%] opacity-70"></div>
                  <div className="h-full bg-rose-500 w-[40%] opacity-70"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0% (Low)</span>
                  <span>25% (Medium)</span>
                  <span>60% (High)</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Financial metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Estimated Monthly EMI</span>
                  <span className="text-sm font-bold text-slate-900">${prediction.estimated_emi?.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">Max Affordable Principal</span>
                  <span className="text-sm font-bold text-emerald-700">${prediction.max_affordable_loan?.toLocaleString()}</span>
                </div>
              </div>

              {/* Natural Language Explanation */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs text-blue-900 leading-relaxed">
                <span className="font-bold block text-blue-950 mb-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-700 shrink-0" />
                  Decision Support Rationale:
                </span>
                {prediction.explanation}
              </div>

              {/* Contributing Features Factor Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Key Contributing Predictors
                </h4>
                <div className="space-y-2">
                  {prediction.contributing_factors?.map((f, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900">{f.feature}: <span className="font-bold text-slate-700">{f.value}</span></div>
                        <div className="text-[11px] text-slate-500">{f.description}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.impact === 'Decrease Risk' ? 'bg-emerald-100 text-emerald-800' :
                        f.impact === 'Increase Risk' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {f.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center text-slate-400 text-xs">
              Complete applicant form and click Evaluate to generate default probability and XAI breakdown.
            </div>
          )}
        </div>
      </div>

      {/* Model Evaluation Metrics Modal */}
      <Modal
        isOpen={showMetricsModal}
        onClose={() => setShowMetricsModal(false)}
        title="Supervised Machine Learning Model Evaluation (Section 16)"
        maxWidth="max-w-2xl"
      >
        {metrics ? (
          <div className="space-y-5 text-xs text-slate-700">
            <p className="text-slate-500">
              Evaluated on 1,000 held-out test records (80/20 stratified train-test split without data leakage) comparing the primary Random Forest classifier against baseline Logistic Regression.
            </p>

            {/* Model Comparison Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left divide-y divide-slate-100">
                <thead className="bg-slate-50 font-bold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">Evaluation Metric</th>
                    <th className="py-2.5 px-3 text-blue-700">Random Forest</th>
                    <th className="py-2.5 px-3 text-slate-700">Logistic Regression</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 font-medium">Accuracy Score</td>
                    <td className="py-2 px-3 font-bold text-blue-700">{(metrics.random_forest?.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3">{(metrics.logistic_regression?.accuracy * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">ROC-AUC Score</td>
                    <td className="py-2 px-3 font-bold text-blue-700">{metrics.random_forest?.roc_auc}</td>
                    <td className="py-2 px-3">{metrics.logistic_regression?.roc_auc}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Precision Score</td>
                    <td className="py-2 px-3 font-bold text-blue-700">{(metrics.random_forest?.precision * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3">{(metrics.logistic_regression?.precision * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">Recall (Sensitivity)</td>
                    <td className="py-2 px-3 font-bold text-blue-700">{(metrics.random_forest?.recall * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3">{(metrics.logistic_regression?.recall * 100).toFixed(1)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">F1-Score</td>
                    <td className="py-2 px-3 font-bold text-blue-700">{metrics.random_forest?.f1_score}</td>
                    <td className="py-2 px-3">{metrics.logistic_regression?.f1_score}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Confusion Matrix */}
            <div>
              <h5 className="font-bold text-slate-900 mb-2 uppercase text-[11px] tracking-wider">
                Random Forest Test Confusion Matrix
              </h5>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">True Negative (Non-Default)</span>
                  <span className="text-xl font-bold text-emerald-900">{metrics.random_forest?.confusion_matrix?.true_negative}</span>
                </div>
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                  <span className="text-[10px] uppercase font-bold text-rose-800 block">False Positive (Type I Error)</span>
                  <span className="text-xl font-bold text-rose-900">{metrics.random_forest?.confusion_matrix?.false_positive}</span>
                </div>
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                  <span className="text-[10px] uppercase font-bold text-rose-800 block">False Negative (Type II Error)</span>
                  <span className="text-xl font-bold text-rose-900">{metrics.random_forest?.confusion_matrix?.false_negative}</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">True Positive (Default Caught)</span>
                  <span className="text-xl font-bold text-emerald-900">{metrics.random_forest?.confusion_matrix?.true_positive}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-100 text-[11px] text-slate-500">
              Artifacts serialized in <code className="text-blue-700">backend/trained_models/random_forest_loan_default.joblib</code>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Loading model telemetry...</p>
        )}
      </Modal>
    </div>
  );
}
