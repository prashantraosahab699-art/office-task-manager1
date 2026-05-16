import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Zap, Shield, Users, ArrowRight } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="bg-white min-h-screen">
      {/* Simple Header */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">T</div>
          <span className="text-xl font-bold tracking-tight text-surface-900">TeamFlow</span>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-surface-600 hover:text-primary-600">Log in</Link>
              <Link to="/signup" className="btn-primary">Get Started free</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-surface-900 mb-6 tracking-tight">
          Manage your team’s tasks <span className="text-primary-600">without the chaos.</span>
        </h1>
        <p className="text-xl text-surface-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          The simple, fast, and beautiful way to manage your team's projects. Stop juggling spreadsheets and start shipping.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
            Start for free <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-surface-500">No credit card required. Cancel anytime.</p>
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-surface-50 py-24 border-y border-surface-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900 mb-4">Everything you need to stay on track</h2>
            <p className="text-surface-600">Built for modern teams who value speed and clarity.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: 'Task Tracking', desc: 'Powerful Kanban boards to visualize your progress and keep things moving.', icon: Zap },
              { title: 'Team Collaboration', desc: 'Add members, assign roles, and keep everyone on the same page.', icon: Users },
              { title: 'Role-Based Access', desc: 'Secure permissions at both app and project levels for peace of mind.', icon: Shield }
            ].map((f, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-3">{f.title}</h3>
                <p className="text-surface-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-surface-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 opacity-60">
          <div className="w-6 h-6 bg-surface-900 rounded flex items-center justify-center text-white font-bold text-xs">T</div>
          <span className="font-bold text-surface-900">TeamFlow</span>
        </div>
        <p className="text-sm text-surface-500">© 2026 TeamFlow. All rights reserved.</p>
        <div className="flex gap-6 text-sm text-surface-500">
          <a href="#" className="hover:text-primary-600">Privacy</a>
          <a href="#" className="hover:text-primary-600">Terms</a>
        </div>
      </footer>
    </div>
  );
}
