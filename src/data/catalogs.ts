import { GradeLevel, SystemAbility } from '@/types/system';

export const SKILLS_LIST = [
  { name: 'Acrobacia', attr: 'destreza', requiresTraining: false },
  { name: 'Atletismo', attr: 'forca', requiresTraining: false },
  { name: 'Enganação', attr: 'presenca', requiresTraining: false },
  { name: 'Feitiçaria', attr: 'inteligencia', requiresTraining: true },
  { name: 'Furtividade', attr: 'destreza', requiresTraining: false },
  { name: 'História', attr: 'inteligencia', requiresTraining: false },
  { name: 'Intimidação', attr: 'presenca', requiresTraining: false },
  { name: 'Intuição', attr: 'sabedoria', requiresTraining: false },
  { name: 'Investigação', attr: 'inteligencia', requiresTraining: false },
  { name: 'Medicina', attr: 'sabedoria', requiresTraining: true },
  { name: 'Ocultismo', attr: 'sabedoria', requiresTraining: false },
  { name: 'Ofício (Ferreiro)', attr: 'inteligencia', requiresTraining: true },
  { name: 'Ofício (Canalizador)', attr: 'inteligencia', requiresTraining: true },
  { name: 'Ofício (Entalhador)', attr: 'inteligencia', requiresTraining: true },
  { name: 'Percepção', attr: 'sabedoria', requiresTraining: false },
  { name: 'Performance', attr: 'presenca', requiresTraining: false },
  { name: 'Persuasão', attr: 'presenca', requiresTraining: false },
  { name: 'Prestidigitação', attr: 'destreza', requiresTraining: true },
  { name: 'Tecnologia', attr: 'inteligencia', requiresTraining: false },
] as const;

export const TALENTS_AND_APTITUDES: SystemAbility[] = [
  {
    id: 'tal-atencao-infalivel',
    name: 'Atenção Infalível',
    category: 'talento_geral',
    minLevel: 1,
    description: 'Seus sentidos estão sempre alertas contra emboscadas. Concede +5 em Atenção.',
    effects: [{ type: 'ADD_STAT', target: 'attention', value: 5, source: 'talento', label: 'Atenção Infalível' }]
  },
  {
    id: 'tal-afinidade-tecnica',
    name: 'Afinidade com Técnica',
    category: 'talento_geral',
    minLevel: 1,
    description: 'Recebe +1 Feitiço adicional imediatamente e nos níveis 5, 10, 15 e 20.',
    effects: []
  },
  {
    id: 'tal-artesao-amaldicoado',
    name: 'Artesão Amaldiçoado',
    category: 'talento_geral',
    minLevel: 1,
    prerequisites: { skills: ['Ofício (Ferreiro)'] },
    description: 'Permite forjar e encantar Ferramentas Amaldiçoadas até o seu Grau atual.',
    effects: []
  },
  {
    id: 'tal-versatilidade',
    name: 'Versatilidade',
    category: 'talento_geral',
    minLevel: 4,
    description: 'Concede +1 em todas as perícias não treinadas (+2 a partir do nível 10).',
    effects: []
  },
  {
    id: 'apt-expandir-aura',
    name: 'Expandir Aura [AU 1]',
    category: 'aptidao',
    aptitudeCategory: 'AU',
    minLevel: 1,
    prerequisites: { aptitudes: { AU: 1 } },
    description: 'Ativável: Projeta sua aura em 6m ao redor, concedendo +2 na Defesa.',
    toggleable: true,
    effects: [{ type: 'ADD_STAT', target: 'defense', value: 2, source: 'aptidao', label: 'Expandir Aura' }]
  },
  {
    id: 'apt-dominio-simples',
    name: 'Domínio Simples [BAR 2 / DOM 1]',
    category: 'aptidao',
    aptitudeCategory: 'DOM',
    minLevel: 4,
    prerequisites: { aptitudes: { BAR: 2, DOM: 1 } },
    description: 'Cria uma barreira pessoal (Durabilidade BAR + 1) que anula o Acerto Garantido de Expansões de Domínio.',
    effects: []
  },
  {
    id: 'apt-expansao-dominio',
    name: 'Expansão de Domínio [BAR 3 / DOM 3]',
    category: 'aptidao',
    aptitudeCategory: 'DOM',
    minLevel: 10,
    prerequisites: { aptitudes: { BAR: 3, DOM: 3 } },
    description: 'O ápice do jujutsu: cria seu espaço inato com Acerto Garantido e amplificação de técnica.',
    effects: []
  },
  {
    id: 'apt-energia-reversa',
    name: 'Energia Reversa (RCT) [ER 1]',
    category: 'aptidao',
    aptitudeCategory: 'ER',
    minLevel: 6,
    prerequisites: { aptitudes: { ER: 1 } },
    description: 'Multiplica energia negativa por negativa para gerar energia positiva e curar ferimentos.',
    effects: []
  }
];

