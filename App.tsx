// import 'intl-pluralrules';
// import React, { useEffect, useState } from 'react';
// import './src/assets/i18n/i18n';

// import Navigation from './src/Navigation';
// import { store, persistor } from './src/redux/store';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import Toast, { ToastConfig } from 'react-native-toast-message';
// import { Text, View, TouchableOpacity, Platform, AppState } from 'react-native';
// import { getHeight, getWidth, lightenColor } from './src/Theme/Constants';
// import Colors from './src/Theme/Colors';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';
// import { ThemeProvider } from '@rneui/themed';
// import { firstUser, getFirstUser } from './src/AsyncStorage/StorageUtil';
// import { withStallion } from 'react-native-stallion';
// import { requestTrackingPermission } from 'react-native-tracking-transparency';

// const App = () => {
//   const [trackingPermission, setTrackingPermission] =
//     useState<string>('not-determined');

//   // ✅ ATT permission request
//   // const requestATTPermission = async () => {
//   //   if (Platform.OS !== 'ios') {
//   //     Settings.setAdvertiserTrackingEnabled(true);
//   //     Settings.setAdvertiserIDCollectionEnabled(true);
//   //     return;
//   //   }

//   //   try {
//   //     const status = await requestTrackingPermission();
//   //     if (trackingPermission !== status) setTrackingPermission(status);

//   //     switch (status) {
//   //       case 'authorized':
//   //         Settings.setAdvertiserTrackingEnabled(true);
//   //         Settings.setAdvertiserIDCollectionEnabled(true);
//   //         Settings.setAutoLogAppEventsEnabled(true);
//   //         await AsyncStorage.setItem('att_status', 'authorized');
//   //         break;
//   //       case 'denied':
//   //       case 'restricted':
//   //         Settings.setAdvertiserTrackingEnabled(false);
//   //         Settings.setAdvertiserIDCollectionEnabled(false);
//   //         Settings.setAutoLogAppEventsEnabled(true);
//   //         await AsyncStorage.setItem('att_status', 'denied');
//   //         break;
//   //       case 'unavailable':
//   //         Settings.setAdvertiserTrackingEnabled(true);
//   //         Settings.setAdvertiserIDCollectionEnabled(true);
//   //         Settings.setAutoLogAppEventsEnabled(true);
//   //         await AsyncStorage.setItem('att_status', 'unavailable');
//   //         break;
//   //       default:
//   //         Settings.setAdvertiserTrackingEnabled(false);
//   //         Settings.setAdvertiserIDCollectionEnabled(false);
//   //         await AsyncStorage.setItem('att_status', 'unknown');
//   //     }
//   //   } catch (error) {
//   //     console.error('🚨 ATT Permission request failed:', error);
//   //     Settings.setAdvertiserTrackingEnabled(false);
//   //     Settings.setAdvertiserIDCollectionEnabled(false);
//   //     await AsyncStorage.setItem('att_status', 'error');
//   //   }
//   // };

//   // ✅ Handle app state changes safely

//   // ✅ First launch & ATT request
//   useEffect(() => {
//     const initApp = async () => {
//       const isFirstLaunch = await getFirstUser('isFirstLaunch');
//       if (!isFirstLaunch) {
//         firstUser('isFirstLaunch', 'true');
//         console.log('🆕 First app launch detected');
//       }

//       // Delay ATT request to avoid UI conflicts
//       // setTimeout(() => {
//         // requestATTPermission();
//       // }, 2000);
//     };

//     initApp();
//   }, []);

//   // ✅ Listen to AppState changes once

//   // ✅ Toast configuration
//   const toastConfig: ToastConfig = {
//     success: ({ text1, text2, ...rest }) => (
//       <TouchableOpacity
//         style={{
//           backgroundColor: Colors.white,
//           padding: 16,
//           borderRadius: 8,
//           marginHorizontal: 16,
//           marginVertical: 8,
//           elevation: 3,
//           borderWidth: 5,
//           borderColor: '#4CAF50',
//         }}
//         {...rest}
//       >
//         <Text style={{ color: Colors.black, fontWeight: 'bold' }}>{text1}</Text>
//       </TouchableOpacity>
//     ),
//     error: ({ text1, text2, ...rest }) => (
//       <View
//         style={{
//           backgroundColor: 'red',
//           paddingHorizontal: 16,
//           paddingVertical: 10,
//           borderRadius: 10,
//         }}
//       >
//         <Text style={{ color: 'white', fontWeight: 'bold' }}>{text1}</Text>
//         <Text>{text2}</Text>
//       </View>
//     ),
//     info: ({ text1, text2, ...rest }) => (
//       <View style={{ backgroundColor: 'blue', padding: 16 }}>
//         <Text>{text1}</Text>
//         <Text>{text2}</Text>
//       </View>
//     ),
//     warning: ({ text1, text2, ...rest }) => (
//       <TouchableOpacity
//         style={{
//           backgroundColor: lightenColor(Colors.black, 20),
//           padding: 16,
//           borderRadius: 30,
//           marginHorizontal: 16,
//           marginVertical: 8,
//         }}
//         {...rest}
//       >
//         <Text style={{ color: Colors.white, fontWeight: 'bold' }}>{text1}</Text>
//       </TouchableOpacity>
//     ),
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <Provider store={store}>
//         <PersistGate loading={null} persistor={persistor}>
//           <ThemeProvider>
//             <Navigation />

