import AuthenticatedLayout from '../components/AuthenticatedLayout';
import { useAuth } from '../context/AuthContext';
import { Settings, Users, Shield, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}!</h1>
          <p className="text-zinc-400 mb-8">Admin Dashboard</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Management Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <Users className="text-4xl mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold text-white mb-2">User Management</h3>
              <p className="text-zinc-400 text-sm">Manage users, roles, and permissions</p>
            </div>

            {/* System Settings Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <Settings className="text-4xl mb-4 text-green-400" />
              <h3 className="text-xl font-semibold text-white mb-2">System Settings</h3>
              <p className="text-zinc-400 text-sm">Configure system settings and parameters</p>
            </div>

            {/* Security Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <Shield className="text-4xl mb-4 text-red-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Security</h3>
              <p className="text-zinc-400 text-sm">Monitor security and manage access controls</p>
            </div>

            {/* Analytics Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <BarChart3 className="text-4xl mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Analytics</h3>
              <p className="text-zinc-400 text-sm">View system analytics and reports</p>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Active Sessions</p>
              <p className="text-2xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">System Health</p>
              <p className="text-2xl font-bold text-green-400 mt-2">100%</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Storage Used</p>
              <p className="text-2xl font-bold text-white mt-2">0 GB</p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
