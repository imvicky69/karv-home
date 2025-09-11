// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
    theme: {
    extend: {
      colors: {
        'primary': '#184C4F',      // A vibrant green for primary actions
        'primary-hover': '#15803D',
        'secondary': '#475569',    // A darker, cool gray for text
        'accent': '#F59E0B',       // Amber remains a good choice for warnings/highlights
        'background': '#F8FAFC',   // A very light, clean gray for page backgrounds
        'surface': '#FFFFFF',      // White for cards and modals
        'text-primary': '#1E293B',
        'text-secondary': '#64748B',
        'success': '#22C55E',      // A slightly lighter green for success states
        'danger': '#EF4444',
      },
      fontFamily: {
        primary: ['Roboto', 'sans-serif'],
        secondary: ['"Nunito Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}