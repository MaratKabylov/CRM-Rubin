
export type Role = 'admin' | 'user';
export type WorkMode = 'file' | 'server';
export type DbState = 'full_support' | 'full_support_with_extensions' | 'minor_change' | 'major_change' | 'custom_solution';
export type EntityType = 'client' | 'contact' | 'contract' | 'database';
export type ActionType = 'create' | 'update' | 'delete';

// History Log
export interface HistoryLog {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  parent_client_id: string; // To easily filter logs for a specific client page
  user_name: string;
  action: ActionType;
  details: string; // Human readable string of changes "Changed status: Active -> Inactive"
  timestamp: string;
}

// 0) Authentication & Users
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In real app, this would be hashed
  role: Role;
}

// 2) Activity Spheres
export interface ActivitySphere {
  id: string;
  name: string;
}

// 3) Lead Sources
export interface LeadSource {
  id: string;
  name: string;
}

// 5) Organizations (Vendor organizations)
export interface Organization {
  id: string;
  name: string;
}

// 7) Configurations
export interface Configuration {
  id: string;
  name: string;
  is_industry: boolean;
}

// 8) Config Versions
export interface ConfigVersion {
  id: string;
  release: string;
  config_id: string;
  date: string;
}

// 1) Clients
export interface Client {
  id: string;
  short_name: string;
  full_name: string;
  bin?: string;
  tags?: string[];
  rating?: number; // 0 to 5
  is_gov: boolean;
  activity_id: string;
  source_id: string;
  owner_id: string;
  legal_address: string;
  actual_address: string;
  email: string;
  phone: string;
}

// 4) Contacts
export interface Contact {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  position: string;
  phone: string;
  email: string;
  rating?: number; // 0 to 5
  telegram_id?: string;
  rustdesk_id?: string;
  rustdesk_password?: string;
  anydesk_id?: string;
  anydesk_password?: string;
}

// 6) Contracts
export interface Contract {
  id: string;
  client_id: string;
  organization_id: string;
  contract_number: string;
  title: string;
  start_date: string;
  end_date: string;
  comment?: string;
  is_signed: boolean;
  its_active: boolean;
  its_expiration_date?: string;
  its_login?: string;
  its_password?: string;
  minutes_included: number;
}

// 9) Databases
export interface Database1C {
  id: string;
  name: string;
  reg_number: string;
  config_id: string;
  version_id?: string;
  db_admin?: string;
  db_password?: string;
  its_supported: boolean;
  work_mode: WorkMode;
  state: DbState;
  client_id: string; // Foreign Key linking to Client
}
