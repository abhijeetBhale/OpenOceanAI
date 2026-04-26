import AuthenticatedLayout from '../components/AuthenticatedLayout';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}!</h1>
          <p className="text-zinc-400 mb-8">Student Dashboard</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Document Analysis Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-white mb-2">Document Analysis</h3>
              <p className="text-zinc-400 text-sm">Upload and analyze your documents with AI-powered insights</p>
            </div>

            {/* Ask Questions Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-white mb-2">Ask Questions</h3>
              <p className="text-zinc-400 text-sm">Get instant answers from your uploaded documents</p>
            </div>

            {/* Compare Documents Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-white mb-2">Compare Documents</h3>
              <p className="text-zinc-400 text-sm">Compare and identify differences between documents</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Total Uploads</p>
              <p className="text-2xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Questions Asked</p>
              <p className="text-2xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Documents Analyzed</p>
              <p className="text-2xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Storage Used</p>
              <p className="text-2xl font-bold text-white mt-2">0 MB</p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
