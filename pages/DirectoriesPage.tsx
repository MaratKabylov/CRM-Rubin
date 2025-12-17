import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Trash2, Plus, List, Layers, Calendar } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

type DirectoryType = 'spheres' | 'sources' | 'orgs' | 'configs' | 'versions';

const DirectoriesPage: React.FC = () => {
  const { spheres, sources, orgs, configs, versions, addDirectoryItem, deleteDirectoryItem } = useData();
  const [activeTab, setActiveTab] = useState<DirectoryType>('spheres');
  
  // Generic Name Input for most directories
  const [newItemName, setNewItemName] = useState('');

  // Specific inputs for Versions
  const [verConfigId, setVerConfigId] = useState('');
  const [verRelease, setVerRelease] = useState('');
  const [verDate, setVerDate] = useState('');

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

    if (!newItemName.trim()) return;
    
    // Simple handling for now, configs usually need 'is_industry' but we'll default false for quick UI
    const payload: any = { name: newItemName };
    if (activeTab === 'configs') payload.is_industry = false;

    addDirectoryItem(activeTab, payload);
    setNewItemName('');
  };

  const getLabel = () => {
      switch(activeTab) {
          case 'orgs': return 'Organizations';
          case 'configs': return 'Configurations';
          case 'versions': return 'Config Versions';
          case 'spheres': return 'Activity Spheres';
          case 'sources': return 'Lead Sources';
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
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id ? <List size={16} /> : <Layers size={16} className="text-slate-400 opacity-50"/>}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h2 className="text-xl font-bold text-slate-800 mb-6 capitalize border-b pb-2">
             {getLabel()}
           </h2>

           <form onSubmit={handleAdd} className="flex gap-4 mb-8">
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
                  placeholder="Add new item name..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
             )}
             
             <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
               <Plus size={18} /> Add
             </button>
           </form>

           <div className="space-y-2">
             {getData().map((item: any) => (
               <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100 group">
                 <span className="text-slate-700 font-medium">
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