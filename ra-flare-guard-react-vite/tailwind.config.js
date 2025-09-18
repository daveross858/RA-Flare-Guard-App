/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f6ff',
          100: '#e8eaff',
          200: '#d4d7ff',
          300: '#b3b7ff',
          400: '#8c8cff',
          500: '#5e61ff',
          600: '#4140ff',
          700: '#332fdb',
          800: '#2c2ab1',
          900: '#24237f',
        },
      },
    },
  },
  plugins: [],
};
