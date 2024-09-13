// src/__tests__/MessageBox.test.ts

import { clearMessage, setMessage, setMessageWithExpiration } from '@/store/MessageBox'; // Ensure correct path

import { AppDispatch } from '@/store'; // Ensure correct path

// Jest mock for dispatch
const mockDispatch = jest.fn<AppDispatch>();

// Enable fake timers globally in the test setup
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers(); // Restore real timers after each test to avoid side effects
});

describe('setMessageWithExpiration', () => {
  beforeEach(() => {
    // Reset mock dispatch before each test
    mockDispatch.mockClear();
  });

  it('should dispatch setMessage and then clearMessage after the duration', () => {
    const message = { text: 'Test message', duration: 5000 };

    // Call the thunk with mock dispatch
    setMessageWithExpiration(message)(mockDispatch);

    // Verify setMessage was dispatched
    expect(mockDispatch).toHaveBeenCalledWith(setMessage(message));

    // Use Jest's timers to fast-forward time
    jest.advanceTimersByTime(5000);

    // Verify clearMessage was dispatched after the timeout
    expect(mockDispatch).toHaveBeenCalledWith(clearMessage());
  });
});
