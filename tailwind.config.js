/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // enable dark mode via .dark class
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // scan all React files
  ],
  theme: {
    extend: {
      colors: {
        lightbg: "#f5f5f5", // your light grey background
        darkbg: "#0a0a0a",  // your dark mode background
      },
    },
  },
  plugins: [],
};
