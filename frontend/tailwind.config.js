/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        siembg: '#050B14',      // Ultra deep blue/black
        siempanel: '#111827',   // Slate-900 equivalent for base panels
        siempanelhover: '#1F2937', 
        siemaccent: '#0EA5E9',  // Sky blue (Wazuh active state style)
        siemdanger: '#EF4444',  // Sharp red
        siemwarn: '#F59E0B',    // Amber
        siemok: '#10B981',      // Emerald
        siemmelow: '#9CA3AF',   // Text muted (Gray 400)
        siemborder: '#374151'   // Subtle borders (Gray 700)
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
