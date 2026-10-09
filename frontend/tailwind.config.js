/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50: '#fcf8f2',
          100: '#f7eee0',
          200: '#efdac2',
          300: '#e5bf9c',
          400: '#d99f71',
          500: '#ce8250',
          600: '#bf6b43',
          700: '#9f5338',
          800: '#804432',
          900: '#683a2c',
          950: '#381c15',
        },
        academy: {
          sand: '#FBFBFA',
          cream: '#F4F1EA',
          slate: '#1E293B',
          muted: '#64748B',
          border: '#E2E8F0',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
        'card': '0 2px 12px 0 rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

