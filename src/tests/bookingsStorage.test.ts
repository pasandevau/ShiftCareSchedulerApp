// AsyncStorage needs native modules so it blows up in jest
// just using a plain object to fake it
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

import { getBookings, saveBooking, cancelBooking } from '../utils/bookingsStorage';

describe('bookingsStorage', () => {

    // wipe before each test otherwise they step on each other
    beforeEach(async () => {
        const existingBookings = await getBookings();
        for (const b of existingBookings) {
            await cancelBooking(b.id);
        }
    });

    it('should give me an empty list if nothing has been booked yet', async () => {
        const bookings = await getBookings();
        expect(bookings).toHaveLength(0);
    });

    it('should save a booking and get it back', async () => {
        const booking = {
            id: '1',
            doctorName: 'Dr. Smith',
            day: 'Monday',
            startTime: '9:00 AM',
            endTime: '9:30 AM',
            timezone: 'Australia/Sydney',
            bookedAt: new Date().toISOString(),
        };
        await saveBooking(booking);

        const bookings = await getBookings();
        expect(bookings).toHaveLength(1);
        expect(bookings[0].doctorName).toBe('Dr. Smith');
    });

    it('should throw if i try to double book the same slot', async () => {
        const booking = {
            id: '2',
            doctorName: 'Dr. Smith',
            day: 'Monday',
            startTime: '9:00 AM',
            endTime: '9:30 AM',
            timezone: 'Australia/Sydney',
            bookedAt: new Date().toISOString(),
        };
        await saveBooking(booking);

        // same slot different id should still fail
        await expect(saveBooking({ ...booking, id: '3' })).rejects.toThrow();
    });

    it('cancelling a booking should remove it', async () => {
        const booking = {
            id: '4',
            doctorName: 'Dr. Jones',
            day: 'Tuesday',
            startTime: '10:00 AM',
            endTime: '10:30 AM',
            timezone: 'Australia/Sydney',
            bookedAt: new Date().toISOString(),
        };
        await saveBooking(booking);
        await cancelBooking('4');

        // should be gone now
        const bookings = await getBookings();
        expect(bookings).toHaveLength(0);
    });

});