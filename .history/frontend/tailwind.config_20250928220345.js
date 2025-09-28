/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(30 27% 98%)',
        foreground: 'hsl(20 15% 22%)',
        muted: 'hsl(24 10% 70%)',
        border: 'hsl(30 13% 85%)',
        primary: {
          DEFAULT: 'hsl(18 65% 40%)',
          foreground: 'hsl(0 0% 100%)'
        },
        secondary: {
          DEFAULT: 'hsl(30 27% 94%)',
          foreground: 'hsl(20 15% 22%)'
        }
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
      },
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
}