// message.ts

import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { MessageBox } from '@/types';

const messageSlice = createSlice({
  name: 'message',
  initialState: null as MessageBox | null,
  reducers: {
    setMessage: (state, action: PayloadAction<MessageBox>) => action.payload,
    clearMessage: () => null,
  },
});

export const { setMessage, clearMessage } = messageSlice.actions;
export default messageSlice.reducer;

// Thunk for setting message with expiration
export const setMessageWithExpiration = (message: MessageBox) => (dispatch: any) => {
  dispatch(setMessage(message));
  setTimeout(() => dispatch(clearMessage()), message.duration);
};