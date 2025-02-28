"use client";
import styles from "./page.module.css";
import React from "react";
import {Footer} from "@/app/components/footer/Footer";
import {RecipeList} from "@/app/components/recipe_list/RecipeList";


export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <RecipeList/>
            </main>
            <Footer/>
        </div>
    );
}
