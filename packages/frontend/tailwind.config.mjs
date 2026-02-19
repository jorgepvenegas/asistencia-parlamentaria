/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        body: ['Sora', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          red: '#DC2626',
          green: '#22C55E',
        },
        attendance: {
          DEFAULT: '#4ab170',
          light: '#4ab170',
        },
        justified: {
          DEFAULT: '#F59E0B',
          light: '#F59E0B',
        },
        unjustified: {
          DEFAULT: '#EF4444',
          light: '#EF4444',
        },
        noJust: {
          DEFAULT: '#991B1B',
          light: '#991B1B',
        },
        surface: {
          light: '#FAFAFA',
          DEFAULT: '#FAFAFA',
          dark: '#16162a',
        },
        muted: {
          DEFAULT: '#999',
          light: '#999',
          dark: '#5E5E5E',
        },
        subtle: {
          DEFAULT: '#5E5E5E',
          light: '#5E5E5E',
          dark: '#9a9a9a',
        },
        border: {
          light: '#E5E5E5',
          DEFAULT: '#E5E5E5',
          dark: '#333',
          darker: '#1a1a1a',
        },
        error: '#E63946',
        warning: '#F4A261',
        info: '#2563eb',
      },
    },
  },
  plugins: [],
};