//           </ThemeProvider>
//         </PersistGate>
//         <Toast config={toastConfig} />
//       </Provider>
//     </GestureHandlerRootView>
//   );
// };

// export default withStallion(App);

import 'intl-pluralrules';
import React, { useEffect, useState, useRef } from 'react';
import './src/assets/i18n/i18n';

import Navigation from './src/Navigation';
import { store, persistor } from './src/redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast, { ToastConfig } from 'react-native-toast-message';
import { Text, View, TouchableOpacity, Platform, AppState } from 'react-native';
import { getHeight, getWidth, lightenColor } from './src/Theme/Constants';
import Colors from './src/Theme/Colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';
import { ThemeProvider } from '@rneui/themed';
import { firstUser, getFirstUser } from './src/AsyncStorage/StorageUtil';
import { withStallion } from 'react-native-stallion';
import { requestTrackingPermission } from 'react-native-tracking-transparency';

const App = () => {
  const [trackingPermission, setTrackingPermission] =
    useState<string>('not-determined');
  const appState = useRef<any>(AppState.currentState);

  // ATT permission request
  // const requestATTPermission = async () => {
  //   try {
  //     if (Platform.OS !== 'ios') {
  //       await Settings.setAdvertiserTrackingEnabled(true);
  //       Settings.setAdvertiserIDCollectionEnabled(true);
  //       return 'authorized';
  //     }

  //     const status = await requestTrackingPermission();

  //     if (status === 'authorized') {
  //      await Settings.setAdvertiserTrackingEnabled(true);
  //       Settings.setAdvertiserIDCollectionEnabled(true);
  //     } else {
  //     await  Settings.setAdvertiserTrackingEnabled(false);
  //       Settings.setAdvertiserIDCollectionEnabled(false);
  //     }

  //     // Always enable auto log (Apple allows this)
  //     Settings.setAutoLogAppEventsEnabled(true);

  //     await AsyncStorage.setItem('att_status', status);
  //     return status;
  //   } catch (error) {
  //     console.error('🚨 ATT Permission request failed:', error);
  //    await Settings.setAdvertiserTrackingEnabled(false);
  //     Settings.setAdvertiserIDCollectionEnabled(false);
  //     await AsyncStorage.setItem('att_status', 'error');
  //     return 'error';
  //   }
  // };

  // Handle app state changes safely
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        // Handle app foreground logic here
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => subscription?.remove();
  }, []);

  // First launch & ATT request with proper timing
  useEffect(() => {
    const initApp = async () => {
      try {
        const isFirstLaunch = await getFirstUser('isFirstLaunch');
        if (!isFirstLaunch) {
          firstUser('isFirstLaunch', 'true');
          console.log('🆕 First app launch detected');
        }
        // Check if we've already handled ATT permission
        // const attStatus = await AsyncStorage.getItem('att_status');

        // Only request ATT permission if not already handled
        // if (!attStatus || attStatus === 'not-determined') {
        //   // Delay ATT request to ensure app is fully loaded
        //   setTimeout(() => {
        //     requestATTPermission();
        //   }, 3000); // Increased delay to 3 seconds
        // } else {
        //   console.log('ATT already handled with status:', attStatus);
        // }
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initApp();
  }, []);
  // Toast configuration
  const toastConfig: ToastConfig = {
    success: ({ text1, text2, ...rest }) => (
      <TouchableOpacity
        style={{
          backgroundColor: Colors.white,
          padding: 16,
          borderRadius: 8,
          marginHorizontal: 16,
          marginVertical: 8,
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          borderWidth: 5,
          borderColor: '#4CAF50',
        }}
        {...rest}
      >
        <Text style={{ color: Colors.black, fontWeight: 'bold' }}>{text1}</Text>
        {text2 && <Text style={{ color: Colors.black }}>{text2}</Text>}
      </TouchableOpacity>
    ),
    error: ({ text1, text2, ...rest }) => (
      <View
        style={{
          backgroundColor: 'red',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
          marginHorizontal: 16,
          marginVertical: 8,
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
        {...rest}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>{text1}</Text>
        {text2 && <Text style={{ color: 'white' }}>{text2}</Text>}
      </View>
    ),
    info: ({ text1, text2, ...rest }) => (
      <View
        style={{
          backgroundColor: 'blue',
          padding: 16,
          borderRadius: 8,
          marginHorizontal: 16,
          marginVertical: 8,
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
        {...rest}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>{text1}</Text>
        {text2 && <Text style={{ color: 'white' }}>{text2}</Text>}
      </View>
    ),
    warning: ({ text1, text2, ...rest }) => (
      <TouchableOpacity
        style={{
          backgroundColor: lightenColor(Colors.black, 20),
          padding: 16,
          borderRadius: 30,
          marginHorizontal: 16,
          marginVertical: 8,
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
        {...rest}
      >
        <Text style={{ color: Colors.white, fontWeight: 'bold' }}>{text1}</Text>
        {text2 && <Text style={{ color: Colors.white }}>{text2}</Text>}
      </TouchableOpacity>
    ),
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <Navigation />
            <Toast config={toastConfig} />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default withStallion(App);
