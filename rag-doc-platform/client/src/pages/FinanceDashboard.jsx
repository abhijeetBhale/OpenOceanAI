import AuthenticatedLayout from '../components/AuthenticatedLayout';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, PieChart, DollarSign } from 'lucide-react';

export default function FinanceDashboard() {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}!</h1>
          <p className="text-zinc-400 mb-8">Finance Dashboard</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Financial Analysis Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <BarChart3 className="text-4xl mb-4 text-green-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Financial Analysis</h3>
              <p className="text-zinc-400 text-sm">Analyze financial documents and reports with advanced tools</p>
            </div>

            {/* Budget Reports Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <DollarSign className="text-4xl mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Budget Reports</h3>
              <p className="text-zinc-400 text-sm">Generate and analyze budget reports and forecasts</p>
            </div>

            {/* Trend Analysis Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <TrendingUp className="text-4xl mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Trend Analysis</h3>
              <p className="text-zinc-400 text-sm">Identify trends and patterns in financial data</p>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-400 mt-2">$0</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold text-red-400 mt-2">$0</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Net Profit</p>
              <p className="text-2xl font-bold text-white mt-2">$0</p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
