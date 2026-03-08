import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // ── Strict 8px grid spacing ──────────────────────
    spacing: {
      px:'1px', 0:'0', 0.5:'2px', 1:'4px', 1.5:'6px', 2:'8px', 2.5:'10px',
      3:'12px', 3.5:'14px', 4:'16px', 5:'20px', 6:'24px', 7:'28px', 8:'32px',
      9:'36px', 10:'40px', 11:'44px', 12:'48px', 14:'56px', 16:'64px',
      20:'80px', 24:'96px', 28:'112px', 32:'128px', 36:'144px', 40:'160px',
      48:'192px', 52:'208px', 56:'224px', 64:'256px', 72:'288px', 80:'320px', 96:'384px',
    },
    // ── Intentional type scale (no arbitrary rem values) ─
    fontSize: {
      '2xs': ['0.625rem', { lineHeight: '1rem',   letterSpacing: '0.1em'   }],
      'xs':  ['0.75rem',  { lineHeight: '1rem',   letterSpacing: '0.01em'  }],
      'sm':  ['0.875rem', { lineHeight: '1.375rem' }],
      'base':['1rem',     { lineHeight: '1.5rem'  }],
      'lg':  ['1.125rem', { lineHeight: '1.75rem' }],
      'xl':  ['1.25rem',  { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem',   { lineHeight: '2rem'    }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.01em' }],
      '4xl': ['2.25rem',  { lineHeight: '2.5rem',  letterSpacing: '-0.025em' }],
      '5xl': ['3rem',     { lineHeight: '1',        letterSpacing: '-0.03em' }],
    },
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-body)',    'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      // ── Color tokens that map to CSS vars ───────────
      colors: {
        paper:  { DEFAULT:'#f8f7f4', 2:'#f1efe9', 3:'#e8e5de' },
        ink:    { DEFAULT:'#0a0a0a', 2:'#1a1a1a', 3:'#2d2d2d' },
        ash:    '#6b6b6b',
        fog:    '#b0b0b0',
        smoke:  '#d8d8d8',
        'pure-white': '#ffffff',
        success:'#1a7a3a',
        'success-bg': 'rgba(26,122,58,0.06)',
        'success-border': '#86efad',
      },
      borderRadius: {
        none: '0', sm:'2px', DEFAULT:'4px', md:'6px', lg:'8px', xl:'12px', full:'9999px',
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px -2px rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.04)',
        focus: '0 0 0 3px rgba(10,10,10,0.08)',
      },
      // ── Design-token keyframes ───────────────────────
      keyframes: {
        fadeUp:    { from:{ opacity:'0', transform:'translateY(10px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        fadeIn:    { from:{ opacity:'0' }, to:{ opacity:'1' } },
        slideLeft: { from:{ opacity:'0', transform:'translateX(-8px)' }, to:{ opacity:'1', transform:'translateX(0)' } },
        checkPop:  { '0%':{ transform:'scale(0.6)' }, '55%':{ transform:'scale(1.18)' }, '100%':{ transform:'scale(1)' } },
        shimmer:   { '0%':{ backgroundPosition:'200% 0' }, '100%':{ backgroundPosition:'-200% 0' } },
        milestoneIn: { from:{ opacity:'0', transform:'scale(0.94)' }, to:{ opacity:'1', transform:'scale(1)' } },
      },
      animation: {
        'fade-up':     'fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':     'fadeIn 0.2s ease forwards',
        'slide-left':  'slideLeft 0.28s cubic-bezier(0.16,1,0.3,1) forwards',
        'check-pop':   'checkPop 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'shimmer':     'shimmer 2s linear infinite',
        'milestone-in':'milestoneIn 0.5s cubic-bezier(0.34,1.1,0.64,1) forwards',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34,1.56,0.64,1)',
        smooth: 'cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
}
export default config
