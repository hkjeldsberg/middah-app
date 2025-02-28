import styles from "@/app/page.module.css";
import {Footer} from "@/app/components/footer/Footer";
import React from "react";
import {RecipeInfo} from "@/app/components/RecipeInfo/RecipeInfo";


export default function AboutPage() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <RecipeInfo/>
            </main>
            <Footer/>
        </div>

    )
}