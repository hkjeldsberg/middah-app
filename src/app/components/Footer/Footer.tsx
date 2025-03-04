import React from "react";
import Image from "next/image";
import styles from "@/app/components/Footer/Footer.module.scss"

export const Footer = () => <footer className="footer">
    <div className={styles.containerFooter}>
        <div className={styles.footerName}>
            <p>© 2025 Henrik Aasen Kjeldsberg</p>
        </div>
        <div className={styles.footerLinks}>

            <a
                href="https://github.com/hkjeldsberg"
                target="_blank"
                rel="noopener noreferrer"
            >
                <div className={styles.footerLink}>
                    <Image
                        aria-hidden
                        src="/github.svg"
                        alt="GitHub icon"
                        width={16}
                        height={16}
                    />
                    GitHub
                </div>
            </a>
            <a
                href="https://www.linkedin.com/in/hkjeldsberg/"
                target="_blank"
                rel="noopener noreferrer"
            >
                <div className={styles.footerLink}>
                    <Image
                        aria-hidden
                        src="/linkedin.svg"
                        alt="LinkedIn icon"
                        width={16}
                        height={16}
                    />
                    LinkedIn
                </div>
            </a>
        </div>
    </div>
</footer>

