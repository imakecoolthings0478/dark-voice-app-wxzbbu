
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
  private static WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL_HERE'; // This would be configured in settings

  static async sendRequestToDiscord(request: Partial<DesignRequest>): Promise<boolean> {
    try {
      // For demo purposes, we'll simulate sending to Discord
      // In production, you would use a real Discord webhook URL
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

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, you would make an actual HTTP request:
      /*
      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
      }
      */

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

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('✅ Status update sent to Discord successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send status update to Discord:', error);
      return false;
    }
  }
}
