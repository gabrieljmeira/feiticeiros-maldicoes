import { AttributeKey, SystemAbility } from '@/types/system';

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
