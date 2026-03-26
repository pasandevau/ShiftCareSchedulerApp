import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookings } from '../types';

const BOOKINGS_KEY = 'bookings';

export async function getBookings(): Promise<Bookings[]> {
    try {
        const data = await AsyncStorage.getItem(BOOKINGS_KEY);
        if (data === null) return [];
        return JSON.parse(data) as Bookings[];
    } catch (error) {
        console.error('Failed to load bookings:', error);
        return [];
    }
}

export async function saveBooking(booking: Bookings): Promise<void> {
    try {
        const existing = await getBookings();
        const alreadyBooked = existing.some(
            b => b.doctorName === booking.doctorName &&
                b.day === booking.day &&
                b.startTime === booking.startTime
        );
        if (alreadyBooked) {
            throw new Error('This slot is already booked');
        }
        const updated = [...existing, booking];
        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
    } catch (error) {
        throw error;
    }
}

export async function cancelBooking(bookingId: string): Promise<void> {
    try {
        const existing = await getBookings();
        const updated = existing.filter(b => b.id !== bookingId);
        await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to cancel booking:', error);
    }
}