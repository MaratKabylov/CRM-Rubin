
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { Search, Plus, Building2, User, X, Star, Fingerprint } from 'lucide-react';
import { Client } from '../types';
import StarRating from '../components/StarRating';

const ClientsPage: React.FC = () => {
  const { clients, users, spheres, sources, addClient, getClientStats } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
    short_name: '', full_name: '', bin: '', is_gov: false, 
    email: '', phone: '', legal_address: '', actual_address: '', tags: [], rating: 0
  });
  const [tagInput, setTagInput] = useState('');

  const filtered = clients.filter(c => 
    c.short_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.bin?.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.short_name || !formData.owner_id) return;
    
    addClient(formData as Omit<Client, 'id'>);
    setIsModalOpen(false);
    setFormData({ is_gov: false, tags: [], rating: 0 });
    setTagInput('');
  };

  const handleAddTag = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const val = tagInput.trim();
    if (!val) return;
    const currentTags = formData.tags || [];
    if (!currentTags.includes(val)) {
        setFormData({ ...formData, tags: [...currentTags, val] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = formData.tags || [];
    setFormData({ ...formData, tags: currentTags.filter(t => t !== tag) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Клиенты</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus size={18} />
          <span>Новый клиент</span>
        </button>
      </div>

      <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm w-full max-w-md">
        <Search className="text-slate-400 flex-shrink-0" size={20} />
        <input 
          type="text" 
          placeholder="Поиск клиентов..." 
          className="flex-1 outline-none text-slate-700 min-w-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(client => {
          const owner = users.find(u => u.id === client.owner_id);
          const sphere = spheres.find(s => s.id === client.activity_id);
          const stats = getClientStats(client.id);
          
          return (
            <Link 
              to={`/clients/${client.id}`} 
              key={client.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition flex-shrink-0">
                  <Building2 size={24} />
                </div>
                <div className="flex flex-col items-end gap-1.5 min-w-0">
                   {client.bin && (
                     <span className="text-[9px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex items-center gap-1">
                        <Fingerprint size={10} /> {client.bin}
                     </span>
                   )}
                   {client.is_gov && (
                     <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap">ГОС</span>
                   )}
                   <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        <Star size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0"/>
                        <span className="text-xs font-bold text-slate-700">{stats.avgRating > 0 ? stats.avgRating : '—'}</span>
                   </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">{client.short_name}</h3>
              <p className="text-sm text-slate-500 mb-4 truncate">{client.full_name}</p>
              
              <div className="space-y-2 text-sm text-slate-600 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold">@</span>
                  <span className="truncate">{client.email || 'Нет email'}</span>
                </div>
                <div className="flex items-center space-x-2">
                   <User size={14} className="text-slate-400 flex-shrink-0"/>
                   <span className="text-xs truncate">{owner?.name || 'Менеджер не назначен'}</span>
                </div>
                <div className="flex items-center space-x-2">
                   <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase truncate">
                     {sphere?.name || 'Прочее'}
                   </span>
                </div>
              </div>

              {client.tags && client.tags.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      {client.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100 font-medium whitespace-nowrap">
                              {tag}
                          </span>
                      ))}
                      {client.tags.length > 3 && <span className="text-xs text-slate-400 whitespace-nowrap">+{client.tags.length - 3}</span>}
                  </div>
              )}
            </Link>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Создать нового клиента</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Краткое название</label>
                  <input required className="input" value={formData.short_name} onChange={e => setFormData({...formData, short_name: e.target.value})} />
                </div>
                <div>
                  <label className="label">БИН / ИИН</label>
                  <input className="input" value={formData.bin} onChange={e => setFormData({...formData, bin: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="label">Полное юридическое название</label>
                <input required className="input" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                   <label className="label">Сфера деятельности</label>
                   <select className="input" required value={formData.activity_id} onChange={e => setFormData({...formData, activity_id: e.target.value})}>
                     <option value="">Выберите...</option>
                     {spheres.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="label">Источник лида</label>
                   <select className="input" required value={formData.source_id} onChange={e => setFormData({...formData, source_id: e.target.value})}>
                     <option value="">Выберите...</option>
                     {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="label">Телефон</label>
                  <input className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Ответственный менеджер</label>
                <select required className="input" value={formData.owner_id} onChange={e => setFormData({...formData, owner_id: e.target.value})}>
                  <option value="">Выберите менеджера...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <div className="border-t border-slate-100 pt-4 mt-2">
                <label className="label">Теги</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags?.map(t => (
                        <span key={t} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm flex items-center border border-blue-100">
                            {t}
                            <button 
                                type="button" 
                                onClick={() => handleRemoveTag(t)}
                                className="ml-2 text-blue-400 hover:text-red-500 focus:outline-none flex items-center"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                        className="input flex-1" 
                        placeholder="Введите тег и нажмите Enter..." 
                        value={tagInput} 
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTag(e)}
                    />
                    <button type="button" onClick={handleAddTag} className="btn-secondary w-full sm:w-auto"><Plus size={18}/></button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                 <input type="checkbox" id="gov_org" checked={formData.is_gov} onChange={e => setFormData({...formData, is_gov: e.target.checked})} />
                 <label htmlFor="gov_org" className="text-sm text-slate-700">Государственная организация</label>
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium order-2 sm:order-1">Отмена</button>
                <button type="submit" className="btn-primary order-1 sm:order-2">Создать</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
