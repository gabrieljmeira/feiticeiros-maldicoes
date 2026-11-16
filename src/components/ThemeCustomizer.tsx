'use client';

import React, { useState } from 'react';
import { Palette, Sun, Moon } from 'lucide-react';
import { ThemeConfig } from '@/types/system';
import { THEME_PRESETS } from '@/utils/theme';

interface Props {
  theme: ThemeConfig;
  onChange: (next: ThemeConfig) => void;
}

export function ThemeCustomizer({ theme, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-xs font-semibold text-zinc-100 hover:border-accent transition"
      >
        <span className="h-3.5 w-3.5 rounded-full border border-white/30" style={{ backgroundColor: theme.hex }} />
        <Palette className="h-4 w-4 text-accent-text" />
        <span>Cores & Tema</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-zinc-700 bg-zinc-950 p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Assinatura de Energia</span>
            <button
              type="button"
              onClick={() =>
                onChange({ ...theme, surfaceMode: theme.surfaceMode === 'dark' ? 'manga' : 'dark' })
              }
              className="flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[11px] text-zinc-200 hover:border-accent"
            >
              {theme.surfaceMode === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {theme.surfaceMode === 'dark' ? 'Modo Mangá' : 'Modo Sombrio'}
            </button>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            {THEME_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ ...theme, presetId: p.id, hex: p.hex })}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] transition ${
                  theme.hex.toLowerCase() === p.hex.toLowerCase()
                    ? 'border-accent bg-accent-soft text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: p.hex }} />
                <span className="truncate w-full text-center">{p.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-zinc-800 pt-3">
            <label className="mb-1.5 block text-[11px] font-medium text-zinc-400">
              Roda de Cores Livre (HEX)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.hex}
                onChange={(e) => onChange({ ...theme, presetId: 'custom', hex: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded border border-zinc-700 bg-transparent"
              />
              <input
                type="text"
                value={theme.hex.toUpperCase()}
                maxLength={7}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                    onChange({ ...theme, presetId: 'custom', hex: val });
                  }
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 font-mono text-xs uppercase text-zinc-100 focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
