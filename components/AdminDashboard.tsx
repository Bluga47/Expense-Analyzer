
import React from 'react';
import { 
  Users, TrendingUp, TrendingDown, IndianRupee, Building2, Layers, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

const AdminDashboard: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const stats = [
    { label: 'Corporate Revenue', value: '₹4.2M', trend: '+12%', isUp: true, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Expenses', value: '₹1.8M', trend: '-4%', isUp: false, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Active Members', value: '142', trend: '+8', isUp: true, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Efficiency Score', value: '94%', trend: '+2%', isUp: true, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const chartData = [
    { name: 'Jan', revenue: 400000, expense: 240000 },
    { name: 'Feb', revenue: 300000, expense: 139800 },
    { name: 'Mar', revenue: 500000, expense: 280000 },
    { name: 'Apr', revenue: 450000, expense: 390800 },
    { name: 'May', revenue: 600000, expense: 480000 },
    { name: 'Jun', revenue: 550000, expense: 380000 },
  ];

  const deptData = [
    { name: 'Engineering', value: 400 },
    { name: 'Marketing', value: 300 },
    { name: 'Sales', value: 300 },
    { name: 'HR', value: 200 },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Admin Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time organizational fiscal performance and metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none">
            Export Monthly Report
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-black mb-8 flex items-center gap-3">
            <TrendingUp size={20} className="text-indigo-600" />
            Fiscal Performance
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={4} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col">
          <h3 className="text-lg font-black mb-8 flex items-center gap-3">
            <Layers size={20} className="text-indigo-600" />
            Department Spend
          </h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {deptData.map((d, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm font-bold text-slate-500">{d.name}</span>
                </div>
                <span className="text-sm font-black">₹{d.value}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
