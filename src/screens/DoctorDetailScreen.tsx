import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { DoctorsSchedules, DoctorsAvailabilities, Bookings } from '../types';
import { generateSlots } from '../utils/slotsCreation';
import { getBookings } from '../utils/bookingsStorage';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'DoctorDetail'>;

export default function DoctorDetailScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { doctorName } = route.params;

    const [availability, setAvailability] = useState<DoctorsAvailabilities | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // keeping track of existing bookings so we can grey out already booked slots
    const [bookedSlots, setBookedSlots] = useState<Bookings[]>([]);

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const response = await fetch('https://raw.githubusercontent.com/suyogshiftcare/jsontest/main/available.json');
            if (!response.ok) throw new Error('Failed to fetch availability');
            const data: DoctorsSchedules[] = await response.json();

            // filter down to just this doctors schedule
            const doctorData = data.filter(item => item.name === doctorName);

            // get existing bookings so we can mark slots as booked
            const existingBookings = await getBookings();
            setBookedSlots(existingBookings);

            // the API can return multiple entries for the same day
            // so we use a map to deduplicate by day
            const scheduleMap: { [day: string]: DoctorsSchedules } = {};
            doctorData.forEach(item => {
                scheduleMap[item.day_of_week] = item;
            });

            // now convert each day into 30 min slots and mark which ones are already booked
            const schedule = Object.values(scheduleMap).map(item => ({
                day: item.day_of_week,
                slots: generateSlots(item.available_at, item.available_until).map(slot => ({
                    ...slot,
                    isBooked: existingBookings.some(
                        b => b.doctorName === doctorName &&
                            b.day === item.day_of_week &&
                            b.startTime === slot.startTime
                    ),
                })),
            }));

            setAvailability({
                doctorName,
                doctorTimezone: doctorData[0]?.timezone || '',
                schedule,
            });
        } catch (err) {
            setError('Couldnt load availability, please try again.');
        } finally {
            setLoading(false);
        }
    };

    // build the booking object first and thrn send user to confirmation screen
    const handleSlotPress = (day: string, startTime: string, endTime: string) => {
        const booking: Bookings = {
            id: `${doctorName}-${day}-${startTime}-${Date.now()}`,
            doctorName,
            day,
            startTime,
            endTime,
            timezone: availability?.doctorTimezone || '',
            bookedAt: new Date().toISOString(),
        };
        navigation.navigate('BookingConfirmation', { booking });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading availability...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Ionicons name="wifi-outline" size={48} color={theme.colors.textLight} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchAvailability}>
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* doctor header with name and timezone */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={28} color={theme.colors.primary} />
                </View>
                <View>
                    <Text style={styles.doctorTitle}>{doctorName}</Text>
                    <Text style={styles.timezone}>{availability?.doctorTimezone}</Text>
                </View>
            </View>

            {/* list of days with their available slots */}
            <FlatList
                data={availability?.schedule}
                keyExtractor={(item) => item.day}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.dayContainer}>
                        <View style={styles.dayHeader}>
                            <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                            <Text style={styles.dayTitle}>{item.day}</Text>
                        </View>
                        <View style={styles.slotsGrid}>
                            {item.slots.map((slot, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.slot, slot.isBooked && styles.slotBooked]}
                                    onPress={() => !slot.isBooked && handleSlotPress(item.day, slot.startTime, slot.endTime)}
                                    disabled={slot.isBooked}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.slotText, slot.isBooked && styles.slotTextBooked]}>
                                        {slot.startTime}
                                    </Text>
                                    <Text style={styles.slotSubText}>
                                        {slot.isBooked ? 'Booked' : '30 min'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
    errorText: { color: theme.colors.error, marginVertical: theme.spacing.md, fontSize: theme.fontSize.md, textAlign: 'center' },
    retryButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.md,
    },
    retryText: { color: 'white', fontSize: theme.fontSize.md, fontWeight: '600' },
    header: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    doctorTitle: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.text },
    timezone: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 2 },
    listContent: { padding: theme.spacing.md },
    dayContainer: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadow,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    dayTitle: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text, marginLeft: theme.spacing.sm },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    slot: {
        backgroundColor: theme.colors.primaryLight,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.sm,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        minWidth: 90,
        alignItems: 'center',
    },
    slotBooked: {
        backgroundColor: theme.colors.booked,
        borderColor: theme.colors.border,
    },
    slotText: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: '600' },
    slotTextBooked: { color: theme.colors.bookedText },
    slotSubText: { fontSize: theme.fontSize.xs, color: theme.colors.textLight, marginTop: 2 },
    loadingText: { marginTop: theme.spacing.md, color: theme.colors.textSecondary },
});