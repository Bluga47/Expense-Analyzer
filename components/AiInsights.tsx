
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Bot, RefreshCw, Lightbulb, TrendingDown, AlertCircle, Send, User, MessageSquare, Wand2, Calculator, Info } from 'lucide-react';
import { apiService } from '../services/api';
import { InsightsData, Expense } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const AiInsights: React.FC = () => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! 👋 I am your **AI Financial Assistant**. I can help you analyze your spending, create budget plans, or suggest ways to save. How can I assist you today? 📈' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInsights();
    fetchExpenses();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchExpenses = async () => {
    try {
      const data = await apiService.get('/expenses');
      setExpenses(data);
    } catch (err) {
      console.error('Failed to fetch expenses for chat context');
    }
  };

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.get('/ai/insights');
      setInsights(data);
    } catch (error) {
      console.error('Failed to fetch insights', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, presetText?: string) => {
    e?.preventDefault();
    const textToSend = presetText || userInput;
    if (!textToSend.trim() || isTyping) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: textToSend }];
    setMessages(newMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const expenseContext = expenses.slice(0, 20).map(e => 
        `- ${e.date}: ₹${e.amount} at ${e.merchant} (${e.category})`
      ).join('\n');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `User Expense History:\n${expenseContext}\n\nUser Message: ${textToSend}` }] }
        ],
        config: {
          systemInstruction: `You are a professional, friendly, and highly organized financial advisor. 
          Your goal is to provide easy-to-understand advice using Indian Rupees (₹).
          
          Guidelines for your responses:
          1. Use relevant emojis to make the conversation engaging (e.g., 💰, 📊, 📉, 🚀).
          2. Use **bold text** for emphasis on important numbers or terms.
          3. Use bullet points or numbered lists for suggestions or breakdowns.
          4. Keep paragraphs short and use line breaks for clarity.
          5. If a user asks for a budget plan, provide a clear structured table-like list.
          6. Be encouraging but realistic.`
        }
      });

      const aiResponse = response.text || "I'm sorry, I couldn't process that request. Please try again. 🧐";
      setMessages([...newMessages, { role: 'model', text: aiResponse }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'model', text: "Oops! I encountered an error connecting to my brain. Please check your connection or try again later. 🛠️" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessage = (text: string) => {
    // Simple logic to handle **bold** and line breaks since we don't have a full MD parser
    return text.split('\n').map((line, i) => {
      const formattedLine = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-black text-indigo-700 dark:text-indigo-300">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return <div key={i} className="min-h-[1.25rem]">{formattedLine}</div>;
    });
  };

  const quickActions = [
    { text: "Analyze my monthly budget 📊", icon: Calculator },
    { text: "How can I save ₹5000? 💰", icon: Wand2 },
    { text: "Summary of my food spending 🍕", icon: Info },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Sparkles className="text-indigo-600" />
            AI Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Your personalized financial strategist & advisor.</p>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={isLoading}
          className="p-3 bg-white border border-gray-100 dark:bg-slate-800 dark:border-slate-700 rounded-2xl text-slate-500 hover:text-indigo-600 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Insights Cards */}
        <div className="lg:col-span-4 space-y-6">
          {isLoading ? (
            <div className="p-12 text-center space-y-4 bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 animate-pulse">
              <Bot className="mx-auto text-indigo-600 animate-bounce" size={48} />
              <p className="text-slate-500 font-bold">Generating reports...</p>
            </div>
          ) : insights ? (
            <>
              <div className="bg-indigo-600 text-white p-8 rounded-[3rem] shadow-2xl shadow-indigo-100 dark:shadow-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
                <h3 className="text-lg font-black flex items-center gap-2 mb-4 relative z-10 uppercase tracking-widest text-[10px] opacity-80">
                  <AlertCircle size={18} />
                  Overview Status
                </h3>
                <p className="text-indigo-50 leading-relaxed font-bold text-lg relative z-10">"{insights.summary}"</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Strategic Tips 💡</h3>
                <div className="grid grid-cols-1 gap-4">
                  {insights.suggestions.map((s, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-gray-50 dark:border-slate-700 flex items-start gap-4 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all shadow-sm">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <TrendingDown size={18} />
                      </div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-snug">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-6 rounded-[2rem] flex gap-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-amber-500 shadow-sm shrink-0 h-fit">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h4 className="font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest text-[10px]">Financial Habit</h4>
                  <p className="text-amber-700 dark:text-amber-500 mt-1 text-xs font-bold leading-relaxed">
                    Analyzing your spending once a week helps reduce impulse purchases by 30%.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 opacity-60">
               <Bot size={40} className="mx-auto mb-4 text-slate-300" />
               <p className="font-bold text-slate-400">Log your expenses to see strategic analysis.</p>
            </div>
          )}
        </div>

        {/* Right Column: Chat Interface */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col h-[750px] overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-slate-700 flex items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                <Bot size={28} />
              </div>
              <div>
                <h3 className="font-black text-sm">FinAssist Pro 🤖</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter">Powered by Gemini AI</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setMessages([{ role: 'model', text: 'History cleared. ✨ How else can I help you today?' }])}
                className="p-3 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/10 rounded-xl transition-all"
                title="Clear Chat"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gray-50/20 dark:bg-slate-900/10">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-3 duration-500`}>
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600 border border-indigo-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 border border-slate-200 dark:border-slate-600'}`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 dark:border dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none'
                  }`}>
                    {formatMessage(msg.text)}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                    <Bot size={20} className="text-slate-400" />
                  </div>
                  <div className="px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] rounded-tl-none flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
                    <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-8 border-t border-gray-50 dark:border-slate-700 space-y-5 bg-white dark:bg-slate-800">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, i) => (
                <button 
                  key={i}
                  onClick={() => handleSendMessage(undefined, action.text)}
                  className="px-5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2 group"
                >
                  {action.text}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder="Type a question (e.g., 'Make a savings plan')"
                  className="w-full pl-6 pr-16 py-4.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <MessageSquare size={18} />
                </div>
              </div>
              <button 
                type="submit"
                disabled={!userInput.trim() || isTyping}
                className="p-4.5 bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
              >
                <Send size={22} />
              </button>
            </form>
            <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
              AI responses can vary. Always verify significant financial decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiInsights;
