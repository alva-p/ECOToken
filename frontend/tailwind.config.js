/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta institucional de los mockups (doc/assets/ECOToken/screens/shared.jsx).
        eco: {
          ink: '#0F1115',
          ink2: '#6B7076',
          ink3: '#B5B8BC',
          bg: '#F7F7F5',
          surface: '#FFFFFF',
          border: '#E6E7E9',
          'border-strong': '#D7D9DC',
          org: '#1D9E75',
          'org-soft': '#E8F5EF',
          coop: '#BA7517',
          'coop-soft': '#FAF1E4',
          muni: '#534AB7',
          'muni-soft': '#ECEAF7',
          danger: '#B43A2C',
        },
      },
    },
  },
  plugins: [],
};
