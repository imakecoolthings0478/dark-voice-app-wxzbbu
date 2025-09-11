
import { DesignRequest } from '../types';

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
  }>;
}

export class DiscordService {
  // Replace this with your actual Discord webhook URL
  private static WEBHOOK_URL = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';

  static async sendRequestToDiscord(request: Partial<DesignRequest>): Promise<boolean> {
    try {
      console.log('Sending request to Discord:', request);

      const embed = {
        title: '🎨 New Design Request',
        description: `A new ${request.service_type} request has been submitted!`,
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
            name: '📝 Description',
            value: request.description || 'No description provided',
            inline: false,
          },
          {
            name: '📞 Contact Info',
            value: request.contact_info || 'Not provided',
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Logify Makers - Design Request System',
        },
      };

      const payload: DiscordWebhookPayload = {
        content: '📢 **New Design Request Alert!**',
        embeds: [embed],
      };

      // Check if webhook URL is configured
      if (this.WEBHOOK_URL.includes('YOUR_WEBHOOK')) {
        console.log('⚠️ Discord webhook not configured - using simulation mode');
        console.log('Payload that would be sent:', JSON.stringify(payload, null, 2));
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Request simulated successfully (webhook not configured)');
        return true;
      }

      // Make actual HTTP request to Discord webhook
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Request sent to Discord successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send request to Discord:', error);
      return false;
    }
  }

  static async sendStatusUpdate(message: string, isAccepting: boolean): Promise<boolean> {
    try {
      console.log('Sending status update to Discord:', { message, isAccepting });

      const embed = {
        title: isAccepting ? '✅ Orders Now Open!' : '❌ Orders Closed',
        description: message,
        color: isAccepting ? 0x4CAF50 : 0xFF4444, // Green or red
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Logify Makers - Status Update',
        },
      };

      const payload: DiscordWebhookPayload = {
        content: `🔔 **Order Status Update**`,
        embeds: [embed],
      };

      // Check if webhook URL is configured
      if (this.WEBHOOK_URL.includes('YOUR_WEBHOOK')) {
        console.log('⚠️ Discord webhook not configured - using simulation mode');
        console.log('Status update that would be sent:', JSON.stringify(payload, null, 2));
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ Status update simulated successfully (webhook not configured)');
        return true;
      }

      // Make actual HTTP request to Discord webhook
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Status update sent to Discord successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send status update to Discord:', error);
      return false;
    }
  }

  static async sendAdminAlert(message: string, adminAction: string): Promise<boolean> {
    try {
      console.log('Sending admin alert to Discord:', { message, adminAction });

      const embed = {
        title: '🚨 Admin Action Alert',
        description: message,
        color: 0xFF9800, // Orange
        fields: [
          {
            name: '🔧 Action',
            value: adminAction,
            inline: true,
          },
          {
            name: '⏰ Time',
            value: new Date().toLocaleString(),
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Logify Makers - Admin System',
        },
      };

      const payload: DiscordWebhookPayload = {
        content: `🔔 **Admin Alert**`,
        embeds: [embed],
      };

      // Check if webhook URL is configured
      if (this.WEBHOOK_URL.includes('YOUR_WEBHOOK')) {
        console.log('⚠️ Discord webhook not configured - using simulation mode');
        console.log('Admin alert that would be sent:', JSON.stringify(payload, null, 2));
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('✅ Admin alert simulated successfully (webhook not configured)');
        return true;
      }

      // Make actual HTTP request to Discord webhook
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Admin alert sent to Discord successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send admin alert to Discord:', error);
      return false;
    }
  }

  // Method to update webhook URL (for when user provides it)
  static updateWebhookUrl(newUrl: string): void {
    if (newUrl && newUrl.startsWith('https://discord.com/api/webhooks/')) {
      this.WEBHOOK_URL = newUrl;
      console.log('✅ Discord webhook URL updated successfully');
    } else {
      console.error('❌ Invalid Discord webhook URL format');
      throw new Error('Invalid Discord webhook URL format');
    }
  }

  // Method to check if webhook is configured
  static isWebhookConfigured(): boolean {
    return !this.WEBHOOK_URL.includes('YOUR_WEBHOOK');
  }
}
