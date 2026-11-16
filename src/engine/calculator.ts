import { AttributeKey, CharacterRawState, GradeLevel, SystemAbility } from '@/types/system';

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
