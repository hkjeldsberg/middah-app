import styles from "@/app/components/RecipeList/RecipeList.module.scss"
import Image from "next/image";
import React, {useEffect, useState} from "react";
import {Recipe} from "@/app/models/Recipe";
import {useRouter, useSearchParams} from "next/navigation";
import {RecipeTime} from "@/app/components/RecipeTime/RecipeTime";
import {lora} from "@/app/Utils";

export const RecipeList = () => {
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [recipesToShow, setRecipesToShow] = useState<Recipe[]>([]);
    const [page, setPage] = useState<number>(1)
    const max_items = 6
    const num_pages = Math.ceil(recipes.length / max_items)
    const params = useSearchParams()
    const showPagination = params.get("page") == "true"
    const range = (start: number, end: number) => Array.from(Array(end).keys()).slice(start);

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
    const handleClickScroll = () => {
        window.scrollTo({top: 0, behavior: 'smooth'});
    };


    useEffect(() => {
        const updateRecipe = () => {
            if (showPagination) {
                const indices = range(1 + max_items * (page - 1), 1 + max_items * page)
                const newRecipes = recipes.filter(recipe => indices.includes(recipe.id))
                setRecipesToShow(newRecipes)
            } else {
                setRecipesToShow(recipes)
            }
        }
        updateRecipe()
    }, [recipes, page, showPagination]);

    const pageUp = () => {
        handleClickScroll()
        setPage((prev) => Math.min(prev + 1, num_pages));
    };

    const pageDown = () => {
        handleClickScroll()
        setPage((prev) => Math.max(prev - 1, 1));
    };
    return (
        <>
            <h1 id="title" className={`${styles.title} ${lora.className}`}>️Middah.</h1>

            <div className={styles.nav}>
                <button className={`${styles.navBtn} ${styles.active}`} onClick={() => router.push('/')}>
                    🍳 Oppskrifter
                </button>
                <button className={styles.navBtn} onClick={() => router.push('/meal-planner')}>
                    📅 Ukemeny
                </button>
            </div>

            <div className={styles.recipeGrid}>
                {recipesToShow.map((recipe) => (
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
            {showPagination && <div className={styles.pagination}>
                <button
                    className={styles.paginationButton}
                    onClick={pageDown}
                    disabled={page === 1}
                >
                    ←
                </button>

                <span className={styles.pageIndicator}>
                    Side {page} of {num_pages}
                </span>

                <button
                    className={styles.paginationButton}
                    onClick={pageUp}
                    disabled={page === num_pages}
                >
                    →
                </button>
            </div>}
        </>
    )
}