import React, { createContext, useContext, useState } from 'react';
import { db } from '../services/mockDb';
import * as T from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  // Data arrays
  users: T.User[];
  clients: T.Client[];
  spheres: T.ActivitySphere[];
  sources: T.LeadSource[];
  orgs: T.Organization[];
  configs: T.Configuration[];
  versions: T.ConfigVersion[];
  contacts: T.Contact[];
  contracts: T.Contract[];
  databases: T.Database1C[];
  historyLogs: T.HistoryLog[];
  
  // Refresh triggers
  refreshData: () => void;

  // CRUD Helpers
  addClient: (data: Omit<T.Client, 'id'>) => void;
  updateClient: (id: string, data: Partial<T.Client>) => void;
  deleteClient: (id: string) => void;
  
  addContact: (data: Omit<T.Contact, 'id'>) => void;
  updateContact: (id: string, data: Partial<T.Contact>) => void;
  deleteContact: (id: string) => void;
  
  addContract: (data: Omit<T.Contract, 'id'>) => void;
  updateContract: (id: string, data: Partial<T.Contract>) => void;
  deleteContract: (id: string) => void;
  
  addDatabase: (data: Omit<T.Database1C, 'id'>) => void;
  updateDatabase: (id: string, data: Partial<T.Database1C>) => void;
  deleteDatabase: (id: string) => void;

  addUser: (data: Omit<T.User, 'id'>) => void;
  deleteUser: (id: string) => void;
  
  // Generic helper for directories
  addDirectoryItem: (type: 'spheres' | 'sources' | 'orgs' | 'configs' | 'versions', data: any) => void;
  deleteDirectoryItem: (type: 'spheres' | 'sources' | 'orgs' | 'configs' | 'versions', id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trigger, setTrigger] = useState(0);

  const refreshData = () => setTrigger(prev => prev + 1);

  // Helper to calculate diff and log
  const logAndExecute = <T extends { id: string }>(
    entityType: T.EntityType,
    parentId: string | ((item: T) => string), // Parent Client ID
    action: T.ActionType,
    operation: () => T | null | boolean,
    oldItem?: T,
    newItemData?: Partial<T>
  ) => {
    const result = operation();
    
    // Only log if successful
    if (result) {
        let details = '';
        const userName = user?.name || 'System';
        const timestamp = new Date().toISOString();
        let entityId = '';
        let finalParentId = '';

        if (action === 'create') {
            const created = result as T;
            entityId = created.id;
            finalParentId = typeof parentId === 'function' ? parentId(created) : parentId;
            details = `Created new ${entityType}`;
        } else if (action === 'delete') {
             entityId = (oldItem as T).id;
             finalParentId = typeof parentId === 'function' ? parentId(oldItem as T) : parentId;
             details = `Deleted ${entityType}`;
        } else if (action === 'update' && oldItem && newItemData) {
            entityId = oldItem.id;
            finalParentId = typeof parentId === 'function' ? parentId(oldItem) : parentId;
            
            const changes: string[] = [];
            (Object.keys(newItemData) as Array<keyof T>).forEach(key => {
                if (key === 'id') return;
                const oldVal = oldItem[key];
                const newVal = newItemData[key];
                // Simple equality check, can be expanded for arrays/objects
                if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                    // Try to format nicely
                    let displayOld = oldVal?.toString() || 'empty';
                    let displayNew = newVal?.toString() || 'empty';
                    if (displayOld.length > 20) displayOld = '...';
                    if (displayNew.length > 20) displayNew = '...';
                    changes.push(`${String(key)}: ${displayOld} -> ${displayNew}`);
                }
            });
            details = changes.length > 0 ? `Updated: ${changes.join(', ')}` : 'Updated (No changes detected)';
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

  const value: DataContextType = {
    users: db.users.getAll(),
    clients: db.clients.getAll(),
    spheres: db.activitySpheres.getAll(),
    sources: db.leadSources.getAll(),
    orgs: db.organizations.getAll(),
    configs: db.configurations.getAll(),
    versions: db.configVersions.getAll(),
    contacts: db.contacts.getAll(),
    contracts: db.contracts.getAll(),
    databases: db.databases.getAll(),
    historyLogs: db.history.getAll().sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),

    refreshData,

    addClient: (data) => logAndExecute('client', (c) => c.id, 'create', () => db.clients.create(data)),
    updateClient: (id, data) => {
        const old = db.clients.getById(id);
        if(old) logAndExecute('client', id, 'update', () => db.clients.update(id, data), old, data);
    },
    deleteClient: (id) => {
        const old = db.clients.getById(id);
        if(old) logAndExecute('client', id, 'delete', () => db.clients.delete(id), old);
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
      refreshData();
    },
    deleteDirectoryItem: (type, id) => {
      if (type === 'spheres') db.activitySpheres.delete(id);
      if (type === 'sources') db.leadSources.delete(id);
      if (type === 'orgs') db.organizations.delete(id);
      if (type === 'configs') db.configurations.delete(id);
      if (type === 'versions') db.configVersions.delete(id);
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