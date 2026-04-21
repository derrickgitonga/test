import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AgentDashboard from './AgentDashboard';
import { LogOut, Leaf } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Leaf className="h-6 w-6 text-emerald-600" />
              <span className="ml-2 text-lg font-semibold text-slate-800">SmartSeason</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name} <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded ml-2">{user?.role}</span>
              </span>
              <button 
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.role === 'ADMIN' ? <AdminDashboard /> : <AgentDashboard />}
      </main>
    </div>
  );
}
