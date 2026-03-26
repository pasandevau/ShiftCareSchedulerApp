import { generateSlots } from '../utils/slotsCreation';

describe('generateSlots', () => {

    it('should give me 4 slots when a doctor is free for 2 hours', () => {
        const slots = generateSlots('9:00AM', '11:00AM');
        expect(slots).toHaveLength(4);
    });

    it('fisrt slot should start at 9am and finish at 9:30am', () => {
        const slots = generateSlots('9:00AM', '10:00AM');
        expect(slots[0].startTime).toBe('9:00 AM');
        expect(slots[0].endTime).toBe('9:30 AM');
    });

    it('all slots should show as available when first loaded', () => {
        const slots = generateSlots('9:00AM', '11:00AM');
        slots.forEach((slot: any) => {
            expect(slot.isBooked).toBe(false);
        });
    });

    it('should return no slots if the window is less than 30 mins', () => {
        const slots = generateSlots('9:00AM', '9:20AM');
        expect(slots).toHaveLength(0);
    });

    it('should handle PM times corectly', () => {
        // 12pm was tricky, wanted to make sure it doesnt get treated as midnight
        const slots = generateSlots('12:00PM', '1:00PM');
        expect(slots).toHaveLength(2);
    });

    it('should return zero slots if start and end time are the same', () => {
        const slots = generateSlots('9:00AM', '9:00AM');
        expect(slots).toHaveLength(0);
    });

    it('full day from 9am to 5:30pm should give 17 slots', () => {
        // 8.5 hours / 30 mins = 17, this matches real data from the API
        const slots = generateSlots('9:00AM', '5:30PM');
        expect(slots).toHaveLength(17);
    });

});