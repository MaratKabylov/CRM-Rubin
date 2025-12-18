
import { 
  User, Client, Contact, Contract, Database1C, 
  ActivitySphere, LeadSource, Organization, Configuration, ConfigVersion, HistoryLog,
  Task, TaskComment
} from '../types';

const seedUsers: User[] = [
  { id: 'u1', name: 'Administrator', email: 'admin@crm.local', password: 'admin', role: 'admin' },
  { id: 'u2', name: 'Manager', email: 'manager@crm.local', password: 'user', role: 'user' },
];

const seedActivitySpheres: ActivitySphere[] = [
  { id: 'as1', name: 'Retail' },
  { id: 'as2', name: 'Production' },
  { id: 'as3', name: 'Services' },
];

const seedLeadSources: LeadSource[] = [
  { id: 'ls1', name: 'Website' },
  { id: 'ls2', name: 'Referral' },
  { id: 'ls3', name: 'Cold Call' },
];

const seedOrganizations: Organization[] = [
  { id: 'o1', name: 'OOO 1C-Service' },
  { id: 'o2', name: 'IP Developer' },
];

const seedConfigs: Configuration[] = [
  { id: 'c1', name: 'Accounting 3.0', is_industry: false },
  { id: 'c2', name: 'Trade Management 11', is_industry: false },
  { id: 'c3', name: 'Construction ERP', is_industry: true },
];

const seedVersions: ConfigVersion[] = [
  { id: 'v1', config_id: 'c1', release: '3.0.100.1', date: '2023-10-15' },
  { id: 'v2', config_id: 'c2', release: '11.5.7.1', date: '2023-11-20' },
];

const seedClients: Client[] = [
  {
    id: 'cl1',
    short_name: 'TechStore',
    full_name: 'TechStore Ltd.',
    bin: '123456789012',
    tags: ['vip', 'urgent'],
    rating: 5,
    is_gov: false,
    activity_id: 'as1',
    source_id: 'ls1',
    owner_id: 'u1',
    legal_address: '123 Tech St',
    actual_address: '123 Tech St',
    email: 'info@techstore.local',
    phone: '+79991234567'
  }
];

const seedContacts: Contact[] = [
  {
    id: 'ct1',
    client_id: 'cl1',
    first_name: 'John',
    last_name: 'Doe',
    position: 'Director',
    phone: '+79990001122',
    email: 'john@techstore.local',
    rating: 4,
  }
];

const seedContracts: Contract[] = [
  {
    id: 'con1',
    client_id: 'cl1',
    organization_id: 'o1',
    contract_number: 'CNT-2023-001',
    title: 'Main Service Agreement',
    start_date: '2023-01-01',
    end_date: '2024-12-31',
    is_signed: true,
    its_active: true,
    minutes_included: 60
  }
];

const seedDatabases: Database1C[] = [
  {
    id: 'db1',
    name: 'Accounting_Main',
    reg_number: '800123456',
    config_id: 'c1',
    its_supported: true,
    work_mode: 'file',
    state: 'full_support',
    client_id: 'cl1'
  }
];

const seedTasks: Task[] = [
  {
    id: 't1',
    task_no: 1,
    client_id: 'cl1',
    contact_id: 'ct1',
    type: 'consultation',
    priority: 'high',
    status: 'open',
    title: 'Update Accounting Rules',
    description: 'The client requested a consultation on new tax rules implementation.',
    author_id: 'u1',
    performer_ids: ['u2'],
    observer_ids: ['u1'],
    tags: ['tax', 'consult'],
    created_at: new Date().toISOString(),
    checklist: [
      { id: 'i1', text: 'Read legislation', is_done: true },
      { id: 'i2', text: 'Call client', is_done: false }
    ],
    attachments: []
  }
];

// LocalStorage helpers
const getStorage = <T>(key: string, seed: T[]): T[] => {
  const stored = localStorage.getItem(`crm_${key}`);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(`crm_${key}`, JSON.stringify(seed));
  return seed;
};

const setStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(`crm_${key}`, JSON.stringify(data));
};

class Collection<T extends { id: string }> {
  private key: string;
  private items: T[];

  constructor(key: string, seed: T[]) {
    this.key = key;
    this.items = getStorage(key, seed);
  }

  getAll(): T[] {
    return [...this.items];
  }

  getById(id: string): T | undefined {
    return this.items.find(i => i.id === id);
  }

  create(item: Omit<T, 'id'>): T {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) } as T;
    this.items.push(newItem);
    this.persist();
    return newItem;
  }

  update(id: string, updates: Partial<T>): T | null {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.items[idx] = { ...this.items[idx], ...updates };
    this.persist();
    return this.items[idx];
  }

  delete(id: string): boolean {
    const initialLen = this.items.length;
    this.items = this.items.filter(i => i.id !== id);
    if (this.items.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  private persist() {
    setStorage(this.key, this.items);
  }
}

export const db = {
  users: new Collection<User>('users', seedUsers),
  activitySpheres: new Collection<ActivitySphere>('spheres', seedActivitySpheres),
  leadSources: new Collection<LeadSource>('sources', seedLeadSources),
  organizations: new Collection<Organization>('orgs', seedOrganizations),
  configurations: new Collection<Configuration>('configs', seedConfigs),
  configVersions: new Collection<ConfigVersion>('versions', seedVersions),
  clients: new Collection<Client>('clients', seedClients),
  contacts: new Collection<Contact>('contacts', seedContacts),
  contracts: new Collection<Contract>('contracts', seedContracts),
  databases: new Collection<Database1C>('databases', seedDatabases),
  history: new Collection<HistoryLog>('history', []),
  tasks: new Collection<Task>('tasks', seedTasks),
  comments: new Collection<TaskComment>('task_comments', []),
};
