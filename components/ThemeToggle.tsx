'use client';

import { RiMoonFill, RiSunFill } from '@remixicon/react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Check localStorage and system preference
        const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = stored || (prefersDark ? 'dark' : 'light');
        
        setTheme(initialTheme);
        document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform border border-gray-200 dark:border-gray-700"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <RiMoonFill className="w-5 h-5 text-gray-700" />
            ) : (
                <RiSunFill className="w-5 h-5 text-yellow-400" />
            )}
        </button>
    );
}
