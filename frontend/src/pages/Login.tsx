import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../components/Toast';
import logoImg from '../assets/logo.png';

export const Login: React.FC = () => {
  const { login, signUp } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const success = await signUp(email, password);
        if (success) {
          showToast('Account Created', 'Your account has been created successfully.', 'success');
        }
      } else {
        const success = await login(email, password);
        if (success) {
          showToast('Login Successful', 'Welcome back to the Billing Portal!', 'success');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || (isSignUp ? 'Sign‑up failed.' : 'Login failed. Please verify your credentials.'));
      showToast('Authentication Failed', message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@portal.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-950/40 backdrop-blur-md rounded-3xl p-8 border border-slate-800 shadow-2xl relative z-10">
        
        {/* Brand Banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white p-3.5 rounded-2xl shadow-xl shadow-slate-950/20 border border-slate-200/50 flex items-center justify-center max-w-[240px]">
            <img src={logoImg} alt="Xivora Logo" className="h-16 w-auto object-contain" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex gap-2.5 items-start p-4 text-xs font-semibold text-red-400 bg-red-950/20 border border-red-900/30 rounded-2xl">
              <AlertCircle className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2 font-sans tracking-wide">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@portal.com"
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-800 bg-slate-900/40 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white font-sans transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-2 font-sans tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 rounded-2xl border border-slate-800 bg-slate-900/40 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white font-sans transition-all placeholder:text-slate-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer font-sans"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In as Admin'}
          </button>
        </form>

        {/* Demo login shortcut link */}
        <div className="mt-8 pt-6 border-t border-slate-900 text-center">
          <p className="text-xs text-slate-500 font-sans">
            {isSignUp ? 'Already have an account?' : 'Evaluating the dashboard?'}
          </p>
          <button
            onClick={() => isSignUp ? setIsSignUp(false) : handleFillDemo()}
            className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-350 transition-colors underline decoration-dotted underline-offset-4"
          >
            {isSignUp ? 'Back to Sign In' : 'Click to fill Demo Administrator Details'}
          </button>
          {!isSignUp && (
            <div className="mt-2">
              <button 
                onClick={() => setIsSignUp(true)} 
                className="text-xs text-slate-500 hover:text-white transition-colors"
              >
                Need an account? <span className="text-emerald-400 font-bold underline">Sign Up</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
