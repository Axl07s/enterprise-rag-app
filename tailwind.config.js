/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: {
          50: '#18181b',
          100: '#27272a',
          200: '#3f3f46',
          300: '#52525b',
        },
        brand: {
          orange: '#f97316',
          amber: '#f59e0b',
          cyan: '#06b6d4',
          emerald: '#10b981',
          violet: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(249, 115, 22, 0.3)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
      }
    },
  },
  plugins: [],
}
