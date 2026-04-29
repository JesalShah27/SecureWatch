/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        siem: {
          bg: '#0a0a0a',
          surface: '#111111',
          border: '#1e2535',
          primary: '#00d4ff',
          success: '#00ff88',
          warning: '#ffaa00',
          danger: '#ff3355',
          textPrimary: '#e8eaed',
          textSecondary: '#8b949e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
