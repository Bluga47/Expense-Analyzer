
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  CreditCard, Zap, Briefcase, User as UserIcon, Plus, LayoutList, PieChart as PieIcon, Trash2, Edit3, IndianRupee, TrendingUp, ChevronDown, Calendar, Clock, Filter, CalendarDays
} from 'lucide-react';
import { apiService } from '../services/api';
import { ExpenseMode, AppView, User, Expense, Income } from '../types';
import { COLORS } from '../constants';

interface DashboardProps {
  user: User | null;
  mode: ExpenseMode;
  isDarkMode: boolean;
  onNavigate: (view: AppView) => void;
}

type TimeFrame = 'week' | 'month' | 'year' | 'custom';

const Dashboard: React.FC<DashboardProps> = ({ user, mode, isDarkMode, onNavigate }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomeList, setIncomeList] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for per-card filters - Defaulting to 'month' as requested
  const [incomeFilter, setIncomeFilter] = useState<TimeFrame>('month');
  const [expenseFilter, setExpenseFilter] = useState<TimeFrame>('month');
  const [balanceFilter, setBalanceFilter] = useState<TimeFrame>('month');
  const [transactionsFilter, setTransactionsFilter] = useState<TimeFrame>('month');

  // Custom date states for each card
  const [incomeCustomDate, setIncomeCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expenseCustomDate, setExpenseCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [balanceCustomDate, setBalanceCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transactionsCustomDate, setTransactionsCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isCompany = mode === ExpenseMode.COMPANY;
  const themeTextClass = isCompany ? 'text-indigo-600' : 'text-emerald-600';
  const themeBgClass = isCompany ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20';
  const themeBorderClass = isCompany ? 'border-indigo-100 dark:border-indigo-800' : 'border-emerald-100 dark:border-emerald-800';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [expData, incData] = await Promise.all([
        apiService.get('/expenses'),
        apiService.get('/income')
      ]);
      setExpenses(expData);
      setIncomeList(incData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDataByTime = (data: any[], timeframe: TimeFrame, customDate?: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Helper for "This Week" (start of week - Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return data.filter(item => {
      const itemDate = new Date(item.date);
      
      if (timeframe === 'week') {
        return itemDate >= startOfWeek;
      }
      if (timeframe === 'month') {
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      }
      if (timeframe === 'year') {
        return itemDate.getFullYear() === currentYear;
      }
      if (timeframe === 'custom' && customDate) {
        return item.date.startsWith(customDate);
      }
      return true;
    });
  };

  const filteredIncome = useMemo(() => filterDataByTime(incomeList, incomeFilter, incomeCustomDate), [incomeList, incomeFilter, incomeCustomDate]);
  const filteredExpenses = useMemo(() => filterDataByTime(expenses, expenseFilter, expenseCustomDate), [expenses, expenseFilter, expenseCustomDate]);
  
  const balanceIncome = useMemo(() => filterDataByTime(incomeList, balanceFilter, balanceCustomDate), [incomeList, balanceFilter, balanceCustomDate]);
  const balanceExpenses = useMemo(() => filterDataByTime(expenses, balanceFilter, balanceCustomDate), [expenses, balanceFilter, balanceCustomDate]);

  const countIncome = useMemo(() => filterDataByTime(incomeList, transactionsFilter, transactionsCustomDate), [incomeList, transactionsFilter, transactionsCustomDate]);
  const countExpenses = useMemo(() => filterDataByTime(expenses, transactionsFilter, transactionsCustomDate), [expenses, transactionsFilter, transactionsCustomDate]);

  const totalIncomeVal = filteredIncome.reduce((sum, e) => sum + e.amount, 0);
  const totalSpentVal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBalanceVal = balanceIncome.reduce((sum, e) => sum + e.amount, 0) - balanceExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalTransactionsCount = countIncome.length + countExpenses.length;

  const getTimeFrameLabel = (tf: TimeFrame, date?: string) => {
    switch(tf) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      case 'custom': return date || 'Specific Date';
      default: return 'This Month';
    }
  };

  const stats = [
    { 
      id: 'income',
      label: 'Total Income', 
      value: `₹${totalIncomeVal.toLocaleString('en-IN')}`, 
      timeframe: incomeFilter,
      setTimeframe: setIncomeFilter,
      customDate: incomeCustomDate,
      setCustomDate: setIncomeCustomDate,
      icon: IndianRupee, 
      bg: 'bg-emerald-50',
      text: 'text-emerald-600'
    },
    { 
      id: 'expense',
      label: 'Total Expenses', 
      value: `₹${totalSpentVal.toLocaleString('en-IN')}`, 
      timeframe: expenseFilter,
      setTimeframe: setExpenseFilter,
      customDate: expenseCustomDate,
      setCustomDate: setExpenseCustomDate,
      icon: IndianRupee, 
      bg: isCompany ? 'bg-indigo-50' : 'bg-rose-50',
      text: isCompany ? 'text-indigo-600' : 'text-rose-600'
    },
    { 
      id: 'balance',
      label: 'Net Balance', 
      value: `₹${totalBalanceVal.toLocaleString('en-IN')}`, 
      timeframe: balanceFilter,
      setTimeframe: setBalanceFilter,
      customDate: balanceCustomDate,
      setCustomDate: setBalanceCustomDate,
      icon: TrendingUp, 
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    { 
      id: 'transactions',
      label: 'Transactions', 
      value: totalTransactionsCount.toString(), 
      timeframe: transactionsFilter,
      setTimeframe: setTransactionsFilter,
      customDate: transactionsCustomDate,
      setCustomDate: setTransactionsCustomDate,
      icon: LayoutList, 
      bg: 'bg-amber-50',
      text: 'text-amber-600'
    },
  ];

  const categoryDataMap = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryDataMap).map(([name, value]) => ({
    name,
    value
  })).sort((a: any, b: any) => b.value - a.value);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      monthIndex: d.getMonth(),
      year: d.getFullYear()
    };
  });

  const comparisonData = last6Months.map(m => {
    const monthExp = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const monthInc = incomeList
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      name: m.month,
      Income: monthInc,
      Expense: monthExp
    };
  });

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 sm:space-y-10" onClick={() => setOpenDropdown(null)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">
            {getTimeGreeting()}, {user?.name.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-slate-500 text-sm max-w-lg leading-relaxed font-medium">
            {isCompany 
              ? "Here's the latest overview of your company's fiscal activity." 
              : "Keep your balance healthy and your expenses tracked."}
          </p>
        </div>
        <div className={`inline-flex items-center self-start gap-2 px-5 py-2.5 ${themeBgClass} border ${themeBorderClass} rounded-2xl`}>
          {isCompany ? <Briefcase size={18} className={themeTextClass} /> : <UserIcon size={18} className={themeTextClass} />}
          <span className={`text-xs font-black uppercase tracking-widest ${themeTextClass}`}>
            {isCompany ? 'Admin View' : 'Personal Workspace'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-6 hover:shadow-xl transition-all group relative overflow-visible">
            <div className="flex items-center justify-between">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.text} group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              
              {/* Dropdown Selector */}
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === stat.id ? null : stat.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${openDropdown === stat.id ? 'bg-indigo-600 text-white' : 'bg-gray-50 dark:bg-slate-700 text-slate-500 hover:bg-gray-100'}`}
                >
                  {getTimeFrameLabel(stat.timeframe, stat.customDate)}
                  <ChevronDown size={12} className={`transition-transform duration-200 ${openDropdown === stat.id ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === stat.id && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl z-50 p-2 animate-in zoom-in-95 duration-150 origin-top-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[
                      { value: 'week', label: 'This Week', icon: Clock },
                      { value: 'month', label: 'This Month', icon: Calendar },
                      { value: 'year', label: 'This Year', icon: TrendingUp },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          stat.setTimeframe(opt.value as TimeFrame);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          stat.timeframe === opt.value 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' 
                          : 'text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <opt.icon size={14} />
                        {opt.label}
                      </button>
                    ))}
                    
                    {/* Custom Date Picker Section */}
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                      <div className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Specific Date</div>
                      <div className="px-2 pb-2">
                        <div className="relative">
                          <input 
                            type="date" 
                            className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-slate-900 border dark:border-slate-600 rounded-xl text-[10px] font-bold outline-none focus:border-indigo-500"
                            value={stat.customDate}
                            onChange={(e) => {
                              stat.setCustomDate(e.target.value);
                              stat.setTimeframe('custom');
                              // Do not close dropdown automatically to let user see selection, 
                              // or close it if you prefer:
                              // setOpenDropdown(null);
                            }}
                          />
                          <CalendarDays size={14} className="absolute left-2.5 top-2 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black mt-1 tabular-nums">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden h-full flex flex-col">
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <TrendingUp size={20} className="text-emerald-600" />
                  <h3 className="font-black text-lg">Cash Flow Analysis</h3>
               </div>
            </div>
            <div className="flex-1 p-8 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="Income" fill="#10b981" radius={[10, 10, 0, 0]} barSize={30} />
                  <Bar dataKey="Expense" fill="#f43f5e" radius={[10, 10, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden h-full flex flex-col">
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-slate-700 flex items-center gap-3">
              <PieIcon size={20} className={themeTextClass} />
              <h3 className="font-black text-lg">Expense Breakdown</h3>
            </div>
            <div className="flex-1 p-8 min-h-[350px]">
              {expenses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic">
                  No expense data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontWeight: 'bold' }} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', fontWeight: 900 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-black text-lg">Recent Transactions</h3>
            <button 
              onClick={() => onNavigate(AppView.EXPENSES)}
              className={`${themeTextClass} text-xs font-black uppercase tracking-widest hover:underline transition-all`}
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant/Source</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                {expenses.slice(0, 5).map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-8 py-6 text-sm font-bold text-slate-400">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-8 py-6 font-black">{expense.merchant}</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm font-black tabular-nums text-rose-500">- ₹{expense.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
