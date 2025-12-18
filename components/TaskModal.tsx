
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { X, Save, Plus, UserPlus, Eye, User as UserIcon, Tag as TagIcon } from 'lucide-react';
import { Task, TaskType, Priority } from '../types';

interface TaskModalProps {
  onClose: () => void;
  initialTask?: Task;
}

const TaskModal: React.FC<TaskModalProps> = ({ onClose, initialTask }) => {
  const { clients, contacts, databases, users, addTask, updateTask } = useData();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState<Partial<Task>>(initialTask || {
    title: '',
    description: '',
    type: 'request',
    priority: 'medium',
    status: 'open',
    client_id: '',
    performer_ids: [],
    observer_ids: [],
    tags: [],
    checklist: [],
    attachments: []
  });

  const [checkInput, setCheckInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const clientContacts = contacts.filter(c => c.client_id === formData.client_id);
  const clientDbs = databases.filter(d => d.client_id === formData.client_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.client_id) return;

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
      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 mb-1">
        <UserIcon size={10} />
        {u.name}
        <button type="button" onClick={onRemove} className="text-blue-400 hover:text-red-500 ml-1">
          <X size={12} />
        </button>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">{initialTask ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="label">Task Title</label>
                <input 
                  required 
                  className="input" 
                  placeholder="e.g. Update 1C:Accounting rules"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div>
                <label className="label">Client</label>
                <select 
                  required 
                  className="input" 
                  value={formData.client_id} 
                  onChange={e => setFormData({...formData, client_id: e.target.value, contact_id: '', db_id: ''})}
                >
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.short_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Contact Person</label>
                  <select 
                    className="input" 
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
                    className="input" 
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
                  <select className="input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as TaskType})}>
                    <option value="consultation">Consultation</option>
                    <option value="development">Development</option>
                    <option value="request">Request</option>
                  </select>
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select className="input" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div>
                 <label className="label">Deadline</label>
                 <input type="date" className="input" value={formData.deadline || ''} onChange={e => setFormData({...formData, deadline: e.target.value})} />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea 
                  className="input h-32" 
                  placeholder="Task details..."
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="space-y-6">
              {/* Performers Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="label flex items-center gap-2">
                  <UserPlus size={14} className="text-blue-600"/> Performers
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[1.5rem]">
                  {formData.performer_ids?.map(id => (
                    <UserTag key={id} id={id} onRemove={() => toggleUserInList('performer_ids', id)} />
                  ))}
                </div>
                <div className="flex flex-col gap-2">
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
                  <button 
                    type="button" 
                    onClick={() => {
                        if(!currentUser) return;
                        if(!formData.performer_ids?.includes(currentUser.id)) {
                          toggleUserInList('performer_ids', currentUser.id);
                        }
                    }}
                    className="btn-secondary w-full text-xs py-1.5 bg-white border border-slate-200"
                  >
                    <UserPlus size={14}/> Assign Me
                  </button>
                </div>
              </div>

              {/* Observers Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="label flex items-center gap-2">
                  <Eye size={14} className="text-slate-600"/> Observers
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[1.5rem]">
                  {formData.observer_ids?.map(id => (
                    <UserTag key={id} id={id} onRemove={() => toggleUserInList('observer_ids', id)} />
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <select 
                    className="input text-sm" 
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleUserInList('observer_ids', e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Add observer...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} disabled={formData.observer_ids?.includes(u.id)}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => {
                        if(!currentUser) return;
                        if(!formData.observer_ids?.includes(currentUser.id)) {
                          toggleUserInList('observer_ids', currentUser.id);
                        }
                    }}
                    className="btn-secondary w-full text-xs py-1.5 bg-white border border-slate-200"
                  >
                    <Eye size={14}/> Watch
                  </button>
                </div>
              </div>

              {/* Tags Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-100">
                <label className="label flex items-center gap-2">
                  <TagIcon size={14} className="text-slate-600"/> Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[1.5rem]">
                    {formData.tags?.map(t => (
                        <span key={t} className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-1 rounded text-xs border border-slate-200">
                            {t}
                            <button type="button" onClick={() => handleRemoveTag(t)} className="text-slate-400 hover:text-red-500 ml-1">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        className="input text-sm flex-1" 
                        placeholder="Type tag and press Enter..." 
                        value={tagInput} 
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTag(e)}
                    />
                    <button type="button" onClick={handleAddTag} className="btn-secondary py-1.5 px-3"><Plus size={16}/></button>
                </div>
              </div>

              <div>
                  <label className="label">Checklist</label>
                  <div className="flex gap-2">
                      <input className="input flex-1" value={checkInput} onChange={e => setCheckInput(e.target.value)} placeholder="Add step..."/>
                      <button type="button" onClick={addCheck} className="btn-secondary"><Plus size={18}/></button>
                  </div>
                  <div className="mt-2 space-y-1">
                      {formData.checklist?.map(item => (
                          <div key={item.id} className="text-xs flex items-center gap-2 p-1.5 bg-slate-50 rounded group">
                              <input type="checkbox" checked={item.is_done} readOnly />
                              <span className="flex-1">{item.text}</span>
                              <button 
                                type="button" 
                                onClick={() => setFormData({...formData, checklist: formData.checklist?.filter(i => i.id !== item.id)})}
                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                              >
                                <X size={12}/>
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end gap-3">
             <button type="button" onClick={onClose} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
             <button type="submit" className="btn-primary px-8">
                <Save size={18}/> {initialTask ? 'Save Changes' : 'Create Task'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
