import styles from "@/app/page.module.scss";
import {Footer} from "@/app/components/Footer/Footer";
import React from "react";
import {RecipeInfo} from "@/app/components/RecipeInfo/RecipeInfo";
import {lora, varelaRound} from "@/app/Utils";

export default function AboutPage() {
    return (
        <div className={`${styles.page} ${lora.className} ${varelaRound.className}`}>
            <main className={styles.main}>
                <RecipeInfo/>
            </main>
            <Footer/>
        </div>

    )
}