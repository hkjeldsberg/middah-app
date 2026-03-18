"use client";
import React, { useState } from "react";
import styles from "./MealPlanner.module.scss";
import { lora } from "@/app/Utils";
import { Recipe } from "@/app/models/Recipe";
import { useRouter } from "next/navigation";
import { useMealPlanner, DayMeal } from "@/app/context/MealPlannerContext";

const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
console.log(openaiApiKey);
const DAYS = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

interface SwapModalState {
    open: boolean;
    fromIndex: number | null;
}

const callOpenAI = async (prompt: string, maxTokens: number= 100): Promise<string> => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o",
            max_tokens: maxTokens,
            messages: [{ role: "user", content: prompt }],
        }),
    });
    const data = await response.json();
    console.log(data)
    return data.choices?.[0]?.message?.content?.trim() ?? "Ukjent rett";
};


const generateMealPrompt = (day: string, existingMeals: string[]) => {
    const avoid = existingMeals.filter(Boolean).join(", ");
    return `
    Suggest a single dinner meal for ${day} in Norwegian. 
    Respond with ONLY the meal name (2-6 words), nothing else. 
    ${avoid ? `Do not suggest any of these: ${avoid}.` : ""}
    Make it a realistic, home-cooked dinner.
    Cuisines and eating plans to chose from: Middle-East, Asian, Indian, Latin American, Thai, Spanish.
    It is ideal but optional that the recipes are or can be made low-carb.`;
};

const generateFullRecipePrompt = (mealName: string) => `Create a complete recipe for "${mealName}" in Norwegian (bokmål).
You MUST respond with ONLY valid JSON — no markdown, no backticks, no explanation.

Use this exact structure:
{
  "id": 1,
  "name": "${mealName}",
  "description": "kort beskrivelse av retten",
  "servings": 4,
  "prepTime": "Under 30 min",
  "ingredients": {
    "Kategori1": [
      { "id": "ingredient_id", "ingredient": "Ingrediensnavn", "amount": 200, "unit": "g" }
    ]
  },
  "instructions": [
    {
      "name": "Steg-navn",
      "instructions": [
        "Instruksjon 1 med {ingredient_id} referanser.",
        "Instruksjon 2."
      ]
    }
  ]
}

Rules:
- ingredient id must be lowercase snake_case
- Use {ingredient_id} placeholders in instruction strings where relevant
- prepTime must be one of: "Under 15 min", "Under 30 min", "Under 45 min", "Over 45 min"
- Include 2-4 ingredient categories and 2-4 instruction sections
- Write everything in Norwegian bokmål
- Return ONLY the JSON object, nothing else`;

