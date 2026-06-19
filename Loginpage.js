import React, { useState } from 'react';
import { TrendingUp, Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData.email.trim(), formData.password);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setFormData({ email: 'demo@salesapp.com', password: 'demo1234' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-4">
            <TrendingUp className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SalesIQ</h1>
          <p className="text-slate-500 text-sm mt-1">Daily & Yearly Sales Analytics</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-0.5">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-950/50 border border-red-800/50 rounded-xl text-red-400 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-600 text-center mb-3">Demo credentials</p>
            <button
              type="button"
              onClick={fillDemo}
              className="w-full text-center text-xs font-mono text-slate-500 hover:text-slate-300 transition-colors py-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600"
            >
              demo@salesapp.com · demo1234
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          SalesIQ Analytics Platform · Built with MERN Stack
        </p>
      </div>
    </div>
  );
};

export default LoginPage;