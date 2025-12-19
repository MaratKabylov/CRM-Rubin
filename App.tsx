
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Database, BookOpen, Settings, LogOut, ClipboardList, Layers, Menu, X } from 'lucide-react';
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
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  if (!user) return <Navigate to="/login" />;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shadow-xl z-40 transition-transform duration-300 transform
        lg:relative lg:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-400 tracking-wider">1С CRM</h1>
            <p className="text-xs text-slate-500 mt-1">Управление сервисом</p>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Рабочий стол" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/queues" icon={Layers} label="Очереди" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/tasks" icon={ClipboardList} label="Задачи и тикеты" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/clients" icon={Users} label="Клиенты" onClick={() => setIsSidebarOpen(false)} />
          <SidebarItem to="/directories" icon={BookOpen} label="Справочники" onClick={() => setIsSidebarOpen(false)} />
          {user.role === 'admin' && (
            <SidebarItem to="/users" icon={Settings} label="Доступ и пользователи" onClick={() => setIsSidebarOpen(false)} />
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[140px]">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role === 'admin' ? 'Администратор' : 'Менеджер'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center justify-center w-full space-x-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-200 text-slate-300 py-2 rounded-md transition-all text-sm"
          >
            <LogOut size={16} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <button onClick={toggleSidebar} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={24} />
             </button>
             <h2 className="font-bold text-slate-800">1С CRM</h2>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
            {user.name.charAt(0)}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-100">
          <div className="p-4 md:p-8 w-full">
            {children}
          </div>
        </main>
      </div>
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
