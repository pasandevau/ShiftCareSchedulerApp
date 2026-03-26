import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Bookings } from '../types';
import { getBookings, saveBooking, cancelBooking } from '../utils/bookingsStorage';

// the structure of our booking state in redux
interface BookingsState {
    bookings: Bookings[];
    loading: boolean;
    error: string | null;
}

const initialState: BookingsState = {
    bookings: [],
    loading: false,
    error: null,
};

// fetch all bookings from AsyncStorage and load them into redux
export const fetchBookings = createAsyncThunk('bookingManager/fetchAll', async () => {
    const allBookings = await getBookings();
    return allBookings;
});

// save a new booking - if the slot is already taken this will reject it
export const addBooking = createAsyncThunk('bookingManager/add', async (booking: Bookings, { rejectWithValue }) => {
    try {
        await saveBooking(booking);
        return booking;
    } catch (err: any) {
        // this happens when someone tries to double book a slot
        return rejectWithValue(err.message);
    }
});

// remove a booking by its id
export const removeBooking = createAsyncThunk('bookingManager/remove', async (bookingId: string) => {
    await cancelBooking(bookingId);
    return bookingId;
});

const bookingManagerSlice = createSlice({
    name: 'bookingManager',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // loading bookings
            .addCase(fetchBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Bookings[]>) => {
                state.loading = false;
                state.bookings = action.payload;
            })
            .addCase(fetchBookings.rejected, (state) => {
                state.loading = false;
                state.error = 'couldnt load your bookings, try again';
            })

            // adding a booking
            .addCase(addBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addBooking.fulfilled, (state, action: PayloadAction<Bookings>) => {
                state.loading = false;
                state.bookings.push(action.payload);
            })
            .addCase(addBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // removing a booking - just filter it out by id
            .addCase(removeBooking.fulfilled, (state, action: PayloadAction<string>) => {
                state.bookings = state.bookings.filter(b => b.id !== action.payload);
            });
    },
});

export default bookingManagerSlice.reducer;