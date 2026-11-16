import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'accent-fg': 'var(--accent-fg)',
        'accent-text': 'var(--accent-text)',
      },
      boxShadow: {
        glow: '0 0 20px var(--accent-glow)',
      },
    },
  },
  plugins: [],
};
export default config;
