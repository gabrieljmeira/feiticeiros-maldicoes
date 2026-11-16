import { ThemeConfig } from '@/types/system';

export const THEME_PRESETS = [
  { id: 'cursed-cyan', name: 'Energia Amaldiçoada', hex: '#00D8FF' },
  { id: 'hollow-purple', name: 'Vazio Roxo', hex: '#A855F7' },
  { id: 'shrine-crimson', name: 'Santuário / Kokusen', hex: '#EF4444' },
  { id: 'rct-gold', name: 'Energia Reversa', hex: '#F59E0B' },
  { id: 'heavenly-emerald', name: 'Restrição Celestial', hex: '#10B981' },
  { id: 'ten-shadows', name: 'Dez Sombras', hex: '#38BDF8' },
];

export function computeThemeVars(config: ThemeConfig): Record<string, string> {
  const clean = config.hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2) || '00', 16);
  const g = parseInt(clean.substring(2, 4) || 'd8', 16);
  const b = parseInt(clean.substring(4, 6) || 'ff', 16);

  // Luminância relativa para auto-contraste (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const fg = luminance > 0.58 ? '#09090B' : '#FFFFFF';

  return {
    '--accent': config.hex,
    '--accent-soft': `rgba(${r}, ${g}, ${b}, 0.14)`,
    '--accent-glow': `rgba(${r}, ${g}, ${b}, 0.35)`,
    '--accent-fg': fg,
    '--accent-text': config.surfaceMode === 'manga' && luminance > 0.65 ? '#18181B' : config.hex,
  };
}
