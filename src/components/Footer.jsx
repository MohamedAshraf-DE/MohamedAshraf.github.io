import { socialLinks } from "../constants";

const Footer = () => {
    return (
        <footer className="footer font-poppins">
            <hr className="border-slate-200" />

            <div className="footer-container">
                <p className="dark:text-slate-200 transition-colors">
                    ©2025 <strong>Mohamed Ashraf</strong>. All rights reserved.
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