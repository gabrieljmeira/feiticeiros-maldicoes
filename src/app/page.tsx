'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Shield, Flame, Swords, Sparkles, BookOpen, ScrollText,
  ArrowUpCircle, Plus, Users, Eye, CheckCircle2, Dices, Trash2,
  Home, UserPlus, FolderOpen, ArrowRight, Download, Upload, Copy
} from 'lucide-react';
import {
  AttributeKey, AptitudeCategory, CharacterRawState,
  GradeLevel, OriginDefinition, SpellEntry
} from '@/types/system';
import { calculateCharacter, getCharacterGrade } from '@/engine/calculator';
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
const STORAGE_KEY = 'fm25_saved_characters_v1';

function createBlankCharacter(name = 'Novo Feiticeiro'): CharacterRawState {
  return {
    schemaVersion: 1,
    id: `char-${Date.now()}`,
    campaignCode: '',
    name,
    level: 1,
    theme: { presetId: 'cursed-cyan', hex: '#00D8FF', surfaceMode: 'dark' },
    baseAttributes: {
      forca: 10,
      destreza: 10,
      constituicao: 10,
      inteligencia: 10,
      sabedoria: 10,
      presenca: 10,
    },
    originId: 'inato',
    originAttributeBonus: {},
    levelAttributeBonus: {},
    classLevels: { 'especialista-tecnica': 1 },
    keyAttribute: 'inteligencia',
    extraSkillAttribute: 'inteligencia',
    trainedSkills: [],
    masterSkills: [],
    trainedSaves: [],
    masterSaves: [],
    aptitudeLevels: { AU: 0, CL: 0, BAR: 0, DOM: 0, ER: 0 },
    selectedAbilities: [],
    activeToggleIds: [],
    trainingSteps: {},
    techniqueName: '',
    techniqueBasic: '',
    spells: [],
    weapons: [],
    currentPv: 12,
    tempPv: 0,
    currentPe: 6,
    tempPe: 0,
    currentSoulIntegrity: 12,
    notes: '',
  };
}

