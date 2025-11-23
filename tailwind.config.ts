import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Swiss Design System
        swiss: {
          black: '#000000',
          white: '#FFFFFF',
          blue: {
            DEFAULT: '#0047FF',
            light: '#3366FF',
            dark: '#0033CC',
          },
          red: {
            DEFAULT: '#FF3B30',
            light: '#FF6B63',
            dark: '#CC2F26',
          },
          yellow: {
            DEFAULT: '#FFD60A',
            light: '#FFED4E',
            dark: '#CCB108',
          },
          gray: {
            50: '#F8F8F8',
            100: '#F0F0F0',
            200: '#E0E0E0',
            300: '#C0C0C0',
            400: '#A0A0A0',
            500: '#808080',
            600: '#606060',
            700: '#404040',
            800: '#202020',
            900: '#101010',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Swiss typography scale
        display: ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
        h2: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        h3: ['1.875rem', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
        h4: ['1.5rem', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        body: ['1rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
      },
      spacing: {
        // Swiss grid system (8px base)
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderWidth: {
        '3': '3px',
        '6': '6px',
      },
    },
  },
  plugins: [],
}
export default config
