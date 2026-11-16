import fs from 'node:fs';
import path from 'node:path';

const files = {
  'package.json': JSON.stringify({
    name: 'feiticeiros-maldicoes-vtt',
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start'
    },
    dependencies: {
      next: '^14.2.15',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      zustand: '^4.5.5',
      'lucide-react': '^0.453.0',
      '@supabase/supabase-js': '^2.45.4'
    },
    devDependencies: {
      typescript: '^5.6.3',
      '@types/node': '^22.7.5',
      '@types/react': '^18.3.11',
      '@types/react-dom': '^18.3.1',
      tailwindcss: '^3.4.13',
      postcss: '^8.4.47',
      autoprefixer: '^10.4.20'
    }
  }, null, 2),

  'tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'preserve',
      incremental: true,
      plugins: [{ name: 'next' }],
      paths: { '@/*': ['./src/*'] }
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
    exclude: ['node_modules']
  }, null, 2),

  'tailwind.config.ts': `import type { Config } from 'tailwindcss';

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
`,

  'postcss.config.mjs': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,

  'src/types/system.ts': `export type AttributeKey =
  | 'forca'
  | 'destreza'
  | 'constituicao'
  | 'inteligencia'
  | 'sabedoria'
  | 'presenca';

export type AptitudeCategory = 'AU' | 'CL' | 'BAR' | 'DOM' | 'ER';

export type GradeLevel = '4º Grau' | '3º Grau' | '2º Grau' | '1º Grau' | 'Grau Especial';

export type SourceType =
  | 'base'
  | 'origem'
  | 'especializacao'
  | 'talento'
  | 'aptidao'
  | 'treinamento'
  | 'equipamento'
  | 'tecnica'
  | 'voto';

export type EffectRule =
  | { type: 'ADD_STAT'; target: string; value: number; source: SourceType; label: string }
  | { type: 'ADD_STAT_PER_LEVEL'; target: string; valuePerLevel: number; evenLevelsOnly?: boolean; source: SourceType; label: string }
  | { type: 'SET_ATTRIBUTE_CAP'; attribute: AttributeKey | 'ALL'; cap: number; label: string }
  | { type: 'ADD_APTITUDE_LEVEL'; category: AptitudeCategory; value: number; source: SourceType; label: string }
  | { type: 'GRANT_SKILL_TRAINING'; skill: string; mastery?: boolean; label: string }
  | { type: 'SPELL_COST_REDUCTION'; amount: number; spellId?: string; label: string }
  | { type: 'WEAPON_DAMAGE_STEP'; steps: number; weaponId?: string; label: string };

export interface SystemAbility {
  id: string;
  name: string;
  specializationId?: string;
  originId?: string;
  category: 'origem' | 'classe_base' | 'classe_escolha' | 'talento_geral' | 'talento_origem' | 'aptidao';
  aptitudeCategory?: AptitudeCategory;
  minLevel: number;
  prerequisites?: {
    attributes?: Partial<Record<AttributeKey, number>>;
    aptitudes?: Partial<Record<AptitudeCategory, number>>;
    skills?: string[];
    abilities?: string[];
  };
  description: string;
  toggleable?: boolean;
  effects: EffectRule[];
}

export interface OriginDefinition {
  id: string;
  name: string;
  isHomebrew?: boolean;
  description: string;
  attributeMode: 'free_2_1' | 'fixed' | 'custom';
  fixedAttributes?: Partial<Record<AttributeKey, number>>;
  usesCursedEnergy: boolean;
  hasInnateTechnique: boolean;
  allowsMulticlass: boolean;
  hasMultipleNuclei?: boolean;
  features: SystemAbility[];
}

export interface SpellVariation {
  id: string;
  name: string;
  level: 0 | 1 | 2 | 3 | 4 | 5;
  peCost: number;
  actionType: 'Comum' | 'Bônus' | 'Movimento' | 'Reação' | 'Completa';
  range: string;
  areaShape?: 'Alvo Único' | 'Linha' | 'Cone' | 'Esfera' | 'Cilindro';
  areaSizeMeters?: number;
  damageFormula?: string;
  damageType?: string;
  description: string;
}

export interface SpellEntry extends SpellVariation {
  isSignature?: boolean;
  variations: SpellVariation[];
}

export interface WeaponEntry {
  id: string;
  name: string;
  category: 'Simples' | 'Complexa' | 'Corpo-a-Corpo' | 'Distância' | 'Arremesso';
  grade: GradeLevel;
  damageDice: string;
  versatileDice?: string;
  damageType: string;
  modularTypes?: string[];
  criticalRange: number;
  properties: string[];
  enchantments: string[];
  maxCharges: number;
  currentCharges: number;
  extraAttackBonus: number;
  extraDamageBonus: number;
}

export interface ThemeConfig {
  presetId: string;
  hex: string;
  surfaceMode: 'dark' | 'manga';
}

export interface CharacterRawState {
  schemaVersion: number;
  id: string;
  campaignCode?: string;
  name: string;
  avatarDataUrl?: string;
  level: number;
  theme: ThemeConfig;
  baseAttributes: Record<AttributeKey, number>;
  originId: string;
  clanId?: string;
  originAttributeBonus: Partial<Record<AttributeKey, number>>;
  levelAttributeBonus: Partial<Record<AttributeKey, number>>;
  classLevels: Record<string, number>;
  keyAttribute: AttributeKey;
  extraSkillAttribute: 'inteligencia' | 'sabedoria';
  trainedSkills: string[];
  masterSkills: string[];
  trainedSaves: string[];
  masterSaves: string[];
  aptitudeLevels: Record<AptitudeCategory, number>;
  selectedAbilities: string[];
  activeToggleIds: string[];
  trainingSteps: Record<string, number[]>;
  techniqueName: string;
  techniqueBasic: string;
  spells: SpellEntry[];
  weapons: WeaponEntry[];
  currentPv: number;
  tempPv: number;
  currentPe: number;
  tempPe: number;
  currentSoulIntegrity: number;
  notes: string;
}
`,

  'src/utils/theme.ts': `import { ThemeConfig } from '@/types/system';

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
    '--accent-soft': \`rgba(\${r}, \${g}, \${b}, 0.14)\`,
    '--accent-glow': \`rgba(\${r}, \${g}, \${b}, 0.35)\`,
    '--accent-fg': fg,
    '--accent-text': config.surfaceMode === 'manga' && luminance > 0.65 ? '#18181B' : config.hex,
  };
}
`,

  'src/engine/calculator.ts': `import { AttributeKey, CharacterRawState, GradeLevel, SystemAbility } from '@/types/system';

export interface StatBreakdown {
  total: number;
  sources: { label: string; value: number }[];
}

export function getTrainingBonus(level: number): number {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}

export function getCharacterGrade(level: number): GradeLevel {
  if (level >= 17) return 'Grau Especial';
  if (level >= 13) return '1º Grau';
  if (level >= 9) return '2º Grau';
  if (level >= 5) return '3º Grau';
  return '4º Grau';
}

export function getAttributeModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function calculateCharacter(raw: CharacterRawState, catalog: SystemAbility[]) {
  const halfLevel = Math.floor(raw.level / 2);
  const trainingBonus = getTrainingBonus(raw.level);
  const grade = getCharacterGrade(raw.level);

  const activeAbilities = catalog.filter(
    (ab) => raw.selectedAbilities.includes(ab.id) && (!ab.toggleable || raw.activeToggleIds.includes(ab.id))
  );

  // 1. Atributos Finais
  const attributes = {} as Record<AttributeKey, number>;
  const modifiers = {} as Record<AttributeKey, number>;
  const attrKeys: AttributeKey[] = ['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'presenca'];

  for (const key of attrKeys) {
    let val =
      (raw.baseAttributes[key] || 10) +
      (raw.originAttributeBonus[key] || 0) +
      (raw.levelAttributeBonus[key] || 0);

    for (const ab of activeAbilities) {
      for (const eff of ab.effects) {
        if (eff.type === 'ADD_STAT' && eff.target === key) {
          val += eff.value;
        }
      }
    }
    attributes[key] = Math.min(30, val);
    modifiers[key] = getAttributeModifier(attributes[key]);
  }

  // 2. Recursos Vitais (com retroatividade de Constituição)
  const basePvFirst = 12;
  const pvPerLevel = 6;
  const maxPv = basePvFirst + modifiers.constituicao + (raw.level - 1) * (pvPerLevel + modifiers.constituicao);
  const maxSoulIntegrity = maxPv;

  const isRestricted = raw.originId === 'restringido';
  const maxPe = isRestricted
    ? 4 * raw.level + modifiers.constituicao
    : 4 * raw.level + modifiers[raw.keyAttribute];

  // Penalidades automáticas de Integridade da Alma (75%, 50%, 25%)
  const soulRatio = maxSoulIntegrity > 0 ? raw.currentSoulIntegrity / maxSoulIntegrity : 1;
  let soulTestPenalty = 0;
  let soulCostIncrease = 0;
  if (soulRatio <= 0.25) {
    soulTestPenalty = -8;
    soulCostIncrease = 5;
  } else if (soulRatio <= 0.5) {
    soulTestPenalty = -6;
    soulCostIncrease = 3;
  } else if (soulRatio <= 0.75) {
    soulTestPenalty = -3;
    soulCostIncrease = 2;
  }

  // 3. Status Derivados
  const defenseSources = [
    { label: 'Base', value: 10 },
    { label: 'Mod. Destreza', value: modifiers.destreza },
    { label: 'Metade do Nível', value: halfLevel },
  ];
  const defense: StatBreakdown = {
    total: defenseSources.reduce((acc, s) => acc + s.value, 0),
    sources: defenseSources,
  };

  const initiative = modifiers.destreza;
  const movement = 9;
  const techniqueDc = 10 + halfLevel + modifiers[raw.keyAttribute] + trainingBonus;

  return {
    grade,
    trainingBonus,
    halfLevel,
    attributes,
    modifiers,
    maxPv,
    maxPe,
    maxSoulIntegrity,
    soulTestPenalty,
    soulCostIncrease,
    defense,
    initiative,
    movement,
    techniqueDc,
  };
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Criado:', filePath);
}

console.log('\\nEtapa 1 criada com sucesso! Agora rode: npm install');