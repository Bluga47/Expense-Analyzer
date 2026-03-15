
import React from 'react';
import { TrendingUp, Plus, Search, IndianRupee, ArrowUpRight, Filter, MoreVertical, Building2 } from 'lucide-react';

const RevenueManager: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Corporate Revenue</h1>
          <p className="text-slate-500 font-medium">Track all organizational income streams and receivables.</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <Plus size={18} />
          Add Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Revenue (Q2)</p>
          <h3 className="text-4xl font-black mt-2 tabular-nums">₹12.4M</h3>
          <div className="flex items-center gap-1 text-emerald-500 text-xs font-black mt-2">
            <ArrowUpRight size={14} /> +18.4% vs Q1
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Contracts</p>
          <h3 className="text-4xl font-black mt-2 tabular-nums">42</h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">8 pending renewal</p>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest relative z-10">Net Profit Margin</p>
          <h3 className="text-4xl font-black mt-2 relative z-10">32.8%</h3>
          <p className="text-xs text-indigo-200 mt-2 relative z-10">Top decile for SaaS</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input type="text" placeholder="Search transactions, clients..." className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border rounded-2xl outline-none" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="px-6 py-3.5 bg-gray-50 dark:bg-slate-900 border rounded-2xl text-sm font-black flex items-center gap-2">
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-slate-900/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client / Source</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stream</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
            {[1, 2, 3].map((i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6 text-sm font-bold text-slate-400">May {20 - i}, 2024</td>
                <td className="px-8 py-6 font-black">Strategic Partner {i}</td>
                <td className="px-8 py-6">
                   <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Enterprise License</span>
                </td>
                <td className="px-8 py-6 text-right font-black tabular-nums text-emerald-600">₹450,000.00</td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueManager;