export const TRAININGS_DATA = [
  {
    id: 'treino-agilidade',
    name: 'Treino de Agilidade',
    steps: [
      { step: 1, focusCost: 2, req: 'Nenhum', label: '+1,5m de Deslocamento', effects: [{ type: 'ADD_STAT', target: 'movement', value: 1.5, source: 'treinamento', label: 'Agilidade I' }] },
      { step: 2, focusCost: 3, req: 'Destreza 12', label: '+2 em Acrobacia', effects: [{ type: 'ADD_STAT', target: 'skill_Acrobacia', value: 2, source: 'treinamento', label: 'Agilidade II' }] },
      { step: 3, focusCost: 4, req: 'Destreza 14', label: '+2 em Iniciativa', effects: [{ type: 'ADD_STAT', target: 'initiative', value: 2, source: 'treinamento', label: 'Agilidade III' }] },
      { step: 4, focusCost: 5, req: 'Destreza 16', label: '+2 em Reflexos', effects: [{ type: 'ADD_STAT', target: 'save_Reflexos', value: 2, source: 'treinamento', label: 'Agilidade IV' }] }
    ],
    completeBonus: { label: 'Completo: +1,5m Deslocamento adicional e ignora terreno difícil não-mágico', effects: [{ type: 'ADD_STAT', target: 'movement', value: 1.5, source: 'treinamento', label: 'Agilidade Completo' }] }
  },
  {
    id: 'treino-resistencia',
    name: 'Treino de Resistência',
    steps: [
      { step: 1, focusCost: 2, req: 'Nenhum', label: '+4 PV Máximos', effects: [{ type: 'ADD_STAT', target: 'maxPv', value: 4, source: 'treinamento', label: 'Resistência I' }] },
      { step: 2, focusCost: 3, req: 'Constituição 12', label: '+2 Dados de Vida para descanso', effects: [] },
      { step: 3, focusCost: 4, req: 'Constituição 14', label: '+2 em Fortitude', effects: [{ type: 'ADD_STAT', target: 'save_Fortitude', value: 2, source: 'treinamento', label: 'Resistência III' }] },
      { step: 4, focusCost: 5, req: 'Constituição 16', label: '+6 PV Máximos', effects: [{ type: 'ADD_STAT', target: 'maxPv', value: 6, source: 'treinamento', label: 'Resistência IV' }] }
    ],
    completeBonus: { label: 'Completo: +10 PV Máximos e margem de sucesso crítico em Fortitude reduzida em 2', effects: [{ type: 'ADD_STAT', target: 'maxPv', value: 10, source: 'treinamento', label: 'Resistência Completo' }] }
  },
  {
    id: 'treino-controle-energia',
    name: 'Treino de Controle de Energia',
    steps: [
      { step: 1, focusCost: 2, req: 'Nenhum', label: '+2 PE Máximos', effects: [{ type: 'ADD_STAT', target: 'maxPe', value: 2, source: 'treinamento', label: 'Controle I' }] },
      { step: 2, focusCost: 3, req: 'CL 1', label: '+4 PE Temporários no início do combate', effects: [] },
      { step: 3, focusCost: 4, req: 'CL 2', label: '+3 PE Máximos', effects: [{ type: 'ADD_STAT', target: 'maxPe', value: 3, source: 'treinamento', label: 'Controle III' }] },
      { step: 4, focusCost: 5, req: 'CL 3', label: '+1 Nível em Controle e Leitura (CL)', effects: [{ type: 'ADD_APTITUDE_LEVEL', category: 'CL', value: 1, source: 'treinamento', label: 'Controle IV' }] }
    ],
    completeBonus: { label: 'Completo: +5 PE Máximos', effects: [{ type: 'ADD_STAT', target: 'maxPe', value: 5, source: 'treinamento', label: 'Controle Completo' }] }
  }
];

