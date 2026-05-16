import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban }
  ];

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-all duration-300">
              <span className="text-white font-bold text-sm">TF</span>
            </div>
            <span className="text-lg font-bold text-white hidden sm:block">TeamFlow</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === to || location.pathname.startsWith(to + '/')
                    ? 'bg-primary-500/20 text-primary-300 shadow-inner'
                    : 'text-surface-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <div className="text-sm">
                <span className="text-surface-300 font-medium">{user?.name}</span>
                {user?.role === 'ADMIN' && (
                  <span className="ml-1.5 text-[10px] font-semibold bg-primary-500/20 text-primary-300 px-1.5 py-0.5 rounded-full">
                    ADMIN
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-surface-400 hover:text-white"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1 fade-in">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === to
                  ? 'bg-primary-500/20 text-primary-300'
                  : 'text-surface-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10 mt-2">
            <div className="flex items-center gap-2 px-4 py-2 text-sm text-surface-300">
              <User size={14} /> {user?.name}
              {user?.role === 'ADMIN' && (
                <span className="text-[10px] font-semibold bg-primary-500/20 text-primary-300 px-1.5 py-0.5 rounded-full">ADMIN</span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