export const MealPlanner = () => {
    const router = useRouter();
    const { meals, setMeals } = useMealPlanner();
    const [generating, setGenerating] = useState(false);
    const [swapModal, setSwapModal] = useState<SwapModalState>({ open: false, fromIndex: null });
    const [notification, setNotification] = useState<string | null>(null);

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const updateMeal = (index: number, patch: Partial<DayMeal>) => {
        setMeals(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...patch };
            return updated;
        });
    };

    const generateAllMeals = async () => {
        setGenerating(true);
        setMeals(DAYS.map((day, i) => ({
            day, dayIndex: i, mealTitle: null, recipe: null,
            status: "suggested", loading: true, recipeLoading: false,
        })));
        const generatedTitles: string[] = [];
        for (let i = 0; i < DAYS.length; i++) {
            const title = await callOpenAI(generateMealPrompt(DAYS[i], generatedTitles));
            generatedTitles.push(title);
            setMeals(prev => {
                const updated = [...prev];
                updated[i] = { ...updated[i], mealTitle: title, loading: false };
                return updated;
            });
        }
        setGenerating(false);
    };

    const regenerateMeal = async (index: number) => {
        updateMeal(index, { loading: true, recipe: null, status: "suggested" });
        const existing = meals.map(m => m.mealTitle).filter((t): t is string => t !== null);
        const title = await callOpenAI(generateMealPrompt(DAYS[index], existing));
        updateMeal(index, { mealTitle: title, loading: false });
    };

    const generateFullRecipe = async (index: number) => {
        const meal = meals[index];
        if (!meal.mealTitle) return;
        updateMeal(index, { recipeLoading: true });
        try {
            const raw = await callOpenAI(generateFullRecipePrompt(meal.mealTitle), 1500);
            const cleaned = raw.replace(/```json|```/gi, "").trim();
            const parsed: Recipe = JSON.parse(cleaned);
            parsed.id = 10000 + index;
            updateMeal(index, { recipe: parsed, recipeLoading: false, status: "recipe-generated" });
            showNotification(`Oppskrift for "${meal.mealTitle}" er klar! 🎉`);
        } catch (e) {
            console.error("Failed to parse recipe JSON:", e);
            updateMeal(index, { recipeLoading: false });
            showNotification("Klarte ikke å generere oppskrift. Prøv igjen.");
        }
    };

    const generateAllRecipes = async () => {
        meals.forEach((_, i) => generateFullRecipe(i));

    }

    const skipMeal = (index: number) => {
        updateMeal(index, { status: "skipped", mealTitle: null, recipe: null });
    };

    const resetDay = (index: number) => {
        updateMeal(index, { mealTitle: null, recipe: null, status: "suggested" });
    };

    const saveMealJson = (index: number) => {
        const meal = meals[index];
        const toSave = meal.recipe ?? {
            id: Date.now(), name: meal.mealTitle ?? "Ukjent",
            description: `Middagsforslag for ${meal.day}`, prepTime: "Under 30 min",
            servings: 4, ingredients: [], instructions: [],
        };
        const blob = new Blob([JSON.stringify(toSave, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(meal.mealTitle ?? "oppskrift").replace(/\s+/g, "_").toLowerCase()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        updateMeal(index, { status: "saved" });
        showNotification(`"${meal.mealTitle}" lagret ✓`);
    };

    const openSwapModal = (index: number) => setSwapModal({ open: true, fromIndex: index });

    const swapMeals = (toIndex: number) => {
        const fromIndex = swapModal.fromIndex;
        if (fromIndex === null || fromIndex === toIndex) {
            setSwapModal({ open: false, fromIndex: null });
            return;
        }
        setMeals(prev => {
            const updated = [...prev];
            const { mealTitle: ft, recipe: fr, status: fs } = updated[fromIndex];
            const { mealTitle: tt, recipe: tr, status: ts } = updated[toIndex];
            updated[fromIndex] = { ...updated[fromIndex], mealTitle: tt, recipe: tr, status: ts };
            updated[toIndex] = { ...updated[toIndex], mealTitle: ft, recipe: fr, status: fs };
            return updated;
        });
        setSwapModal({ open: false, fromIndex: null });
    };

    const mealsWithRecipe = meals.filter(m => m.recipe !== null);

    const downloadShoppingList = () => {
        if (mealsWithRecipe.length === 0) return;
        const allIngredients: { ingredient: string; amount: number; unit: string }[] = [];
        for (const meal of mealsWithRecipe) {
            if (!meal.recipe?.ingredients) continue;
            Object.values(meal.recipe.ingredients).forEach((items: unknown) => {
                if (!Array.isArray(items)) return;
                items.forEach((item: { ingredient: string; amount: number; unit: string }) => {
                    const existing = allIngredients.find(
                        i => i.ingredient.toLowerCase() === item.ingredient.toLowerCase() && i.unit === item.unit
                    );
                    if (existing) existing.amount += item.amount;
                    else allIngredients.push({ ...item });
                });
            });
        }

        const lines: string[] = [
            "🛒 HANDLELISTE — Middah Ukemeny",
            "═".repeat(36), "",
            `Inkluderer: ${mealsWithRecipe.map(m => m.day).join(", ")}`, "",
        ];
        for (const meal of mealsWithRecipe) {
            if (!meal.recipe?.ingredients) continue;
            lines.push(`── ${meal.day}: ${meal.recipe.name} ──`);
            Object.entries(meal.recipe.ingredients).forEach(([cat, items]) => {
                lines.push(`  ${cat}:`);
                if (Array.isArray(items)) {
                    items.forEach((item: { ingredient: string; amount: number; unit: string }) => {
                        const amt = Number.isInteger(item.amount) ? item.amount : item.amount.toFixed(1);
                        lines.push(`    • ${item.ingredient}: ${amt} ${item.unit}`);
                    });
                }
            });
            lines.push("");
        }
        lines.push("═".repeat(36));
        lines.push("TOTALT (samlet):", "");
        allIngredients.forEach(item => {
            const amt = Number.isInteger(item.amount) ? item.amount : item.amount.toFixed(1);
            lines.push(`  • ${item.ingredient}: ${amt} ${item.unit}`);
        });

        const blob = new Blob([lines.join("\n")], { type: "text/plain; charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "handleliste.txt";
        a.click();
        URL.revokeObjectURL(url);
        showNotification("Handleliste lastet ned 🛒");
    };

    const hasAnyMeals = meals.some(m => m.mealTitle !== null || m.status === "skipped");

    return (
        <div className={`${styles.container} ${lora.className}`}>
            <h1 className={styles.title}>🍽️ Ukemeny</h1>

            <div className={styles.nav}>
                <button className={styles.navBtn} onClick={() => router.push("/")}>🍳 Oppskrifter</button>
                <button className={`${styles.navBtn} ${styles.active}`} onClick={() => router.push("/meal-planner")}>📅
                    Ukemeny
                </button>
            </div>
            <p className={styles.subtitle}>AI-genererte middagsforslag for hele uken</p>

            {!hasAnyMeals && (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🥗</span>
                    <p>Ingen middager planlagt ennå.</p>
                    <p>Trykk på knappen under for å generere forslag!</p>
                </div>
            )}

            {hasAnyMeals && (
                <div className={styles.plannerTable}>
                    {meals.map((meal, index) => (
                        <div key={meal.day} className={[
                            styles.dayRow,
                            meal.status === "skipped" ? styles.skipped : "",
                            meal.status === "saved" ? styles.saved : "",
                            meal.recipe ? styles.hasRecipe : "",
                        ].join(" ")}>
                            <div className={styles.dayLabel}>{meal.day}</div>

                            <div
                                className={`${styles.mealTitle} ${meal.recipe ? styles.clickable : ""}`}
                                onClick={() => meal.recipe && router.push(`/meal-planner/recipe/${index}`)}
                            >
                                {meal.loading ? (
                                    <span className={styles.loadingDots}>Genererer<span>...</span></span>
                                ) : meal.recipeLoading ? (
                                    <span className={styles.loadingDots}>Lager oppskrift<span>...</span></span>
                                ) : meal.status === "skipped" ? (
                                    <span className={styles.skippedText}>— Ingen middag —</span>
                                ) : meal.mealTitle ? (
                                    <span>
                                        {meal.mealTitle}
                                        {meal.recipe && <span className={styles.recipeTag}>📖 Oppskrift klar</span>}
                                    </span>
                                ) : (
                                    <span className={styles.emptyMeal}>Ikke satt</span>
                                )}
                            </div>

                            <div className={styles.actions}>
                                {meal.status !== "skipped" && meal.mealTitle && !meal.loading && !meal.recipeLoading && (
                                    <>
                                        {!meal.recipe ? (
                                            <button className={`${styles.actionBtn} ${styles.recipeBtn}`}
                                                    onClick={() => generateFullRecipe(index)}
                                                    title="Generer full oppskrift">
                                                📖 Lag oppskrift
                                            </button>
                                        ) : (
                                            <button className={`${styles.actionBtn} ${styles.viewBtn}`}
                                                    onClick={() => router.push(`/meal-planner/recipe/${index}`)}>
                                                👁 Vis oppskrift
                                            </button>
                                        )}
                                        <button className={`${styles.actionBtn} ${styles.saveBtn}`}
                                                onClick={() => saveMealJson(index)} disabled={meal.status === "saved"}>
                                            {meal.status === "saved" ? "✓ Lagret" : "💾 Lagre"}
                                        </button>
                                        <button className={`${styles.actionBtn} ${styles.regenBtn}`}
                                                onClick={() => regenerateMeal(index)}>
                                            🔄 Nytt forslag
                                        </button>
                                        <button className={`${styles.actionBtn} ${styles.swapBtn}`}
                                                onClick={() => openSwapModal(index)}>
                                            ↔️ Bytt dag
                                        </button>
                                    </>
                                )}
                                {meal.status === "skipped" ? (
                                    <button className={`${styles.actionBtn} ${styles.regenBtn}`}
                                            onClick={() => resetDay(index)}>↩ Angre</button>
                                ) : (
                                    !meal.loading && !meal.recipeLoading && meal.mealTitle && (
                                        <button className={`${styles.actionBtn} ${styles.skipBtn}`}
                                                onClick={() => skipMeal(index)}>✕ Hopp over</button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.controls}>
                <button className={styles.generateBtn} onClick={generateAllMeals} disabled={generating}>
                    {generating ? "Genererer ukemeny..." : hasAnyMeals ? "🔄 Generer ny ukemeny" : "✨ Generer ukemeny"}
                </button>
                <button className={styles.generateBtn} onClick={() => generateAllRecipes()} title="Generer alle oppskrifter">
                    📖 Lag alle oppskrifter
                </button>
                {mealsWithRecipe.length > 0 && (
                    <button className={styles.shoppingBtn} onClick={downloadShoppingList}>
                        🛒 Last ned handleliste ({mealsWithRecipe.length} middager)
                    </button>
                )}
            </div>

            {notification && <div className={styles.notification}>{notification}</div>}

            {swapModal.open && swapModal.fromIndex !== null && (
                <div className={styles.modalOverlay} onClick={() => setSwapModal({open: false, fromIndex: null})}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3>Bytt {meals[swapModal.fromIndex].day} med...</h3>
                        <div className={styles.swapList}>
                            {meals.map((m, i) => i !== swapModal.fromIndex ? (
                                <button key={m.day} className={styles.swapOption} onClick={() => swapMeals(i)}>
                                    <span className={styles.swapDay}>{m.day}</span>
                                    <span className={styles.swapMeal}>{m.mealTitle ?? "—"}</span>
                                </button>
                            ) : null)}
                        </div>
                        <button className={styles.cancelBtn}
                                onClick={() => setSwapModal({open: false, fromIndex: null})}>Avbryt
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
