import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addBooking } from '../store/bookingManagerSlice';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingConfirmation'>;
type RouteProps = RouteProp<RootStackParamList, 'BookingConfirmation'>;

export default function BookingConfirmationScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { booking } = route.params;
    const dispatch = useAppDispatch();

    // grab loading and error state from redux
    const { loading, error } = useAppSelector(state => state.bookingManager);

    const handleConfirm = async () => {
        const result = await dispatch(addBooking(booking));

        if (addBooking.fulfilled.match(result)) {
            Alert.alert(
                'Booking Confirmed!',
                `Your appointment with ${booking.doctorName} on ${booking.day} at ${booking.startTime} is all set.`,
                [
                    {
                        // TODO: this navigates to doctors tab instead of my bookings
                        // known issue with nested navigation, will fix later
                        text: 'View My Bookings',
                        onPress: () => {
                            navigation.popToTop();
                            navigation.navigate('MainTabs', { screen: 'MyBookings' } as any);
                        },
                    },
                    {
                        text: 'Back to Doctors',
                        onPress: () => navigation.popToTop(),
                    },
                ]
            );
        } else {
            Alert.alert('Something went wrong', error || 'Couldnt complete the booking, please try again.');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            <View style={styles.iconContainer}>
                <Ionicons name="checkmark-circle-outline" size={56} color={theme.colors.primary} />
            </View>

            <Text style={styles.title}>Confirm Your Appointment</Text>
            <Text style={styles.subtitle}>Please review your booking details below</Text>

            {/* booking details card */}
            <View style={styles.card}>

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Ionicons name="person-outline" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Doctor</Text>
                        <Text style={styles.value}>{booking.doctorName}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Day</Text>
                        <Text style={styles.value}>{booking.day}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Time</Text>
                        <Text style={styles.value}>{booking.startTime} – {booking.endTime}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* showing the doctors timezone so user knows what time zone this is in as im not converting the actual timezone */}
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <Ionicons name="globe-outline" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.label}>Timezone</Text>
                        <Text style={styles.value}>{booking.timezone}</Text>
                    </View>
                </View>

            </View>

            <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                        <Text style={styles.confirmText}>Confirm Booking</Text>
                    </>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <Text style={styles.cancelText}>Go Back</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.md, alignItems: 'center' },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    title: { fontSize: theme.fontSize.xxl, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
    subtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: theme.spacing.lg },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        width: '100%',
        marginBottom: theme.spacing.lg,
        ...theme.shadow,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm },
    detailIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    detailContent: { flex: 1 },
    label: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text, marginTop: 2 },
    divider: { height: 1, backgroundColor: theme.colors.border, marginLeft: 52 },
    confirmButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.md,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: theme.spacing.sm,
    },
    confirmText: { color: 'white', fontSize: theme.fontSize.md, fontWeight: '700' },
    cancelButton: {
        backgroundColor: theme.colors.card,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.md,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cancelText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, fontWeight: '600' },
});