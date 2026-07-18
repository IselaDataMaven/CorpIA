import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "corpia_theme";

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === "light" || stored === "dark") {
      return stored;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Aplica tema y guarda preferencia
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      console.warn("No se pudo guardar el tema");
    }
  }, [theme]);

  // Escucha cambios del sistema operativo
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const listener = (event) => {
      const userPreference = localStorage.getItem(STORAGE_KEY);

      // Solo cambia automáticamente si el usuario
      // nunca seleccionó un tema manualmente
      if (!userPreference) {
        setTheme(event.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", listener);

    return () => {
      media.removeEventListener("change", listener);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  }

  return ctx;
}
