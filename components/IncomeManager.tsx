
import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, X, IndianRupee, TrendingUp, TrendingDown, Briefcase, Wallet, Smartphone, Target, Grid } from 'lucide-react';
import { apiService } from '../services/api';
import { Income, AppView } from '../types';

interface IncomeManagerProps {
  onNavigate?: (view: AppView) => void;
}

const IncomeManager: React.FC<IncomeManagerProps> = ({ onNavigate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeList, setIncomeList] = useState<Income[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    source: '',
    category: '',
    notes: ''
  });

  const [sourceFormData, setSourceFormData] = useState({
    name: '',
    color: 'emerald',
    iconName: 'Grid'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [incomeData, categories] = await Promise.all([
        apiService.get('/income'),
        apiService.get('/income-categories')
      ]);
      setIncomeList(incomeData);
      setIncomeCategories(categories);
      if (categories.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: categories[0].name }));
      }
    } catch (err) {
      console.error('Failed to fetch income data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIncome) {
        const updated = await apiService.put(`/income/${editingIncome.id}`, formData);
        setIncomeList(prev => prev.map(inc => inc.id === updated.id ? updated : inc));
      } else {
        const newIncome = await apiService.post('/income', formData);
        setIncomeList(prev => [newIncome, ...prev]);
      }
      closeModal();
    } catch (err) {
      alert('Error saving income');
    }
  };

  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSource = await apiService.post('/income-categories', sourceFormData);
      setIncomeCategories(prev => [...prev, newSource]);
      if (!formData.category) {
        setFormData(prev => ({ ...prev, category: newSource.name }));
      }
      setShowAddSourceModal(false);
      setSourceFormData({ name: '', color: 'emerald', iconName: 'Grid' });
    } catch (err) {
      alert('Error saving source');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingIncome(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      source: '',
      category: incomeCategories.length > 0 ? incomeCategories[0].name : '',
      notes: ''
    });
  };

  const handleEditClick = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      date: income.date,
      amount: income.amount.toString(),
      source: income.source,
      category: income.category,
      notes: income.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this income record?')) return;
    try {
      await apiService.delete(`/income/${id}`);
      setIncomeList(prev => prev.filter(inc => inc.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Monthly Comparison Logic
  const getMonthlyTotal = (monthOffset: number) => {
    const now = new Date();
    const targetMonth = now.getMonth() - monthOffset;
    const targetYear = now.getFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = (targetMonth + 12) % 12;

    return incomeList
      .filter(inc => {
        const d = new Date(inc.date);
        return d.getMonth() === normalizedMonth && d.getFullYear() === targetYear;
      })
      .reduce((sum, inc) => sum + inc.amount, 0);
  };

  const currentMonthTotal = getMonthlyTotal(0);
  const lastMonthTotal = getMonthlyTotal(1);
  const diff = currentMonthTotal - lastMonthTotal;
  const percentChange = lastMonthTotal === 0 ? (currentMonthTotal > 0 ? 100 : 0) : (diff / lastMonthTotal) * 100;

  const filteredIncome = incomeList.filter(inc => {
    const matchesSearch = inc.source.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inc.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || inc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Income Tracking</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Monitor your inflows and diversified sources.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddSourceModal(true)} className="px-8 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl text-sm font-black shadow-sm transition-all active:scale-95">
            Add Source
          </button>
          <button onClick={() => setShowAddModal(true)} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-lg transition-all active:scale-95">
            Add Income
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">This Month Income</p>
            <h3 className="text-4xl font-black mt-2 tabular-nums">₹{currentMonthTotal.toLocaleString('en-IN')}</h3>
          </div>
          <div className={`flex flex-col items-end gap-1 ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            <div className="flex items-center gap-1 font-black">
              {diff >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span>{Math.abs(percentChange).toFixed(1)}%</span>
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-400">vs last month</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Sources</p>
          <div className="flex items-center gap-4 mt-2">
            <h3 className="text-4xl font-black tabular-nums">{incomeCategories.length}</h3>
            <div className="flex -space-x-3">
              {incomeCategories.length === 0 ? (
                <p className="text-xs text-slate-400 italic ml-4">No sources added yet</p>
              ) : (
                incomeCategories.slice(0, 4).map((cat, i) => (
                   <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-xs font-black ${
                     cat.color === 'blue' ? 'bg-blue-500' : cat.color === 'emerald' ? 'bg-emerald-500' : cat.color === 'indigo' ? 'bg-indigo-500' : 'bg-rose-500'
                   }`}>
                     {cat.name[0]}
                   </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input type="text" placeholder="Search sources..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-3.5 bg-gray-50 dark:bg-slate-900 border rounded-2xl text-sm font-bold outline-none"
          >
            <option>All Categories</option>
            {incomeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {isLoading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center font-bold text-slate-400 animate-pulse">Loading income streams...</td></tr>
              ) : filteredIncome.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-24 text-center text-slate-400 italic font-medium">No income records found.</td></tr>
              ) : filteredIncome.map(inc => (
                <tr key={inc.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all group">
                  <td className="px-8 py-6 text-sm font-bold text-slate-400">{new Date(inc.date).toLocaleDateString()}</td>
                  <td className="px-8 py-6 font-black">{inc.source}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {inc.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-black tabular-nums text-emerald-600">₹{inc.amount.toLocaleString('en-IN')}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEditClick(inc)} className="p-3 text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(inc.id)} className="p-3 text-slate-400 hover:text-rose-600 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
          <form onSubmit={handleSaveIncome} className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col">
            <div className="p-8 border-b dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-black">{editingIncome ? 'Edit Income' : 'Add Income'}</h2>
              <button type="button" onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount (₹)</label>
                  <input required type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source</label>
                <input required type="text" placeholder="e.g. Monthly Salary, Upwork Project" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border outline-none">
                  {incomeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border outline-none h-24 resize-none" />
              </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-8 py-4 font-black hover:bg-gray-100 rounded-2xl">Cancel</button>
              <button type="submit" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all">Save Record</button>
            </div>
          </form>
        </div>
      )}

      {showAddSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
          <form onSubmit={handleSaveSource} className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col">
            <div className="p-8 border-b dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-black">Add Income Source</h2>
              <button type="button" onClick={() => setShowAddSourceModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Name</label>
                <input required type="text" placeholder="e.g. Salary, Freelance, Dividends" value={sourceFormData.name} onChange={e => setSourceFormData({...sourceFormData, name: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Color Theme</label>
                <div className="flex flex-wrap gap-3">
                  {['emerald', 'blue', 'rose', 'indigo', 'amber', 'violet'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSourceFormData({...sourceFormData, color})}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        sourceFormData.color === color ? 'ring-4 ring-offset-2 ring-emerald-500' : 'opacity-60 hover:opacity-100'
                      } ${
                        color === 'emerald' ? 'bg-emerald-500' :
                        color === 'blue' ? 'bg-blue-500' :
                        color === 'rose' ? 'bg-rose-500' :
                        color === 'indigo' ? 'bg-indigo-500' :
                        color === 'amber' ? 'bg-amber-500' : 'bg-violet-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddSourceModal(false)} className="px-8 py-4 font-black hover:bg-gray-100 rounded-2xl">Cancel</button>
              <button type="submit" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all">Create Source</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default IncomeManager;
