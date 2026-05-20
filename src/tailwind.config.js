/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Our new deep luxury safari colors
        'safari-green': '#0A1A12', 
        'safari-emerald': '#1B3022',
        
        // Refined premium golds
        gold: {
          DEFAULT: "#d4af37",
          light: "#F1D592", 
        },
        
        // Retained your existing colors so we don't break older components
        emerald: {
          DEFAULT: "#064e3b",
          light: "#065f46",
        },
        luxury: {
          black: "#0a0a0a",
          glass: "rgba(255, 255, 255, 0.1)",
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair-display)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      
      // Native Tailwind Keyframes for cinematic effects
      keyframes: {
        'slow-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        }
      },
      // Native Tailwind Animation classes
      animation: {
        'slow-zoom': 'slow-zoom 20s infinite alternate ease-in-out',
      }
    },
  },
  plugins: [],
};