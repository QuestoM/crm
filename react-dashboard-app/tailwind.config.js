/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
      textAlign: {
        start: 'start',
        end: 'end',
      },
    },
  },
  plugins: [],
  corePlugins: {
    // Ensure RTL support
    preflight: true,
  },
} 