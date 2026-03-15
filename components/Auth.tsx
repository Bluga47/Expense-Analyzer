
import React, { useState, useRef, useEffect } from 'react';
import { AuthView, User as UserType } from '../types';
import { Shield, Mail, Lock, User, ArrowRight, Github, Chrome, CheckCircle2, XCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { apiService } from '../services/api';

interface AuthPageProps {
  mode: AuthView;
  setMode: (mode: AuthView) => void;
  onLogin: (user: UserType) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, setMode, onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (mode === AuthView.VERIFY_OTP && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  const validatePassword = (pass: string) => {
    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      symbol: /[^A-Za-z0-9]/.test(pass)
    };
  };

  const pwStatus = validatePassword(formData.password);
  const isPasswordStrong = pwStatus.length && pwStatus.uppercase && pwStatus.number && pwStatus.symbol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === AuthView.LOGIN) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        await apiService.post('/auth/request-otp', { email: formData.email });
        setMode(AuthView.VERIFY_OTP);
        setTimer(60);
      } else if (mode === AuthView.SIGNUP) {
        if (!isPasswordStrong) {
          throw new Error('Please ensure your password meets all safety requirements.');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match. Please try again.');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.name });
        await apiService.post('/auth/request-otp', { email: formData.email });
        setMode(AuthView.VERIFY_OTP);
        setTimer(60);
      } else if (mode === AuthView.VERIFY_OTP) {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) throw new Error('Please enter the full 6-digit code.');
        
        await apiService.post('/auth/verify-otp', { email: formData.email, otp: otpCode });
        
        const user: UserType = {
          id: auth.currentUser?.uid || '',
          name: auth.currentUser?.displayName || formData.name,
          email: auth.currentUser?.email || formData.email,
          role: 'user',
          isVerified: true
        };
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email || '';
      setFormData(prev => ({ ...prev, email }));
      await apiService.post('/auth/request-otp', { email });
      setMode(AuthView.VERIFY_OTP);
      setTimer(60);
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await apiService.post('/auth/resend-otp', { email: formData.email });
      setTimer(60);
      setError('A new verification code has been sent.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const RequirementItem = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${met ? 'text-emerald-500' : 'text-slate-300'}`}>
      {met ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {label}
    </div>
  );

  const renderOtpScreen = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield size={32} />
        </div>
        <h2 className="text-3xl font-black">Verify your email</h2>
        <p className="text-slate-500 font-medium">We've sent a 6-digit code to <span className="text-indigo-600 font-bold">{formData.email}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => otpRefs.current[index] = el}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(index, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-black bg-white border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
          ))}
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading || otp.some(d => !d)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Verify Code'}
            {!loading && <ArrowRight size={20} />}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={timer > 0 || loading}
              className={`text-sm font-bold flex items-center justify-center gap-2 mx-auto transition-colors ${timer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700'}`}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {timer > 0 ? `Resend code in ${timer}s` : 'Resend verification code'}
            </button>
          </div>
        </div>
      </form>

      <button
        onClick={() => setMode(AuthView.LOGIN)}
        className="w-full text-center text-sm font-bold text-slate-500 hover:text-slate-700"
      >
        Back to Sign In
      </button>
    </div>
  );

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white text-slate-900 font-sans">
      <div className="hidden lg:flex flex-col justify-between bg-indigo-600 p-16 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl">EA</div>
          <span className="font-bold text-2xl tracking-tight">Expense Analyzer</span>
        </div>
        <div className="z-10 space-y-8 max-w-lg">
          <h1 className="text-6xl font-black leading-tight">Master your personal finances.</h1>
          <p className="text-xl text-indigo-100 leading-relaxed">The intelligent platform for expense tracking, automated reporting, and AI-driven financial insights.</p>
        </div>
        <div className="z-10 text-indigo-200 text-sm">&copy; 2025 Expense Analyzer Inc. All rights reserved.</div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50/50">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {mode === AuthView.VERIFY_OTP ? (
            renderOtpScreen()
          ) : (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-black">
                  {mode === AuthView.LOGIN ? 'Welcome back' : mode === AuthView.SIGNUP ? 'Create account' : 'Reset password'}
                </h2>
                {error && (
                  <p className={`mt-4 font-bold p-4 rounded-2xl border text-sm animate-in fade-in zoom-in-95 ${error.includes('successful') || error.includes('sent') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                    {error}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === AuthView.SIGNUP && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input required type="text" placeholder="John Doe" className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input required type="email" placeholder="name@domain.com" className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                    {mode === AuthView.LOGIN && <button type="button" onClick={() => setMode(AuthView.FORGOT_PASSWORD)} className="text-xs font-bold text-indigo-600 hover:underline">Forgot password?</button>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <input 
                      required 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {mode === AuthView.SIGNUP && formData.password && (
                    <div className="bg-white/50 p-4 rounded-2xl border border-gray-100 mt-3 grid grid-cols-2 gap-2">
                      <RequirementItem met={pwStatus.length} label="8+ Characters" />
                      <RequirementItem met={pwStatus.uppercase} label="1 Capital Letter" />
                      <RequirementItem met={pwStatus.number} label="1 Number" />
                      <RequirementItem met={pwStatus.symbol} label="1 Symbol" />
                    </div>
                  )}
                </div>

                {mode === AuthView.SIGNUP && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                      <input 
                        required 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                        value={formData.confirmPassword} 
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1">Passwords do not match</p>
                    )}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading || (mode === AuthView.SIGNUP && !isPasswordStrong)} 
                  className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${
                    mode === AuthView.SIGNUP && !isPasswordStrong 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                  }`}
                >
                  {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : (mode === AuthView.LOGIN ? 'Sign In' : 'Get Started')}
                  {!loading && <ArrowRight size={20} />}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
                  <span className="bg-gray-50 px-4 text-slate-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-gray-200 rounded-2xl font-bold text-slate-700 hover:bg-gray-50 transition-all active:scale-[0.98] shadow-sm"
                >
                  <Chrome size={20} className="text-indigo-600" />
                  Google
                </button>
              </div>

              <p className="text-center text-sm text-slate-500 font-medium">
                {mode === AuthView.LOGIN ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setMode(mode === AuthView.LOGIN ? AuthView.SIGNUP : AuthView.LOGIN)} className="ml-1 text-indigo-600 font-black hover:underline">
                  {mode === AuthView.LOGIN ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
