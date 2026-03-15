
import React from 'react';
import { MOCK_EXPENSES } from '../constants';
import { CreditCard, Wallet, Calendar, ArrowRight } from 'lucide-react';

const Reimbursements: React.FC = () => {
  const reimbursedItems = MOCK_EXPENSES.filter(e => e.status === 'reimbursed');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Reimbursements</h1>
        <p className="text-slate-500 text-sm">Track your approved claims payout status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-600 p-8 rounded-[2rem] text-white space-y-8 shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
            <div className="flex items-center justify-between">
              <Wallet size={32} />
              <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Primary Account</span>
            </div>
            <div>
              <p className="text-indigo-200 text-sm font-medium">Pending Payout</p>
              <h2 className="text-4xl font-black mt-1">₹4,250.00</h2>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
              <div>
                <p className="text-indigo-200 text-[10px] uppercase font-bold tracking-widest">Next Payout Date</p>
                <p className="font-bold">May 25, 2024</p>
              </div>
              <button className="p-2 bg-white text-indigo-600 rounded-xl hover:scale-110 transition-transform">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-gray-100 dark:border-slate-700 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <CreditCard size={18} className="text-indigo-600" />
              Payout Settings
            </h3>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700">
              <p className="text-xs text-slate-400 font-bold uppercase">Linked Bank</p>
              <p className="text-sm font-bold mt-1">Chase Bank •••• 4242</p>
              <button className="text-xs text-indigo-600 font-bold mt-2 hover:underline">Change Account</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm h-full">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <h3 className="font-bold">Payout History</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {reimbursedItems.length > 0 ? reimbursedItems.map((item) => (
                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                      <Wallet size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Payout for {item.merchant}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar size={12} />
                        Completed on May 10, 2024
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 dark:text-slate-100">₹{item.amount.toFixed(2)}</p>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Successful</span>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center opacity-40">
                  <Wallet size={48} className="mx-auto mb-4" />
                  <p className="text-sm font-medium">No recent payouts to show.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reimbursements;
