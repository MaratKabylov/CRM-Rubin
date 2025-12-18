
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Clock, CheckCircle, ChevronRight, ClipboardList, Layers } from 'lucide-react';
import { Task, Priority } from '../types';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

const PriorityBadge = ({ p }: { p: Priority }) => {
  const colors = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-red-100 text-red-600'
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors[p]}`}>{p}</span>;
};

const TasksPage: React.FC = () => {
  const { tasks, clients, users, queues } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filtered = tasks.filter(t => {
    const queue = queues.find(q => q.id === t.queue_id);
    const prefixId = `${queue?.prefix}-${t.queue_task_no}`;
    
    return t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prefixId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clients.find(c => c.id === t.client_id)?.short_name.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Tasks & Issues</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={18} /> <span>Create Task</span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
          <Search className="text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID (e.g. SUP-1), title or client..." 
            className="flex-1 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-white px-4 rounded-lg border border-slate-200 flex items-center gap-2 text-slate-600 hover:bg-slate-50">
          <Filter size={18} /> <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(task => {
          const client = clients.find(c => c.id === task.client_id);
          const queue = queues.find(q => q.id === task.queue_id);
          const doneItems = task.checklist.filter(i => i.is_done).length;
          const totalItems = task.checklist.length;
          const prefixId = `${queue?.prefix || 'TASK'}-${task.queue_task_no || task.task_no}`;
          
          return (
            <div 
              key={task.id} 
              onClick={() => setSelectedTask(task)}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-2 rounded-lg ${task.status.toLowerCase().includes('закрыт') || task.status.toLowerCase().includes('done') || task.status.toLowerCase().includes('выполнено') ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                  {task.status.toLowerCase().includes('закрыт') ? <CheckCircle size={20}/> : <Clock size={20}/>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400 font-mono tracking-tight">{prefixId}</span>
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600">{task.title}</h3>
                    <PriorityBadge p={task.priority} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-medium text-blue-600">{client?.short_name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Layers size={10}/> {queue?.name}</span>
                    <span>•</span>
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold text-[9px] uppercase">{task.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {totalItems > 0 && (
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <ClipboardList size={14}/> {doneItems}/{totalItems}
                  </div>
                )}
                <div className="flex -space-x-2">
                  {task.performer_ids.slice(0, 3).map(uid => (
                    <div key={uid} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase" title={users.find(u => u.id === uid)?.name}>
                      {users.find(u => u.id === uid)?.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-blue-500" size={20} />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
             No tasks found matching your criteria.
          </div>
        )}
      </div>

      {showCreate && <TaskModal onClose={() => setShowCreate(false)} />}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </div>
  );
};

export default TasksPage;
