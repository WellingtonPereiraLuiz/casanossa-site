/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        marca: {
          primaria: '#22337a', // Azul royal escuro
          secundaria: '#25D366', // Verde WhatsApp
          claro: '#e0e7ff',
          escuro: '#1e1b4b',
          suave: '#f8fafc',
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out forwards',
        slideUp: 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      letterSpacing: {
        'widest': '.25em',
      }
    },
  },
  plugins: [],
}
