import AuthenticatedLayout from '../components/AuthenticatedLayout';
import { useAuth } from '../context/AuthContext';
import { Heart, ClipboardList, Users, Activity } from 'lucide-react';

export default function MedicalDashboard() {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}!</h1>
          <p className="text-zinc-400 mb-8">Medical Dashboard</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Medical Records Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <ClipboardList className="text-4xl mb-4 text-red-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Medical Records</h3>
              <p className="text-zinc-400 text-sm">Manage and analyze patient medical records securely</p>
            </div>

            {/* Patient Data Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <Users className="text-4xl mb-4 text-blue-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Patient Data</h3>
              <p className="text-zinc-400 text-sm">Access comprehensive patient information and history</p>
            </div>

            {/* Health Monitoring Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition">
              <Activity className="text-4xl mb-4 text-green-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Health Monitoring</h3>
              <p className="text-zinc-400 text-sm">Monitor vital signs and health metrics in real-time</p>
            </div>
          </div>

          {/* Medical Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Patients</p>
              <p className="text-2xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Appointments</p>
              <p className="text-2xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Consultations</p>
              <p className="text-2xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-zinc-400 text-sm">Reports Generated</p>
              <p className="text-2xl font-bold text-white mt-2">0</p>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
