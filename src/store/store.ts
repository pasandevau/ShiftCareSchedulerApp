import { configureStore } from '@reduxjs/toolkit';
import bookingManagerReducer from './bookingManagerSlice';

export const store = configureStore({
    reducer: {
        bookingManager: bookingManagerReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;