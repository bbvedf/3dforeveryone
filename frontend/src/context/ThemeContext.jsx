import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        // Intentar leer preferencia guardada o usar la del sistema
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // Aplicar clase al body para el CSS
        if (isDark) {
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
            // Forzar cambio de favicon
            updateFavicon('/favicon_dark.png');
        } else {
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            // Forzar cambio de favicon
            updateFavicon('/favicon_light.png');
        }
    }, [isDark]);

    const updateFavicon = (href) => {
        const link = document.getElementById('dynamic-favicon');
        if (link) {
            link.href = href;
        }
    };

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
