import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { homeStyles } from '../assets/styles/home.styles'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { COLORS } from '../constants/colors'

const FeaturedRecipe = ({ featuredRecipe }) => {
    const router = useRouter()
    return (
        <View style={homeStyles.featuredSection}>
            <TouchableOpacity
                style={homeStyles.featuredCard}
                activeOpacity={0.9}
                onPress={() => router.push(`/recipe-detail/${featuredRecipe.id}`)}>
                <View style={homeStyles.featuredImageContainer}>
                    <Image
                        source={{ uri: featuredRecipe.image }}
                        style={homeStyles.featuredImage}
                        contentFit='cover'
                        transition={500}
                    />
                    <View style={homeStyles.featuredOverlay}>
                        <View style={homeStyles.featuredBadge}>
                            <Text style={homeStyles.featuredBadgeText}>Featured</Text>
                        </View>
                        <View style={homeStyles.featuredContent}>
                            <Text style={homeStyles.featuredTitle}>{featuredRecipe.title}</Text>
                            <View style={homeStyles.featuredMeta}>
                                <View style={homeStyles.metaItem}>
                                    <Ionicons name='time-outline' size={16} color={COLORS.white} />
                                    <Text style={homeStyles.metaText}>{featuredRecipe.cookTime}</Text>
                                </View>
                                <View style={homeStyles.metaItem}>
                                    <Ionicons name='people-outline' size={16} color={COLORS.white} />
                                    <Text style={homeStyles.metaText}>{featuredRecipe.servings}</Text>
                                </View>
                                <View style={homeStyles.metaItem}>
                                    <Ionicons name='location-outline' size={16} color={COLORS.white} />
                                    <Text style={homeStyles.metaText}>{featuredRecipe.area}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default FeaturedRecipe