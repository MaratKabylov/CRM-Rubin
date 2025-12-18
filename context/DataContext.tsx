
import React, { createContext, useContext, useState } from 'react';
import { db } from '../services/mockDb';
import * as T from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  users: T.User[];
  clients: T.Client[];
  queues: T.TaskQueue[];
  queueTemplates: T.QueueTemplateDefinition[];
  spheres: T.ActivitySphere[];
  sources: T.LeadSource[];
  orgs: T.Organization[];
  configs: T.Configuration[];
  versions: T.ConfigVersion[];
  contacts: T.Contact[];
  contracts: T.Contract[];
  databases: T.Database1C[];
  historyLogs: T.HistoryLog[];
  tasks: T.Task[];
  taskComments: T.TaskComment[];
  
  refreshData: () => void;

  addClient: (data: Omit<T.Client, 'id'>) => void;
  updateClient: (id: string, data: Partial<T.Client>) => void;
  deleteClient: (id: string) => void;
  
  addContact: (data: Omit<T.Contact, 'id'>) => void;
  updateContact: (id: string, data: Partial<T.Contact>) => void;
  deleteContact: (id: string) => void;
  
  addQueue: (data: Omit<T.TaskQueue, 'id'>) => void;
  updateQueue: (id: string, data: Partial<T.TaskQueue>) => void;
  deleteQueue: (id: string) => void;

  addQueueTemplate: (data: Omit<T.QueueTemplateDefinition, 'id'>) => void;
  updateQueueTemplate: (id: string, data: Partial<T.QueueTemplateDefinition>) => void;
  deleteQueueTemplate: (id: string) => void;

  addTask: (data: Omit<T.Task, 'id' | 'created_at' | 'task_no' | 'queue_task_no'>) => void;
  updateTask: (id: string, data: Partial<T.Task>) => void;
  deleteTask: (id: string) => void;
  addComment: (taskId: string, text: string) => void;
  
  addContract: (data: Omit<T.Contract, 'id'>) => void;
  updateContract: (id: string, data: Partial<T.Contract>) => void;
  deleteContract: (id: string) => void;
  
  addDatabase: (data: Omit<T.Database1C, 'id'>) => void;
  updateDatabase: (id: string, data: Partial<T.Database1C>) => void;
  deleteDatabase: (id: string) => void;

  addUser: (data: Omit<T.User, 'id'>) => void;
  deleteUser: (id: string) => void;
  
  addDirectoryItem: (type: 'spheres' | 'sources' | 'orgs' | 'configs' | 'versions' | 'queue_templates', data: any) => void;
  deleteDirectoryItem: (type: 'spheres' | 'sources' | 'orgs' | 'configs' | 'versions' | 'queue_templates', id: string) => void;
  
  getClientStats: (clientId: string) => { avgRating: number; taskCount: number };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trigger, setTrigger] = useState(0);

  const refreshData = () => setTrigger(prev => prev + 1);

  const logAndExecute = <Item extends { id: string }>(
    entityType: T.EntityType,
    parentId: string | ((item: Item) => string),
    action: T.ActionType,
    operation: () => Item | null | boolean,
    oldItem?: Item,
    newItemData?: Partial<Item>
  ) => {
    const result = operation();
    if (result) {
        let details = '';
        const userName = user?.name || 'System';
        const timestamp = new Date().toISOString();
        let entityId = '';
        let finalParentId = '';

        if (action === 'create') {
            const created = result as Item;
            entityId = created.id;
            finalParentId = typeof parentId === 'function' ? parentId(created) : parentId;
            details = `Created new ${entityType}`;
        } else if (action === 'delete') {
             entityId = (oldItem as Item).id;
             finalParentId = typeof parentId === 'function' ? parentId(oldItem as Item) : parentId;
             details = `Deleted ${entityType}`;
        } else if (action === 'update' && oldItem && newItemData) {
            entityId = oldItem.id;
            finalParentId = typeof parentId === 'function' ? parentId(oldItem) : parentId;
            
            // Generate detailed change info for tasks
            if (entityType === 'task') {
                const changes: string[] = [];
                Object.keys(newItemData).forEach(key => {
                    const k = key as keyof Item;
                    if (oldItem[k] !== newItemData[k]) {
                        changes.push(String(key));
                    }
                });
                details = changes.length > 0 ? `Changed: ${changes.join(', ')}` : 'Updated task';
            } else {
                details = `Updated ${entityType}`;
            }
        }

        db.history.create({
            entity_type: entityType,
            entity_id: entityId,
            parent_client_id: finalParentId,
            user_name: userName,
            action: action,
            details: details,
            timestamp: timestamp
        });
        refreshData();
    }
    return result;
  };

  const getClientStats = (clientId: string) => {
    const clientTasks = db.tasks.getAll().filter(t => t.client_id === clientId && t.status === 'done' && t.completion_rating);
    if (clientTasks.length === 0) return { avgRating: 0, taskCount: 0 };
    const sum = clientTasks.reduce((acc, t) => acc + (t.completion_rating || 0), 0);
    return { 
        avgRating: parseFloat((sum / clientTasks.length).toFixed(1)), 
        taskCount: clientTasks.length 
    };
  };

  const value: DataContextType = {
    users: db.users.getAll(),
    clients: db.clients.getAll(),
    queues: db.queues.getAll(),
    queueTemplates: db.queueTemplates.getAll(),
    spheres: db.activitySpheres.getAll(),
    sources: db.leadSources.getAll(),
    orgs: db.organizations.getAll(),
    configs: db.configurations.getAll(),
    versions: db.configVersions.getAll(),
    contacts: db.contacts.getAll(),
    contracts: db.contracts.getAll(),
    databases: db.databases.getAll(),
    tasks: db.tasks.getAll(),
    taskComments: db.comments.getAll(),
    historyLogs: db.history.getAll().sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),

    refreshData,
    getClientStats,

    addClient: (data) => logAndExecute('client', (c) => c.id, 'create', () => db.clients.create(data)),
    updateClient: (id, data) => {
        const old = db.clients.getById(id);
        if(old) logAndExecute('client', id, 'update', () => db.clients.update(id, data), old, data);
    },
    deleteClient: (id) => {
        const old = db.clients.getById(id);
        if(old) logAndExecute('client', id, 'delete', () => db.clients.delete(id), old);
    },

    addQueue: (data) => logAndExecute('queue', (q) => q.id, 'create', () => db.queues.create(data)),
    updateQueue: (id, data) => {
        const old = db.queues.getById(id);
        if(old) logAndExecute('queue', id, 'update', () => db.queues.update(id, data), old, data);
    },
    deleteQueue: (id) => {
        const old = db.queues.getById(id);
        if(old) logAndExecute('queue', id, 'delete', () => db.queues.delete(id), old);
    },

    addQueueTemplate: (data) => logAndExecute('queue_template', (q) => q.id, 'create', () => db.queueTemplates.create(data)),
    updateQueueTemplate: (id, data) => {
        const old = db.queueTemplates.getById(id);
        if(old) logAndExecute('queue_template', id, 'update', () => db.queueTemplates.update(id, data), old, data);
    },
    deleteQueueTemplate: (id) => {
        const old = db.queueTemplates.getById(id);
        if(old) logAndExecute('queue_template', id, 'delete', () => db.queueTemplates.delete(id), old);
    },

    addTask: (data) => {
        const currentTasks = db.tasks.getAll();
        const maxNo = currentTasks.reduce((max, task) => Math.max(max, task.task_no || 0), 0);
        
        // Calculate number within queue
        const queueTasks = currentTasks.filter(t => t.queue_id === data.queue_id);
        const maxQueueNo = queueTasks.reduce((max, task) => Math.max(max, task.queue_task_no || 0), 0);

        return logAndExecute('task', data.client_id, 'create', () => 
            db.tasks.create({ 
                ...data, 
                task_no: maxNo + 1,
                queue_task_no: maxQueueNo + 1, 
                created_at: new Date().toISOString() 
            })
        );
    },
    updateTask: (id, data) => {
        const old = db.tasks.getById(id);
        if(old) logAndExecute('task', old.client_id, 'update', () => db.tasks.update(id, data), old, data);
    },
    deleteTask: (id) => {
        const old = db.tasks.getById(id);
        if(old) logAndExecute('task', old.client_id, 'delete', () => db.tasks.delete(id), old);
    },
    addComment: (taskId, text) => {
        const task = db.tasks.getById(taskId);
        if (!task) return;
        db.comments.create({
            task_id: taskId,
            user_id: user?.id || 'sys',
            user_name: user?.name || 'System',
            text,
            timestamp: new Date().toISOString()
        });
        refreshData();
    },

    addContact: (data) => logAndExecute('contact', data.client_id, 'create', () => db.contacts.create(data)),
    updateContact: (id, data) => {
        const old = db.contacts.getById(id);
        if(old) logAndExecute('contact', old.client_id, 'update', () => db.contacts.update(id, data), old, data);
    },
    deleteContact: (id) => {
        const old = db.contacts.getById(id);
        if(old) logAndExecute('contact', old.client_id, 'delete', () => db.contacts.delete(id), old);
    },

    addContract: (data) => logAndExecute('contract', data.client_id, 'create', () => db.contracts.create(data)),
    updateContract: (id, data) => {
        const old = db.contracts.getById(id);
        if(old) logAndExecute('contract', old.client_id, 'update', () => db.contracts.update(id, data), old, data);
    },
    deleteContract: (id) => {
         const old = db.contracts.getById(id);
         if(old) logAndExecute('contract', old.client_id, 'delete', () => db.contracts.delete(id), old);
    },

    addDatabase: (data) => logAndExecute('database', data.client_id, 'create', () => db.databases.create(data)),
    updateDatabase: (id, data) => {
        const old = db.databases.getById(id);
        if(old) logAndExecute('database', old.client_id, 'update', () => db.databases.update(id, data), old, data);
    },
    deleteDatabase: (id) => {
        const old = db.databases.getById(id);
        if(old) logAndExecute('database', old.client_id, 'delete', () => db.databases.delete(id), old);
    },

    addUser: (data) => { db.users.create(data); refreshData(); },
    deleteUser: (id) => { db.users.delete(id); refreshData(); },

    addDirectoryItem: (type, data) => {
      if (type === 'spheres') db.activitySpheres.create(data);
      if (type === 'sources') db.leadSources.create(data);
      if (type === 'orgs') db.organizations.create(data);
      if (type === 'configs') db.configurations.create(data);
      if (type === 'versions') db.configVersions.create(data);
      if (type === 'queue_templates') db.queueTemplates.create(data);
      refreshData();
    },
    deleteDirectoryItem: (type, id) => {
      if (type === 'spheres') db.activitySpheres.delete(id);
      if (type === 'sources') db.leadSources.delete(id);
      if (type === 'orgs') db.organizations.delete(id);
      if (type === 'configs') db.configurations.delete(id);
      if (type === 'versions') db.configVersions.delete(id);
      if (type === 'queue_templates') db.queueTemplates.delete(id);
      refreshData();
    }
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};
