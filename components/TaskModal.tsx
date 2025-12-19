
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { X, Save, Plus, UserPlus, Eye, User as UserIcon, Tag as TagIcon, Layers } from 'lucide-react';
import { Task, TaskType, Priority, TaskQueue } from '../types';

interface TaskModalProps {
  onClose: () => void;
  initialTask?: Task;
  defaultQueueId?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ onClose, initialTask, defaultQueueId }) => {
  const { clients, contacts, databases, users, queues, addTask, updateTask } = useData();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState<Partial<Task>>(initialTask || {
    title: '',
    description: '',
    type: 'request',
    priority: 'medium',
    status: '',
    client_id: '',
    queue_id: defaultQueueId || queues[0]?.id || '',
    performer_ids: [],
    observer_ids: [],
    tags: [],
    checklist: [],
    attachments: []
  });

  const [checkInput, setCheckInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const selectedQueue = queues.find(q => q.id === formData.queue_id);
  
  useEffect(() => {
    if (selectedQueue && !formData.status) {
        setFormData(prev => ({ ...prev, status: selectedQueue.statuses[0] }));
    }
  }, [selectedQueue]);

  const clientContacts = contacts.filter(c => c.client_id === formData.client_id);
  const clientDbs = databases.filter(d => d.client_id === formData.client_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.client_id || !formData.queue_id) return;

    if (initialTask) {
        updateTask(initialTask.id, formData);
    } else {
        addTask({
            ...formData,
            author_id: currentUser?.id || 'sys',
            performer_ids: formData.performer_ids || [],
            observer_ids: formData.observer_ids || [],
            tags: formData.tags || [],
            checklist: formData.checklist || [],
            attachments: formData.attachments || []
        } as any);
    }
    onClose();
  };

  const addCheck = () => {
      if (!checkInput.trim()) return;
      setFormData({
          ...formData,
          checklist: [...(formData.checklist || []), { id: Math.random().toString(), text: checkInput, is_done: false }]
      });
      setCheckInput('');
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

  const toggleUserInList = (listKey: 'performer_ids' | 'observer_ids', userId: string) => {
    const currentList = formData[listKey] || [];
    if (currentList.includes(userId)) {
      setFormData({ ...formData, [listKey]: currentList.filter(id => id !== userId) });
    } else {
      setFormData({ ...formData, [listKey]: [...currentList, userId] });
    }
  };

  const UserTag = ({ id, onRemove }: { id: string, onRemove: () => void }) => {
    const u = users.find(user => user.id === id);
    if (!u) return null;
    return (
      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] md:text-xs border border-blue-100 mb-1">
        <UserIcon size={10} />
        {u.name}
        <button type="button" onClick={onRemove} className="text-blue-400 hover:text-red-500 ml-1 p-0.5">
          <X size={12} />
        </button>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-auto">
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl sticky top-0 z-10">
          <h2 className="text-lg md:text-xl font-bold text-slate-800">{initialTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            <div className="space-y-4">
              <div className="bg-blue-50/50 p-3 md:p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-blue-600"/>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Work Context</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="label">Queue</label>
                        <select 
                            required 
                            className="input bg-white text-sm" 
                            value={formData.queue_id} 
                            onChange={e => setFormData({...formData, queue_id: e.target.value, status: ''})}
                            disabled={!!initialTask}
                        >
                            <option value="">Select queue...</option>
                            {queues.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select 
                            required 
                            className="input bg-white text-sm" 
                            value={formData.status} 
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="">Select status...</option>
                            {selectedQueue?.statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
              </div>

              <div>
                <label className="label">Task Title</label>
                <input 
                  required 
                  className="input text-sm" 
                  placeholder="Task title..."
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div>
                <label className="label">Client</label>
                <select 
                  required 
                  className="input text-sm" 
                  value={formData.client_id} 
                  onChange={e => setFormData({...formData, client_id: e.target.value, contact_id: '', db_id: ''})}
                >
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.short_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Contact</label>
                  <select 
                    className="input text-sm" 
                    disabled={!formData.client_id}
                    value={formData.contact_id} 
                    onChange={e => setFormData({...formData, contact_id: e.target.value})}
                  >
                    <option value="">None</option>
                    {clientContacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">1C Database</label>
                  <select 
                    className="input text-sm" 
                    disabled={!formData.client_id}
                    value={formData.db_id} 
                    onChange={e => setFormData({...formData, db_id: e.target.value})}
                  >
                    <option value="">None</option>
                    {clientDbs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select className="input text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TaskType})}>
                    <option value="consultation">Consultation</option>
                    <option value="development">Dev</option>
                    <option value="request">Request</option>
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select className="input text-sm" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="label">Description</label>
                <textarea 
                  className="input h-32 text-sm" 
                  placeholder="Details..."
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100">
                <label className="label flex items-center gap-2">
                  <UserPlus size={14} className="text-blue-600"/> Performers
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[1rem]">
                  {formData.performer_ids?.map(id => (
                    <UserTag key={id} id={id} onRemove={() => toggleUserInList('performer_ids', id)} />
                  ))}
                </div>
                <select 
                    className="input text-sm" 
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleUserInList('performer_ids', e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Add performer...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} disabled={formData.performer_ids?.includes(u.id)}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="bg-white p-3 md:p-4 rounded-xl border border-slate-100">
                <label className="label flex items-center gap-2">
                  <TagIcon size={14} className="text-slate-600"/> Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[1rem]">
                    {formData.tags?.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-1 rounded text-[10px] border border-slate-200">
                            {t}
                            <button type="button" onClick={() => handleRemoveTag(t)} className="text-slate-400 hover:text-red-500 ml-1 p-0.5">
                                <X size={10} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        className="input text-sm flex-1" 
                        placeholder="Tag name..." 
                        value={tagInput} 
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTag(e)}
                    />
                    <button type="button" onClick={handleAddTag} className="btn-secondary p-2"><Plus size={16}/></button>
                </div>
              </div>

              <div>
                  <label className="label">Checklist</label>
                  <div className="flex gap-2 mb-3">
                      <input className="input flex-1 text-sm" value={checkInput} onChange={e => setCheckInput(e.target.value)} placeholder="Add step..."/>
                      <button type="button" onClick={addCheck} className="btn-secondary p-2"><Plus size={18}/></button>
                  </div>
                  <div className="space-y-1">
                      {formData.checklist?.map(item => (
                          <div key={item.id} className="text-xs flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                              <input type="checkbox" checked={item.is_done} readOnly className="flex-shrink-0" />
                              <span className="flex-1 truncate">{item.text}</span>
                              <button 
                                type="button" 
                                onClick={() => setFormData({...formData, checklist: formData.checklist?.filter(i => i.id !== item.id)})}
                                className="text-slate-400 hover:text-red-500 p-0.5"
                              >
                                <X size={14}/>
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex flex-col sm:flex-row justify-end gap-3">
             <button type="button" onClick={onClose} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg order-2 sm:order-1">Cancel</button>
             <button type="submit" className="btn-primary px-8 order-1 sm:order-2">
                <Save size={18}/> {initialTask ? 'Save' : 'Create'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
