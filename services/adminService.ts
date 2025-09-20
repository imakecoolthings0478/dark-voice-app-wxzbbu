
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminSession } from '../types';

export class AdminService {
  private static readonly PASSCODE = 'logify@makers@91!@$%!';
  private static readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly SESSION_KEY = 'admin_session';

  static async authenticate(passcode: string): Promise<boolean> {
    if (passcode !== this.PASSCODE) {
      console.log('❌ Invalid admin passcode attempt');
      return false;
    }

    const session: AdminSession = {
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.SESSION_DURATION).toISOString(),
    };

    try {
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      console.log('✅ Admin authenticated successfully');
      return true;
    } catch (error) {
      console.error('Error saving admin session:', error);
      return false;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return false;

      const session: AdminSession = JSON.parse(sessionData);
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      if (now > expiresAt) {
        await this.logout();
        console.log('⏰ Admin session expired');
        return false;
      }

      return session.isAuthenticated;
    } catch (error) {
      console.error('Error checking admin authentication:', error);
      return false;
    }
  }

  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
      console.log('✅ Admin logged out successfully');
    } catch (error) {
      console.error('Error during admin logout:', error);
    }
  }

  static async extendSession(): Promise<boolean> {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return false;

      const session: AdminSession = JSON.parse(sessionData);
      session.expiresAt = new Date(Date.now() + this.SESSION_DURATION).toISOString();

      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      console.log('✅ Admin session extended');
      return true;
    } catch (error) {
      console.error('Error extending admin session:', error);
      return false;
    }
  }

  static async getSessionInfo(): Promise<AdminSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return null;

      return JSON.parse(sessionData);
    } catch (error) {
      console.error('Error getting session info:', error);
      return null;
    }
  }
}
