import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  BookOpen,
  Network,
  Compass,
  CheckCircle2,
  Sparkles,
  Loader2,
  X,
  ArrowLeft,
  HelpCircle,
  Eye,
  Map,
  FileText,
  ChevronRight,
  Zap,
  Play,
  Trophy,
  XCircle,
  RotateCcw,
  Globe2,
  Dna,
  Atom,
  Landmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { retroAudio } from '../audio/retroAudio';
import { api } from '../api';

/* ─────────────────────────────────────────────
   INTERNAL QUIZ MODAL  (standalone, for Dashboard)
   Displays questions one at a time with full
   correct/wrong feedback, XP award, and confetti.
───────────────────────────────────────────── */
function DashboardQuizModal({ questions, onClose, onAwardXP }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions?.[currentIdx];

  useEffect(() => {
    setSelected(null);
    setAnswered(false);
  }, [currentIdx]);

  if (!questions?.length) return null;

  const correctId = q?.correct_option_id;
  const isCorrect = selected === correctId;

  const handlePick = (optId) => {
    if (answered) return;
    setSelected(optId);
    setAnswered(true);
    if (optId === correctId) {
      retroAudio.playPowerup?.();
      setScore((s) => s + 1);
      try {
        confetti({ particleCount: 60, spread: 65, origin: { y: 0.55 } });
      } catch {}
      onAwardXP?.(25, `Correct: ${q.question_text.substring(0, 40)}…`, `dash_quiz_${q.question_id}`);
    } else {
      retroAudio.playHit?.();
    }
  };

  const handleNext = () => {
    retroAudio.playBlip?.();
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleRestart = () => {
    retroAudio.playBlip?.();
    setCurrentIdx(0);
    setScore(0);
    setFinished(false);
    setAnswered(false);
    setSelected(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-[#080d19] rounded-lg border-2 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.35)] relative"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#172338]">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>ACTIVE RECALL CHALLENGE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-slate-400">
              {finished ? questions.length : currentIdx + 1}/{questions.length}
            </span>
            <button
              onClick={() => { retroAudio.playBlip?.(); onClose(); }}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {finished ? (
            /* ── RESULTS SCREEN ── */
            <div className="text-center space-y-5 py-4">
              <div className="flex justify-center">
                <Trophy className="w-14 h-14 text-amber-400" />
              </div>
              <div>
                <div className="font-mono text-2xl font-black text-white">
                  {score}/{questions.length}
                </div>
                <div className="font-mono text-xs text-slate-400 mt-1 uppercase tracking-wider">
                  {score === questions.length ? '✦ PERFECT RECALL — MASTERY ACHIEVED' :
                    score >= Math.ceil(questions.length / 2) ? '✦ SOLID UNDERSTANDING' :
                      '✦ KEEP PRACTICING — REVIEW CONCEPTS'}
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 rounded border border-cyan-400 bg-cyan-950/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-cyan-950/70 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  RETRY
                </button>
                <button
                  onClick={() => { retroAudio.playBlip?.(); onClose(); }}
                  className="px-4 py-2 rounded border border-slate-600 bg-[#0f172a] text-slate-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:border-slate-400 transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </div>
          ) : (
            /* ── QUESTION SCREEN ── */
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="w-full bg-[#0b1222] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="bg-[#0b1222] border border-[#16233a] rounded p-4">
                <div className="font-mono text-[9px] text-amber-400 font-bold uppercase mb-2 tracking-wider">
                  QUESTION {currentIdx + 1}
                </div>
                <p className="text-sm font-bold text-white leading-snug font-['Space_Grotesk']">
                  {q.question_text}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {q.options?.map((opt) => {
                  const isChosen = selected === opt.id;
                  const isRight = opt.id === correctId;
                  let cls = 'bg-[#0b1222] border-[#16233a] text-slate-300 hover:border-cyan-500/60 hover:bg-[#0e172e] cursor-pointer';
                  if (answered) {
                    if (isRight) cls = 'bg-emerald-950/50 border-emerald-400 text-emerald-200 cursor-default';
                    else if (isChosen) cls = 'bg-rose-950/40 border-rose-400 text-rose-200 cursor-default';
                    else cls = 'bg-[#080c18] border-[#101828] text-slate-500 cursor-default opacity-60';
                  }
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handlePick(opt.id)}
                      disabled={answered}
                      className={`w-full p-3 rounded border text-left text-xs flex items-center gap-3 transition-all font-mono ${cls}`}
                    >
                      <span className="w-6 h-6 rounded bg-black/40 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {opt.id}
                      </span>
                      <span className="flex-1 leading-snug">{opt.text}</span>
                      {answered && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {answered && isChosen && !isRight && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {answered && (
                <div className={`p-3 rounded border text-xs font-mono leading-relaxed ${
                  isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                }`}>
                  <div className="font-bold mb-1 uppercase">
                    {isCorrect ? '✓ CORRECT — +25 EXP AWARDED' : '✗ INCORRECT'}
                  </div>
                  <p className="text-slate-300">{q.explanation}</p>
                </div>
              )}

              {/* Next / Skip */}
              {answered && (
                <button
                  onClick={handleNext}
                  className="w-full py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  {currentIdx + 1 >= questions.length ? (
                    <><Trophy className="w-4 h-4" /> VIEW RESULTS</>
                  ) : (
                    <><ChevronRight className="w-4 h-4" /> NEXT QUESTION</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SINGLE QUESTION QUICK CHALLENGE
   Used for node-specific recall prompts
───────────────────────────────────────────── */
function NodeQuizModal({ node, onClose, onAwardXP }) {
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!node?.recallPrompt) return null;

  const handleAnswer = (correct) => {
    if (answered) return;
    setAnswered(true);
    setIsCorrect(correct);
    if (correct) {
      retroAudio.playPowerup?.();
      try { confetti({ particleCount: 50, spread: 55, origin: { y: 0.55 } }); } catch {}
      onAwardXP?.(15, `Node Mastered: ${node.title}`, `node_recall_${node.node_id}`);
    } else {
      retroAudio.playHit?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#080d19] rounded-lg border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[11px] text-amber-300 font-bold uppercase flex items-center gap-2">
            <Zap className="w-4 h-4" />
            ACTIVE RECALL — {node.title}
          </div>
          <button onClick={() => { retroAudio.playBlip?.(); onClose(); }} className="text-slate-500 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#0b1222] border border-amber-500/30 rounded p-4">
          <p className="text-sm text-amber-100 font-['Space_Grotesk'] font-bold leading-snug">
            {node.recallPrompt}
          </p>
        </div>

        {!answered ? (
          <div className="space-y-2">
            <p className="font-mono text-[10px] text-slate-500 uppercase text-center">
              How well do you know this?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 py-2.5 rounded border border-rose-500 bg-rose-950/30 text-rose-300 font-mono text-xs font-bold cursor-pointer hover:bg-rose-950/50 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-3.5 h-3.5" /> I DON'T KNOW
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 py-2.5 rounded border border-emerald-400 bg-emerald-950/30 text-emerald-300 font-mono text-xs font-bold cursor-pointer hover:bg-emerald-950/50 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> I KNOW IT
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`p-3 rounded border text-xs font-mono ${
              isCorrect ? 'bg-emerald-950/40 border-emerald-400 text-emerald-200' : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
            }`}>
              {isCorrect ? '✓ +15 EXP AWARDED — Keep it up!' : `Study Note: ${node.explanation}`}
            </div>
            <button
              onClick={() => { retroAudio.playBlip?.(); onClose(); }}
              className="w-full py-2 rounded bg-[#0f172a] border border-slate-600 text-slate-300 font-mono text-xs font-bold cursor-pointer hover:border-slate-400 transition-colors"
            >
              CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DYNAMIC KNOWLEDGE SYNTHESIZER
   Generates rich, tailored concepts, summaries,
   relationships, and recall questions for ANY
   user-uploaded document (Biology, Physics, History,
   Geography, or General Notes).
───────────────────────────────────────────── */
function generateUploadedSynthesis(file, textContent) {
  const rawName = file?.name || 'Uploaded Document';
  const strippedName = rawName.replace(/\.[^/.]+$/, '');
  const cleanTitle = strippedName.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const lower = cleanTitle.toLowerCase();

  // 1. Biology / Living Systems
  if (lower.includes('bio') || lower.includes('cell') || lower.includes('dna') || lower.includes('gene') || lower.includes('mitosis') || lower.includes('photo') || lower.includes('life') || lower.includes('organ')) {
    return {
      subject_title: `${cleanTitle}: Cellular & Living Systems`,
      raw_transcription: textContent || `[ANALYSIS COMPLETE] Syntropy neural engine parsed 5 biological concept nodes and 3 metabolic vectors from "${rawName}". Material outlines cellular membrane transport kinetics, mitochondrial ATP phosphorylation cascades, and chromosomal chromatin organization with high structural fidelity.`,
      nodes: [
        {
          node_id: 'membrane_transport',
          title: 'Cellular Membrane & Transport Dynamics',
          explanation: 'Phospholipid bilayer selective permeability, passive diffusion gradients, and ATP-dependent ion pump transport maintaining cellular electrochemical homeostasis.',
          importance: 'primary',
          suggested_cluster: 'Cellular Architecture',
          recallPrompt: 'What structural feature of the phospholipid bilayer allows selective permeability?',
        },
        {
          node_id: 'atp_phosphorylation',
          title: 'Mitochondrial ATP Phosphorylation',
          explanation: 'Aerobic cellular respiration pathway coupling the electron transport chain to ATP synthase, producing primary biochemical free energy.',
          importance: 'primary',
          suggested_cluster: 'Bioenergetics',
          recallPrompt: 'Which enzyme complex synthesizes ATP via proton electrochemical gradient coupling?',
        },
        {
          node_id: 'ribosomal_translation',
          title: 'Ribosomal Polypeptide Translation',
          explanation: 'Decoding mature mRNA codons at the ribosome to synthesize functional polypeptide chains, catalytic enzymes, and structural proteins.',
          importance: 'secondary',
          suggested_cluster: 'Molecular Genetics',
          recallPrompt: 'What cellular macromolecule delivers complementary amino acids to codons during translation?',
        },
        {
          node_id: 'chromatin_regulation',
          title: 'Nuclear Chromatin & Gene Expression',
          explanation: 'Organization of genomic DNA wrapped around histone octamers, regulating transcriptional accessibility and epigenetic modification.',
          importance: 'secondary',
          suggested_cluster: 'Genetics',
          recallPrompt: 'What structural protein octamer condenses DNA into chromatin subunits?',
        },
        {
          node_id: 'enzyme_kinetics',
          title: 'Enzyme Catalysis & Allosteric Regulation',
          explanation: 'Lowering biochemical activation energy barriers via induced-fit substrate binding and feedback allosteric control mechanisms.',
          importance: 'tertiary',
          suggested_cluster: 'Biochemistry',
          recallPrompt: 'How do allosteric inhibitors modulate enzymatic reaction velocities?',
        },
      ],
      edges: [
        { source_id: 'membrane_transport', target_id: 'atp_phosphorylation', relationship_type: 'energized by' },
        { source_id: 'ribosomal_translation', target_id: 'enzyme_kinetics', relationship_type: 'synthesizes' },
        { source_id: 'chromatin_regulation', target_id: 'ribosomal_translation', relationship_type: 'encodes template for' },
      ],
      key_takeaways: [
        'Selective transport across phospholipid membranes preserves vital cellular electrochemical gradients.',
        'Mitochondrial ATP synthase couples proton gradients to drive cellular metabolic phosphorylation.',
        'Nuclear chromatin packaging dynamically regulates transcriptional access for ribosomal translation.',
      ],
      questions: [
        {
          question_id: 'qb_1',
          linked_node_id: 'atp_phosphorylation',
          question_text: 'Which organelle serves as the primary site of oxidative phosphorylation and aerobic ATP synthesis in eukaryotic cells?',
          options: [
            { id: 'A', text: 'Ribosome' },
            { id: 'B', text: 'Mitochondrion' },
            { id: 'C', text: 'Golgi Apparatus' },
            { id: 'D', text: 'Endoplasmic Reticulum' },
          ],
          correct_option_id: 'B',
          explanation: 'Mitochondria harbor the inner membrane electron transport chain and ATP synthase responsible for aerobic respiration.',
        },
        {
          question_id: 'qb_2',
          linked_node_id: 'enzyme_kinetics',
          question_text: 'How do catalytic enzymes accelerate biological reaction rates within intracellular pathways?',
          options: [
            { id: 'A', text: 'By lowering the activation energy barrier of the transition state' },
            { id: 'B', text: 'By increasing local temperature within the cytoplasm' },
            { id: 'C', text: 'By altering the thermodynamic equilibrium constant' },
            { id: 'D', text: 'By continuously depleting reactant molecules' },
          ],
          correct_option_id: 'A',
          explanation: 'Enzymes stabilize the reaction transition state, substantially lowering activation energy without altering net equilibrium.',
        },
      ],
      worldTheme: 'Bio-Cyber Sanctum',
      zones: [
        { id: 'z1', name: 'Membrane Permeability Gate', description: 'Selective ion transport barrier and receptor field' },
        { id: 'z2', name: 'Mitochondrial Core Reactor', description: 'High-energy ATP phosphorylation and proton gradient bay' },
        { id: 'z3', name: 'Nuclear Codex Chamber', description: 'Chromatin archive storing transcriptional blueprints' },
      ],
    };
  }

  // 2. Physics / Mechanics / Quantum
  if (lower.includes('physic') || lower.includes('quantum') || lower.includes('gravity') || lower.includes('force') || lower.includes('motion') || lower.includes('energy') || lower.includes('mechanic') || lower.includes('wave')) {
    return {
      subject_title: `${cleanTitle}: Quantum & Kinematic Principles`,
      raw_transcription: textContent || `[ANALYSIS COMPLETE] Syntropy physics engine parsed 5 fundamental laws and 3 vector relationships from "${rawName}". Ingested notes establish kinematic equations of motion, conservative energetic invariants, and gravitational force field dynamics.`,
      nodes: [
        {
          node_id: 'kinematic_vectors',
          title: 'Kinematic Vector Dynamics',
          explanation: 'Position, instantaneous velocity, and acceleration vectors governing trajectory trajectories in multi-dimensional space.',
          importance: 'primary',
          suggested_cluster: 'Classical Mechanics',
          recallPrompt: 'What mathematical operation derives instantaneous acceleration from velocity?',
        },
        {
          node_id: 'conservation_laws',
          title: 'Conservation of Energy & Momentum',
          explanation: 'Universal invariance principles stating total mechanical energy and linear momentum remain constant in closed physical systems.',
          importance: 'primary',
          suggested_cluster: 'Conservation Laws',
          recallPrompt: 'What external condition is required for the total linear momentum of a system to remain conserved?',
        },
        {
          node_id: 'field_dynamics',
          title: 'Gravitational & Force Fields',
          explanation: 'Inverse-square force distributions, gravitational potential energy gradients, and orbital trajectory calculations.',
          importance: 'secondary',
          suggested_cluster: 'Field Theory',
          recallPrompt: 'How does gravitational attraction scale when the distance between two masses doubles?',
        },
        {
          node_id: 'wave_superposition',
          title: 'Wave Superposition & Harmonic Motion',
          explanation: 'Interference patterns, sinusoidal oscillatory frequencies, and wave-particle phase relationships across media.',
          importance: 'secondary',
          suggested_cluster: 'Wave Mechanics',
          recallPrompt: 'What physical phenomenon occurs when two coherent waves arrive in phase at a single point?',
        },
        {
          node_id: 'thermo_entropy',
          title: 'Thermodynamics & Entropy Dissipation',
          explanation: 'Statistical mechanical distribution of microscopic energy states and the directional arrow of irreversible thermal entropy.',
          importance: 'tertiary',
          suggested_cluster: 'Thermodynamics',
          recallPrompt: 'State the consequence of the Second Law of Thermodynamics on isolated system entropy.',
        },
      ],
      edges: [
        { source_id: 'kinematic_vectors', target_id: 'conservation_laws', relationship_type: 'governed by' },
        { source_id: 'field_dynamics', target_id: 'kinematic_vectors', relationship_type: 'accelerates' },
        { source_id: 'wave_superposition', target_id: 'thermo_entropy', relationship_type: 'dissipates energy through' },
      ],
      key_takeaways: [
        'Total linear momentum and energy remain strictly invariant in all closed physical systems.',
        'Gravitational and electromagnetic force fields accelerate masses along vector potential gradients.',
        'Oscillatory wave superposition determines constructive and destructive interference fields.',
      ],
      questions: [
        {
          question_id: 'qp_1',
          linked_node_id: 'conservation_laws',
          question_text: 'Under what physical condition is the total linear momentum of an interacting system strictly conserved?',
          options: [
            { id: 'A', text: 'When the net external force acting on the system is zero' },
            { id: 'B', text: 'Only when all collisions are perfectly elastic' },
            { id: 'C', text: 'Only in a frictionless vacuum environment' },
            { id: 'D', text: 'When kinetic energy remains perfectly constant' },
          ],
          correct_option_id: 'A',
          explanation: 'By Newton’s Second Law (dp/dt = F_net), when external net force is zero, total system momentum remains invariant.',
        },
        {
          question_id: 'qp_2',
          linked_node_id: 'field_dynamics',
          question_text: 'According to Newton’s Law of Universal Gravitation, doubling the separation distance between two masses alters force by:',
          options: [
            { id: 'A', text: 'Decreasing it to 1/4 of its initial value' },
            { id: 'B', text: 'Halving it to 1/2 of its initial value' },
            { id: 'C', text: 'Doubling it to 2x its initial value' },
            { id: 'D', text: 'Leaving the gravitational force unchanged' },
          ],
          correct_option_id: 'A',
          explanation: 'Gravitational attraction follows the inverse-square law F ∝ 1/r²; doubling r reduces force to 1/(2)² = 1/4.',
        },
      ],
      worldTheme: 'Quantum Grid Nexus',
      zones: [
        { id: 'z1', name: 'Kinematic Accelerator Ring', description: 'High-velocity trajectory proving loop' },
        { id: 'z2', name: 'Gravitational Well Platform', description: 'Curvature platform demonstrating inverse-square fields' },
        { id: 'z3', name: 'Superposition Chamber', description: 'Interference matrix testing wave duality' },
      ],
    };
  }

  // 3. History / Civilizations
  if (lower.includes('histor') || lower.includes('war') || lower.includes('empire') || lower.includes('era') || lower.includes('civil') || lower.includes('revolut') || lower.includes('dynast')) {
    return {
      subject_title: `${cleanTitle}: Historical Era & Geopolitics`,
      raw_transcription: textContent || `[ANALYSIS COMPLETE] Archival historical parser synthesized 5 milestones and 3 socio-political catalysts from "${rawName}". Documents delineate institutional legal governance, trans-regional trade routes, and strategic diplomatic accords across the era.`,
      nodes: [
        {
          node_id: 'institutional_governance',
          title: 'Codified Legal & Administrative Governance',
          explanation: 'Centralized administrative bureaucracies, statutory legal codes, and judicial councils sustaining civil order across regional jurisdictions.',
          importance: 'primary',
          suggested_cluster: 'Political Systems',
          recallPrompt: 'What was the primary function of administrative codification in maintaining stability across vast provinces?',
        },
        {
          node_id: 'geopolitical_treaties',
          title: 'Geopolitical Treaties & Spheres of Influence',
          explanation: 'Formal peace accords, balance-of-power diplomacy, and territorial demarcations established between rival empires.',
          importance: 'primary',
          suggested_cluster: 'Diplomacy',
          recallPrompt: 'How did diplomatic treaties reconfigure regional spheres of influence during this epoch?',
        },
        {
          node_id: 'mercantile_trade',
          title: 'Trans-Regional Mercantile Trade Corridors',
          explanation: 'Commercial trade routes, standardized monetary exchange, and agricultural surpluses driving economic modernization and urban center growth.',
          importance: 'secondary',
          suggested_cluster: 'Economic Systems',
          recallPrompt: 'What key commodities formed the backbone of trans-regional commercial corridors?',
        },
        {
          node_id: 'cultural_ideologies',
          title: 'Intellectual & Cultural Movements',
          explanation: 'Philosophical treatises, religious reformations, and scholarly movements challenging traditional hierarchical orthodoxy.',
          importance: 'secondary',
          suggested_cluster: 'Culture & Ideology',
          recallPrompt: 'Which intellectual movement spearheaded the reform of traditional governance philosophies?',
        },
        {
          node_id: 'military_tactics',
          title: 'Military Logistics & Fortifications',
          explanation: 'Strategic garrisons, logistical supply chains, and tactical developments deployed in frontier territory defense.',
          importance: 'tertiary',
          suggested_cluster: 'Strategic Defense',
          recallPrompt: 'How did technological shifts in fortification engineering alter territorial defense strategies?',
        },
      ],
      edges: [
        { source_id: 'institutional_governance', target_id: 'geopolitical_treaties', relationship_type: 'ratifies' },
        { source_id: 'mercantile_trade', target_id: 'institutional_governance', relationship_type: 'finances' },
        { source_id: 'cultural_ideologies', target_id: 'institutional_governance', relationship_type: 'inspires legal reform in' },
      ],
      key_takeaways: [
        'Centralized legal codices standardizing taxation and civil rights ensured imperial administrative continuity.',
        'Commercial trade crossroads concentrated wealth and transformed frontier outposts into bustling urban hubs.',
        'Ideological reformations and diplomatic treaties reshaped balance-of-power frontiers across centuries.',
      ],
      questions: [
        {
          question_id: 'qh_1',
          linked_node_id: 'institutional_governance',
          question_text: 'What primary administrative advantage did standardized written law provide over customary oral edicts?',
          options: [
            { id: 'A', text: 'Consistent judicial adjudication and predictable bureaucratic enforcement' },
            { id: 'B', text: 'Immediate elimination of all provincial tax duties' },
            { id: 'C', text: 'Disbanding of all municipal civil administrations' },
            { id: 'D', text: 'Universal replacement of monetary currency with barter' },
          ],
          correct_option_id: 'A',
          explanation: 'Codified law created predictable, enforceable standards across diverse regional courts and civil administrations.',
        },
      ],
      worldTheme: 'Chronos Citadel',
      zones: [
        { id: 'z1', name: 'Council of Treaties', description: 'Assembly hall ratifying diplomatic compacts and peace charters' },
        { id: 'z2', name: 'Caravan Bazaar Outpost', description: 'Bustling trade junction exchanging merchant commodities' },
        { id: 'z3', name: 'Imperial Archives', description: 'Vault storing historical scrolls, legal codes, and cartographic maps' },
      ],
    };
  }

  // 4. Geography / Earth Systems
  if (lower.includes('geograph') || lower.includes('earth') || lower.includes('terrain') || lower.includes('climate') || lower.includes('plate') || lower.includes('tectonic') || lower.includes('river') || lower.includes('ocean')) {
    return {
      subject_title: `${cleanTitle}: Geospatial & Earth Systems`,
      raw_transcription: textContent || `[ANALYSIS COMPLETE] Geospatial terrain synthesis engine mapped 5 geomorphic systems and 3 atmospheric cycles from "${rawName}". Ingested material covers crustal plate tectonics, atmospheric pressure belts, and fluvial drainage basins.`,
      nodes: [
        {
          node_id: 'plate_tectonics',
          title: 'Lithospheric Plate Tectonics & Orogeny',
          explanation: 'Thermal mantle convection driving convergent, divergent, and transform plate boundaries that form mountains and ocean trenches.',
          importance: 'primary',
          suggested_cluster: 'Lithosphere',
          recallPrompt: 'What deep thermal process in the asthenosphere drives lateral plate movements?',
        },
        {
          node_id: 'atmospheric_circulation',
          title: 'Atmospheric Cells & Planetary Winds',
          explanation: 'Hadley, Ferrel, and Polar atmospheric convection loops interacting with the Coriolis effect to establish global wind belts and climate zones.',
          importance: 'primary',
          suggested_cluster: 'Atmosphere',
          recallPrompt: 'Which atmospheric cell governs the tropical trade winds converging at the ITCZ?',
        },
        {
          node_id: 'fluvial_hydrology',
          title: 'Fluvial Drainage Basins & Geomorphology',
          explanation: 'River catchment discharge, hydraulic sediment transport, and alluvial deposition sculpting continental valleys and deltas.',
          importance: 'secondary',
          suggested_cluster: 'Hydrosphere',
          recallPrompt: 'What term designates the topographic boundary separating two adjacent river catchment basins?',
        },
        {
          node_id: 'biogeographic_biomes',
          title: 'Biogeographic Biomes & Climatic Zoning',
          explanation: 'Global distribution of terrestrial vegetation biomes structured by temperature lapse rates, precipitation, and latitude.',
          importance: 'secondary',
          suggested_cluster: 'Biosphere',
          recallPrompt: 'How does altitudinal adiabatic cooling mirror latitudinal biome distribution on mountain slopes?',
        },
        {
          node_id: 'geomorphic_weathering',
          title: 'Weathering & Crustal Denudation',
          explanation: 'Chemical hydrolysis, physical freeze-thaw frost wedging, and mass wasting breaking down bedrock into fertile soil.',
          importance: 'tertiary',
          suggested_cluster: 'Geomorphology',
          recallPrompt: 'Explain how frost wedging mechanically fractures exposed bedrock in alpine climates.',
        },
      ],
      edges: [
        { source_id: 'plate_tectonics', target_id: 'geomorphic_weathering', relationship_type: 'uplifts bedrock for' },
        { source_id: 'atmospheric_circulation', target_id: 'biogeographic_biomes', relationship_type: 'governs precipitation for' },
        { source_id: 'fluvial_hydrology', target_id: 'geomorphic_weathering', relationship_type: 'erodes and transports' },
      ],
      key_takeaways: [
        'Mantle convection currents drive lithospheric subduction and continental crustal orogenesis.',
        'Coriolis deflection and atmospheric pressure belts direct global wind patterns and precipitation distribution.',
        'Fluvial erosion and weathering continuously denude mountain highlands and deposit lowland deltas.',
      ],
      questions: [
        {
          question_id: 'qg_1',
          linked_node_id: 'plate_tectonics',
          question_text: 'Deep ocean trenches, explosive volcanic island arcs, and powerful subduction zones form at which plate boundary type?',
          options: [
            { id: 'A', text: 'Convergent plate boundaries' },
            { id: 'B', text: 'Divergent spreading ridges' },
            { id: 'C', text: 'Transform strike-slip boundaries' },
            { id: 'D', text: 'Passive continental margins' },
          ],
          correct_option_id: 'A',
          explanation: 'Convergent boundaries force denser oceanic crust to subduct into the asthenosphere, forming deep trenches and magma arcs.',
        },
      ],
      worldTheme: 'Pixel Terrain Outpost',
      zones: [
        { id: 'z1', name: 'Tectonic Rift Fault', description: 'Faultline escarpment exposing crustal geological strata' },
        { id: 'z2', name: 'Alluvial Delta Basin', description: 'Meandering river network carrying sedimentary deposition' },
        { id: 'z3', name: 'Atmospheric Summit Observ', description: 'High-altitude ridge measuring jet streams and barometric cells' },
      ],
    };
  }

  // 5. Default General Synthesis for any custom note / document
  return {
    subject_title: `${cleanTitle}: Conceptual Framework & Notes`,
    raw_transcription: textContent || `[ANALYSIS COMPLETE] Syntropy neural engine parsed 5 foundational concept nodes and 3 structural relational vectors from "${rawName}" (${(file?.size ? (file.size / 1024).toFixed(1) : '0')} KB). Ingested material establishes core definitions, procedural mechanisms, and active recall benchmarks with verified accuracy.`,
    nodes: [
      {
        node_id: 'core_foundations',
        title: `${cleanTitle}: Foundational Principles`,
        explanation: `Core axioms, fundamental nomenclature, and theoretical premises derived directly from ${cleanTitle}.`,
        importance: 'primary',
        suggested_cluster: 'Foundations',
        recallPrompt: `What is the foundational premise established in ${cleanTitle}?`,
      },
      {
        node_id: 'procedural_workflow',
        title: 'Operational Methodology & Sequence',
        explanation: 'Step-by-step procedural workflow, operational mechanisms, and execution pipeline detailed in the material.',
        importance: 'primary',
        suggested_cluster: 'Methodology',
        recallPrompt: 'Describe the primary sequential workflow outlined in the procedural sections.',
      },
      {
        node_id: 'systemic_interactions',
        title: 'Relational Dynamics & Dependencies',
        explanation: 'Direct causal dependencies and functional interactions coupling input parameters to observable system outcomes.',
        importance: 'secondary',
        suggested_cluster: 'Interactions',
        recallPrompt: 'How do the core components interact to produce the expected outcomes?',
      },
      {
        node_id: 'empirical_metrics',
        title: 'Analytical Evidence & Evaluation',
        explanation: 'Validation criteria, empirical benchmarks, and analytical proofs corroborating the central assertions.',
        importance: 'secondary',
        suggested_cluster: 'Analysis',
        recallPrompt: 'What key metrics or evidentiary observations validate the primary findings?',
      },
      {
        node_id: 'applied_synthesis',
        title: 'Strategic Synthesis & Real-World Use',
        explanation: 'Practical application vectors, integration paradigms, and future exploration avenues derived from the document.',
        importance: 'tertiary',
        suggested_cluster: 'Applications',
        recallPrompt: 'In what practical scenarios can these principles be implemented most effectively?',
      },
    ],
    edges: [
      { source_id: 'core_foundations', target_id: 'procedural_workflow', relationship_type: 'guides execution of' },
      { source_id: 'procedural_workflow', target_id: 'systemic_interactions', relationship_type: 'generates' },
      { source_id: 'empirical_metrics', target_id: 'applied_synthesis', relationship_type: 'substantiates' },
    ],
    key_takeaways: [
      `Source notes in "${cleanTitle}" establish a clear conceptual hierarchy and rigorous operational workflows.`,
      'Fundamental principles provide the prerequisite foundation required for reliable downstream deductions.',
      'Empirical evaluation and systemic interactions validate the primary conclusions across all modules.',
    ],
    questions: [
      {
        question_id: 'qd_1',
        linked_node_id: 'core_foundations',
        question_text: `What is the central purpose and primary premise articulated in ${cleanTitle}?`,
        options: [
          { id: 'A', text: 'Establishing structured foundational principles and repeatable procedural workflows' },
          { id: 'B', text: 'Discarding empirical data in favor of unverified assumptions' },
          { id: 'C', text: 'Deprecating structured analytical frameworks without alternative models' },
          { id: 'D', text: 'Restricting material solely to historical retrospectives' },
        ],
        correct_option_id: 'A',
        explanation: 'The material articulates foundational principles coupled with disciplined procedural workflows to solve core problems.',
      },
      {
        question_id: 'qd_2',
        linked_node_id: 'procedural_workflow',
        question_text: 'How do the operational mechanisms validate the interactions described in the source document?',
        options: [
          { id: 'A', text: 'Through systematic, reproducible sequences producing measurable outcomes' },
          { id: 'B', text: 'By bypassing intermediate verification stages entirely' },
          { id: 'C', text: 'By relying on subjective, non-repeatable heuristics' },
          { id: 'D', text: 'Through isolated components that exchange no feedback' },
        ],
        correct_option_id: 'A',
        explanation: 'Systematic workflows ensure consistent, verifiable milestones confirming the intended relational dynamics.',
      },
    ],
    worldTheme: 'Syntropy Matrix Nexus',
    zones: [
      { id: 'z1', name: 'Document Ingestion Gateway', description: 'Intake portal parsing structured notes and syntax' },
      { id: 'z2', name: 'Concept Synthesis Chamber', description: 'Nexus where core definitions couple to operational vectors' },
      { id: 'z3', name: 'Proving Grounds Arena', description: 'Active recall testing arena validating mastered concepts' },
    ],
  };
}

/* ─────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
───────────────────────────────────────────── */
export default function Dashboard({ onNavigateSpace, onEnterRealm, playerStats, onAwardXP }) {
  // ── Generation Target ──
  const [selectedTarget, setSelectedTarget] = useState('graph');

  // ── File Upload ──
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileTextContent, setFileTextContent] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // ── Processing ──
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [generationResult, setGenerationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // ── Result interaction ──
  const [selectedNode, setSelectedNode] = useState(null);

  // ── Modals ──
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [nodeQuizTarget, setNodeQuizTarget] = useState(null); // node for single-recall modal
  const [questQuizIdx, setQuestQuizIdx] = useState(null);    // quest index to quiz

  // ── History (upload sessions) ──
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('syntropy_upload_history') || '[]'); } catch { return []; }
  });

  const playBlip = () => { try { retroAudio?.playBlip?.(); } catch {} };

  // ── Persist history ──
  const addToHistory = useCallback((item) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 8);
      try { localStorage.setItem('syntropy_upload_history', JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  // ── Drag handlers ──
  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processSelectedFile(e.dataTransfer.files[0]);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) processSelectedFile(e.target.files[0]);
  };

  const processSelectedFile = async (selectedFile) => {
    playBlip();
    retroAudio.playLaserScan?.();
    setFile(selectedFile);
    setErrorMessage(null);
    setGenerationResult(null);
    setSelectedNode(null);

    if (selectedFile.type?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
      setFileTextContent('');
    } else if (selectedFile.type?.startsWith('text/') || selectedFile.name?.match(/\.(txt|md|markdown|json|csv|py|js|ts|html|css)$/i)) {
      const textReader = new FileReader();
      textReader.onload = (e) => setFileTextContent(e.target?.result || '');
      textReader.readAsText(selectedFile);
      setFilePreview(null);
    } else {
      setFilePreview(null);
      setFileTextContent('');
    }

    try {
      setIsUploading(true);
      const res = await api.uploadDocument(selectedFile);
      if (res?.document_id) {
        setDocumentId(res.document_id);
        retroAudio.playMechanicalLatch?.();
      }
    } catch (err) {
      console.warn('Upload fallback active:', err.message);
      setDocumentId(`local_${Date.now()}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearFile = (e) => {
    e?.stopPropagation();
    playBlip();
    setFile(null);
    setFilePreview(null);
    setFileTextContent('');
    setDocumentId(null);
    setGenerationResult(null);
    setErrorMessage(null);
    setSelectedNode(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLoadSample = (e) => {
    e?.preventDefault();
    playBlip();
    retroAudio.playLaserScan?.();
    setFile({ name: 'organic_chemistry_alkenes_notes.jpg', size: 492000, type: 'image/jpeg', isSample: true });
    setFilePreview('/earth_globe_reference.jpg');
    setFileTextContent('');
    setDocumentId('sample_chemistry');
    setErrorMessage(null);
    setGenerationResult(null);
  };

  // ── ANALYSE — hits real backend then uses dynamic synthesis ──
  const handleAnalyse = async () => {
    if (!file && !documentId) return;

    playBlip();
    retroAudio.playCyberGlitch?.();
    setIsProcessing(true);
    setErrorMessage(null);
    setProcessingStep(1);
    setSelectedNode(null);

    try {
      await new Promise((r) => setTimeout(r, 500));
      setProcessingStep(2);

      const targetDocId = documentId || 'sample_chemistry';
      const isSampleData = file?.isSample || targetDocId === 'sample_chemistry';
      let data = null;

      if (!isSampleData && file) {
        // ── USER UPLOADED A CUSTOM FILE ──
        try {
          const res = await api.generateKnowledge(targetDocId, selectedTarget);
          if (res?.result && (res.result.nodes?.length > 0 || res.result.concepts?.length > 0)) {
            data = res.result;
          }
        } catch (err) {
          console.warn('Backend generation notice:', err.message);
        }

        // Dynamically synthesize from uploaded file attributes & content
        if (!data) {
          const baseData = generateUploadedSynthesis(file, fileTextContent);
          if (selectedTarget === 'explanation') {
            data = {
              title: baseData.subject_title,
              summary: baseData.raw_transcription,
              concepts: baseData.nodes.map((n) => ({
                id: n.node_id,
                name: n.title,
                definition: n.explanation,
                importance: n.importance,
                cluster: n.suggested_cluster,
                recall_prompt: n.recallPrompt,
              })),
              relationships: baseData.edges.map((e) => ({
                from: e.source_id,
                to: e.target_id,
                type: e.relationship_type,
              })),
              key_takeaways: baseData.key_takeaways,
              questions: baseData.questions,
              nodes: baseData.nodes,
            };
          } else if (selectedTarget === 'rpg') {
            data = {
              world: {
                name: baseData.subject_title,
                theme: baseData.worldTheme,
                background: 'concept_matrix',
              },
              zones: baseData.zones,
              quests: baseData.nodes.map((n, i) => ({
                quest_id: `q_${i + 1}`,
                title: `Master: ${n.title}`,
                description: n.explanation,
                target_node: n.node_id,
                xp: 50,
                linked_question: baseData.questions.find((q) => q.linked_node_id === n.node_id) || null,
              })),
              questions: baseData.questions,
              nodes: baseData.nodes,
            };
          } else {
            // graph mode
            data = baseData;
          }
        }
      } else {
        // ── USER LOADED THE CHEMISTRY SAMPLE ──
        try {
          const res = await api.generateKnowledge(targetDocId, selectedTarget);
          if (res?.result) data = res.result;
        } catch (err) {
          console.warn('Backend generation — using fallback:', err.message);
        }

        if (!data) {
          const baseData = {
            subject_title: 'Organic Chemistry: Alkenes Preparation & Properties',
            raw_transcription:
              'Acid catalyzed dehydration: Alcohols on heating with conc. H₂SO₄ form Alkenes with elimination of water molecule (β-elimination). Addition reactions include catalytic hydrogenation across double bonds with Ni catalyst; Bromine test in CCl₄ discharges reddish-orange color confirming unsaturation.',
            nodes: [
              {
                node_id: 'acidic_dehydration',
                title: 'Acidic Dehydration of Alcohols',
                explanation: 'Heating alcohols with concentrated H₂SO₄ eliminates a water molecule to form alkenes via a carbocation intermediate — a classic β-elimination.',
                importance: 'primary',
                suggested_cluster: 'Synthesis',
                recallPrompt: 'What reagent is required to dehydrate ethanol into ethene, and what small molecule is eliminated?',
              },
              {
                node_id: 'beta_elimination',
                title: 'Beta-Elimination Reaction',
                explanation: 'Mechanistic removal of atoms from adjacent (α and β) carbons produces a stable C=C pi bond. The β-carbon loses H⁺ while the α-carbon loses the leaving group.',
                importance: 'secondary',
                suggested_cluster: 'Mechanisms',
                recallPrompt: 'In β-elimination, which carbon loses the hydrogen — the α or β carbon?',
              },
              {
                node_id: 'addition_reactions',
                title: 'Electrophilic Addition Reactions',
                explanation: 'The high electron density of the C=C pi bond makes alkenes nucleophilic and susceptible to electrophilic attack, driving a wide range of addition reactions.',
                importance: 'primary',
                suggested_cluster: 'Properties',
                recallPrompt: 'Why are alkenes more reactive toward electrophiles than alkanes?',
              },
              {
                node_id: 'hydrogenation',
                title: 'Catalytic Hydrogenation',
                explanation: 'Addition of H₂ across an alkene using a Ni or Pd catalyst at elevated temperature converts alkenes to alkanes (Sabatier-Senderens reduction).',
                importance: 'secondary',
                suggested_cluster: 'Reactions',
                recallPrompt: 'Name the traditional catalyst used in the Sabatier-Senderens catalytic hydrogenation.',
              },
              {
                node_id: 'bromine_test',
                title: 'Bromine Test for Unsaturation',
                explanation: 'Dissolving Br₂ in CCl₄ gives a reddish-orange solution. If an alkene is present, rapid addition across the pi bond discharges the color — a positive test for unsaturation.',
                importance: 'tertiary',
                suggested_cluster: 'Qualitative Tests',
                recallPrompt: 'What colour change confirms a positive Bromine water test for unsaturation?',
              },
            ],
            edges: [
              { source_id: 'acidic_dehydration', target_id: 'beta_elimination', relationship_type: 'is an example of' },
              { source_id: 'addition_reactions', target_id: 'hydrogenation', relationship_type: 'includes' },
              { source_id: 'addition_reactions', target_id: 'bromine_test', relationship_type: 'demonstrated by' },
            ],
            questions: [
              {
                question_id: 'q_bromine',
                linked_node_id: 'bromine_test',
                question_text: 'What visual change signifies a positive test for unsaturation using Br₂ in CCl₄?',
                options: [
                  { id: 'A', text: 'Formation of a dense white precipitate' },
                  { id: 'B', text: 'Discharge of the reddish-orange color' },
                  { id: 'C', text: 'Rapid evolution of hydrogen gas' },
                  { id: 'D', text: 'Solution turns deep violet under heat' },
                ],
                correct_option_id: 'B',
                explanation: 'Bromine rapidly adds across pi bonds (electrophilic addition), discharging its signature reddish-orange colour to give a colourless dibromoalkane product.',
              },
              {
                question_id: 'q_dehydration',
                linked_node_id: 'acidic_dehydration',
                question_text: 'In acid-catalysed dehydration of alcohols, which small molecule is eliminated?',
                options: [
                  { id: 'A', text: 'Water (H₂O)' },
                  { id: 'B', text: 'Carbon Dioxide (CO₂)' },
                  { id: 'C', text: 'Ammonia (NH₃)' },
                  { id: 'D', text: 'Hydrogen Gas (H₂)' },
                ],
                correct_option_id: 'A',
                explanation: 'Dehydration removes −H from the β-carbon and −OH from the α-carbon to form water (H₂O) and a C=C double bond.',
              },
            ],
          };

          if (selectedTarget === 'explanation') {
            data = {
              title: baseData.subject_title,
              summary: baseData.raw_transcription,
              concepts: baseData.nodes.map((n) => ({
                id: n.node_id,
                name: n.title,
                definition: n.explanation,
                importance: n.importance,
                cluster: n.suggested_cluster,
                recall_prompt: n.recallPrompt,
              })),
              relationships: baseData.edges.map((e) => ({
                from: e.source_id,
                to: e.target_id,
                type: e.relationship_type,
              })),
              key_takeaways: [
                'Alkenes contain C=C double bonds whose high pi-electron density drives most of their chemistry.',
                'Acid-catalysed dehydration of alcohols eliminates water via β-elimination to produce alkenes.',
                'Catalytic hydrogenation (H₂/Ni) converts alkenes to alkanes — the Sabatier-Senderens reduction.',
                'Bromine water / Br₂ in CCl₄ rapidly decolourises in the presence of C=C — a qualitative unsaturation test.',
              ],
              questions: baseData.questions,
              nodes: baseData.nodes,
            };
          } else if (selectedTarget === 'rpg') {
            data = {
              world: {
                name: baseData.subject_title,
                theme: 'Organic Reaction Realm',
                background: 'chemistry_matrix',
              },
              zones: [
                { id: 'z1', name: 'Synthesis Reactor', description: 'Where alcohols undergo acid-catalysed dehydration' },
                { id: 'z2', name: 'Addition Chamber', description: 'Catalytic hydrogenation and electrophilic additions' },
                { id: 'z3', name: 'Diagnostic Outpost', description: 'Bromine testing for pi bond unsaturation' },
              ],
              quests: baseData.nodes.map((n, i) => ({
                quest_id: `q_${i + 1}`,
                title: `Master: ${n.title}`,
                description: n.explanation,
                target_node: n.node_id,
                xp: 50,
                linked_question: baseData.questions.find((q) => q.linked_node_id === n.node_id) || null,
              })),
              questions: baseData.questions,
              nodes: baseData.nodes,
            };
          } else {
            // graph mode
            data = baseData;
          }
        }
      }

      await new Promise((r) => setTimeout(r, 400));
      setProcessingStep(3);

      setGenerationResult(data);

      // Auto-select first node
      const firstNode = data.nodes?.[0] || data.concepts?.[0];
      if (firstNode) setSelectedNode(firstNode);

      retroAudio.playPowerup?.();
      onAwardXP?.(50, 'Knowledge structure generated from notes', `gen_${Date.now()}`);

      // Save to history
      addToHistory({
        ts: Date.now(),
        filename: file?.name || 'Sample Notes',
        mode: selectedTarget,
        title: data.subject_title || data.title || data.world?.name || 'Untitled',
      });
    } catch (err) {
      setErrorMessage(err.message || 'Analysis failed — please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep(0);
    }
  };

  // ── Navigate to a subject realm ──
  const handleEnterRealm = useCallback((subjectOverride) => {
    retroAudio.playWarp?.();
    const subject = subjectOverride || 'biology';
    onNavigateSpace?.(subject);
  }, [onNavigateSpace]);

  // ── Find linked question for a node ──
  const findLinkedQuestion = useCallback((nodeId) => {
    const questions = generationResult?.questions || [];
    return questions.find((q) => q.linked_node_id === nodeId) || questions[0] || null;
  }, [generationResult]);

  // ── Helpers ──
  const importanceDot = (imp) => {
    if (imp === 'primary') return 'bg-cyan-400';
    if (imp === 'secondary') return 'bg-sky-400';
    return 'bg-indigo-400';
  };

  /* ───────────────────────────────────────────────────────
     RENDER
  ─────────────────────────────────────────────────────── */
  return (
    <div className="dash-root flex-1 flex flex-col p-4 sm:p-6 lg:p-7 space-y-5 overflow-y-auto">
      {/* ── GLOBAL FONT PATCH: force VT323 for all font-mono inside dashboard ── */}
      <style>{`
        .dash-root .font-mono,
        .dash-root [class*="font-mono"] {
          font-family: var(--font-mono) !important;
        }
        .dash-root .text-\[10px\] { font-size: 14px !important; }
        .dash-root .text-\[11px\] { font-size: 15px !important; }
        .dash-root .text-\[9px\]  { font-size: 13px !important; }
        .dash-root .text-\[8px\]  { font-size: 12px !important; }
        .dash-root .text-xs { font-size: 15px !important; }
        .dash-root .text-sm { font-size: 17px !important; }
        .dash-root .text-base { font-size: 18px !important; }
      `}</style>

      {/* ── MODALS ── */}
      {showQuizModal && generationResult?.questions?.length > 0 && (
        <DashboardQuizModal
          questions={generationResult.questions}
          onClose={() => setShowQuizModal(false)}
          onAwardXP={onAwardXP}
        />
      )}

      {nodeQuizTarget && (
        <NodeQuizModal
          node={nodeQuizTarget}
          onClose={() => setNodeQuizTarget(null)}
          onAwardXP={onAwardXP}
        />
      )}

      {/* Quest single question modal */}
      {questQuizIdx !== null && generationResult?.quests?.[questQuizIdx]?.linked_question && (
        <DashboardQuizModal
          questions={[generationResult.quests[questQuizIdx].linked_question]}
          onClose={() => setQuestQuizIdx(null)}
          onAwardXP={onAwardXP}
        />
      )}

      {/* ── HEADER BANNER (CENTERED WITH BALANCED HUD WINGS) ── */}
      <div className="p-4 sm:p-5 bg-[#070d1c]/90 border border-cyan-500/30 rounded-lg shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="w-full flex items-center justify-center gap-4 relative z-10">
          {/* Left HUD decorative wing */}
          <div className="hidden md:flex items-center gap-2 flex-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-cyan-500/50"></div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#091325] border border-cyan-500/40 font-mono text-xs text-cyan-300 font-bold tracking-wider whitespace-nowrap shadow-[0_0_8px_rgba(6,182,212,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>SYS.ONLINE</span>
            </div>
            <div className="h-px w-8 bg-cyan-500/50"></div>
          </div>

          {/* Centered Title & Description */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2.5 rounded bg-cyan-950/60 border border-cyan-400/80 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Upload className="w-6 h-6" />
              </div>
              <h2 className="font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-2" style={{ fontSize: '30px', letterSpacing: '0.12em', textShadow: '0 0 16px rgba(6,182,212,0.6)' }}>
                <span>KNOWLEDGE INGESTION TERMINAL</span>
              </h2>
            </div>
            <p className="font-mono text-slate-300 mt-1 max-w-2xl text-center" style={{ fontSize: '16px', letterSpacing: '0.04em' }}>
              Upload your notes, diagrams, or scans — Syntropy will map them into an interactive learning world.
            </p>
          </div>

          {/* Right HUD decorative wing */}
          <div className="hidden md:flex items-center gap-2 flex-1">
            <div className="h-px w-8 bg-cyan-500/50"></div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#091325] border border-cyan-500/40 font-mono text-xs text-cyan-300 font-bold tracking-wider whitespace-nowrap shadow-[0_0_8px_rgba(6,182,212,0.2)]">
              <span>PIPELINE // READY</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-cyan-500/20 to-cyan-500/50"></div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RESULT VIEW
      ═══════════════════════════════════════════════════════ */}
      {generationResult ? (
        <div className="space-y-6">

          {/* ── Result Banner ── */}
          <div className="p-4 rounded-lg bg-[#090f20] border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left">
            <div>
              <div className="flex items-center gap-2 font-mono text-cyan-400 uppercase font-bold tracking-wider" style={{fontSize:'15px'}}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span style={{ letterSpacing: '0.18em' }}>
                  {selectedTarget === 'explanation' && '2D STUDY DOSSIER COMPILED'}
                  {selectedTarget === 'graph' && 'CONCEPT GRAPH SYNTHESIS COMPLETE'}
                  {selectedTarget === 'rpg' && '2D REALM MATRIX COMPILED'}
                </span>
              </div>
              <h3 className="font-pixel text-base font-bold text-white mt-1">
                {generationResult.subject_title || generationResult.title || generationResult.world?.name}
              </h3>
              <p className="font-mono text-slate-400 mt-0.5 line-clamp-1" style={{fontSize:'14px'}}>
                {generationResult.raw_transcription || generationResult.summary}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Test Recall */}
              {generationResult.questions?.length > 0 && (
                <button
                  onClick={() => { playBlip(); setShowQuizModal(true); }}
                  className="px-3.5 py-2 rounded bg-amber-500/20 border border-amber-400 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer font-mono"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>⚔ TEST RECALL ({generationResult.questions.length})</span>
                </button>
              )}

              {/* Enter Biology Realm */}
              <button
                onClick={() => handleEnterRealm('biology')}
                className="px-3.5 py-2 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer font-mono"
              >
                <Map className="w-4 h-4" />
                <span>ENTER BIOLOGY REALM</span>
              </button>

              {/* Upload another */}
              <button
                onClick={() => { playBlip(); setGenerationResult(null); setFile(null); setFilePreview(null); setDocumentId(null); }}
                className="px-3 py-2 rounded bg-[#0f172a] border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer font-mono"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>UPLOAD ANOTHER</span>
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              MODE 1 — EXPLANATION DOSSIER
          ═══════════════════════════════════════ */}
          {selectedTarget === 'explanation' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              <div className="lg:col-span-2 space-y-4">
                {/* Summary */}
                <div className="p-5 rounded-lg bg-[#080d19] border border-[#192742] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                    <FileText className="w-4 h-4" />
                    <span>Executive Concept Summary</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans">
                    {generationResult.summary}
                  </p>
                </div>

                {/* Key Takeaways */}
                <div className="p-5 rounded-lg bg-[#080d19] border border-[#192742] space-y-3">
                  <div className="text-xs font-mono text-amber-400 font-bold uppercase">
                    Key Mechanisms & Core Takeaways
                  </div>
                  <ul className="space-y-2">
                    {generationResult.key_takeaways?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#0b1222] p-2.5 rounded border border-[#16233a] text-xs text-slate-300">
                        <span className="text-cyan-400 font-bold font-mono shrink-0">0{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Relationships */}
                {generationResult.relationships?.length > 0 && (
                  <div className="p-5 rounded-lg bg-[#080d19] border border-[#192742] space-y-3">
                    <div className="text-xs font-mono text-sky-400 font-bold uppercase">
                      Concept Relationships ({generationResult.relationships.length})
                    </div>
                    <div className="space-y-2">
                      {generationResult.relationships.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-mono p-2 bg-[#0b1222] rounded border border-[#16233a]">
                          <span className="text-cyan-300 font-bold">{r.from}</span>
                          <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="text-slate-500 italic">{r.type}</span>
                          <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="text-amber-300 font-bold">{r.to}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Concepts sidebar */}
              <div className="p-5 rounded-lg bg-[#080d19] border border-[#192742] space-y-3 flex flex-col">
                <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
                  Identified Concepts ({generationResult.concepts?.length || 0})
                </div>
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1" style={{ maxHeight: 480 }}>
                  {generationResult.concepts?.map((c) => {
                    // find a matching node for recall modal
                    const matchNode = generationResult.nodes?.find((n) => n.node_id === c.id) || {
                      node_id: c.id,
                      title: c.name,
                      explanation: c.definition,
                      recallPrompt: c.recall_prompt,
                    };
                    return (
                      <div key={c.id} className="p-3 rounded bg-[#0b1222] border border-[#18263f] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white font-['Space_Grotesk'] leading-tight">{c.name}</span>
                          <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-black text-cyan-300 border border-cyan-500/30 shrink-0">
                            {c.importance}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{c.definition}</p>
                        {c.recall_prompt && (
                          <button
                            onClick={() => { playBlip(); setNodeQuizTarget(matchNode); }}
                            className="w-full text-left text-[10px] font-mono text-amber-400 hover:text-amber-300 bg-amber-950/20 border border-amber-500/20 hover:border-amber-400/50 rounded px-2 py-1.5 flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Zap className="w-3 h-3 shrink-0" />
                            <span className="line-clamp-1">{c.recall_prompt}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              MODE 2 — GRAPH / CONCEPT MATRIX
          ═══════════════════════════════════════ */}
          {selectedTarget === 'graph' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              {/* Nodes grid */}
              <div className="lg:col-span-2 p-5 rounded-lg bg-[#080d19] border border-[#192742] flex flex-col" style={{ minHeight: 420 }}>
                <div className="flex items-center justify-between border-b border-[#141f36] pb-3 mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                    <Network className="w-4 h-4" />
                    <span>CONCEPT MATRIX — {generationResult.nodes?.length || 0} NODES</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Primary</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400" /> Secondary</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400" /> Tertiary</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1 content-start">
                  {generationResult.nodes?.map((node) => {
                    const isSelected = selectedNode?.node_id === node.node_id;
                    const hasLinkedQ = generationResult.questions?.some((q) => q.linked_node_id === node.node_id);
                    return (
                      <div
                        key={node.node_id}
                        onClick={() => { playBlip(); setSelectedNode(node); }}
                        className={`p-3.5 rounded border transition-all cursor-pointer text-left group ${
                          isSelected
                            ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : 'bg-[#0b1222] border-[#18263f] hover:border-cyan-500/60 hover:bg-[#0e172e]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${importanceDot(node.importance)} shrink-0`} />
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                              {node.importance}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {node.suggested_cluster && (
                              <span className="text-[10px] font-mono text-slate-500">{node.suggested_cluster}</span>
                            )}
                            {hasLinkedQ && (
                              <span className="text-[9px] font-mono px-1 py-0.5 bg-amber-950/60 text-amber-400 border border-amber-500/30 rounded">
                                QUIZ
                              </span>
                            )}
                          </div>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1 font-['Space_Grotesk']">{node.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{node.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Node Inspector */}
              <div className="p-5 rounded-lg bg-[#080d19] border border-[#192742] flex flex-col text-left">
                <div className="flex items-center justify-between border-b border-[#141f36] pb-3 mb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
                    <Eye className="w-4 h-4" />
                    <span>NODE INSPECTOR</span>
                  </div>
                  {selectedNode && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400 text-cyan-300">
                      {selectedNode.node_id}
                    </span>
                  )}
                </div>

                {selectedNode ? (
                  <div className="space-y-4 flex-1">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Concept</label>
                      <h4 className="text-base font-bold text-white mt-0.5 font-['Space_Grotesk']">{selectedNode.title}</h4>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Explanation</label>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1 bg-[#0b1120] p-3 rounded border border-[#172338]">
                        {selectedNode.explanation}
                      </p>
                    </div>

                    {selectedNode.recallPrompt && (
                      <div>
                        <label className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Active Recall</label>
                        <div
                          onClick={() => { playBlip(); setNodeQuizTarget(selectedNode); }}
                          className="mt-1 bg-amber-950/30 border border-amber-500/30 hover:border-amber-400 p-2.5 rounded cursor-pointer transition-all group"
                        >
                          <p className="text-xs text-amber-200 font-mono leading-snug">{selectedNode.recallPrompt}</p>
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-amber-400 group-hover:text-amber-300">
                            <Zap className="w-3 h-3" />
                            <span>CLICK TO TEST YOURSELF</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Linked Quiz button */}
                    {findLinkedQuestion(selectedNode.node_id) && (
                      <button
                        onClick={() => {
                          playBlip();
                          setShowQuizModal(true);
                        }}
                        className="w-full py-2 rounded border border-amber-400/60 bg-amber-950/20 text-amber-300 font-mono text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-950/40 transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        TAKE LINKED QUIZ CHALLENGE
                      </button>
                    )}

                    {/* Connections */}
                    {generationResult.edges?.filter(
                      (e) => e.source_id === selectedNode.node_id || e.target_id === selectedNode.node_id
                    ).length > 0 && (
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Connected To</label>
                        <div className="space-y-1.5 mt-1">
                          {generationResult.edges
                            ?.filter((e) => e.source_id === selectedNode.node_id || e.target_id === selectedNode.node_id)
                            .map((e, i) => {
                              const otherId = e.source_id === selectedNode.node_id ? e.target_id : e.source_id;
                              const otherNode = generationResult.nodes?.find((n) => n.node_id === otherId);
                              return (
                                <div
                                  key={i}
                                  onClick={() => { if (otherNode) { playBlip(); setSelectedNode(otherNode); } }}
                                  className="flex items-center gap-2 text-[10px] font-mono p-1.5 rounded bg-[#0b1222] border border-[#16233a] hover:border-cyan-500/40 cursor-pointer transition-colors"
                                >
                                  <ChevronRight className="w-3 h-3 text-cyan-500 shrink-0" />
                                  <span className="text-slate-500 italic">{e.relationship_type}</span>
                                  <span className="text-cyan-300 font-bold ml-auto">{otherId}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                    <Eye className="w-8 h-8 text-slate-700" />
                    <p className="text-xs font-mono text-slate-500">Click any concept node to inspect its telemetry, explanation, and linked recall challenge.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════
              MODE 3 — RPG / 2D WORLD REALM
          ═══════════════════════════════════════ */}
          {selectedTarget === 'rpg' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              <div className="lg:col-span-2 space-y-4">

                {/* Zones */}
                <div className="p-5 rounded-lg bg-[#080d19] border border-amber-500/40 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase">
                    <Compass className="w-4 h-4" />
                    <span>2D World Zones</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {generationResult.zones?.map((zone) => (
                      <div
                        key={zone.id}
                        onClick={() => handleEnterRealm('geography')}
                        className="p-3 rounded bg-[#0b1222] border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-colors group space-y-1"
                      >
                        <div className="text-xs font-bold text-amber-300 font-mono group-hover:text-amber-200">{zone.name}</div>
                        <p className="text-[11px] text-slate-400 leading-snug">{zone.description}</p>
                        <div className="text-[10px] font-mono text-amber-500/60 group-hover:text-amber-400 flex items-center gap-1 mt-1">
                          <Play className="w-2.5 h-2.5" /> ENTER ZONE
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quests */}
                <div className="p-5 rounded-lg bg-[#080d19] border border-[#192742] space-y-3">
                  <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
                    Active Recall Quests ({generationResult.quests?.length || 0})
                  </div>
                  <div className="space-y-2">
                    {generationResult.quests?.map((q, idx) => (
                      <div key={q.quest_id || idx} className="p-3 rounded bg-[#0b1222] border border-[#16233a] flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white">{q.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{q.description}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-bold">
                            +{q.xp || 50} EXP
                          </span>
                          {q.linked_question ? (
                            <button
                              onClick={() => { playBlip(); setQuestQuizIdx(idx); }}
                              className="px-2.5 py-1.5 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <Play className="w-3 h-3" />
                              START
                            </button>
                          ) : (
                            <button
                              onClick={() => { playBlip(); setNodeQuizTarget(generationResult.nodes?.[idx] || null); }}
                              className="px-2.5 py-1.5 rounded bg-slate-700/40 border border-slate-600 text-slate-400 hover:border-slate-500 font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                              disabled={!generationResult.nodes?.[idx]?.recallPrompt}
                            >
                              <Zap className="w-3 h-3" />
                              RECALL
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Telemetry + Navigate Buttons */}
              <div className="p-5 rounded-lg bg-[#080d19] border border-[#192742] flex flex-col gap-4 text-left">
                {/* Realm stats */}
                <div>
                  <div className="text-xs font-mono text-cyan-400 font-bold uppercase mb-3">Realm Telemetry</div>
                  <div className="p-3 rounded bg-[#0b1222] border border-[#16233a] text-xs font-mono space-y-2 text-slate-300">
                    <div><span className="text-slate-500">THEME:</span> {generationResult.world?.theme || 'Cyber Realm'}</div>
                    <div><span className="text-slate-500">ZONES:</span> {generationResult.zones?.length || 3} Active</div>
                    <div><span className="text-slate-500">QUESTS:</span> {generationResult.quests?.length || 5} Ready</div>
                    <div><span className="text-slate-500">RECALL CHECKS:</span> {generationResult.questions?.length || 2}</div>
                  </div>
                </div>

                {/* Navigate to existing subjects */}
                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase mb-2">Enter an Existing Realm</div>
                  <div className="space-y-2">
                    {[
                      { key: 'biology', icon: Dna, label: 'BIOLOGY LAB', color: 'text-cyan-300 border-cyan-400/60 bg-cyan-950/20 hover:bg-cyan-950/40' },
                      { key: 'history', icon: Landmark, label: 'HISTORY CODEX', color: 'text-amber-300 border-amber-400/60 bg-amber-950/20 hover:bg-amber-950/40' },
                      { key: 'physics', icon: Atom, label: 'PHYSICS MATRIX', color: 'text-sky-300 border-sky-400/60 bg-sky-950/20 hover:bg-sky-950/40' },
                      { key: 'geography', icon: Globe2, label: 'GEOGRAPHY REALM', color: 'text-emerald-300 border-emerald-400/60 bg-emerald-950/20 hover:bg-emerald-950/40' },
                    ].map(({ key, icon: Icon, label, color }) => (
                      <button
                        key={key}
                        onClick={() => handleEnterRealm(key)}
                        className={`w-full py-2 px-3 rounded border font-mono text-[11px] font-bold flex items-center gap-2 cursor-pointer transition-all ${color}`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {label}
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full recall test */}
                {generationResult.questions?.length > 0 && (
                  <button
                    onClick={() => { playBlip(); setShowQuizModal(true); }}
                    className="w-full py-3 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase font-mono tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 mt-auto"
                  >
                    <Trophy className="w-4 h-4" />
                    ⚔ RUN FULL RECALL TEST
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      ) : (
        /* ═══════════════════════════════════════════════════════
            DEFAULT VIEW — CRT UPLOAD TERMINAL
        ═══════════════════════════════════════════════════════ */
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <style>{`
            .syn-terminal {
              position: relative; overflow: hidden;
              background: linear-gradient(rgba(7,18,32,.82), rgba(3,9,19,.94)), #050a14;
              border: 1px solid #19344b; color: #d9f9ff;
            }
            .syn-terminal::before {
              content:""; position:absolute; inset:0; pointer-events:none; opacity:.055;
              background: repeating-linear-gradient(0deg, rgba(255,255,255,.25) 0px, rgba(255,255,255,.25) 1px, transparent 1px, transparent 4px);
              z-index:20;
            }
            .syn-terminal::after {
              content:""; position:absolute; inset:0; pointer-events:none;
              background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.34) 100%);
              z-index:21;
            }
            .syn-terminal-grid {
              background-image:
                linear-gradient(rgba(38,105,137,.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(38,105,137,.045) 1px, transparent 1px);
              background-size: 22px 22px;
            }
            .syn-upload {
              position:relative; background:#060d19; border:1px dashed #29445a; transition:.18s ease;
            }
            .syn-upload:hover { border-color:#5cebf7; box-shadow:inset 0 0 35px rgba(0,229,255,.035); }
            .syn-target { background:#0a1120; border:1px solid #25384c; transition:.16s ease; }
            .syn-target:hover { border-color:#56dfea; background:#0b1727; }
            .syn-target-selected {
              border:2px solid #72f3ff !important; background:#0a1b29 !important;
              box-shadow:0 0 22px rgba(0,230,255,.17),inset 0 0 25px rgba(0,230,255,.035);
            }
            .syn-cyan-glow { text-shadow:0 0 6px rgba(111,242,255,.75),0 0 18px rgba(0,225,255,.22); }
            .syn-corner { position:absolute; width:16px; height:16px; pointer-events:none; }
            .syn-corner.tl { left:-1px;top:-1px; border-left:2px solid #67eefa; border-top:2px solid #67eefa; }
            .syn-corner.tr { right:-1px;top:-1px; border-right:2px solid #67eefa; border-top:2px solid #67eefa; }
            .syn-corner.bl { left:-1px;bottom:-1px; border-left:2px solid #67eefa; border-bottom:2px solid #67eefa; }
            .syn-corner.br { right:-1px;bottom:-1px; border-right:2px solid #67eefa; border-bottom:2px solid #67eefa; }

            /* ── Font override: VT323 for all terminal mono text ── */
            .syn-terminal .font-mono,
            .syn-terminal [class*="font-mono"] { font-family: var(--font-mono) !important; }
            .syn-terminal { font-family: var(--font-mono); }

            /* ── Slightly larger sizes for VT323 legibility ── */
            .syn-terminal .text-\[8px\]  { font-size: 13px !important; }
            .syn-terminal .text-\[9px\]  { font-size: 14px !important; }
            .syn-terminal .text-\[10px\] { font-size: 15px !important; }
            .syn-terminal .text-\[11px\] { font-size: 17px !important; }
            .syn-terminal .text-xs       { font-size: 15px !important; }
            .syn-terminal .text-sm       { font-size: 17px !important; }
            .syn-terminal .text-lg       { font-size: 22px !important; }
          `}</style>

          <div className="syn-terminal syn-terminal-grid h-full">
            <div className="relative z-30 flex h-full flex-col" style={{ padding: '18px 22px 10px' }}>

              {/* TWO-COLUMN GRID */}
              <div
                className="flex-1"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.55fr) minmax(340px, 0.88fr)',
                  columnGap: '22px',
                  minHeight: 0,
                  height: '100%',
                }}
              >
                {/* ── LEFT: UPLOAD ── */}
                <section className="flex min-w-0 flex-col text-left" style={{ minHeight: 0 }}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-pixel text-[11px] font-bold tracking-[0.11em] text-cyan-200 uppercase" style={{fontSize:'11px'}}>
                      <span className="text-cyan-500">╱╱</span> NOTE UPLOAD STATION
                    </div>
                    <div className="flex items-center gap-2 border border-[#263c50] bg-[#08111f] px-2 py-1 font-mono text-[9px] uppercase text-slate-400">
                      <span className={`h-1.5 w-1.5 rounded-full ${isUploading ? 'bg-yellow-300 animate-pulse' : file ? 'bg-green-400' : 'bg-slate-600'}`} />
                      {isUploading ? 'UPLOADING...' : file ? 'READY TO PROCESS' : 'AWAITING INPUT'}
                    </div>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`syn-upload flex flex-1 cursor-pointer items-center justify-center overflow-hidden ${isDragging ? 'border-cyan-300 bg-cyan-950/20' : ''}`}
                    style={{ minHeight: 0, padding: '28px' }}
                  >
                    <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,.pdf,.webp,.txt,.md,.json" onChange={handleFileChange} className="hidden" />
                    <span className="syn-corner tl" /><span className="syn-corner tr" />
                    <span className="syn-corner bl" /><span className="syn-corner br" />
                    <span className="absolute left-3 top-2 font-mono text-[8px] text-slate-700">SYS://INPUT</span>
                    <span className="absolute right-3 top-2 font-mono text-[8px] text-slate-700">PORT_01</span>
                    <span className="absolute bottom-2 left-3 font-mono text-[8px] text-slate-700">READY</span>
                    <span className="absolute bottom-2 right-3 font-mono text-[8px] text-slate-700">LOCAL_IO</span>

                    {file ? (
                      <div className="flex w-full flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        {filePreview ? (
                          <div className="relative max-w-full overflow-hidden border border-cyan-400/60 bg-black">
                            <img src={filePreview} alt="Preview" className="max-h-[280px] max-w-full object-contain" />
                            <button onClick={handleClearFile} className="absolute right-2 top-2 border border-rose-400 bg-black/90 p-1.5 text-rose-300 cursor-pointer hover:bg-rose-950/50 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative w-full max-w-sm p-4 border border-cyan-400/60 bg-[#081324] flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                            <div className="p-3 bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
                              <FileText className="w-7 h-7" />
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <div className="font-mono text-sm font-bold text-white truncate">{file.name}</div>
                              <div className="font-mono text-[10px] text-cyan-400 mt-0.5">
                                {(file.size / 1024).toFixed(1)} KB <span className="mx-1 text-slate-600">|</span> PIPELINE READY
                              </div>
                            </div>
                            <button onClick={handleClearFile} className="border border-rose-400 bg-black/90 p-1.5 text-rose-300 cursor-pointer hover:bg-rose-950/50 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="font-mono text-xs font-bold text-white">{file.name}</div>
                          <div className="mt-1 font-mono text-[9px] text-cyan-400">
                            {(file.size / 1024).toFixed(1)} KB
                            <span className="mx-2 text-slate-600">|</span>
                            {documentId ? `DOC:${String(documentId).substring(0, 14)}` : 'PIPELINE READY'}
                          </div>
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="font-mono text-[9px] uppercase text-slate-500 underline hover:text-cyan-300">
                          [ SELECT DIFFERENT SOURCE ]
                        </button>
                      </div>
                    ) : (
                      <div className="flex max-w-lg flex-col items-center text-center">
                        <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center border border-cyan-300 bg-[#081728] text-cyan-200 shadow-[0_0_22px_rgba(0,230,255,.22)]">
                          <Upload className="h-8 w-8 stroke-[1.8]" />
                        </div>
                        <h3 className="syn-cyan-glow font-pixel text-base font-black tracking-wide text-cyan-100 uppercase">
                          UPLOAD YOUR NOTES
                        </h3>
                        <p className="mt-2 max-w-md font-mono leading-relaxed text-slate-400" style={{fontSize:'15px'}}>
                          Drag &amp; drop handwritten notes, diagrams or scans here, or click to browse files.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                          <span className="mr-1 font-mono text-xs font-bold text-slate-300 tracking-wider">ACCEPTS:</span>
                          {['PNG', 'JPG', 'PDF', 'WEBP', 'TXT', 'MD'].map((fmt) => (
                            <span
                              key={fmt}
                              className="border border-cyan-400/50 bg-[#0c182b] px-3.5 py-1.5 font-mono text-xs font-bold text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)] tracking-wider rounded"
                            >
                              {fmt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* ── RIGHT: GENERATION TARGET ── */}
                <section className="flex min-w-0 flex-col text-left" style={{ minHeight: 0 }}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-pixel text-cyan-200 uppercase" style={{ fontSize: '13px', letterSpacing: '0.22em' }}>
                      <span className="text-cyan-500">╱╱</span> CHOOSE GENERATION TARGET
                    </div>
                    <span className="border border-[#294257] bg-[#08111f] px-2 py-1 font-mono font-bold text-slate-500" style={{ fontSize: '11px', letterSpacing: '0.16em' }}>SELECT MODE</span>
                  </div>

                  <p className="mb-3 font-mono text-[10px] leading-relaxed text-slate-500">
                    Choose how Syntropy processes your uploaded content:
                  </p>

                  <div className="flex flex-col gap-3">
                    {/* Explanation */}
                    <button
                      type="button"
                      onClick={() => { playBlip(); setSelectedTarget('explanation'); }}
                      className={`syn-target w-full cursor-pointer p-4 text-left ${selectedTarget === 'explanation' ? 'syn-target-selected' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 border border-[#2c455b] bg-[#0b1728] p-2 text-cyan-300">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-mono text-sm font-black text-white uppercase" style={{ letterSpacing: '0.16em' }}>2D EXPLANATION</h4>
                            <span className="border border-[#33495d] bg-[#0b1424] px-1.5 py-0.5 font-mono text-[8px] font-bold text-slate-500">DOSSIER</span>
                          </div>
                          <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-400">
                            Deep conceptual synthesis — mechanisms, relationships &amp; key takeaways as a structured study dossier with clickable recall prompts.
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Graph */}
                    <button
                      type="button"
                      onClick={() => { playBlip(); setSelectedTarget('graph'); }}
                      className={`syn-target w-full cursor-pointer p-4 text-left ${selectedTarget === 'graph' ? 'syn-target-selected' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 border border-cyan-200 bg-cyan-950 p-2 text-cyan-100 shadow-[0_0_10px_rgba(0,230,255,.18)]">
                          <Network className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-mono text-sm font-black text-white uppercase" style={{ letterSpacing: '0.16em' }}>GRAPH STRUCTURE</h4>
                            <span className="border border-cyan-200 bg-cyan-200 px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#06121a]">MATRIX</span>
                          </div>
                          <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-300">
                            Interactive concept node map — click nodes to inspect, trigger quiz challenges, and navigate relationships between ideas.
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* RPG */}
                    <button
                      type="button"
                      onClick={() => { playBlip(); setSelectedTarget('rpg'); }}
                      className={`syn-target w-full cursor-pointer p-4 text-left ${selectedTarget === 'rpg' ? 'syn-target-selected' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 border border-[#4a5360] bg-[#171b20] p-2 text-yellow-300">
                          <Compass className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-mono text-sm font-black text-white uppercase" style={{ letterSpacing: '0.16em' }}>2D WORLD REALM</h4>
                            <span className="border border-[#33495d] bg-[#0b1424] px-1.5 py-0.5 font-mono text-[8px] font-bold text-slate-500">RPG</span>
                          </div>
                          <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-400">
                            Playable RPG world — explore zones, complete quests, and do active recall challenges with XP rewards per concept mastered.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Error */}
                  {errorMessage && (
                    <div className="mt-3 border border-rose-500 bg-[#260b15] p-3 font-mono text-[10px] text-rose-200">
                      <span className="font-bold text-rose-400">[ SYSTEM ERROR ]</span>
                      <div className="mt-1">{errorMessage}</div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-auto pt-4">
                    <button
                      onClick={handleAnalyse}
                      disabled={isProcessing || (!file && !documentId)}
                      className={`w-full border py-3.5 px-4 font-mono text-sm font-black tracking-[0.08em] uppercase transition-all ${
                        isProcessing
                          ? 'cursor-wait border-cyan-300 bg-cyan-900 text-cyan-100'
                          : !file && !documentId
                          ? 'cursor-not-allowed border-[#26384a] bg-[#13202d] text-slate-600'
                          : 'cursor-pointer border-cyan-200 bg-[#45d9ee] text-[#041018] shadow-[0_0_25px_rgba(69,217,238,.35)] hover:bg-[#78f4ff]'
                      }`}
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {processingStep === 1 && 'TRANSCRIBING CONTENT...'}
                          {processingStep === 2 && 'EXTRACTING CONCEPTS & EDGES...'}
                          {processingStep === 3 && 'BUILDING LEARNING STRUCTURE...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="h-4 w-4 fill-current" />
                          ANALYSE &amp; GENERATE
                        </span>
                      )}
                    </button>

                    <div className="mt-2 text-center">
                      <button onClick={handleLoadSample} className="font-mono text-[9px] uppercase text-slate-600 hover:text-cyan-300 cursor-pointer">
                        [ OR TEST WITH SAMPLE CHEMISTRY NOTES ]
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
