import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/tailwind-datepicker-react/dist/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          400: '#C50300',
        }
      },
      screens: {
        '3xl': '1922px',
      },
    },
  },
  plugins: [],
}
export default config
