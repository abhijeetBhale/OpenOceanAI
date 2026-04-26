export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Access Denied</h2>
        <p className="text-zinc-400 mb-8">You don't have permission to access this resource.</p>
        <a
          href="/dashboard"
          className="inline-flex rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
