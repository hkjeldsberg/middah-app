"use client"
import {useParams} from 'next/navigation';
import Image from 'next/image';
import styles from '@/app/page.module.css';
import {Recipe} from '@/app/models/Recipe';
import {useEffect, useState} from "react";

export const RecipeInfo = () => {
    const params = useParams();
    const id = params.id;
    const [recipe, setRecipe] = useState<Recipe | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchRecipe = async () => {
            try {
                const response = await fetch('/recipes.json');
                const data: Recipe[] = await response.json();
                const foundRecipe = data.find((r) => r.id === Number(id));
                if (foundRecipe) {
                    setRecipe({
                        ...foundRecipe,
                        image: `/recipes/${foundRecipe.id}.png`,
                    });
                }
            } catch (error) {
                console.error('Error fetching recipe:', error);
            }
        };

        fetchRecipe();
    }, [id]);

    if (!recipe) {
        return <p>Loading...</p>;
    }

    return (
        <div className={styles.recipeContainer}>
            <h1 className={styles.title}>{recipe.name}</h1>
            <Image
                src={recipe.image || '/placeholder.jpg'}
                alt={recipe.name}
                width={500}
                height={300}
                className={styles.recipeImage}
            />
            <p>{recipe.description}</p>
            <h2>Ingredients</h2>
            <ul>
                {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                ))}
            </ul>
            <p>Instructions: {recipe.instructions}</p>
        </div>
    );
};

