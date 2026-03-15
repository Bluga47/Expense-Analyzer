import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Income } from '../types';

const USERS_KEY = 'ea_mock_users';
const EXPENSES_KEY = 'ea_mock_expenses';
const INCOME_KEY = 'ea_mock_income';
const CATEGORIES_KEY = 'ea_mock_categories';
const INCOME_CATEGORIES_KEY = 'ea_mock_income_categories';
const BUDGETS_KEY = 'ea_mock_budgets';
const OTPS_KEY = 'ea_mock_otps';
const USER_DATA_KEY = 'user';

const getLocalUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const getLocalExpenses = () => JSON.parse(localStorage.getItem(EXPENSES_KEY) || '[]');
const getLocalIncome = () => JSON.parse(localStorage.getItem(INCOME_KEY) || '[]');
const getLocalCategories = () => JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
const getLocalIncomeCategories = () => JSON.parse(localStorage.getItem(INCOME_CATEGORIES_KEY) || '[]');
const getLocalBudgets = () => JSON.parse(localStorage.getItem(BUDGETS_KEY) || '[]');
const getLocalOTPs = () => JSON.parse(localStorage.getItem(OTPS_KEY) || '[]');
const getLoggedInUser = () => JSON.parse(localStorage.getItem(USER_DATA_KEY) || 'null');

const DEFAULT_CATEGORIES: any[] = [];

const DEFAULT_INCOME_CATEGORIES: any[] = [];

