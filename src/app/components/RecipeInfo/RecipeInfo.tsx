"use client"
import styles from "@/app/components/RecipeInfo/RecipeInfo.module.scss"
import {useParams} from 'next/navigation';
import Image from 'next/image';
import {Recipe} from '@/app/models/Recipe';
import React, {useEffect, useState} from "react";
import {lora} from "@/app/Utils";
import {RecipeTime} from "@/app/components/RecipeTime/RecipeTime";


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
        return <p>Laster...</p>;
    }

    const scaleAmount = (amount: number) => {
        amount = (amount * servings) / recipe.servings
        const isInteger = Number.isInteger(amount)
        return (isInteger) ? amount.toFixed(0) : amount.toFixed(1)
    }


    // Function to replace placeholders in instructions with actual ingredient amounts
    const formatInstruction = (instruction: string) => {
        if (!recipe.ingredients) return instruction;

        let formattedInstruction = instruction;
        Object.entries(recipe.ingredients).forEach(([items]) => {
            // @ts-expect-error Need to type this
            items.forEach(({id, ingredient, amount, unit}) => {
                const placeholder = `{${id}}`;
                if (formattedInstruction.includes(placeholder)) {
                    formattedInstruction = formattedInstruction.replace(
                        new RegExp(placeholder, 'g'),
                        `<span class="${styles.ingredient}">${scaleAmount(amount)} ${unit} ${ingredient.toLowerCase()}</span>`
                    );
                }
            })
        });

        return formattedInstruction
    };

    return (
        <>
            <Image
                src={recipe.image || '/placeholder.jpg'}
                alt={recipe.name}
                width={500}
                height={300}
                className={styles.recipeImage}
            />

            <div className={styles.recipeContainer}>

                <div className={styles.recipeIngredients}>
                    <h2 className={`${lora.className}`}>Ingredienser</h2>
                    <div className={styles.servingsControl}>
                        <button
                            className={styles.servingsButton}
                            onClick={() => setServings((prev) => prev && Math.max(1, prev - 1))}
                        >
                            −
                        </button>

                        <span className={styles.servingsText}>{servings} {servings == 1 ? "porsjon" : "porsjoner"}</span>

                        <button
                            className={styles.servingsButton}
                            onClick={() => setServings((prev) => prev && prev + 1)}
                        >
                            +
                        </button>
                    </div>


                    {recipe.ingredients && Object.entries(recipe.ingredients).map(([category, items]) => (
                        <div key={category}>
                            <h3>{category}</h3>
                            <ul>
                                {Array.isArray(items) && items.map((ingredient) => (
                                    <li key={ingredient.id}>
                                        <div>{ingredient.ingredient}</div>
                                        <div>{scaleAmount(ingredient.amount)} {ingredient.unit}</div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className={styles.recipeInstructions}>
                    <h1 className={`${lora.className}`}>{recipe.name}</h1>
                    <RecipeTime prepTime={recipe.prepTime}/>

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
            </div>
        </>
    );
};
