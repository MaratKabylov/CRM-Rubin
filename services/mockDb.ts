
import { 
  User, Client, Contact, Contract, Database1C, 
  ActivitySphere, LeadSource, Organization, Configuration, ConfigVersion, HistoryLog,
  Task, TaskComment, TaskQueue, QueueTemplateDefinition, Conversation, Message
} from '../types';

const seedUsers: User[] = [
  { id: 'u1', name: 'Администратор', email: 'admin@crm.local', password: 'admin', role: 'admin' },
  { id: 'u2', name: 'Менеджер', email: 'manager@crm.local', password: 'user', role: 'user' },
];

const seedQueueTemplates: QueueTemplateDefinition[] = [
  { 
    id: 'qt1', 
    name: 'Базовый шаблон', 
    statuses: ['Зарегистрирована', 'В работе', 'Требуется информация', 'Закрыта'] 
  },
  { 
    id: 'qt2', 
    name: 'Линия поддержки', 
    statuses: ['Зарегистрирована', 'В работе', 'Требуется информация', 'Закрыта'] 
  },
  { 
    id: 'qt3', 
    name: 'Управление проектами', 
    statuses: ['Зарегистрирована', 'В работе', 'Требуется информация', 'Закрыта'] 
  },
  { 
    id: 'qt4', 
    name: 'Разработка', 
    statuses: ['Backlog', 'В разработке', 'Тестирование', 'Выполнено'] 
  }
];

const seedQueues: TaskQueue[] = [
  { 
    id: 'q1', 
    name: 'Линия поддержки', 
    prefix: 'SUP', 
    template: 'qt2', 
    statuses: ['Зарегистрирована', 'В работе', 'Требуется информация', 'Закрыта'] 
  },
  { 
    id: 'q2', 
    name: 'Разработка', 
    prefix: 'DEV', 
    template: 'qt4', 
    statuses: ['Backlog', 'В разработке', 'Тестирование', 'Выполнено'] 
  }
];

const seedActivitySpheres: ActivitySphere[] = [
  { id: 'as1', name: 'Ритейл' },
  { id: 'as2', name: 'Производство' },
  { id: 'as3', name: 'Услуги' },
];

const seedLeadSources: LeadSource[] = [
  { id: 'ls1', name: 'Сайт' },
  { id: 'ls2', name: 'Рекомендация' },
  { id: 'ls3', name: 'Холодный звонок' },
];

const seedOrganizations: Organization[] = [
  { id: 'o1', name: 'ООО 1С-Сервис' },
  { id: 'o2', name: 'ИП Разработчик' },
];

const seedConfigs: Configuration[] = [
  { id: 'c1', name: 'Бухгалтерия 3.0', is_industry: false },
  { id: 'c2', name: 'Управление торговлей 11', is_industry: false },
  { id: 'c3', name: 'ERP Строительство', is_industry: true },
];

const seedVersions: ConfigVersion[] = [
  { id: 'v1', config_id: 'c1', release: '3.0.100.1', date: '2023-10-15' },
  { id: 'v2', config_id: 'c2', release: '11.5.7.1', date: '2023-11-20' },
];

const seedClients: Client[] = [
  {
    id: 'cl1',
    short_name: 'ТехноСклад',
    full_name: 'ООО ТехноСклад Плюс',
    bin: '123456789012',
    tags: ['vip', 'срочно'],
    rating: 5,
    is_gov: false,
    activity_id: 'as1',
    source_id: 'ls1',
    owner_id: 'u1',
    legal_address: 'г. Алматы, ул. Техно, 123',
    actual_address: 'г. Алматы, ул. Техно, 123',
    email: 'info@techstore.local',
    phone: '77071112233'
  }
];

const seedContacts: Contact[] = [
  {
    id: 'ct1',
    client_id: 'cl1',
    first_name: 'Иван',
    last_name: 'Иванов',
    position: 'Директор',
    phone: '77071112233',
    email: 'ivan@techstore.local',
    rating: 4,
  }
];

const seedContracts: Contract[] = [
  {
    id: 'con1',
    client_id: 'cl1',
    organization_id: 'o1',
    contract_number: 'ДОГ-2023-001',
    title: 'Основной договор обслуживания',
    start_date: '2023-01-01',
    end_date: '2025-12-31',
    is_signed: true,
    its_active: true,
    its_ours: true,
    minutes_included: 60
  }
];

const seedDatabases: Database1C[] = [
  {
    id: 'db1',
    name: 'Бухгалтерия_Основная',
    reg_number: '800123456',
    config_id: 'c1',
    work_mode: 'file',
    state: 'full_support',
    client_id: 'cl1',
    its_supported: true
  }
];

const seedTasks: Task[] = [
  {
    id: 't1',
    queue_id: 'q1',
    queue_task_no: 1,
    task_no: 1,
    client_id: 'cl1',
    contact_id: 'ct1',
    type: 'consultation',
    priority: 'high',
    status: 'Зарегистрирована',
    title: 'Обновление учетной политики',
    description: 'Клиент запросил консультацию по внедрению новых правил налогообложения.',
    author_id: 'u1',
    performer_ids: ['u2'],
    observer_ids: ['u1'],
    tags: ['налоги', 'консультация'],
    created_at: new Date().toISOString(),
    checklist: [
      { id: 'i1', text: 'Прочитать законодательство', is_done: true },
      { id: 'i2', text: 'Позвонить клиенту', is_done: false }
    ],
    attachments: [],
    time_logs: []
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
  queues: new Collection<TaskQueue>('queues', seedQueues),
  queueTemplates: new Collection<QueueTemplateDefinition>('queue_templates', seedQueueTemplates),
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
  conversations: new Collection<Conversation>('conversations', []),
  messages: new Collection<Message>('messages', []),
};
