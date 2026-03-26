import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Bookings } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBookings, removeBooking } from '../store/bookingManagerSlice';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function MyBookingsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const dispatch = useAppDispatch();

    // pull bookings and loading state straight from redux
    const { bookings, loading } = useAppSelector(state => state.bookingManager);

    // Then i reload bookings every time this screen comes into focus
    // this handles the case where a user books then comes back here again
    useFocusEffect(
        React.useCallback(() => {
            loadBookings();
        }, [])
    );

    const loadBookings = async () => {
        dispatch(fetchBookings());
    };

    const handleCancel = (bookingId: string, doctorName: string) => {
        Alert.alert(
            'Cancel Booking',
            `Are you sure you want to cancel your appointment with ${doctorName}?`,
            [
                { text: 'Keep It', style: 'cancel' },
                {
                    text: 'Cancel Booking',
                    style: 'destructive',
                    onPress: async () => {
                        // remove from storage then refresh the list
                        await dispatch(removeBooking(bookingId));
                        dispatch(fetchBookings());
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // empty state - no bookings yet
    if (bookings.length === 0) {
        return (
            <View style={styles.centered}>
                <View style={styles.emptyIcon}>
                    <Ionicons name="calendar-outline" size={48} color={theme.colors.textLight} />
                </View>
                <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                <Text style={styles.emptySubtext}>Book an appointment with a doctor to get started</Text>
                <TouchableOpacity
                    style={styles.browseButton}
                    onPress={() => navigation.navigate('MainTabs')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="search-outline" size={18} color="white" />
                    <Text style={styles.browseText}>Browse Doctors</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* header with booking count */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Bookings</Text>
                <Text style={styles.headerSubtitle}>
                    {bookings.length} appointment{bookings.length !== 1 ? 's' : ''}
                </Text>
            </View>

            <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.bookingCard}>

                        <View style={styles.cardLeft}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="person" size={24} color={theme.colors.primary} />
                            </View>
                        </View>

                        {/* booking details */}
                        <View style={styles.bookingInfo}>
                            <Text style={styles.doctorName}>{item.doctorName}</Text>
                            <View style={styles.bookingDetail}>
                                <Ionicons name="calendar-outline" size={13} color={theme.colors.textSecondary} />
                                <Text style={styles.bookingDay}>{item.day}</Text>
                            </View>
                            <View style={styles.bookingDetail}>
                                <Ionicons name="time-outline" size={13} color={theme.colors.primary} />
                                <Text style={styles.bookingTime}>{item.startTime} – {item.endTime}</Text>
                            </View>
                            {/* showing doctors timezone to the user so user knows what timezone the appointment is in */}
                            <View style={styles.bookingDetail}>
                                <Ionicons name="globe-outline" size={13} color={theme.colors.textLight} />
                                <Text style={styles.timezone}>{item.timezone}</Text>
                            </View>
                        </View>

                        {/* trash icon to cancel */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleCancel(item.id, item.doctorName)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                        </TouchableOpacity>

                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
    emptyIcon: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: theme.colors.booked,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    emptyTitle: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
    emptySubtext: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.lg },
    browseButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    browseText: { color: 'white', fontSize: theme.fontSize.md, fontWeight: '600' },
    header: {
        backgroundColor: theme.colors.card,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: { fontSize: theme.fontSize.xxl, fontWeight: '700', color: theme.colors.text },
    headerSubtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 4 },
    listContent: { padding: theme.spacing.md },
    bookingCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadow,
    },
    cardLeft: { marginRight: theme.spacing.md },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookingInfo: { flex: 1 },
    doctorName: { fontSize: theme.fontSize.md, fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
    bookingDetail: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    bookingDay: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
    bookingTime: { fontSize: theme.fontSize.sm, color: theme.colors.primary, fontWeight: '600' },
    timezone: { fontSize: theme.fontSize.xs, color: theme.colors.textLight },
    cancelButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: theme.spacing.sm,
    },
});