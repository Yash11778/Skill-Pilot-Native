import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../services/authService';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// Helper: extract the best user-friendly error message from an axios error
const extractErrorMessage = (error: any, fallback: string): string =>
  error.userMessage ||
  error.response?.data?.message ||
  error.message ||
  fallback;

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        return response;
      } else {
        return rejectWithValue(response.message || 'Registration failed');
      }
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Registration failed. Please try again.'));
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        return response;
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Login failed. Please try again.'));
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to get user data'));
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      AsyncStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.isAuthenticated = true;
        state.error = null;
        AsyncStorage.setItem('token', action.payload.data.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...action.payload.data.user, profileCompleted: true };
        state.token = action.payload.data.token;
        state.isAuthenticated = true;
        state.error = null;
        AsyncStorage.setItem('token', action.payload.data.token);
        AsyncStorage.setItem('onboardingComplete', 'true');
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        AsyncStorage.removeItem('token');
      });
  },
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
