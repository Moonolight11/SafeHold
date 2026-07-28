export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: { blue: "#00D2FF", green: "#00FF87", pink: "#FF0080", purple: "#8B5CF6" },
        glass: "rgba(255,255,255,0.06)",
        dark: { base: "#0B0F1C", card: "#111827", border: "rgba(255,255,255,0.08)" }
      },
      backdropBlur: { xs: "2px", sm: "8px", md: "16px" },
      animation: {
        'pulse-neon': 'pulseNeon 2s infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-in'
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,210,255,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0,255,135,0.5)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      }
    },
  },
  plugins: [],
}
