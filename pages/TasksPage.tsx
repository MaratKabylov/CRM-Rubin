
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Filter, Clock, CheckCircle, ChevronRight, 
  ClipboardList, Layers, Tag as TagIcon, LayoutGrid, List as ListIcon,
  MoreVertical
} from 'lucide-react';
import { Task, Priority, TaskQueue } from '../types';
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

type ViewMode = 'list' | 'kanban';

const TasksPage: React.FC = () => {
  const { tasks, clients, users, queues, queueTemplates } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeQueueId, setActiveQueueId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const filtered = tasks.filter(t => {
    const queue = queues.find(q => q.id === t.queue_id);
    const prefixId = `${queue?.prefix}-${t.queue_task_no}`;
    
    // Filter by Search
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prefixId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clients.find(c => c.id === t.client_id)?.short_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by Queue
    const matchesQueue = activeQueueId === 'all' || t.queue_id === activeQueueId;

    return matchesSearch && matchesQueue;
  }).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const activeQueue = queues.find(q => q.id === activeQueueId);
  const activeQueueName = activeQueueId === 'all' ? 'Task' : activeQueue?.name || 'Task';

  const getKanbanStatuses = () => {
    if (activeQueue) return activeQueue.statuses;
    return queueTemplates[0]?.statuses || ['Зарегистрирована', 'В работе', 'Закрыт'];
  };

  const kanbanStatuses = getKanbanStatuses();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
          <p className="text-sm text-slate-500">Manage support and development tickets.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-200 p-1 rounded-lg">
             <button 
               onClick={() => setViewMode('list')}
               className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <ListIcon size={18} />
             </button>
             <button 
               onClick={() => setViewMode('kanban')}
               className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <LayoutGrid size={18} />
             </button>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary w-full sm:w-auto">
            <Plus size={18} /> <span className="sm:inline">New {activeQueueName}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
            <Search className="text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ID, title or client..." 
              className="flex-1 outline-none text-sm min-w-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-white px-4 py-2.5 rounded-lg border border-slate-200 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 transition shadow-sm">
            <Filter size={18} /> <span className="text-sm font-medium">Filter</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <button 
            onClick={() => setActiveQueueId('all')}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition whitespace-nowrap border ${
              activeQueueId === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            All Queues
          </button>
          {queues.map(q => (
            <button 
              key={q.id}
              onClick={() => setActiveQueueId(q.id)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition whitespace-nowrap border flex items-center gap-2 ${
                activeQueueId === q.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              <Layers size={14}/>
              {q.name}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filtered.map(task => {
            const client = clients.find(c => c.id === task.client_id);
            const queue = queues.find(q => q.id === task.queue_id);
            const prefixId = `${queue?.prefix || 'TASK'}-${task.queue_task_no || task.task_no}`;
            
            return (
              <div 
                key={task.id} 
                onClick={() => setSelectedTask(task)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition cursor-pointer flex items-center justify-between group gap-4"
              >
                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${task.status.toLowerCase().includes('закрыт') || task.status.toLowerCase().includes('done') ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                    {task.status.toLowerCase().includes('закрыт') ? <CheckCircle size={18}/> : <Clock size={18}/>}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tight flex-shrink-0">{prefixId}</span>
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 text-sm truncate">{task.title}</h3>
                      <div className="flex-shrink-0"><PriorityBadge p={task.priority} /></div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 truncate">
                      <span className="font-bold text-blue-600 truncate">{client?.short_name}</span>
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase whitespace-nowrap">{task.status}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-blue-500 flex-shrink-0 hidden sm:block" size={20} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 min-h-[500px] items-start">
          {kanbanStatuses.map(status => {
            const statusTasks = filtered.filter(t => t.status === status);
            return (
              <div key={status} className="flex-shrink-0 w-72 sm:w-80 bg-slate-200/50 rounded-xl flex flex-col max-h-full border border-slate-200">
                <div className="p-3 flex items-center justify-between border-b border-slate-200 bg-slate-100/50 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider truncate">{status}</h3>
                    <span className="bg-white text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-bold border border-slate-200">{statusTasks.length}</span>
                  </div>
                </div>
                
                <div className="p-2 space-y-3 overflow-y-auto flex-1 custom-scrollbar min-h-[100px]">
                  {statusTasks.map(task => {
                    const client = clients.find(c => c.id === task.client_id);
                    const queue = queues.find(q => q.id === task.queue_id);
                    const prefixId = `${queue?.prefix || 'TASK'}-${task.queue_task_no || task.task_no}`;

                    return (
                      <div 
                        key={task.id} 
                        onClick={() => setSelectedTask(task)}
                        className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:border-blue-400 cursor-pointer group transition-all"
                      >
                        <div className="flex justify-between items-start mb-2 gap-2">
                           <span className="text-[9px] font-bold text-slate-400 font-mono flex-shrink-0">{prefixId}</span>
                           <PriorityBadge p={task.priority} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mb-2 group-hover:text-blue-600 line-clamp-2">{task.title}</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] text-blue-600 font-bold uppercase truncate max-w-[120px]">{client?.short_name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <TaskModal onClose={() => setShowCreate(false)} defaultQueueId={activeQueueId === 'all' ? undefined : activeQueueId} />}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </div>
  );
};

export default TasksPage;
