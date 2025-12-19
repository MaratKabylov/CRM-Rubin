
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Trash2, Plus, List, Layers, Calendar, ChevronUp, ChevronDown, X, GripVertical } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

type DirectoryType = 'spheres' | 'sources' | 'orgs' | 'configs' | 'versions' | 'queue_templates';

const TAB_LABELS: Record<DirectoryType, string> = {
  spheres: 'Сферы деят-ти',
  sources: 'Источники лидов',
  orgs: 'Организации (наши)',
  configs: 'Конфигурации 1С',
  versions: 'Релизы / Версии',
  queue_templates: 'Шаблоны очередей'
};

const DirectoriesPage: React.FC = () => {
  const { spheres, sources, orgs, configs, versions, queueTemplates, addDirectoryItem, deleteDirectoryItem } = useData();
  const [activeTab, setActiveTab] = useState<DirectoryType>('spheres');
  
  const [newItemName, setNewItemName] = useState('');
  const [verConfigId, setVerConfigId] = useState('');
  const [verRelease, setVerRelease] = useState('');
  const [verDate, setVerDate] = useState('');
  const [templateStatuses, setTemplateStatuses] = useState<string[]>(['Зарегистрирована', 'В работе', 'Закрыта']);

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({
      isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
      setConfirmState({ isOpen: true, title, message, onConfirm });
  };

  const getData = () => {
    switch (activeTab) {
      case 'spheres': return spheres;
      case 'sources': return sources;
      case 'orgs': return orgs;
      case 'configs': return configs;
      case 'versions': return versions;
      case 'queue_templates': return queueTemplates;
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'versions') {
        if (!verConfigId || !verRelease || !verDate) return;
        addDirectoryItem('versions', { config_id: verConfigId, release: verRelease, date: verDate });
        setVerRelease('');
        setVerDate('');
        return;
    }

    if (activeTab === 'queue_templates') {
        if (!newItemName.trim() || templateStatuses.length === 0) return;
        addDirectoryItem('queue_templates', { name: newItemName, statuses: templateStatuses });
        setNewItemName('');
        setTemplateStatuses(['Зарегистрирована', 'В работе', 'Закрыта']);
        return;
    }

    if (!newItemName.trim()) return;
    const payload: any = { name: newItemName };
    if (activeTab === 'configs') payload.is_industry = false;
    addDirectoryItem(activeTab, payload);
    setNewItemName('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Справочники</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0">
          {(Object.keys(TAB_LABELS) as DirectoryType[]).map((id) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`text-left px-4 py-3 rounded-lg flex items-center justify-between transition flex-shrink-0 lg:flex-shrink ${
                activeTab === id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="font-medium text-sm whitespace-nowrap">{TAB_LABELS[id]}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
           <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">{TAB_LABELS[activeTab]}</h2>

           <form onSubmit={handleAdd} className="space-y-4 mb-8">
             <div className="flex flex-col sm:flex-row gap-4">
               {activeTab === 'versions' ? (
                  <div className="flex flex-col gap-4 flex-1">
                     <select className="input" required value={verConfigId} onChange={(e) => setVerConfigId(e.target.value)}>
                         <option value="">Выберите конфигурацию...</option>
                         {configs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                     <div className="flex flex-col sm:flex-row gap-4">
                        <input type="text" className="input" placeholder="Релиз (напр. 3.0.1.1)" value={verRelease} onChange={(e) => setVerRelease(e.target.value)} required />
                        <input type="date" className="input sm:w-44" value={verDate} onChange={(e) => setVerDate(e.target.value)} required />
                     </div>
                  </div>
               ) : (
                  <input type="text" className="input flex-1" placeholder="Название элемента..." value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required />
               )}
               <button type="submit" className="btn-primary px-6 py-2 h-fit">Добавить</button>
             </div>
           </form>

           <div className="space-y-2">
             {getData().map((item: any) => (
               <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100 group">
                 <div className="flex-1 min-w-0">
                    {activeTab === 'versions' ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                           <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold">{configs.find(c => c.id === item.config_id)?.name}</span>
                           <span className="text-sm font-mono text-blue-700">{item.release}</span>
                           <span className="text-[10px] text-slate-400">от {item.date}</span>
                        </div>
                    ) : <span>{item.name}</span>}
                 </div>
                 <button onClick={() => openConfirm('Удалить элемент', 'Вы уверены?', () => deleteDirectoryItem(activeTab, item.id))} className="text-slate-300 hover:text-red-500 transition p-1"><Trash2 size={18} /></button>
               </div>
             ))}
           </div>
        </div>
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

export default DirectoriesPage;
