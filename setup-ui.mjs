import fs from 'node:fs';
import path from 'node:path';

const files = {
  'src/app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --accent: #00d8ff;
  --accent-soft: rgba(0, 216, 255, 0.14);
  --accent-glow: rgba(0, 216, 255, 0.35);
  --accent-fg: #09090b;
  --accent-text: #00d8ff;
}

body {
  background-color: #09090b;
  color: #f4f4f5;
  font-feature-settings: "tnum" on, "lnum" on;
}

.manga-surface {
  background-color: #f4f4f5 !important;
  color: #09090b !important;
}
`,

  'src/app/layout.tsx': `import type { Metadata } from 'next';
import { Inter, Rajdhani, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-rajdhani' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Feiticeiros & Maldições v2.5 — Fichas & Escudo do Mestre',
  description: 'Criador de fichas automatizado e painel em tempo real para Feiticeiros & Maldições 2.5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={\`\${inter.variable} \${rajdhani.variable} \${jetbrains.variable}\`}>
      <body className="min-h-screen antialiased selection:bg-accent selection:text-accent-fg">
        {children}
      </body>
    </html>
  );
}
`,

  'src/lib/supabase.ts': `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
`,

  'src/components/ThemeCustomizer.tsx': `'use client';

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
                className={\`flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] transition \${
                  theme.hex.toLowerCase() === p.hex.toLowerCase()
                    ? 'border-accent bg-accent-soft text-white'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                }\`}
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
`,

  'src/components/AvatarUploader.tsx': `'use client';

import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

interface Props {
  name: string;
  avatarDataUrl?: string;
  onChange: (dataUrl: string) => void;
}

export function AvatarUploader({ name, avatarDataUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        onChange(canvas.toDataURL('image/webp', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const initials = (name || 'FM')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title="Alterar foto do personagem (JPEG, PNG, WEBP)"
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-accent bg-zinc-900 shadow-glow transition hover:scale-105"
      >
        {avatarDataUrl ? (
          <img src={avatarDataUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-mono text-lg font-bold text-accent-text">{initials}</span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
`,

  'src/app/page.tsx': `'use client';

import React, { useMemo, useState } from 'react';
import {
  Shield, Flame, Swords, Sparkles, BookOpen, ScrollText,
  ArrowUpCircle, Plus, Users, Eye, CheckCircle2, Dices, Trash2
} from 'lucide-react';
import {
  AttributeKey, AptitudeCategory, CharacterRawState,
  GradeLevel, OriginDefinition, SpellEntry, WeaponEntry
} from '@/types/system';
import { calculateCharacter, getAttributeModifier, getCharacterGrade } from '@/engine/calculator';
import { computeThemeVars } from '@/utils/theme';
import { OFFICIAL_ORIGINS, CLANS_DATA } from '@/data/origins';
import { SPECIALIZATIONS } from '@/data/specializations';
import {
  SKILLS_LIST, TALENTS_AND_APTITUDES, TRAININGS_DATA,
  WEAPONS_CATALOG, ENCHANTMENTS_CATALOG, GM_HARD_RULES
} from '@/data/catalogs';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { AvatarUploader } from '@/components/AvatarUploader';

const ATTR_LABELS: Record<AttributeKey, string> = {
  forca: 'Força',
  destreza: 'Destreza',
  constituicao: 'Constituição',
  inteligencia: 'Inteligência',
  sabedoria: 'Sabedoria',
  presenca: 'Presença',
};

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const GRADE_ORDER: GradeLevel[] = ['4º Grau', '3º Grau', '2º Grau', '1º Grau', 'Grau Especial'];

const INITIAL_CHARACTER: CharacterRawState = {
  schemaVersion: 1,
  id: 'char-1',
  campaignCode: 'JUJUTSU-25',
  name: 'Megumi / Novo Feiticeiro',
  level: 1,
  theme: { presetId: 'cursed-cyan', hex: '#00D8FF', surfaceMode: 'dark' },
  baseAttributes: {
    forca: 10,
    destreza: 14,
    constituicao: 13,
    inteligencia: 12,
    sabedoria: 15,
    presenca: 8,
  },
  originId: 'inato',
  originAttributeBonus: { sabedoria: 2, constituicao: 1 },
  levelAttributeBonus: {},
  classLevels: { 'especialista-tecnica': 1 },
  keyAttribute: 'sabedoria',
  extraSkillAttribute: 'inteligencia',
  trainedSkills: ['Feitiçaria', 'Percepção', 'Intuição', 'Ocultismo'],
  masterSkills: [],
  trainedSaves: ['Astúcia', 'Vontade'],
  masterSaves: [],
  aptitudeLevels: { AU: 1, CL: 1, BAR: 0, DOM: 0, ER: 0 },
  selectedAbilities: ['inato-talento-natural', 'inato-marca-registrada', 'et-conjuracao-aprimorada'],
  activeToggleIds: [],
  trainingSteps: {},
  techniqueName: 'Técnica Amaldiçoada Inata',
  techniqueBasic: 'Descreva aqui o funcionamento básico da sua técnica amaldiçoada.',
  spells: [
    {
      id: 'sp-1',
      name: 'Disparo de Energia Condensada',
      level: 1,
      peCost: 1,
      actionType: 'Comum',
      range: '18m',
      areaShape: 'Alvo Único',
      damageFormula: '2d8',
      damageType: 'Energia',
      isSignature: true,
      description: 'Feitiço assinatura com custo reduzido por Marca Registrada.',
      variations: [
        {
          id: 'sp-1-v2',
          name: 'Disparo de Energia — Liberação Amplificada',
          level: 2,
          peCost: 4,
          actionType: 'Comum',
          range: '24m',
          areaShape: 'Linha',
          areaSizeMeters: 12,
          damageFormula: '4d8',
          damageType: 'Energia',
          description: 'Variação de 2º nível herdando Marca Registrada (-1 PE).',
        }
      ]
    }
  ],
  weapons: [
    {
      id: 'wp-1',
      name: 'Katana',
      category: 'Complexa',
      grade: '4º Grau',
      damageDice: '1d8',
      versatileDice: '1d10',
      damageType: 'Cortante',
      modularTypes: ['Cortante', 'Perfurante'],
      criticalRange: 19,
      properties: ['Versátil', 'Modular', 'Mortal d10'],
      enchantments: [],
      maxCharges: 2,
      currentCharges: 2,
      extraAttackBonus: 0,
      extraDamageBonus: 0,
    }
  ],
  currentPv: 15,
  tempPv: 0,
  currentPe: 9,
  tempPe: 0,
  currentSoulIntegrity: 15,
  notes: '',
};

export default function HomePage() {
  const [mode, setMode] = useState<'player' | 'gm'>('player');
  const [tab, setTab] = useState<'combate' | 'tecnica' | 'habilidades' | 'arsenal' | 'treinos'>('combate');
  const [char, setChar] = useState<CharacterRawState>(INITIAL_CHARACTER);
  const [customOrigins, setCustomOrigins] = useState<OriginDefinition[]>([]);

  // Modais de Fluxo
  const [originModalOpen, setOriginModalOpen] = useState(false);
  const [homebrewModalOpen, setHomebrewModalOpen] = useState(false);
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [rollFeed, setRollFeed] = useState<string[]>([
    'Sistema inicializado — Feiticeiros & Maldições v2.5 pronto.',
  ]);

  // Estado da Pool Dinâmica de Atributos
  const [usePoolMode, setUsePoolMode] = useState(true);
  const [poolAssignments, setPoolAssignments] = useState<Partial<Record<AttributeKey, number>>>({
    sabedoria: 15,
    destreza: 14,
    constituicao: 13,
    inteligencia: 12,
    forca: 10,
    presenca: 8,
  });

  // Estado Homebrew Form
  const [hbName, setHbName] = useState('');
  const [hbDesc, setHbDesc] = useState('');
  const [hbAttrMode, setHbAttrMode] = useState<'free_2_1' | 'fixed'>('free_2_1');
  const [hbUsesPe, setHbUsesPe] = useState(true);

  // Estado Novo Feitiço / Variação
  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState<0 | 1 | 2 | 3 | 4 | 5>(1);
  const [newSpellDamage, setNewSpellDamage] = useState('2d8');
  const [newSpellArea, setNewSpellArea] = useState<'Alvo Único' | 'Linha' | 'Cone' | 'Esfera'>('Alvo Único');
  const [variationParentId, setVariationParentId] = useState<string | null>(null);

  // Estado Área do Mestre
  const [gmNotes, setGmNotes] = useState([
    { id: 'n1', col: 'Ganchos', title: 'Dedo de Sukuna no Colégio', body: 'Maldição de 2º Grau escondida no subsolo.' },
    { id: 'n2', col: 'Em Cena', title: 'Barreira Ativa (Véu)', body: 'Raio de 30m ocultando energia amaldiçoada.' },
  ]);
  const [pinnedRules, setPinnedRules] = useState<string[]>(['rule-crit-save', 'rule-antidominio', 'rule-votos']);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCol, setNewNoteCol] = useState('Ganchos');

  const allOrigins = [...OFFICIAL_ORIGINS, ...customOrigins];
  const allAbilities = useMemo(() => {
    const fromOrigins = allOrigins.flatMap((o) => o.features);
    const fromClasses = SPECIALIZATIONS.flatMap((s) => s.abilities);
    return [...fromOrigins, ...fromClasses, ...TALENTS_AND_APTITUDES];
  }, [allOrigins]);

  const calc = useMemo(() => calculateCharacter(char, allAbilities), [char, allAbilities]);
  const themeVars = useMemo(() => computeThemeVars(char.theme), [char.theme]);

  const pushRoll = (text: string) => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setRollFeed((prev) => [\`[\${time}] \${char.name}: \${text}\`, ...prev.slice(0, 19)]);
  };

  const rollD20 = (label: string, bonus: number) => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + bonus + calc.soulTestPenalty;
    pushRoll(\`rolou \${label}: d20(\${d20}) \${bonus >= 0 ? '+' : ''}\${bonus}\${
      calc.soulTestPenalty ? \` \${calc.soulTestPenalty} (Alma)\` : ''
    } = \${total}\`);
  };

  // Valores disponíveis na Pool Dinâmica (valores já escolhidos somem dos outros selects!)
  const usedPoolValues = Object.values(poolAssignments).filter((v): v is number => v !== undefined);
  const getAvailablePoolFor = (attr: AttributeKey) => {
    const current = poolAssignments[attr];
    const countsAvailable: Record<number, number> = {};
    for (const n of STANDARD_ARRAY) countsAvailable[n] = (countsAvailable[n] || 0) + 1;
    for (const u of usedPoolValues) countsAvailable[u] = (countsAvailable[u] || 0) - 1;
    if (current !== undefined) countsAvailable[current] = (countsAvailable[current] || 0) + 1;
    return STANDARD_ARRAY.filter((n, idx) => {
      if (countsAvailable[n] > 0) {
        countsAvailable[n]--;
        return true;
      }
      return false;
    });
  };

  const handleAssignPool = (attr: AttributeKey, valStr: string) => {
    const val = valStr === '' ? undefined : Number(valStr);
    const nextPool = { ...poolAssignments, [attr]: val };
    setPoolAssignments(nextPool);
    if (val !== undefined) {
      setChar((prev) => ({
        ...prev,
        baseAttributes: { ...prev.baseAttributes, [attr]: val },
      }));
    }
  };

  const handleSelectOrigin = (origin: OriginDefinition) => {
    const autoAbilityIds = origin.features.map((f) => f.id);
    setChar((prev) => ({
      ...prev,
      originId: origin.id,
      originAttributeBonus: origin.fixedAttributes || {},
      selectedAbilities: Array.from(new Set([...prev.selectedAbilities, ...autoAbilityIds])),
    }));
    setOriginModalOpen(true);
  };

  const handleCreateHomebrewOrigin = () => {
    if (!hbName.trim()) return;
    const newOrigin: OriginDefinition = {
      id: \`hb-\${Date.now()}\`,
      name: hbName.trim(),
      isHomebrew: true,
      description: hbDesc || 'Origem customizada da campanha.',
      attributeMode: hbAttrMode,
      usesCursedEnergy: hbUsesPe,
      hasInnateTechnique: hbUsesPe,
      allowsMulticlass: true,
      features: [
        {
          id: \`hb-feat-\${Date.now()}\`,
          name: \`Herança: \${hbName.trim()}\`,
          category: 'origem',
          minLevel: 1,
          description: hbDesc || 'Benefício exclusivo de origem homebrew.',
          effects: [],
        },
      ],
    };
    setCustomOrigins((prev) => [...prev, newOrigin]);
    handleSelectOrigin(newOrigin);
    setHbName('');
    setHbDesc('');
    setHomebrewModalOpen(false);
  };

  const handleAddSpellOrVariation = () => {
    if (!newSpellName.trim()) return;
    const costByLevel: Record<number, number> = { 0: 0, 1: 2, 2: 5, 3: 8, 4: 12, 5: 20 };
    const baseCost = costByLevel[newSpellLevel] ?? 2;

    if (variationParentId) {
      setChar((prev) => ({
        ...prev,
        spells: prev.spells.map((sp) =>
          sp.id === variationParentId
            ? {
                ...sp,
                variations: [
                  ...sp.variations,
                  {
                    id: \`var-\${Date.now()}\`,
                    name: newSpellName,
                    level: newSpellLevel,
                    peCost: sp.isSignature && newSpellLevel >= 1 ? Math.max(1, baseCost - 1) : baseCost,
                    actionType: 'Comum',
                    range: '18m',
                    areaShape: newSpellArea,
                    damageFormula: newSpellDamage,
                    damageType: 'Energia',
                    description: 'Variação de liberação vinculada ao feitiço base.',
                  },
                ],
              }
            : sp
        ),
      }));
      setVariationParentId(null);
    } else {
      const created: SpellEntry = {
        id: \`sp-\${Date.now()}\`,
        name: newSpellName,
        level: newSpellLevel,
        peCost: baseCost,
        actionType: 'Comum',
        range: '18m',
        areaShape: newSpellArea,
        damageFormula: newSpellDamage,
        damageType: 'Energia',
        description: 'Feitiço criado no grimório da técnica.',
        variations: [],
      };
      setChar((prev) => ({ ...prev, spells: [...prev.spells, created] }));
    }
    setNewSpellName('');
  };

  const currentGradeIdx = GRADE_ORDER.indexOf(calc.grade);

  return (
    <div
      style={themeVars as React.CSSProperties}
      className={\`min-h-screen transition-colors \${
        char.theme.surfaceMode === 'manga' ? 'manga-surface' : 'bg-[#09090B] text-zinc-100'
      }\`}
    >
      {/* BARRA SUPERIOR / NAVEGAÇÃO JOGADOR VS MESTRE */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <AvatarUploader
              name={char.name}
              avatarDataUrl={char.avatarDataUrl}
              onChange={(url) => setChar((p) => ({ ...p, avatarDataUrl: url }))}
            />
            <div>
              <div className="flex items-center gap-2">
                <input
                  value={char.name}
                  onChange={(e) => setChar((p) => ({ ...p, name: e.target.value }))}
                  className="bg-transparent text-lg font-bold tracking-tight text-white focus:outline-none border-b border-transparent focus:border-accent"
                />
                <span className="rounded-md bg-accent px-2 py-0.5 font-mono text-xs font-bold text-accent-fg">
                  Nv. {char.level} • {calc.grade}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Origem: <strong className="text-zinc-200">{allOrigins.find((o) => o.id === char.originId)?.name}</strong> •
                Bônus Treino: <strong className="text-accent-text">+{calc.trainingBonus}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => setMode('player')}
                className={\`rounded-md px-3 py-1.5 text-xs font-bold transition \${
                  mode === 'player' ? 'bg-accent text-accent-fg' : 'text-zinc-400 hover:text-white'
                }\`}
              >
                Ficha do Jogador
              </button>
              <button
                type="button"
                onClick={() => setMode('gm')}
                className={\`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition \${
                  mode === 'gm' ? 'bg-accent text-accent-fg' : 'text-zinc-400 hover:text-white'
                }\`}
              >
                <Eye className="h-3.5 w-3.5" />
                Área do Mestre
              </button>
            </div>

            <button
              type="button"
              onClick={() => setLevelUpModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-fg shadow-glow hover:opacity-90 transition"
            >
              <ArrowUpCircle className="h-4 w-4" />
              Subir de Nível
            </button>

            <ThemeCustomizer
              theme={char.theme}
              onChange={(next) => setChar((p) => ({ ...p, theme: next }))}
            />
          </div>
        </div>
      </header>

      {mode === 'player' ? (
        <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
          {/* HUD DE RECURSOS VITAIS */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>PONTOS DE VIDA (PV)</span>
                <span className="font-mono text-emerald-400">Máx: {calc.maxPv}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  value={char.currentPv}
                  onChange={(e) => setChar((p) => ({ ...p, currentPv: Number(e.target.value) }))}
                  className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 font-mono text-xl font-bold text-white"
                />
                <span className="text-zinc-500">/ {calc.maxPv}</span>
                <button
                  type="button"
                  onClick={() => setChar((p) => ({ ...p, currentPv: calc.maxPv, currentPe: calc.maxPe }))}
                  className="ml-auto rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-accent"
                >
                  Descanso Longo
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{char.originId === 'restringido' ? 'ESTAMINA' : 'ENERGIA AMALDIÇOADA (PE)'}</span>
                <span className="font-mono text-accent-text">Máx: {calc.maxPe}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  value={char.currentPe}
                  onChange={(e) => setChar((p) => ({ ...p, currentPe: Number(e.target.value) }))}
                  className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 font-mono text-xl font-bold text-accent-text"
                />
                <span className="text-zinc-500">/ {calc.maxPe}</span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>INTEGRIDADE DA ALMA</span>
                <span className="font-mono text-purple-400">{calc.maxSoulIntegrity}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  value={char.currentSoulIntegrity}
                  onChange={(e) => setChar((p) => ({ ...p, currentSoulIntegrity: Number(e.target.value) }))}
                  className="w-20 rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1 font-mono text-xl font-bold text-purple-300"
                />
                {calc.soulTestPenalty < 0 && (
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-[11px] font-semibold text-red-300">
                    {calc.soulTestPenalty} Testes / +{calc.soulCostIncrease} PE
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-center">
              <div>
                <div className="text-[10px] uppercase text-zinc-400">Defesa</div>
                <div className="mt-1 font-mono text-2xl font-bold text-white">{calc.defense.total}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-zinc-400">Iniciativa</div>
                <button
                  type="button"
                  onClick={() => rollD20('Iniciativa', calc.initiative)}
                  className="mt-1 font-mono text-2xl font-bold text-accent-text hover:underline"
                >
                  {calc.initiative >= 0 ? \`+\${calc.initiative}\` : calc.initiative}
                </button>
              </div>
              <div>
                <div className="text-[10px] uppercase text-zinc-400">CD Técnica</div>
                <div className="mt-1 font-mono text-2xl font-bold text-white">{calc.techniqueDc}</div>
              </div>
            </div>
          </section>

          {/* ABAS PRINCIPAIS */}
          <nav className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
            {[
              { id: 'combate', label: 'Atributos & Perícias', icon: Shield },
              { id: 'tecnica', label: 'Técnica & Feitiços', icon: Flame },
              { id: 'habilidades', label: 'Origens, Classes & Aptidões', icon: Sparkles },
              { id: 'arsenal', label: 'Arsenal & Forja por Grau', icon: Swords },
              { id: 'treinos', label: 'Treinamentos & Interlúdios', icon: BookOpen },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id as typeof tab)}
                  className={\`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition \${
                    tab === item.id
                      ? 'bg-accent text-accent-fg shadow-glow'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'
                  }\`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* ABA 1: ATRIBUTOS (POOL DINÂMICA) & PERÍCIAS */}
          {tab === 'combate' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-5">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-accent-text">
                      Atributos (Pool Dinâmica)
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setPoolAssignments({});
                        setUsePoolMode((v) => !v);
                      }}
                      className="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-accent"
                    >
                      {usePoolMode ? 'Modo: Valores Fixos [15..8]' : 'Modo: Edição Livre'}
                    </button>
                  </div>

                  {usePoolMode && (
                    <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-lg bg-zinc-950 p-2 text-xs">
                      <span className="text-zinc-400">Disponíveis na Pool:</span>
                      {STANDARD_ARRAY.map((val, i) => {
                        const usedCount = usedPoolValues.filter((u) => u === val).length;
                        const priorCount = STANDARD_ARRAY.slice(0, i).filter((u) => u === val).length;
                        const isUsed = usedCount > priorCount;
                        return (
                          <span
                            key={\`pool-\${i}\`}
                            className={\`rounded px-2 py-0.5 font-mono font-bold \${
                              isUsed
                                ? 'bg-zinc-800 text-zinc-600 line-through'
                                : 'bg-accent-soft text-accent-text border border-accent/40'
                            }\`}
                          >
                            {val}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(ATTR_LABELS) as AttributeKey[]).map((key) => {
                      const finalVal = calc.attributes[key];
                      const mod = calc.modifiers[key];
                      const options = getAvailablePoolFor(key);
                      return (
                        <div key={key} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-300">{ATTR_LABELS[key]}</span>
                            <button
                              type="button"
                              onClick={() => rollD20(ATTR_LABELS[key], mod)}
                              className="rounded bg-accent-soft px-2 py-0.5 font-mono text-sm font-bold text-accent-text hover:bg-accent hover:text-accent-fg"
                            >
                              {mod >= 0 ? \`+\${mod}\` : mod}
                            </button>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            {usePoolMode ? (
                              <select
                                value={poolAssignments[key] ?? ''}
                                onChange={(e) => handleAssignPool(key, e.target.value)}
                                className="w-20 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-xs text-white"
                              >
                                <option value="">--</option>
                                {options.map((opt, idx) => (
                                  <option key={\`\${opt}-\${idx}\`} value={opt}>
                                    Base {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="number"
                                value={char.baseAttributes[key]}
                                onChange={(e) =>
                                  setChar((p) => ({
                                    ...p,
                                    baseAttributes: { ...p.baseAttributes, [key]: Number(e.target.value) },
                                  }))
                                }
                                className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-xs text-white"
                              />
                            )}
                            <span className="font-mono text-lg font-bold text-white">Total: {finalVal}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* FEED DE ROLAGENS DA MESA */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-zinc-400">
                    <Dices className="h-4 w-4 text-accent-text" />
                    Histórico de Rolagens (Tempo Real)
                  </div>
                  <div className="max-h-44 space-y-1.5 overflow-y-auto font-mono text-xs">
                    {rollFeed.map((entry, idx) => (
                      <div key={idx} className="rounded bg-zinc-950 px-2.5 py-1.5 text-zinc-300">
                        {entry}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PERÍCIAS */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 lg:col-span-7">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-accent-text">
                  Perícias (Clique no bônus para rolar)
                </h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SKILLS_LIST.map((skill) => {
                    const isTrained = char.trainedSkills.includes(skill.name);
                    const isMaster = char.masterSkills.includes(skill.name);
                    const mod = calc.modifiers[skill.attr];
                    const trainVal = isMaster
                      ? Math.floor(calc.trainingBonus * 1.5)
                      : isTrained
                      ? calc.trainingBonus
                      : 0;
                    const total = mod + calc.halfLevel + trainVal;

                    return (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Alternar Treinado / Mestre"
                            onClick={() => {
                              if (!isTrained) {
                                setChar((p) => ({ ...p, trainedSkills: [...p.trainedSkills, skill.name] }));
                              } else if (!isMaster) {
                                setChar((p) => ({ ...p, masterSkills: [...p.masterSkills, skill.name] }));
                              } else {
                                setChar((p) => ({
                                  ...p,
                                  trainedSkills: p.trainedSkills.filter((s) => s !== skill.name),
                                  masterSkills: p.masterSkills.filter((s) => s !== skill.name),
                                }));
                              }
                            }}
                            className={\`h-4 w-4 rounded border text-[10px] font-bold \${
                              isMaster
                                ? 'border-amber-400 bg-amber-400 text-black'
                                : isTrained
                                ? 'border-accent bg-accent text-accent-fg'
                                : 'border-zinc-700 bg-zinc-900 text-transparent'
                            }\`}
                          >
                            {isMaster ? 'M' : isTrained ? 'T' : ''}
                          </button>
                          <span className="text-xs font-medium text-zinc-200">{skill.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => rollD20(skill.name, total)}
                          className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-xs font-bold text-accent-text hover:bg-accent hover:text-accent-fg"
                        >
                          {total >= 0 ? \`+\${total}\` : total}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: TÉCNICA AMALDIÇOADA & FEITIÇOS COM VARIAÇÕES */}
          {tab === 'tecnica' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <h2 className="text-sm font-bold uppercase text-accent-text">Técnica Amaldiçoada & Funcionamento Básico</h2>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    value={char.techniqueName}
                    onChange={(e) => setChar((p) => ({ ...p, techniqueName: e.target.value }))}
                    placeholder="Nome da Técnica"
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm font-bold text-white"
                  />
                  <textarea
                    value={char.techniqueBasic}
                    onChange={(e) => setChar((p) => ({ ...p, techniqueBasic: e.target.value }))}
                    rows={2}
                    placeholder="Funcionamento Básico da Técnica..."
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 md:col-span-2"
                  />
                </div>
              </div>

              {/* CONSTRUTOR DE FEITIÇOS E VARIAÇÕES */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase text-white">
                    {variationParentId ? 'Nova Variação de Liberação' : 'Adicionar Novo Feitiço'}
                  </h3>
                  {variationParentId && (
                    <button
                      type="button"
                      onClick={() => setVariationParentId(null)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Cancelar Variação
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                  <input
                    value={newSpellName}
                    onChange={(e) => setNewSpellName(e.target.value)}
                    placeholder="Nome do Feitiço / Variação"
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white sm:col-span-2"
                  />
                  <select
                    value={newSpellLevel}
                    onChange={(e) => setNewSpellLevel(Number(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5)}
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-white"
                  >
                    <option value={0}>Nível 0 (0 PE)</option>
                    <option value={1}>Nível 1 (2 PE)</option>
                    <option value={2}>Nível 2 (5 PE)</option>
                    <option value={3}>Nível 3 (8 PE)</option>
                    <option value={4}>Nível 4 (12 PE)</option>
                    <option value={5}>Nível 5 (20 PE)</option>
                  </select>
                  <input
                    value={newSpellDamage}
                    onChange={(e) => setNewSpellDamage(e.target.value)}
                    placeholder="Dano / Efeito (ex: 4d8)"
                    className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpellOrVariation}
                    className="flex items-center justify-center gap-1 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-fg"
                  >
                    <Plus className="h-4 w-4" />
                    {variationParentId ? 'Salvar Variação' : 'Criar Feitiço'}
                  </button>
                </div>
              </div>

              {/* LISTA DE FEITIÇOS + VARIAÇÕES ANINHADAS */}
              <div className="space-y-4">
                {char.spells.map((spell) => (
                  <div key={spell.id} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs font-bold text-accent-fg">
                            Nível {spell.level}
                          </span>
                          <h4 className="text-base font-bold text-white">{spell.name}</h4>
                          <span className="font-mono text-xs text-accent-text">[{spell.peCost} PE]</span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">
                          Alcance: {spell.range} • Área: {spell.areaShape} • Dano/Efeito:{' '}
                          <strong className="font-mono text-zinc-200">{spell.damageFormula || 'Auxiliar'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setVariationParentId(spell.id)}
                          className="rounded-lg border border-accent/50 bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-text hover:bg-accent hover:text-accent-fg"
                        >
                          + Variação de Liberação
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setChar((p) => ({ ...p, currentPe: Math.max(0, p.currentPe - spell.peCost) }));
                            pushRoll(\`conjurou \${spell.name} (-\${spell.peCost} PE) -> Dano: \${spell.damageFormula || 'Efeito'}\`);
                          }}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-fg"
                        >
                          Conjurar
                        </button>
                      </div>
                    </div>

                    {spell.variations.length > 0 && (
                      <div className="mt-3 space-y-2 border-l-2 border-accent/40 pl-4">
                        {spell.variations.map((v) => (
                          <div
                            key={v.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3"
                          >
                            <div>
                              <span className="font-mono text-[11px] font-bold text-accent-text">
                                Variação Nv.{v.level} ({v.peCost} PE)
                              </span>
                              <div className="text-xs font-bold text-white">{v.name}</div>
                              <div className="text-[11px] text-zinc-400">
                                {v.areaShape} • Dano: <strong className="font-mono text-zinc-200">{v.damageFormula}</strong>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setChar((p) => ({ ...p, currentPe: Math.max(0, p.currentPe - v.peCost) }));
                                pushRoll(\`conjurou \${v.name} (-\${v.peCost} PE) -> Dano: \${v.damageFormula}\`);
                              }}
                              className="rounded border border-accent px-2.5 py-1 text-xs font-bold text-accent-text hover:bg-accent hover:text-accent-fg"
                            >
                              Conjurar Variação
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 3: ORIGENS (OFICIAIS + HOMEBREW), CLASSES ORDENADAS & APTIDÕES */}
          {tab === 'habilidades' && (
            <div className="space-y-6">
              {/* ORIGENS + BOTÃO HOMEBREW */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase text-accent-text">Origens (Oficiais & Homebrew)</h2>
                  <button
                    type="button"
                    onClick={() => setHomebrewModalOpen(true)}
                    className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-fg"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Criar Origem Homebrew
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {allOrigins.map((orig) => (
                    <button
                      key={orig.id}
                      type="button"
                      onClick={() => handleSelectOrigin(orig)}
                      className={\`rounded-xl border p-3 text-left transition \${
                        char.originId === orig.id
                          ? 'border-accent bg-accent-soft shadow-glow'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
                      }\`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{orig.name}</span>
                        {orig.isHomebrew && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                            HOMEBREW
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400">{orig.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* NÍVEIS DE APTIDÃO AMALDIÇOADA */}
              {char.originId !== 'restringido' && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <h2 className="mb-3 text-sm font-bold uppercase text-accent-text">
                    Níveis de Aptidão Amaldiçoada (0 a 5)
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {(
                      [
                        ['AU', 'Aura'],
                        ['CL', 'Controle e Leitura'],
                        ['BAR', 'Barreiras'],
                        ['DOM', 'Domínio'],
                        ['ER', 'Energia Reversa'],
                      ] as [AptitudeCategory, string][]
                    ).map(([cat, label]) => (
                      <div key={cat} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-center">
                        <div className="text-[11px] text-zinc-400">{label}</div>
                        <div className="mt-1 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setChar((p) => ({
                                ...p,
                                aptitudeLevels: {
                                  ...p.aptitudeLevels,
                                  [cat]: Math.max(0, p.aptitudeLevels[cat] - 1),
                                },
                              }))
                            }
                            className="h-6 w-6 rounded bg-zinc-800 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono text-lg font-bold text-accent-text">
                            {char.aptitudeLevels[cat]}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setChar((p) => ({
                                ...p,
                                aptitudeLevels: {
                                  ...p.aptitudeLevels,
                                  [cat]: Math.min(5, p.aptitudeLevels[cat] + 1),
                                },
                              }))
                            }
                            className="h-6 w-6 rounded bg-zinc-800 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HABILIDADES ORDENADAS POR ESPECIALIZAÇÃO (COM EFEITOS AUTOMÁTICOS) */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase text-accent-text">
                  Habilidades Ordenadas por Especialização (Aplicação Automática)
                </h2>
                {SPECIALIZATIONS.map((spec) => (
                  <div key={spec.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">{spec.name}</h3>
                        <p className="text-xs text-zinc-400">{spec.description}</p>
                      </div>
                      <span className="font-mono text-xs text-zinc-400">
                        PV: {spec.pvFirstLevel} (+{spec.pvPerLevel}/nv) • PE: +{spec.pePerLevel}/nv
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                      {spec.abilities
                        .slice()
                        .sort((a, b) => a.minLevel - b.minLevel)
                        .map((ab) => {
                          const owned = char.selectedAbilities.includes(ab.id);
                          const active = char.activeToggleIds.includes(ab.id);
                          return (
                            <div
                              key={ab.id}
                              className={\`rounded-lg border p-3 transition \${
                                owned ? 'border-accent bg-accent-soft' : 'border-zinc-800 bg-zinc-950'
                              }\`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white">
                                  [Nv.{ab.minLevel}] {ab.name}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {owned && ab.toggleable && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setChar((p) => ({
                                          ...p,
                                          activeToggleIds: active
                                            ? p.activeToggleIds.filter((id) => id !== ab.id)
                                            : [...p.activeToggleIds, ab.id],
                                        }))
                                      }
                                      className={\`rounded px-2 py-0.5 text-[10px] font-bold \${
                                        active ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-300'
                                      }\`}
                                    >
                                      {active ? 'ATIVO' : 'Ativar'}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setChar((p) => ({
                                        ...p,
                                        selectedAbilities: owned
                                          ? p.selectedAbilities.filter((id) => id !== ab.id)
                                          : [...p.selectedAbilities, ab.id],
                                      }))
                                    }
                                    className={\`rounded px-2 py-0.5 text-[10px] font-bold \${
                                      owned ? 'bg-accent text-accent-fg' : 'bg-zinc-800 text-zinc-300'
                                    }\`}
                                  >
                                    {owned ? 'Adquirida' : 'Pegar'}
                                  </button>
                                </div>
                              </div>
                              <p className="mt-1 text-[11px] text-zinc-300">{ab.description}</p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 4: ARSENAL HÍBRIDO & FORJA TRAVADA POR GRAU */}
          {tab === 'arsenal' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold uppercase text-accent-text">
                    Adicionar Arma do Catálogo
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {WEAPONS_CATALOG.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() =>
                          setChar((p) => ({
                            ...p,
                            weapons: [
                              ...p.weapons,
                              {
                                id: \`wp-\${Date.now()}\`,
                                name: w.name,
                                category: w.category,
                                grade: calc.grade,
                                damageDice: w.damageDice,
                                versatileDice: 'versatileDice' in w ? w.versatileDice : undefined,
                                damageType: w.damageType,
                                modularTypes: 'modularTypes' in w ? [...w.modularTypes] : undefined,
                                criticalRange: w.criticalRange,
                                properties: [...w.properties],
                                enchantments: [],
                                maxCharges: calc.trainingBonus,
                                currentCharges: calc.trainingBonus,
                                extraAttackBonus: 0,
                                extraDamageBonus: 0,
                              },
                            ],
                          }))
                        }
                        className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-accent"
                      >
                        + {w.name} ({w.damageDice})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {char.weapons.map((wp) => {
                  const gradeBonus = GRADE_ORDER.indexOf(wp.grade) + 1;
                  const maxSlots = Math.min(4, GRADE_ORDER.indexOf(wp.grade));
                  const atkBonus = calc.modifiers.forca + calc.trainingBonus + gradeBonus + wp.extraAttackBonus;
                  const dmgBonus = calc.modifiers.forca + gradeBonus + wp.extraDamageBonus;

                  return (
                    <div key={wp.id} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white">{wp.name}</h3>
                          <span className="font-mono text-xs text-accent-text">
                            {wp.grade} (+{gradeBonus} Bônus de Ferramenta) • Crítico {wp.criticalRange}+
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            pushRoll(
                              \`atacou com \${wp.name}: Acerto 1d20+\${atkBonus} | Dano \${wp.damageDice}+\${dmgBonus} (\${wp.damageType})\`
                            )
                          }
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-fg"
                        >
                          Atacar (+{atkBonus})
                        </button>
                      </div>

                      {/* GRAU DA FERRAMENTA (TRAVADO PELO GRAU DO PERSONAGEM) & TIPO DE DANO */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase text-zinc-400">
                            Grau (Máx: {calc.grade})
                          </label>
                          <select
                            value={wp.grade}
                            onChange={(e) =>
                              setChar((p) => ({
                                ...p,
                                weapons: p.weapons.map((item) =>
                                  item.id === wp.id
                                    ? { ...item, grade: e.target.value as GradeLevel, enchantments: [] }
                                    : item
                                ),
                              }))
                            }
                            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-white"
                          >
                            {GRADE_ORDER.map((g, idx) => (
                              <option key={g} value={g} disabled={idx > currentGradeIdx}>
                                {g} {idx > currentGradeIdx ? '(Bloqueado pelo seu Grau)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase text-zinc-400">Tipo de Dano</label>
                          <select
                            value={wp.damageType}
                            onChange={(e) =>
                              setChar((p) => ({
                                ...p,
                                weapons: p.weapons.map((item) =>
                                  item.id === wp.id ? { ...item, damageType: e.target.value } : item
                                ),
                              }))
                            }
                            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-white"
                          >
                            {['Cortante', 'Perfurante', 'Impacto', 'Queimante', 'Chocante', 'Congelante', 'Ácido', 'Energia'].map(
                              (t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>

                      {/* ENCANTAMENTOS DISPONÍVEIS PELO GRAU */}
                      <div>
                        <div className="text-[11px] font-semibold text-zinc-400">
                          Encantamentos da Ferramenta ({wp.enchantments.length}/{maxSlots} slots):
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {ENCHANTMENTS_CATALOG.map((enc) => {
                            const allowedByGrade =
                              GRADE_ORDER.indexOf(enc.minGrade) <= GRADE_ORDER.indexOf(wp.grade);
                            const selected = wp.enchantments.includes(enc.id);
                            return (
                              <button
                                key={enc.id}
                                type="button"
                                disabled={!allowedByGrade || (!selected && wp.enchantments.length >= maxSlots)}
                                title={enc.description}
                                onClick={() =>
                                  setChar((p) => ({
                                    ...p,
                                    weapons: p.weapons.map((item) =>
                                      item.id === wp.id
                                        ? {
                                            ...item,
                                            enchantments: selected
                                              ? item.enchantments.filter((id) => id !== enc.id)
                                              : [...item.enchantments, enc.id],
                                          }
                                        : item
                                    ),
                                  }))
                                }
                                className={\`rounded px-2 py-1 text-[11px] font-semibold transition \${
                                  selected
                                    ? 'bg-accent text-accent-fg'
                                    : allowedByGrade
                                    ? 'border border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-accent'
                                    : 'cursor-not-allowed border border-zinc-900 bg-zinc-950/40 text-zinc-600'
                                }\`}
                              >
                                {enc.name} ({enc.minGrade})
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="rounded-lg bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-300">
                        Fórmula Aberta: <strong>{wp.damageDice}</strong> + {calc.modifiers.forca} (Atrib) + {gradeBonus}{' '}
                        (Grau) = <span className="text-accent-text">{wp.damageDice}+{dmgBonus} {wp.damageType}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABA 5: TREINAMENTOS & INTERLÚDIOS */}
          {tab === 'treinos' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {TRAININGS_DATA.map((tr) => {
                const completedSteps = char.trainingSteps[tr.id] || [];
                const isFull = completedSteps.length === 4;
                return (
                  <div key={tr.id} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{tr.name}</h3>
                      <button
                        type="button"
                        onClick={() =>
                          setChar((p) => ({
                            ...p,
                            trainingSteps: {
                              ...p.trainingSteps,
                              [tr.id]: isFull ? [] : [1, 2, 3, 4],
                            },
                          }))
                        }
                        className="rounded bg-accent-soft px-2 py-1 text-[11px] font-bold text-accent-text hover:bg-accent hover:text-accent-fg"
                      >
                        {isFull ? 'Resetar' : 'Completar Tudo'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {tr.steps.map((st) => {
                        const checked = completedSteps.includes(st.step);
                        return (
                          <label
                            key={st.step}
                            className="flex cursor-pointer items-start gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-xs"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setChar((p) => ({
                                  ...p,
                                  trainingSteps: {
                                    ...p.trainingSteps,
                                    [tr.id]: checked
                                      ? completedSteps.filter((s) => s !== st.step)
                                      : [...completedSteps, st.step],
                                  },
                                }))
                              }
                              className="mt-0.5 accent-cyan-400"
                            />
                            <div>
                              <div className="font-bold text-zinc-200">
                                {st.step}ª Etapa ({st.focusCost} Focos)
                              </div>
                              <div className="text-zinc-400">{st.label}</div>
                              <div className="text-[10px] text-zinc-500">Req: {st.req}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <div
                      className={\`rounded-lg border p-2.5 text-[11px] \${
                        isFull
                          ? 'border-accent bg-accent-soft text-white'
                          : 'border-zinc-800 bg-zinc-950/50 text-zinc-500'
                      }\`}
                    >
                      {tr.completeBonus.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      ) : (
        /* ÁREA DO MESTRE (ESCUDO DO NARRADOR EM TEMPO REAL) */
        <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* COLUNA 1: FICHAS VINCULADAS EM TEMPO REAL */}
            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase text-accent-text">
                    <Users className="h-4 w-4" />
                    Mesa Conectada ({char.campaignCode})
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Ao Vivo
                  </span>
                </div>

                <div className="rounded-xl border border-accent/50 bg-zinc-950 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm text-white">{char.name}</strong>
                    <span className="font-mono text-xs text-accent-text">
                      Nv.{char.level} • {calc.grade}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                    <div className="rounded bg-zinc-900 p-1.5">
                      <div className="text-[10px] text-zinc-400">PV</div>
                      <div className="font-bold text-emerald-400">
                        {char.currentPv}/{calc.maxPv}
                      </div>
                    </div>
                    <div className="rounded bg-zinc-900 p-1.5">
                      <div className="text-[10px] text-zinc-400">PE</div>
                      <div className="font-bold text-accent-text">
                        {char.currentPe}/{calc.maxPe}
                      </div>
                    </div>
                    <div className="rounded bg-zinc-900 p-1.5">
                      <div className="text-[10px] text-zinc-400">DEF / CD</div>
                      <div className="font-bold text-white">
                        {calc.defense.total} / {calc.techniqueDc}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1 font-mono text-[10px] text-zinc-400">
                    {Object.entries(char.aptitudeLevels).map(([k, v]) => (
                      <span key={k} className="rounded bg-zinc-900 px-1.5 py-0.5">
                        {k}:{v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* FEED DE ROLAGENS AO VIVO */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <h3 className="mb-2 text-xs font-bold uppercase text-zinc-400">Feed de Ações & Rolagens</h3>
                <div className="max-h-56 space-y-1.5 overflow-y-auto font-mono text-xs">
                  {rollFeed.map((r, idx) => (
                    <div key={idx} className="rounded bg-zinc-950 p-2 text-zinc-300">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUNA 2: MONITOR TÁTICO DE EFEITOS/ÁREAS & REGRAS DIFÍCEIS FIXADAS */}
            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <h3 className="mb-2 text-xs font-bold uppercase text-accent-text">
                  Monitor Tático de Áreas & Grid (1,5m)
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-zinc-950 p-2.5">
                    <strong className="text-white">Linha:</strong> Extensão dobrada (ex: 6m = 12m / 8 quad.)
                  </div>
                  <div className="rounded-lg bg-zinc-950 p-2.5">
                    <strong className="text-white">Cobertura:</strong> Meia (+2 DEF/Ref) | 3/4 (+4 DEF/Ref)
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase text-accent-text">
                  Escudo Rápido: Regras Difíceis de Decorar
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {GM_HARD_RULES.map((rule) => {
                    const pinned = pinnedRules.includes(rule.id);
                    return (
                      <div
                        key={rule.id}
                        className={\`rounded-lg border p-3 text-xs \${
                          pinned ? 'border-accent bg-accent-soft' : 'border-zinc-800 bg-zinc-950'
                        }\`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-white">{rule.title}</strong>
                          <button
                            type="button"
                            onClick={() =>
                              setPinnedRules((prev) =>
                                pinned ? prev.filter((id) => id !== rule.id) : [...prev, rule.id]
                              )
                            }
                            className="text-[11px] text-accent-text hover:underline"
                          >
                            {pinned ? '★ Fixada' : '☆ Fixar'}
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-300">{rule.summary}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLUNA 3: ANOTAÇÕES LIVRES DO MESTRE (KANBAN / ORGANIZAÇÃO LIVRE) */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase text-accent-text">
                  <ScrollText className="h-4 w-4" />
                  Anotações & Organização do Mestre
                </h3>
              </div>

              <div className="flex gap-2">
                <input
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Nova anotação / NPC / Pista..."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-2.5 py-1.5 text-xs text-white"
                />
                <select
                  value={newNoteCol}
                  onChange={(e) => setNewNoteCol(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-white"
                >
                  <option value="Ganchos">Ganchos</option>
                  <option value="Em Cena">Em Cena</option>
                  <option value="Segredos">Segredos</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!newNoteTitle.trim()) return;
                    setGmNotes((p) => [
                      { id: \`n-\${Date.now()}\`, col: newNoteCol, title: newNoteTitle, body: 'Clique para detalhar...' },
                      ...p,
                    ]);
                    setNewNoteTitle('');
                  }}
                  className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-fg"
                >
                  +
                </button>
              </div>

              <div className="space-y-2 max-h-[28rem] overflow-y-auto">
                {gmNotes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent-text">
                        {note.col}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGmNotes((p) => p.filter((n) => n.id !== note.id))}
                        className="text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-xs font-bold text-white">{note.title}</div>
                    <textarea
                      value={note.body}
                      onChange={(e) =>
                        setGmNotes((p) =>
                          p.map((n) => (n.id === note.id ? { ...n, body: e.target.value } : n))
                        )
                      }
                      rows={2}
                      className="w-full bg-transparent text-[11px] text-zinc-300 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* POPUP DE TELA INTEIRA: ESCOLHAS DE ORIGEM */}
      {originModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-accent bg-zinc-950 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Configurar Bônus da Origem</h2>
            <p className="text-xs text-zinc-400">
              Distribua os bônus de atributo concedidos pela sua Origem (+2 em um atributo e +1 em outro).
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Atributo +2</label>
                <select
                  onChange={(e) => {
                    const attr = e.target.value as AttributeKey;
                    setChar((p) => ({
                      ...p,
                      originAttributeBonus: { ...p.originAttributeBonus, [attr]: 2 },
                    }));
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white"
                >
                  {(Object.keys(ATTR_LABELS) as AttributeKey[]).map((k) => (
                    <option key={k} value={k}>
                      {ATTR_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-300">Atributo +1</label>
                <select
                  onChange={(e) => {
                    const attr = e.target.value as AttributeKey;
                    setChar((p) => ({
                      ...p,
                      originAttributeBonus: { ...p.originAttributeBonus, [attr]: 1 },
                    }));
                  }}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white"
                >
                  {(Object.keys(ATTR_LABELS) as AttributeKey[]).map((k) => (
                    <option key={k} value={k}>
                      {ATTR_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOriginModalOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-bold text-accent-fg"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirmar Origem
            </button>
          </div>
        </div>
      )}

      {/* POPUP: CRIAR ORIGEM HOMEBREW */}
      {homebrewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-accent bg-zinc-950 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Nova Origem Homebrew</h2>
            <input
              value={hbName}
              onChange={(e) => setHbName(e.target.value)}
              placeholder="Nome da Origem ou Clã Homebrew"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white"
            />
            <textarea
              value={hbDesc}
              onChange={(e) => setHbDesc(e.target.value)}
              rows={3}
              placeholder="Descrição e poderes da origem..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white"
            />
            <label className="flex items-center gap-2 text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={hbUsesPe}
                onChange={(e) => setHbUsesPe(e.target.checked)}
              />
              Utiliza Energia Amaldiçoada (PE) e Técnica Inata
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHomebrewModalOpen(false)}
                className="w-1/2 rounded-xl border border-zinc-700 py-2 text-xs font-bold text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateHomebrewOrigin}
                className="w-1/2 rounded-xl bg-accent py-2 text-xs font-bold text-accent-fg"
              >
                Salvar & Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP DE TELA INTEIRA: ASSISTENTE DE LEVEL UP */}
      {levelUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-accent bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                Subir para o Nível {Math.min(20, char.level + 1)}
              </h2>
              <span className="rounded bg-accent-soft px-2 py-0.5 font-mono text-xs text-accent-text">
                {getCharacterGrade(Math.min(20, char.level + 1))}
              </span>
            </div>

            <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-xs">
              <div>
                <strong className="text-accent-text">1. Habilidade de Classe ou Talento:</strong>
                <p className="text-zinc-400">Escolha uma habilidade ou talento disponível na aba Origens, Classes & Aptidões.</p>
              </div>

              {(char.level + 1) % 2 === 0 && char.originId !== 'restringido' && (
                <div>
                  <strong className="text-accent-text">
                    2. Nível Par — Escolha +1 Nível de Aptidão Amaldiçoada:
                  </strong>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {(['AU', 'CL', 'BAR', 'DOM', 'ER'] as AptitudeCategory[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setChar((p) => ({
                            ...p,
                            aptitudeLevels: {
                              ...p.aptitudeLevels,
                              [cat]: Math.min(5, p.aptitudeLevels[cat] + 1),
                            },
                          }))
                        }
                        className="rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1 font-mono hover:border-accent"
                      >
                        +1 {cat} (Atual: {char.aptitudeLevels[cat]})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(char.level + 1) % 4 === 0 && (
                <div>
                  <strong className="text-accent-text">3. Marco de Atributo (+1 em um atributo):</strong>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(Object.keys(ATTR_LABELS) as AttributeKey[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() =>
                          setChar((p) => ({
                            ...p,
                            levelAttributeBonus: {
                              ...p.levelAttributeBonus,
                              [k]: (p.levelAttributeBonus[k] || 0) + 1,
                            },
                          }))
                        }
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 hover:border-accent"
                      >
                        +1 {ATTR_LABELS[k]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLevelUpModalOpen(false)}
                className="w-1/3 rounded-xl border border-zinc-700 py-2.5 text-xs font-bold text-zinc-300"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextLvl = Math.min(20, char.level + 1);
                  setChar((p) => ({ ...p, level: nextLvl }));
                  setLevelUpModalOpen(false);
                  pushRoll(\`subiu para o Nível \${nextLvl}!\`);
                }}
                className="w-2/3 rounded-xl bg-accent py-2.5 text-xs font-bold text-accent-fg"
              >
                Confirmar Nível {Math.min(20, char.level + 1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Criado:', filePath);
}

console.log('\\nSite completo gerado! Agora rode: npm run dev');