import { OriginDefinition } from '@/types/system';

export const OFFICIAL_ORIGINS: OriginDefinition[] = [
  {
    id: 'inato',
    name: 'Inato',
    description: 'Feiticeiros que nasceram com uma técnica amaldiçoada gravada no corpo e talento natural para o jujutsu.',
    attributeMode: 'free_2_1',
    usesCursedEnergy: true,
    hasInnateTechnique: true,
    allowsMulticlass: true,
    features: [
      {
        id: 'inato-talento-natural',
        name: 'Talento Natural',
        originId: 'inato',
        category: 'origem',
        minLevel: 1,
        description: 'Você recebe 1 Talento Geral gratuito no 1º nível (cumprindo os pré-requisitos).',
        effects: []
      },
      {
        id: 'inato-marca-registrada',
        name: 'Marca Registrada',
        originId: 'inato',
        category: 'origem',
        minLevel: 1,
        description: 'Você recebe 1 Feitiço adicional no 1º nível e o custo dele (e de suas variações) é reduzido em 1 PE (mínimo 1 PE para níveis 1+).',
        effects: [{ type: 'SPELL_COST_REDUCTION', amount: 1, label: 'Marca Registrada (-1 PE)' }]
      }
    ]
  },
  {
    id: 'herdado',
    name: 'Herdado',
    description: 'Membros de linhagens tradicionais e clãs jujutsu que carregam técnicas passadas por gerações.',
    attributeMode: 'fixed',
    usesCursedEnergy: true,
    hasInnateTechnique: true,
    allowsMulticlass: true,
    features: [
      {
        id: 'herdado-linhagem',
        name: 'Herança de Clã',
        originId: 'herdado',
        category: 'origem',
        minLevel: 1,
        description: 'Concede os atributos, perícias e características exclusivas do Clã escolhido (Gojo, Zenin, Kamo, Inumaki, etc.).',
        effects: []
      }
    ]
  },
  {
    id: 'derivado',
    name: 'Derivado',
    description: 'Pessoas alteradas por objetos amaldiçoados, experimentos ou eventos externos que despertaram energia.',
    attributeMode: 'free_2_1',
    usesCursedEnergy: true,
    hasInnateTechnique: true,
    allowsMulticlass: true,
    features: [
      {
        id: 'derivado-desenvolvimento',
        name: 'Desenvolvimento Inesperado',
        originId: 'derivado',
        category: 'origem',
        minLevel: 1,
        description: 'A cada 4 níveis (4, 8, 12, 16, 20), você recebe +1 ponto de atributo adicional e aumenta em +1 o limite máximo daquele atributo.',
        effects: []
      },
      {
        id: 'derivado-aura-desperta',
        name: 'Energia Desperta',
        originId: 'derivado',
        category: 'origem',
        minLevel: 1,
        description: 'Recebe +1 Aptidão de Aura gratuita no 1º nível.',
        effects: [{ type: 'ADD_APTITUDE_LEVEL', category: 'AU', value: 1, source: 'origem', label: 'Energia Desperta' }]
      }
    ]
  },
  {
    id: 'restringido',
    name: 'Restringido',
    description: 'Nascidos sob Restrição Celestial com energia amaldiçoada nula, alcançando o ápice físico sobre-humano.',
    attributeMode: 'fixed',
    fixedAttributes: { forca: 1, destreza: 1, constituicao: 1 },
    usesCursedEnergy: false,
    hasInnateTechnique: false,
    allowsMulticlass: false,
    features: [
      {
        id: 'rest-fisico-aperfeicoado',
        name: 'Físico Aperfeiçoado',
        originId: 'restringido',
        category: 'origem',
        minLevel: 1,
        description: 'Recebe +1 em Força, Destreza e Constituição, +3m de deslocamento e substitui PE por Pontos de Estamina.',
        effects: [
          { type: 'ADD_STAT', target: 'movement', value: 3, source: 'origem', label: 'Físico Aperfeiçoado (+3m)' },
          { type: 'SET_ATTRIBUTE_CAP', attribute: 'forca', cap: 24, label: 'Teto Físico Restringido' },
          { type: 'SET_ATTRIBUTE_CAP', attribute: 'destreza', cap: 24, label: 'Teto Físico Restringido' },
          { type: 'SET_ATTRIBUTE_CAP', attribute: 'constituicao', cap: 24, label: 'Teto Físico Restringido' }
        ]
      },
      {
        id: 'rest-sentidos-agucados',
        name: 'Sentidos Aguçados',
        originId: 'restringido',
        category: 'origem',
        minLevel: 1,
        description: 'Enxerga maldições mesmo sem energia amaldiçoada e recebe +2 em Percepção e Atenção.',
        effects: [
          { type: 'ADD_STAT', target: 'attention', value: 2, source: 'origem', label: 'Sentidos Aguçados' },
          { type: 'ADD_STAT', target: 'skill_Percepção', value: 2, source: 'origem', label: 'Sentidos Aguçados' }
        ]
      }
    ]
  },
  {
    id: 'feto-hibrido',
    name: 'Feto Amaldiçoado Híbrido',
    description: 'Híbridos entre humano e espírito amaldiçoado, com fisiologia anômala e manipulação biológica de energia.',
    attributeMode: 'free_2_1',
    usesCursedEnergy: true,
    hasInnateTechnique: true,
    allowsMulticlass: false,
    features: [
      {
        id: 'feto-anatomia',
        name: 'Anatomia Amaldiçoada',
        originId: 'feto-hibrido',
        category: 'origem',
        minLevel: 1,
        description: 'Recebe +2 PV por nível e resistência a venenos e doenças. Não pode realizar Multiclasse.',
        effects: [{ type: 'ADD_STAT_PER_LEVEL', target: 'maxPv', valuePerLevel: 2, source: 'origem', label: 'Anatomia Amaldiçoada' }]
      }
    ]
  },
  {
    id: 'sem-tecnica',
    name: 'Sem Técnica',
    description: 'Feiticeiros sem técnica inata gravada, compensando com maestria absoluta em controle de energia, armas e Novo Estilo da Sombra.',
    attributeMode: 'free_2_1',
    usesCursedEnergy: true,
    hasInnateTechnique: false,
    allowsMulticlass: true,
    features: [
      {
        id: 'sem-tecnica-compensacao',
        name: 'Compensação Técnica',
        originId: 'sem-tecnica',
        category: 'origem',
        minLevel: 1,
        description: 'Recebe +2 perícias treinadas adicionais, +1 PE por nível e acesso ao Novo Estilo da Sombra a partir do 4º nível.',
        effects: [{ type: 'ADD_STAT_PER_LEVEL', target: 'maxPe', valuePerLevel: 1, source: 'origem', label: 'Compensação Técnica' }]
      }
    ]
  },
  {
    id: 'corpo-mutante',
    name: 'Corpo Amaldiçoado Mutante',
    description: 'Construtos conscientes com três núcleos independentes (1 Primário e 2 Secundários) que alternam formas em combate.',
    attributeMode: 'fixed',
    fixedAttributes: { constituicao: 2, forca: 1 },
    usesCursedEnergy: true,
    hasInnateTechnique: true,
    allowsMulticlass: true,
    hasMultipleNuclei: true,
    features: [
      {
        id: 'mutante-tres-nucleos',
        name: 'Três Núcleos',
        originId: 'corpo-mutante',
        category: 'origem',
        minLevel: 1,
        description: 'Você possui 3 núcleos com atributos, PV e PE próprios, podendo alternar o núcleo ativo em combate.',
        effects: []
      }
    ]
  }
];

