
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, CheckCircle, MessageSquare, Send, Clock, User, 
  Building, Database as DbIcon, Star, Calendar, 
  Tag as TagIcon, Eye, Edit2, AlertCircle,
  Phone, Mail, Layers, History as HistoryIcon,
  Timer, Plus
} from 'lucide-react';
import { Task, TaskStatus, Priority } from '../types';
import StarRating from './StarRating';
import TaskModal from './TaskModal';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const PriorityBadge = ({ p }: { p: Priority }) => {
  const colors = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-red-100 text-red-600'
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors[p]}`}>{p}</span>;
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task: initialTask, onClose }) => {
  const { tasks, clients, contacts, databases, users, taskComments, historyLogs, queues, updateTask, addComment, addTimeLog } = useData();
  const { user: currentUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [contactRating, setContactRating] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<'comments' | 'history' | 'time'>('comments');

  // Time logging state
  const [logTimeMinutes, setLogTimeMinutes] = useState<string>('');
  const [logTimeComment, setLogTimeComment] = useState<string>('');
  const [logTimeDate, setLogTimeDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Get live data
  const task = tasks.find(t => t.id === initialTask.id) || initialTask;
  const client = clients.find(c => c.id === task.client_id);
  const contact = contacts.find(c => c.id === task.contact_id);
  const db1c = databases.find(d => d.id === task.db_id);
  const comments = taskComments.filter(c => c.task_id === task.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const logs = historyLogs.filter(h => h.entity_id === task.id);
  const queue = queues.find(q => q.id === task.queue_id);
  
  const performers = users.filter(u => task.performer_ids?.includes(u.id));
  const observers = users.filter(u => task.observer_ids?.includes(u.id));

  const totalTimeMinutes = (task.time_logs || []).reduce((acc, log) => acc + (log.duration_minutes || 0), 0);
  const formatMinutes = (m: number) => {
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const isClosedStatus = (status: string) => {
    const s = status.toLowerCase();
    return s.includes('закрыт') || s.includes('done') || s.includes('выполнено');
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
      if (isClosedStatus(newStatus)) {
          setShowRating(true);
      } else {
          updateTask(task.id, { status: newStatus });
      }
  };

  const handleCompleteWithRating = () => {
      const closedStatus = queue?.statuses.find(isClosedStatus) || queue?.statuses[queue.statuses.length - 1] || 'Closed';
      updateTask(task.id, { 
          status: closedStatus, 
          completion_rating: rating,
          contact_rating: contactRating 
      });
      setShowRating(false);
      onClose();
  };

  const handleSendComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      addComment(task.id, commentText);
      setCommentText('');
  };

  const handleAddTimeLog = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(logTimeMinutes);
    if (!mins || isNaN(mins)) return;
    addTimeLog(task.id, {
      duration_minutes: mins,
      comment: logTimeComment,
      date: logTimeDate
    });
    setLogTimeMinutes('');
    setLogTimeComment('');
  };

  const toggleCheck = (itemId: string) => {
      const newList = task.checklist.map(i => i.id === itemId ? { ...i, is_done: !i.is_done } : i);
      updateTask(task.id, { checklist: newList });
  };

  if (isEditing) {
    return <TaskModal onClose={() => setIsEditing(false)} initialTask={task} />;
  }

  const prefixId = `${queue?.prefix || 'TASK'}-${task.queue_task_no || task.task_no}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-white h-full w-full max-w-3xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400 font-mono bg-slate-200 px-2 py-0.5 rounded">{prefixId}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{task.type}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${isClosedStatus(task.status) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{task.status}</span>
                <PriorityBadge p={task.priority} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">{task.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsEditing(true)} 
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                title="Edit Task"
            >
                <Edit2 size={20}/>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition"><X size={24}/></button>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
            
            {/* Main Content */}
            <div className="flex-1 p-6 space-y-8 border-r border-slate-50">
                {/* Status Actions */}
                {!isClosedStatus(task.status) && queue && (
                    <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl">
                        {queue.statuses.map(s => (
                            <button 
                                key={s}
                                onClick={() => handleStatusChange(s)}
                                className={`px-4 py-2 rounded-lg font-bold flex-1 shadow-sm transition text-xs whitespace-nowrap ${
                                    task.status === s 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Description</h4>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic text-sm">
                        {task.description || 'No description provided.'}
                    </p>
                </div>

                {task.checklist.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Checklist Progress</h4>
                        <div className="space-y-2">
                            {task.checklist.map(item => (
                                <label key={item.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-200 transition cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={item.is_done} 
                                        onChange={() => toggleCheck(item.id)}
                                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className={`text-sm ${item.is_done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sub-Tabs: Comments vs History vs Time */}
                <div className="pt-4 border-t border-slate-100 flex flex-col h-full">
                    <div className="flex border-b border-slate-100 mb-4 gap-4 overflow-x-auto pb-1">
                        <button 
                            onClick={() => setActiveSubTab('comments')}
                            className={`pb-2 px-1 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeSubTab === 'comments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Communication ({comments.length})
                        </button>
                        <button 
                            onClick={() => setActiveSubTab('time')}
                            className={`pb-2 px-1 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeSubTab === 'time' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Time Tracking ({formatMinutes(totalTimeMinutes)})
                        </button>
                        <button 
                            onClick={() => setActiveSubTab('history')}
                            className={`pb-2 px-1 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeSubTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            History ({logs.length})
                        </button>
                    </div>

                    {activeSubTab === 'comments' && (
                        <div className="flex flex-col gap-4">
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {comments.map(c => (
                                    <div key={c.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase border border-blue-200">
                                            {c.user_name.charAt(0)}
                                        </div>
                                        <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-slate-800">{c.user_name}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(c.timestamp).toLocaleString([], {hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit'})}</span>
                                            </div>
                                            <p className="text-sm text-slate-600">{c.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {comments.length === 0 && <p className="text-center py-6 text-slate-400 text-xs italic">No comments yet.</p>}
                            </div>
                            <form onSubmit={handleSendComment} className="flex gap-2 mt-4">
                                <input 
                                    className="input flex-1 bg-slate-50 border-transparent focus:bg-white text-sm" 
                                    placeholder="Type your message..." 
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"><Send size={18}/></button>
                            </form>
                        </div>
                    )}

                    {activeSubTab === 'time' && (
                      <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Total Time Logged</p>
                            <h3 className="text-2xl font-bold text-blue-800">{formatMinutes(totalTimeMinutes)}</h3>
                          </div>
                          <Timer size={32} className="text-blue-200" />
                        </div>

                        {/* Log Time Form */}
                        <form onSubmit={handleAddTimeLog} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                          <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Plus size={14}/> Register Effort</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Minutes</label>
                              <input 
                                type="number" 
                                className="input text-sm" 
                                placeholder="60" 
                                value={logTimeMinutes} 
                                onChange={e => setLogTimeMinutes(e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                              <input 
                                type="date" 
                                className="input text-sm" 
                                value={logTimeDate} 
                                onChange={e => setLogTimeDate(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Work Comment</label>
                            <input 
                              type="text" 
                              className="input text-sm" 
                              placeholder="Consultation on fixed assets..." 
                              value={logTimeComment} 
                              onChange={e => setLogTimeComment(e.target.value)}
                            />
                          </div>
                          <button type="submit" className="btn-primary w-full text-sm py-2">Log Time</button>
                        </form>

                        {/* Logs List */}
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-500 uppercase">Time Ledger</p>
                          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {(task.time_logs || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                    {log.user_name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-800">{log.user_name}</span>
                                      <span className="text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100">{log.date}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 italic">{log.comment || 'General effort'}</p>
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-blue-700">
                                  +{formatMinutes(log.duration_minutes)}
                                </div>
                              </div>
                            ))}
                            {(task.time_logs || []).length === 0 && <p className="text-center py-6 text-slate-400 text-xs italic">No time logs recorded.</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSubTab === 'history' && (
                        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-slate-100 pl-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {logs.map((log, idx) => (
                                <div key={log.id} className="relative">
                                    <div className="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-400 flex items-center justify-center z-10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-slate-800">{log.user_name}</span>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10}/> {new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div className="bg-white border border-slate-100 rounded-lg p-2 shadow-sm">
                                            <p className="text-xs text-slate-600 font-medium uppercase tracking-tight mb-1">{log.action}</p>
                                            <p className="text-xs text-slate-500 italic">{log.details}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && <p className="text-center py-6 text-slate-400 text-xs italic">No history recorded.</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Metadata */}
            <div className="w-full md:w-72 bg-slate-50/50 p-6 space-y-6">
                <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Workflow Context</h4>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Layers size={16} className="text-blue-500 mt-0.5"/>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{queue?.name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">Task Queue</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Building size={16} className="text-slate-400 mt-0.5"/>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{client?.short_name}</p>
                                <p className="text-[10px] text-slate-500 font-medium">Main Company</p>
                            </div>
                        </div>
                        {contact && (
                            <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                <User size={16} className="text-blue-500 mt-0.5"/>
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 truncate">{contact.first_name} {contact.last_name}</p>
                                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">{contact.position || 'Contact Person'}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 pt-1 border-t border-slate-50">
                                        <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-[11px] text-slate-600 hover:text-blue-600 transition truncate">
                                            <Phone size={10} className="text-slate-400" /> {contact.phone}
                                        </a>
                                        <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-[11px] text-slate-600 hover:text-blue-600 transition truncate">
                                            <Mail size={10} className="text-slate-400" /> {contact.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                        {db1c && (
                            <div className="flex items-start gap-3">
                                <DbIcon size={16} className="text-purple-400 mt-0.5"/>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">{db1c.name}</p>
                                    <p className="text-[10px] text-slate-500">1C Database</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Planning</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-slate-400"/>
                            <span className={`text-sm ${task.deadline ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <AlertCircle size={16} className="text-slate-400"/>
                            <PriorityBadge p={task.priority} />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Performers</h4>
                    <div className="flex flex-col gap-2">
                        {performers.length > 0 ? performers.map(u => (
                            <div key={u.id} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600 border border-blue-200">
                                    {u.name.charAt(0)}
                                </div>
                                <span className="text-xs text-slate-700">{u.name}</span>
                            </div>
                        )) : <span className="text-xs text-slate-400 italic">Unassigned</span>}
                    </div>
                </div>

                {task.tags && task.tags.length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Tags</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {task.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded text-[10px] font-medium">
                                    <TagIcon size={10}/> {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Rating Modal Overlay */}
        {showRating && (
            <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center p-6 backdrop-blur-md">
                <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl transform animate-in zoom-in-95 duration-200">
                    <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-100">
                        <Star size={32} className="text-yellow-500 fill-yellow-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Final Evaluation</h3>
                    <p className="text-sm text-slate-500 mb-8">Please rate the interaction with the client and contact person for this task.</p>
                    
                    <div className="space-y-6 mb-8 text-left">
                        {/* Company Rating */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Building size={12}/> {client?.short_name || 'Company'} Collaboration
                            </label>
                            <div className="flex justify-start">
                                <StarRating rating={rating} editable size={28} onRatingChange={setRating} />
                            </div>
                        </div>

                        {/* Contact Rating */}
                        {contact && (
                            <div className="space-y-2 pt-4 border-t border-slate-50">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <User size={12}/> {contact.first_name} {contact.last_name} Interaction
                                </label>
                                <div className="flex justify-start">
                                    <StarRating rating={contactRating} editable size={28} onRatingChange={setContactRating} />
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleCompleteWithRating}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                    >
                        Save Ratings & Finish Task
                    </button>
                    <button 
                        onClick={() => setShowRating(false)}
                        className="w-full mt-3 text-slate-400 text-xs hover:text-slate-600 transition"
                    >
                        Go back
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
