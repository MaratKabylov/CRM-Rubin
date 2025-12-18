
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Layers, Trash2, Edit2, Info, CheckCircle, ChevronUp, ChevronDown, GripVertical, X } from 'lucide-react';
import { TaskQueue, QueueTemplate } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const QueuesPage: React.FC = () => {
  const { queues, queueTemplates, addQueue, updateQueue, deleteQueue } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<TaskQueue | null>(null);
  
  const [formData, setFormData] = useState<Partial<TaskQueue>>({
    name: '',
    prefix: '',
    template: '',
    statuses: []
  });

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, id: string }>({ isOpen: false, id: '' });

  // Handle template selection change
  const handleTemplateChange = (templateId: string) => {
    const template = queueTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        template: template.id,
        statuses: [...template.statuses]
      });
    } else {
        setFormData({ ...formData, template: templateId });
    }
  };

  const addStatus = () => {
    setFormData({
      ...formData,
      statuses: [...(formData.statuses || []), 'Новый статус']
    });
  };

  const removeStatus = (index: number) => {
    const newStatuses = [...(formData.statuses || [])];
    newStatuses.splice(index, 1);
    setFormData({ ...formData, statuses: newStatuses });
  };

  const updateStatusName = (index: number, name: string) => {
    const newStatuses = [...(formData.statuses || [])];
    newStatuses[index] = name;
    setFormData({ ...formData, statuses: newStatuses });
  };

  const moveStatus = (index: number, direction: 'up' | 'down') => {
    const newStatuses = [...(formData.statuses || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newStatuses.length) return;
    
    [newStatuses[index], newStatuses[targetIndex]] = [newStatuses[targetIndex], newStatuses[index]];
    setFormData({ ...formData, statuses: newStatuses });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.prefix || !formData.statuses?.length) return;

    const payload = { ...formData } as Omit<TaskQueue, 'id'>;

    if (editingQueue) {
      updateQueue(editingQueue.id, payload);
    } else {
      addQueue(payload);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    const defaultTemplate = queueTemplates[0];
    setFormData({ 
        name: '', 
        prefix: '', 
        template: defaultTemplate?.id || '', 
        statuses: defaultTemplate ? [...defaultTemplate.statuses] : [] 
    });
    setEditingQueue(null);
  };

  const handleEdit = (q: TaskQueue) => {
    setEditingQueue(q);
    setFormData({ ...q });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Task Queues</h1>
          <p className="text-sm text-slate-500">Manage separate work streams, prefixes, and workflows.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          className="btn-primary"
        >
          <Plus size={18} /> <span>Create Queue</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queues.map(queue => (
          <div key={queue.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Layers size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => handleEdit(queue)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                  <Edit2 size={16}/>
                </button>
                <button 
                  onClick={() => setConfirmState({ isOpen: true, id: queue.id })}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800">{queue.name}</h3>
            <div className="flex items-center gap-2 mt-1 mb-4">
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider">
                Prefix: {queue.prefix}
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase">
                Template: {queueTemplates.find(t => t.id === queue.template)?.name || 'Custom'}
              </span>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-50 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow Sequence</p>
              <div className="flex flex-wrap gap-1.5">
                {queue.statuses.map((s, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded shadow-sm">
                      {s}
                    </span>
                    {idx < queue.statuses.length - 1 && (
                      <span className="mx-0.5 text-slate-300">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-slate-800">{editingQueue ? 'Edit Queue Settings' : 'Create New Queue'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Queue Name</label>
                  <input 
                    required 
                    className="input" 
                    placeholder="e.g. Technical Support" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="label">Key Prefix</label>
                  <input 
                    required 
                    className="input uppercase font-mono" 
                    placeholder="e.g. SUP" 
                    maxLength={5}
                    value={formData.prefix}
                    onChange={e => setFormData({...formData, prefix: e.target.value.toUpperCase()})}
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">Used for Task IDs: {formData.prefix || '...'}-1, {formData.prefix || '...'}-2</p>
                </div>
              </div>

              <div>
                <label className="label">Base Template</label>
                <select 
                  className="input" 
                  value={formData.template}
                  onChange={e => handleTemplateChange(e.target.value)}
                >
                  <option value="">Select template...</option>
                  {queueTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                  <option value="custom">Custom (Start from scratch)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Choosing a template resets the status list below.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="label mb-0">Workflow Statuses & Order</label>
                  <button 
                    type="button" 
                    onClick={addStatus}
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                  >
                    <Plus size={14}/> Add Status
                  </button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {formData.statuses?.map((status, index) => (
                    <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 group">
                      <div className="text-slate-300 cursor-grab">
                        <GripVertical size={16} />
                      </div>
                      <input 
                        className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-700 border-b border-transparent focus:border-blue-400 py-0.5"
                        value={status}
                        onChange={e => updateStatusName(index, e.target.value)}
                        placeholder="Status name"
                      />
                      <div className="flex items-center gap-1">
                        <button 
                          type="button" 
                          disabled={index === 0}
                          onClick={() => moveStatus(index, 'up')}
                          className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                        >
                          <ChevronUp size={16}/>
                        </button>
                        <button 
                          type="button" 
                          disabled={index === (formData.statuses?.length || 0) - 1}
                          onClick={() => moveStatus(index, 'down')}
                          className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                        >
                          <ChevronDown size={16}/>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => removeStatus(index)}
                          className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {(formData.statuses?.length || 0) === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm italic">
                    Workflow must have at least one status.
                  </div>
                )}
              </div>
            </form>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
              <button 
                type="submit" 
                onClick={handleSubmit}
                disabled={!formData.statuses?.length}
                className="btn-primary"
              >
                {editingQueue ? 'Save Workflow' : 'Create Queue'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, id: '' })}
        title="Delete Queue"
        message="Are you sure you want to delete this queue? All workflow configurations and history for this queue will be removed. Existing tasks will lose their queue context."
        onConfirm={() => deleteQueue(confirmState.id)}
      />
    </div>
  );
};

export default QueuesPage;
