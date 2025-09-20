
import NetInfo from '@react-native-community/netinfo';

export class NetworkService {
  static async checkInternetConnection(): Promise<boolean> {
    try {
      const netInfoState = await NetInfo.fetch();
      console.log('Network state:', netInfoState);
      return netInfoState.isConnected === true && netInfoState.isInternetReachable === true;
    } catch (error) {
      console.error('Error checking internet connection:', error);
      return false;
    }
  }

  static subscribeToNetworkChanges(callback: (isConnected: boolean) => void) {
    return NetInfo.addEventListener(state => {
      const isConnected = state.isConnected === true && state.isInternetReachable === true;
      console.log('Network connection changed:', isConnected);
      callback(isConnected);
    });
  }

  static async waitForConnection(timeout: number = 10000): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkConnection = async () => {
        const isConnected = await this.checkInternetConnection();
        
        if (isConnected) {
          resolve(true);
          return;
        }
        
        if (Date.now() - startTime >= timeout) {
          resolve(false);
          return;
        }
        
        setTimeout(checkConnection, 1000);
      };
      
      checkConnection();
    });
  }
}
