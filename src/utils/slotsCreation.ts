export function generateSlots(availableAt: string, availableUntil: string) {
    const slots: { startTime: string; endTime: string; isBooked: boolean }[] = [];

    const parseTime = (timeStr: string): number => {
        const cleaned = timeStr.trim().toUpperCase();
        const isPM = cleaned.includes('PM');
        const isAM = cleaned.includes('AM');
        const timePart = cleaned.replace('AM', '').replace('PM', '').trim();
        const [hourString, minuteString] = timePart.split(':');
        let hour = parseInt(hourString, 10);
        const minute = parseInt(minuteString || '0', 10);
        if (isPM && hour !== 12) hour += 12;
        if (isAM && hour === 12) hour = 0;
        return hour * 60 + minute;
    };

    const formatTime = (totalMinutes: number): string => {
        const hour24 = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        const isPM = hour24 >= 12;
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        const minuteStr = minute.toString().padStart(2, '0');
        return `${hour12}:${minuteStr} ${isPM ? 'PM' : 'AM'}`;
    };

    let current = parseTime(availableAt);
    const end = parseTime(availableUntil);

    while (current + 30 <= end) {
        slots.push({
            startTime: formatTime(current),
            endTime: formatTime(current + 30),
            isBooked: false,
        });
        current += 30;
    }

    return slots;
}