/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        siembg: '#0F111A',
        siempanel: '#1A1D27',
        siemaccent: '#00D1FF',
        siemdanger: '#FF3B3B',
        siemwarn: '#FFB800',
        siemok: '#00E676',
        siemmelow: '#8B949E'
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
