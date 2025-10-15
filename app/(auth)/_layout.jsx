import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import LoadingSpinner from '../../components/loading-spinner'

export default function AuthRoutesLayout() {
    const { isSignedIn, isLoaded } = useAuth()

    if (!isLoaded) return <LoadingSpinner />;

    if (isSignedIn) {
        return <Redirect href={'/'} />
    }

    return <Stack screenOptions={{ headerShown: false }} />
}