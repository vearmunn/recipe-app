import { View, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useSignUp } from '@clerk/clerk-expo'
import { authStyles } from '../../assets/styles/auth.styles'
import { COLORS } from '../../constants/colors'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import VerifyEmail from './verify-email'

const SignUpScreen = () => {
    const router = useRouter()
    const { isLoaded, signUp } = useSignUp()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [pendingVerification, setPendingVerification] = useState(false)

    const handleSignUp = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields!")
            return
        }
        if (password.length < 6) {
            Alert.alert("Error", "Password must bet at least 6 characters")
            return
        }
        if (!isLoaded) return

        setLoading(true)

        try {
            await signUp.create({ emailAddress: email, password, })

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            setPendingVerification(true)

        } catch (error) {
            Alert.alert("Error", error.errors?.[0]?.message || 'Failed to create account')
            console.error(JSON.stringify(error, null, 2))

        } finally {
            setLoading(false)
        }
    }

    if (pendingVerification) return <VerifyEmail email={email} onBackPress={() => setPendingVerification(false)} />
    return (
        <View style={authStyles.container}>
            <KeyboardAvoidingView
                style={authStyles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={64}
            >
                <ScrollView style={authStyles.scrollContent}
                    showsVerticalScrollIndicator={false}>
                    <View style={authStyles.imageContainer}>
                        <Image source={require('../../assets/images/i2.png')}
                            style={authStyles.image}
                            contentFit='contain' />
                    </View>

                    <Text style={authStyles.title}>Create Account</Text>

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
                        {/* SIGN UP BUTTON */}
                        <TouchableOpacity
                            style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                            onPress={handleSignUp}
                            disabled={loading}
                            activeOpacity={0.8}>
                            <Text style={authStyles.buttonText}>{loading ? "Signing Up..." : "Sign Up"}</Text>
                        </TouchableOpacity>

                        {/* SIGN IN LINK */}
                        <TouchableOpacity
                            style={authStyles.linkContainer}
                            onPress={() => router.push('/(auth)/sign-in')}>
                            <Text style={authStyles.linkText}>
                                {"Already have an account? "}<Text style={authStyles.link}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

export default SignUpScreen