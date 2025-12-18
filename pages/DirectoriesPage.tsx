
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Trash2, Plus, List, Layers, Calendar, ChevronUp, ChevronDown, X, GripVertical } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

type DirectoryType = 'spheres' | 'sources' | 'orgs' | 'configs' | 'versions' | 'queue_templates';

const DirectoriesPage: React.FC = () => {
  const { spheres, sources, orgs, configs, versions, queueTemplates, addDirectoryItem, deleteDirectoryItem } = useData();
  const [activeTab, setActiveTab] = useState<DirectoryType>('spheres');
  
  // Generic Name Input for most directories
  const [newItemName, setNewItemName] = useState('');

  // Specific inputs for Versions
  const [verConfigId, setVerConfigId] = useState('');
  const [verRelease, setVerRelease] = useState('');
  const [verDate, setVerDate] = useState('');

  // Specific inputs for Queue Templates
  const [templateStatuses, setTemplateStatuses] = useState<string[]>(['Зарегистрирована', 'В работе', 'Закрыт']);

  // Confirm Modal State
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
        addDirectoryItem('versions', { 
            config_id: verConfigId, 
            release: verRelease, 
            date: verDate 
        });
        setVerRelease('');
        setVerDate('');
        return;
    }

    if (activeTab === 'queue_templates') {
        if (!newItemName.trim() || templateStatuses.length === 0) return;
        addDirectoryItem('queue_templates', {
            name: newItemName,
            statuses: templateStatuses
        });
        setNewItemName('');
        setTemplateStatuses(['Зарегистрирована', 'В работе', 'Закрыт']);
        return;
    }

    if (!newItemName.trim()) return;
    
    const payload: any = { name: newItemName };
    if (activeTab === 'configs') payload.is_industry = false;

    addDirectoryItem(activeTab, payload);
    setNewItemName('');
  };

  const updateStatusName = (index: number, name: string) => {
    const newStatuses = [...templateStatuses];
    newStatuses[index] = name;
    setTemplateStatuses(newStatuses);
  };

  const addStatus = () => setTemplateStatuses([...templateStatuses, 'New Status']);
  const removeStatus = (idx: number) => setTemplateStatuses(templateStatuses.filter((_, i) => i !== idx));

  const moveStatus = (index: number, direction: 'up' | 'down') => {
    const newStatuses = [...templateStatuses];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStatuses.length) return;
    [newStatuses[index], newStatuses[targetIndex]] = [newStatuses[targetIndex], newStatuses[index]];
    setTemplateStatuses(newStatuses);
  };

  const getLabel = () => {
      switch(activeTab) {
          case 'orgs': return 'Organizations';
          case 'configs': return 'Configurations';
          case 'versions': return 'Config Versions';
          case 'spheres': return 'Activity Spheres';
          case 'sources': return 'Lead Sources';
          case 'queue_templates': return 'Queue Templates';
      }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Directories Management</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex flex-col space-y-2">
          {[
            { id: 'spheres', label: 'Activity Spheres' },
            { id: 'sources', label: 'Lead Sources' },
            { id: 'orgs', label: 'Organizations' },
            { id: 'configs', label: '1C Configurations' },
            { id: 'versions', label: 'Config Versions' },
            { id: 'queue_templates', label: 'Queue Templates' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as DirectoryType)}
              className={`text-left px-4 py-3 rounded-lg flex items-center justify-between transition ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="font-medium text-sm">{item.label}</span>
              {activeTab === item.id ? <List size={16} /> : <Layers size={16} className="text-slate-400 opacity-50"/>}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h2 className="text-xl font-bold text-slate-800 mb-6 capitalize border-b pb-2">
             {getLabel()}
           </h2>

           <form onSubmit={handleAdd} className="space-y-4 mb-8">
             <div className="flex gap-4">
               {activeTab === 'versions' ? (
                  <>
                     <select 
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                        value={verConfigId}
                        onChange={(e) => setVerConfigId(e.target.value)}
                     >
                         <option value="">Select Configuration...</option>
                         {configs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                     <input 
                       type="text" 
                       className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                       placeholder="Release (e.g. 3.0.1.1)"
                       value={verRelease}
                       onChange={(e) => setVerRelease(e.target.value)}
                       required
                     />
                     <input 
                       type="date"
                       className="w-40 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                       value={verDate}
                       onChange={(e) => setVerDate(e.target.value)}
                       required
                     />
                  </>
               ) : (
                  <input 
                    type="text" 
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={activeTab === 'queue_templates' ? "Template Name (e.g. Customer Support)" : "Add new item name..."}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    required
                  />
               )}
               
               <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 flex-shrink-0">
                 <Plus size={18} /> Add
               </button>
             </div>

             {activeTab === 'queue_templates' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                   <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statuses Sequence</p>
                      <button type="button" onClick={addStatus} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-100 transition">Add status</button>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {templateStatuses.map((s, idx) => (
                         <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-100 group shadow-sm">
                            <input 
                               className="flex-1 text-xs outline-none focus:border-b focus:border-blue-400"
                               value={s}
                               onChange={(e) => updateStatusName(idx, e.target.value)}
                            />
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                               <button type="button" disabled={idx===0} onClick={()=>moveStatus(idx, 'up')} className="p-0.5 text-slate-400 hover:text-blue-500"><ChevronUp size={12}/></button>
                               <button type="button" disabled={idx===templateStatuses.length-1} onClick={()=>moveStatus(idx, 'down')} className="p-0.5 text-slate-400 hover:text-blue-500"><ChevronDown size={12}/></button>
                               <button type="button" onClick={()=>removeStatus(idx)} className="p-0.5 text-slate-400 hover:text-red-500"><X size={12}/></button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             )}
           </form>

           <div className="space-y-2">
             {getData().map((item: any) => (
               <div key={item.id} className="flex flex-col p-3 bg-slate-50 rounded border border-slate-100 group">
                 <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-bold">
                      {activeTab === 'versions' ? (
                          <div className="flex items-center gap-3">
                              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">
                                  {configs.find(c => c.id === item.config_id)?.name || 'Unknown Config'}
                              </span>
                              <span className="font-mono text-blue-700">{item.release}</span>
                              <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                  <Calendar size={12}/> {item.date}
                              </span>
                          </div>
                      ) : item.name}
                    </span>
                    <button 
                      onClick={() => openConfirm('Delete Item', 'Are you sure you want to delete this item? This action cannot be undone.', () => deleteDirectoryItem(activeTab, item.id))}
                      className="text-slate-300 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                 </div>
                 {activeTab === 'queue_templates' && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {item.statuses?.map((s: string, i: number) => (
                           <div key={i} className="flex items-center">
                              <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">{s}</span>
                              {i < item.statuses.length - 1 && <span className="mx-0.5 text-slate-300">→</span>}
                           </div>
                        ))}
                    </div>
                 )}
               </div>
             ))}
             {getData().length === 0 && <p className="text-slate-400 italic">No items found.</p>}
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