export const WEAPONS_CATALOG = [
  { id: 'katana', name: 'Katana', category: 'Complexa', damageDice: '1d8', versatileDice: '1d10', damageType: 'Cortante', modularTypes: ['Cortante', 'Perfurante'], criticalRange: 19, properties: ['Versátil', 'Modular', 'Mortal d10'] },
  { id: 'adaga', name: 'Adaga', category: 'Simples', damageDice: '1d4', damageType: 'Perfurante', modularTypes: ['Perfurante', 'Cortante'], criticalRange: 19, properties: ['Leve', 'Fineza', 'Modular', 'Arremesso (6/18m)'] },
  { id: 'espada-colossal', name: 'Espada Colossal', category: 'Complexa', damageDice: '2d6', damageType: 'Cortante', modularTypes: ['Cortante', 'Impacto'], criticalRange: 19, properties: ['Pesada', 'Duas Mãos', 'Modular'] },
  { id: 'manoplas', name: 'Manoplas Reforçadas', category: 'Simples', damageDice: '1d6', damageType: 'Impacto', criticalRange: 20, properties: ['Leve', 'Enérgica'] },
  { id: 'lanca', name: 'Lança', category: 'Simples', damageDice: '1d6', versatileDice: '1d8', damageType: 'Perfurante', criticalRange: 20, properties: ['Versátil', 'Alcance (3m)', 'Arremesso (6/18m)'] },
  { id: 'nunchaku-pesado', name: 'Nunchaku Pesado', category: 'Complexa', damageDice: '1d8', damageType: 'Impacto', criticalRange: 20, properties: ['Duas Mãos', 'Enérgica', 'Balanceada'] }
] as const;

export const ENCHANTMENTS_CATALOG: {
  id: string;
  name: string;
  minGrade: GradeLevel;
  incompatibleWith?: string[];
  requires?: string;
  description: string;
}[] = [
  { id: 'certeira', name: 'Certeira', minGrade: '3º Grau', incompatibleWith: ['destruidora'], description: 'Reduz a margem de crítico da arma em 1.' },
  { id: 'destruidora', name: 'Destruidora', minGrade: '3º Grau', incompatibleWith: ['certeira'], description: 'Aumenta o multiplicador de crítico em +1x.' },
  { id: 'cruel', name: 'Cruel', minGrade: '3º Grau', description: 'Concede +3 fixo nas rolagens de dano da arma.' },
  { id: 'precisa', name: 'Precisa', minGrade: '3º Grau', description: 'Concede +2 nas jogadas de ataque com a arma.' },
  { id: 'elemental', name: 'Elemental', minGrade: '2º Grau', description: 'Converte o dano da arma em elemental (Queimante, Chocante, Congelante ou Ácido) e adiciona +1d6.' },
  { id: 'poderosa', name: 'Poderosa', minGrade: '2º Grau', requires: 'cruel', description: 'Aumenta o bônus de dano fixo de +3 para +5.' },
  { id: 'potente', name: 'Potente', minGrade: '1º Grau', description: 'Aumenta o dano base da arma em +1 dado.' }
];

export const GM_HARD_RULES = [
  { id: 'rule-identificar', title: 'Identificação de Ferramenta Amaldiçoada', summary: 'CD 20 + 5 por grau acima do 4º (Ação Bônus em combate, exige Feitiçaria). +10 para Habilidade Única de Grau Especial; +5 para objetos obscuros.' },
  { id: 'rule-crit-save', title: 'Sucesso Crítico em Teste de Resistência', summary: 'Exige grau Mestre no TR: se superar a CD por 10 ou mais, ignora completamente todo o dano e condições do efeito.' },
  { id: 'rule-surpresa', title: 'Surpresa e Emboscadas', summary: 'Furtividade contra a Atenção passiva dos alvos. Surpreendidos perdem o 1º turno e ficam Desprevenidos e Desorientados até o próximo turno.' },
  { id: 'rule-antidominio', title: 'Limite de Anti-Domínios', summary: 'Máximo de 2 anti-domínios simultâneos. Cesta Oca de Vime exige duas mãos livres; Emoção da Pétala Decadente atua apenas contra contato físico.' },
  { id: 'rule-votos', title: 'Votos Vinculativos Próprios', summary: 'Feitos como Ação Bônus. Só podem envolver Aptidões Amaldiçoadas, Feitiços e PE (nunca Atributos, Defesa ou RD como benefício).' },
  { id: 'rule-ferimentos', title: 'Ferimentos Complexos (1d10)', summary: 'Exige Fortitude CD 20 + nível para agir com ferimento grave (CD reduzida para 10 se tratado por Mestre em Medicina).' }
];
