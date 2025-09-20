
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DesignRequest, GlobalMessage, OrderStatus } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Actual Supabase credentials for the project
const DEFAULT_SUPABASE_URL = 'https://phwtkkwwfpbgwcvwgick.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBod3Rra3d3ZnBiZ3djdndnaWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjIzMTQsImV4cCI6MjA3MzkzODMxNH0.PLfuzR4Bfbya0G5W-Hql6jMTDWr_4gt-M_SWa4S-4b8';

class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private isConfigured = false;

  constructor() {
    // Don't initialize here - wait for proper configuration
  }

  async initialize(): Promise<boolean> {
    try {
      // Try to load custom configuration first
      const customUrl = await AsyncStorage.getItem('supabase_url');
      const customKey = await AsyncStorage.getItem('supabase_anon_key');
      
      let url = DEFAULT_SUPABASE_URL;
      let anonKey = DEFAULT_SUPABASE_ANON_KEY;
      
      // Use custom configuration if available and valid
      if (customUrl && customKey && customUrl.startsWith('http') && customUrl !== 'YOUR_SUPABASE_URL') {
        url = customUrl;
        anonKey = customKey;
        console.log('✅ Using custom Supabase configuration');
      } else {
        console.log('✅ Using default Supabase configuration');
      }

      // Validate URL format
      if (!url.startsWith('http')) {
        throw new Error('Invalid Supabase URL format');
      }

      this.supabase = createClient(url, anonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
      
      this.isConfigured = true;
      console.log('✅ Supabase client initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
      this.isConfigured = false;
      return false;
    }
  }

  async configure(url: string, anonKey: string): Promise<boolean> {
    try {
      // Validate URL format
      if (!url.startsWith('http')) {
        throw new Error('Invalid URL format - must start with http or https');
      }

      this.supabase = createClient(url, anonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });
      
      this.isConfigured = true;
      await AsyncStorage.setItem('supabase_url', url);
      await AsyncStorage.setItem('supabase_anon_key', anonKey);
      console.log('✅ Supabase configured successfully with custom settings');
      return true;
    } catch (error) {
      console.error('❌ Failed to configure Supabase:', error);
      return false;
    }
  }

  async loadConfiguration(): Promise<boolean> {
    return await this.initialize();
  }

  isReady(): boolean {
    return this.isConfigured && this.supabase !== null;
  }

  getClient(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized. Call initialize() first.');
    }
    return this.supabase;
  }

  // Design Requests
  async createRequest(request: DesignRequest): Promise<{ success: boolean; error?: string }> {
    if (!this.isReady()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { error } = await this.supabase!
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
    if (!this.isReady()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await this.supabase!
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
    if (!this.isReady()) {
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

      const { error } = await this.supabase!
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
    if (!this.isReady()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await this.supabase!
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
    if (!this.isReady()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { error } = await this.supabase!
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
    if (!this.isReady()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { error } = await this.supabase!
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

  // Order Status Management
  async getOrderStatus(): Promise<{ success: boolean; data?: OrderStatus; error?: string }> {
    if (!this.isReady()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await this.supabase!
        .from('order_status')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Supabase fetch order status error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('❌ Failed to fetch order status from Supabase:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async updateOrderStatus(
    acceptingOrders: boolean, 
    updatedBy: string, 
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isReady()) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { error } = await this.supabase!
        .from('order_status')
        .update({
          accepting_orders: acceptingOrders,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
          message: message || (acceptingOrders ? 'We are currently accepting new design requests!' : 'We have temporarily closed new orders.')
        })
        .eq('id', (await this.getOrderStatus()).data?.id);

      if (error) {
        console.error('Supabase update order status error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Order status updated in Supabase');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to update order status in Supabase:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Anti-spam functionality
  async checkAntiSpam(email: string, discordUsername: string, isAdmin: boolean = false): Promise<{ canSubmit: boolean; message?: string }> {
    if (!this.isReady()) {
      console.log('⚠️ Supabase not configured - skipping anti-spam check');
      return { canSubmit: true };
    }

    // Skip anti-spam check for admins
    if (isAdmin) {
      console.log('🔓 Admin user - bypassing anti-spam check');
      return { canSubmit: true };
    }

    try {
      // Check for recent submissions in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data, error } = await this.supabase!
        .from('request_submissions')
        .select('*')
        .or(`email.eq.${email},discord_username.eq.${discordUsername}`)
        .gte('submitted_at', oneHourAgo)
        .order('submitted_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('❌ Error checking anti-spam:', error);
        // If there's an error, allow submission but log it
        return { canSubmit: true };
      }

      if (data && data.length > 0) {
        const lastSubmission = new Date(data[0].submitted_at);
        const timeDiff = Date.now() - lastSubmission.getTime();
        const minutesLeft = Math.ceil((60 * 60 * 1000 - timeDiff) / (60 * 1000));
        
        return {
          canSubmit: false,
          message: "Oops, Looks like you have reached your limit of submitting the requests, Please try again after an hour"
        };
      }

      return { canSubmit: true };
    } catch (error) {
      console.error('❌ Error in anti-spam check:', error);
      // If there's an error, allow submission
      return { canSubmit: true };
    }
  }

  async recordSubmission(email: string, discordUsername: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isReady()) {
      console.log('⚠️ Supabase not configured - skipping submission recording');
      return { success: true };
    }

    try {
      const { error } = await this.supabase!
        .from('request_submissions')
        .insert({
          email: email,
          discord_username: discordUsername,
          submitted_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Error recording submission:', error);
        return { success: false, error: error.message };
      } else {
        console.log('✅ Submission recorded for anti-spam tracking');
        return { success: true };
      }
    } catch (error) {
      console.error('❌ Error recording submission:', error);
      return { success: false, error: 'Network error' };
    }
  }

  get client() {
    return this.supabase;
  }
}

export const supabaseService = new SupabaseService();
