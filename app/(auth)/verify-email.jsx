import { View, Text, Alert, Platform, KeyboardAvoidingView, ScrollView, TextInput, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useSignUp } from '@clerk/clerk-expo'
import { authStyles } from '../../assets/styles/auth.styles'
import { Image } from 'expo-image'
import { COLORS } from '../../constants/colors'

const VerifyEmail = ({ email, onBackPress }) => {
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)
    const { isLoaded, signUp, setActive } = useSignUp()

    const handleVerification = async () => {
        if (!isLoaded) return

        setLoading(true)
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({ code: code })

            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
            } else {
                Alert.alert('Error', 'Verification failed. Please try again')
                console.error(JSON.stringify(signUpAttempt, null, 2))
            }
        } catch (error) {
            Alert.alert("Error", error.errors?.[0]?.message || 'Verification failed')
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
                keyboardVerticalOffset={64}
            >
                <ScrollView
                    contentContainerStyle={authStyles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={authStyles.imageContainer}>
                        <Image source={require('../../assets/images/i3.png')}
                            style={authStyles.image}
                            contentFit='contain'
                        />
                    </View>
                    <Text style={authStyles.title}>Verify Your Email</Text>
                    <Text style={authStyles.subtitle}>{"We've sent a verification code to"} {email}</Text>
                    <View style={authStyles.formContainer}>
                        <TextInput
                            style={authStyles.textInput}
                            placeholder='Enter verification code'
                            placeholderTextColor={COLORS.textLight}
                            value={code}
                            onChangeText={setCode}
                            keyboardType='number-pad'
                        />
                    </View>
                    <TouchableOpacity
                        style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
                        onPress={handleVerification}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Text style={authStyles.buttonText}>{loading ? 'Verifying...' : 'Verify Email'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={authStyles.linkContainer}
                        onPress={onBackPress}>
                        <Text style={authStyles.linkText}>
                            <Text style={authStyles.link}>Back to Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

export default VerifyEmail