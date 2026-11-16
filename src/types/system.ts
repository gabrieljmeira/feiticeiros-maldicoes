export type AttributeKey =
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
