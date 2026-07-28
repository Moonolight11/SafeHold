/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonCyan: "#00f3ff",
        neonPurple: "#9d00ff",
      },
      boxShadow: {
        neon: "0 0 15px rgba(0, 243, 255, 0.5)",
      }
    },
  },
  plugins: [],
}
