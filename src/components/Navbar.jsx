import { NavLink, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import mylogo from "../assets/images/mylogo.png";
import cv from "../assets/images/Mohamed_Ashraf_CV.pdf";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Text color logic for Desktop:
    const getLinkClass = (isActive) => {
        let baseClass = "transition-colors font-medium text-lg ";
        if (isActive) {
            baseClass += theme === "dark" ? "text-blue-400" : "text-blue-600";
        } else {
            baseClass += theme === "dark" ? "text-white hover:text-blue-300" : "text-black hover:text-blue-600";
        }
        return baseClass;
    };

    // Text color logic for Mobile Menu (always high contrast):
    const getMobileLinkClass = (isActive) => {
        let baseClass = "transition-colors font-semibold text-lg py-2 border-b border-gray-200 dark:border-gray-700 w-full text-center ";
        if (isActive) {
            baseClass += "text-blue-600 dark:text-blue-400";
        } else {
            baseClass += "text-slate-800 dark:text-white";
        }
        return baseClass;
    };

    if (location.pathname === "/recruiter") return null;

    return (
        <header className="header flex items-center justify-between px-4 py-2 absolute top-0 w-full z-50 bg-transparent">
            {/* Clickable Rounded Logo to LinkedIn */}
            <a
                href="https://www.linkedin.com/in/mohamed--ashraff/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 z-50"
            >
                <img
                    src={mylogo}
                    alt="Mohamed Ashraf Logo"
                    className="object-cover w-12 h-12 md:w-20 md:h-20 transition-transform duration-200 rounded-full hover:scale-105 hover:shadow-xl"
                />
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex gap-7 items-center">
                <NavLink to="/about" className={({ isActive }) => getLinkClass(isActive)}>About</NavLink>
                <NavLink to="/projects" className={({ isActive }) => getLinkClass(isActive)}>Projects</NavLink>
                <NavLink to="/certificates" className={({ isActive }) => getLinkClass(isActive)}>Certificates</NavLink>
                <NavLink to="/services" className={({ isActive }) => getLinkClass(isActive)}>Services</NavLink>
                <NavLink to="/contact" className={({ isActive }) => getLinkClass(isActive)}>Contact</NavLink>
                <a
                    href={cv}
                    download="Mohamed_Ashraf_CV.pdf"
                    className={getLinkClass(false)}
                    style={{ marginLeft: '4px' }}
                >
                    Download CV
                </a>
            </nav>

            {/* Right Controls: Theme + Mobile Menu Toggle */}
            <div className="flex items-center gap-3 z-50">
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 shadow-sm hover:scale-110 transition-transform flex items-center justify-center"
                    aria-label="Toggle Dark Mode"
                >
                    {theme === "light" ? (
                        <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.707a1 1 0 01-1.414 1.414l-.708-.707a1 1 0 010-1.414zM16 10a1 1 0 011 1h1a1 1 0 110-2h-1a1 1 0 01-1 1zm-4.22 4.22a1 1 0 010 1.415l-.708.707a1 1 0 01-1.414-1.414l.708-.707a1 1 0 011.414 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-4.22a1 1 0 01-1.415 0l-.708-.707a1 1 0 011.414-1.414l.708.707a1 1 0 010 1.414zM4 10a1 1 0 01-1-1H2a1 1 0 110 2h1a1 1 0 011-1zm4.22-4.22a1 1 0 010-1.415l.708-.707a1 1 0 01-1.414 1.414l-.708.707a1 1 0 011.414 0z" fillRule="evenodd" clipRule="evenodd" />
                            <circle cx="10" cy="10" r="4" fill="currentColor" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                    )}
                </button>

                {/* Hamburger Icon */}
                <button
                    className="md:hidden p-2 rounded-md bg-white/10 border border-white/20 backdrop-blur-md text-slate-800 dark:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle Navigation Menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-4 right-4 bg-white dark:bg-[#131521] shadow-2xl rounded-2xl p-4 flex flex-col items-center border border-gray-200 dark:border-white/10 md:hidden z-40 animate-fade-in-up">
                    <nav className="flex flex-col w-full">
                        <NavLink to="/about" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => getMobileLinkClass(isActive)}>About</NavLink>
                        <NavLink to="/projects" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => getMobileLinkClass(isActive)}>Projects</NavLink>
                        <NavLink to="/certificates" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => getMobileLinkClass(isActive)}>Certificates</NavLink>
                        <NavLink to="/services" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => getMobileLinkClass(isActive)}>Services</NavLink>
                        <NavLink to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => getMobileLinkClass(isActive)}>Contact</NavLink>
                        <a
                            href={cv}
                            download="Mohamed_Ashraf_CV.pdf"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={getMobileLinkClass(false) + " border-none mt-2 !text-emerald-500 dark:!text-emerald-400"}
                        >
                            Download CV
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;