// index.ts

import { configureStore } from '@reduxjs/toolkit';
import gameSlice from '@/store/gameSlice'; // Ensure correct import path
import messageReducer from '@/store/MessageBox'; // Ensure correct import path
import { useDispatch } from 'react-redux';

// Configure the Redux store with necessary reducers and middleware
const store = configureStore({
  reducer: {
    game: gameSlice,
    message: messageReducer,
  },
});

// Export types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Correctly typed useAppDispatch hook for components
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Export the configured store
export default store;
