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



// ✅ Importing analytics automatically uses configured native Firebase app
analytics();

// ✅ Register main app component
AppRegistry.registerComponent(appName, () => App);

