
import React, { useState } from 'react';
import { Target, PiggyBank, Plus, MoreVertical, TrendingUp, Calendar, ArrowRight, Wallet, X, Check, Trash2 } from 'lucide-react';

interface Goal {
  id: number;
  name: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
  icon: any;
}

const INITIAL_SAVINGS_DATA: Goal[] = [];

const SavingsGoals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_SAVINGS_DATA);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState<Goal | null>(null);
  const [showEditModal, setShowEditModal] = useState<Goal | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    target: '',
    deadline: '',
    color: 'emerald'
  });

  const [addFundsAmount, setAddFundsAmount] = useState('');

  const totalSaved = goals.reduce((acc, curr) => acc + curr.current, 0);
  const totalTarget = goals.reduce((acc, curr) => acc + curr.target, 0);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal: Goal = {
      id: Date.now(),
      name: formData.name,
      target: parseFloat(formData.target),
      current: 0,
      deadline: formData.deadline,
      color: formData.color,
      icon: Target
    };
    setGoals([...goals, newGoal]);
    setShowCreateModal(false);
    setFormData({ name: '', target: '', deadline: '', color: 'emerald' });
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddFundsModal) return;
    const amount = parseFloat(addFundsAmount);
    setGoals(goals.map(g => 
      g.id === showAddFundsModal.id 
      ? { ...g, current: Math.min(g.target, g.current + amount) } 
      : g
    ));
    setShowAddFundsModal(null);
    setAddFundsAmount('');
  };

  const handleDeleteGoal = (id: number) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(g => g.id !== id));
      setActiveMenu(null);
    }
  };

  const handleManageTransfers = () => {
    alert('Transfer management system triggered. Redirecting to bank connections...');
  };

  const getColorClass = (color: string) => {
    const map: Record<string, string> = {
      emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
      indigo: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
      amber: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600',
      rose: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600',
    };
    return map[color] || map.emerald;
  };

  const getBtnColorClass = (color: string) => {
    const map: Record<string, string> = {
      emerald: 'bg-emerald-600 shadow-emerald-200',
      indigo: 'bg-indigo-600 shadow-indigo-200',
      amber: 'bg-amber-600 shadow-amber-200',
      rose: 'bg-rose-600 shadow-rose-200',
    };
    return map[color] || map.emerald;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Savings Goals</h1>
          <p className="text-slate-500 text-sm">Plan for your future by tracking milestones.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-95"
        >
          <Plus size={18} />
          Create New Goal
        </button>
      </div>

      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Savings</p>
          <h3 className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400">₹{totalSaved.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">Across {goals.length} active goals</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Progress</p>
          <h3 className="text-3xl font-black mt-2">{totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}%</h3>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-900 rounded-full mt-4 overflow-hidden">
             <div 
               className="h-full bg-emerald-500 transition-all duration-1000" 
               style={{ width: `${totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}%` }}
             />
          </div>
        </div>
        <div className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-200 dark:shadow-none text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
          <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest relative z-10">Monthly Contribution</p>
          <h3 className="text-3xl font-black mt-2 relative z-10">₹0.00</h3>
          <button 
            onClick={handleManageTransfers}
            className="flex items-center gap-2 mt-4 text-xs font-bold text-emerald-100 hover:text-white transition-colors relative z-10"
          >
            Manage Transfers <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {goals.map((goal) => {
          const percentage = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;
          const isMenuActive = activeMenu === goal.id;
          
          return (
            <div key={goal.id} className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all group relative">
              <div className="flex flex-col items-center justify-center space-y-4 shrink-0">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-gray-100 dark:text-slate-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={364}
                      strokeDashoffset={364 - (364 * percentage) / 100}
                      strokeLinecap="round"
                      className={`${goal.color === 'emerald' ? 'text-emerald-500' : goal.color === 'indigo' ? 'text-indigo-500' : goal.color === 'amber' ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-black">{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${getColorClass(goal.color)} group-hover:scale-110 transition-transform`}>
                      <goal.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{goal.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        <Calendar size={12} />
                        Target: {goal.deadline}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenu(isMenuActive ? null : goal.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {isMenuActive && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-2xl p-2 z-30 animate-in zoom-in-95 duration-150">
                        <button 
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
                        >
                          <Trash2 size={18} /> Delete Goal
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved</p>
                    <p className="text-lg font-black">₹{goal.current.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining</p>
                    <p className="text-lg font-black text-slate-400">₹{(goal.target - goal.current).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowAddFundsModal(goal)}
                    className={`flex-1 py-3 px-4 ${getBtnColorClass(goal.color)} text-white rounded-2xl text-xs font-black shadow-lg hover:brightness-110 transition-all active:scale-95`}
                  >
                    Add Funds
                  </button>
                  <button className="px-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-2xl text-xs font-bold hover:bg-gray-200 transition-colors">
                    Edit Goal
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
          <form onSubmit={handleCreateGoal} className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Create Savings Goal</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">What are you saving for?</p>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-3 bg-gray-100 dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Goal Name</label>
                <input required type="text" placeholder="e.g. New Home, Retirement" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Amount (₹)</label>
                  <input required type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none" value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Date</label>
                  <input required type="date" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Theme Color</label>
                <div className="flex gap-4">
                  {['emerald', 'indigo', 'amber', 'rose'].map(c => (
                    <button key={c} type="button" onClick={() => setFormData({...formData, color: c})} className={`w-10 h-10 rounded-xl transition-all ${formData.color === c ? 'ring-4 ring-offset-2 ring-emerald-500' : 'opacity-60'} ${c === 'emerald' ? 'bg-emerald-500' : c === 'indigo' ? 'bg-indigo-500' : c === 'amber' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-8 py-4 rounded-2xl text-sm font-black hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-xl transition-all">Start Saving</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
          <form onSubmit={handleAddFunds} className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Add Funds</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Contributing to {showAddFundsModal.name}</p>
              </div>
              <button type="button" onClick={() => setShowAddFundsModal(null)} className="p-3 bg-gray-100 dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount to Add (₹)</label>
                <input required autoFocus type="number" placeholder="0.00" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none text-2xl font-black text-center" value={addFundsAmount} onChange={e => setAddFundsAmount(e.target.value)} />
              </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddFundsModal(null)} className="px-8 py-4 rounded-2xl text-sm font-black hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-xl transition-all flex items-center gap-2">
                <Check size={18} /> Confirm Deposit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Overlay to close menus */}
      {activeMenu && (
        <div className="fixed inset-0 z-20" onClick={() => setActiveMenu(null)} />
      )}
    </div>
  );
};

export default SavingsGoals;
