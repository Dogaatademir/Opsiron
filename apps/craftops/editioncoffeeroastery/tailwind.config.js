/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          600: '#8c6b5d',
          800: '#4a3b36',
          900: '#3d302c',
        }
      }
    },
  },
  plugins: [],
}