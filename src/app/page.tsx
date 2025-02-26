"use client";
import Image from "next/image";
import styles from "./page.module.css";
import {useEffect, useState} from "react";

interface Recipe {
    id: number;
    name: string;
    description: string;
    ingredients: string[];
    instructions: string;
    image?: string;
}

export default function Home() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    async function loadRecipeImage(recipeId: number): Promise<string> {
        try {
            return "/recipes/" + recipeId.toString() + ".png";
        } catch (error) {
            console.error("Error fetching image:", error);
            return "/placeholder.jpg";
        }
    }

    useEffect(() => {
        async function loadRecipes() {
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
        <div className={styles.page}>
            <main className={styles.main}>
                <h1 className={styles.title}>Recipe List</h1>
                <div className={styles.recipeGrid}>
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className={styles.recipeCard}>
                            <Image
                                src={recipe.image || "/placeholder.jpg"}
                                alt={recipe.name}
                                width={300}
                                height={200}
                                className={styles.recipeImage}
                            />
                            <h2>{recipe.name}</h2>
                            <p><strong>Ingredients:</strong> {recipe.ingredients.join(", ")}</p>
                            <p><strong>Instructions:</strong> {recipe.instructions}</p>
                        </div>
                    ))}
                </div>
            </main>
            <footer className={styles.footer}>
                <p>© 2025 Henrik Aasen Kjeldsberg</p>
                <div className={styles.footerLinks}>
                    <a
                        href="https://github.com/henrik-kjeldsberg"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            aria-hidden
                            src="/github.svg"
                            alt="GitHub icon"
                            width={16}
                            height={16}
                        />
                        GitHub
                    </a>
                    <a
                        href="https://www.linkedin.com/in/henrik-aasen-kjeldsberg/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            aria-hidden
                            src="/linkedin.svg"
                            alt="LinkedIn icon"
                            width={16}
                            height={16}
                        />
                        LinkedIn
                    </a>
                </div>
            </footer>

        </div>
    );
}
