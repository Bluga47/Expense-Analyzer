
import React from 'react';
import { MOCK_EXPENSES } from '../constants';
import { Check, X, Eye, User, FileText } from 'lucide-react';

const Approvals: React.FC = () => {
  const pendingItems = MOCK_EXPENSES.filter(e => e.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pending Approvals</h1>
          <p className="text-slate-500 text-sm">Review and approve your team's expense claims.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
            {pendingItems.length} Waiting
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pendingItems.length > 0 ? pendingItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                <img src={`https://picsum.photos/seed/${item.id}/200`} alt="Employee" />
              </div>
              <div>
                <h4 className="font-bold flex items-center gap-2">
                  Employee ID #{Math.floor(Math.random() * 1000)}
                  <span className="text-xs font-normal text-slate-400">• New Submission</span>
                </h4>
                <div className="flex flex-wrap gap-4 mt-1">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <FileText size={14} /> {item.merchant}
                  </span>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <User size={14} /> {item.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end justify-center min-w-[120px]">
              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹{item.amount.toFixed(2)}</p>
              <p className="text-xs text-slate-400">{item.date}</p>
            </div>

            <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-700 pt-4 md:pt-0 md:pl-6">
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="View Details">
                <Eye size={20} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-rose-600 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all">
                <X size={18} />
                <span className="hidden sm:inline">Reject</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-all">
                <Check size={18} />
                <span className="hidden sm:inline">Approve</span>
              </button>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <Check size={32} />
            </div>
            <h3 className="font-bold text-lg">Inbox Zero</h3>
            <p className="text-slate-500 text-sm">No pending approvals remaining for your team.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Approvals;
