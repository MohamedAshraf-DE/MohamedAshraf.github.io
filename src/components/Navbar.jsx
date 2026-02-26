import { NavLink, useLocation } from "react-router-dom";
import { useContext } from "react";
import mylogo from "../assets/images/mylogo.png";
import cv from "../assets/images/Mohamed_Ashraf_CV.pdf";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const location = useLocation();

    // Text color logic:
    // Text color depends on the global theme (dark text in light mode, white text in dark mode).
    const getLinkClass = (isActive) => {
        let baseClass = "transition-colors font-medium text-[11px] sm:text-lg ";

        if (isActive) {
            // Active state color
            baseClass += theme === "dark" ? "text-blue-400" : "text-blue-600";
        } else {
            // Inactive state color
            baseClass += theme === "dark" ? "text-white hover:text-blue-300" : "text-black hover:text-blue-600";
        }

        return baseClass;
    };

    return (
        <header className="header flex items-center justify-between pl-0 pr-1 sm:px-4 py-2 absolute top-0 w-full z-10 bg-transparent">
            {/* Clickable Rounded Logo to LinkedIn */}
            <a
                href="https://www.linkedin.com/in/mohamed--ashraff/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 -ml-3 sm:ml-0"
            >
                <img
                    src={mylogo}
                    alt="Mohamed Ashraf Logo"
                    className="object-cover w-11 h-11 sm:w-20 sm:h-20 transition-transform duration-200 rounded-full hover:scale-105 hover:shadow-xl"
                />
            </a>

            {/* Navigation Links & Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-7 flex-shrink-0">
                <nav className="flex gap-1.5 sm:gap-7 items-center">
                    <NavLink to="/about" className={({ isActive }) => getLinkClass(isActive)}>About</NavLink>
                    <NavLink to="/projects" className={({ isActive }) => getLinkClass(isActive)}>Projects</NavLink>
                    <NavLink to="/certificates" className={({ isActive }) => getLinkClass(isActive)}>Certificates</NavLink>
                    <NavLink to="/services" className={({ isActive }) => getLinkClass(isActive)}>Services</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => getLinkClass(isActive)}>Contact</NavLink>

                    {/* CV Download Link */}
                    <a
                        href={cv}
                        download="Mohamed_Ashraf_CV.pdf"
                        className={getLinkClass(false)}
                        style={{ marginLeft: '4px' }}
                    >
                        Download CV
                    </a>
                </nav>

                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="ml-1 sm:ml-2 p-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 shadow-sm hover:scale-110 transition-transform flex items-center justify-center"
                    aria-label="Toggle Dark Mode"
                >
                    {theme === "light" ? (
                        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.707a1 1 0 01-1.414 1.414l-.708-.707a1 1 0 010-1.414zM16 10a1 1 0 011 1h1a1 1 0 110-2h-1a1 1 0 01-1 1zm-4.22 4.22a1 1 0 010 1.415l-.708.707a1 1 0 01-1.414-1.414l.708-.707a1 1 0 011.414 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-4.22a1 1 0 01-1.415 0l-.708-.707a1 1 0 011.414-1.414l.708.707a1 1 0 010 1.414zM4 10a1 1 0 01-1-1H2a1 1 0 110 2h1a1 1 0 011-1zm4.22-4.22a1 1 0 010-1.415l.708-.707a1 1 0 01-1.414 1.414l-.708.707a1 1 0 011.414 0z" fillRule="evenodd" clipRule="evenodd" />
                            <circle cx="10" cy="10" r="4" fill="currentColor" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Navbar;