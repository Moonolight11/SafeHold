module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: { blue: "#00D2FF", green: "#00FF87" },
        glass: "rgba(255,255,255,0.05)",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
};
