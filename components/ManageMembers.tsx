
import React, { useState } from 'react';
import { Users, Search, Plus, Mail, Shield, UserPlus, MoreVertical, X, Filter } from 'lucide-react';

const ManageMembers: React.FC = () => {
  const [members] = useState([
    { id: 1, name: 'Arjun Sharma', email: 'arjun@company.com', role: 'Super Admin', status: 'Active', dept: 'Finance' },
    { id: 2, name: 'Priya Patel', email: 'priya@company.com', role: 'Manager', status: 'Active', dept: 'Marketing' },
    { id: 3, name: 'Rahul Verma', email: 'rahul@company.com', role: 'Employee', status: 'Active', dept: 'Engineering' },
    { id: 4, name: 'Sneha Gupta', email: 'sneha@company.com', role: 'Employee', status: 'Pending', dept: 'Sales' },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Manage Members</h1>
          <p className="text-slate-500 font-medium">Add, remove or update roles of your organization team.</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">
          <UserPlus size={18} />
          Invite Member
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input type="text" placeholder="Search by name, email or role..." className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
        </div>
        <button className="px-6 py-3.5 bg-gray-50 dark:bg-slate-900 border rounded-2xl text-sm font-black flex items-center gap-2">
          <Filter size={18} /> Filter
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-900/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-black text-sm">{member.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-500">{member.dept}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      member.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {member.status}
                    </span>
                  </td>
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
    </div>
  );
};

export default ManageMembers;
