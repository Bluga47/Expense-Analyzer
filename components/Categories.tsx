
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreVertical, 
  X, 
  Trash2, 
  Edit3, 
  Grid as GridIconLucide,
  Utensils,
  Plane,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Film,
  Zap,
  Car,
  Home,
  Briefcase,
  Wallet,
  Smartphone
} from 'lucide-react';
import { AppView } from '../types';
import { apiService } from '../services/api';

interface CategoryItem {
  id?: string;
  name: string;
  iconName?: string;
  count: number;
  spent: number;
  budget: number;
  color: string;
}

interface CategoriesProps {
  onNavigate?: (view: AppView) => void;
}

const ICON_OPTIONS = [
  { name: 'Grid', icon: GridIconLucide, label: 'General' },
  { name: 'Utensils', icon: Utensils, label: 'Food' },
  { name: 'Plane', icon: Plane, label: 'Travel' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'Education' },
  { name: 'HeartPulse', icon: HeartPulse, label: 'Medical' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Shopping' },
  { name: 'Film', icon: Film, label: 'Entertainment' },
  { name: 'Zap', icon: Zap, label: 'Bills' },
  { name: 'Car', icon: Car, label: 'Transport' },
  { name: 'Home', icon: Home, label: 'Housing' },
  { name: 'Briefcase', icon: Briefcase, label: 'Work' },
  { name: 'Wallet', icon: Wallet, label: 'Personal' },
  { name: 'Smartphone', icon: Smartphone, label: 'Tech' },
];

const Categories: React.FC<CategoriesProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    color: 'emerald',
    iconName: 'Grid'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.get('/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      budget: cat.budget.toString(),
      color: cat.color,
      iconName: cat.iconName || 'Grid'
    });
    setShowAddModal(true);
    setActiveMenu(null);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setFormData({ name: '', budget: '', color: 'emerald', iconName: 'Grid' });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const payload = {
          name: formData.name,
          budget: parseFloat(formData.budget) || 0,
          color: formData.color,
          iconName: formData.iconName
        };
        const updatedCat = await apiService.put(`/categories/${editingCategory.id}`, payload);
        setCategories(prev => prev.map(c => c.id === updatedCat.id ? { ...c, ...updatedCat } : c));
      } else {
        const payload = {
          name: formData.name,
          count: 0,
          spent: 0,
          budget: parseFloat(formData.budget) || 0,
          color: formData.color,
          iconName: formData.iconName
        };
        const newCat = await apiService.post('/categories', payload);
        setCategories([...categories, newCat]);
      }
      closeModal();
    } catch (err) {
      alert('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Delete category "${name}"? This will not delete existing expenses.`)) {
      try {
        await apiService.delete(`/categories/${id}`);
        setCategories(categories.filter(c => c.id !== id));
        setActiveMenu(null);
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const getColorClasses = (color: string) => {
    const map: Record<string, string> = {
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
      amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    };
    return map[color] || map.emerald;
  };

  const renderIcon = (iconName?: string, size: number = 28) => {
    const option = ICON_OPTIONS.find(o => o.name === iconName) || ICON_OPTIONS[0];
    const IconComponent = option.icon;
    return <IconComponent size={size} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Spending Categories</h1>
          <p className="text-slate-500 text-sm font-medium">Organize your expenses into meaningful buckets.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-20 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-slate-700 text-center space-y-6">
          <div className="w-24 h-24 bg-gray-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
            <GridIconLucide size={48} />
          </div>
          <div className="max-w-xs mx-auto">
            <h3 className="text-xl font-black">No categories yet</h3>
            <p className="text-slate-500 text-sm mt-2">Create categories like "Travel" or "Food" to better track where your money goes.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-all"
          >
            Create Your First Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, i) => {
            const isOver = cat.spent > cat.budget;
            const percentage = cat.budget > 0 ? Math.min((cat.spent / cat.budget) * 100, 100) : 0;
            const isMenuActive = activeMenu === cat.id;

            return (
              <div key={cat.id || i} className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group relative">
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-5 rounded-2xl ${getColorClasses(cat.color)} group-hover:scale-110 transition-transform`}>
                    {renderIcon(cat.iconName)}
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenu(isMenuActive ? null : cat.id!)}
                      className={`p-3 rounded-2xl transition-all ${isMenuActive ? 'bg-gray-100 dark:bg-slate-700 text-slate-900' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    {isMenuActive && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-2xl p-2 z-30 animate-in zoom-in-95 duration-150">
                        <button 
                          onClick={() => handleEditClick(cat)}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-2xl transition-all"
                        >
                          <Edit3 size={18} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id!, cat.name)}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
                        >
                          <Trash2 size={18} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-black">{cat.name}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{cat.count} Transactions</p>
                </div>

                <div className="mt-10 space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spent</p>
                      <p className={`text-xl font-black tabular-nums ${isOver ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                        ₹{cat.spent.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</p>
                      <p className="text-sm font-black text-slate-500 tabular-nums">₹{cat.budget.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${isOver ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md transition-all">
          <form onSubmit={handleSaveCategory} className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 sm:p-10 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">{editingCategory ? 'Update existing category details.' : 'Create a new spending bucket.'}</p>
              </div>
              <button type="button" onClick={closeModal} className="p-3 bg-gray-100 dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-slate-600 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 sm:p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Fitness, Hobbies, Gifts" 
                  className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Budget (₹)</label>
                <input 
                  required
                  type="number" 
                  placeholder="0.00" 
                  className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-100 outline-none"
                  value={formData.budget}
                  onChange={e => setFormData({...formData, budget: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Icon</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {ICON_OPTIONS.map((option) => {
                    const IconComp = option.icon;
                    const isSelected = formData.iconName === option.name;
                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => setFormData({...formData, iconName: option.name})}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all border-2 ${
                          isSelected 
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                            : 'border-transparent bg-gray-50 dark:bg-slate-900 text-slate-400 hover:text-slate-600'
                        }`}
                        title={option.label}
                      >
                        <IconComp size={20} />
                        <span className="text-[8px] mt-1 font-black uppercase tracking-tighter">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Category Color</label>
                <div className="flex flex-wrap gap-3">
                  {['emerald', 'blue', 'rose', 'indigo', 'amber', 'violet'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        formData.color === color ? 'ring-4 ring-offset-2 ring-emerald-500' : 'opacity-60 hover:opacity-100'
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

            <div className="p-8 sm:p-10 bg-gray-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-8 py-4 rounded-2xl text-sm font-black hover:bg-gray-200 transition-colors">Cancel</button>
              <button type="submit" className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-200 dark:shadow-none transition-all active:scale-95">
                {editingCategory ? 'Update Category' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeMenu && (
        <div className="fixed inset-0 z-20" onClick={() => setActiveMenu(null)} />
      )}
    </div>
  );
};

export default Categories;
