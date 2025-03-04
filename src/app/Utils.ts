import {Lora, Varela_Round} from "next/font/google";

export const lora = Lora({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-lora',
});

export const varelaRound = Varela_Round({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-varela',
});
