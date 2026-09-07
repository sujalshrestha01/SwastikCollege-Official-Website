import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

function getTimeBasedTheme() {
  const hour = new Date().getHours();
  // const hour = 20 //test for dark mode in day 20 represemts 8

  // Automatically use:
  // Light mode during the day: 6 AM - 6 PM
  // Dark mode during the night: 6 PM - 6 AM
  return hour >= 6 && hour < 18 ? "light" : "dark";
}

export function ThemeProvider({ children }) {
  // When the user enters/reloads the website, always start
  // with the automatic day/night theme.
  //
  // We intentionally DO NOT read the theme from localStorage here.
  // This means a manual theme choice is NOT remembered after the
  // user leaves the website.
  const [theme, setTheme] = useState(() => getTimeBasedTheme());

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Check the time every minute so the website can automatically
  // switch between day and night mode while the user is on the site.
  useEffect(() => {
    const checkTime = () => {
      setTheme(getTimeBasedTheme());
    };

    const interval = setInterval(checkTime, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // If the user manually clicks the theme button, follow their choice
  // for the rest of their current visit.
  //
  // This choice is NOT saved to localStorage.
  // Therefore, when the user leaves the website and comes back later,
  // the theme starts again according to the current day/night time.
  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return ctx;
}
