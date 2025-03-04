import styles from "@/app/components/RecipeTime/RecipeTime.module.scss";
import Image from "next/image";
import React from "react";
import {varelaRound} from "@/app/Utils";

export const RecipeTime = (props: { prepTime: string }) => (
    <div className={`${styles.recipeTime} ${varelaRound.className}`}>
        <div className={styles.recipeIcon}>
            <Image
                aria-hidden
                src="/clock.svg"
                alt="LinkedIn icon"
                width={16}
                height={16}
                className={styles.recipeIconImage}
            />
        </div>
        <div className={styles.recipeTimeText}>
            {props.prepTime}
        </div>
    </div>
)

