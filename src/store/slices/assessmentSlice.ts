import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import assessmentService from '../../services/assessmentService';

interface AssessmentState {
  assessments: any[];
  currentAssessment: any | null;
  userResults: any[];
  currentResult: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AssessmentState = {
  assessments: [],
  currentAssessment: null,
  userResults: [],
  currentResult: null,
  isLoading: false,
  error: null,
};

export const getAssessments = createAsyncThunk(
  'assessment/getAssessments',
  async (filters: any, { rejectWithValue }) => {
    try {
      const response = await assessmentService.getAssessments(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get assessments');
    }
  }
);

export const submitAssessment = createAsyncThunk(
  'assessment/submitAssessment',
  async ({ assessmentId, responses, completionTime }: any, { rejectWithValue }) => {
    try {
      const response = await assessmentService.submitAssessment(assessmentId, {
        responses,
        completionTime,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit assessment');
    }
  }
);

const assessmentSlice = createSlice({
  name: 'assessment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAssessment: (state) => {
      state.currentAssessment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAssessments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAssessments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assessments = action.payload.assessments;
      })
      .addCase(getAssessments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(submitAssessment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitAssessment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentResult = action.payload.result;
      })
      .addCase(submitAssessment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentAssessment } = assessmentSlice.actions;
export default assessmentSlice.reducer;
