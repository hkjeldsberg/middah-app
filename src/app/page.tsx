"use client";
import styles from "./page.module.scss";
import React, {Suspense} from "react";
import {Footer} from "@/app/components/Footer/Footer";
import {RecipeList} from "@/app/components/RecipeList/RecipeList";
import {lora, varelaRound} from "@/app/Utils";

export default function Home() {
    return (
        <div className={`${styles.page} ${lora.className} ${varelaRound.className}`}>
            <main className={styles.main}>
                <Suspense>
                    <RecipeList/>
                </Suspense>
            </main>
            <Footer/>
        </div>
    );
}
