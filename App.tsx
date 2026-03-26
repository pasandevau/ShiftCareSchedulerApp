import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import DoctorsListScreen from './src/screens/DoctorsListScreen';
import DoctorDetailScreen from './src/screens/DoctorDetailScreen';
import BookingConfirmationScreen from './src/screens/BookingConfirmationScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import { Bookings } from './src/types';

export type RootStackParamList = {
  MainTabs: undefined;
  DoctorDetail: { doctorName: string };
  BookingConfirmation: { booking: Bookings };
};

export type TabParamList = {
  Doctors: undefined;
  MyBookings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen
        name="Doctors"
        component={DoctorsListScreen}
        options={{
          title: 'Find a Doctor',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          title: 'My Bookings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DoctorDetail"
            component={DoctorDetailScreen}
            options={{ title: 'Availability' }}
          />
          <Stack.Screen
            name="BookingConfirmation"
            component={BookingConfirmationScreen}
            options={{ title: 'Confirm Booking' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}