import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Check local storage or system preference
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme) {
            return storedTheme;
        }

        // Check time in Egypt (Africa/Cairo)
        const egyptTimeFormatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Africa/Cairo',
            hour: '2-digit',
            hour12: false
        });
        const egyptHour = parseInt(egyptTimeFormatter.format(new Date()), 10);

        // If it's between 6 PM (18) and 6 AM (6), default to Dark Mode
        if (egyptHour >= 18 || egyptHour < 6) {
            return "dark";
        }

        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
        return "light";
    });

    // Apply class to html tag whenever theme changes
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
