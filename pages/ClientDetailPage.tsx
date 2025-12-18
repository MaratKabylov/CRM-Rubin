import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Phone, Mail, MapPin, Tag, Briefcase, Database, FileText, UserPlus, Trash2, Edit2, Shield, Key, History, Save, X, Plus } from 'lucide-react';
import { Contact, Contract, Database1C, Client } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import StarRating from '../components/StarRating';

type Tab = 'contacts' | 'contracts' | 'databases' | 'history' | 'info';

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    clients, contacts, contracts, databases, historyLogs,
    spheres, sources, users, orgs, configs, versions,
    addContact, updateContact, deleteContact, 
    addContract, updateContract, deleteContract, 
    addDatabase, updateDatabase, deleteDatabase, 
    updateClient, deleteClient 
  } = useData();

  const [activeTab, setActiveTab] = useState<Tab>('contacts');
  
  // Modals state
  const [showClientModal, setShowClientModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);
  
  // Confirmation Modal State
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({
      isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
      setConfirmState({ isOpen: true, title, message, onConfirm });
  };

  // Selection state for editing (null = create new)
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editingDb, setEditingDb] = useState<Database1C | null>(null);

  // Forms state
  const [clientForm, setClientForm] = useState<Partial<Client>>({});
  const [contactForm, setContactForm] = useState<Partial<Contact>>({});
  const [contractForm, setContractForm] = useState<Partial<Contract>>({});
  const [dbForm, setDbForm] = useState<Partial<Database1C>>({});
  const [tagInput, setTagInput] = useState('');

  const client = clients.find(c => c.id === id);

  // Initialize client edit form when modal opens
  useEffect(() => {
      if (client && showClientModal) {
          setClientForm({...client});
      }
  }, [showClientModal, client]);

  // Initialize child forms when edit object is selected or modal opens for create
  useEffect(() => {
      if (editingContact) setContactForm(editingContact);
      else setContactForm({ rating: 0 });
  }, [editingContact, showContactModal]);

  useEffect(() => {
      if (editingContract) setContractForm(editingContract);
      else setContractForm({ its_active: true, is_signed: false });
  }, [editingContract, showContractModal]);

  useEffect(() => {
      if (editingDb) setDbForm(editingDb);
      else setDbForm({ state: 'full_support', work_mode: 'file', its_supported: true });
  }, [editingDb, showDbModal]);


  if (!client) return <div>Client not found</div>;

  const clientContacts = contacts.filter(c => c.client_id === client.id);
  const clientContracts = contracts.filter(c => c.client_id === client.id);
  const clientDbs = databases.filter(d => d.client_id === client.id);
  const clientLogs = historyLogs.filter(h => h.parent_client_id === client.id);

  const owner = users.find(u => u.id === client.owner_id);
  const sphere = spheres.find(s => s.id === client.activity_id);
  const source = sources.find(s => s.id === client.source_id);

  // --- Handlers ---

  const handleClientSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateClient(client.id, clientForm);
      setShowClientModal(false);
  };

  const handleAddTag = (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      const val = tagInput.trim();
      if (!val) return;
      const currentTags = clientForm.tags || [];
      if (!currentTags.includes(val)) {
          setClientForm({ ...clientForm, tags: [...currentTags, val] });
      }
      setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
      const currentTags = clientForm.tags || [];
      setClientForm({ ...clientForm, tags: currentTags.filter(t => t !== tag) });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
        updateContact(editingContact.id, contactForm);
    } else {
        addContact({ ...contactForm, client_id: client.id } as Contact);
    }
    setShowContactModal(false);
    setEditingContact(null);
  };

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContract) {
        updateContract(editingContract.id, contractForm);
    } else {
        addContract({ ...contractForm, client_id: client.id } as Contract);
    }
    setShowContractModal(false);
    setEditingContract(null);
  };

  const handleDbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDb) {
        updateDatabase(editingDb.id, dbForm);
    } else {
        addDatabase({ ...dbForm, client_id: client.id } as Database1C);
    }
    setShowDbModal(false);
    setEditingDb(null);
  };

  const handleDeleteClient = () => {
    openConfirm(
        'Delete Client', 
        'Are you sure you want to delete this client? All associated contacts, contracts, and databases will be removed permanently.',
        () => {
             deleteClient(client.id);
             navigate('/clients');
        }
    );
  };

  const formatState = (state: string) => {
      return state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-800">{client.short_name}</h1>
              <button 
                onClick={() => setShowClientModal(true)}
                className="text-slate-400 hover:text-blue-600 transition"
                title="Edit Client"
              >
                  <Edit2 size={18} />
              </button>
              {client.is_gov && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-bold">GOV</span>}
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">{sphere?.name}</span>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
                 <StarRating rating={client.rating || 0} size={18} />
                 <span className="text-sm text-slate-400">({client.rating || 0}/5)</span>
            </div>

            <p className="text-slate-500 mb-4">{client.full_name}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-blue-500" /> <span>{client.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-green-500" /> <span>{client.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-red-500" /> <span>{client.actual_address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase size={16} className="text-purple-500" /> <span>BIN: {client.bin}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="text-right text-sm text-slate-500">
              <p>Manager:</p>
              <p className="font-semibold text-slate-800">{owner?.name}</p>
            </div>
            <button onClick={handleDeleteClient} className="text-red-500 hover:text-red-700 text-sm flex items-center justify-end space-x-1 mt-4">
              <Trash2 size={16} /> <span>Delete Client</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit mb-4">
          {(['contacts', 'contracts', 'databases', 'history', 'info'] as Tab[]).map(tab => (
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

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px] p-6">
          
          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Contacts List</h3>
                <button onClick={() => { setEditingContact(null); setShowContactModal(true); }} className="btn-primary flex items-center space-x-2">
                  <UserPlus size={16} /> <span>Create Contact</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientContacts.map(c => (
                  <div key={c.id} className="border border-slate-200 p-4 rounded-lg hover:border-blue-300 transition relative group">
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                         <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="text-slate-300 hover:text-blue-500"><Edit2 size={16}/></button>
                         <button 
                            onClick={() => openConfirm('Delete Contact', 'Are you sure you want to delete this contact?', () => deleteContact(c.id))} 
                            className="text-slate-300 hover:text-red-500"
                         >
                            <Trash2 size={16}/>
                        </button>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="font-bold text-slate-800">{c.first_name} {c.last_name}</div>
                            <div className="text-sm text-blue-600">{c.position}</div>
                        </div>
                        <StarRating rating={c.rating || 0} size={14} />
                    </div>
                    
                    <div className="text-xs space-y-1 text-slate-600">
                      <div>Phone: {c.phone}</div>
                      <div>Email: {c.email}</div>
                      {c.anydesk_id && <div>AnyDesk: {c.anydesk_id}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
             <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">Contracts</h3>
                <button onClick={() => { setEditingContract(null); setShowContractModal(true); }} className="btn-primary flex items-center space-x-2">
                  <FileText size={16} /> <span>Add Contract</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="p-3">Number</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Period</th>
                      <th className="p-3">Org</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientContracts.map(c => (
                      <tr key={c.id}>
                        <td className="p-3 font-medium">{c.contract_number}</td>
                        <td className="p-3">{c.title}</td>
                        <td className="p-3 text-xs">{c.start_date} - {c.end_date}</td>
                        <td className="p-3 text-xs">{orgs.find(o => o.id === c.organization_id)?.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${c.its_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                            {c.its_active ? 'Active' : 'Expired'}
                          </span>
                        </td>
                         <td className="p-3 flex gap-2">
                           <button onClick={() => { setEditingContract(c); setShowContractModal(true); }} className="text-slate-400 hover:text-blue-600"><Edit2 size={14}/></button>
                           <button 
                                onClick={() => openConfirm('Delete Contract', 'Are you sure you want to delete this contract?', () => deleteContract(c.id))} 
                                className="text-slate-400 hover:text-red-600"
                           >
                                <Trash2 size={14}/>
                           </button>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
             </div>
          )}

          {/* Databases Tab */}
          {activeTab === 'databases' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800">1C Databases</h3>
                <button onClick={() => { setEditingDb(null); setShowDbModal(true); }} className="btn-primary flex items-center space-x-2">
                  <Database size={16} /> <span>Add Database</span>
                </button>
              </div>
              <div className="space-y-3">
                {clientDbs.map(db => (
                  <div key={db.id} className="border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative group">
                    <div className="absolute top-2 right-2 flex flex-col gap-2 md:opacity-0 md:group-hover:opacity-100 transition z-10 bg-white shadow-sm p-1 rounded">
                         <button onClick={() => { setEditingDb(db); setShowDbModal(true); }} className="text-slate-400 hover:text-blue-500 p-1"><Edit2 size={16}/></button>
                         <button 
                            onClick={() => openConfirm('Delete Database', 'Are you sure you want to delete this database?', () => deleteDatabase(db.id))}
                            className="text-slate-400 hover:text-red-500 p-1"
                         >
                            <Trash2 size={16}/>
                         </button>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold text-slate-700">{db.name}</h4>
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-normal text-slate-500 uppercase border border-slate-200">{db.work_mode}</span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>Reg: <span className="font-mono text-slate-700">{db.reg_number}</span></p>
                        <p>
                           Conf: <span className="text-blue-600">{configs.find(c => c.id === db.config_id)?.name}</span> 
                           {db.version_id && <span className="ml-1 text-slate-400">({versions.find(v => v.id === db.version_id)?.release})</span>}
                        </p>
                        <p className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${db.state === 'full_support' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            <span>{formatState(db.state)}</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* Credentials Block */}
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 text-xs text-slate-600 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield size={12} className="text-slate-400"/>
                            <span>Admin: </span>
                            <span className="font-mono select-all">{db.db_admin || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Key size={12} className="text-slate-400"/>
                            <span>Pass: </span>
                            <span className="font-mono select-all bg-white px-1 rounded">{db.db_password || '-'}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                       <span className={`text-xs px-2 py-1 rounded font-medium ${db.its_supported ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                           {db.its_supported ? 'ITS Supported' : 'No ITS'}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

           {/* History Tab */}
           {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <History className="text-slate-400"/> Change History
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 font-medium">
                       <tr>
                           <th className="p-3">Date</th>
                           <th className="p-3">User</th>
                           <th className="p-3">Action</th>
                           <th className="p-3">Details</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                       {clientLogs.map(log => (
                           <tr key={log.id} className="hover:bg-slate-50">
                               <td className="p-3 text-slate-500 whitespace-nowrap">
                                   {new Date(log.timestamp).toLocaleString()}
                               </td>
                               <td className="p-3 font-medium text-slate-700">{log.user_name}</td>
                               <td className="p-3">
                                   <span className={`px-2 py-1 rounded text-xs uppercase font-bold 
                                       ${log.action === 'create' ? 'bg-green-100 text-green-700' : 
                                         log.action === 'delete' ? 'bg-red-100 text-red-700' : 
                                         'bg-blue-100 text-blue-700'}`}>
                                       {log.action}
                                   </span>
                                   <span className="ml-2 text-xs text-slate-400 capitalize">({log.entity_type})</span>
                               </td>
                               <td className="p-3 text-slate-600 max-w-md break-words">{log.details}</td>
                           </tr>
                       ))}
                       {clientLogs.length === 0 && (
                           <tr><td colSpan={4} className="p-6 text-center text-slate-400 italic">No history recorded yet.</td></tr>
                       )}
                   </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-4 text-sm">
               <div className="grid grid-cols-2 gap-6">
                 <div>
                   <label className="text-slate-500 block mb-1">Legal Address</label>
                   <p className="p-2 bg-slate-50 rounded border border-slate-100">{client.legal_address}</p>
                 </div>
                 <div>
                   <label className="text-slate-500 block mb-1">Source</label>
                   <p className="p-2 bg-slate-50 rounded border border-slate-100">{source?.name}</p>
                 </div>
                 <div>
                   <label className="text-slate-500 block mb-1">Tags</label>
                   <div className="flex gap-2">
                     {client.tags?.map(t => <span key={t} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">{t}</span>)}
                   </div>
                 </div>
               </div>
            </div>
          )}

        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
      />

      {/* Client Edit Modal */}
      {showClientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Edit Client</h2>
              <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleClientSubmit} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                  <div className="flex-1 mr-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="label">Short Name</label>
                        <input required className="input" value={clientForm.short_name || ''} onChange={e => setClientForm({...clientForm, short_name: e.target.value})} />
                        </div>
                        <div>
                        <label className="label">BIN</label>
                        <input className="input" value={clientForm.bin || ''} onChange={e => setClientForm({...clientForm, bin: e.target.value})} />
                        </div>
                    </div>
                  </div>
                  <div>
                      <label className="label">Rating</label>
                      <StarRating 
                        rating={clientForm.rating || 0} 
                        size={24} 
                        editable 
                        onRatingChange={(r) => setClientForm({...clientForm, rating: r})}
                      />
                  </div>
              </div>

              <div>
                <label className="label">Full Name</label>
                <input required className="input" value={clientForm.full_name || ''} onChange={e => setClientForm({...clientForm, full_name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="label">Sphere</label>
                   <select className="input" required value={clientForm.activity_id || ''} onChange={e => setClientForm({...clientForm, activity_id: e.target.value})}>
                     <option value="">Select...</option>
                     {spheres.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="label">Source</label>
                   <select className="input" required value={clientForm.source_id || ''} onChange={e => setClientForm({...clientForm, source_id: e.target.value})}>
                     <option value="">Select...</option>
                     {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" value={clientForm.email || ''} onChange={e => setClientForm({...clientForm, email: e.target.value})} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={clientForm.phone || ''} onChange={e => setClientForm({...clientForm, phone: e.target.value})} />
                </div>
              </div>
              <div>
                  <label className="label">Legal Address</label>
                  <input className="input" value={clientForm.legal_address || ''} onChange={e => setClientForm({...clientForm, legal_address: e.target.value})} />
              </div>
              <div>
                  <label className="label">Actual Address</label>
                  <input className="input" value={clientForm.actual_address || ''} onChange={e => setClientForm({...clientForm, actual_address: e.target.value})} />
              </div>
              <div>
                <label className="label">Owner</label>
                <select required className="input" value={clientForm.owner_id || ''} onChange={e => setClientForm({...clientForm, owner_id: e.target.value})}>
                  <option value="">Select Manager...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              {/* Tags Section */}
              <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                <label className="label">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {clientForm.tags?.map(t => (
                        <span key={t} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm flex items-center border border-blue-100">
                            {t}
                            <button 
                                type="button" 
                                onClick={() => handleRemoveTag(t)}
                                className="ml-2 text-blue-400 hover:text-red-500 focus:outline-none flex items-center"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input 
                        className="input flex-1" 
                        placeholder="Type tag and press Enter..." 
                        value={tagInput} 
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddTag(e)}
                    />
                    <button type="button" onClick={handleAddTag} className="btn-secondary"><Plus size={18}/></button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                 <input type="checkbox" checked={clientForm.is_gov || false} onChange={e => setClientForm({...clientForm, is_gov: e.target.checked})} />
                 <span className="text-sm text-slate-700">Is Government Organization?</span>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowClientModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="btn-primary">
                    <Save size={18} /> Save Changes
                </button>
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
             <form onSubmit={handleContactSubmit} className="space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 <input className="input" placeholder="First Name" required value={contactForm.first_name || ''} onChange={e => setContactForm({...contactForm, first_name: e.target.value})} />
                 <input className="input" placeholder="Last Name" value={contactForm.last_name || ''} onChange={e => setContactForm({...contactForm, last_name: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <input className="input" placeholder="Position" value={contactForm.position || ''} onChange={e => setContactForm({...contactForm, position: e.target.value})} />
                 <div className="flex items-center gap-2">
                    <label className="label whitespace-nowrap mb-0 mr-2">Rating:</label>
                    <StarRating 
                        rating={contactForm.rating || 0} 
                        size={20} 
                        editable 
                        onRatingChange={(r) => setContactForm({...contactForm, rating: r})}
                    />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 <input className="input" placeholder="Phone" required value={contactForm.phone || ''} onChange={e => setContactForm({...contactForm, phone: e.target.value})} />
                 <input className="input" placeholder="Email" required type="email" value={contactForm.email || ''} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
               </div>
               <h4 className="text-xs font-bold text-slate-500 mt-2 uppercase">Remote Access</h4>
               <div className="grid grid-cols-2 gap-3">
                  <input className="input" placeholder="AnyDesk ID" value={contactForm.anydesk_id || ''} onChange={e => setContactForm({...contactForm, anydesk_id: e.target.value})} />
                  <input className="input" placeholder="Password" value={contactForm.anydesk_password || ''} onChange={e => setContactForm({...contactForm, anydesk_password: e.target.value})} />
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
              <form onSubmit={handleContractSubmit} className="space-y-3">
                <input className="input" placeholder="Title" required value={contractForm.title || ''} onChange={e => setContractForm({...contractForm, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                   <input className="input" placeholder="Contract Number" required value={contractForm.contract_number || ''} onChange={e => setContractForm({...contractForm, contract_number: e.target.value})} />
                   <select className="input" required value={contractForm.organization_id || ''} onChange={e => setContractForm({...contractForm, organization_id: e.target.value})}>
                     <option value="">Select Vendor...</option>
                     {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-xs text-slate-500">Start Date</label>
                     <input type="date" className="input" required value={contractForm.start_date || ''} onChange={e => setContractForm({...contractForm, start_date: e.target.value})} />
                   </div>
                   <div>
                     <label className="text-xs text-slate-500">End Date</label>
                     <input type="date" className="input" required value={contractForm.end_date || ''} onChange={e => setContractForm({...contractForm, end_date: e.target.value})} />
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" checked={contractForm.its_active || false} onChange={e => setContractForm({...contractForm, its_active: e.target.checked})} />
                   <span className="text-sm">ITS Active</span>
                </div>
                 <h4 className="text-xs font-bold text-slate-500 mt-2 uppercase">ITS Details</h4>
                 <input className="input" placeholder="ITS Login" value={contractForm.its_login || ''} onChange={e => setContractForm({...contractForm, its_login: e.target.value})} />
                 <input className="input" placeholder="ITS Password" value={contractForm.its_password || ''} onChange={e => setContractForm({...contractForm, its_password: e.target.value})} />
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
              <form onSubmit={handleDbSubmit} className="space-y-3">
                <input className="input" placeholder="DB Name" required value={dbForm.name || ''} onChange={e => setDbForm({...dbForm, name: e.target.value})} />
                <input className="input" placeholder="Reg Number" value={dbForm.reg_number || ''} onChange={e => setDbForm({...dbForm, reg_number: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-3">
                  <select className="input" required value={dbForm.config_id || ''} onChange={e => setDbForm({...dbForm, config_id: e.target.value})}>
                     <option value="">Configuration...</option>
                     {configs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                   <select 
                      className="input" 
                      disabled={!dbForm.config_id}
                      value={dbForm.version_id || ''}
                      onChange={e => setDbForm({...dbForm, version_id: e.target.value})}
                   >
                     <option value="">Select Version...</option>
                     {versions
                        .filter(v => v.config_id === dbForm.config_id)
                        .map(v => <option key={v.id} value={v.id}>{v.release}</option>)
                     }
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select className="input" value={dbForm.work_mode || 'file'} onChange={e => setDbForm({...dbForm, work_mode: e.target.value as any})}>
                     <option value="file">File Mode</option>
                     <option value="server">Server Mode</option>
                  </select>
                  <select className="input" value={dbForm.state || 'full_support'} onChange={e => setDbForm({...dbForm, state: e.target.value as any})}>
                     <option value="full_support">Full Support</option>
                     <option value="full_support_with_extensions">Full Support + Ext</option>
                     <option value="minor_change">Minor Changes</option>
                     <option value="major_change">Major Changes</option>
                     <option value="custom_solution">Custom Solution</option>
                  </select>
                </div>

                <h4 className="text-xs font-bold text-slate-500 mt-2 uppercase">DB Credentials</h4>
                <div className="grid grid-cols-2 gap-3">
                   <input className="input" placeholder="DB Admin Login" value={dbForm.db_admin || ''} onChange={e => setDbForm({...dbForm, db_admin: e.target.value})} />
                   <input className="input" placeholder="DB Password" value={dbForm.db_password || ''} onChange={e => setDbForm({...dbForm, db_password: e.target.value})} />
                </div>

                <div className="flex items-center gap-2 mt-2">
                   <input type="checkbox" checked={dbForm.its_supported || false} onChange={e => setDbForm({...dbForm, its_supported: e.target.checked})} />
                   <span className="text-sm">ITS Support Enabled</span>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowDbModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingDb ? 'Save Changes' : 'Create'}</button>
                </div>
              </form>
           </div>
         </div>
      )}

    </div>
  );
};

export default ClientDetailPage;