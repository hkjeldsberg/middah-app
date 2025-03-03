import {Instructions} from "@/app/models/Instructions";
import {Ingredient} from "@/app/models/Ingredient";

export type Recipe = {
    id: number;
    name: string;
    description: string;
    prep_time: string;
    servings: number;
    ingredients: Ingredient[];
    instructions: Instructions[];
    image?: string;
}
