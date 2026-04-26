import Navbar from './Navbar';

export default function AuthenticatedLayout({ children }) {
  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
