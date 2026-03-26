// mocking AsyncStorage since it needs a native module to work
// in tests we just use a simple in memory object instead
jest.mock('@react-native-async-storage/async-storage', () => {
    let store: { [key: string]: string } = {};
    return {
        getItem: jest.fn((key: string) => Promise.resolve(store[key] || null)),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value;
            return Promise.resolve();
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
            return Promise.resolve();
        }),
        clear: jest.fn(() => {
            store = {};
            return Promise.resolve();
        }),
    };
});

import { configureStore } from '@reduxjs/toolkit';
import bookingManagerReducer, { fetchBookings, addBooking, removeBooking } from '../store/bookingManagerSlice';

// helper to spin up a fresh store for each test
const makeStore = () => configureStore({
    reducer: { bookingManager: bookingManagerReducer },
});

// a sample booking we reuse across tests
const testBooking = {
    id: '1',
    doctorName: 'Dr. Smith',
    day: 'Monday',
    startTime: '9:00 AM',
    endTime: '9:30 AM',
    timezone: 'Australia/Sydney',
    bookedAt: new Date().toISOString(),
};

describe('bookingManagerSlice - testing the redux booking state', () => {

    it('should start with no bookings when the store is first created', () => {
        const store = makeStore();
        expect(store.getState().bookingManager.bookings).toHaveLength(0);
    });

    it('should add a booking and i should be able to find it in the store', async () => {
        const store = makeStore();
        await store.dispatch(addBooking(testBooking));
        expect(store.getState().bookingManager.bookings).toHaveLength(1);
        expect(store.getState().bookingManager.bookings[0].doctorName).toBe('Dr. Smith');
    });

    it('loading should go back to false once booking is done', async () => {
        const store = makeStore();
        await store.dispatch(addBooking(testBooking));
        expect(store.getState().bookingManager.loading).toBe(false);
    });

    it('removing a booking should leave me with an empty list', async () => {
        const store = makeStore();
        await store.dispatch(addBooking(testBooking));
        await store.dispatch(removeBooking('1'));
        expect(store.getState().bookingManager.bookings).toHaveLength(0);
    });

    it('a new store should be able to load bookings that were saved by another store instance', async () => {
        // this simulates closing and reopening the app
        // store1 saves a booking, store2 loads it back from AsyncStorage
        const store = makeStore();
        await store.dispatch(addBooking(testBooking));

        const store2 = makeStore();
        await store2.dispatch(fetchBookings());
        expect(store2.getState().bookingManager.bookings).toHaveLength(1);
    });

});