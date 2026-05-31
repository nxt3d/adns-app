import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}', './content/**/*.{md,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--accent)',
          strong: 'var(--accent-strong)',
          soft: 'var(--accent-soft)',
          fg: 'var(--accent-fg)',
        },
        ink: {
          DEFAULT: 'var(--foreground)',
          muted: 'var(--muted)',
          subtle: 'var(--subtle)',
        },
        paper: {
          DEFAULT: 'var(--surface)',
          warm: 'var(--background)',
          tint: 'var(--section-tint)',
        },
        line: {
          DEFAULT: 'var(--border)',
          soft: 'var(--border-soft)',
        },
      },
      borderRadius: {
        pill: '999px',
        card: '14px',
      },
      boxShadow: {
        hairline: '0 0 0 1px var(--shadow-hairline)',
        lift: '0 10px 40px -12px var(--shadow-hairline)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'display-1': ['clamp(2.5rem, 6vw, 4.75rem)', { lineHeight: '1.02', fontWeight: '800' }],
        'display-2': ['clamp(1.9rem, 4vw, 3rem)', { lineHeight: '1.05', fontWeight: '800' }],
      },
    },
  },
  plugins: [],
};

export default config;
