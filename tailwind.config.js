/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface1: 'var(--surface-1)',
        surface2: 'var(--surface-2)',
        surface3: 'var(--surface-3)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
      },
      fontFamily: {
        sans: ['var(--font-family)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