export default function HomePage() {
  // Telas principais: 'landing' (Tela Inicial), 'wizard' (Criação Guiada), 'sheet' (Ficha), 'gm' (Área do Mestre)
  const [screen, setScreen] = useState<'landing' | 'wizard' | 'sheet' | 'gm'>('landing');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  const [savedChars, setSavedChars] = useState<CharacterRawState[]>([]);
  const [char, setChar] = useState<CharacterRawState>(() => createBlankCharacter());
  const [tab, setTab] = useState<'combate' | 'tecnica' | 'habilidades' | 'arsenal' | 'treinos'>('combate');
  const [customOrigins, setCustomOrigins] = useState<OriginDefinition[]>([]);

  // Modais
  const [homebrewModalOpen, setHomebrewModalOpen] = useState(false);
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);

  // Pool Dinâmica de Atributos
  const [usePoolMode, setUsePoolMode] = useState(true);
  const [poolAssignments, setPoolAssignments] = useState<Partial<Record<AttributeKey, number>>>({});

  // Escolhas de Origem no Wizard
  const [originBonusPlus2, setOriginBonusPlus2] = useState<AttributeKey>('forca');
  const [originBonusPlus1, setOriginBonusPlus1] = useState<AttributeKey>('constituicao');
  const [selectedClanId, setSelectedClanId] = useState<string>('cla-gojo');

  // Homebrew Form
  const [hbName, setHbName] = useState('');
  const [hbDesc, setHbDesc] = useState('');
  const [hbAttrMode, setHbAttrMode] = useState<'free_2_1' | 'fixed'>('free_2_1');
  const [hbUsesPe, setHbUsesPe] = useState(true);

  // Feitiços
  const [newSpellName, setNewSpellName] = useState('');
  const [newSpellLevel, setNewSpellLevel] = useState<0 | 1 | 2 | 3 | 4 | 5>(1);
  const [newSpellDamage, setNewSpellDamage] = useState('2d8');
  const [newSpellArea, setNewSpellArea] = useState<'Alvo Único' | 'Linha' | 'Cone' | 'Esfera'>('Alvo Único');
  const [variationParentId, setVariationParentId] = useState<string | null>(null);

  // Área do Mestre
  const [campaignCode, setCampaignCode] = useState('JUJUTSU-25');
  const [gmNotes, setGmNotes] = useState([
    { id: 'n1', col: 'Ganchos', title: 'Missão de Exorcismo Inicial', body: 'Investigar desaparecimentos na escola abandonada.' },
  ]);
  const [pinnedRules, setPinnedRules] = useState<string[]>(['rule-crit-save', 'rule-antidominio', 'rule-votos']);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCol, setNewNoteCol] = useState('Ganchos');
  const [rollFeed, setRollFeed] = useState<string[]>([]);

  // Carregar fichas salvas do navegador
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedChars(JSON.parse(raw));
    } catch {}
  }, []);

  // Salvar automaticamente a ficha atual quando estiver na tela de ficha
  useEffect(() => {
    if (screen !== 'sheet') return;
    setSavedChars((prev) => {
      const exists = prev.some((c) => c.id === char.id);
      const updated = exists ? prev.map((c) => (c.id === char.id ? char : c)) : [char, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [char, screen]);

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
    setRollFeed((prev) => [`[${time}] ${char.name}: ${text}`, ...prev.slice(0, 19)]);
  };

  const rollD20 = (label: string, bonus: number) => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + bonus + calc.soulTestPenalty;
    pushRoll(
      `rolou ${label}: d20(${d20}) ${bonus >= 0 ? '+' : ''}${bonus}${
        calc.soulTestPenalty ? ` ${calc.soulTestPenalty} (Alma)` : ''
      } = ${total}`
    );
  };

  // Pool Dinâmica de Atributos
  const usedPoolValues = Object.values(poolAssignments).filter((v): v is number => v !== undefined);
  const getAvailablePoolFor = (attr: AttributeKey) => {
    const current = poolAssignments[attr];
    const countsAvailable: Record<number, number> = {};
    for (const n of STANDARD_ARRAY) countsAvailable[n] = (countsAvailable[n] || 0) + 1;
    for (const u of usedPoolValues) countsAvailable[u] = (countsAvailable[u] || 0) - 1;
    if (current !== undefined) countsAvailable[current] = (countsAvailable[current] || 0) + 1;
    return STANDARD_ARRAY.filter((n) => {
      if (countsAvailable[n] > 0) {
        countsAvailable[n]--;
        return true;
      }
      return false;
    });
  };

  const handleAssignPool = (attr: AttributeKey, valStr: string) => {
    const val = valStr === '' ? undefined : Number(valStr);
    setPoolAssignments((prev) => ({ ...prev, [attr]: val }));
    setChar((prev) => ({
      ...prev,
      baseAttributes: { ...prev.baseAttributes, [attr]: val ?? 10 },
    }));
  };

  const startNewCharacterWizard = () => {
    const fresh = createBlankCharacter('');
    setChar(fresh);
    setPoolAssignments({});
    setUsePoolMode(true);
    setWizardStep(1);
    setScreen('wizard');
  };

  const openSavedCharacter = (saved: CharacterRawState) => {
    setChar(saved);
    setScreen('sheet');
  };

  const deleteSavedCharacter = (id: string) => {
    const next = savedChars.filter((c) => c.id !== id);
    setSavedChars(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleCreateHomebrewOrigin = () => {
    if (!hbName.trim()) return;
    const newOrigin: OriginDefinition = {
      id: `hb-${Date.now()}`,
      name: hbName.trim(),
      isHomebrew: true,
      description: hbDesc || 'Origem customizada da campanha.',
      attributeMode: hbAttrMode,
      usesCursedEnergy: hbUsesPe,
      hasInnateTechnique: hbUsesPe,
      allowsMulticlass: true,
      features: [
        {
          id: `hb-feat-${Date.now()}`,
          name: `Herança: ${hbName.trim()}`,
          category: 'origem',
          minLevel: 1,
          description: hbDesc || 'Benefício exclusivo de origem homebrew.',
          effects: [],
        },
      ],
    };
    setCustomOrigins((prev) => [...prev, newOrigin]);
    setChar((p) => ({ ...p, originId: newOrigin.id }));
    setHbName('');
    setHbDesc('');
    setHomebrewModalOpen(false);
  };

  const finishWizard = () => {
    const selectedOrigin = allOrigins.find((o) => o.id === char.originId);
    const activeClassId = Object.keys(char.classLevels)[0] || 'lutador';
    const selectedSpec = SPECIALIZATIONS.find((s) => s.id === activeClassId);

    let originAttrBonus: Partial<Record<AttributeKey, number>> = {};
    if (selectedOrigin?.id === 'herdado') {
      const clan = CLANS_DATA.find((c) => c.id === selectedClanId);
      originAttrBonus = clan?.attributes || {};
    } else if (selectedOrigin?.attributeMode === 'fixed' && selectedOrigin.fixedAttributes) {
      originAttrBonus = selectedOrigin.fixedAttributes;
    } else {
      originAttrBonus = { [originBonusPlus2]: 2, [originBonusPlus1]: 1 };
    }

    const autoAbilities = [
      ...(selectedOrigin?.features.map((f) => f.id) || []),
      ...(selectedSpec?.abilities.filter((a) => a.category === 'classe_base').map((a) => a.id) || []),
    ];

    const finalChar: CharacterRawState = {
      ...char,
      name: char.name.trim() || 'Feiticeiro Sem Nome',
      originAttributeBonus: originAttrBonus,
      selectedAbilities: Array.from(new Set([...char.selectedAbilities, ...autoAbilities])),
      trainedSkills: Array.from(new Set([...char.trainedSkills, ...(selectedSpec?.fixedSkills || [])])),
      aptitudeLevels:
        selectedOrigin?.id === 'restringido'
          ? { AU: 0, CL: 0, BAR: 0, DOM: 0, ER: 0 }
          : { AU: 1, CL: 1, BAR: 0, DOM: 0, ER: 0 },
    };

    const initialCalc = calculateCharacter(finalChar, allAbilities);
    finalChar.currentPv = initialCalc.maxPv;
    finalChar.currentSoulIntegrity = initialCalc.maxSoulIntegrity;
    finalChar.currentPe = initialCalc.maxPe;

    setChar(finalChar);
    setScreen('sheet');
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
                    id: `var-${Date.now()}`,
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
        id: `sp-${Date.now()}`,
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

  // ============================================================================
  // 1. TELA INICIAL (LANDING / HUB)
  // ============================================================================
  if (screen === 'landing') {
    return (
      <div
        style={themeVars as React.CSSProperties}
        className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col justify-between"
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-12 space-y-10">
          {/* HERO HEADER */}
          <div className="text-center space-y-3">
            <span className="inline-block rounded-full border border-accent/40 bg-accent-soft px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-accent-text">
              Sistema Feiticeiros & Maldições • v2.5
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Grimório Digital & Escudo Jujutsu
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-zinc-400">
              Criação automatizada de personagens com cálculo em tempo real, origens oficiais e homebrew,
              grimório com variações de liberação e painel sincronizado para o Narrador.
            </p>
          </div>

          {/* DOIS CARDS PRINCIPAIS: CRIAR FICHA VS ÁREA DO MESTRE */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <button
              type="button"
              onClick={startNewCharacterWizard}
              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-left transition hover:border-accent hover:shadow-glow"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-fg">
                  <UserPlus className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-accent-text transition">
                  Criar Nova Ficha
                </h2>
                <p className="text-sm text-zinc-400">
                  Assistente passo-a-passo com pool dinâmica de atributos, escolha de Origem/Clã (ou Origem Homebrew),
                  Especialização, perícias, feitiços e personalização de cores HEX.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-text">
                <span>Iniciar Criação Guiada</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => setScreen('gm')}
              className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-left transition hover:border-purple-500 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white">
                  <Eye className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition">
                  Área do Mestre
                </h2>
                <p className="text-sm text-zinc-400">
                  Escudo do Narrador com acompanhamento ao vivo das fichas vinculadas, monitor tático de áreas e
                  efeitos, regras difíceis de decorar fixáveis e anotações organizadas.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                <span>Abrir Painel do Narrador</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>

          {/* FICHAS SALVAS NO NAVEGADOR + IMPORTAR JSON */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-accent-text" />
                <h3 className="text-base font-bold text-white">Minhas Fichas Salvas ({savedChars.length})</h3>
              </div>

              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-accent">
                <Upload className="h-3.5 w-3.5" />
                <span>Importar Ficha (.json)</span>
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const parsed = JSON.parse(reader.result as string) as CharacterRawState;
                        parsed.id = `char-${Date.now()}`;
                        openSavedCharacter(parsed);
                      } catch {
                        alert('Arquivo JSON inválido.');
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
            </div>

            {savedChars.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500">
                Você ainda não criou nenhuma ficha neste navegador. Clique em <strong>"Criar Nova Ficha"</strong> acima para começar!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {savedChars.map((item) => {
                  const origName = allOrigins.find((o) => o.id === item.originId)?.name || 'Origem';
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600"
                    >
                      <button
                        type="button"
                        onClick={() => openSavedCharacter(item)}
                        className="flex items-center gap-3 text-left"
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border font-mono text-xs font-bold"
                          style={{ borderColor: item.theme?.hex || '#00D8FF', color: item.theme?.hex || '#00D8FF' }}
                        >
                          {item.avatarDataUrl ? (
                            <img src={item.avatarDataUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            (item.name || 'FM').slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{item.name}</div>
                          <div className="text-[11px] text-zinc-400">
                            Nível {item.level} • {origName}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSavedCharacter(item.id)}
                        title="Excluir ficha"
                        className="rounded p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 2. WIZARD DE CRIAÇÃO PASSO-A-PASSO (AO CLICAR EM "CRIAR NOVA FICHA")
  // ============================================================================
  if (screen === 'wizard') {
    const selectedOrigin = allOrigins.find((o) => o.id === char.originId);
    const activeClassId = Object.keys(char.classLevels)[0] || 'lutador';
    const selectedSpec = SPECIALIZATIONS.find((s) => s.id === activeClassId) || SPECIALIZATIONS[0];

    return (
      <div
        style={themeVars as React.CSSProperties}
        className="min-h-screen bg-[#09090B] text-zinc-100 p-4 sm:p-8"
      >
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <button
              type="button"
              onClick={() => setScreen('landing')}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 hover:border-accent"
            >
              <Home className="h-3.5 w-3.5" />
              Voltar ao Início
            </button>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <span
                  key={step}
                  className={`rounded-full px-3 py-1 font-mono text-xs font-bold ${
                    wizardStep === step
                      ? 'bg-accent text-accent-fg'
                      : wizardStep > step
                      ? 'bg-accent-soft text-accent-text'
                      : 'bg-zinc-900 text-zinc-500'
                  }`}
                >
                  Passo {step}/4
                </span>
              ))}
            </div>
            <ThemeCustomizer theme={char.theme} onChange={(next) => setChar((p) => ({ ...p, theme: next }))} />
          </div>

          {/* PASSO 1: CONCEITO, FOTO & COR */}
          {wizardStep === 1 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-5">
              <h2 className="text-xl font-bold text-white">1. Identidade do Personagem & Aparência</h2>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <AvatarUploader
                  name={char.name}
                  avatarDataUrl={char.avatarDataUrl}
                  onChange={(url) => setChar((p) => ({ ...p, avatarDataUrl: url }))}
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400">Nome do Feiticeiro</label>
                    <input
                      value={char.name}
                      onChange={(e) => setChar((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Ex: Yuji Itadori, Satoru Gojo, Seu OC..."
                      className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400">Nível Inicial (1 a 20)</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={char.level}
                        onChange={(e) =>
                          setChar((p) => ({ ...p, level: Math.max(1, Math.min(20, Number(e.target.value))) }))
                        }
                        className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400">Código da Mesa (Opcional)</label>
                      <input
                        value={char.campaignCode || ''}
                        onChange={(e) => setChar((p) => ({ ...p, campaignCode: e.target.value.toUpperCase() }))}
                        placeholder="Ex: JUJUTSU-25"
                        className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASSO 2: POOL DINÂMICA DE ATRIBUTOS */}
          {wizardStep === 2 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white">2. Distribuição de Atributos</h2>
                  <p className="text-xs text-zinc-400">
                    Ao selecionar um valor da pool, ele desaparece automaticamente das opções dos próximos atributos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPoolAssignments({});
                    setUsePoolMode((v) => !v);
                  }}
                  className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300 hover:border-accent"
                >
                  {usePoolMode ? 'Usando: Valores Fixos [15, 14, 13, 12, 10, 8]' : 'Usando: Edição Livre'}
                </button>
              </div>

              {usePoolMode && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl bg-zinc-950 p-3 text-xs">
                  <span className="text-zinc-400">Valores Restantes:</span>
                  {STANDARD_ARRAY.map((val, i) => {
                    const usedCount = usedPoolValues.filter((u) => u === val).length;
                    const priorCount = STANDARD_ARRAY.slice(0, i).filter((u) => u === val).length;
                    const isUsed = usedCount > priorCount;
                    return (
                      <span
                        key={`wiz-pool-${i}`}
                        className={`rounded-md px-2.5 py-1 font-mono font-bold ${
                          isUsed
                            ? 'bg-zinc-900 text-zinc-600 line-through'
                            : 'border border-accent/50 bg-accent-soft text-accent-text'
                        }`}
                      >
                        {val}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(Object.keys(ATTR_LABELS) as AttributeKey[]).map((key) => {
                  const options = getAvailablePoolFor(key);
                  return (
                    <div key={key} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                      <div className="text-sm font-bold text-white">{ATTR_LABELS[key]}</div>
                      {usePoolMode ? (
                        <select
                          value={poolAssignments[key] ?? ''}
                          onChange={(e) => handleAssignPool(key, e.target.value)}
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-white"
                        >
                          <option value="">Escolher valor...</option>
                          {options.map((opt, idx) => (
                            <option key={`${opt}-${idx}`} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          min={6}
                          max={20}
                          value={char.baseAttributes[key]}
                          onChange={(e) =>
                            setChar((p) => ({
                              ...p,
                              baseAttributes: { ...p.baseAttributes, [key]: Number(e.target.value) },
                            }))
                          }
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-white"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASSO 3: ORIGEM (OFICIAL OU HOMEBREW) + BÔNUS */}
          {wizardStep === 3 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white">3. Origem & Linhagem</h2>
                  <p className="text-xs text-zinc-400">Escolha uma origem oficial ou crie uma Origem Homebrew.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHomebrewModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-fg"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nova Origem Homebrew
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {allOrigins.map((orig) => (
                  <button
                    key={orig.id}
                    type="button"
                    onClick={() => setChar((p) => ({ ...p, originId: orig.id }))}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      char.originId === orig.id
                        ? 'border-accent bg-accent-soft shadow-glow'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{orig.name}</span>
                      {orig.isHomebrew && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                          HB
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400">{orig.description}</p>
                  </button>
                ))}
              </div>

              {/* ESCOLHA SECUNDÁRIA DA ORIGEM */}
              {selectedOrigin?.id === 'herdado' ? (
                <div className="rounded-xl border border-accent/40 bg-zinc-950 p-4 space-y-2">
                  <label className="block text-xs font-bold text-accent-text">Selecione o Clã Herdado:</label>
                  <select
                    value={selectedClanId}
                    onChange={(e) => setSelectedClanId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white"
                  >
                    {CLANS_DATA.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.bonusDescription}
                      </option>
                    ))}
                  </select>
                </div>
              ) : selectedOrigin?.attributeMode === 'free_2_1' ? (
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-accent/40 bg-zinc-950 p-4">
                  <div>
                    <label className="block text-xs font-bold text-accent-text">Bônus +2 da Origem:</label>
                    <select
                      value={originBonusPlus2}
                      onChange={(e) => setOriginBonusPlus2(e.target.value as AttributeKey)}
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
                    <label className="block text-xs font-bold text-accent-text">Bônus +1 da Origem:</label>
                    <select
                      value={originBonusPlus1}
                      onChange={(e) => setOriginBonusPlus1(e.target.value as AttributeKey)}
                      className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white"
                    >
                      {(Object.keys(ATTR_LABELS) as AttributeKey[]).map((k) => (
                        <option key={k} value={k} disabled={k === originBonusPlus2}>
                          {ATTR_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* PASSO 4: ESPECIALIZAÇÃO (CLASSE) & ATRIBUTO CHAVE */}
          {wizardStep === 4 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-5">
              <h2 className="text-xl font-bold text-white">4. Especialização & Atributo Chave</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {SPECIALIZATIONS.filter((s) =>
                  char.originId === 'restringido' ? s.id === 'restringido' : s.id !== 'restringido'
                ).map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() =>
                      setChar((p) => ({
                        ...p,
                        classLevels: { [spec.id]: p.level },
                        keyAttribute: spec.keyAttributes[0],
                      }))
                    }
                    className={`rounded-xl border p-3.5 text-left transition ${
                      activeClassId === spec.id
                        ? 'border-accent bg-accent-soft shadow-glow'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600'
                    }`}
                  >
                    <div className="text-sm font-bold text-white">{spec.name}</div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400">{spec.description}</p>
                    <div className="mt-2 font-mono text-[10px] text-accent-text">
                      PV: {spec.pvFirstLevel} (+{spec.pvPerLevel}/nv) • PE: +{spec.pePerLevel}/nv
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-accent/40 bg-zinc-950 p-4">
                <label className="block text-xs font-bold text-accent-text">Atributo Chave da Especialização:</label>
                <select
                  value={char.keyAttribute}
                  onChange={(e) => setChar((p) => ({ ...p, keyAttribute: e.target.value as AttributeKey }))}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white"
                >
                  {selectedSpec.keyAttributes.map((k) => (
                    <option key={k} value={k}>
                      {ATTR_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* RODAPÉ DE NAVEGAÇÃO DO WIZARD */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={wizardStep === 1}
              onClick={() => setWizardStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-xs font-bold text-zinc-300 disabled:opacity-40"
            >
              Anterior
            </button>

            {wizardStep < 4 ? (
              <button
                type="button"
                onClick={() => setWizardStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)}
                className="rounded-xl bg-accent px-6 py-2.5 text-xs font-bold text-accent-fg shadow-glow"
              >
                Próximo Passo
              </button>
            ) : (
              <button
                type="button"
                onClick={finishWizard}
                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-xs font-bold text-accent-fg shadow-glow"
              >
                <CheckCircle2 className="h-4 w-4" />
                Concluir & Abrir Ficha
              </button>
            )}
          </div>
        </div>

        {/* MODAL HOMEBREW */}
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
                <input type="checkbox" checked={hbUsesPe} onChange={(e) => setHbUsesPe(e.target.checked)} />
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
      </div>
    );
  }

  // ============================================================================
  // 3. FICHA DO PERSONAGEM & 4. ÁREA DO MESTRE
  // ============================================================================
  return (
    <div
      style={themeVars as React.CSSProperties}
      className={`min-h-screen transition-colors ${
        char.theme.surfaceMode === 'manga' ? 'manga-surface' : 'bg-[#09090B] text-zinc-100'
      }`}
    >
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScreen('landing')}
              title="Voltar para Tela Inicial"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs font-semibold text-zinc-300 hover:border-accent"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Início</span>
            </button>

            {screen === 'sheet' && (
              <>
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
              </>
            )}

            {screen === 'gm' && (
              <div>
                <h1 className="text-base font-bold text-white">Área do Mestre — Escudo do Narrador</h1>
                <p className="text-xs text-zinc-400">Código da Campanha: <strong className="font-mono text-accent-text">{campaignCode}</strong></p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {screen === 'sheet' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${char.name.toLowerCase().replace(/\s+/g, '-')}.json`;
                    a.click();
                  }}
                  title="Exportar Ficha JSON"
                  className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-xs text-zinc-300 hover:border-accent"
                >
                  <Download className="h-3.5 w-3.5" />
                  Exportar
                </button>

                <button
                  type="button"
                  onClick={() => setLevelUpModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-accent-fg shadow-glow hover:opacity-90 transition"
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  Subir de Nível
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setScreen(screen === 'gm' ? 'sheet' : 'gm')}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-200 hover:border-accent"
            >
              <Eye className="h-3.5 w-3.5 text-accent-text" />
              {screen === 'gm' ? 'Ir para Ficha' : 'Área do Mestre'}
            </button>

            <ThemeCustomizer theme={char.theme} onChange={(next) => setChar((p) => ({ ...p, theme: next }))} />
          </div>
        </div>
      </header>

      {screen === 'sheet' ? (
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
                  {calc.initiative >= 0 ? `+${calc.initiative}` : calc.initiative}
                </button>
              </div>
              <div>
                <div className="text-[10px] uppercase text-zinc-400">CD Técnica</div>
                <div className="mt-1 font-mono text-2xl font-bold text-white">{calc.techniqueDc}</div>
              </div>
            </div>
          </section>

          {/* ABAS DA FICHA */}
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
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                    tab === item.id
                      ? 'bg-accent text-accent-fg shadow-glow'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* ABA 1: ATRIBUTOS & PERÍCIAS */}
          {tab === 'combate' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-5">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-accent-text">Atributos</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setPoolAssignments({});
                        setUsePoolMode((v) => !v);
                      }}
                      className="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:border-accent"
                    >
                      {usePoolMode ? 'Modo: Pool [15..8]' : 'Modo: Edição Livre'}
                    </button>
                  </div>

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
                              {mod >= 0 ? `+${mod}` : mod}
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
                                  <option key={`${opt}-${idx}`} value={opt}>
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

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-zinc-400">
                    <Dices className="h-4 w-4 text-accent-text" />
                    Histórico de Rolagens
                  </div>
                  <div className="max-h-44 space-y-1.5 overflow-y-auto font-mono text-xs">
                    {rollFeed.length === 0 ? (
                      <div className="text-zinc-500">Clique em qualquer perícia, atributo ou feitiço para rolar.</div>
                    ) : (
                      rollFeed.map((entry, idx) => (
                        <div key={idx} className="rounded bg-zinc-950 px-2.5 py-1.5 text-zinc-300">
                          {entry}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 lg:col-span-7">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-accent-text">
                  Perícias (T = Treinado | M = Mestre)
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
                            className={`h-4 w-4 rounded border text-[10px] font-bold ${
                              isMaster
                                ? 'border-amber-400 bg-amber-400 text-black'
                                : isTrained
                                ? 'border-accent bg-accent text-accent-fg'
                                : 'border-zinc-700 bg-zinc-900 text-transparent'
                            }`}
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
                          {total >= 0 ? `+${total}` : total}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: TÉCNICA & FEITIÇOS COM VARIAÇÕES */}
          {tab === 'tecnica' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                <h2 className="text-sm font-bold uppercase text-accent-text">Técnica Amaldiçoada & Funcionamento Básico</h2>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    value={char.techniqueName}
                    onChange={(e) => setChar((p) => ({ ...p, techniqueName: e.target.value }))}
                    placeholder="Nome da Técnica Inata"
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

              <div className="space-y-4">
                {char.spells.length === 0 && (
                  <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                    Nenhum feitiço adicionado ainda. Use o formulário acima para criar os feitiços da sua técnica.
                  </div>
                )}
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
                          + Variação
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setChar((p) => ({ ...p, currentPe: Math.max(0, p.currentPe - spell.peCost) }));
                            pushRoll(`conjurou ${spell.name} (-${spell.peCost} PE)`);
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
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setChar((p) => ({ ...p, currentPe: Math.max(0, p.currentPe - v.peCost) }));
                                pushRoll(`conjurou ${v.name} (-${v.peCost} PE)`);
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

          {/* ABA 3: ORIGENS, CLASSES ORDENADAS & APTIDÕES */}
          {tab === 'habilidades' && (
            <div className="space-y-6">
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

              <div className="space-y-4">
                <h2 className="text-sm font-bold uppercase text-accent-text">
                  Habilidades Ordenadas por Especialização (Efeitos Automáticos)
                </h2>
                {SPECIALIZATIONS.map((spec) => (
                  <div key={spec.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">{spec.name}</h3>
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
                              className={`rounded-lg border p-3 transition ${
                                owned ? 'border-accent bg-accent-soft' : 'border-zinc-800 bg-zinc-950'
                              }`}
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
                                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                        active ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-300'
                                      }`}
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
                                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                      owned ? 'bg-accent text-accent-fg' : 'bg-zinc-800 text-zinc-300'
                                    }`}
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
                <h2 className="mb-3 text-sm font-bold uppercase text-accent-text">Adicionar Arma</h2>
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
                              id: `wp-${Date.now()}`,
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
                            {wp.grade} (+{gradeBonus}) • Crítico {wp.criticalRange}+
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            pushRoll(
                              `atacou com ${wp.name}: Acerto 1d20+${atkBonus} | Dano ${wp.damageDice}+${dmgBonus} (${wp.damageType})`
                            )
                          }
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-fg"
                        >
                          Atacar (+{atkBonus})
                        </button>
                      </div>

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

                      <div className="flex flex-wrap gap-1.5">
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
                              className={`rounded px-2 py-1 text-[11px] font-semibold transition ${
                                selected
                                  ? 'bg-accent text-accent-fg'
                                  : allowedByGrade
                                  ? 'border border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-accent'
                                  : 'cursor-not-allowed border border-zinc-900 bg-zinc-950/40 text-zinc-600'
                              }`}
                            >
                              {enc.name} ({enc.minGrade})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABA 5: TREINAMENTOS */}
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
                            />
                            <div>
                              <div className="font-bold text-zinc-200">
                                {st.step}ª Etapa ({st.focusCost} Focos)
                              </div>
                              <div className="text-zinc-400">{st.label}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      ) : (
        /* ÁREA DO MESTRE */
        <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase text-accent-text">
                    <Users className="h-4 w-4" />
                    Fichas da Mesa ({savedChars.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(campaignCode)}
                    className="flex items-center gap-1 rounded border border-zinc-700 px-2 py-0.5 font-mono text-[10px] text-zinc-300 hover:border-accent"
                  >
                    <Copy className="h-3 w-3" />
                    {campaignCode}
                  </button>
                </div>

                {savedChars.length === 0 ? (
                  <p className="text-xs text-zinc-500">Nenhuma ficha vinculada ainda.</p>
                ) : (
                  savedChars.map((item) => {
                    const itemCalc = calculateCharacter(item, allAbilities);
                    return (
                      <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <strong className="text-sm text-white">{item.name}</strong>
                          <span className="font-mono text-xs text-accent-text">
                            Nv.{item.level} • {itemCalc.grade}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                          <div className="rounded bg-zinc-900 p-1.5">
                            <div className="text-[10px] text-zinc-400">PV</div>
                            <div className="font-bold text-emerald-400">
                              {item.currentPv}/{itemCalc.maxPv}
                            </div>
                          </div>
                          <div className="rounded bg-zinc-900 p-1.5">
                            <div className="text-[10px] text-zinc-400">PE</div>
                            <div className="font-bold text-accent-text">
                              {item.currentPe}/{itemCalc.maxPe}
                            </div>
                          </div>
                          <div className="rounded bg-zinc-900 p-1.5">
                            <div className="text-[10px] text-zinc-400">DEF / CD</div>
                            <div className="font-bold text-white">
                              {itemCalc.defense.total} / {itemCalc.techniqueDc}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* MONITOR TÁTICO & REGRAS DIFÍCEIS */}
            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase text-accent-text">
                  Escudo Rápido: Regras Difíceis de Decorar
                </h3>
                <div className="space-y-2 max-h-[30rem] overflow-y-auto">
                  {GM_HARD_RULES.map((rule) => {
                    const pinned = pinnedRules.includes(rule.id);
                    return (
                      <div
                        key={rule.id}
                        className={`rounded-lg border p-3 text-xs ${
                          pinned ? 'border-accent bg-accent-soft' : 'border-zinc-800 bg-zinc-950'
                        }`}
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

            {/* WORKSPACE LIVRE DE ANOTAÇÕES DO MESTRE */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 lg:col-span-4 space-y-3">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase text-accent-text">
                <ScrollText className="h-4 w-4" />
                Anotações Livres do Mestre
              </h3>

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
                      { id: `n-${Date.now()}`, col: newNoteCol, title: newNoteTitle, body: 'Clique para detalhar...' },
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

      {/* MODAL LEVEL UP */}
      {levelUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-accent bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Subir para o Nível {Math.min(20, char.level + 1)}</h2>
              <span className="rounded bg-accent-soft px-2 py-0.5 font-mono text-xs text-accent-text">
                {getCharacterGrade(Math.min(20, char.level + 1))}
              </span>
            </div>

            <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-xs">
              {(char.level + 1) % 2 === 0 && char.originId !== 'restringido' && (
                <div>
                  <strong className="text-accent-text">Nível Par — +1 Nível de Aptidão Amaldiçoada:</strong>
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
                  <strong className="text-accent-text">Marco de Atributo (+1 em um atributo):</strong>
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
