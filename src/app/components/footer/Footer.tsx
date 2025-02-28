import React from "react";
import Image from "next/image";
import './Footer.css'

export const Footer = () => <footer className="footer">
    <p>© 2025 Henrik Aasen Kjeldsberg</p>
    <div className="container-footer">
        <a
            href="https://github.com/hkjeldsnerg"
            target="_blank"
            rel="noopener noreferrer"
        >
            <div className="footer-link">
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
            <div className="footer-link">
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
</footer>

