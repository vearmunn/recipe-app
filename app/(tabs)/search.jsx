import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MealAPI } from '../../services/meal-api'
import { useDebounce } from '../../hooks/useDebounce'
import { searchStyles } from '../../assets/styles/search.styles'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants/colors'
import RecipeCard from '../../components/recipe-card'
import LoadingSpinner from '../../components/loading-spinner'

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    const performSearch = async (query) => {
        // if no search query
        if (!query.trim()) {
            const randomMeals = await MealAPI.getRandomMeals(12)
            return randomMeals
                .map((meal) => MealAPI.transformMealData(meal))
                .filter((meal) => meal !== null)
        }

        // search by name first, then by ingredient if no results
        const nameResults = await MealAPI.searchMealsByName(query)
        let results = nameResults;

        if (results.length === 0) {
            const ingredientResults = await MealAPI.filterByIngredient(query)
            results = ingredientResults
        }

        return results.slice(0, 12).map((meal) => MealAPI.transformMealData(meal)).filter((meal) => meal !== null)
    }

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const results = await performSearch("")
                setRecipes(results)
            } catch (error) {
                console.error("Error loading initial data:", error)
            } finally {
                setInitialLoading(false)
            }
        }
        loadInitialData()
    }, [])

    useEffect(() => {
        if (initialLoading) return;

        const handleSearch = async () => {
            setLoading(true)

            try {
                const results = await performSearch(debouncedSearchQuery)
                setRecipes(results)
            } catch (error) {
                console.error("Error searching:", error)
                setRecipes([])
            } finally {
                setLoading(false)
            }
        }
        handleSearch()
    }, [debouncedSearchQuery, initialLoading])

    if (initialLoading) return <LoadingSpinner message='Loading recipes...' />

    return (
        <View style={searchStyles.container}>
            <View style={searchStyles.searchContainer}>
                <Ionicons name='search' size={20} color={COLORS.textLight} style={searchStyles.searchIcon} />
                <TextInput
                    style={searchStyles.searchInput}
                    placeholder='Search recipes, ingredient...'
                    placeholderTextColor='#8A8A8AFF'
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType='search'
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")} style={searchStyles.clearButton}>
                        <Ionicons name='close-circle' size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={searchStyles.resultsSection}>
                <View style={searchStyles.resultsHeader}>
                    <Text style={searchStyles.resultsTitle}>
                        {searchQuery ? `Results for ${searchQuery}` : "Popular Recipes"}
                    </Text>
                    <Text style={searchStyles.resultsCount}>{recipes.length} found</Text>
                </View>

                {loading
                    ? (<View style={searchStyles.loadingContainer}>
                        <LoadingSpinner message='Searching recipes...' size='small' />
                    </View>)
                    : (
                        <FlatList
                            data={recipes}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => <RecipeCard recipe={item} />}
                            numColumns={2}
                            columnWrapperStyle={searchStyles.row}
                            contentContainerStyle={searchStyles.recipesGrid}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={<NoResultsFound />}
                        />)}
            </View>
        </View>
    )
}

export default SearchScreen

const NoResultsFound = () => {
    return (
        <View style={searchStyles.emptyState}>
            <Ionicons name='search-outline' size={64} color={COLORS.textLight} />
            <Text style={searchStyles.emptyTitle}>No recipes found</Text>
            <Text style={searchStyles.emptyDescription}>Try adjusting your search or try different keywords</Text>
        </View>
    )
}