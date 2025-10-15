import { View, Text, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { MealAPI } from '../../services/meal-api'
import { homeStyles } from '../../assets/styles/home.styles'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants/colors'
import CategoryFilter from '../../components/category-filter'
import FeaturedRecipe from '../../components/featured-recipe'
import RecipeCard from '../../components/recipe-card'
import LoadingSpinner from '../../components/loading-spinner'

const HomeScreen = () => {
    const router = useRouter()
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [recipes, setRecipes] = useState([])
    const [categories, setCategories] = useState([])
    const [featuredRecipe, setFeaturedRecipe] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshin, setRefreshin] = useState(false)

    const loadData = async () => {
        try {
            setLoading(true)

            // const [apiCategories, randomMeals, featuredMeal] = await Promise.all([
            //     MealAPI.getCategories(),
            //     MealAPI.getRandomMeals(12),
            //     MealAPI.getRandomMeal()
            // ])
            const [apiCategories, featuredMeal] = await Promise.all([
                MealAPI.getCategories(),
                MealAPI.getRandomMeal(),
                loadCategoryData("Beef")
            ])

            const transformedCategories = apiCategories.map((cat, index) => (
                {
                    id: index + 1,
                    name: cat.strCategory,
                    image: cat.strCategoryThumb,
                    description: cat.strCategoryDescription
                }
            ))

            setCategories(transformedCategories)

            if (!selectedCategory) setSelectedCategory(transformedCategories[0].name)

            // const transformedMeals = randomMeals.map((meal) => MealAPI.transformMealData(meal)).filter((meal) => meal !== null)
            // setRecipes(transformedMeals)

            const transformedFeatured = MealAPI.transformMealData(featuredMeal)
            setFeaturedRecipe(transformedFeatured)

        } catch (error) {
            console.log("Error loading data", error)
        } finally {
            setLoading(false)
        }
    }

    const loadCategoryData = async (category) => {
        try {
            const meals = await MealAPI.filterByCategory(category)
            const transformedMeals = meals
                .map((meal) => MealAPI.transformMealData(meal))
                .filter((meal) => meal !== null)
            setRecipes(transformedMeals)
        } catch (error) {
            console.error('Error loading category data: ', error)
            setRecipes([])
        }
    }

    const handleCategorySelect = async (category) => {
        setSelectedCategory(category)
        await loadCategoryData(category)
    }

    const onRefresh = async () => {
        setRefreshin(true)
        await loadData()
        setRefreshin(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    if (loading && !refreshin) return <LoadingSpinner />

    return (
        <View style={homeStyles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshin}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
                contentContainerStyle={homeStyles.scrollContent}
            >
                <View style={homeStyles.welcomeSection}>
                    <Text style={homeStyles.welcomeText}>What’s Cooking Today?</Text>
                    <Text style={homeStyles.welcomeSubtitle}>Scroll, save, and savor trending recipes loved by foodies worldwide</Text>
                </View>

                {/* FEATURED SECTION */}
                {featuredRecipe && (<FeaturedRecipe featuredRecipe={featuredRecipe} />)}

                {/* CATEGORY FILTER SECTION */}
                {categories.length > 0 && (
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectedCategory={handleCategorySelect}
                    />
                )}
                <View style={homeStyles.recipesSection}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>{selectedCategory}</Text>
                    </View>

                    {recipes.length > 0
                        ? (
                            <FlatList
                                data={recipes}
                                renderItem={({ item }) => <RecipeCard recipe={item} />}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={2}
                                columnWrapperStyle={homeStyles.row}
                                contentContainerStyle={homeStyles.recipesGrid}
                                scrollEnabled={false}
                            />)
                        : (
                            <View style={homeStyles.emptyState}>
                                <Ionicons name='restaurant-outline' size={64} color={COLORS.textLight} />
                                <Text style={homeStyles.emptyTitle}>No recipes found</Text>
                                <Text style={homeStyles.emptyDescription}>Try a different category</Text>
                            </View>)}
                </View>
            </ScrollView>
        </View>
    )
}

export default HomeScreen