import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Curieus Theme Colors
        Primary: '#3E84A8',
        Secondary: '#ACD9ED',
        Contents: '#FFFEF8',
        'Primary-focus': '#A6F0FF',
        'Primary-hover': '#005683',
        Background: '#F0F6F5',
        stroke: '#EEEEEE',
        white: '#FFFFFF',
        black: '#181C31',
        mainblue: '#1F8CF2',
        meta: '#20C5A8',
        waterloo: '#757693',
        manatee: '#999AA1',
        alabaster: '#FBFBFB',
        zumthor: '#EDF5FF',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'solid-2': '0px 2px 10px rgba(122, 135, 167, 0.05)',
        'solid-3': '0px 6px 90px rgba(8, 14, 40, 0.04)',
        'solid-4': '0px 6px 90px rgba(8, 14, 40, 0.1)',
        'solid-5': '0px 8px 24px rgba(45, 74, 170, 0.08)',
        'solid-10': '0px 8px 30px rgba(45, 74, 170, 0.06)',
        'solid-11': '0px 6px 20px rgba(45, 74, 170, 0.05)',
      },
      animation: {
        slideDown: 'slideDown 0.3s ease-out',
        slideUp: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        fadeIn: 'fadeIn 0.3s ease-out',
        scaleIn: 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
      },
      keyframes: {
        slideDown: {
          from: {
            opacity: '0',
            transform: 'scaleY(0.95) translateY(-10px)',
          },
          to: {
            opacity: '1',
            transform: 'scaleY(1) translateY(0)',
          },
        },
        slideUp: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          from: {
            opacity: '0',
          },
          to: {
            opacity: '1',
          },
        },
        scaleIn: {
          from: {
            opacity: '0',
            transform: 'scale(0.8)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
