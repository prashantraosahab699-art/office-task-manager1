import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center slide-up">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <AlertTriangle size={36} className="text-red-400" />
        </div>
        <h1 className="text-6xl font-bold gradient-text mb-3">404</h1>
        <p className="text-xl text-surface-300 mb-2">Page Not Found</p>
        <p className="text-surface-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold hover:from-primary-500 hover:to-purple-500 transition-all shadow-lg shadow-primary-500/25"
        >
          <Home size={18} /> Go Home
        </Link>
      </div>
    </div>
  );
}
