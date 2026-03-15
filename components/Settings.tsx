
import React, { useState } from 'react';
import { 
  User, Bell, Shield, Palette, Globe, HelpCircle, 
  ChevronRight, Camera, ArrowLeft, Check, 
  Mail, Lock, Smartphone, Monitor, Save
} from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsProps {
  user: UserType;
}

type SubView = 'main' | 'profile' | 'notifications' | 'security' | 'appearance' | 'preferences';

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [activeSubView, setActiveSubView] = useState<SubView>('main');

  const sections = [
    { id: 'profile' as SubView, title: 'Personal Information', icon: User, items: ['Basic Profile', 'Change Password', 'Job Details'] },
    { id: 'notifications' as SubView, title: 'Notifications', icon: Bell, items: ['Email Alerts', 'App Notifications', 'Weekly Summary'] },
    { id: 'security' as SubView, title: 'Security', icon: Shield, items: ['2FA Authentication', 'Login Sessions', 'API Tokens'] },
    { id: 'appearance' as SubView, title: 'Appearance', icon: Palette, items: ['Theme Customization', 'Layout Preferences'] },
    { id: 'preferences' as SubView, title: 'Preferences', icon: Globe, items: ['Default Currency', 'Date Format', 'Region'] },
  ];

  const renderHeader = (title: string) => (
    <div className="flex items-center gap-4 mb-8">
      <button 
        onClick={() => setActiveSubView('main')}
        className="p-3 bg-gray-100 dark:bg-slate-700 rounded-2xl hover:bg-gray-200 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-2xl font-black tracking-tight">{title}</h1>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="animate-in slide-in-from-right-4 duration-300 max-w-4xl">
      {renderHeader('Personal Information')}
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
            <input type="text" defaultValue={user.name} className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
            <input type="email" defaultValue={user.email} className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Job Title</label>
            <input type="text" defaultValue={user.role} className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
            <input type="text" placeholder="+1 (555) 000-0000" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none" />
          </div>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all">
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="animate-in slide-in-from-right-4 duration-300 max-w-4xl">
      {renderHeader('Notifications')}
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700 shadow-sm overflow-hidden">
        {[
          { title: 'Email Alerts', desc: 'Real-time email updates for budget alerts.', active: true },
          { title: 'Push Notifications', desc: 'Alerts on your primary mobile device.', active: true },
          { title: 'Weekly Summary', desc: 'Digest of all weekly activities.', active: false },
          { title: 'Smart Tips', desc: 'Personalized AI advice based on trends.', active: true },
        ].map((item, i) => (
          <div key={i} className="p-6 sm:p-10 flex items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="font-black text-sm">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">{item.desc}</p>
            </div>
            <button className={`w-14 h-8 rounded-full transition-colors relative flex-shrink-0 ${item.active ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}>
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${item.active ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="animate-in slide-in-from-right-4 duration-300 space-y-8 max-w-4xl">
      {renderHeader('Security')}
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 p-6 sm:p-10 shadow-sm">
        <h3 className="text-lg font-black mb-8">Update Password</h3>
        <div className="space-y-6">
          <input type="password" placeholder="Current Password" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 rounded-2xl outline-none" />
          <input type="password" placeholder="New Password" className="w-full p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 rounded-2xl outline-none" />
          <button className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">Reset Password</button>
        </div>
      </div>
    </div>
  );

  if (activeSubView !== 'main') {
    if (activeSubView === 'profile') return renderProfileSettings();
    if (activeSubView === 'notifications') return renderNotificationSettings();
    if (activeSubView === 'security') return renderSecuritySettings();
    // Simplified: others can be mapped similarly
    return <div>{renderHeader(activeSubView.toUpperCase())} <p className="p-10">This module is coming soon in the next update.</p></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm font-medium">Customize your experience and manage security.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
        {/* Profile Card Summary */}
        <div className="p-6 sm:p-12 flex flex-col sm:flex-row items-center gap-8 border-b border-gray-50 dark:border-slate-700">
          <div className="relative group flex-shrink-0">
            <img 
              src={user.avatar} 
              alt="Avatar" 
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-[3rem] object-cover ring-8 ring-emerald-50 dark:ring-emerald-900/10 shadow-xl"
            />
            <button className="absolute bottom-2 right-2 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 text-emerald-600 hover:scale-110 transition-transform">
              <Camera size={20} />
            </button>
          </div>
          <div className="text-center sm:text-left space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{user.name}</h2>
              <p className="text-slate-500 font-bold">{user.email}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest">
                {user.role}
              </span>
              <span className="px-4 py-1.5 bg-gray-50 dark:bg-slate-700 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                Premium Plus
              </span>
            </div>
          </div>
          <div className="sm:ml-auto w-full sm:w-auto">
            <button 
              onClick={() => setActiveSubView('profile')}
              className="w-full sm:w-auto px-10 py-4 bg-emerald-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-95"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Settings Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, idx) => (
            <div key={idx} className="p-6 sm:p-10 border-b sm:border-r border-gray-50 dark:border-slate-700 last:border-r-0">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <section.icon size={24} />
                </div>
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">{section.title}</h3>
              </div>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => setActiveSubView(section.id)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700/50 group transition-all"
                    >
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-emerald-50/10 dark:bg-emerald-900/5 sm:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-lg border border-gray-100 dark:border-slate-700 text-emerald-500">
               <HelpCircle size={32} />
            </div>
            <h4 className="font-black text-lg">Help Center</h4>
            <p className="text-xs text-slate-500 px-8 font-medium leading-relaxed">Need technical assistance with your expense analyzer account?</p>
            <button className="px-8 py-3 bg-white dark:bg-slate-700 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">
              Live Support
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 sm:p-12 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-[3rem] flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="text-center sm:text-left">
          <h4 className="font-black text-xl text-rose-800 dark:text-rose-400">Danger Zone</h4>
          <p className="text-sm text-rose-700 dark:text-rose-500 opacity-80 mt-1 max-w-md font-medium">Delete your account and wipe all historical records permanently. This cannot be undone.</p>
        </div>
        <button className="w-full sm:w-auto px-10 py-4 bg-rose-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-rose-200 dark:shadow-none hover:bg-rose-700 transition-all">
          Close Account
        </button>
      </div>
    </div>
  );
};

export default Settings;
