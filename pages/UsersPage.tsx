
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Trash2, UserPlus, Shield } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const UsersPage: React.FC = () => {
  const { users, addUser, deleteUser } = useData();
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  // Confirm Modal State
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({
      isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
      setConfirmState({ isOpen: true, title, message, onConfirm });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email) return;
    addUser(newUser as any);
    setNewUser({ name: '', email: '', password: '', role: 'user' });
  };

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <Shield className="text-blue-600" /> User Management
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-lg mb-4">Create User</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
             <label className="text-xs text-slate-500 block mb-1">Name</label>
             <input className="input" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
          </div>
          <div className="md:col-span-1">
             <label className="text-xs text-slate-500 block mb-1">Email</label>
             <input className="input" type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          </div>
          <div className="md:col-span-1">
             <label className="text-xs text-slate-500 block mb-1">Password</label>
             <input className="input" type="password" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          </div>
          <div className="md:col-span-1">
             <label className="text-xs text-slate-500 block mb-1">Role</label>
             <select className="input" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
               <option value="user">User</option>
               <option value="admin">Admin</option>
             </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white h-[42px] rounded-lg hover:bg-blue-700 flex justify-center items-center">
            <UserPlus size={20} />
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600 text-sm">Name</th>
              <th className="p-4 font-semibold text-slate-600 text-sm">Email</th>
              <th className="p-4 font-semibold text-slate-600 text-sm">Role</th>
              <th className="p-4 font-semibold text-slate-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-800">{u.name}</td>
                <td className="p-4 text-slate-600">{u.email}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {u.role !== 'admin' && (
                    <button 
                        onClick={() => openConfirm('Delete User', 'Are you sure you want to delete this user? Access will be revoked immediately.', () => deleteUser(u.id))} 
                        className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
      />
    </div>
  );
};

export default UsersPage;
