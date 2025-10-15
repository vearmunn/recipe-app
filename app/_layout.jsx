import { Slot } from "expo-router";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import SafeScreen from '@/components/safe-screen'

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <SafeScreen>
        {/* <Stack screenOptions={{ headerShown: false }} /> */}
        <Slot />
      </SafeScreen>
    </ClerkProvider>
  );
}
