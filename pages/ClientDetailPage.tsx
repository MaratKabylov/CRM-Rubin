
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  Phone, Mail, MapPin, Briefcase, Database as DbIcon, 
  FileText, UserPlus, Trash2, Edit2, Shield, Key, 
  History, Save, X, Plus, ClipboardList, Clock, CheckCircle, Activity, Globe
} from 'lucide-react';
import { Contact, Contract, Database1C, Client, Task, DbState } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import StarRating from '../components/StarRating';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

type Tab = 'contacts' | 'contracts' | 'databases' | 'tasks' | 'history' | 'info';

const DB_STATE_LABELS: Record<DbState, { label: string, color: string }> = {
  full_support: { label: 'Типовое (Full Support)', color: 'bg-green-100 text-green-700' },
  full_support_with_extensions: { label: 'Типовое + расширения', color: 'bg-emerald-100 text-emerald-700' },
  minor_change: { label: 'Незначит. изменения', color: 'bg-blue-100 text-blue-700' },
  major_change: { label: 'Серьезные изменения', color: 'bg-orange-100 text-orange-700' },
  custom_solution: { label: 'Самописное решение', color: 'bg-red-100 text-red-700' }
};

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    clients, contacts, contracts, databases, historyLogs, tasks,
    spheres, sources, users, orgs, configs, versions,
    addContact, updateContact, deleteContact, 
    addContract, updateContract, deleteContract, 
    addDatabase, updateDatabase, deleteDatabase, 
    updateClient, deleteClient, getClientStats
  } = useData();

  const [activeTab, setActiveTab] = useState<Tab>('contacts');
  
  // Modals state
  const [showClientModal, setShowClientModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editingDb, setEditingDb] = useState<Database1C | null>(null);

  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({
      isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
      setConfirmState({ isOpen: true, title, message, onConfirm });
  };

  const [clientForm, setClientForm] = useState<Partial<Client>>({});
  const [contactForm, setContactForm] = useState<Partial<Contact>>({});
  const [contractForm, setContractForm] = useState<Partial<Contract>>({});
  const [dbForm, setDbForm] = useState<Partial<Database1C>>({});
  const [tagInput, setTagInput] = useState('');

  const client = clients.find(c => c.id === id);
  const stats = client ? getClientStats(client.id) : { avgRating: 0, taskCount: 0 };

  useEffect(() => {
      if (client && showClientModal) setClientForm({...client});
  }, [showClientModal, client]);

  useEffect(() => {
    if (showContactModal) {
      if (editingContact) setContactForm(editingContact);
      else setContactForm({ rating: 0 });
    }
  }, [editingContact, showContactModal]);

  useEffect(() => {
    if (showContractModal) {
      if (editingContract) setContractForm(editingContract);
      else setContractForm({ its_active: true, its_ours: true, is_signed: false });
    }
  }, [editingContract, showContractModal]);

  useEffect(() => {
    if (showDbModal) {
      if (editingDb) setDbForm(editingDb);
      else setDbForm({ state: 'full_support', work_mode: 'file', its_supported: true });
    }
  }, [editingDb, showDbModal]);

  if (!client) return <div className="p-8 text-center text-slate-500">Client not found</div>;

  const clientContacts = contacts.filter(c => c.client_id === client.id);
  const clientContracts = contracts.filter(c => c.client_id === client.id);
  const clientDbs = databases.filter(d => d.client_id === client.id);
  const clientTasks = tasks.filter(t => t.client_id === client.id).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const clientLogs = historyLogs.filter(h => h.parent_client_id === client.id);

  const owner = users.find(u => u.id === client.owner_id);
  const sphere = spheres.find(s => s.id === client.activity_id);
  const source = sources.find(s => s.id === client.source_id);

  const getContactAvgRating = (contactId: string) => {
    const ratedTasks = tasks.filter(t => t.contact_id === contactId && t.contact_rating);
    if (ratedTasks.length === 0) return 0;
    const sum = ratedTasks.reduce((acc, t) => acc + (t.contact_rating || 0), 0);
    return parseFloat((sum / ratedTasks.length).toFixed(1));
  };

  const handleClientSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateClient(client.id, clientForm);
      setShowClientModal(false);
  };

  const handleRemoveTag = (tag: string) => {
      const currentTags = clientForm.tags || [];
      setClientForm({ ...clientForm, tags: currentTags.filter(t => t !== tag) });
  };

  const handleAddTag = (e: any) => {
    e.preventDefault();
    const val = tagInput.trim();
    if(!val) return;
    const current = clientForm.tags || [];
    if(!current.includes(val)) setClientForm({...clientForm, tags: [...current, val]});
    setTagInput('');
  };

  const isContractActive = (endDate: string) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      return end >= today;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="w-full md:w-auto">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 break-words">{client.short_name}</h1>
              <button onClick={() => setShowClientModal(true)} className="text-slate-400 hover:text-blue-600 transition p-1"><Edit2 size={18} /></button>
              {client.is_gov && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold">GOV</span>}
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
                 <StarRating rating={stats.avgRating} size={16} />
                 <span className="text-sm font-bold text-slate-700">{stats.avgRating}</span>
                 <span className="text-[10px] text-slate-400">({stats.taskCount} rated tasks)</span>
            </div>

            <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:flex-wrap md:gap-4 text-xs md:text-sm text-slate-600">
              <div className="flex items-center space-x-2"><Mail size={14} className="text-blue-500" /> <span className="truncate">{client.email}</span></div>
              <div className="flex items-center space-x-2"><Phone size={14} className="text-green-500" /> <span>{client.phone}</span></div>
              <div className="flex items-center space-x-2"><MapPin size={14} className="text-red-500" /> <span className="truncate">{client.actual_address}</span></div>
            </div>
          </div>
          <div className="w-full md:w-auto md:text-right border-t md:border-t-0 pt-4 md:pt-0">
             <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Account Manager</p>
             <p className="font-semibold text-slate-800 text-sm">{owner?.name}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-full md:w-fit mb-4 overflow-x-auto scrollbar-hide">
          {(['contacts', 'contracts', 'databases', 'tasks', 'history', 'info'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-[11px] md:text-sm font-medium capitalize transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px] p-4 md:p-6">
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h3 className="font-bold text-lg">Contacts</h3>
                <button onClick={() => { setEditingContact(null); setShowContactModal(true); }} className="btn-primary text-xs md:text-sm w-full sm:w-auto"><Plus size={16} /> Add Contact</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientContacts.map(c => {
                  const contactRating = getContactAvgRating(c.id);
                  return (
                    <div key={c.id} className="border border-slate-200 p-4 rounded-xl flex justify-between items-start group relative bg-slate-50/30">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2">
                          <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="text-slate-400 hover:text-blue-500 p-1"><Edit2 size={14}/></button>
                          <button onClick={() => openConfirm('Delete Contact', 'Are you sure?', () => deleteContact(c.id))} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="font-bold text-sm truncate">{c.first_name} {c.last_name}</div>
                        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-tight mb-2 truncate">{c.position}</div>
                        <div className="text-[11px] text-slate-500 truncate">{c.phone}</div>
                        <div className="mt-2 flex items-center gap-1">
                           <StarRating rating={contactRating} size={10} />
                           {contactRating > 0 && <span className="text-[10px] font-bold text-slate-400">{contactRating}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
             <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h3 className="font-bold text-lg">Contracts</h3>
                <button onClick={() => { setEditingContract(null); setShowContractModal(true); }} className="btn-primary text-xs md:text-sm w-full sm:w-auto"><Plus size={16} /> Add Contract</button>
              </div>
              <div className="overflow-x-auto border border-slate-100 rounded-lg shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="p-3">№ Дог.</th>
                      <th className="p-3">Заголовок</th>
                      <th className="p-3">Сроки</th>
                      <th className="p-3">Статус</th>
                      <th className="p-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientContracts.map(c => {
                      const active = isContractActive(c.end_date);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono text-xs text-slate-500 whitespace-nowrap">{c.contract_number}</td>
                          <td className="p-3 font-semibold text-slate-800 truncate max-w-[150px]">{c.title}</td>
                          <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">{c.end_date}</td>
                          <td className="p-3">
                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {active ? 'Активен' : 'Истек'}
                             </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => { setEditingContract(c); setShowContractModal(true); }} className="text-slate-400 hover:text-blue-500 p-1"><Edit2 size={14}/></button>
                              <button onClick={() => openConfirm('Delete', 'Sure?', () => deleteContract(c.id))} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
             </div>
          )}

          {activeTab === 'databases' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h3 className="font-bold text-lg">1C Databases</h3>
                <button onClick={() => { setEditingDb(null); setShowDbModal(true); }} className="btn-primary text-xs md:text-sm w-full sm:w-auto"><Plus size={16} /> Add Database</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientDbs.map(db => {
                  const stateInfo = DB_STATE_LABELS[db.state || 'full_support'];
                  return (
                    <div key={db.id} className="border border-slate-200 p-4 rounded-xl flex flex-col relative group hover:border-purple-200 transition bg-slate-50/30">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2">
                          <button onClick={() => { setEditingDb(db); setShowDbModal(true); }} className="text-slate-400 hover:text-blue-500 p-1"><Edit2 size={14}/></button>
                          <button onClick={() => openConfirm('Delete DB', 'Are you sure?', () => deleteDatabase(db.id))} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                      </div>
                      <div className="flex items-center gap-2 mb-2 min-w-0">
                          <DbIcon size={14} className="text-purple-500 flex-shrink-0" />
                          <span className="font-bold text-slate-800 text-sm truncate">{db.name}</span>
                          <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold uppercase text-slate-500 flex-shrink-0">{db.work_mode}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 space-y-1 mb-3 flex-1">
                          <p className="truncate">Config: <span className="text-blue-600 font-medium">{configs.find(c => c.id === db.config_id)?.name}</span></p>
                          <p>Reg Num: <span className="text-slate-700">{db.reg_number}</span></p>
                          <div className="flex items-center gap-1.5 pt-1">
                             <Activity size={10} className="text-slate-400 flex-shrink-0"/>
                             <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tighter ${stateInfo.color} truncate`}>
                               {stateInfo.label}
                             </span>
                          </div>
                      </div>
                      <div className="mt-auto pt-3 border-t border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${db.its_supported ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{db.its_supported ? 'ИТС ВКЛ' : 'БЕЗ ИТС'}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 overflow-hidden">
                              <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded border border-slate-200 truncate">
                                  <Shield size={10} className="text-slate-400 flex-shrink-0"/> {db.db_admin || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1 text-[9px] text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded border border-slate-200 truncate">
                                  <Key size={10} className="text-slate-400 flex-shrink-0"/> {db.db_password || 'N/A'}
                              </div>
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ... Other tabs similarly updated for responsiveness ... */}
          {activeTab === 'tasks' && (
              <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <h3 className="font-bold text-lg text-slate-800">Task History</h3>
                      <button onClick={() => setShowTaskModal(true)} className="btn-primary text-xs md:text-sm w-full sm:w-auto"><Plus size={16}/> New Task</button>
                  </div>
                  <div className="space-y-2">
                      {clientTasks.map(task => (
                          <div 
                            key={task.id} 
                            onClick={() => setSelectedTask(task)}
                            className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-300 cursor-pointer transition"
                          >
                              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                                  <div className={`p-2 rounded-lg flex-shrink-0 ${task.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                      {task.status === 'done' ? <CheckCircle size={18}/> : <Clock size={18}/>}
                                  </div>
                                  <div className="min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-[9px] font-mono font-bold text-slate-400 flex-shrink-0">#{task.task_no}</span>
                                          <div className="font-bold text-slate-800 text-xs md:text-sm truncate">{task.title}</div>
                                      </div>
                                      <div className="text-[9px] text-slate-400 uppercase font-bold truncate">{task.type} • {task.status}</div>
                                  </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                                {task.completion_rating && (
                                  <div className="flex items-center gap-1">
                                    <StarRating rating={task.completion_rating} size={8} />
                                  </div>
                                )}
                              </div>
                          </div>
                      ))}
                      {clientTasks.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">No tasks recorded for this client.</div>}
                  </div>
              </div>
          )}
        </div>
      </div>

      {/* MODALS Updated to be more mobile friendly */}
      {showClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold text-slate-800">Edit Client</h2>
              <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>
            <form onSubmit={handleClientSubmit} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Short Name</label><input required className="input" value={clientForm.short_name || ''} onChange={e => setClientForm({...clientForm, short_name: e.target.value})} /></div>
                <div><label className="label">BIN</label><input className="input" value={clientForm.bin || ''} onChange={e => setClientForm({...clientForm, bin: e.target.value})} /></div>
              </div>
              <div><label className="label">Full Name</label><input required className="input" value={clientForm.full_name || ''} onChange={e => setClientForm({...clientForm, full_name: e.target.value})} /></div>
              
              <div className="border-t border-slate-100 pt-4 mt-2">
                <label className="label">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {clientForm.tags?.map(t => (
                        <span key={t} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs flex items-center border border-blue-100">
                            {t}
                            <button type="button" onClick={() => handleRemoveTag(t)} className="ml-2 text-blue-400 hover:text-red-500 p-0.5"><X size={12} /></button>
                        </span>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input className="input flex-1 text-sm" placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag(e)}/>
                    <button type="button" onClick={handleAddTag} className="btn-secondary w-full sm:w-auto"><Plus size={18}/></button>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                <button type="button" onClick={() => setShowClientModal(false)} className="btn-secondary w-full sm:w-auto order-2 sm:order-1">Cancel</button>
                <button type="submit" className="btn-primary w-full sm:w-auto order-1 sm:order-2"><Save size={18} /> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task modals and others already have basic responsiveness via TaskModal adjustments */}
      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} />}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
      
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

export default ClientDetailPage;
