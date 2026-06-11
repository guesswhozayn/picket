/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'geist-black':  '#171717',
        'geist-white':  '#ffffff',
        'g900': '#171717',
        'g600': '#4d4d4d',
        'g500': '#666666',
        'g400': '#808080',
        'g100': '#ebebeb',
        'g50':  '#fafafa',
        // Workflow accents
        'ship':    '#ff5b4f',
        'preview': '#de1d8d',
        'develop': '#0a72ef',
        // Badge
        'badge-bg':   '#ebf5ff',
        'badge-text': '#0068d6',
        'badge-green-bg':  '#f0faf5',
        'badge-green-text':'#1a7f4b',
        'badge-red-bg':    '#fff5f4',
        'badge-pink-bg':   '#fef0f9',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'Arial', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        'display':  '-0.15em',   // ~-2.4px at 16px base
        'tight-xl': '-0.06em',   // -1.28px at 20px
        'tight-lg': '-0.04em',   // -0.96px at 24px
        'tight-sm': '-0.02em',   // -0.32px at 16px
      },
      boxShadow: {
        'ring':    'rgba(0,0,0,0.08) 0px 0px 0px 1px',
        'ring-lt': 'rgb(235,235,235) 0px 0px 0px 1px',
        'card':    'rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px, #fafafa 0px 0px 0px 1px',
        'card-lg': 'rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 2px, rgba(0,0,0,0.04) 0px 8px 8px -8px, #fafafa 0px 0px 0px 1px',
        'focus':   '0 0 0 2px hsla(212,100%,48%,1)',
        'divider-b': 'rgba(0,0,0,0.08) 0px -1px 0px 0px',
        'divider-r': 'rgba(0,0,0,0.08) 1px 0px 0px 0px',
        'divider-t': 'rgba(0,0,0,0.08) 0px 1px 0px 0px',
      },
      borderRadius: {
        'micro': '2px',
        'sm':    '4px',
        'md':    '6px',
        'lg':    '8px',
        'xl':    '12px',
        'pill':  '9999px',
      },
    },
  },
  plugins: [],
}
