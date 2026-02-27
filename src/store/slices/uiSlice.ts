import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  theme: string;
  notifications: any[];
  loading: Record<string, boolean>;
  modals: Record<string, { isOpen: boolean; data: any | null }>;
}

const initialState: UiState = {
  theme: 'light',
  notifications: [],
  loading: {},
  modals: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification: any) => notification.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    openModal: (state, action) => {
      const { modalId, data } = action.payload;
      state.modals[modalId] = {
        isOpen: true,
        data: data || null,
      };
    },
    closeModal: (state, action) => {
      const modalId = action.payload;
      if (state.modals[modalId]) {
        state.modals[modalId].isOpen = false;
      }
    },
  },
});

export const {
  setTheme,
  addNotification,
  removeNotification,
  setLoading,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
