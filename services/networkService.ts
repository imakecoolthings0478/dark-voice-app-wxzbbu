
import NetInfo from '@react-native-community/netinfo';

export class NetworkService {
  static async checkInternetConnection(): Promise<boolean> {
    try {
      const netInfoState = await NetInfo.fetch();
      console.log('Network state:', {
        isConnected: netInfoState.isConnected,
        isInternetReachable: netInfoState.isInternetReachable,
        type: netInfoState.type,
        details: netInfoState.details
      });
      
      // More thorough check - must be connected AND have internet access
      const hasConnection = netInfoState.isConnected === true;
      const hasInternet = netInfoState.isInternetReachable === true;
      
      // If isInternetReachable is null, we'll do an additional test
      if (hasConnection && netInfoState.isInternetReachable === null) {
        console.log('Internet reachability unknown, performing additional test...');
        return await this.performConnectivityTest();
      }
      
      return hasConnection && hasInternet;
    } catch (error) {
      console.error('Error checking internet connection:', error);
      return false;
    }
  }

  static async performConnectivityTest(): Promise<boolean> {
    try {
      // Test connectivity by trying to reach a reliable endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      const isConnected = response.status === 204 || response.status === 200;
      console.log('Connectivity test result:', isConnected);
      return isConnected;
    } catch (error) {
      console.log('Connectivity test failed:', error);
      return false;
    }
  }

  static subscribeToNetworkChanges(callback: (isConnected: boolean) => void) {
    return NetInfo.addEventListener(async (state) => {
      console.log('Network state changed:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type
      });
      
      const hasConnection = state.isConnected === true;
      const hasInternet = state.isInternetReachable === true;
      
      let isConnected = hasConnection && hasInternet;
      
      // If internet reachability is unknown, perform additional test
      if (hasConnection && state.isInternetReachable === null) {
        console.log('Performing additional connectivity test due to unknown internet reachability...');
        isConnected = await this.performConnectivityTest();
      }
      
      console.log('Final network connection status:', isConnected);
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
