/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        xs: ['16px', { lineHeight: '1.5' }],
        sm: ['18px', { lineHeight: '1.5' }],
        md: ['22px', { lineHeight: '1.4' }],
        lg: ['32px', { lineHeight: '1.3' }],
        xl: ['48px', { lineHeight: '1.2' }],
        '2xl': ['82px', { lineHeight: '1.1' }],
        '3xl': ['96px', { lineHeight: '1.05' }],
      },
      colors: {
        surface: {
          base: '#000000',
          raised: '#8617d0',
          strong: '#933be1',
          card: '#0a0a0c',
          subtle: '#141419',
          border: '#27272a',
        },
        brand: {
          purple: '#8617d0',
          hover: '#933be1',
          glow: 'rgba(134, 23, 208, 0.35)',
          light: '#c084fc',
        },
        text: {
          primary: '#ffffff',
          secondary: '#0000ee',
          tertiary: '#aeaeae',
          inverse: '#040404',
          linkOnDark: '#c084fc',
        },
        feedback: {
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
          ring: '#c084fc',
        }
      },
      spacing: {
        's1': '5px',
        's2': '6px',
        's3': '10px',
        's4': '14px',
        's5': '16px',
        's6': '20px',
        's7': '24px',
        's8': '28px',
      },
      borderRadius: {
        xs: '16px',
        sm: '24px',
        md: '80px',
        lg: '90px',
        xl: '100px',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.2, 0, 0, 1)',
      }
    },
  },
  plugins: [],
};
