
export interface User {
  id: string;
  discord_id?: string;
  discord_username?: string;
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
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  orders_accepting: boolean;
  discord_webhook_url?: string;
  admin_discord_id?: string;
}