export const apiService = {
  async ocrScan(base64Data: string, mimeType: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };
    const prompt = `Extract receipt details into JSON. 
    Fields: 
    - date (YYYY-MM-DD)
    - amount (number)
    - merchant (string)
    - category (one of: Food & Dining, Transport, Shopping, Bills & Utilities, Software, Entertainment, Medical, Education, Housing, Work, Tech)
    - notes (string summary)`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              merchant: { type: Type.STRING },
              category: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["date", "amount", "merchant", "category"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error('OCR Extraction failed:', error);
      throw new Error('Failed to analyze receipt. Please enter details manually.');
    }
  },

  async post(endpoint: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 600));
    const currentUser = getLoggedInUser();

    if (endpoint === '/auth/request-otp') {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otps = getLocalOTPs();
      otps.push({ email: data.email, otp: otpCode, expires: Date.now() + 300000 }); // 5 min
      localStorage.setItem(OTPS_KEY, JSON.stringify(otps));
      
      console.log(`%c[AUTH SERVICE] OTP for ${data.email}: ${otpCode}`, "color: #4f46e5; font-weight: bold; font-size: 14px; background: #eef2ff; padding: 8px; border-radius: 4px;");
      alert(`DEVELOPMENT: Verification code ${otpCode} sent to ${data.email}. Check console (F12) if alert is closed.`);
      return { message: 'OTP sent' };
    }

    if (endpoint === '/auth/verify-otp') {
      const otps = getLocalOTPs();
      const record = otps.find((o: any) => o.email === data.email && o.otp === data.otp);
      
      if (!record) throw new Error('Invalid verification code.');
      if (Date.now() > record.expires) throw new Error('Verification code has expired.');
      
      // Remove OTP record
      const remainingOtps = otps.filter((o: any) => o.email !== data.email);
      localStorage.setItem(OTPS_KEY, JSON.stringify(remainingOtps));
      
      return { success: true };
    }

    if (endpoint === '/auth/resend-otp') {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otps = getLocalOTPs().filter((o: any) => o.email !== data.email);
      otps.push({ email: data.email, otp: otpCode, expires: Date.now() + 300000 });
      localStorage.setItem(OTPS_KEY, JSON.stringify(otps));
      console.log(`%c[AUTH SERVICE] Resent OTP for ${data.email}: ${otpCode}`, "color: #4f46e5; font-weight: bold; font-size: 14px; background: #eef2ff; padding: 8px; border-radius: 4px;");
      return { message: 'New code sent' };
    }

    if (endpoint === '/auth/signup') {
      const users = getLocalUsers();
      if (users.find((u: any) => u.email === data.email)) {
        throw new Error('An account with this email already exists.');
      }
      const newUser = { 
        ...data, 
        id: Math.random().toString(36).substr(2, 9), 
        createdAt: new Date(),
        role: 'Personal User'
      };
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Seed default categories for new user
      const allCategories = getLocalCategories();
      const userDefaults = DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        userId: newUser.id,
        id: Math.random().toString(36).substr(2, 9),
      }));
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify([...allCategories, ...userDefaults]));
      
      return { message: 'Registration successful' };
    }

    if (endpoint === '/auth/login') {
      const users = getLocalUsers();
      const user = users.find((u: any) => u.email === data.email && u.password === data.password);
      if (!user) throw new Error('Invalid email or password credentials.');
      
      const token = btoa(JSON.stringify({ id: user.id, email: user.email }));
      const userPublic = { name: user.name, email: user.email, id: user.id, role: user.role };
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userPublic));
      return { token, user: userPublic };
    }

    if (!currentUser) throw new Error('Unauthorized');

    if (endpoint === '/expenses') {
      const expenses = getLocalExpenses();
      const newExpense = { 
        ...data, 
        id: Math.random().toString(36).substr(2, 9), 
        userId: currentUser.id,
        amount: parseFloat(data.amount),
        status: 'approved' 
      };
      expenses.push(newExpense);
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
      return newExpense;
    }

    if (endpoint === '/income') {
      const incomeList = getLocalIncome();
      const newIncome = { 
        ...data, 
        id: Math.random().toString(36).substr(2, 9), 
        userId: currentUser.id,
        amount: parseFloat(data.amount)
      };
      incomeList.push(newIncome);
      localStorage.setItem(INCOME_KEY, JSON.stringify(incomeList));
      return newIncome;
    }

    if (endpoint === '/categories') {
      const categories = getLocalCategories();
      const newCategory = {
        ...data,
        userId: currentUser.id,
        id: Math.random().toString(36).substr(2, 9),
      };
      categories.push(newCategory);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      return newCategory;
    }

    if (endpoint === '/income-categories') {
      const categories = getLocalIncomeCategories();
      const newCategory = {
        ...data,
        userId: currentUser.id,
        id: Math.random().toString(36).substr(2, 9),
      };
      categories.push(newCategory);
      localStorage.setItem(INCOME_CATEGORIES_KEY, JSON.stringify(categories));
      return newCategory;
    }

    if (endpoint === '/budgets') {
      const budgets = getLocalBudgets();
      const newBudget = {
        ...data,
        userId: currentUser.id,
        id: Math.random().toString(36).substr(2, 9),
        limit: parseFloat(data.limit) || 0,
        categoryNames: data.categoryNames || []
      };
      budgets.push(newBudget);
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
      return newBudget;
    }

    throw new Error('Endpoint not found');
  },

  async put(endpoint: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const currentUser = getLoggedInUser();
    if (!currentUser) throw new Error('Unauthorized');

    if (endpoint.startsWith('/expenses/')) {
      const id = endpoint.split('/expenses/')[1];
      const expenses = getLocalExpenses();
      const index = expenses.findIndex((e: any) => String(e.id) === String(id) && String(e.userId) === String(currentUser.id));
      
      if (index === -1) throw new Error('Expense not found');
      
      const updatedExpense = { ...expenses[index], ...data, amount: parseFloat(data.amount) };
      expenses[index] = updatedExpense;
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
      return updatedExpense;
    }

    if (endpoint.startsWith('/income/')) {
      const id = endpoint.split('/income/')[1];
      const incomeList = getLocalIncome();
      const index = incomeList.findIndex((e: any) => String(e.id) === String(id) && String(e.userId) === String(currentUser.id));
      
      if (index === -1) throw new Error('Income record not found');
      
      const updatedIncome = { ...incomeList[index], ...data, amount: parseFloat(data.amount) };
      incomeList[index] = updatedIncome;
      localStorage.setItem(INCOME_KEY, JSON.stringify(incomeList));
      return updatedIncome;
    }

    if (endpoint.startsWith('/categories/')) {
      const id = endpoint.split('/categories/')[1];
      const categories = getLocalCategories();
      const index = categories.findIndex((c: any) => String(c.id) === String(id) && String(c.userId) === String(currentUser.id));
      
      if (index === -1) throw new Error('Category not found');
      
      const updatedCategory = { ...categories[index], ...data, budget: parseFloat(data.budget) || 0 };
      categories[index] = updatedCategory;
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      return updatedCategory;
    }

    if (endpoint.startsWith('/income-categories/')) {
      const id = endpoint.split('/income-categories/')[1];
      const categories = getLocalIncomeCategories();
      const index = categories.findIndex((c: any) => String(c.id) === String(id) && String(c.userId) === String(currentUser.id));
      
      if (index === -1) throw new Error('Income category not found');
      
      const updatedCategory = { ...categories[index], ...data };
      categories[index] = updatedCategory;
      localStorage.setItem(INCOME_CATEGORIES_KEY, JSON.stringify(categories));
      return updatedCategory;
    }

    if (endpoint.startsWith('/budgets/')) {
      const id = endpoint.split('/budgets/')[1];
      const budgets = getLocalBudgets();
      const index = budgets.findIndex((b: any) => String(b.id) === String(id) && String(b.userId) === String(currentUser.id));
      
      if (index === -1) throw new Error('Budget not found');
      
      const updatedBudget = { 
        ...budgets[index], 
        ...data, 
        limit: parseFloat(data.limit) || 0,
        categoryNames: data.categoryNames || []
      };
      budgets[index] = updatedBudget;
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
      return updatedBudget;
    }
    
    throw new Error('Endpoint not found');
  },

  async get(endpoint: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const currentUser = getLoggedInUser();
    
    if (endpoint === '/user/me') {
      if (!currentUser) throw new Error('Unauthorized');
      return currentUser;
    }

    if (!currentUser) throw new Error('Unauthorized');

    if (endpoint === '/expenses') {
      const expenses = getLocalExpenses();
      return expenses.filter((e: any) => e.userId === currentUser.id).reverse();
    }

    if (endpoint === '/income') {
      const incomeList = getLocalIncome();
      return incomeList.filter((e: any) => e.userId === currentUser.id).reverse();
    }

    if (endpoint === '/categories') {
      const categories = getLocalCategories();
      const expenses = getLocalExpenses().filter((e: any) => e.userId === currentUser.id);
      
      let userCategories = categories.filter((c: any) => c.userId === currentUser.id);
      
      if (userCategories.length === 0) {
        const userDefaults = DEFAULT_CATEGORIES.map(cat => ({
          ...cat,
          userId: currentUser.id,
          id: Math.random().toString(36).substr(2, 9),
        }));
        const allCategories = getLocalCategories();
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify([...allCategories, ...userDefaults]));
        userCategories = userDefaults;
      }
      
      return userCategories.map((cat: any) => {
        const catExpenses = expenses.filter((e: any) => e.category === cat.name);
        const totalSpent = catExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        return {
          ...cat,
          spent: totalSpent,
          count: catExpenses.length
        };
      });
    }

    if (endpoint === '/income-categories') {
      const categories = getLocalIncomeCategories();
      const incomeList = getLocalIncome().filter((e: any) => e.userId === currentUser.id);
      
      let userCategories = categories.filter((c: any) => c.userId === currentUser.id);
      
      return userCategories.map((cat: any) => {
        const catIncome = incomeList.filter((e: any) => e.category === cat.name);
        const totalAmount = catIncome.reduce((sum: number, e: any) => sum + e.amount, 0);
        return {
          ...cat,
          amount: totalAmount,
          count: catIncome.length
        };
      });
    }

    if (endpoint === '/budgets') {
      const budgets = getLocalBudgets();
      const expenses = getLocalExpenses().filter((e: any) => e.userId === currentUser.id);
      const userBudgets = budgets.filter((b: any) => b.userId === currentUser.id);

      return userBudgets.map((budget: any) => {
        const relevantExpenses = expenses.filter((e: any) => 
          budget.categoryNames.includes(e.category)
        );
        const totalSpent = relevantExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
        return {
          ...budget,
          spent: totalSpent
        };
      });
    }

    if (endpoint === '/ai/insights') {
      const expenses = getLocalExpenses().filter((e: any) => e.userId === currentUser.id);
      
      if (expenses.length === 0) {
        return { 
          summary: `Hi ${currentUser.name}, welcome to Expense Analyzer! Start adding your expenses to unlock personalized AI financial insights.`,
          suggestions: ["Add your first expense", "Track your daily commute costs", "Set a grocery budget"]
        };
      }

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const expenseData = expenses.slice(0, 30).map((e: any) => 
          `${e.date}: ₹${e.amount} at ${e.merchant} (${e.category})`
        ).join('\n');

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `User: ${currentUser.name}. Expenses: ${expenseData}. Analyze these expenses in INR. Provide a 1-sentence summary and 3 tips.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["summary", "suggestions"]
            }
          }
        });

        return JSON.parse(response.text || '{}');
      } catch (error) {
        return { summary: "AI insights temporarily unavailable.", suggestions: [] };
      }
    }
    throw new Error('Endpoint not found');
  },

  async delete(endpoint: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const currentUser = getLoggedInUser();
    if (!currentUser) throw new Error('Unauthorized');

    if (endpoint.includes('/expenses/')) {
      const id = endpoint.split('/expenses/')[1].split('/')[0];
      const expenses = getLocalExpenses();
      
      const filtered = expenses.filter((e: any) => {
        const isTarget = String(e.id) === String(id);
        const belongsToUser = String(e.userId) === String(currentUser.id);
        return !(isTarget && belongsToUser);
      });

      localStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
      return { success: true };
    }

    if (endpoint.includes('/income/')) {
      const id = endpoint.split('/income/')[1].split('/')[0];
      const incomeList = getLocalIncome();
      
      const filtered = incomeList.filter((e: any) => {
        const isTarget = String(e.id) === String(id);
        const belongsToUser = String(e.userId) === String(currentUser.id);
        return !(isTarget && belongsToUser);
      });

      localStorage.setItem(INCOME_KEY, JSON.stringify(filtered));
      return { success: true };
    }

    if (endpoint.includes('/categories/')) {
      const id = endpoint.split('/categories/')[1].split('/')[0];
      const categories = getLocalCategories();
      
      const filtered = categories.filter((c: any) => {
        const isTarget = String(c.id) === String(id);
        const belongsToUser = String(c.userId) === String(currentUser.id);
        return !(isTarget && belongsToUser);
      });

      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
      return { success: true };
    }

    if (endpoint.includes('/income-categories/')) {
      const id = endpoint.split('/income-categories/')[1].split('/')[0];
      const categories = getLocalIncomeCategories();
      
      const filtered = categories.filter((c: any) => {
        const isTarget = String(c.id) === String(id);
        const belongsToUser = String(c.userId) === String(currentUser.id);
        return !(isTarget && belongsToUser);
      });

      localStorage.setItem(INCOME_CATEGORIES_KEY, JSON.stringify(filtered));
      return { success: true };
    }

    if (endpoint.includes('/budgets/')) {
      const id = endpoint.split('/budgets/')[1].split('/')[0];
      const budgets = getLocalBudgets();
      
      const filtered = budgets.filter((b: any) => {
        const isTarget = String(b.id) === String(id);
        const belongsToUser = String(b.userId) === String(currentUser.id);
        return !(isTarget && belongsToUser);
      });

      localStorage.setItem(BUDGETS_KEY, JSON.stringify(filtered));
      return { success: true };
    }

    throw new Error(`Endpoint not supported: ${endpoint}`);
  }
};