"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Recipe } from "@/app/models/Recipe";

export type MealStatus = "suggested" | "recipe-generated" | "saved" | "skipped";

export interface DayMeal {
    day: string;
    dayIndex: number;
    mealTitle: string | null;
    recipe: Recipe | null;
    status: MealStatus;
    loading: boolean;
    recipeLoading: boolean;
}

interface MealPlannerContextType {
    meals: DayMeal[];
    setMeals: React.Dispatch<React.SetStateAction<DayMeal[]>>;
}

const DAYS = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

const MealPlannerContext = createContext<MealPlannerContextType | null>(null);

export const MealPlannerProvider = ({ children }: { children: ReactNode }) => {
    const [meals, setMeals] = useState<DayMeal[]>(
        DAYS.map((day, i) => ({
            day,
            dayIndex: i,
            mealTitle: null,
            recipe: null,
            status: "suggested",
            loading: false,
            recipeLoading: false,
        }))
    );

    return (
        <MealPlannerContext.Provider value={{ meals, setMeals }}>
            {children}
        </MealPlannerContext.Provider>
    );
};

export const useMealPlanner = () => {
    const ctx = useContext(MealPlannerContext);
    if (!ctx) throw new Error("useMealPlanner must be used within MealPlannerProvider");
    return ctx;
};
