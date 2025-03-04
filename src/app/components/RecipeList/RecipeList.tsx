import styles from "@/app/components/RecipeList/RecipeList.module.scss"
import Image from "next/image";
import React, {useEffect, useState} from "react";
import {Recipe} from "@/app/models/Recipe";
import {useRouter} from "next/navigation";
import {RecipeTime} from "@/app/components/RecipeTime/RecipeTime";
import {lora} from "@/app/Utils";

export const RecipeList = () => {
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    const loadRecipeImage = async (recipeId: number): Promise<string> => {
        try {
            return "/recipes/" + recipeId.toString() + ".png";
        } catch (error) {
            console.error("Error fetching image:", error);
            return "/placeholder.jpg";
        }
    }

    useEffect(() => {
        const loadRecipes = async () => {
            const response = await fetch("/recipes.json");
            const data: Recipe[] = await response.json();

            // Fetch an image for each recipe
            const updatedRecipes = await Promise.all(
                data.map(async (recipe) => ({
                    ...recipe,
                    image: await loadRecipeImage(recipe.id),
                }))
            );
            setRecipes(updatedRecipes);
        }

        loadRecipes();
    }, []);

    return (
        <>
            <h1 className={styles.title}>⭐️ Oppskrifter ⭐️</h1>
            <div className={styles.recipeGrid}>
                {recipes.map((recipe) => (
                    <div
                        key={recipe.id}
                        className={`${styles.recipeCard} ${lora.className}`}
                        onClick={() => router.push(`/recipe/${recipe.id}`)}
                        style={{cursor: "pointer"}}
                    >
                        <Image
                            src={recipe.image || "/placeholder.jpg"}
                            alt={recipe.name}
                            width={300}
                            height={200}
                            className={styles.recipeImage}
                        />
                        <div className={styles.recipeInfo}>
                            <div className={styles.recipeName}>{recipe.name}</div>
                            <RecipeTime prepTime={recipe.prepTime}/>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}