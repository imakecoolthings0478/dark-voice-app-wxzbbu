
import { DesignRequest } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DiscordWebhookPayload {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: string;
    footer?: {
      text: string;
    };
    thumbnail?: {
      url: string;
    };
  }>;
}

export class DiscordService {
  static async getWebhookUrl(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('discord_webhook_url');
    } catch (error) {
      console.error('Error getting webhook URL:', error);
      return null;
    }
  }

  static async setWebhookUrl(url: string): Promise<boolean> {
    try {
      if (!url || !url.startsWith('https://discord.com/api/webhooks/')) {
        throw new Error('Invalid webhook URL format');
      }
      await AsyncStorage.setItem('discord_webhook_url', url);
      console.log('✅ Discord webhook URL saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving webhook URL:', error);
      return false;
    }
  }

  static async sendRequestToDiscord(request: DesignRequest, webhookUrl?: string): Promise<boolean> {
    try {
      const url = webhookUrl || await this.getWebhookUrl();
      
      if (!url) {
        console.log('⚠️ No webhook URL configured, skipping Discord notification');
        return false;
      }

      console.log('🚀 Sending request to Discord:', request);

      const embed = {
        title: '🎨 New Design Request Received',
        description: `A new **${request.service_type}** request has been submitted by **${request.client_name}**!`,
        color: 0x5865F2, // Discord blue
        fields: [
          {
            name: '👤 Client Name',
            value: request.client_name || 'Unknown',
            inline: true,
          },
          {
            name: '🎯 Service Type',
            value: request.service_type || 'Not specified',
            inline: true,
          },
          {
            name: '💰 Budget',
            value: request.budget || 'Not specified',
            inline: true,
          },
          {
            name: '📝 Project Description',
            value: request.description || 'No description provided',
            inline: false,
          },
          {
            name: '📞 Contact Information',
            value: request.contact_info || 'Not provided',
            inline: false,
          },
          {
            name: '📅 Submitted',
            value: new Date(request.created_at).toLocaleString(),
            inline: true,
          },
          {
            name: '🆔 Request ID',
            value: request.id,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Logify Makers - Design Request System v2.0',
        },
        thumbnail: {
          url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop&crop=center',
        },
      };

      const payload: DiscordWebhookPayload = {
        content: '🔔 **NEW DESIGN REQUEST ALERT** 🔔\n@everyone A new client needs our design services!',
        embeds: [embed],
      };

      console.log('📤 Sending payload to Discord webhook...');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LogifyMakers/2.0',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Discord webhook failed:', response.status, response.statusText, errorText);
        throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Request sent to Discord successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send request to Discord:', error);
      return false;
    }
  }

  static async sendStatusUpdate(message: string, isAccepting: boolean, webhookUrl?: string): Promise<boolean> {
    try {
      const url = webhookUrl || await this.getWebhookUrl();
      
      if (!url) {
        console.log('⚠️ No webhook URL configured, skipping Discord notification');
        return false;
      }

      console.log('📢 Sending status update to Discord:', { message, isAccepting });

      const embed = {
        title: isAccepting ? '✅ Orders Now Open!' : '❌ Orders Temporarily Closed',
        description: message,
        color: isAccepting ? 0x4CAF50 : 0xFF4444, // Green or red
        fields: [
          {
            name: '📊 Status',
            value: isAccepting ? '🟢 **ACCEPTING ORDERS**' : '🔴 **ORDERS CLOSED**',
            inline: true,
          },
          {
            name: '⏰ Updated',
            value: new Date().toLocaleString(),
            inline: true,
          },
          {
            name: '🔄 Next Update',
            value: 'Check back later for updates',
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Logify Makers - Order Status System',
        },
        thumbnail: {
          url: isAccepting 
            ? 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=100&fit=crop&crop=center'
            : 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=100&h=100&fit=crop&crop=center',
        },
      };

      const payload: DiscordWebhookPayload = {
        content: `🔔 **ORDER STATUS UPDATE** 🔔\n${isAccepting ? '🎉 We&apos;re back and ready for new projects!' : '⏸️ Taking a short break - we&apos;ll be back soon!'}`,
        embeds: [embed],
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LogifyMakers/2.0',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Discord webhook failed:', response.status, response.statusText, errorText);
        throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Status update sent to Discord successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send status update to Discord:', error);
      return false;
    }
  }

  static async sendAdminAlert(message: string, adminAction: string, webhookUrl?: string): Promise<boolean> {
    try {
      const url = webhookUrl || await this.getWebhookUrl();
      
      if (!url) {
        console.log('⚠️ No webhook URL configured, skipping Discord notification');
        return false;
      }

      console.log('🚨 Sending admin alert to Discord:', { message, adminAction });

      const embed = {
        title: '🛡️ Admin Action Alert',
        description: message,
        color: 0xFF9800, // Orange
        fields: [
          {
            name: '🔧 Action Performed',
            value: adminAction,
            inline: false,
          },
          {
            name: '⏰ Timestamp',
            value: new Date().toLocaleString(),
            inline: true,
          },
          {
            name: '🔐 Security Level',
            value: 'Admin Authenticated',
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Logify Makers - Admin Security System',
        },
        thumbnail: {
          url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop&crop=center',
        },
      };

      const payload: DiscordWebhookPayload = {
        content: '🔔 **ADMIN ALERT** 🔔\nAn administrative action has been performed.',
        embeds: [embed],
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LogifyMakers/2.0',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Discord webhook failed:', response.status, response.statusText, errorText);
        throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Admin alert sent to Discord successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send admin alert to Discord:', error);
      return false;
    }
  }

  static async isWebhookConfigured(): Promise<boolean> {
    const url = await this.getWebhookUrl();
    return url !== null && url.startsWith('https://discord.com/api/webhooks/');
  }

  static async testWebhookConnection(webhookUrl?: string): Promise<{ success: boolean; message: string }> {
    try {
      const url = webhookUrl || await this.getWebhookUrl();
      
      if (!url) {
        return {
          success: false,
          message: 'Webhook URL not configured',
        };
      }

      const testPayload: DiscordWebhookPayload = {
        content: '🧪 **Webhook Test**',
        embeds: [{
          title: '🔧 Connection Test',
          description: 'This is a test message to verify webhook connectivity.',
          color: 0x00FF00,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Logify Makers - Webhook Test',
          },
        }],
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'LogifyMakers/2.0',
        },
        body: JSON.stringify(testPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'Webhook connection successful',
      };
    } catch (error) {
      console.error('Webhook test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
