export interface DoctorsSchedules {
    name: string;
    timezone: string;
    day_of_week: string;
    available_at: string;
    available_until: string;
}

export interface TimeSlot {
    startTime: string;
    endTime: string;
    isBooked: boolean;
}

export interface DoctorsAvailabilities {
    doctorName: string;
    doctorTimezone: string;
    schedule: {
        day: string;
        slots: TimeSlot[];
    }[];
}

export interface Bookings {
    id: string;
    doctorName: string;
    day: string;
    startTime: string;
    endTime: string;
    timezone: string;
    bookedAt: string;
}