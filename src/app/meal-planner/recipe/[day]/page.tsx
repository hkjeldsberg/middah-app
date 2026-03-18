"use client";
import styles from "@/app/page.module.scss";
import recipeStyles from "@/app/components/RecipeInfo/RecipeInfo.module.scss";
import { Footer } from "@/app/components/Footer/Footer";
import React, { useState } from "react";
import { lora, varelaRound } from "@/app/Utils";
import { useParams, useRouter } from "next/navigation";
import { useMealPlanner } from "@/app/context/MealPlannerContext";
import { RecipeTime } from "@/app/components/RecipeTime/RecipeTime";
import KeepAwakeToggle from "@/app/components/KeepAwakeToggle/KeepAwakeToggle";
import navStyles from "@/app/components/MealPlanner/MealPlanner.module.scss";

export default function MealPlannerRecipePage() {
    const params = useParams();
    const router = useRouter();
    const { meals } = useMealPlanner();
    const dayIndex = Number(params.day);
    const meal = meals[dayIndex];
    const recipe = meal?.recipe ?? null;
    const [servings, setServings] = useState<number>(recipe?.servings ?? 4);

    if (!meal || !recipe) {
        return (
            <div className={`${styles.page} ${lora.className}`}>
                <main className={styles.main}>
                    <p style={{ textAlign: "center", padding: "2rem" }}>Ingen oppskrift funnet.</p>
                    <div style={{ textAlign: "center" }}>
                        <button
                            onClick={() => router.push("/meal-planner")}
                            style={{
                                padding: "0.5rem 1.5rem", background: "#c2b39d", color: "white",
                                border: "none", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit"
                            }}
                        >
                            ← Tilbake til ukemeny
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const scaleAmount = (amount: number) => {
        const scaled = (amount * servings) / recipe.servings;
        return Number.isInteger(scaled) ? scaled.toFixed(0) : scaled.toFixed(1);
    };

    const formatInstruction = (instruction: string) => {
        if (!recipe.ingredients) return instruction;
        let formatted = instruction;
        Object.entries(recipe.ingredients).forEach(([, items]) => {
            if (!Array.isArray(items)) return;
            items.forEach(({ id, ingredient, amount, unit }) => {
                const placeholder = `{${id}}`;
                if (formatted.includes(placeholder)) {
                    formatted = formatted.replace(
                        new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
                        `<span class="${recipeStyles.ingredient}">${scaleAmount(amount)} ${unit} ${ingredient.toLowerCase()}</span>`
                    );
                }
            });
        });
        return formatted;
    };

    return (
        <div className={`${styles.page} ${lora.className} ${varelaRound.className}`}>
            <main className={styles.main}>
                {/* Nav */}
                <div className={navStyles.nav} style={{ marginBottom: "1rem" }}>
                    <button className={navStyles.navBtn} onClick={() => router.push("/")}>
                        🍳 Oppskrifter
                    </button>
                    <button className={navStyles.navBtn} onClick={() => router.push("/meal-planner")}>
                        ← Tilbake til ukemeny
                    </button>
                </div>

                <div className={recipeStyles.recipeContainer} style={{ flexDirection: "column" }}>
                    {/* Day badge */}
                    <div style={{
                        textAlign: "center", marginBottom: "0.5rem",
                        fontSize: "0.9rem", color: "#9e8c76", fontWeight: "bold", letterSpacing: "0.05em"
                    }}>
                        {meal.day.toUpperCase()}
                    </div>

                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                        {/* Ingredients column */}
                        <div className={recipeStyles.recipeIngredients}>
                            <h2 className={lora.className}>Ingredienser</h2>
                            <div className={recipeStyles.servingsControl}>
                                <button className={recipeStyles.servingsButton} onClick={() => setServings(s => Math.max(1, s - 1))}>−</button>
                                <span className={recipeStyles.servingsText}>{servings} {servings === 1 ? "porsjon" : "porsjoner"}</span>
                                <button className={recipeStyles.servingsButton} onClick={() => setServings(s => s + 1)}>+</button>
                            </div>

                            {recipe.ingredients && Object.entries(recipe.ingredients).map(([category, items]) => (
                                <div key={category}>
                                    <h3>{category}</h3>
                                    <ul>
                                        {Array.isArray(items) && items.map(ingredient => (
                                            <li key={ingredient.id}>
                                                <div>{ingredient.ingredient}</div>
                                                <div>{scaleAmount(ingredient.amount)} {ingredient.unit}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Instructions column */}
                        <div className={recipeStyles.recipeInstructions}>
                            <h1 className={lora.className}>{recipe.name}</h1>
                            <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "0.5rem" }}>{recipe.description}</p>
                            <div className={recipeStyles.recipeTimeAndButton}>
                                <RecipeTime prepTime={recipe.prepTime} />
                                <KeepAwakeToggle />
                            </div>

                            {recipe.instructions && recipe.instructions.map(section => (
                                <div key={section.name}>
                                    <h3>{section.name}</h3>
                                    <ol>
                                        {section.instructions.map((step, i) => (
                                            <li key={i} dangerouslySetInnerHTML={{ __html: formatInstruction(step) }} />
                                        ))}
                                    </ol>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
