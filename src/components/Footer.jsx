import { socialLinks } from "../constants";

import { useLocation } from "react-router-dom";

const Footer = () => {
    const location = useLocation();

    if (location.pathname === "/recruiter") return null;

    return (
        <footer className="footer font-poppins">
            <hr className="border-slate-200" />

            <div className="footer-container">
                <p className="dark:text-slate-200 transition-colors text-center text-sm md:text-base">
                    © {new Date().getFullYear()} <strong>Mohamed Ashraf Mohamed</strong>. All rights reserved.
                </p>

                <div className="flex items-center justify-center gap-3 mt-2">
                    {socialLinks.map((link) => (
                        <a key={link.name} href={link.link} target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full dark:bg-slate-200 transition-colors">
                                <img src={link.iconUrl} alt={link.name} className="object-contain w-5 h-5" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;