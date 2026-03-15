import { GoogleGenAI, Type } from "@google/genai";
import Expense from '../models/Expense';

export const getAiInsights = async (req: any, res: any) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 }).limit(50);
    
    if (expenses.length === 0) {
      return res.json({ 
        summary: "Start logging your expenses in ₹ INR to receive personalized AI insights.",
        suggestions: ["Add your first expense", "Set a monthly budget", "Check category trends"]
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const expenseData = expenses.map(e => `${e.date.toISOString().split('T')[0]}: ₹${e.amount} at ${e.merchant} (${e.category})`).join('\n');

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert Indian financial advisor. Analyze these household/personal expenses (All amounts are in Indian Rupees - ₹). Provide a summary and 3-5 cost-cutting suggestions tailored to the Indian market.
      
      Expenses:
      ${expenseData}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A concise summary of spending patterns in the Indian context." },
            suggestions: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Actionable saving tips relevant to Indian consumers (e.g., using specific UPI apps, local markets, or subscription management)."
            }
          },
          required: ["summary", "suggestions"]
        },
        thinkingConfig: { thinkingBudget: 100 }
      }
    });

    // Fix: Added safety fallback for response.text as it can be undefined
    const responseText = response.text || '{"summary": "No insights available.", "suggestions": []}';
    res.json(JSON.parse(responseText));
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ message: 'Failed to generate insights' });
  }
};