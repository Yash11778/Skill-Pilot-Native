import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import assessmentReducer from './slices/assessmentSlice';
import careerReducer from './slices/careerSlice';
import courseReducer from './slices/courseSlice';
import mentorReducer from './slices/mentorSlice';
import aiReducer from './slices/aiSlice';
import uiReducer from './slices/uiSlice';

// Persist config
const persistConfig = {
  key: 'skillpilot',
  storage: AsyncStorage,
  whitelist: ['auth', 'user'],
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  assessment: assessmentReducer,
  career: careerReducer,
  course: courseReducer,
  mentor: mentorReducer,
  ai: aiReducer,
  ui: uiReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
