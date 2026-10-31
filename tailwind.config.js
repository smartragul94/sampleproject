/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5fc',
          100: '#d9e8f8',
          200: '#b3d1f1',
          300: '#7fb2e6',
          400: '#4a8fd6',
          500: '#2f74c4',
          600: '#1f5aa6',
          700: '#1a4a8a',
          800: '#173c70',
          900: '#132f58',
        },
        accent: {
          100: '#fde9dc',
          400: '#f29a65',
          500: '#e8793f',
          600: '#c9602b',
        },
        success: {
          100: '#d8f3e5',
          500: '#17a06a',
          700: '#0f6b47',
        },
        warning: {
          100: '#fff1c2',
          500: '#d18f00',
          700: '#8a5d00',
        },
        error: {
          100: '#fde3e1',
          500: '#d64541',
          700: '#9f2a27',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.2s ease-out both',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
