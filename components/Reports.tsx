
import React from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  Printer, 
  ChevronRight, 
  BarChart2, 
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';

const Reports: React.FC = () => {
  const reportCategories = [
    { title: 'Expense Summary', description: 'Monthly overview of total spending across all categories.', icon: BarChart2, color: 'blue' },
    { title: 'Tax Deduction Report', description: 'Optimized list of potentially tax-deductible business expenses.', icon: FileText, color: 'indigo' },
    { title: 'Category Breakdown', description: 'Visual analysis of where your budget is being allocated.', icon: Share2, color: 'emerald' },
    { title: 'Pending Approvals', description: 'Details of all expenses currently awaiting manager review.', icon: Clock, color: 'amber' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <p className="text-slate-500 text-sm">Deep dive into your financial data with custom reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-gray-50">
            <Calendar size={18} />
            Period: May 2024
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCategories.map((item, i) => (
          <div key={i} className="group bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer">
            <div className={`w-12 h-12 bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <item.icon size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">{item.description}</p>
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <span>Generate</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold">Recent Generated Reports</h3>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-indigo-600"><Printer size={18} /></button>
            <button className="p-2 text-slate-400 hover:text-indigo-600"><Share2 size={18} /></button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-600">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">Q1_Expense_Analysis_Final.pdf</p>
                  <p className="text-xs text-slate-400">Generated May 14, 2024 • 2.4 MB</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                  <CheckCircle size={14} /> Ready
                </div>
                <button className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
