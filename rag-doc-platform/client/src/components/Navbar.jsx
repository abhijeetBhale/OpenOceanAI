import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      finance: 'bg-green-100 text-green-800',
      medical: 'bg-red-100 text-red-800',
      admin: 'bg-purple-100 text-purple-800',
    };
    return colors[role] || colors.student;
  };

  return (
    <nav className="flex items-center justify-between border-b border-zinc-800 bg-black px-6 py-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-white">RAG Document Scanner</h1>
        {user?.role && (
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getRoleColor(user.role)}`}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-zinc-400">{user?.email}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-red-700 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-900/40 transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </nav>
  );
}
