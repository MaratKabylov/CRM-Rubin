
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Database, BookOpen, Settings, LogOut, ClipboardList, Layers } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import DirectoriesPage from './pages/DirectoriesPage';
import UsersPage from './pages/UsersPage';
import TasksPage from './pages/TasksPage';
import QueuesPage from './pages/QueuesPage';

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link to={to} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-blue-400 tracking-wider">1C CRM</h1>
          <p className="text-xs text-slate-500 mt-1">Service Management</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/queues" icon={Layers} label="Queues" />
          <SidebarItem to="/tasks" icon={ClipboardList} label="Tasks & Issues" />
          <SidebarItem to="/clients" icon={Users} label="Clients" />
          <SidebarItem to="/directories" icon={BookOpen} label="Directories" />
          {user.role === 'admin' && (
            <SidebarItem to="/users" icon={Settings} label="Users & Access" />
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center justify-center w-full space-x-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-200 text-slate-300 py-2 rounded-md transition-all text-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto relative">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<PrivateLayout><DashboardPage /></PrivateLayout>} />
            <Route path="/queues" element={<PrivateLayout><QueuesPage /></PrivateLayout>} />
            <Route path="/tasks" element={<PrivateLayout><TasksPage /></PrivateLayout>} />
            <Route path="/clients" element={<PrivateLayout><ClientsPage /></PrivateLayout>} />
            <Route path="/clients/:id" element={<PrivateLayout><ClientDetailPage /></PrivateLayout>} />
            <Route path="/directories" element={<PrivateLayout><DirectoriesPage /></PrivateLayout>} />
            <Route path="/users" element={<PrivateLayout><UsersPage /></PrivateLayout>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
