import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useRouter } from "expo-router";
import { useSignIn } from "@clerk/clerk-expo";
import { authStyles } from '../../assets/styles/auth.styles'
import { Image } from 'expo-image'
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons'

const SignInScreen = () => {
    const router = useRouter();
    const { signIn, setActive, isLoaded } = useSignIn()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields!")
            return
        }

        if (!isLoaded) return

        setLoading(true)

        try {
            const signInAttempt = await signIn.create({
                identifier: email,
                password
            })
            if (signInAttempt.status === "complete") {
                await setActive({ session: signInAttempt.createdSessionId })
            } else {
                Alert.alert("Error", "Sign in failed. Please try again")
                console.error(JSON.stringify(signInAttempt, null, 2))
            }
        } catch (error) {
            Alert.alert("Error", error.errors?.[0]?.message || 'Sign in failed')
            console.error(JSON.stringify(error, null, 2))
        } finally {
            setLoading(false)
        }
    }
    return (
        <View style={authStyles.container}>
            <KeyboardAvoidingView
                style={authStyles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={64}>
                <ScrollView style={authStyles.scrollContent}
                    showsVerticalScrollIndicator={false}>
                    <View style={authStyles.imageContainer}>
                        <Image source={require('../../assets/images/i1.png')}
                            style={authStyles.image}
                            contentFit='contain' />
                    </View>

                    <Text style={authStyles.title}>Welcome Back</Text>

                    {/* FORM CONTAINER */}

                    <View style={authStyles.formContainer}>
                        {/* EMAIL INPUT */}
                        <View style={authStyles.inputContainer}>
                            <TextInput
                                style={authStyles.textInput}
                                placeholder='Enter Email'
                                placeholderTextColor={COLORS.textLight}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType='email-address'
                                autoCapitalize='none'
                            />
                        </View>
                        {/* PASSWORD INPUT */}
                        <View style={authStyles.inputContainer}>
                            <TextInput
                                style={authStyles.textInput}
                                placeholder='Enter Password'
                                placeholderTextColor={COLORS.textLight}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize='none'
                            />
                            <TouchableOpacity
                                style={authStyles.eyeButton} onPress={() =>
                                    setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color={COLORS.textLight}
                                />
                            </TouchableOpacity>
                        </View>
                        {/* SIGN IN BUTTON */}
                        <TouchableOpacity
                            style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                            onPress={handleSignIn}
                            disabled={loading}
                            activeOpacity={0.8}>
                            <Text style={authStyles.buttonText}>{loading ? "Signing In..." : "Sign In"}</Text>
                        </TouchableOpacity>

                        {/* SIGN UP LINK */}
                        <TouchableOpacity
                            style={authStyles.linkContainer}
                            onPress={() => router.push('/(auth)/sign-up')}>
                            <Text style={authStyles.linkText}>
                                {"Don't have an account? "}<Text style={authStyles.link}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

export default SignInScreen