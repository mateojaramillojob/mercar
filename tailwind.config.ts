import type { Config } from "tailwindcss";

export default {
  darkMode: "media",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        crema: "#FBF7F0",
        papel: "#FFFFFF",
        tinta: "#1C1917",
        verde: { DEFAULT: "#1F7A54", claro: "#E7F3EC", oscuro: "#155C3F" },
        naranja: { DEFAULT: "#D9722B", claro: "#FDF0E5" },
        borde: "#E8E1D6",
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: { xl2: "1.25rem" },
      keyframes: {
        entra: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } },
        pop: { "0%": { transform: "scale(1)" }, "50%": { transform: "scale(0.93)" }, "100%": { transform: "scale(1)" } },
      },
      animation: { entra: "entra .18s ease-out", pop: "pop .22s ease-out" },
    },
  },
  plugins: [],
} satisfies Config;
