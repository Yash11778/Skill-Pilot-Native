import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import aiService from '../../services/aiService';

interface AiState {
  chatHistory: any[];
  skillGapAnalysis: any | null;
  careerRoadmap: any | null;
  marketInsights: any | null;
  careerAdvice: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AiState = {
  chatHistory: [],
  skillGapAnalysis: null,
  careerRoadmap: null,
  marketInsights: null,
  careerAdvice: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const chatWithAI = createAsyncThunk(
  'ai/chat',
  async ({ message, conversationHistory }: { message: string; conversationHistory?: any[] }, { rejectWithValue }) => {
    try {
      const response = await aiService.chatWithAI(message, conversationHistory);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to chat with AI');
    }
  }
);

export const getCareerAdvice = createAsyncThunk(
  'ai/careerAdvice',
  async ({ question, context }: { question: string; context?: string }, { rejectWithValue }) => {
    try {
      const response = await aiService.getCareerAdvice(question, context);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get career advice');
    }
  }
);

export const getSkillGapAnalysis = createAsyncThunk(
  'ai/skillGap',
  async (jobTitle: string, { rejectWithValue }) => {
    try {
      const response = await aiService.getSkillGapAnalysis(jobTitle);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get skill gap analysis');
    }
  }
);

export const getCareerRoadmap = createAsyncThunk(
  'ai/roadmap',
  async (careerGoal: string, { rejectWithValue }) => {
    try {
      const response = await aiService.getCareerRoadmap(careerGoal);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get career roadmap');
    }
  }
);

export const getMarketInsights = createAsyncThunk(
  'ai/marketInsights',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await aiService.getMarketInsights(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get market insights');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Chat with AI
      .addCase(chatWithAI.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(chatWithAI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chatHistory.push({
          role: 'assistant',
          content: action.payload.response,
          timestamp: action.payload.timestamp,
        });
      })
      .addCase(chatWithAI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Career advice
      .addCase(getCareerAdvice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCareerAdvice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.careerAdvice = action.payload;
      })
      .addCase(getCareerAdvice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Skill gap analysis
      .addCase(getSkillGapAnalysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSkillGapAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.skillGapAnalysis = action.payload.analysis;
      })
      .addCase(getSkillGapAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Career roadmap
      .addCase(getCareerRoadmap.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCareerRoadmap.fulfilled, (state, action) => {
        state.isLoading = false;
        state.careerRoadmap = action.payload.roadmap;
      })
      .addCase(getCareerRoadmap.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Market insights
      .addCase(getMarketInsights.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMarketInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.marketInsights = action.payload.insights;
      })
      .addCase(getMarketInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, addChatMessage, clearChatHistory } = aiSlice.actions;
export default aiSlice.reducer;
