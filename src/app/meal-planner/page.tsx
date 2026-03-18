"use client";
import styles from "@/app/page.module.scss";
import React from "react";
import { Footer } from "@/app/components/Footer/Footer";
import { MealPlanner } from "@/app/components/MealPlanner/MealPlanner";
import { lora, varelaRound } from "@/app/Utils";

export default function MealPlannerPage() {
    return (
        <div className={`${styles.page} ${lora.className} ${varelaRound.className}`}>
            <main className={styles.main}>
                <MealPlanner />
            </main>
            <Footer />
        </div>
    );
}
