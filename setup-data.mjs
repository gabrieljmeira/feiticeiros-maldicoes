import fs from 'node:fs';
import path from 'node:path';

const files = {
  'src/data/origins.ts': `import { OriginDefinition } from '@/types/system';

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
`,

  'src/data/specializations.ts': `import { AttributeKey, SystemAbility } from '@/types/system';

export interface SpecializationDefinition {
  id: string;
  name: string;
  description: string;
  pvFirstLevel: number;
  pvPerLevel: number;
  pePerLevel: number;
  addsKeyAttrToPeLevel1: boolean;
  keyAttributes: AttributeKey[];
  saveOptions: string[];
  fixedSkills: string[];
  freeSkillChoices: number;
  multiclassReq?: Partial<Record<AttributeKey, number>>;
  abilities: SystemAbility[];
}

export const SPECIALIZATIONS: SpecializationDefinition[] = [
  {
    id: 'lutador',
    name: 'Lutador',
    description: 'Combatentes corpo a corpo implacáveis que canalizam energia amaldiçoada nos punhos e no corpo.',
    pvFirstLevel: 12,
    pvPerLevel: 6,
    pePerLevel: 4,
    addsKeyAttrToPeLevel1: false,
    keyAttributes: ['forca', 'destreza'],
    saveOptions: ['Fortitude', 'Reflexos'],
    fixedSkills: ['Atletismo'],
    freeSkillChoices: 3,
    multiclassReq: { forca: 14 },
    abilities: [
      {
        id: 'lut-corpo-treinado',
        name: 'Corpo Treinado (Base Nv. 1)',
        specializationId: 'lutador',
        category: 'classe_base',
        minLevel: 1,
        description: 'Seus golpes desarmados causam 1d6 de dano (escalonando por nível) e contam como armas imbuídas.',
        effects: []
      },
      {
        id: 'lut-empunhadura-firme',
        name: 'Empunhadura e Guarda Firme',
        specializationId: 'lutador',
        category: 'classe_escolha',
        minLevel: 1,
        description: 'Enquanto estiver sem escudo, recebe +2 na Defesa e +2 em testes para resistir a manobras.',
        effects: [{ type: 'ADD_STAT', target: 'defense', value: 2, source: 'especializacao', label: 'Guarda Firme' }]
      },
      {
        id: 'lut-impeto-brutal',
        name: 'Ímpeto Brutal',
        specializationId: 'lutador',
        category: 'classe_escolha',
        minLevel: 4,
        description: 'Ativável: Ao gastar 2 PE no início do turno, recebe +2 em jogadas de ataque e +1 passo de dano desarmado.',
        toggleable: true,
        effects: [{ type: 'WEAPON_DAMAGE_STEP', steps: 1, label: 'Ímpeto Brutal' }]
      },
      {
        id: 'lut-reflexos-combate',
        name: 'Reflexos de Combate',
        specializationId: 'lutador',
        category: 'classe_escolha',
        minLevel: 6,
        description: 'Concede +3 em Iniciativa e +2 em Testes de Reflexos.',
        effects: [
          { type: 'ADD_STAT', target: 'initiative', value: 3, source: 'especializacao', label: 'Reflexos de Combate' },
          { type: 'ADD_STAT', target: 'save_Reflexos', value: 2, source: 'especializacao', label: 'Reflexos de Combate' }
        ]
      }
    ]
  },
  {
    id: 'especialista-combate',
    name: 'Especialista em Combate',
    description: 'Mestres táticos e espadachins que dominam ferramentas amaldiçoadas, posturas e técnicas de corte.',
    pvFirstLevel: 12,
    pvPerLevel: 6,
    pePerLevel: 4,
    addsKeyAttrToPeLevel1: false,
    keyAttributes: ['forca', 'destreza', 'sabedoria'],
    saveOptions: ['Fortitude', 'Reflexos'],
    fixedSkills: ['Acrobacia'],
    freeSkillChoices: 3,
    multiclassReq: { destreza: 14 },
    abilities: [
      {
        id: 'ec-artes-combate',
        name: 'Artes do Combate & Repertório (Base Nv. 1)',
        specializationId: 'especialista-combate',
        category: 'classe_base',
        minLevel: 1,
        description: 'Concede proficiência com armas complexas e acesso a estilos de luta e posturas.',
        effects: []
      },
      {
        id: 'ec-manejo-superior',
        name: 'Manejo Superior',
        specializationId: 'especialista-combate',
        category: 'classe_escolha',
        minLevel: 1,
        description: 'Aumenta o dano da sua arma principal em +1 nível na tabela de danos.',
        effects: [{ type: 'WEAPON_DAMAGE_STEP', steps: 1, label: 'Manejo Superior' }]
      },
      {
        id: 'ec-postura-defensiva',
        name: 'Postura da Lâmina Serena',
        specializationId: 'especialista-combate',
        category: 'classe_escolha',
        minLevel: 4,
        description: 'Ativável: Assume postura defensiva recebendo +2 na Defesa e +2 em Atenção.',
        toggleable: true,
        effects: [
          { type: 'ADD_STAT', target: 'defense', value: 2, source: 'especializacao', label: 'Postura Serena' },
          { type: 'ADD_STAT', target: 'attention', value: 2, source: 'especializacao', label: 'Postura Serena' }
        ]
      }
    ]
  },
  {
    id: 'especialista-tecnica',
    name: 'Especialista em Técnica',
    description: 'Conjuradores prodigiosos que extraem o máximo potencial destrutivo e versátil de sua Técnica Inata.',
    pvFirstLevel: 10,
    pvPerLevel: 5,
    pePerLevel: 6,
    addsKeyAttrToPeLevel1: true,
    keyAttributes: ['inteligencia', 'sabedoria', 'presenca'],
    saveOptions: ['Astúcia', 'Vontade'],
    fixedSkills: ['Feitiçaria'],
    freeSkillChoices: 3,
    multiclassReq: { inteligencia: 14 },
    abilities: [
      {
        id: 'et-conjuracao-aprimorada',
        name: 'Conjuração Aprimorada (Base Nv. 1)',
        specializationId: 'especialista-tecnica',
        category: 'classe_base',
        minLevel: 1,
        description: 'Recebe +1 Feitiço em TODOS os níveis (inclusive ímpares) e soma seu Mod. de Atributo Chave ao dano de feitiços.',
        effects: []
      },
      {
        id: 'et-foco-economia',
        name: 'Foco: Economia de Energia',
        specializationId: 'especialista-tecnica',
        category: 'classe_escolha',
        minLevel: 1,
        description: 'Reduz em 1 PE o custo de feitiços de nível 2 ou superior (mínimo 1 PE).',
        effects: [{ type: 'SPELL_COST_REDUCTION', amount: 1, label: 'Foco: Economia' }]
      },
      {
        id: 'et-sobrecarga-tecnica',
        name: 'Sobrecarga de Técnica',
        specializationId: 'especialista-tecnica',
        category: 'classe_escolha',
        minLevel: 4,
        description: 'Aumenta permanentemente a CD da sua Técnica Amaldiçoada em +2.',
        effects: [{ type: 'ADD_STAT', target: 'techniqueDc', value: 2, source: 'especializacao', label: 'Sobrecarga Técnica' }]
      }
    ]
  },
  {
    id: 'controlador',
    name: 'Controlador',
    description: 'Invocadores que comandam Shikigamis, Marionetes e Maldições Domadas em sincronia no campo de batalha.',
    pvFirstLevel: 10,
    pvPerLevel: 5,
    pePerLevel: 5,
    addsKeyAttrToPeLevel1: true,
    keyAttributes: ['inteligencia', 'sabedoria', 'presenca'],
    saveOptions: ['Astúcia', 'Vontade'],
    fixedSkills: ['Ocultismo'],
    freeSkillChoices: 3,
    multiclassReq: { sabedoria: 14 },
    abilities: [
      {
        id: 'ctrl-invocacoes',
        name: 'Invocações Marcadas (Base Nv. 1)',
        specializationId: 'controlador',
        category: 'classe_base',
        minLevel: 1,
        description: 'Inicia com 2 Invocações (+1 a cada 3 níveis) e pode manter múltiplas invocações ativas simultaneamente.',
        effects: []
      },
      {
        id: 'ctrl-elo-espiritual',
        name: 'Elo Espiritual Reforçado',
        specializationId: 'controlador',
        category: 'classe_escolha',
        minLevel: 2,
        description: 'Recebe +2 em Ocultismo e +1 na CD de Técnica.',
        effects: [
          { type: 'ADD_STAT', target: 'skill_Ocultismo', value: 2, source: 'especializacao', label: 'Elo Espiritual' },
          { type: 'ADD_STAT', target: 'techniqueDc', value: 1, source: 'especializacao', label: 'Elo Espiritual' }
        ]
      }
    ]
  },
  {
    id: 'suporte',
    name: 'Suporte',
    description: 'Estrategistas, médicos e especialistas em barreiras que sustentam aliados com Energia Reversa e buffs.',
    pvFirstLevel: 10,
    pvPerLevel: 5,
    pePerLevel: 5,
    addsKeyAttrToPeLevel1: true,
    keyAttributes: ['inteligencia', 'sabedoria', 'presenca'],
    saveOptions: ['Astúcia', 'Vontade'],
    fixedSkills: ['Medicina'],
    freeSkillChoices: 4,
    multiclassReq: { presenca: 14 },
    abilities: [
      {
        id: 'sup-suporte-campo',
        name: 'Suporte em Campo (Base Nv. 1)',
        specializationId: 'suporte',
        category: 'classe_base',
        minLevel: 1,
        description: 'Pode usar a ação Ajudar como Ação Bônus e concede +2 nos testes auxiliados.',
        effects: []
      },
      {
        id: 'sup-fluxo-revigorante',
        name: 'Fluxo Revigorante',
        specializationId: 'suporte',
        category: 'classe_escolha',
        minLevel: 1,
        description: 'Aumenta seus PE Máximos em +4 e concede +2 em Medicina.',
        effects: [
          { type: 'ADD_STAT', target: 'maxPe', value: 4, source: 'especializacao', label: 'Fluxo Revigorante' },
          { type: 'ADD_STAT', target: 'skill_Medicina', value: 2, source: 'especializacao', label: 'Fluxo Revigorante' }
        ]
      }
    ]
  },
  {
    id: 'restringido',
    name: 'Restringido',
    description: 'Anomalias físicas absolutas que substituem o jujutsu por Estilos Marciais letais e Arsenal Amaldiçoado.',
    pvFirstLevel: 14,
    pvPerLevel: 7,
    pePerLevel: 4,
    addsKeyAttrToPeLevel1: false,
    keyAttributes: ['forca', 'destreza'],
    saveOptions: ['Fortitude', 'Reflexos'],
    fixedSkills: ['Atletismo', 'Acrobacia'],
    freeSkillChoices: 3,
    abilities: [
      {
        id: 'rest-esquiva-sobrehumana',
        name: 'Esquiva Sobre-humana (Base Nv. 1)',
        specializationId: 'restringido',
        category: 'classe_base',
        minLevel: 1,
        description: 'Recebe +1 na Defesa e em Reflexos (aumenta nos níveis 9 e 16).',
        effects: [
          { type: 'ADD_STAT', target: 'defense', value: 1, source: 'especializacao', label: 'Esquiva Sobre-humana' },
          { type: 'ADD_STAT', target: 'save_Reflexos', value: 1, source: 'especializacao', label: 'Esquiva Sobre-humana' }
        ]
      },
      {
        id: 'rest-cacador-feiticeiros',
        name: 'Caçador de Feiticeiros',
        specializationId: 'restringido',
        category: 'classe_escolha',
        minLevel: 2,
        description: 'Ativável: Contra usuários de energia amaldiçoada, recebe +2 em acerto e +2 em Atenção.',
        toggleable: true,
        effects: [{ type: 'ADD_STAT', target: 'attention', value: 2, source: 'especializacao', label: 'Caçador de Feiticeiros' }]
      }
    ]
  }
];
`,

  'src/data/catalogs.ts': `import { GradeLevel, SystemAbility } from '@/types/system';

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
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Criado:', filePath);
}

console.log('\\nEtapa 2 (Banco de Dados do Sistema) criada com sucesso!');