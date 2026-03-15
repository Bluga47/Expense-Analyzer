
import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, signOut } from './firebase';
import { AppView, AuthView, ExpenseMode, User } from './types';
import Layout from './components/Layout';
import AuthPage from './components/Auth';
import SelectionScreen from './components/SelectionScreen';
import Dashboard from './components/Dashboard';
import ExpenseManager from './components/ExpenseManager';
import IncomeManager from './components/IncomeManager';
import BudgetTracker from './components/BudgetTracker';
import Reports from './components/Reports';
import Approvals from './components/Approvals';
import Reimbursements from './components/Reimbursements';
import AiInsights from './components/AiInsights';
import Settings from './components/Settings';
import Categories from './components/Categories';
import SavingsGoals from './components/SavingsGoals';
// New Admin Components
import AdminDashboard from './components/AdminDashboard';
import ManageMembers from './components/ManageMembers';
import RevenueManager from './components/RevenueManager';
import DepartmentManager from './components/DepartmentManager';
import AuditLog from './components/AuditLog';
import { apiService } from './services/api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [expenseMode, setExpenseMode] = useState<ExpenseMode | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [authMode, setAuthMode] = useState<AuthView>(AuthView.LOGIN);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Check if user is verified in our mock system
        const verifiedUsers = JSON.parse(localStorage.getItem('ea_verified_users') || '[]');
        const isVerified = verifiedUsers.includes(firebaseUser.email);

        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: 'user',
          avatar: firebaseUser.photoURL || undefined,
          isVerified: isVerified
        };

        setUser(userData);
        setIsAuthenticated(isVerified);
        
        if (isVerified) {
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          setAuthMode(AuthView.VERIFY_OTP);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        setAuthMode(AuthView.LOGIN);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData: User) => {
    // Mark user as verified in our mock system
    const verifiedUsers = JSON.parse(localStorage.getItem('ea_verified_users') || '[]');
    if (userData.email && !verifiedUsers.includes(userData.email)) {
      verifiedUsers.push(userData.email);
      localStorage.setItem('ea_verified_users', JSON.stringify(verifiedUsers));
    }

    const updatedUser = { ...userData, isVerified: true };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      setExpenseMode(null);
      setAuthMode(AuthView.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleWorkspaceSelect = (mode: ExpenseMode) => {
    setExpenseMode(mode);
    if (mode === ExpenseMode.COMPANY) {
      setCurrentView(AppView.ADMIN_DASHBOARD);
    } else {
      setCurrentView(AppView.DASHBOARD);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthPage 
        mode={authMode} 
        setMode={setAuthMode} 
        onLogin={(u) => handleLogin(u as User)} 
      />
    );
  }

  if (!expenseMode) {
    return (
      <SelectionScreen 
        userName={user?.name || ''}
        onSelect={handleWorkspaceSelect} 
        isDarkMode={isDarkMode}
      />
    );
  }

  const renderView = () => {
    // Shared or Personal Views
    switch (currentView) {
      // Personal & Legacy
      case AppView.DASHBOARD: return <Dashboard user={user} mode={expenseMode} isDarkMode={isDarkMode} onNavigate={setCurrentView} />;
      case AppView.EXPENSES: return <ExpenseManager mode={expenseMode} onNavigate={setCurrentView} />;
      case AppView.INCOME: return <IncomeManager onNavigate={setCurrentView} />;
      case AppView.BUDGETS: return <BudgetTracker />;
      case AppView.SAVINGS_GOALS: return <SavingsGoals />;
      case AppView.CATEGORIES: return <Categories onNavigate={setCurrentView} />;
      
      // Admin Workspace Specific
      case AppView.ADMIN_DASHBOARD: return <AdminDashboard isDarkMode={isDarkMode} />;
      case AppView.MANAGE_MEMBERS: return <ManageMembers />;
      case AppView.BUDGET_MANAGEMENT: return <BudgetTracker />; 
      case AppView.EXPENSE_MANAGEMENT: return <ExpenseManager mode={expenseMode} onNavigate={setCurrentView} />;
      case AppView.REVENUE: return <RevenueManager />;
      case AppView.AUDIT_LOG: return <AuditLog />;
      case AppView.DEPARTMENT: return <DepartmentManager />;
      
      // Shared
      case AppView.REPORTS: return <Reports />;
      case AppView.AI_INSIGHTS: return <AiInsights />;
      case AppView.SETTINGS: return user ? <Settings user={user} /> : null;
      
      // Fallback
      default: return expenseMode === ExpenseMode.COMPANY 
        ? <AdminDashboard isDarkMode={isDarkMode} /> 
        : <Dashboard user={user} mode={expenseMode} isDarkMode={isDarkMode} onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setCurrentView={setCurrentView} 
      user={user}
      expenseMode={expenseMode}
      onLogout={handleLogout}
      onChangeMode={() => setExpenseMode(null)}
      isDarkMode={isDarkMode}
      toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
