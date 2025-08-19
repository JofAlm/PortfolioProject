export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Orbitron", "system-ui", "sans-serif"], // rubriker
        body: ["Roboto", "system-ui", "sans-serif"], // brödtext
      },
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#daecff",
          200: "#b5d8ff",
          300: "#8ac1ff",
          400: "#57a5ff",
          500: "#2b89ff", // primär
          600: "#1c6fe0",
          700: "#1759b1",
          800: "#144b8f",
          900: "#113f76",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.08)",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
