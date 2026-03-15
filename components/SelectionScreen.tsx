
import React, { useState, useEffect } from 'react';
import { Building2, User as UserIcon, ChevronRight, Sparkles, Plus, Users, ArrowLeft, LogIn, Search, ShieldCheck, Settings, Mail, Lock, FileText, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { ExpenseMode } from '../types';

interface SelectionScreenProps {
  userName: string;
  onSelect: (mode: ExpenseMode) => void;
  isDarkMode: boolean;
}

interface Team {
  id: string;
  name: string;
  role: string;
  members: number;
  avatar: string;
  description?: string;
  adminEmail?: string;
  password?: string;
}

const TEAMS_STORAGE_KEY = 'ea_user_joined_teams';

const SelectionScreen: React.FC<SelectionScreenProps> = ({ userName, onSelect, isDarkMode }) => {
  const [view, setView] = useState<'workspace' | 'teams'>('workspace');
  const [teamFormView, setTeamFormView] = useState<'actions' | 'create' | 'teamLogin'>('actions');
  const [joinedTeams, setJoinedTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Create Team Form State
  const [createFormData, setCreateFormData] = useState({
    orgName: '',
    adminEmail: '',
    description: '',
    password: '',
    confirmPassword: ''
  });

  // Team Login Form State
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: ''
  });
  
  const [formError, setFormError] = useState('');

  // Load teams from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (saved) {
      try {
        setJoinedTeams(JSON.parse(saved));
      } catch (e) {
        setJoinedTeams([]);
      }
    }
  }, []);

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (createFormData.password !== createFormData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (createFormData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: createFormData.orgName,
      role: 'Admin',
      members: 1,
      avatar: createFormData.orgName.substring(0, 2).toUpperCase(),
      description: createFormData.description,
      adminEmail: createFormData.adminEmail,
      password: createFormData.password
    };

    const updatedTeams = [...joinedTeams, newTeam];
    setJoinedTeams(updatedTeams);
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(updatedTeams));
    
    // Reset form and return to actions view
    setCreateFormData({
      orgName: '',
      adminEmail: '',
      description: '',
      password: '',
      confirmPassword: ''
    });
    setTeamFormView('actions');
  };

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setTeamFormView('teamLogin');
    setFormError('');
    setLoginFormData({ email: '', password: '' });
  };

  const handleTeamLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedTeam) return;

    // Validate credentials (using the data stored in the mock team object)
    if (loginFormData.email !== selectedTeam.adminEmail || loginFormData.password !== selectedTeam.password) {
      setFormError('Invalid Admin Email or Password for this organization.');
      return;
    }

    // Success - enter the workspace
    onSelect(ExpenseMode.COMPANY);
  };

  if (view === 'teams') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-slate-900'}`}>
        <div className="max-w-6xl w-full bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100 dark:border-slate-700 min-h-[750px] animate-in slide-in-from-bottom-8 duration-500">
          
          {/* Left Side: Team Login / Joined Teams */}
          <div className={`lg:w-1/3 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50/50 border-gray-100'}`}>
            <button 
              onClick={() => {
                if (teamFormView === 'teamLogin') {
                   setTeamFormView('actions');
                } else {
                   setView('workspace');
                }
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest mb-10 transition-colors"
            >
              <ArrowLeft size={16} /> {teamFormView === 'teamLogin' ? 'Back to Teams' : 'Back to Workspaces'}
            </button>
            
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-black tracking-tight">Your Teams</h2>
              <p className="text-slate-500 text-sm font-medium">Select a team to access your corporate dashboard.</p>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {joinedTeams.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                  <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-full text-slate-400">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">No Teams Joined</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Create a new team or join an existing one to get started.</p>
                  </div>
                </div>
              ) : (
                joinedTeams.map((team) => (
                  <button 
                    key={team.id}
                    onClick={() => handleTeamClick(team)}
                    className={`w-full flex items-center gap-4 p-5 rounded-[2rem] border transition-all group text-left ${
                      selectedTeam?.id === team.id && teamFormView === 'teamLogin'
                      ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-700 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-sm shrink-0 group-hover:rotate-6 transition-transform">
                      {team.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{team.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">{team.role} • {team.members} Member{team.members > 1 ? 's' : ''}</p>
                    </div>
                    <LogIn size={18} className={`${selectedTeam?.id === team.id && teamFormView === 'teamLogin' ? 'text-indigo-600' : 'text-slate-300'} group-hover:text-indigo-600 group-hover:translate-x-1 transition-all`} />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Side: Actions, Create Form, or Team Login */}
          <div className="flex-1 p-8 lg:p-20 flex flex-col justify-center items-center">
            {teamFormView === 'actions' ? (
              <div className="w-full text-center space-y-12 animate-in fade-in duration-500">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest">
                    <ShieldCheck size={14} /> Organization Management
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter leading-tight">Empower your organization.</h1>
                  <p className="text-slate-500 font-medium">Streamline expense workflows by creating a dedicated organizational workspace.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                  {/* Create Team Card */}
                  <button 
                    onClick={() => {
                        setTeamFormView('create');
                        setFormError('');
                    }}
                    className="group p-10 bg-indigo-600 text-white rounded-[3rem] shadow-2xl shadow-indigo-100 dark:shadow-none hover:-translate-y-2 transition-all flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Plus size={40} />
                    </div>
                    <h3 className="text-2xl font-black mb-2">Create a Team</h3>
                    <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                      Establish a central hub for your company's finances.
                    </p>
                  </button>

                  {/* Join Team Card */}
                  <button 
                    onClick={() => {
                        alert("Join via Invite Code is coming soon!");
                    }}
                    className="group p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-700 hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Users size={40} />
                    </div>
                    <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Join a Team</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      Connect with your existing team via invite code.
                    </p>
                  </button>
                </div>
              </div>
            ) : teamFormView === 'create' ? (
              <div className="w-full max-w-xl animate-in slide-in-from-right-8 duration-500">
                <button 
                  onClick={() => setTeamFormView('actions')}
                  className="mb-8 flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-widest transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Actions
                </button>

                <div className="space-y-2 mb-10">
                  <h1 className="text-4xl font-black tracking-tighter">Create your Team</h1>
                  <p className="text-slate-500 font-medium">Set up your organizational profile to begin management.</p>
                </div>

                {formError && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                    <ShieldCheck size={18} className="shrink-0" />
                    {formError}
                  </div>
                )}

                <form onSubmit={handleCreateTeam} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                          required 
                          type="text" 
                          placeholder="Acme Corp" 
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium" 
                          value={createFormData.orgName}
                          onChange={e => setCreateFormData({...createFormData, orgName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                          required 
                          type="email" 
                          placeholder="admin@acme.com" 
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium" 
                          value={createFormData.adminEmail}
                          onChange={e => setCreateFormData({...createFormData, adminEmail: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization Description</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <textarea 
                        placeholder="Tell us about your team's focus..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium min-h-[100px] resize-none" 
                        value={createFormData.description}
                        onChange={e => setCreateFormData({...createFormData, description: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                          required 
                          type="password" 
                          placeholder="••••••••" 
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium" 
                          value={createFormData.password}
                          onChange={e => setCreateFormData({...createFormData, password: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                          required 
                          type="password" 
                          placeholder="••••••••" 
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium" 
                          value={createFormData.confirmPassword}
                          onChange={e => setCreateFormData({...createFormData, confirmPassword: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all mt-6"
                  >
                    Create Organization <CheckCircle2 size={22} />
                  </button>
                </form>
              </div>
            ) : (
              /* Team Login View */
              <div className="w-full max-w-md animate-in slide-in-from-right-8 duration-500">
                <div className="flex flex-col items-center text-center mb-10 space-y-4">
                  <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-100 dark:shadow-none mb-2">
                    {selectedTeam?.avatar}
                  </div>
                  <div>
                    <h1 className="text-3xl font-black tracking-tighter">Enter {selectedTeam?.name}</h1>
                    <p className="text-slate-500 font-medium">Log in to your team workspace to continue.</p>
                  </div>
                </div>

                {formError && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95">
                    <ShieldCheck size={18} className="shrink-0" />
                    {formError}
                  </div>
                )}

                <form onSubmit={handleTeamLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input 
                        required 
                        type="email" 
                        placeholder="admin@organization.com" 
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium" 
                        value={loginFormData.email}
                        onChange={e => setLoginFormData({...loginFormData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                      <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input 
                        required 
                        type={showLoginPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium" 
                        value={loginFormData.password}
                        onChange={e => setLoginFormData({...loginFormData, password: e.target.value})}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-3 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all mt-4"
                  >
                    Enter Workspace <ChevronRight size={22} />
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setTeamFormView('actions')}
                    className="w-full py-3 text-slate-400 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-widest transition-colors"
                  >
                    Not your team? Switch Organization
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-slate-900'}`}>
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold animate-pulse">
            <Sparkles size={16} /> Welcome back, {userName.split(' ')[0]}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Choose your workspace</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto font-medium">Select the mode that best fits your current needs. You can switch anytime later.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => setView('teams')}
            className="group relative flex flex-col items-center text-center p-10 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Building2 size={40} />
            </div>
            <h2 className="text-2xl font-black mb-3">Company Expense</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 font-medium">
              For official, business, and corporate expenses. Manage approvals, reimbursements, and team reports.
            </p>
            <div className="mt-auto flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase text-xs tracking-widest">
              Go Corporate <ChevronRight size={20} />
            </div>
          </button>

          <button 
            onClick={() => onSelect(ExpenseMode.PERSONAL)}
            className="group relative flex flex-col items-center text-center p-10 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-300"
          >
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <UserIcon size={40} />
            </div>
            <h2 className="text-2xl font-black mb-3">Personal Expense</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 font-medium">
              For personal finance and daily expense tracking. Monitor budgets and savings goals.
            </p>
            <div className="mt-auto flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase text-xs tracking-widest">
              Go Personal <ChevronRight size={20} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectionScreen;
