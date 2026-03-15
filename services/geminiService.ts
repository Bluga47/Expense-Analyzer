
import { GoogleGenAI, Type } from "@google/genai";
import { Expense } from '../types';

export async function generateExpenseInsights(expenses: Expense[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const expenseSummary = expenses.map(e => `${e.date}: ₹${e.amount} on ${e.category} (${e.merchant})`).join('\n');

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following business expenses and provide a professional summary and 3-5 cost-cutting suggestions in JSON format.
    
    Expenses:
    ${expenseSummary}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "A professional summary of the spending patterns."
          },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable cost-cutting suggestions."
          }
        },
        required: ["summary", "suggestions"]
      }
    }
  });

  return JSON.parse(response.text || '{"summary": "Unable to generate summary.", "suggestions": []}');
}

export async function chatWithAI(userQuery: string, expenses: Expense[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are an expert financial advisor for a corporate expense system. Answer queries concisely based on the user\'s expenses.'
    }
  });

  const expenseSummary = expenses.map(e => `${e.date}: ₹${e.amount} on ${e.category}`).join(', ');
  const message = `Context: User expenses are: ${expenseSummary}. Query: ${userQuery}`;
  
  const response = await chat.sendMessage({ message });
  return response.text;
}
