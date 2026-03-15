
import React from 'react';
import { Layers, Plus, Users, PieChart, TrendingUp, MoreVertical, Building2 } from 'lucide-react';

const DepartmentManager: React.FC = () => {
  const departments = [
    { name: 'Engineering', lead: 'Rahul V.', members: 42, budget: '₹2.4M', spent: '₹1.1M', color: 'indigo' },
    { name: 'Marketing', lead: 'Priya P.', members: 15, budget: '₹800K', spent: '₹650K', color: 'rose' },
    { name: 'Sales', lead: 'Amit K.', members: 28, budget: '₹1.2M', spent: '₹950K', color: 'emerald' },
    { name: 'Product', lead: 'Neha S.', members: 12, budget: '₹500K', spent: '₹120K', color: 'amber' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Departments</h1>
          <p className="text-slate-500 font-medium">Structure your organization and manage group-level resources.</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <Plus size={18} />
          Create Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {departments.map((dept, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-${dept.color}-50 text-${dept.color}-600 rounded-2xl flex items-center justify-center font-black`}>
                  <Building2 size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black">{dept.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">Lead: {dept.lead}</p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Users size={12} /> Team Size
                </div>
                <p className="text-xl font-black">{dept.members} Members</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <TrendingUp size={12} /> Utilization
                </div>
                <p className="text-xl font-black">45.8%</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Cycle</p>
                <p className="text-sm font-black">{dept.spent} / <span className="text-slate-400">{dept.budget}</span></p>
              </div>
              <div className="w-full h-3 bg-gray-50 dark:bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 w-[45.8%] transition-all duration-1000"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentManager;
