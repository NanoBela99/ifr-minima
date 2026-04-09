import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Barlow Condensed', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0B1D3A',
          2: '#152B52',
          3: '#1E3A6E',
        },
        brand: '#1B6FEB',
      },
    },
  },
  plugins: [],
}
export default config
