
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
    thumbnail?: {
      url: string;
    };
  }>;
}

export class DiscordService {
  // Your Discord webhook URL - now properly configured
  private static WEBHOOK_URL = 'https://discord.com/api/webhooks/1415554112375885894/KiO3b06OI1SpTFnArMDbjaCzs-182nKqiOk6n1_bFkHBL9mw4YgA_x5hAxXiwsy0pIAC';

  static async sendRequestToDiscord(request: Partial<DesignRequest>): Promise<boolean> {
    try {
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
            value: new Date().toLocaleString(),
            inline: true,
          },
          {
            name: '🆔 Request ID',
            value: `REQ-${Date.now()}`,
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

      // Make HTTP request to Discord webhook
      const response = await fetch(this.WEBHOOK_URL, {
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
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          webhookUrl: this.WEBHOOK_URL.substring(0, 50) + '...',
        });
      }
      
      return false;
    }
  }

  static async sendStatusUpdate(message: string, isAccepting: boolean): Promise<boolean> {
    try {
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

      const response = await fetch(this.WEBHOOK_URL, {
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

  static async sendAdminAlert(message: string, adminAction: string): Promise<boolean> {
    try {
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

      const response = await fetch(this.WEBHOOK_URL, {
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

  // Method to update webhook URL (for when user provides it)
  static updateWebhookUrl(newUrl: string): void {
    if (newUrl && newUrl.startsWith('https://discord.com/api/webhooks/')) {
      this.WEBHOOK_URL = newUrl;
      console.log('✅ Discord webhook URL updated successfully');
      console.log('🔗 New webhook URL:', newUrl.substring(0, 50) + '...');
    } else {
      console.error('❌ Invalid Discord webhook URL format');
      throw new Error('Invalid Discord webhook URL format. Must start with "https://discord.com/api/webhooks/"');
    }
  }

  // Method to check if webhook is configured
  static isWebhookConfigured(): boolean {
    return this.WEBHOOK_URL && 
           this.WEBHOOK_URL.startsWith('https://discord.com/api/webhooks/') && 
           !this.WEBHOOK_URL.includes('YOUR_WEBHOOK');
  }

  // Method to get webhook status
  static getWebhookStatus(): { configured: boolean; url: string } {
    return {
      configured: this.isWebhookConfigured(),
      url: this.WEBHOOK_URL ? this.WEBHOOK_URL.substring(0, 50) + '...' : 'Not configured',
    };
  }

  // Method to test webhook connectivity
  static async testWebhookConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isWebhookConfigured()) {
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

      const response = await fetch(this.WEBHOOK_URL, {
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
