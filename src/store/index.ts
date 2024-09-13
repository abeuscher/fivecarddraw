import { configureStore } from '@reduxjs/toolkit';
import gameSlice from '@/store/gameSlice';
import messageReducer from '@/store/MessageBox';
import { useDispatch } from 'react-redux';

const store = configureStore({
  reducer: {
    game: gameSlice,
    message: messageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;