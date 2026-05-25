import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Google Sans",
          "Roboto",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        // Google Material 3 palette
        gsurface: "#FFFFFF",
        gbg: "#F8F9FA",
        gborder: "#E8EAED",
        gink: "#202124",
        gmuted: "#5F6368",
        gblue: "#1A73E8",
        ggreen: "#1E8E3E",
        gamber: "#F9AB00",
        gred: "#D93025",
        gpurple: "#9334E6",
        gteal: "#129EAF",
      },
      boxShadow: {
        // Material elevation 1 + 2
        md1: "0 1px 2px rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)",
        md2: "0 1px 2px rgba(60,64,67,.3), 0 2px 6px 2px rgba(60,64,67,.15)",
      },
      borderRadius: {
        gcard: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
