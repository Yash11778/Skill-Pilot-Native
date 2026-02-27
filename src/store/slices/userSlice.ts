import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

interface UserState {
  profile: any | null;
  dashboardData: any | null;
  isLoading: boolean;
  error: string | null;
  profileCompleteness: number;
}

const initialState: UserState = {
  profile: null,
  dashboardData: null,
  isLoading: false,
  error: null,
  profileCompleteness: 0,
};

// ... (code between Lines 10 and 43 skipped, assuming replace_file_content cannot skip lines seamlessly in one call unless contiguous.
// Wait, I can't modify non-contiguous lines in one go with replace_file_content.
// I will split this into two calls or just Replace the whole chunk if it's small, but here there is a thunk in between.
// I'll use multi_replace_file_content for userSlice.ts or just make two calls.
// Actually, I'll use separate calls for clarity, or just fix the interface first then the reducer.
// I'll use multi_replace_file_content for userSlice.ts.


export const getProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getProfile();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const getDashboard = createAsyncThunk(
  'user/getDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getDashboard();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get dashboard data');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLocalProfile: (state, action) => {
      state.profile = { ...(state.profile || {}), ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
        state.profileCompleteness = action.payload.user.profileCompleteness || 0;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
        state.profileCompleteness = action.payload.user.profileCompleteness || 0;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Dashboard
      .addCase(getDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateLocalProfile } = userSlice.actions;
export default userSlice.reducer;
