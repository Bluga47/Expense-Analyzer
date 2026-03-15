import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Income } from '../types';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDoc,
  serverTimestamp,
  orderBy
} from "firebase/firestore";

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

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', iconName: 'Utensils', color: 'emerald', budget: 5000 },
  { name: 'Transport', iconName: 'Car', color: 'blue', budget: 3000 },
  { name: 'Shopping', iconName: 'ShoppingBag', color: 'rose', budget: 10000 },
  { name: 'Bills & Utilities', iconName: 'Zap', color: 'amber', budget: 2000 },
  { name: 'Entertainment', iconName: 'Film', color: 'violet', budget: 2000 },
  { name: 'Health', iconName: 'Activity', color: 'red', budget: 1000 },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', iconName: 'Briefcase', color: 'blue' },
  { name: 'Freelance', iconName: 'Smartphone', color: 'emerald' },
  { name: 'Investments', iconName: 'TrendingUp', color: 'indigo' },
  { name: 'Gift', iconName: 'Target', color: 'rose' },
];

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
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...data,
        userId: currentUser.id,
        amount: parseFloat(data.amount),
        status: 'approved',
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...data, userId: currentUser.id, amount: parseFloat(data.amount), status: 'approved' };
    }

    if (endpoint === '/income') {
      const docRef = await addDoc(collection(db, 'income'), {
        ...data,
        userId: currentUser.id,
        amount: parseFloat(data.amount),
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...data, userId: currentUser.id, amount: parseFloat(data.amount) };
    }

    if (endpoint === '/categories') {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...data,
        userId: currentUser.id,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...data, userId: currentUser.id };
    }

    if (endpoint === '/income-categories') {
      const docRef = await addDoc(collection(db, 'income_categories'), {
        ...data,
        userId: currentUser.id,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...data, userId: currentUser.id };
    }

    if (endpoint === '/budgets') {
      const docRef = await addDoc(collection(db, 'budgets'), {
        ...data,
        userId: currentUser.id,
        limit: parseFloat(data.limit) || 0,
        categoryNames: data.categoryNames || [],
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...data, userId: currentUser.id, limit: parseFloat(data.limit) || 0, categoryNames: data.categoryNames || [] };
    }

    throw new Error('Endpoint not found');
  },

  async put(endpoint: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const currentUser = getLoggedInUser();
    if (!currentUser) throw new Error('Unauthorized');

    if (endpoint.startsWith('/expenses/')) {
      const id = endpoint.split('/expenses/')[1];
      const docRef = doc(db, 'expenses', id);
      await updateDoc(docRef, { ...data, amount: parseFloat(data.amount) });
      return { id, ...data, amount: parseFloat(data.amount) };
    }

    if (endpoint.startsWith('/income/')) {
      const id = endpoint.split('/income/')[1];
      const docRef = doc(db, 'income', id);
      await updateDoc(docRef, { ...data, amount: parseFloat(data.amount) });
      return { id, ...data, amount: parseFloat(data.amount) };
    }

    if (endpoint.startsWith('/categories/')) {
      const id = endpoint.split('/categories/')[1];
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, { ...data, budget: parseFloat(data.budget) || 0 });
      return { id, ...data, budget: parseFloat(data.budget) || 0 };
    }

    if (endpoint.startsWith('/income-categories/')) {
      const id = endpoint.split('/income-categories/')[1];
      const docRef = doc(db, 'income_categories', id);
      await updateDoc(docRef, data);
      return { id, ...data };
    }

    if (endpoint.startsWith('/budgets/')) {
      const id = endpoint.split('/budgets/')[1];
      const docRef = doc(db, 'budgets', id);
      await updateDoc(docRef, { 
        ...data, 
        limit: parseFloat(data.limit) || 0,
        categoryNames: data.categoryNames || []
      });
      return { id, ...data, limit: parseFloat(data.limit) || 0, categoryNames: data.categoryNames || [] };
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
      const q = query(collection(db, 'expenses'), where('userId', '==', currentUser.id), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    if (endpoint === '/income') {
      const q = query(collection(db, 'income'), where('userId', '==', currentUser.id), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    if (endpoint === '/categories') {
      const q = query(collection(db, 'categories'), where('userId', '==', currentUser.id));
      const snapshot = await getDocs(q);
      let userCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (userCategories.length === 0) {
        // Seed defaults to Firestore
        const promises = DEFAULT_CATEGORIES.map(cat => 
          addDoc(collection(db, 'categories'), { ...cat, userId: currentUser.id, createdAt: serverTimestamp() })
        );
        await Promise.all(promises);
        
        // Re-fetch
        const newSnapshot = await getDocs(q);
        userCategories = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      
      const expensesQuery = query(collection(db, 'expenses'), where('userId', '==', currentUser.id));
      const expensesSnapshot = await getDocs(expensesQuery);
      const expenses = expensesSnapshot.docs.map(doc => doc.data());

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
      const q = query(collection(db, 'income_categories'), where('userId', '==', currentUser.id));
      const snapshot = await getDocs(q);
      let userCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (userCategories.length === 0) {
        const promises = DEFAULT_INCOME_CATEGORIES.map(cat => 
          addDoc(collection(db, 'income_categories'), { ...cat, userId: currentUser.id, createdAt: serverTimestamp() })
        );
        await Promise.all(promises);
        const newSnapshot = await getDocs(q);
        userCategories = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      
      const incomeQuery = query(collection(db, 'income'), where('userId', '==', currentUser.id));
      const incomeSnapshot = await getDocs(incomeQuery);
      const incomeList = incomeSnapshot.docs.map(doc => doc.data());
      
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
      const q = query(collection(db, 'budgets'), where('userId', '==', currentUser.id));
      const snapshot = await getDocs(q);
      const userBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const expensesQuery = query(collection(db, 'expenses'), where('userId', '==', currentUser.id));
      const expensesSnapshot = await getDocs(expensesQuery);
      const expenses = expensesSnapshot.docs.map(doc => doc.data());

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
      await deleteDoc(doc(db, 'expenses', id));
      return { success: true };
    }

    if (endpoint.includes('/income/')) {
      const id = endpoint.split('/income/')[1].split('/')[0];
      await deleteDoc(doc(db, 'income', id));
      return { success: true };
    }

    if (endpoint.includes('/categories/')) {
      const id = endpoint.split('/categories/')[1].split('/')[0];
      await deleteDoc(doc(db, 'categories', id));
      return { success: true };
    }

    if (endpoint.includes('/income-categories/')) {
      const id = endpoint.split('/income-categories/')[1].split('/')[0];
      await deleteDoc(doc(db, 'income_categories', id));
      return { success: true };
    }

    if (endpoint.includes('/budgets/')) {
      const id = endpoint.split('/budgets/')[1].split('/')[0];
      await deleteDoc(doc(db, 'budgets', id));
      return { success: true };
    }

    throw new Error(`Endpoint not supported: ${endpoint}`);
  }
};