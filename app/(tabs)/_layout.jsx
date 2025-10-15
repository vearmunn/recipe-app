
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const Tabslayout = () => {
    const { isSignedIn } = useAuth()

    if (!isSignedIn) return <Redirect href={'/(auth)/sign-in'} />
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: '#8A8A8AFF',
            tabBarStyle: {
                backgroundColor: COLORS.white,
                borderTopColor: COLORS.border,
                borderTopWidth: 1,
                paddingBottom: 8,
                paddingTop: 8,
                height: 80
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600'
            },

        }}>
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Recipes',
                    tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'}
                        size={size}
                        color={color} />
                }} />
            <Tabs.Screen
                name='search'
                options={{
                    title: 'Search',
                    tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'search' : 'search-outline'}
                        size={size}
                        color={color} />
                }} />
            <Tabs.Screen
                name='favorites'
                options={{
                    title: 'Favorites',
                    tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'heart' : 'heart-outline'}
                        size={size}
                        color={color} />
                }} />
        </Tabs>
    )
}

export default Tabslayout