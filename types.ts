
export type Role = 'admin' | 'user';
export type WorkMode = 'file' | 'server';
export type DbState = 'full_support' | 'full_support_with_extensions' | 'minor_change' | 'major_change' | 'custom_solution';
export type EntityType = 'client' | 'contact' | 'contract' | 'database' | 'task' | 'queue' | 'queue_template';
export type ActionType = 'create' | 'update' | 'delete' | 'comment' | 'complete';

export type TaskType = 'consultation' | 'development' | 'request';
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = string; // Now dynamic based on queue

export type QueueTemplate = string; // Changed from union to string to support dynamic templates

export interface QueueTemplateDefinition {
  id: string;
  name: string;
  statuses: string[];
}

export interface HistoryLog {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  parent_client_id: string;
  user_name: string;
  action: ActionType;
  details: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface ActivitySphere {
  id: string;
  name: string;
}

export interface LeadSource {
  id: string;
  name: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Configuration {
  id: string;
  name: string;
  is_industry: boolean;
}

export interface ConfigVersion {
  id: string;
  release: string;
  config_id: string;
  date: string;
}

export interface Client {
  id: string;
  short_name: string;
  full_name: string;
  bin?: string;
  tags?: string[];
  rating?: number;
  is_gov: boolean;
  activity_id: string;
  source_id: string;
  owner_id: string;
  legal_address: string;
  actual_address: string;
  email: string;
  phone: string;
}

export interface Contact {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  position: string;
  phone: string;
  email: string;
  rating?: number;
  telegram_id?: string;
  rustdesk_id?: string;
  rustdesk_password?: string;
  anydesk_id?: string;
  anydesk_password?: string;
}

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
  client_id: string;
}

export interface TaskQueue {
  id: string;
  name: string;
  prefix: string;
  template: string; // Refers to QueueTemplateDefinition.id or name
  statuses: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  is_done: boolean;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  text: string;
  timestamp: string;
}

export interface TaskAttachment {
  name: string;
  url: string;
  type: string;
}

export interface Task {
  id: string;
  queue_id: string;
  queue_task_no: number;
  task_no: number; // Legacy, keep for compatibility or remove
  client_id: string;
  contact_id?: string;
  db_id?: string;
  type: TaskType;
  priority: Priority;
  status: TaskStatus;
  title: string;
  description: string;
  author_id: string;
  performer_ids: string[];
  observer_ids: string[];
  tags: string[];
  deadline?: string;
  created_at: string;
  checklist: ChecklistItem[];
  attachments: TaskAttachment[];
  completion_rating?: number;
}
