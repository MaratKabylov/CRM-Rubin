
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  Phone, Mail, MapPin, Briefcase, Database as DbIcon, 
  FileText, UserPlus, Trash2, Edit2, Shield, Key, 
  History, Save, X, Plus, ClipboardList, Clock, CheckCircle 
} from 'lucide-react';
import { Contact, Contract, Database1C, Client, Task } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import StarRating from '../components/StarRating';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

type Tab = 'contacts' | 'contracts' | 'databases' | 'tasks' | 'history' | 'info';

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
      else setContractForm({ its_active: true, is_signed: false });
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-800">{client.short_name}</h1>
              <button onClick={() => setShowClientModal(true)} className="text-slate-400 hover:text-blue-600 transition"><Edit2 size={18} /></button>
              {client.is_gov && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-bold">GOV</span>}
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
                 <StarRating rating={stats.avgRating} size={18} />
                 <span className="text-sm font-bold text-slate-700">{stats.avgRating}</span>
                 <span className="text-xs text-slate-400">({stats.taskCount} rated tasks)</span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center space-x-2"><Mail size={16} className="text-blue-500" /> <span>{client.email}</span></div>
              <div className="flex items-center space-x-2"><Phone size={16} className="text-green-500" /> <span>{client.phone}</span></div>
              <div className="flex items-center space-x-2"><MapPin size={16} className="text-red-500" /> <span>{client.actual_address}</span></div>
            </div>
          </div>
          <div className="text-right">
             <p className="text-xs text-slate-400 uppercase font-bold mb-1">Account Manager</p>
             <p className="font-semibold text-slate-800">{owner?.name}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit mb-4 overflow-x-auto">
          {(['contacts', 'contracts', 'databases', 'tasks', 'history', 'info'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px] p-6">
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center"><h3 className="font-bold text-lg">Contacts</h3><button onClick={() => { setEditingContact(null); setShowContactModal(true); }} className="btn-primary text-sm"><Plus size={16} /> Add Contact</button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientContacts.map(c => (
                  <div key={c.id} className="border border-slate-200 p-4 rounded-xl flex justify-between items-start group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2">
                        <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="text-slate-400 hover:text-blue-500"><Edit2 size={14}/></button>
                        <button onClick={() => openConfirm('Delete Contact', 'Delete this contact?', () => deleteContact(c.id))} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                    <div><div className="font-bold">{c.first_name} {c.last_name}</div><div className="text-xs text-blue-600 mb-2">{c.position}</div><div className="text-xs text-slate-500">{c.phone}</div></div>
                    <StarRating rating={c.rating || 0} size={12} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
             <div className="space-y-4">
              <div className="flex justify-between items-center"><h3 className="font-bold text-lg">Contracts</h3><button onClick={() => { setEditingContract(null); setShowContractModal(true); }} className="btn-primary text-sm"><Plus size={16} /> Add Contract</button></div>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50"><tr><th className="p-3">Num</th><th className="p-3">Title</th><th className="p-3">Dates</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
                  <tbody className="divide-y">
                    {clientContracts.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium">{c.contract_number}</td>
                        <td className="p-3">{c.title}</td>
                        <td className="p-3 text-xs text-slate-500">{c.start_date} - {c.end_date}</td>
                        <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.its_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.its_active ? 'Active' : 'Expired'}</span></td>
                        <td className="p-3 text-right flex justify-end gap-2">
                          <button onClick={() => { setEditingContract(c); setShowContractModal(true); }} className="text-slate-400 hover:text-blue-500"><Edit2 size={14}/></button>
                          <button onClick={() => openConfirm('Delete Contract', 'Delete this contract?', () => deleteContract(c.id))} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             </div>
          )}

          {activeTab === 'databases' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center"><h3 className="font-bold text-lg">1C Databases</h3><button onClick={() => { setEditingDb(null); setShowDbModal(true); }} className="btn-primary text-sm"><Plus size={16} /> Add Database</button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientDbs.map(db => (
                  <div key={db.id} className="border border-slate-200 p-4 rounded-xl flex flex-col relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2">
                        <button onClick={() => { setEditingDb(db); setShowDbModal(true); }} className="text-slate-400 hover:text-blue-500"><Edit2 size={14}/></button>
                        <button onClick={() => openConfirm('Delete Database', 'Delete this database?', () => deleteDatabase(db.id))} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <DbIcon size={16} className="text-purple-500" />
                        <span className="font-bold text-slate-800">{db.name}</span>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold uppercase text-slate-500">{db.work_mode}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-3">
                        <p>Config: <span className="text-blue-600">{configs.find(c => c.id === db.config_id)?.name}</span></p>
                        <p>Reg Num: {db.reg_number}</p>
                    </div>
                    <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between items-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${db.its_supported ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{db.its_supported ? 'ITS OK' : 'No ITS'}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                             <Shield size={10}/> {db.db_admin || 'N/A'}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg">Task History</h3>
                      <button onClick={() => setShowTaskModal(true)} className="btn-primary text-sm"><Plus size={16}/> New Task</button>
                  </div>
                  <div className="space-y-2">
                      {clientTasks.map(task => (
                          <div 
                            key={task.id} 
                            onClick={() => setSelectedTask(task)}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-300 cursor-pointer transition"
                          >
                              <div className="flex items-center gap-4">
                                  <div className={`p-2 rounded-lg ${task.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                      {task.status === 'done' ? <CheckCircle size={18}/> : <Clock size={18}/>}
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-[10px] font-mono font-bold text-slate-400">#{task.task_no}</span>
                                          <div className="font-bold text-slate-800 text-sm">{task.title}</div>
                                      </div>
                                      <div className="text-[10px] text-slate-400 uppercase font-bold">{task.type} • {task.status}</div>
                                  </div>
                              </div>
                              {task.completion_rating && <StarRating rating={task.completion_rating} size={12} />}
                          </div>
                      ))}
                      {clientTasks.length === 0 && <div className="text-center py-10 text-slate-400">No tasks recorded for this client.</div>}
                  </div>
              </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><History size={18}/> History Log</h3>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50"><tr><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Action</th><th className="p-3">Details</th></tr></thead>
                        <tbody className="divide-y">
                            {clientLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="p-3 text-slate-400 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="p-3 font-medium">{log.user_name}</td>
                                    <td className="p-3 uppercase text-[10px] font-bold">{log.action}</td>
                                    <td className="p-3 text-slate-500">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Legal Info</h4>
                    <div className="space-y-4">
                        <div><label className="label">Full Name</label><p className="text-slate-800">{client.full_name}</p></div>
                        <div><label className="label">BIN</label><p className="text-slate-800">{client.bin || 'Not specified'}</p></div>
                        <div><label className="label">Legal Address</label><p className="text-slate-800">{client.legal_address}</p></div>
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Service Context</h4>
                    <div className="space-y-4">
                        <div><label className="label">Activity Sphere</label><p className="text-slate-800">{sphere?.name}</p></div>
                        <div><label className="label">Lead Source</label><p className="text-slate-800">{source?.name}</p></div>
                        <div>
                            <label className="label">Tags</label>
                            <div className="flex gap-2">
                                {client.tags?.map(t => <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs border border-blue-100">{t}</span>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Edit Client</h2>
              <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleClientSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Short Name</label><input required className="input" value={clientForm.short_name || ''} onChange={e => setClientForm({...clientForm, short_name: e.target.value})} /></div>
                <div><label className="label">BIN</label><input className="input" value={clientForm.bin || ''} onChange={e => setClientForm({...clientForm, bin: e.target.value})} /></div>
              </div>
              <div><label className="label">Full Name</label><input required className="input" value={clientForm.full_name || ''} onChange={e => setClientForm({...clientForm, full_name: e.target.value})} /></div>
              
              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <label className="label">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {clientForm.tags?.map(t => (
                        <span key={t} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm flex items-center border border-blue-100">
                            {t}
                            <button type="button" onClick={() => handleRemoveTag(t)} className="ml-2 text-blue-400 hover:text-red-500"><X size={14} /></button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input className="input flex-1" placeholder="Type tag and press Enter..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag(e)}/>
                    <button type="button" onClick={handleAddTag} className="btn-secondary"><Plus size={18}/></button>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowClientModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Save size={18} /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
             <h3 className="text-lg font-bold mb-4">{editingContact ? 'Edit Contact' : 'New Contact'}</h3>
             <form onSubmit={(e) => {
                 e.preventDefault();
                 if(editingContact) updateContact(editingContact.id, contactForm);
                 else addContact({...contactForm, client_id: client.id} as Contact);
                 setShowContactModal(false);
             }} className="space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 <input className="input" placeholder="First Name" required value={contactForm.first_name || ''} onChange={e => setContactForm({...contactForm, first_name: e.target.value})} />
                 <input className="input" placeholder="Last Name" value={contactForm.last_name || ''} onChange={e => setContactForm({...contactForm, last_name: e.target.value})} />
               </div>
               <input className="input" placeholder="Position" value={contactForm.position || ''} onChange={e => setContactForm({...contactForm, position: e.target.value})} />
               <div className="grid grid-cols-2 gap-3">
                 <input className="input" placeholder="Phone" required value={contactForm.phone || ''} onChange={e => setContactForm({...contactForm, phone: e.target.value})} />
                 <input className="input" placeholder="Email" required type="email" value={contactForm.email || ''} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
               </div>
               <div className="flex justify-end gap-2 mt-4">
                 <button type="button" onClick={() => setShowContactModal(false)} className="btn-secondary">Cancel</button>
                 <button type="submit" className="btn-primary">{editingContact ? 'Save Changes' : 'Create'}</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {showContractModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">{editingContract ? 'Edit Contract' : 'New Contract'}</h3>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  if(editingContract) updateContract(editingContract.id, contractForm);
                  else addContract({...contractForm, client_id: client.id} as Contract);
                  setShowContractModal(false);
              }} className="space-y-3">
                <input className="input" placeholder="Title" required value={contractForm.title || ''} onChange={e => setContractForm({...contractForm, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                   <input className="input" placeholder="Contract Number" required value={contractForm.contract_number || ''} onChange={e => setContractForm({...contractForm, contract_number: e.target.value})} />
                   <select className="input" required value={contractForm.organization_id || ''} onChange={e => setContractForm({...contractForm, organization_id: e.target.value})}>
                     <option value="">Select Vendor...</option>
                     {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div><label className="label">Start</label><input type="date" className="input" required value={contractForm.start_date || ''} onChange={e => setContractForm({...contractForm, start_date: e.target.value})} /></div>
                   <div><label className="label">End</label><input type="date" className="input" required value={contractForm.end_date || ''} onChange={e => setContractForm({...contractForm, end_date: e.target.value})} /></div>
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" checked={contractForm.its_active || false} onChange={e => setContractForm({...contractForm, its_active: e.target.checked})} />
                   <span className="text-sm">ITS Active</span>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowContractModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingContract ? 'Save Changes' : 'Create'}</button>
                </div>
              </form>
           </div>
         </div>
      )}

      {/* DB Modal */}
      {showDbModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">{editingDb ? 'Edit Database' : 'New Database'}</h3>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  if(editingDb) updateDatabase(editingDb.id, dbForm);
                  else addDatabase({...dbForm, client_id: client.id} as Database1C);
                  setShowDbModal(false);
              }} className="space-y-3">
                <input className="input" placeholder="DB Name" required value={dbForm.name || ''} onChange={e => setDbForm({...dbForm, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <select className="input" required value={dbForm.config_id || ''} onChange={e => setDbForm({...dbForm, config_id: e.target.value})}>
                     <option value="">Configuration...</option>
                     {configs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input className="input" placeholder="Reg Number" value={dbForm.reg_number || ''} onChange={e => setDbForm({...dbForm, reg_number: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select className="input" value={dbForm.work_mode || 'file'} onChange={e => setDbForm({...dbForm, work_mode: e.target.value as any})}>
                     <option value="file">File Mode</option><option value="server">Server Mode</option>
                  </select>
                  <input className="input" placeholder="Admin Login" value={dbForm.db_admin || ''} onChange={e => setDbForm({...dbForm, db_admin: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowDbModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingDb ? 'Save Changes' : 'Create'}</button>
                </div>
              </form>
           </div>
         </div>
      )}

      <ConfirmModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
      />

      {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} />}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </div>
  );
};

export default ClientDetailPage;
