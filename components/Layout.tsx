
import React, { useState } from 'react';
import { 
  LayoutDashboard, FileText, CheckSquare, History, Sparkles, Settings as SettingsIcon, Menu, X, Bell, Search, LogOut, Moon, Sun, Users, CreditCard, Plane, Building, BarChart2, Home, PlusCircle, PieChart, Grid, Repeat, Target, TrendingUp, Briefcase, IndianRupee, Landmark, Layers, ClipboardList
} from 'lucide-react';
import { AppView, User, ExpenseMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  user: User | null;
  expenseMode: ExpenseMode;
  onLogout: () => void;
  onChangeMode: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, currentView, setCurrentView, user, expenseMode, onLogout, onChangeMode, isDarkMode, toggleDarkMode
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const companyItems = [
    { id: AppView.ADMIN_DASHBOARD, label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: AppView.MANAGE_MEMBERS, label: 'Manage Members', icon: Users },
    { id: AppView.BUDGET_MANAGEMENT, label: 'Budget Management', icon: PieChart },
    { id: AppView.EXPENSE_MANAGEMENT, label: 'Expense Management', icon: FileText },
    { id: AppView.REVENUE, label: 'Revenue', icon: TrendingUp },
    { id: AppView.AUDIT_LOG, label: 'Audit Log', icon: ClipboardList },
    { id: AppView.DEPARTMENT, label: 'Department', icon: Layers },
    { id: AppView.AI_INSIGHTS, label: 'AI Insights', icon: Sparkles },
    { id: AppView.REPORTS, label: 'Report', icon: BarChart2 },
    { id: AppView.SETTINGS, label: 'Settings', icon: SettingsIcon },
  ];

  const personalItems = [
    { id: AppView.DASHBOARD, label: 'Home', icon: Home },
    { id: AppView.INCOME, label: 'Income', icon: IndianRupee },
    { id: AppView.EXPENSES, label: 'Add Expense', icon: PlusCircle },
    { id: AppView.CATEGORIES, label: 'Categories', icon: Grid },
    { id: AppView.BUDGETS, label: 'Budgets', icon: PieChart },
    { id: AppView.SAVINGS_GOALS, label: 'Savings Goals', icon: Target },
    { id: AppView.REPORTS, label: 'Reports', icon: BarChart2 },
    { id: AppView.AI_INSIGHTS, label: 'AI Insights', icon: Sparkles },
    { id: AppView.SETTINGS, label: 'Profile', icon: SettingsIcon },
  ];

  const menuItems = expenseMode === ExpenseMode.COMPANY ? companyItems : personalItems;
  const themeBgPrimary = expenseMode === ExpenseMode.COMPANY ? 'bg-indigo-600' : 'bg-emerald-600';
  const themeTextPrimary = expenseMode === ExpenseMode.COMPANY ? 'text-indigo-500' : 'text-emerald-500';
  const themeActiveItem = expenseMode === ExpenseMode.COMPANY 
    ? 'bg-indigo-600 text-white shadow-indigo-100' 
    : 'bg-emerald-600 text-white shadow-emerald-100';

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-slate-900'}`}>
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-r transition-all duration-300 transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${themeBgPrimary} rounded-lg flex items-center justify-center text-white font-bold text-xl`}>EA</div>
              <div>
                <span className="font-bold text-lg leading-none block">Expense Analyzer</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${themeTextPrimary} block mt-0.5`}>
                  {expenseMode === ExpenseMode.COMPANY ? 'Admin Workspace' : 'Personal Workspace'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 lg:hidden text-slate-400"><X size={20} /></button>
          </div>

          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  currentView === item.id ? themeActiveItem : 'text-slate-500 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-slate-700">
            <button onClick={onChangeMode} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-gray-50 rounded-2xl">
              <Briefcase size={20} />
              <span className="font-semibold text-sm">Switch Workspace</span>
            </button>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-2xl">
              <LogOut size={20} />
              <span className="font-semibold text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen lg:pl-72">
        <header className={`sticky top-0 z-40 h-16 flex items-center justify-between px-4 lg:px-10 border-b ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-gray-200'} backdrop-blur-md`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 lg:hidden"><Menu size={24} /></button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder="Search team data..." className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border rounded-xl text-sm outline-none w-64 lg:w-96" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            <div className="flex items-center gap-3 ml-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">
                  {expenseMode === ExpenseMode.COMPANY ? 'Super Admin' : 'Personal'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-2xl ${themeBgPrimary} flex items-center justify-center text-white font-black text-sm border-2 border-white shadow-sm`}>
                {user ? getInitials(user.name) : 'AD'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default Layout;
