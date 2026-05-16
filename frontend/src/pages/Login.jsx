import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-50">
      <div className="max-w-md w-full fade-in">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">T</div>
            <span className="text-2xl font-bold text-surface-900">TeamFlow</span>
          </Link>
          <h1 className="text-3xl font-bold text-surface-900">Log in to your account</h1>
          <p className="text-surface-500 mt-2">Enter your credentials to access your workspace</p>
        </div>

        <div className="card p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="!pl-11"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-surface-700">Password</label>
                <a href="#" className="text-xs font-medium text-primary-600 hover:text-primary-700">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="!pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <div className="spinner" style={{ width: 18, height: 18, borderTopColor: 'white' }} /> : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-surface-100 text-center">
            <p className="text-sm text-surface-500">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
                Create one for free
              </Link>
            </p>
          </div>
        </div>
        
        {/* Helper for demo */}
        <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-start gap-3">
          <AlertCircle size={18} className="text-primary-600 shrink-0 mt-0.5" />
          <p className="text-xs text-primary-700 leading-relaxed">
            <strong>Demo Admin:</strong> admin@demo.com / Admin1234
          </p>
        </div>
      </div>
    </div>
  );
}
