/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        krono: {
          50: '#fdf8f0',
          100: '#faefd9',
          200: '#f4d9a8',
          300: '#ecbc6e',
          400: '#e49b3a',
          500: '#dc7f1e',
          600: '#c46314',
          700: '#a34913',
          800: '#843a16',
          900: '#6c3115',
          950: '#3d1707',
        },
        dark: {
          900: '#0f0f0f',
          800: '#1a1a1a',
          700: '#242424',
          600: '#2e2e2e',
          500: '#3a3a3a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
