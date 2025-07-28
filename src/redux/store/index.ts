import {configureStore, Middleware} from '@reduxjs/toolkit';
import rootReducer from '../reducers';
// @ts-ignore
import {createLogger} from 'redux-logger';
import {persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER} from 'redux-persist';
// @ts-ignore
import SQLiteStorage from 'redux-persist-sqlite-storage';
// @ts-ignore
import SQLite from 'react-native-sqlite-storage';
const sqliteConfig = {
  name: 'Qsales-DB',
};
const storeEngine = SQLiteStorage(SQLite, sqliteConfig);
const persistConfig = {
  key: 'root',
  storage: storeEngine,
  blacklist: ['globalReducer'],
};
const middleware: Middleware[] = [];
if (__DEV__) {
  middleware.push(createLogger());
}
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(middleware),
});
export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
