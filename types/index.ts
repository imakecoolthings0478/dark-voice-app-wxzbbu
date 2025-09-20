
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
  service_type: string;
  description: string;
  budget?: string;
  contact_info: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface WebhookConfig {
  url: string;
  enabled: boolean;
  last_tested?: string;
}
