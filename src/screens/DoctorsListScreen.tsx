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
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { DoctorsSchedules } from '../types';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function DoctorsListScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [doctors, setDoctors] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await fetch('https://raw.githubusercontent.com/suyogshiftcare/jsontest/main/available.json');
            if (!response.ok) throw new Error('Failed to fetch doctors');
            const data: DoctorsSchedules[] = await response.json();

            // the API returns one entry per doctor per day so we get duplicates
            // so im using Set to get unique names only
            const allNames = data.map(item => item.name);
            const uniqueDoctors = [...new Set(allNames)];

            // NOTE: not sorting alphabetically here, just showing in API order
            // would be a nice improvement to add later
            setDoctors(uniqueDoctors);
        } catch (err) {
            setError('Oops, couldnt load doctors. Check your internet and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading doctors...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Ionicons name="wifi-outline" size={48} color={theme.colors.textLight} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchDoctors}>
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* header showing total doctor count */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Find a Doctor</Text>
                <Text style={styles.headerSubtitle}>{doctors.length} doctors available</Text>
            </View>

            <FlatList
                data={doctors}
                keyExtractor={(item) => item}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.doctorCard}
                        onPress={() => navigation.navigate('DoctorDetail', { doctorName: item })}
                        activeOpacity={0.7}
                    >
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.doctorInfo}>
                            <Text style={styles.doctorName}>{item}</Text>
                            <Text style={styles.doctorSubtext}>Tap to view availability</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
    loadingText: { marginTop: theme.spacing.md, color: theme.colors.textSecondary, fontSize: theme.fontSize.md },
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
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: { fontSize: theme.fontSize.xxl, fontWeight: '700', color: theme.colors.text },
    headerSubtitle: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 4 },
    listContent: { padding: theme.spacing.md },
    doctorCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        ...theme.shadow,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    doctorInfo: { flex: 1 },
    doctorName: { fontSize: theme.fontSize.md, fontWeight: '600', color: theme.colors.text },
    doctorSubtext: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 2 },
});