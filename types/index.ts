
export interface User {
  id: string;
  discord_id: string;
  discord_username: string;
  roles: string[];
  created_at: string;
}

export interface DesignRequest {
  id: string;
  client_name: string;
  email: string;
  discord_username: string;
  service_type: string;
  description: string;
  budget?: string;
  contact_info: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  admin_notes?: string;
}

export interface WebhookConfig {
  url: string;
  enabled: boolean;
  last_tested?: string;
}

export interface GlobalMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface AdminSession {
  isAuthenticated: boolean;
  loginTime: string;
  expiresAt: string;
}

export interface OrderStatus {
  id: string;
  accepting_orders: boolean;
  updated_by?: string;
  updated_at: string;
  message?: string;
  created_at: string;
}
