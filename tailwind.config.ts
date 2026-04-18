import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0f1117',      // page background
          surface: '#1a1d27',   // card / panel background
          elevated: '#22263a',  // hover / active surface
        },
        border: {
          subtle: '#2e3347',
          default: '#3d4460',
        },
        text: {
          primary: '#e8eaf0',
          secondary: '#9ba3bf',
          muted: '#5c6480',
        },
        accent: {
          primary: '#7c6af7',   // purple — primary CTA, links
          secondary: '#4fa3e0', // blue — MCP Server badge
          skill: '#34c98a',     // green — Skill badge
        },
      },
    },
  },
  plugins: [],
}

export default config
