import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import courseService from '../../services/courseService';

interface CourseState {
  recommendations: any[];
  searchResults: any[];
  courseDetails: any | null;
  learningPath: any | null;
  progress: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  recommendations: [],
  searchResults: [],
  courseDetails: null,
  learningPath: null,
  progress: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getCourseRecommendations = createAsyncThunk(
  'course/getRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseService.getRecommendations();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get course recommendations');
    }
  }
);

export const searchCourses = createAsyncThunk(
  'course/search',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await courseService.searchCourses(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search courses');
    }
  }
);

export const getCourseDetails = createAsyncThunk(
  'course/getDetails',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await courseService.getCourseDetails(courseId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get course details');
    }
  }
);

export const markCourseCompleted = createAsyncThunk(
  'course/markCompleted',
  async ({ courseId, data }: { courseId: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await courseService.markCourseCompleted(courseId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark course as completed');
    }
  }
);

export const getLearningPath = createAsyncThunk(
  'course/getLearningPath',
  async (careerGoal: string, { rejectWithValue }) => {
    try {
      const response = await courseService.getLearningPath(careerGoal);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get learning path');
    }
  }
);

export const getLearningProgress = createAsyncThunk(
  'course/getProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseService.getLearningProgress();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get learning progress');
    }
  }
);

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCourseDetails: (state) => {
      state.courseDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get recommendations
      .addCase(getCourseRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourseRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendations = action.payload.recommendations || [];
      })
      .addCase(getCourseRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Search courses
      .addCase(searchCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.courses || [];
      })
      .addCase(searchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Course details
      .addCase(getCourseDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourseDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courseDetails = action.payload.course;
      })
      .addCase(getCourseDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Mark completed
      .addCase(markCourseCompleted.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markCourseCompleted.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(markCourseCompleted.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Learning path
      .addCase(getLearningPath.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLearningPath.fulfilled, (state, action) => {
        state.isLoading = false;
        state.learningPath = action.payload.learningPath;
      })
      .addCase(getLearningPath.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Learning progress
      .addCase(getLearningProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLearningProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.progress = action.payload.progress;
      })
      .addCase(getLearningProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCourseDetails } = courseSlice.actions;
export default courseSlice.reducer;