export const CLANS_DATA = [
  {
    id: 'cla-gojo',
    name: 'Clã Gojo',
    attributes: { inteligencia: 2, sabedoria: 1 },
    bonusDescription: '+1 PE extra em todos os níveis pares e +2 em Feitiçaria.',
    effects: [
      { type: 'ADD_STAT_PER_LEVEL', target: 'maxPe', valuePerLevel: 1, evenLevelsOnly: true, source: 'origem', label: 'Linhagem Gojo' },
      { type: 'ADD_STAT', target: 'skill_Feitiçaria', value: 2, source: 'origem', label: 'Linhagem Gojo' }
    ]
  },
  {
    id: 'cla-zenin',
    name: 'Clã Zenin',
    attributes: { destreza: 2, forca: 1 },
    bonusDescription: 'Proficiência com todas as armas simples e complexas e +2 em Iniciativa.',
    effects: [{ type: 'ADD_STAT', target: 'initiative', value: 2, source: 'origem', label: 'Linhagem Zenin' }]
  },
  {
    id: 'cla-kamo',
    name: 'Clã Kamo',
    attributes: { constituicao: 2, sabedoria: 1 },
    bonusDescription: '+1 PV por nível e +2 em Testes de Resistência de Fortitude.',
    effects: [
      { type: 'ADD_STAT_PER_LEVEL', target: 'maxPv', valuePerLevel: 1, source: 'origem', label: 'Linhagem Kamo' },
      { type: 'ADD_STAT', target: 'save_Fortitude', value: 2, source: 'origem', label: 'Linhagem Kamo' }
    ]
  },
  {
    id: 'cla-inumaki',
    name: 'Clã Inumaki',
    attributes: { presenca: 2, constituicao: 1 },
    bonusDescription: '+1 na CD de Técnica e +2 em Intimidação.',
    effects: [
      { type: 'ADD_STAT', target: 'techniqueDc', value: 1, source: 'origem', label: 'Linhagem Inumaki' },
      { type: 'ADD_STAT', target: 'skill_Intimidação', value: 2, source: 'origem', label: 'Linhagem Inumaki' }
    ]
  }
];
