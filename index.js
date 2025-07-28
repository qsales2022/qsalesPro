/**
 * @format
 */

import 'intl-pluralrules';
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// ✅ Firebase – No need to call initializeApp if plist/json is added correctly
import analytics from '@react-native-firebase/analytics';

// ✅ Facebook SDK Setup
import { Settings } from 'react-native-fbsdk-next';

// ✅ iOS Tracking Permission
import { requestTrackingPermission } from 'react-native-tracking-transparency';

// ✅ Initialize Facebook SDK
Settings.initializeSDK();
Settings.setAdvertiserTrackingEnabled(true);
Settings.setAdvertiserIDCollectionEnabled(true);

if (Platform.OS === 'ios') {
  try {
    Settings.setDataProcessingOptions([]);
  } catch (e) {
    console.warn('Facebook SDK setDataProcessingOptions failed', e);
  }
}

// ✅ Request App Tracking Permission on iOS 14+
const requestTrackingPermissions = async () => {
  try {
    const status = await requestTrackingPermission();
    if (status === 'authorized' || status === 'unavailable') {
      Settings.setAdvertiserTrackingEnabled(true);
    }
  } catch (error) {
    console.warn('Tracking permission request failed', error);
  }
};
requestTrackingPermissions();

// ✅ Importing analytics automatically uses configured native Firebase app
analytics();

// ✅ Register main app component
AppRegistry.registerComponent(appName, () => App);

