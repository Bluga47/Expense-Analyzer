
import React, { useState, useEffect } from 'react';
import { PieChart, List, Plus, Target, X, Edit2, Trash2, AlertTriangle, TrendingUp, Check, RefreshCw, ShoppingBag, Utensils, Car, Zap, Heart, Home, Smartphone, Grid, Coffee, Bus, Gift, Gamepad2, Dumbbell, Plane } from 'lucide-react';
import { Budget } from '../types';
import { apiService } from '../services/api';

const ICON_OPTIONS = [
  { name: 'Target', icon: Target },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Utensils', icon: Utensils },
  { name: 'Car', icon: Car },
  { name: 'Zap', icon: Zap },
  { name: 'Heart', icon: Heart },
  { name: 'Home', icon: Home },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Grid', icon: Grid },
  { name: 'Coffee', icon: Coffee },
  { name: 'Bus', icon: Bus },
  { name: 'Gift', icon: Gift },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Plane', icon: Plane },
];

const BudgetTracker: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  
  // Form States
  const [formData, setFormData] = useState({ 
    name: '', 
    limit: 0, 
    icon: 'Target',
    categoryNames: [] as string[]
  });
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [budgetData, categoryData] = await Promise.all([
        apiService.get('/budgets'),
        apiService.get('/categories')
      ]);
      setBudgets(budgetData);
      setCategories(categoryData);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await apiService.put(`/budgets/${editingBudget.id}`, formData);
      } else {
        await apiService.post('/budgets', formData);
      }
      fetchData();
      closeModal();
    } catch (err) {
      alert('Error saving budget');
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingBudget(null);
    setFormData({ name: '', limit: 0, icon: 'Target', categoryNames: [] });
  };

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      limit: budget.limit,
      icon: budget.icon,
      categoryNames: budget.categoryNames
    });
    setShowCreateModal(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm(`Are you sure you want to delete this budget tracking?`)) {
      try {
        await apiService.delete(`/budgets/${id}`);
        fetchData();
      } catch (err) {
        alert('Error deleting budget');
      }
    }
  };

  const toggleCategory = (catName: string) => {
    setFormData(prev => {
      const exists = prev.categoryNames.includes(catName);
      if (exists) {
        return { ...prev, categoryNames: prev.categoryNames.filter(n => n !== catName) };
      } else {
        return { ...prev, categoryNames: [...prev.categoryNames, catName] };
      }
    });
  };

  const handleAddManualCategory = () => {
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    if (!formData.categoryNames.includes(catName)) {
      setFormData(prev => ({
        ...prev,
        categoryNames: [...prev.categoryNames, catName]
      }));
    }
    setNewCategoryName('');
  };

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);

  const getIconComponent = (iconName: string) => {
    const option = ICON_OPTIONS.find(o => o.name === iconName);
    const Icon = option ? option.icon : Target;
    return <Icon size={28} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Budgets & Planning</h1>
          <p className="text-slate-500 text-sm font-medium">Control your spending limits across multiple categories.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            Create Budget
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly Limit</p>
          <h3 className="text-4xl font-black mt-2">
            ₹{totalLimit.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">Planned monthly expenditure</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Utilized</p>
          <h3 className={`text-4xl font-black mt-2 ${totalSpent > totalLimit && totalLimit > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ₹{totalSpent.toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">Current spending across all budgets</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400 font-bold">Loading your budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-20 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-slate-700 text-center space-y-6">
          <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
            <Target size={40} className="text-slate-300" />
          </div>
          <div>
            <h3 className="text-xl font-black">No budgets defined</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">You haven't set any spending limits yet. Start by creating budgets and assigning categories to them.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black flex items-center gap-2 mx-auto hover:scale-105 transition-all shadow-lg"
          >
            <Plus size={20} />
            Add First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {budgets.map((budget, i) => {
            const percentage = budget.limit > 0 ? Math.min((budget.spent / budget.limit) * 100, 100) : 0;
            const isNearLimit = percentage > 85;
            const isOverLimit = percentage >= 100 && budget.spent >= budget.limit;

            return (
              <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 space-y-8 hover:shadow-xl transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${isOverLimit ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'} rounded-2xl flex items-center justify-center transition-colors`}>
                      {getIconComponent(budget.icon)}
                    </div>
                    <div>
                      <h3 className="font-black text-xl">{budget.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {budget.categoryNames.length} Categories
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditClick(budget)}
                      className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
                      title="Edit Budget"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                      title="Delete Budget"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumed</p>
                      <p className={`text-2xl font-black tabular-nums ${isOverLimit ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                        ₹{budget.spent.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-black px-3 py-1 rounded-full ${
                        isOverLimit ? 'bg-rose-100 text-rose-700' : isNearLimit ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {percentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full h-3 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        isOverLimit ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-slate-700/50">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remaining</p>
                    <p className="text-sm font-bold text-slate-500">
                      ₹{Math.max(0, budget.limit - budget.spent).toLocaleString('en-IN')} left
                    </p>
                  </div>
                  {isNearLimit && (
                    <div className="flex items-center gap-1 text-amber-500 animate-pulse">
                      <AlertTriangle size={14} />
                      <span className="text-[10px] font-black uppercase tracking-tight">Warning</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-all">
          <form onSubmit={handleSaveBudget} className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 sm:p-10 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight">{editingBudget ? 'Edit Budget' : 'Create New Budget'}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Define a monthly spending goal and assign categories.</p>
              </div>
              <button type="button" onClick={closeModal} className="p-3 bg-gray-100 dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 sm:p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Budget Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Monthly Living, Fun Money" 
                    className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Limit (₹)</label>
                  <input 
                    required
                    type="number" 
                    placeholder="0.00" 
                    className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none"
                    value={formData.limit || ''}
                    onChange={e => setFormData({...formData, limit: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Budget Logo</label>
                <div className="flex flex-wrap gap-3">
                  {ICON_OPTIONS.map(opt => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setFormData({...formData, icon: opt.name})}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        formData.icon === opt.name 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                        : 'bg-gray-50 dark:bg-slate-900 text-slate-400 hover:bg-gray-100'
                      }`}
                    >
                      <opt.icon size={20} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tracked Categories</label>
                
                <div className="flex gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="Add custom category..." 
                    className="flex-1 p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddManualCategory();
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={handleAddManualCategory}
                    className="px-4 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Show selected manual categories that aren't in the global list */}
                  {formData.categoryNames.filter(name => !categories.some(c => c.name === name)).map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleCategory(name)}
                      className="p-3 rounded-xl text-xs font-bold text-left transition-all border bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700 flex items-center justify-between"
                    >
                      {name}
                      <X size={12} />
                    </button>
                  ))}

                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`p-3 rounded-xl text-xs font-bold text-left transition-all border ${
                        formData.categoryNames.includes(cat.name)
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700'
                        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
                {categories.length === 0 && formData.categoryNames.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No categories found. Add categories manually above or in the Expenses section.</p>
                )}
              </div>
            </div>

            <div className="p-8 sm:p-10 bg-gray-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-8 py-4 rounded-2xl text-sm font-black hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-200 dark:shadow-none transition-all">
                {editingBudget ? 'Update Budget' : 'Save Budget'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
