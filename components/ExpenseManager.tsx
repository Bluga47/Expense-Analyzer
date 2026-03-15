
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Filter, Search, Download, Trash2, Edit3, MoreVertical, X, Upload, Receipt, Check, FileText, Grid, Wallet, CreditCard, Banknote, Sparkles, Loader2, Camera } from 'lucide-react';
import { apiService } from '../services/api';
import { Expense, ExpenseMode, AppView } from '../types';

interface ExpenseManagerProps {
  mode: ExpenseMode;
  onNavigate?: (view: AppView) => void;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ mode, onNavigate }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userCategories, setUserCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    merchant: '',
    category: '',
    paymentMethod: 'UPI',
    notes: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchUserCategories();
  }, []);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.get('/expenses');
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserCategories = async () => {
    try {
      const cats = await apiService.get('/categories');
      setUserCategories(cats);
      if (cats.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: cats[0].name }));
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert('Please select a category. If none exist, create one in the Categories tab.');
      return;
    }
    
    try {
      if (editingExpense) {
        const updated = await apiService.put(`/expenses/${editingExpense.id}`, formData);
        setExpenses(prev => prev.map(exp => exp.id === updated.id ? updated : exp));
      } else {
        const newExpense = await apiService.post('/expenses', formData);
        setExpenses(prev => [newExpense, ...prev]);
      }
      
      closeModal();
    } catch (err) {
      alert('Error saving expense');
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      amount: expense.amount.toString(),
      merchant: expense.merchant,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || ''
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingExpense(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      merchant: '',
      category: userCategories.length > 0 ? userCategories[0].name : '',
      paymentMethod: 'UPI',
      notes: ''
    });
    setIsScanning(false);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this transaction permanently?')) return;
    
    setIsDeleting(id);
    try {
      await apiService.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => String(e.id) !== String(id)));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete the transaction. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const extractedData = await apiService.ocrScan(base64String, file.type);
        
        // Find if the extracted category exists in user's categories, else use first one
        let finalCat = userCategories.find(c => c.name.toLowerCase().includes(extractedData.category.toLowerCase()))?.name || extractedData.category;
        
        // If the specific AI category is not in list, pick the closest or the first
        if (!userCategories.some(c => c.name === finalCat)) {
           finalCat = userCategories.length > 0 ? userCategories[0].name : finalCat;
        }

        setFormData(prev => ({
          ...prev,
          date: extractedData.date || prev.date,
          amount: extractedData.amount?.toString() || prev.amount,
          merchant: extractedData.merchant || prev.merchant,
          category: finalCat,
          notes: extractedData.notes || prev.notes
        }));
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(err.message || "Failed to scan receipt");
      setIsScanning(false);
    }
  };

  const isCompany = mode === ExpenseMode.COMPANY;
  const themeBgBtn = isCompany ? 'bg-indigo-600' : 'bg-emerald-600';

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.merchant.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">{isCompany ? 'Company Claims' : 'Personal Expenses'}</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Efficiently track your ₹ INR spending.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAddModal(true)} className={`px-8 py-3 ${themeBgBtn} text-white rounded-2xl text-sm font-black shadow-lg transition-all active:scale-95`}>
            Add Expense
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input type="text" placeholder="Search expenses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-3.5 bg-gray-50 dark:bg-slate-900 border rounded-2xl text-sm font-bold outline-none grow md:grow-0"
          >
            <option>All Categories</option>
            {userCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className={`px-6 py-3.5 bg-gray-50 border rounded-2xl text-sm font-black`}>More Filters</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Merchant</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {isLoading ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center font-bold text-slate-400 animate-pulse">Fetching your history...</td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-24 text-center text-slate-400 italic font-medium">No transactions found matching your criteria.</td></tr>
              ) : filteredExpenses.map(expense => (
                <tr key={expense.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all group ${isDeleting === expense.id ? 'opacity-25 grayscale pointer-events-none' : ''}`}>
                  <td className="px-8 py-6 text-sm font-bold text-slate-400">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-8 py-6 font-black">{expense.merchant}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {expense.paymentMethod}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-black tabular-nums">₹{expense.amount.toLocaleString('en-IN')}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleEditClick(expense)}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-xl transition-all"
                        title="Edit Details"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.id)} 
                        disabled={isDeleting === expense.id}
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all"
                        title="Delete Permanently"
                      >
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
          <form onSubmit={handleSaveExpense} className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col">
            <div className="p-6 sm:p-10 border-b dark:border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black">{editingExpense ? 'Edit Transaction' : 'Log Expense'}</h2>
                {!editingExpense && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all disabled:opacity-50"
                  >
                    {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                    {isScanning ? 'Analyzing...' : 'Scan Receipt'}
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleScanReceipt} 
                  accept="image/*" 
                  className="hidden" 
                  capture="environment"
                />
              </div>
              <button type="button" onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-10 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {isScanning && (
                <div className="p-10 bg-indigo-50 dark:bg-indigo-900/10 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-[2rem] text-center space-y-4 animate-pulse">
                   <Sparkles size={40} className="mx-auto text-indigo-500 animate-bounce" />
                   <h3 className="text-indigo-800 dark:text-indigo-400 font-black">AI is Reading Your Receipt</h3>
                   <p className="text-xs text-indigo-600 dark:text-indigo-500">Please wait while we extract the merchant, amount, and date details for you.</p>
                </div>
              )}

              {userCategories.length === 0 ? (
                <div className="p-12 bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-[2rem] text-center space-y-6">
                  <Grid size={48} className="mx-auto text-amber-500" />
                  <div>
                    <p className="text-amber-800 dark:text-amber-400 font-black text-xl">Categories Missing</p>
                    <p className="text-sm text-amber-700 dark:text-amber-500 mt-2 max-w-sm mx-auto">Please create a category first to track your expenses accurately.</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { closeModal(); onNavigate?.(AppView.CATEGORIES); }}
                    className="px-8 py-3 bg-amber-600 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-amber-700 transition-all"
                  >
                    Go to Categories
                  </button>
                </div>
              ) : (
                <div className={isScanning ? 'opacity-30 pointer-events-none transition-opacity' : ''}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Date</label>
                      <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount in ₹</label>
                      <input required type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10" />
                    </div>
                  </div>
                  <div className="space-y-2 mt-6">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Merchant / Description</label>
                    <input required type="text" placeholder="e.g. Swiggy, Uber, Electricity Bill" value={formData.merchant} onChange={e => setFormData({...formData, merchant: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10" />
                  </div>
                  
                  <div className="space-y-2 mt-6">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expense Category</label>
                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10">
                      {userCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2 mt-6">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Source</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['UPI', 'Credit Card', 'Cash', 'Net Banking'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setFormData({...formData, paymentMethod: method})}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            formData.paymentMethod === method 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                            : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-700 text-slate-500 hover:border-indigo-500'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Additional Notes</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any extra context for this expense..." className="w-full p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border dark:border-slate-700 outline-none h-24 resize-none focus:ring-4 focus:ring-indigo-500/10" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 sm:p-10 bg-gray-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
              <button type="button" onClick={closeModal} className="px-8 py-4 font-black hover:bg-gray-100 dark:hover:bg-slate-700 rounded-2xl transition-colors">Discard</button>
              {userCategories.length > 0 && !isScanning && (
                <button type="submit" className={`px-10 py-4 ${themeBgBtn} text-white rounded-2xl font-black shadow-xl hover:brightness-110 active:scale-95 transition-all`}>
                  {editingExpense ? 'Apply Updates' : 'Confirm & Save'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;
