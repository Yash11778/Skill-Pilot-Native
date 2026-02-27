import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mentorService from '../../services/mentorService';

interface MentorState {
  mentors: any[];
  connections: {
    mentors: any[];
    mentees: any[];
  };
  requests: any[];
  mentorProfile: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MentorState = {
  mentors: [],
  connections: {
    mentors: [],
    mentees: [],
  },
  requests: [],
  mentorProfile: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getMentors = createAsyncThunk(
  'mentor/getMentors',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await mentorService.getMentors(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get mentors');
    }
  }
);

export const sendMentorRequest = createAsyncThunk(
  'mentor/sendRequest',
  async ({ mentorId, message }: { mentorId: string; message?: string }, { rejectWithValue }) => {
    try {
      const response = await mentorService.sendMentorRequest(mentorId, message);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send mentor request');
    }
  }
);

export const respondToMentorRequest = createAsyncThunk(
  'mentor/respondToRequest',
  async ({ requestId, action }: { requestId: string; action: 'accept' | 'reject' }, { rejectWithValue }) => {
    try {
      const response = await mentorService.respondToRequest(requestId, action);
      return { ...response, requestId, action };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to respond to request');
    }
  }
);

export const getMentorRequests = createAsyncThunk(
  'mentor/getRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mentorService.getMentorRequests();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get mentor requests');
    }
  }
);

export const getConnections = createAsyncThunk(
  'mentor/getConnections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mentorService.getConnections();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get connections');
    }
  }
);

export const becomeMentor = createAsyncThunk(
  'mentor/register',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await mentorService.becomeMentor(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to register as mentor');
    }
  }
);

export const getMentorProfile = createAsyncThunk(
  'mentor/getProfile',
  async (mentorId: string, { rejectWithValue }) => {
    try {
      const response = await mentorService.getMentorProfile(mentorId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get mentor profile');
    }
  }
);

export const endMentorship = createAsyncThunk(
  'mentor/endMentorship',
  async (connectionId: string, { rejectWithValue }) => {
    try {
      const response = await mentorService.endMentorship(connectionId);
      return { ...response, connectionId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to end mentorship');
    }
  }
);

const mentorSlice = createSlice({
  name: 'mentor',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMentorProfile: (state) => {
      state.mentorProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get mentors
      .addCase(getMentors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMentors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mentors = action.payload.mentors || [];
      })
      .addCase(getMentors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send mentor request
      .addCase(sendMentorRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMentorRequest.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendMentorRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Respond to request
      .addCase(respondToMentorRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(respondToMentorRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the processed request from the list
        state.requests = state.requests.filter(r => r._id !== action.payload.requestId);
      })
      .addCase(respondToMentorRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get requests
      .addCase(getMentorRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMentorRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload.requests || [];
      })
      .addCase(getMentorRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get connections
      .addCase(getConnections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections = {
          mentors: action.payload.mentors || [],
          mentees: action.payload.mentees || [],
        };
      })
      .addCase(getConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Become mentor
      .addCase(becomeMentor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(becomeMentor.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(becomeMentor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get mentor profile
      .addCase(getMentorProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMentorProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mentorProfile = action.payload.mentor;
      })
      .addCase(getMentorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // End mentorship
      .addCase(endMentorship.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(endMentorship.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections.mentors = state.connections.mentors.filter(
          m => m._id !== action.payload.connectionId
        );
        state.connections.mentees = state.connections.mentees.filter(
          m => m._id !== action.payload.connectionId
        );
      })
      .addCase(endMentorship.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearMentorProfile } = mentorSlice.actions;
export default mentorSlice.reducer;
