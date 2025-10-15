import { View, Text, Alert, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useUser } from '@clerk/clerk-expo'
import { API_URL } from '../../constants/api'
import { MealAPI } from '../../services/meal-api'
import LoadingSpinner from '../../components/loading-spinner'
import { recipeDetailStyles } from '../../assets/styles/recipe-detail.styles'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants/colors'
import { WebView } from 'react-native-webview'

const RecipeDetailScreen = () => {
    const router = useRouter()
    const { id: recipeId } = useLocalSearchParams()

    const [recipe, setRecipe] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isSaved, setIsSaved] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const { user } = useUser()
    const userId = user?.id;

    useEffect(() => {
        const checkIfSaved = async () => {
            try {
                const response = await fetch(`${API_URL}/favorites/${userId}`)
                const favorites = await response.json()
                const isRecipeSaved = favorites.some((fav) => fav.recipeId === parseInt(recipeId))
                setIsSaved(isRecipeSaved)
            } catch (error) {
                console.error('Error checking if recipe is saved: ', error)
            }
        }

        const loadRecipeDetail = async () => {
            setLoading(true)
            try {
                const mealData = await MealAPI.getMealsById(recipeId)
                if (mealData) {
                    const transformMealData = MealAPI.transformMealData(mealData)

                    const recipeWithVideo = {
                        ...transformMealData,
                        youtubeUrl: mealData.strYoutube || null
                    }

                    setRecipe(recipeWithVideo)
                }
            } catch (error) {
                console.error('Error fetching recipe: ', error)
            } finally {
                setLoading(false)
            }
        }

        checkIfSaved()
        loadRecipeDetail()
    }, [recipeId, userId])

    const getYoutubeEmbedUrl = (url) => {
        // example url: https://www.youtube.com/watch?v=GQ_e1JuV_kI
        const videoId = url.split('v=')[1]
        return `https://www.youtube.com/embed/${videoId}`
    }
    const handleToggleFavorite = async () => {
        setIsSaving(true)
        try {
            if (isSaved) {
                // remove from favorites
                const response = await fetch(`${API_URL}/favorites/${userId}/${recipeId}`, {
                    method: 'DELETE'
                })
                if (!response.ok) throw new Error("Failed to remove recipe from favorites")
                setIsSaved(false)
            } else {
                // add to favorites
                const response = await fetch(`${API_URL}/favorites`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId,
                        recipeId: parseInt(recipeId),
                        title: recipe.title,
                        image: recipe.image,
                        cookTime: recipe.cookTime,
                        servings: recipe.servings
                    })
                })
                if (!response.ok) throw new Error("Failed to save recipe")
                setIsSaved(true)
            }

        } catch (error) {
            console.error('Error toggling recipe: ', error)
            Alert.alert('Error', 'Something went wrong')
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) return <LoadingSpinner message='Loading recipe details...' />
    return (
        <View style={recipeDetailStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* HEADER */}
                <View style={recipeDetailStyles.headerContainer}>
                    <Image
                        source={{ uri: recipe.image }}
                        style={recipeDetailStyles.headerImage}
                        contentFit='cover'
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
                        style={recipeDetailStyles.gradientOverlay}
                    />

                    <View style={recipeDetailStyles.floatingButtons}>
                        <TouchableOpacity style={recipeDetailStyles.floatingButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name='arrow-back' size={24} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[recipeDetailStyles.floatingButton, { backgroundColor: isSaved ? COLORS.primary : "rgba(0, 0, 0, 0.3)" }]}
                            onPress={handleToggleFavorite}
                            disabled={isSaving}
                        >
                            <Ionicons name={isSaving ? 'hourglass' : isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    {/* TITLE SECTION */}
                    <View style={recipeDetailStyles.titleSection}>
                        <View style={recipeDetailStyles.categoryBadge}>
                            <Text style={recipeDetailStyles.categoryText}>{recipe.category}</Text>
                        </View>
                        <Text style={recipeDetailStyles.recipeTitle}>{recipe.title}</Text>
                        <View style={recipeDetailStyles.locationRow}>
                            <Ionicons name='location' size={16} color={COLORS.white} />
                            <Text style={recipeDetailStyles.locationText}>{recipe.area}</Text>
                        </View>
                    </View>

                </View>

                {/* DETAILS SECTION */}
                <View style={recipeDetailStyles.contentSection}>

                    {/* COOKTIME AND SERVINGS */}
                    <View style={recipeDetailStyles.statsContainer}>
                        <View style={recipeDetailStyles.statCard}>
                            <LinearGradient colors={['#FF6B6B', '#FF8E53']}
                                style={recipeDetailStyles.statIconContainer}>
                                <Ionicons name='time' size={20} color={COLORS.white} />
                            </LinearGradient>
                            <Text style={recipeDetailStyles.statValue}>{recipe.cookTime}</Text>
                            <Text style={recipeDetailStyles.statLabel}>Prep Time</Text>
                        </View>
                        <View style={recipeDetailStyles.statCard}>
                            <LinearGradient colors={['#4ECDC4', '#44A08D']}
                                style={recipeDetailStyles.statIconContainer}>
                                <Ionicons name='people' size={20} color={COLORS.white} />
                            </LinearGradient>
                            <Text style={recipeDetailStyles.statValue}>{recipe.servings}</Text>
                            <Text style={recipeDetailStyles.statLabel}>Servings</Text>
                        </View>
                    </View>

                    {/* YOUTUBE VIDEO */}
                    {recipe.youtubeUrl && (
                        <View style={recipeDetailStyles.sectionContainer}>
                            <View style={recipeDetailStyles.sectionTitleRow}>
                                <LinearGradient style={recipeDetailStyles.sectionIcon} colors={['#FF0000', '#CC0000']}>
                                    <Ionicons name='play' size={16} color={COLORS.white} />
                                </LinearGradient>
                                <Text style={recipeDetailStyles.sectionTitle}>Video Tutorial</Text>
                            </View>
                            <View style={recipeDetailStyles.videoCard}>
                                <WebView
                                    style={recipeDetailStyles.webview}
                                    source={{ uri: getYoutubeEmbedUrl(recipe.youtubeUrl) }}
                                    allowsFullscreenVideo
                                    mediaPlaybackRequiresUserAction={false}
                                />
                            </View>
                        </View>
                    )}

                    {/* INGREDIENTS SECTION */}
                    <View style={recipeDetailStyles.sectionContainer}>
                        <View style={recipeDetailStyles.sectionTitleRow}>
                            <LinearGradient style={recipeDetailStyles.sectionIcon} colors={[COLORS.primary, COLORS.primary + '80']}>
                                <Ionicons name='list' size={16} color={COLORS.white} />
                            </LinearGradient>
                            <Text style={recipeDetailStyles.sectionTitle}>Ingredients</Text>
                            <View style={recipeDetailStyles.countBadge}>
                                <Text style={recipeDetailStyles.countText}>{recipe.ingredients.length}</Text>
                            </View>
                        </View>

                        <View style={recipeDetailStyles.ingredientsGrid}>
                            {recipe.ingredients.map((ingredient, index) => (
                                <View style={recipeDetailStyles.ingredientCard} key={index}>
                                    <View style={recipeDetailStyles.ingredientNumber}>
                                        <Text style={recipeDetailStyles.ingredientNumberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={recipeDetailStyles.ingredientText}>{ingredient}</Text>
                                    <View style={recipeDetailStyles.ingredientCheck}>
                                        <Ionicons name='checkmark-circle-outline' size={20} color={COLORS.textLight} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* INSTRUCTIONS SECTION */}
                    <View style={recipeDetailStyles.sectionContainer}>
                        <View style={recipeDetailStyles.sectionTitleRow}>
                            <LinearGradient style={recipeDetailStyles.sectionIcon} colors={[COLORS.primary, COLORS.primary + '80']}>
                                <Ionicons name='list' size={16} color={COLORS.white} />
                            </LinearGradient>
                            <Text style={recipeDetailStyles.sectionTitle}>Insctructions</Text>
                            <View style={recipeDetailStyles.countBadge}>
                                <Text style={recipeDetailStyles.countText}>{recipe.instructions.length}</Text>
                            </View>
                        </View>

                        <View style={recipeDetailStyles.instructionsContainer}>
                            {recipe.instructions.map((instruction, index) => (
                                <View style={recipeDetailStyles.instructionCard} key={index}>
                                    <LinearGradient style={recipeDetailStyles.stepIndicator}
                                        colors={[COLORS.primary, COLORS.primary + 'CC']}>
                                        <Text style={recipeDetailStyles.stepNumber}>{index + 1}</Text>
                                    </LinearGradient>
                                    <View style={recipeDetailStyles.instructionContent}>
                                        <Text style={recipeDetailStyles.instructionText}>{instruction}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                </View>
            </ScrollView>
            {/* <TouchableOpacity style={recipeDetailStyles.primaryButton}
                onPress={handleToggleFavorite}
                disabled={isSaving}>
                <LinearGradient
                    colors={[COLORS.primary, COLORS.primary + 'CC']} style={recipeDetailStyles.buttonGradient}>
                    <Ionicons name='heart' size={20} color={COLORS.white} />
                    <Text style={recipeDetailStyles.buttonText}>{isSaved ? 'Remove from Favorites' : 'Add to Favorites'}</Text>
                </LinearGradient>
            </TouchableOpacity> */}
        </View>
    )
}

export default RecipeDetailScreen