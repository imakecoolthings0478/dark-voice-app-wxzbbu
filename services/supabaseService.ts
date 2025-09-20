
import { createClient } from '@supabase/supabase-js';
import { DesignRequest, GlobalMessage } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Note: These would be set from environment variables in a real app
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

class SupabaseService {
  private supabase;
  private isConfigured = false;

  constructor() {
    // Initialize with placeholder values - user needs to configure
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  async configure(url: string, anonKey: string): Promise<boolean> {
    try {
      this.supabase = createClient(url, anonKey);
      this.isConfigured = true;
      await AsyncStorage.setItem('supabase_url', url);
      await AsyncStorage.setItem('supabase_anon_key', anonKey);
      console.log('✅ Supabase configured successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to configure Supabase:', error);
      return false;
    }
  }

  async loadConfiguration(): Promise<boolean> {
    try {
      const url = await AsyncStorage.getItem('supabase_url');
      const anonKey = await AsyncStorage.getItem('supabase_anon_key');
      
      if (url && anonKey && url !== 'YOUR_SUPABASE_URL') {
        this.supabase = createClient(url, anonKey);
        this.isConfigured = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading Supabase configuration:', error);
      return false;
    }
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  // Design Requests
  async createRequest(request: DesignRequest): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { error } = await this.supabase
        .from('design_requests')
        .insert([request]);

      if (error) {
        console.error('Supabase insert error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Request saved to Supabase');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to save request to Supabase:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async getRequests(): Promise<{ success: boolean; data?: DesignRequest[]; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await this.supabase
        .from('design_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Failed to fetch requests from Supabase:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async updateRequestStatus(
    requestId: string, 
    status: DesignRequest['status'], 
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await this.supabase
        .from('design_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('Supabase update error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Request status updated in Supabase');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to update request in Supabase:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Global Messages
  async getGlobalMessages(): Promise<{ success: boolean; data?: GlobalMessage[]; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await this.supabase
        .from('global_messages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch messages error:', error);
        return { success: false, error: error.message };
      }

      // Filter out expired messages
      const activeMessages = (data || []).filter(msg => {
        if (!msg.expires_at) return true;
        return new Date(msg.expires_at) > new Date();
      });

      return { success: true, data: activeMessages };
    } catch (error) {
      console.error('❌ Failed to fetch global messages from Supabase:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async createGlobalMessage(message: GlobalMessage): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { error } = await this.supabase
        .from('global_messages')
        .insert([message]);

      if (error) {
        console.error('Supabase insert message error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Global message saved to Supabase');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to save global message to Supabase:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async deactivateGlobalMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { error } = await this.supabase
        .from('global_messages')
        .update({ is_active: false })
        .eq('id', messageId);

      if (error) {
        console.error('Supabase deactivate message error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Global message deactivated in Supabase');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to deactivate global message in Supabase:', error);
      return { success: false, error: 'Network error' };
    }
  }
}

export const supabaseService = new SupabaseService();
