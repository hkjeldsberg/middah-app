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
    const [servings, setServings] = useState<number | null>(null);


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
                    setServings(foundRecipe.servings);
                }
            } catch (error) {
                console.error('Error fetching recipe:', error);
            }
        };

        fetchRecipe();
    }, [id]);

    if (!recipe || servings === null) {
        return <p>Loading...</p>;
    }

    const scaleAmount = (amount: number) => {
        return (amount * servings) / recipe.servings;

    }


    // Function to replace placeholders in instructions with actual ingredient amounts
    const formatInstruction = (instruction: string) => {
        if (!recipe.ingredients) return instruction;

        let formattedInstruction = instruction;
        Object.entries(recipe.ingredients).forEach(([prop, items]) => {
            console.log(prop)
            // @ts-expect-error Need to type this
            items.forEach(({id, ingredient, amount, unit}) => {
                const placeholder = `{${id}}`;
                if (formattedInstruction.includes(placeholder)) {
                    formattedInstruction = formattedInstruction.replace(
                        new RegExp(placeholder, 'g'),
                        `<span class="${styles.ingredient}">${scaleAmount(amount).toFixed(1)} ${unit} ${ingredient.toLowerCase()}</span>`
                    );
                }
            })
        });

        return formattedInstruction
    };

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

            {/* Servings Control with + and - buttons */}
            <div className={styles.servingsControl}>
                <button
                    className={styles.servingsButton}
                    onClick={() => setServings((prev) => prev && Math.max(1, prev - 1))}
                >
                    −
                </button>

                <span className={styles.servingsText}>{servings} Servings</span>

                <button
                    className={styles.servingsButton}
                    onClick={() => setServings((prev) => prev && prev + 1)}
                >
                    +
                </button>
            </div>

            <p><strong>Servings:</strong> {recipe.servings}</p>
            <p><strong>Prep Time:</strong> {recipe.prep_time}</p>

            {/* Ingredients Section */}
            <h2>Ingredients</h2>
            {recipe.ingredients && Object.entries(recipe.ingredients).map(([category, items]) => (
                <div key={category}>
                    <h3>{category}</h3>
                    <ul>
                        {Array.isArray(items) && items.map((ingredient) => (
                            <li key={ingredient.id}>
                                {scaleAmount(ingredient.amount).toFixed(1)} {ingredient.unit} {ingredient.ingredient}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* Instructions Section */}
            <h2>Instructions</h2>
            {recipe.instructions && recipe.instructions.map((section) => (
                <div key={section.name}>
                    <h3>{section.name}</h3>
                    <ol>
                        {section.instructions.map((step, index) => (
                            <li key={index} dangerouslySetInnerHTML={{__html: formatInstruction(step)}}/>
                        ))}
                    </ol>
                </div>
            ))}
        </div>
    );
};
