
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { 
  Phone, Mail, MapPin, Briefcase, Database as DbIcon, 
  FileText, UserPlus, Trash2, Edit2, Shield, Key, 
  History, Save, X, Plus, ClipboardList, Clock, CheckCircle, Activity, Globe, Tag as TagIcon,
  FileCheck, Lock, Info, Timer, User, Fingerprint
} from 'lucide-react';
import { Contact, Contract, Database1C, Client, Task, DbState } from '../types';
import ConfirmModal from '../components/ConfirmModal';
import StarRating from '../components/StarRating';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

type Tab = 'contacts' | 'contracts' | 'databases' | 'tasks' | 'history' | 'info';

const TAB_LABELS: Record<Tab, string> = {
  contacts: 'Контакты',
  contracts: 'Договоры',
  databases: 'Базы 1С',
  tasks: 'Задачи',
  history: 'История',
  info: 'Инфо'
};

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
      else setContactForm({ client_id: id, rating: 0 });
    }
  }, [editingContact, showContactModal, id]);

  useEffect(() => {
    if (showContractModal) {
      if (editingContract) setContractForm(editingContract);
      else setContractForm({ 
        client_id: id, 
        its_active: true, 
        its_ours: true, 
        is_signed: false, 
        minutes_included: 0,
        start_date: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingContract, showContractModal, id]);

  useEffect(() => {
    if (showDbModal) {
      if (editingDb) setDbForm(editingDb);
      else setDbForm({ client_id: id, state: 'full_support', work_mode: 'file', its_supported: true });
    }
  }, [editingDb, showDbModal, id]);

  if (!client) return <div className="p-8 text-center text-slate-500">Клиент не найден</div>;

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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      updateContact(editingContact.id, contactForm);
    } else {
      addContact(contactForm as Omit<Contact, 'id'>);
    }
    setShowContactModal(false);
  };

  const handleContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContract) {
      updateContract(editingContract.id, contractForm);
    } else {
      addContract(contractForm as Omit<Contract, 'id'>);
    }
    setShowContractModal(false);
  };

  const handleDbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDb) {
      updateDatabase(editingDb.id, dbForm);
    } else {
      addDatabase(dbForm as Omit<Database1C, 'id'>);
    }
    setShowDbModal(false);
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

  const isActiveDate = (dateString?: string) => {
      if (!dateString) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(dateString);
      return target >= today;
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="w-full md:w-auto">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 break-words">{client.short_name}</h1>
              <button onClick={() => setShowClientModal(true)} className="text-slate-400 hover:text-blue-600 transition p-1"><Edit2 size={18} /></button>
              {client.bin && (
                <span className="bg-slate-50 text-slate-500 text-[10px] md:text-xs px-2 py-0.5 rounded font-mono border border-slate-200 flex items-center gap-1.5 shadow-sm">
                   <Fingerprint size={12} className="text-slate-400" />
                   БИН: {client.bin}
                </span>
              )}
              {client.is_gov && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold">ГОС</span>}
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
                 <StarRating rating={stats.avgRating} size={16} />
                 <span className="text-sm font-bold text-slate-700">{stats.avgRating}</span>
                 <span className="text-[10px] text-slate-400">({stats.taskCount} оцененных задач)</span>
            </div>

            <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:flex-wrap md:gap-4 text-xs md:text-sm text-slate-600">
              <div className="flex items-center space-x-2"><Mail size={14} className="text-blue-500" /> <span className="truncate">{client.email}</span></div>
              <div className="flex items-center space-x-2"><Phone size={14} className="text-green-500" /> <span>{client.phone}</span></div>
              <div className="flex items-center space-x-2"><MapPin size={14} className="text-red-500" /> <span className="truncate">{client.actual_address}</span></div>
            </div>
          </div>
          <div className="w-full md:w-auto md:text-right border-t md:border-t-0 pt-4 md:pt-0">
             <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Куратор</p>
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
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-[11px] md:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {TAB_LABELS[tab] || tab}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px] p-4 md:p-6 w-full">
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h3 className="font-bold text-lg">Контактные лица</h3>
                <button onClick={() => { setEditingContact(null); setShowContactModal(true); }} className="btn-primary text-xs md:text-sm w-full sm:w-auto"><Plus size={16} /> Добавить контакт</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {clientContacts.map(c => {
                  const contactRating = getContactAvgRating(c.id);
                  return (
                    <div key={c.id} className="border border-slate-200 p-4 rounded-xl flex justify-between items-start group relative bg-slate-50/30">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2">
                          <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="text-slate-400 hover:text-blue-500 p-1"><Edit2 size={14}/></button>
                          <button onClick={() => openConfirm('Удалить контакт', 'Вы уверены?', () => deleteContact(c.id))} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
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
                <h3 className="font-bold text-lg">Договоры</h3>
                <button onClick={() => { setEditingContract(null); setShowContractModal(true); }} className="btn-primary text-xs md:text-sm w-full sm:w-auto"><Plus size={16} /> Новый договор</button>
              </div>
              <div className="overflow-x-auto border border-slate-100 rounded-lg shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    <tr>
                      <th className="p-3">Организация</th>
                      <th className="p-3">№</th>
                      <th className="p-3">Заголовок</th>
                      <th className="p-3">Период</th>
                      <th className="p-3 text-center">Подписан</th>
                      <th className="p-3 text-center">Статус</th>
                      <th className="p-3 text-center">ИТС</th>
                      <th className="p-3 text-center">ИТС Статус</th>
                      <th className="p-3 text-center">Минуты</th>
                      <th className="p-3">Доступы ИТС</th>
                      <th className="p-3">Коммент</th>
                      <th className="p-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientContracts.map(c => {
                      const contractActive = isActiveDate(c.end_date);
                      const itsActive = isActiveDate(c.its_expiration_date);
                      const orgName = orgs.find(o => o.id === c.organization_id)?.name || '—';
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-medium text-slate-700 whitespace-nowrap">{orgName}</td>
                          <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{c.contract_number}</td>
                          <td className="p-3 font-semibold text-slate-800 truncate max-w-[150px]">{c.title}</td>
                          <td className="p-3 text-slate-500 whitespace-nowrap">
                            <div className="flex flex-col text-[10px]">
                              <span>с {c.start_date}</span>
                              <span>по {c.end_date}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {c.is_signed ? (
                              <div className="flex justify-center text-green-500" title="Подписан"><FileCheck size={16} /></div>
                            ) : (
                              <div className="flex justify-center text-slate-300" title="Не подписан"><FileText size={16} /></div>
                            )}
                          </td>
                          <td className="p-3 text-center">
                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap ${contractActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {contractActive ? 'Активен' : 'Истек'}
                             </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap ${c.its_ours ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                              {c.its_ours ? 'Наш' : 'Чужой'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap ${itsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {itsActive ? 'Активен' : 'Истек'}
                             </span>
                             {c.its_expiration_date && <div className="text-[9px] text-slate-400 mt-1">до {c.its_expiration_date}</div>}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700">{c.minutes_included}</td>
                          <td className="p-3 whitespace-nowrap">
                            {c.its_login ? (
                              <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-1 text-[10px]"><User size={10} className="text-slate-400"/> {c.its_login}</span>
                                <span className="flex items-center gap-1 text-[10px]"><Lock size={10} className="text-slate-400"/> {c.its_password}</span>
                              </div>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="p-3 italic text-slate-400 max-w-[150px] truncate" title={c.comment}>{c.comment || '—'}</td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => { setEditingContract(c); setShowContractModal(true); }} className="text-slate-400 hover:text-blue-500 p-1"><Edit2 size={14}/></button>
                              <button onClick={() => openConfirm('Удалить договор', 'Вы уверены?', () => deleteContract(c.id))} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
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
                <h3 className="font-bold text-lg">Базы 1С</h3>
                <button onClick={() => { setEditingDb(null); setShowDbModal(true); }} className="btn-primary text-xs md:text-sm w-full sm:w-auto"><Plus size={16} /> Добавить базу</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {clientDbs.map(db => {
                  const stateInfo = DB_STATE_LABELS[db.state || 'full_support'];
                  return (
                    <div key={db.id} className="border border-slate-200 p-4 rounded-xl flex flex-col relative group hover:border-purple-200 transition bg-slate-50/30">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2">
                          <button onClick={() => { setEditingDb(db); setShowDbModal(true); }} className="text-slate-400 hover:text-blue-500 p-1"><Edit2 size={14}/></button>
                          <button onClick={() => openConfirm('Удалить базу', 'Вы уверены?', () => deleteDatabase(db.id))} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                      </div>
                      <div className="flex items-center gap-2 mb-2 min-w-0">
                          <DbIcon size={14} className="text-purple-500 flex-shrink-0" />
                          <span className="font-bold text-slate-800 text-sm truncate">{db.name}</span>
                          <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-bold uppercase text-slate-500 flex-shrink-0">{db.work_mode === 'file' ? 'Файл' : 'Сервер'}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 space-y-1 mb-3 flex-1">
                          <p className="truncate">Конфиг: <span className="text-blue-600 font-medium">{configs.find(c => c.id === db.config_id)?.name}</span></p>
                          <p>Рег. номер: <span className="text-slate-700">{db.reg_number}</span></p>
                          <div className="flex items-center gap-1.5 pt-1">
                             <Activity size={10} className="text-slate-400 flex-shrink-0"/>
                             <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tighter ${stateInfo.color} truncate`}>
                               {stateInfo.label}
                             </span>
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
              <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <h3 className="font-bold text-lg text-slate-800">История задач</h3>
                      <button onClick={() => setShowTaskModal(true)} className="btn-primary text-xs md:text-sm w-full sm:w-auto"><Plus size={16}/> Новая задача</button>
                  </div>
                  <div className="space-y-2">
                      {clientTasks.map(task => (
                          <div 
                            key={task.id} 
                            onClick={() => setSelectedTask(task)}
                            className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-300 cursor-pointer transition"
                          >
                              <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                                  <div className={`p-2 rounded-lg flex-shrink-0 ${task.status.toLowerCase().includes('закрыт') || task.status.toLowerCase().includes('выполн') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                      {task.status.toLowerCase().includes('закрыт') ? <CheckCircle size={18}/> : <Clock size={18}/>}
                                  </div>
                                  <div className="min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-[9px] font-mono font-bold text-slate-400 flex-shrink-0">#{task.task_no}</span>
                                          <div className="font-bold text-slate-800 text-xs md:text-sm truncate">{task.title}</div>
                                      </div>
                                      <div className="text-[9px] text-slate-400 uppercase font-bold truncate">{task.type} • {task.status}</div>
                                  </div>
                              </div>
                          </div>
                      ))}
                      {clientTasks.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">Нет задач по этому клиенту.</div>}
                  </div>
              </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Журнал изменений</h3>
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-slate-100 pl-8">
                {clientLogs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-400 flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800">{log.user_name}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10}/> {new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-tight mb-1">{log.action} {log.entity_type}</p>
                        <p className="text-sm text-slate-600">{log.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {clientLogs.length === 0 && <p className="text-slate-400 italic py-10 text-center">История пуста.</p>}
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Globe size={18} className="text-blue-500"/> Общая информация</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Краткое название</label>
                      <p className="text-sm font-medium text-slate-800">{client.short_name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Полное название</label>
                      <p className="text-sm font-medium text-slate-800">{client.full_name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">БИН / ИИН</label>
                      <p className="text-sm font-mono text-slate-800">{client.bin || '—'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Сфера деятельности</label>
                      <p className="text-sm font-medium text-slate-800">{sphere?.name || 'Другое'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Источник</label>
                      <p className="text-sm font-medium text-slate-800">{source?.name || 'Прямой'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={18} className="text-red-500"/> Адреса</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Юридический адрес</label>
                    <p className="text-sm text-slate-700">{client.legal_address || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Фактический адрес</label>
                    <p className="text-sm text-slate-700">{client.actual_address || '—'}</p>
                  </div>
                </div>
              </div>

              {client.tags && client.tags.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><TagIcon size={18} className="text-slate-500"/> Теги</h3>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map(tag => (
                      <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODALS - Russian content for modals is handled in the same way, updated labels and placeholders */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-auto">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold text-slate-800">Редактировать клиента</h2>
              <button onClick={() => setShowClientModal(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>
            <form onSubmit={handleClientSubmit} className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Краткое название</label><input required className="input" value={clientForm.short_name || ''} onChange={e => setClientForm({...clientForm, short_name: e.target.value})} /></div>
                <div><label className="label">БИН / ИИН</label><input className="input" value={clientForm.bin || ''} onChange={e => setClientForm({...clientForm, bin: e.target.value})} /></div>
              </div>
              <div><label className="label">Полное название</label><input required className="input" value={clientForm.full_name || ''} onChange={e => setClientForm({...clientForm, full_name: e.target.value})} /></div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                   <label className="label">Сфера деятельности</label>
                   <select className="input" value={clientForm.activity_id} onChange={e => setClientForm({...clientForm, activity_id: e.target.value})}>
                     <option value="">Выберите...</option>
                     {spheres.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="label">Источник</label>
                   <select className="input" value={clientForm.source_id} onChange={e => setClientForm({...clientForm, source_id: e.target.value})}>
                     <option value="">Выберите...</option>
                     {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Юридический адрес</label><input className="input" value={clientForm.legal_address || ''} onChange={e => setClientForm({...clientForm, legal_address: e.target.value})} /></div>
                <div><label className="label">Фактический адрес</label><input className="input" value={clientForm.actual_address || ''} onChange={e => setClientForm({...clientForm, actual_address: e.target.value})} /></div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3">
                <button type="button" onClick={() => setShowClientModal(false)} className="btn-secondary w-full sm:w-auto order-2 sm:order-1">Отмена</button>
                <button type="submit" className="btn-primary w-full sm:w-auto order-1 sm:order-2"><Save size={18} /> Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingContact ? 'Редактировать контакт' : 'Новый контакт'}</h2>
              <button onClick={() => setShowContactModal(false)}>✕</button>
            </div>
            <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Имя</label><input required className="input" value={contactForm.first_name || ''} onChange={e => setContactForm({...contactForm, first_name: e.target.value})} /></div>
                <div><label className="label">Фамилия</label><input required className="input" value={contactForm.last_name || ''} onChange={e => setContactForm({...contactForm, last_name: e.target.value})} /></div>
              </div>
              <div><label className="label">Должность</label><input className="input" value={contactForm.position || ''} onChange={e => setContactForm({...contactForm, position: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Телефон</label><input className="input" value={contactForm.phone || ''} onChange={e => setContactForm({...contactForm, phone: e.target.value})} /></div>
                <div><label className="label">Email</label><input type="email" className="input" value={contactForm.email || ''} onChange={e => setContactForm({...contactForm, email: e.target.value})} /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowContactModal(false)} className="btn-secondary">Отмена</button>
                <button type="submit" className="btn-primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl my-auto">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold">{editingContract ? 'Редактировать договор' : 'Новый договор'}</h2>
              <button onClick={() => setShowContractModal(false)} className="p-2 text-slate-400">✕</button>
            </div>
            <form onSubmit={handleContractSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Наша организация</label>
                  <select required className="input" value={contractForm.organization_id} onChange={e => setContractForm({...contractForm, organization_id: e.target.value})}>
                    <option value="">Выберите...</option>
                    {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
                <div><label className="label">Номер договора</label><input required className="input" value={contractForm.contract_number || ''} onChange={e => setContractForm({...contractForm, contract_number: e.target.value})} /></div>
              </div>
              <div><label className="label">Наименование договора</label><input required className="input" value={contractForm.title || ''} onChange={e => setContractForm({...contractForm, title: e.target.value})} /></div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Дата начала</label><input type="date" required className="input" value={contractForm.start_date || ''} onChange={e => setContractForm({...contractForm, start_date: e.target.value})} /></div>
                <div><label className="label">Дата окончания</label><input type="date" required className="input" value={contractForm.end_date || ''} onChange={e => setContractForm({...contractForm, end_date: e.target.value})} /></div>
              </div>
              
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="label">Минут в месяц</label><input type="number" className="input" value={contractForm.minutes_included || 0} onChange={e => setContractForm({...contractForm, minutes_included: parseInt(e.target.value) || 0})} /></div>
                    <div><label className="label">Дата окончания ИТС</label><input type="date" className="input" value={contractForm.its_expiration_date || ''} onChange={e => setContractForm({...contractForm, its_expiration_date: e.target.value})} /></div>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="label">Логин ИТС</label><input className="input" value={contractForm.its_login || ''} onChange={e => setContractForm({...contractForm, its_login: e.target.value})} /></div>
                    <div><label className="label">Пароль ИТС</label><input className="input" value={contractForm.its_password || ''} onChange={e => setContractForm({...contractForm, its_password: e.target.value})} /></div>
                 </div>
              </div>

              <div><label className="label">Комментарий</label><textarea className="input h-20" value={contractForm.comment || ''} onChange={e => setContractForm({...contractForm, comment: e.target.value})} /></div>

              <div className="flex flex-wrap items-center gap-6 py-2 border-t pt-4">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded text-blue-600" checked={contractForm.is_signed} onChange={e => setContractForm({...contractForm, is_signed: e.target.checked})}/> Договор подписан</label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded text-blue-600" checked={contractForm.its_ours} onChange={e => setContractForm({...contractForm, its_ours: e.target.checked})}/> Наша подписка ИТС</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowContractModal(false)} className="btn-secondary">Отмена</button>
                <button type="submit" className="btn-primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingDb ? 'Редактировать базу' : 'Новая база'}</h2>
              <button onClick={() => setShowDbModal(false)}>✕</button>
            </div>
            <form onSubmit={handleDbSubmit} className="p-6 space-y-4">
              <div><label className="label">Название базы</label><input required className="input" value={dbForm.name || ''} onChange={e => setDbForm({...dbForm, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Рег. номер</label><input className="input" value={dbForm.reg_number || ''} onChange={e => setDbForm({...dbForm, reg_number: e.target.value})} /></div>
                <div>
                  <label className="label">Конфигурация</label>
                  <select required className="input" value={dbForm.config_id} onChange={e => setDbForm({...dbForm, config_id: e.target.value})}>
                    <option value="">Выберите...</option>
                    {configs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Режим работы</label>
                  <select className="input" value={dbForm.work_mode} onChange={e => setDbForm({...dbForm, work_mode: e.target.value as any})}>
                    <option value="file">Файловый</option>
                    <option value="server">Клиент-сервер</option>
                  </select>
                </div>
                <div>
                  <label className="label">Состояние</label>
                  <select className="input" value={dbForm.state} onChange={e => setDbForm({...dbForm, state: e.target.value as any})}>
                    {Object.entries(DB_STATE_LABELS).map(([val, {label}]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={dbForm.its_supported} onChange={e => setDbForm({...dbForm, its_supported: e.target.checked})}/> На ИТС поддержке</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowDbModal(false)} className="btn-secondary">Отмена</button>
                <button type="submit" className="btn-primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
