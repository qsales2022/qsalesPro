// App.tsx
import 'intl-pluralrules';
import React, { useEffect, useRef, useState } from 'react';
import './src/assets/i18n/i18n';

import Navigation from './src/Navigation';
import { store, persistor } from './src/redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast, { ToastConfig } from 'react-native-toast-message';
import { Text, View, TouchableOpacity, AppState, Platform } from 'react-native';
import { lightenColor } from './src/Theme/Constants';
import Colors from './src/Theme/Colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@rneui/themed';
import { HotUpdater, getUpdateSource } from '@hot-updater/react-native';
import { firstUser, getFirstUser } from './src/AsyncStorage/StorageUtil';


const App = () => {
  const [trackingPermission] = useState<string>('not-determined');
  const appState = useRef<string>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (next: string) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        console.log('App returned to foreground');
      }
      appState.current = next;
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub?.remove();
  }, []);

  useEffect(() => {
    const initApp = async () => {
      const isFirstLaunch = await getFirstUser('isFirstLaunch');
      if (!isFirstLaunch) {
        await firstUser('isFirstLaunch', 'true');
        console.log('🆕 First app launch detected');
      }
    };
    void initApp();
  }, []);

  const toastConfig: ToastConfig = {
    success: ({ text1, text2, ...rest }) => (
      <TouchableOpacity
        style={{ backgroundColor: Colors.white, padding: 16, borderRadius: 8, marginHorizontal: 16, marginVertical: 8, borderWidth: 5, borderColor: '#4CAF50' }}
        {...rest}
      >
        <Text style={{ color: Colors.black, fontWeight: 'bold' }}>{text1}</Text>
        {text2 ? <Text>{text2}</Text> : null}
      </TouchableOpacity>
    ),
    error: ({ text1, text2, ...rest }) => (
      <View style={{ backgroundColor: 'red', padding: 16, borderRadius: 8, marginHorizontal: 16, marginVertical: 8 }} {...rest}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>{text1}</Text>
        {text2 ? <Text style={{ color: 'white' }}>{text2}</Text> : null}
      </View>
    ),
    info: ({ text1, text2, ...rest }) => (
      <View style={{ backgroundColor: 'blue', padding: 16, borderRadius: 8, marginHorizontal: 16, marginVertical: 8 }} {...rest}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>{text1}</Text>
        {text2 ? <Text style={{ color: 'white' }}>{text2}</Text> : null}
      </View>
    ),
    warning: ({ text1, text2, ...rest }) => (
      <TouchableOpacity
        style={{ backgroundColor: lightenColor(Colors.black, 20), padding: 16, borderRadius: 30, marginHorizontal: 16, marginVertical: 8 }}
        {...rest}
      >
        <Text style={{ color: Colors.white, fontWeight: 'bold' }}>{text1}</Text>
        {text2 ? <Text style={{ color: 'white' }}>{text2}</Text> : null}
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
 
// ---- HotUpdater wrapper (correct brackets + headers go HERE) ----
export default HotUpdater.wrap({
  source: getUpdateSource(
    'https://hot-updater.qsales2022.workers.dev/api/check-update',
    {
      updateStrategy: 'appVersion',
    }
  ),
  requestHeaders: {},
  reloadOnForceUpdate: true,
  
  fallbackComponent: ({ progress, status, error }: any) => (
    <View style={{ flex: 1, padding: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
        {status === 'UPDATING' ? 'Updating…' : error ? 'Update check failed' : 'Checking for Update…'}
      </Text>
      {error ? <Text style={{ color: 'white', marginTop: 6 }}>{String(error)}</Text> : null}
      {progress > 0 ? <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 6 }}>{Math.round(progress * 100)}%</Text> : null}
    </View>
  ),
})(App);
