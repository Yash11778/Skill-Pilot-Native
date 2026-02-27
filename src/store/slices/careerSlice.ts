import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import careerService from '../../services/careerService';

interface CareerState {
  recommendations: any[];
  jobs: any[];
  jobMatches: any[];
  careerPaths: any[];
  simulation: any | null;
  savedJobs: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CareerState = {
  recommendations: [],
  jobs: [],
  jobMatches: [],
  careerPaths: [],
  simulation: null,
  savedJobs: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const getCareerRecommendations = createAsyncThunk(
  'career/getRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await careerService.getRecommendations();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get career recommendations');
    }
  }
);

export const getJobs = createAsyncThunk(
  'career/getJobs',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await careerService.getJobs(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get jobs');
    }
  }
);

export const getCareerPaths = createAsyncThunk(
  'career/getPaths',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await careerService.getCareerPaths(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get career paths');
    }
  }
);

export const getJobMatches = createAsyncThunk(
  'career/getMatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await careerService.getJobMatches();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get job matches');
    }
  }
);

export const toggleSaveJob = createAsyncThunk(
  'career/toggleSaveJob',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await careerService.toggleSaveJob(jobId);
      return { ...response.data, jobId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save/unsave job');
    }
  }
);

export const getCareerSimulation = createAsyncThunk(
  'career/getSimulation',
  async (jobTitle: string, { rejectWithValue }) => {
    try {
      const response = await careerService.getSimulation(jobTitle);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get career simulation');
    }
  }
);

const careerSlice = createSlice({
  name: 'career',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSimulation: (state) => {
      state.simulation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get recommendations
      .addCase(getCareerRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCareerRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendations = action.payload.recommendations || [];
      })
      .addCase(getCareerRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get jobs
      .addCase(getJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload.jobs || [];
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get career paths
      .addCase(getCareerPaths.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCareerPaths.fulfilled, (state, action) => {
        state.isLoading = false;
        state.careerPaths = action.payload.careerPaths || [];
      })
      .addCase(getCareerPaths.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get job matches
      .addCase(getJobMatches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getJobMatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobMatches = action.payload.matches || [];
      })
      .addCase(getJobMatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Toggle save job
      .addCase(toggleSaveJob.fulfilled, (state, action) => {
        if (action.payload.saved) {
          state.savedJobs.push(action.payload.jobId);
        } else {
          state.savedJobs = state.savedJobs.filter(id => id !== action.payload.jobId);
        }
      })
      // Get simulation
      .addCase(getCareerSimulation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCareerSimulation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.simulation = action.payload.simulation;
      })
      .addCase(getCareerSimulation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSimulation } = careerSlice.actions;
export default careerSlice.reducer;
