
import React, { useState } from 'react';
import { ClipboardList, Search, Filter, Download, User, Shield, Info, AlertCircle, Clock } from 'lucide-react';

interface AuditItem {
  id: string;
  date: string;
  action: string;
  member: string;
  type: 'Security' | 'Finance' | 'Members' | 'System';
  description: string;
  ip: string;
}

const MOCK_LOGS: AuditItem[] = [
  { id: 'log-1', date: '2024-05-20 14:24:12', action: 'Member Invited', member: 'Arjun Sharma', type: 'Members', description: 'Invited rahul@company.com to Engineering Dept.', ip: '192.168.1.45' },
  { id: 'log-2', date: '2024-05-20 11:05:45', action: 'Budget Adjusted', member: 'Arjun Sharma', type: 'Finance', description: 'Increased Marketing budget by ₹200,000 for Q3.', ip: '192.168.1.45' },
  { id: 'log-3', date: '2024-05-19 18:30:00', action: 'Expense Approved', member: 'Priya Patel', type: 'Finance', description: 'Approved expense #EXP-442 (₹45,000) for Rahul Verma.', ip: '172.16.0.12' },
  { id: 'log-4', date: '2024-05-19 09:12:33', action: 'Password Changed', member: 'Rahul Verma', type: 'Security', description: 'User changed their account security credentials.', ip: '10.0.0.8' },
  { id: 'log-5', date: '2024-05-18 15:45:10', action: 'New Department', member: 'Arjun Sharma', type: 'System', description: 'Created new department "Logistics Operations".', ip: '192.168.1.45' },
  { id: 'log-6', date: '2024-05-18 10:20:05', action: 'Login Success', member: 'Sneha Gupta', type: 'Security', description: 'Successful login from new device (MacBook Pro).', ip: '45.122.3.90' },
];

const AuditLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getTypeColor = (type: AuditItem['type']) => {
    switch (type) {
      case 'Security': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400';
      case 'Finance': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'Members': return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400';
      default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const filteredLogs = MOCK_LOGS.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Organizational Audit Trail</h1>
          <p className="text-slate-500 font-medium">Complete record of administrative actions and system events.</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-sm font-black shadow-sm hover:bg-gray-50 transition-all">
          <Download size={18} />
          Export Logs
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by action, member or description..." 
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-3.5 bg-gray-50 dark:bg-slate-900 border rounded-2xl text-sm font-black flex items-center gap-2">
          <Filter size={18} /> Filter by Type
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-900/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Clock size={14} className="text-slate-300" />
                      {log.date}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-black text-sm">{log.action}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-[10px] font-black">
                        {log.member.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-bold">{log.member}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 border rounded-lg text-[10px] font-black uppercase tracking-widest ${getTypeColor(log.type)}`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                    <p className="text-xs text-slate-500 font-medium truncate" title={log.description}>
                      {log.description}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <code className="text-[10px] bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-400 font-mono">
                      {log.ip}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 p-6 rounded-[2rem] flex items-center gap-4">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-indigo-600 shadow-sm">
          <Info size={20} />
        </div>
        <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">
          <strong>Security Note:</strong> Audit logs are immutable and stored for 365 days. 
          To request deeper forensic analysis, please contact corporate security.
        </p>
      </div>
    </div>
  );
};

export default AuditLog;
