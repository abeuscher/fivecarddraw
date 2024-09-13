// MessageBox.ts

import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AppDispatch } from './index'; // Ensure correct import path
import { MessageBox } from '@/types'; // Adjust the import based on your types location

// Slice for managing message state
const messageSlice = createSlice({
  name: 'message',
  initialState: null as MessageBox | null,
  reducers: {
    setMessage: (state, action: PayloadAction<MessageBox>) => action.payload,
    clearMessage: () => null,
  },
});

// Export actions from the slice
export const { setMessage, clearMessage } = messageSlice.actions;

// Export the reducer to be used in the store
export default messageSlice.reducer;

// Corrected Thunk Action for setting a message with an expiration
export const setMessageWithExpiration = (message: MessageBox) => (dispatch: AppDispatch) => {
  dispatch(setMessage(message));
  setTimeout(() => dispatch(clearMessage()), message.duration);
};
