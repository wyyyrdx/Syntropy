import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Zap,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Atom,
  Flame,
  Layers,
  Compass,
  Crosshair,
  Award,
  Info,
  Sliders,
  X,
  ArrowRight,
  Eye,
  BookOpen,
  Volume2,
  Grid,
  Shield,
  GitBranch,
  CheckCheck
} from 'lucide-react';
import { retroAudio } from '../audio/retroAudio';
import confetti from 'canvas-confetti';

/* ─────────────────────────────────────────────────────────────
   CANVAS WORLD CONSTANTS & HELPERS
───────────────────────────────────────────────────────────── */
const CANVAS_W = 1050;
const CANVAS_H = 680;

function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

// Text wrapping helper for Canvas
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  if (!text) return;
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && n > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + '…', x, currentY);
        return;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

// Cubic bezier point calculation
function bezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

/* ─────────────────────────────────────────────────────────────
   2D SCIENTIFIC & TECHNICAL DIAGRAM ENGINES
───────────────────────────────────────────────────────────── */
function drawRoundRect(ctx, x, y, w, h, r = 6) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

function drawHexagon(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const hx = x + r * Math.cos(a);
    const hy = y + r * Math.sin(a);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawBondLine(ctx, x1, y1, x2, y2, color = '#38bdf8', width = 2.5) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawDoubleBond(ctx, x1, y1, x2, y2, color = '#10b981', offset = 4) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * offset;
  const ny = (dx / len) * offset;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(x1 + nx, y1 + ny);
  ctx.lineTo(x2 + nx, y2 + ny);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x1 - nx, y1 - ny);
  ctx.lineTo(x2 - nx, y2 - ny);
  ctx.stroke();
}

function drawAtomBadge(ctx, x, y, label, color = '#38bdf8', isHighlight = false) {
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fillStyle = isHighlight ? 'rgba(244, 63, 94, 0.22)' : 'rgba(15, 23, 42, 0.95)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = isHighlight ? 2 : 1.5;
  ctx.stroke();

  ctx.font = '700 11px monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);
  ctx.textBaseline = 'alphabetic';
}

function drawOrbitalLobe(ctx, x, y, w, h, fillCol, strokeCol, sign) {
  ctx.save();
  ctx.fillStyle = fillCol;
  ctx.strokeStyle = strokeCol;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 11px monospace';
  ctx.fillStyle = strokeCol;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sign, x, y);
  ctx.restore();
}

function drawCurvedElectronArrow(ctx, startX, startY, endX, endY, cpX, cpY, color, tick) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 4]);
  ctx.lineDashOffset = -tick * 0.9;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(cpX, cpY, endX, endY);
  ctx.stroke();
  ctx.setLineDash([]);

  const angle = Math.atan2(endY - cpY, endX - cpX);
  const headLen = 10;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - headLen * Math.cos(angle - Math.PI / 6),
    endY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    endX - headLen * Math.cos(angle + Math.PI / 6),
    endY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

function drawIon(ctx, x, y, label, color) {
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '700 9px monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);
  ctx.textBaseline = 'alphabetic';
}

function detectDiagramDomain(node, data) {
  const text = `${node?.title || ''} ${node?.explanation || ''} ${node?.cluster || ''} ${data?.subject_title || ''} ${data?.raw_transcription || ''} ${data?.summary || ''}`.toLowerCase();

  // 1. Chemistry / Organic Chemistry / Reactions
  if (
    text.includes('alkene') || text.includes('alcohol') || text.includes('acid') ||
    text.includes('dehydration') || text.includes('carbocation') || text.includes('bromine') ||
    text.includes('saytzeff') || text.includes('zaitsev') || text.includes('catalyst') ||
    text.includes('proton') || text.includes('oxonium') || text.includes('ester') ||
    text.includes('addition') || text.includes('elimination') || text.includes('lewis') ||
    text.includes('organic chemistry') || text.includes('unsaturation') || text.includes('reaction')
  ) {
    return 'chemistry';
  }

  // 2. Data Engineering / Entity Resolution / ML / Databases
  if (
    text.includes('entity') || text.includes('resolution') || text.includes('blocking') ||
    text.includes('jaccard') || text.includes('jaro') || text.includes('tsv') ||
    text.includes('csv') || text.includes('record') || text.includes('deduplicat') ||
    text.includes('golden') || text.includes('classifier') || text.includes('pairwise') ||
    text.includes('clustering') || text.includes('similarity') || text.includes('database') ||
    text.includes('pipeline') || text.includes('hash') || text.includes('token')
  ) {
    return 'data_pipeline';
  }

  // 3. Biology / Cellular Physiology / Neuroscience
  if (
    text.includes('membrane') || text.includes('phospholipid') || text.includes('bilayer') ||
    text.includes('cell') || text.includes('neuron') || text.includes('action potential') ||
    text.includes('atp') || text.includes('mitochondria') || text.includes('ion channel') ||
    text.includes('sodium') || text.includes('potassium') || text.includes('depolariz') ||
    text.includes('dna') || text.includes('rna') || text.includes('synapse') ||
    text.includes('biology') || text.includes('enzyme')
  ) {
    return 'biology';
  }

  // 4. Physics / Quantum / Electromagnetism / Atoms
  if (
    text.includes('atom') || text.includes('bohr') || text.includes('orbital') ||
    text.includes('photon') || text.includes('quantum') || text.includes('electron') ||
    text.includes('emission') || text.includes('spectral') || text.includes('spectrum') ||
    text.includes('energy level') || text.includes('rydberg') || text.includes('electromagnet') ||
    text.includes('physics') || text.includes('optics') || text.includes('wavelength')
  ) {
    return 'physics';
  }

  return 'system';
}

function getDomainStages(domain, node, data) {
  const title = String(node?.title || 'Concept');
  if (domain === 'chemistry') {
    return [
      {
        stage: 'Stage 1: Protonation & Activation',
        detail: `Electrophilic attack by acid catalyst (H⁺) on the substrate oxygen lone pair, converting the poor leaving group (-OH) into a reactive oxonium ion [R-OH₂⁺].`
      },
      {
        stage: 'Stage 2: Carbocation Intermediate',
        detail: `Heterolytic cleavage of the C-O bond eliminates neutral H₂O, generating a planar sp² carbocation intermediate with empty p-orbitals awaiting elimination.`
      },
      {
        stage: 'Stage 3: Elimination & Alkene Formation',
        detail: `A conjugate base abstracts the adjacent β-hydrogen, causing electron pair collapse into a stable C=C π-bond (Saytzeff product), confirmed via rapid Br₂ decolorization.`
      }
    ];
  }
  if (domain === 'data_pipeline') {
    return [
      {
        stage: 'Stage 1: Inverted Hash Blocking',
        detail: `Raw dirty records are parsed and partitioned into hash buckets via phonetic/token keys, slashing candidate comparison complexity from O(N²) down to isolated candidate subsets.`
      },
      {
        stage: 'Stage 2: Metric Distance & Classification',
        detail: `Candidate pairs evaluate multi-attribute similarity vectors (Jaro-Winkler for names, Jaccard for tokens, Levenshtein for IDs) through a tuned machine learning decision threshold.`
      },
      {
        stage: 'Stage 3: Clustering & Golden Entity Synthesis',
        detail: `Connected components in the similarity graph are merged into canonical Golden Entity Records with verified provenance, attribute aggregation, and deduplication.`
      }
    ];
  }
  if (domain === 'biology') {
    return [
      {
        stage: 'Stage 1: Resting Potential & Gradient',
        detail: `Phospholipid bilayer maintains strict electrochemical polarization (-70 mV) via high extracellular Na⁺ and high intracellular K⁺ resting distribution.`
      },
      {
        stage: 'Stage 2: Gating & Depolarizing Influx',
        detail: `Threshold stimulus triggers conformational opening of voltage-gated Na⁺ channels; massive rapid sodium influx drives membrane potential spike up to +30 mV.`
      },
      {
        stage: 'Stage 3: Active Repolarization & Pump',
        detail: `Voltage-gated K⁺ efflux repolarizes the membrane, while Na⁺/K⁺-ATPase pumps actively hydrolyze ATP to restore baseline ionic gradients (3 Na⁺ out, 2 K⁺ in).`
      }
    ];
  }
  if (domain === 'physics') {
    return [
      {
        stage: 'Stage 1: Bound Quantized Ground State',
        detail: `Electrons occupy discrete, quantized Bohr orbital radii where orbital angular momentum is an integer multiple of ℏ, stabilized in the ground potential well (n=1).`
      },
      {
        stage: 'Stage 2: Resonant Photon Excitation',
        detail: `Incident electromagnetic wavepacket of precise energy (ΔE = hν) resonates with the bound electron, inducing a quantum leap across forbidden gaps into higher shell (n=3).`
      },
      {
        stage: 'Stage 3: Radiative Spontaneous De-excitation',
        detail: `Excited electron cascades down to lower orbital (n=2), spontaneously radiating a discrete photon with characteristic spectral wavelength (Balmer emission series).`
      }
    ];
  }
  // System / General
  return [
    {
      stage: 'Stage 1: Ingestion & Signal Mapping',
      detail: `Initial state parameters and incoming signal precursors are buffered and mapped into functional memory registers for ${title}.`
    },
    {
      stage: 'Stage 2: Algorithmic Transformation',
      detail: node?.explanation || `Core logical execution pathway evaluates transformation rules across the active processing substrate.`
    },
    {
      stage: 'Stage 3: Verified Dispatch & Output',
      detail: `Resultant state matrices are validated against integrity constraints and propagated to downstream subscribers.`
    }
  ];
}

/* ── DOMAIN DRAWING METHOD: CHEMISTRY ── */
function drawChemistryDiagram(ctx, W, H, localTick, step, node, data, themeCol) {
  const cx = W / 2;
  const cy = H / 2 - 15;

  // Background style: Subtle hexagonal carbon ring lattice
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
  ctx.lineWidth = 1;
  const hexR = 24;
  for (let x = 40; x < W - 40; x += hexR * 3) {
    for (let y = 50; y < H - 80; y += hexR * 1.732) {
      drawHexagon(ctx, x, y, hexR);
    }
  }

  // Stage 0: Reactant Alcohol & Acid Catalyst Activation (Protonation)
  if (step === 0) {
    const molX = cx - 180;
    const molY = cy;

    ctx.fillStyle = 'rgba(11, 19, 36, 0.85)';
    ctx.fillRect(molX - 170, molY - 120, 340, 240);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(molX - 170, molY - 120, 340, 240);

    ctx.fillStyle = '#06b6d4';
    ctx.font = '700 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SUBSTRATE: ETHANOL / PROPAN-2-OL [R-OH]', molX - 155, molY - 98);

    const c1X = molX - 90, c1Y = molY + 10;
    const c2X = molX - 10, c2Y = molY - 20;
    const oX  = molX + 70, oY  = molY + 10;
    const hX  = molX + 120, hY = molY - 15;

    drawBondLine(ctx, c1X + 20, c1Y, c2X - 20, c2Y, '#38bdf8', 3);
    drawBondLine(ctx, c2X + 20, c2Y, oX - 18, oY, '#38bdf8', 3);
    drawBondLine(ctx, oX + 16, oY - 5, hX - 12, hY + 5, '#e2e8f0', 2);

    drawAtomBadge(ctx, c1X, c1Y, 'CH₃', '#38bdf8');
    drawAtomBadge(ctx, c2X, c2Y, 'CH₂', '#38bdf8');
    drawAtomBadge(ctx, oX, oY, ':Ö:', '#f43f5e', true);
    drawAtomBadge(ctx, hX, hY, 'H', '#e2e8f0');

    // Lone pair dots on Oxygen
    ctx.fillStyle = '#fb7185';
    const lpPulse = Math.sin(localTick * 0.1) * 1.5;
    ctx.beginPath();
    ctx.arc(oX - 4, oY - 16, 2.5 + lpPulse * 0.2, 0, Math.PI * 2);
    ctx.arc(oX + 4, oY - 16, 2.5 + lpPulse * 0.2, 0, Math.PI * 2);
    ctx.arc(oX - 14, oY - 6, 2.5, 0, Math.PI * 2);
    ctx.arc(oX - 14, oY + 4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Acid catalyst incoming proton H+ (from H2SO4)
    const acidX = cx + 220;
    const acidY = cy - 40;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(acidX - 110, acidY - 70, 220, 160);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(acidX - 110, acidY - 70, 220, 160);

    ctx.font = '700 11px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText('ACID CATALYST [H₂SO₄]', acidX, acidY - 48);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('H₂SO₄  ⇌  H⁺  +  HSO₄⁻', acidX, acidY - 26);

    const protonPulse = Math.sin(localTick * 0.08) * 4;
    ctx.beginPath();
    ctx.arc(acidX, acidY + 24, 22 + protonPulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(acidX, acidY + 24, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.font = '700 13px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('H⁺', acidX, acidY + 28);

    // Curved electron-pushing arrow
    drawCurvedElectronArrow(ctx, oX, oY - 18, acidX - 18, acidY + 20, cx + 40, cy - 110, '#f43f5e', localTick);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Oxygen lone pair attacks electrophilic H⁺ proton → Forms protonated oxonium ion [R-OH₂⁺]', cx, molY + 140);
  }

  // Stage 1: Leaving Group Cleavage & Carbocation Intermediate
  else if (step === 1) {
    const midX = cx - 60;
    const midY = cy;

    ctx.fillStyle = 'rgba(11, 19, 36, 0.9)';
    ctx.fillRect(midX - 180, midY - 125, 360, 250);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(midX - 180, midY - 125, 360, 250);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('INTERMEDIATE: PLANAR sp² CARBOCATION [C⁺]', midX - 165, midY - 100);

    const c1X = midX - 85, c1Y = midY + 15;
    const c2X = midX + 15, c2Y = midY + 15;

    drawBondLine(ctx, c1X + 20, c1Y, c2X - 20, c2Y, '#38bdf8', 3);
    drawAtomBadge(ctx, c1X, c1Y, 'CH₃', '#38bdf8');

    // Empty p-orbital lobes (dumbbell vertical)
    drawOrbitalLobe(ctx, c2X, c2Y - 38, 14, 32, 'rgba(245, 158, 11, 0.35)', 'rgba(245, 158, 11, 0.8)', '+');
    drawOrbitalLobe(ctx, c2X, c2Y + 38, 14, 32, 'rgba(6, 182, 212, 0.35)', 'rgba(6, 182, 212, 0.8)', '-');

    drawAtomBadge(ctx, c2X, c2Y, 'C⁺', '#f59e0b', true);

    drawBondLine(ctx, c2X, c2Y - 14, c2X, c2Y - 32, '#94a3b8', 1.5);

    // Leaving H2O molecule flying off to the right
    const waterX = cx + 220 + Math.sin(localTick * 0.05) * 6;
    const waterY = cy - 30;

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(c2X + 22, c2Y);
    ctx.lineTo(waterX - 45, waterY);
    ctx.stroke();
    ctx.setLineDash([]);

    drawCurvedElectronArrow(ctx, c2X + 35, c2Y - 8, waterX - 25, waterY - 15, (c2X + waterX) / 2, c2Y - 45, '#f43f5e', localTick);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(waterX - 50, waterY - 45, 100, 90);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(waterX - 50, waterY - 45, 100, 90);

    ctx.font = '700 10px monospace';
    ctx.fillStyle = '#06b6d4';
    ctx.textAlign = 'center';
    ctx.fillText('LEAVING GROUP', waterX, waterY - 26);
    drawAtomBadge(ctx, waterX, waterY + 6, 'H₂O', '#38bdf8');
    ctx.font = '9px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText(': neutral molecule', waterX, waterY + 32);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(midX - 160, midY + 70, 320, 36);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(midX - 160, midY + 70, 320, 36);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText('CARBOCATION STABILITY RANKING:', midX, midY + 84);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('3° (tertiary) > 2° (secondary) >> 1° (primary) [Hyperconjugation]', midX, midY + 98);
  }

  // Stage 2: Alkene Double Bond Formation & Bromine Test
  else {
    const pX = cx - 120;
    const pY = cy;

    ctx.fillStyle = 'rgba(11, 19, 36, 0.9)';
    ctx.fillRect(pX - 190, pY - 125, 380, 250);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(pX - 190, pY - 125, 380, 250);

    ctx.fillStyle = '#10b981';
    ctx.font = '700 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('ALKENE FORMATION: C=C DOUBLE BOND (π-SYSTEM)', pX - 175, pY - 100);

    const c1X = pX - 50, c1Y = pY + 5;
    const c2X = pX + 50, c2Y = pY + 5;

    drawDoubleBond(ctx, c1X + 16, c1Y, c2X - 16, c2Y, '#10b981', 5);

    const piPulse = Math.sin(localTick * 0.08) * 3;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
    ctx.beginPath();
    ctx.ellipse(pX, pY - 26, 52, 16 + piPulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(pX, pY + 36, 52, 16 + piPulse, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '700 9px monospace';
    ctx.fillStyle = '#6ee7b7';
    ctx.textAlign = 'center';
    ctx.fillText('π electron cloud', pX, pY - 24);

    drawAtomBadge(ctx, c1X, c1Y, 'C', '#10b981');
    drawAtomBadge(ctx, c2X, c2Y, 'C', '#10b981');

    drawBondLine(ctx, c1X - 12, c1Y - 10, c1X - 35, c1Y - 30, '#94a3b8', 2);
    drawAtomBadge(ctx, c1X - 45, c1Y - 38, 'H', '#cbd5e1');

    drawBondLine(ctx, c1X - 12, c1Y + 10, c1X - 35, c1Y + 30, '#38bdf8', 2);
    drawAtomBadge(ctx, c1X - 48, c1Y + 38, 'CH₃', '#38bdf8');

    drawBondLine(ctx, c2X + 12, c2Y - 10, c2X + 35, c2Y - 30, '#94a3b8', 2);
    drawAtomBadge(ctx, c2X + 45, c2Y - 38, 'H', '#cbd5e1');

    drawBondLine(ctx, c2X + 12, c2Y + 10, c2X + 35, c2Y + 30, '#38bdf8', 2);
    drawAtomBadge(ctx, c2X + 48, c2Y + 38, 'CH₃', '#38bdf8');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pX - 175, pY + 70, 350, 42);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(pX - 175, pY + 70, 350, 42);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('SAYTZEFF (ZAITSEV) ELIMINATION RULE:', pX, pY + 85);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('Major product has the most alkyl-substituted alkene core (high stability).', pX, pY + 100);

    const testX = cx + 210;
    const testY = cy;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(testX - 85, testY - 110, 170, 220);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(testX - 85, testY - 110, 170, 220);

    ctx.font = '700 10px monospace';
    ctx.fillStyle = '#f43f5e';
    ctx.textAlign = 'center';
    ctx.fillText('BROMINE (Br₂) TEST', testX, testY - 88);

    const ttX = testX;
    const ttY = testY - 15;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ttX - 14, ttY - 40);
    ctx.lineTo(ttX - 14, ttY + 30);
    ctx.arc(ttX, ttY + 30, 14, Math.PI, 0, true);
    ctx.lineTo(ttX + 14, ttY - 40);
    ctx.stroke();

    ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.beginPath();
    ctx.moveTo(ttX - 12, ttY);
    ctx.lineTo(ttX - 12, ttY + 30);
    ctx.arc(ttX, ttY + 30, 12, Math.PI, 0, true);
    ctx.lineTo(ttX + 12, ttY);
    ctx.closePath();
    ctx.fill();

    ctx.font = '700 9px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('RAPID DECOLORIZATION', testX, testY + 58);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Red-Brown Br₂ → Clear', testX, testY + 72);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('[UNSATURATION CONFIRMED]', testX, testY + 86);
  }
}

/* ── DOMAIN DRAWING METHOD: DATA PIPELINE / ENTITY RESOLUTION ── */
function drawDataPipelineDiagram(ctx, W, H, localTick, step, node, data, themeCol) {
  const cx = W / 2;
  const cy = H / 2 - 15;

  if (step === 0) {
    const rawX = cx - 240;
    const rawY = cy;

    ctx.fillStyle = 'rgba(11, 19, 36, 0.9)';
    ctx.fillRect(rawX - 150, rawY - 130, 300, 260);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(rawX - 150, rawY - 130, 300, 260);

    ctx.fillStyle = '#06b6d4';
    ctx.font = '700 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DIRTY SOURCE RECORDS [TSV / CSV]', rawX - 135, rawY - 105);

    const sampleRecords = [
      { id: 'REC-101', name: 'Apple Inc.', city: 'Cupertino, CA', tax: 'US-9429' },
      { id: 'REC-504', name: 'Apple Computer Co.', city: 'Cupertino', tax: 'N/A' },
      { id: 'REC-899', name: 'Microsoft Corp', city: 'Redmond, WA', tax: 'US-1150' }
    ];

    sampleRecords.forEach((r, idx) => {
      const ry = rawY - 75 + idx * 60;
      ctx.fillStyle = idx < 2 ? 'rgba(6, 182, 212, 0.12)' : 'rgba(30, 41, 59, 0.5)';
      ctx.fillRect(rawX - 135, ry, 270, 50);
      ctx.strokeStyle = idx < 2 ? '#06b6d4' : '#334155';
      ctx.strokeRect(rawX - 135, ry, 270, 50);

      ctx.font = '700 10px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`[${r.id}] ${r.name}`, rawX - 125, ry + 16);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Loc: ${r.city}  |  Tax: ${r.tax}`, rawX - 125, ry + 34);
    });

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.lineDashOffset = -localTick * 0.8;
    ctx.beginPath();
    ctx.moveTo(rawX + 150, rawY);
    ctx.lineTo(cx + 80, rawY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 50, rawY - 18, 100, 36);
    ctx.strokeStyle = '#06b6d4';
    ctx.strokeRect(cx - 50, rawY - 18, 100, 36);
    ctx.font = '700 9px monospace';
    ctx.fillStyle = '#22d3ee';
    ctx.textAlign = 'center';
    ctx.fillText('TOKEN / N-GRAM', cx, rawY - 3);
    ctx.fillText('HASH FUNCTION', cx, rawY + 11);

    const bX = cx + 220;
    const bY = cy;

    ctx.fillStyle = 'rgba(11, 19, 36, 0.9)';
    ctx.fillRect(bX - 140, bY - 130, 280, 260);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(bX - 140, bY - 130, 280, 260);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('INVERTED HASH BUCKETS', bX - 125, bY - 105);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.fillRect(bX - 125, bY - 80, 250, 75);
    ctx.strokeStyle = '#f59e0b';
    ctx.strokeRect(bX - 125, bY - 80, 250, 75);

    ctx.font = '700 10px monospace';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('BUCKET #42  [Key: "apple"]', bX - 115, bY - 60);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('-> Candidate Pair: (REC-101, REC-504)', bX - 115, bY - 42);
    ctx.fillStyle = '#10b981';
    ctx.fillText('STATUS: Pruned for distance check', bX - 115, bY - 24);

    ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.fillRect(bX - 125, bY + 10, 250, 60);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(bX - 125, bY + 10, 250, 60);

    ctx.font = '700 10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('BUCKET #89  [Key: "microsoft"]', bX - 115, bY + 30);
    ctx.font = '9px monospace';
    ctx.fillText('-> Singleton: (REC-899)', bX - 115, bY + 48);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bX - 125, bY + 82, 250, 36);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(bX - 125, bY + 82, 250, 36);
    ctx.font = '700 9px monospace';
    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'center';
    ctx.fillText('PAIR REDUCTION: O(N²) → O(N · B)', bX, bY + 96);
    ctx.fillText('99.8% UNNECESSARY CHECKS PRUNED', bX, bY + 109);
  } else if (step === 1) {
    const boxX = cx - 180;
    const boxY = cy;

    ctx.fillStyle = 'rgba(11, 19, 36, 0.9)';
    ctx.fillRect(boxX - 150, boxY - 130, 300, 260);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX - 150, boxY - 130, 300, 260);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MULTI-ATTRIBUTE SIMILARITY METRICS', boxX - 135, boxY - 105);

    const metrics = [
      { name: 'Jaro-Winkler (Name)', score: 0.94, valStr: '0.94' },
      { name: 'Jaccard Token (Address)', score: 0.88, valStr: '0.88' },
      { name: 'Tax ID Soft-Match', score: 0.70, valStr: '0.70' },
      { name: 'Domain Exact String', score: 1.00, valStr: '1.00' }
    ];

    metrics.forEach((m, idx) => {
      const my = boxY - 70 + idx * 46;
      ctx.font = '9px monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`${m.name}: ${m.valStr}`, boxX - 135, my);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(boxX - 135, my + 6, 270, 12);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(boxX - 135, my + 6, 270, 12);

      const barFill = m.score * 270;
      ctx.fillStyle = m.score >= 0.85 ? '#10b981' : '#f59e0b';
      ctx.fillRect(boxX - 135, my + 6, barFill, 12);
    });

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.lineDashOffset = -localTick * 0.8;
    ctx.beginPath();
    ctx.moveTo(boxX + 150, boxY);
    ctx.lineTo(cx + 80, boxY);
    ctx.stroke();
    ctx.setLineDash([]);

    const cX = cx + 220;
    const cY = cy;

    ctx.fillStyle = 'rgba(11, 19, 36, 0.9)';
    ctx.fillRect(cX - 140, cY - 130, 280, 260);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cX - 140, cY - 130, 280, 260);

    ctx.fillStyle = '#10b981';
    ctx.font = '700 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DECISION TREE CLASSIFIER', cX - 125, cY - 105);

    const dX = cX;
    const dY = cY - 30;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.moveTo(dX, dY - 35);
    ctx.lineTo(dX + 55, dY);
    ctx.lineTo(dX, dY + 35);
    ctx.lineTo(dX - 55, dY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '700 9px monospace';
    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'center';
    ctx.fillText('Sim > 0.82 ?', dX, dY + 3);

    ctx.font = '700 10px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('TRUE → MATCH LINK (w = 0.96)', dX, dY + 65);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cX - 120, cY + 80, 240, 36);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(cX - 120, cY + 80, 240, 36);

    ctx.font = '9px monospace';
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText('PREDICTED: SAME PHYSICAL ENTITY', cX, cY + 95);
    ctx.fillText('CONFIDENCE: 96.4% | FP RISK: <0.5%', cX, cY + 107);
  } else {
    const gX = cx;
    const gY = cy;

    ctx.fillStyle = 'rgba(11, 19, 36, 0.92)';
    ctx.fillRect(gX - 280, gY - 130, 560, 260);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(gX - 280, gY - 130, 560, 260);

    ctx.fillStyle = '#10b981';
    ctx.font = '700 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SYNTHESIZED CANONICAL "GOLDEN ENTITY" RECORD', gX - 260, gY - 105);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fillRect(gX - 260, gY - 90, 520, 42);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(gX - 260, gY - 90, 520, 42);

    ctx.font = '700 11px monospace';
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('MASTER ENTITY ID: [ENT-GOLDEN-042]', gX - 245, gY - 72);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CANONICAL NAME: Apple Inc.', gX - 245, gY - 56);

    const fields = [
      { label: 'Canonical Address', val: '1 Infinite Loop, Cupertino, CA 95014' },
      { label: 'Tax Identification', val: 'US-94294022 (Resolved from Rec #101)' },
      { label: 'Domain & Web URI', val: 'https://apple.com (100% verified)' },
      { label: 'Cluster Lineage', val: 'Merged Sources: [Rec #101 (Internal ERP), Rec #504 (Vendor CRM)]' }
    ];

    fields.forEach((f, idx) => {
      const fy = gY - 32 + idx * 30;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(gX - 260, fy, 520, 24);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(gX - 260, fy, 520, 24);

      ctx.font = '700 9px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${f.label}:`, gX - 250, fy + 16);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(f.val, gX - 90, fy + 16);
    });

    ctx.fillStyle = '#10b981';
    ctx.font = '700 10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('DEDUPLICATION STATUS: 2 RECORDS → 1 GOLDEN ENTITY (RESOLVED)', gX + 260, gY + 115);
  }
}

/* ── DOMAIN DRAWING METHOD: BIOLOGY / CELL MEMBRANE ── */
function drawBiologyDiagram(ctx, W, H, localTick, step, node, data, themeCol) {
  const cx = W / 2;
  const cy = H / 2 - 15;

  const topHeadY = cy - 40;
  const botHeadY = cy + 40;

  ctx.font = '700 11px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'left';
  ctx.fillText('EXTRACELLULAR FLUID [HIGH Na⁺, Cl⁻]', 30, cy - 90);

  ctx.fillStyle = '#a7f3d0';
  ctx.fillText('INTRACELLULAR CYTOPLASM [HIGH K⁺, ORGANIC ANIONS A⁻]', 30, cy + 120);

  const vmX = W - 140;
  const vmY = cy - 85;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(vmX - 60, vmY - 25, 120, 50);
  ctx.strokeStyle = step === 1 ? '#f59e0b' : '#06b6d4';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(vmX - 60, vmY - 25, 120, 50);

  ctx.font = '700 9px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText('MEMBRANE POTENTIAL', vmX, vmY - 8);

  ctx.font = '700 14px monospace';
  ctx.fillStyle = step === 0 ? '#38bdf8' : step === 1 ? '#f59e0b' : '#10b981';
  ctx.fillText(step === 0 ? '-70 mV' : step === 1 ? '+30 mV (SPIKE)' : '-70 mV (RESET)', vmX, vmY + 14);

  const channelLeft = cx - 55;
  const channelRight = cx + 55;

  for (let x = 40; x < W - 40; x += 18) {
    if (x > channelLeft && x < channelRight) continue;

    ctx.beginPath();
    ctx.arc(x, topHeadY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();
    ctx.strokeStyle = '#22d3ee';
    ctx.stroke();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - 3, topHeadY + 7);
    ctx.quadraticCurveTo(x - 6, topHeadY + 20, x - 3, topHeadY + 32);
    ctx.moveTo(x + 3, topHeadY + 7);
    ctx.quadraticCurveTo(x + 6, topHeadY + 20, x + 3, topHeadY + 32);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, botHeadY, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();
    ctx.strokeStyle = '#22d3ee';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 3, botHeadY - 7);
    ctx.quadraticCurveTo(x - 6, botHeadY - 20, x - 3, botHeadY - 32);
    ctx.moveTo(x + 3, botHeadY - 7);
    ctx.quadraticCurveTo(x + 6, botHeadY - 20, x + 3, botHeadY - 32);
    ctx.stroke();
  }

  const isOpen = (step === 1);
  const gateOffset = isOpen ? 16 : 4;

  ctx.fillStyle = '#1e3a8a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  drawRoundRect(ctx, channelLeft - 20, topHeadY - 20, 40 - gateOffset, 120, 10);
  ctx.fill();
  ctx.stroke();

  drawRoundRect(ctx, channelRight - 20 + gateOffset, topHeadY - 20, 40 - gateOffset, 120, 10);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 10px monospace';
  ctx.fillStyle = '#e0f2fe';
  ctx.textAlign = 'center';
  ctx.fillText(step === 2 ? 'Na⁺/K⁺-ATPase PUMP' : 'VOLTAGE-GATED Na⁺ CHANNEL', cx, topHeadY - 28);

  ctx.font = '9px monospace';
  ctx.fillStyle = isOpen ? '#10b981' : '#f43f5e';
  ctx.fillText(isOpen ? '[STATE: OPEN / ACTIVATED]' : '[STATE: CLOSED / INACTIVE]', cx, topHeadY - 14);

  if (step === 0) {
    for (let i = 0; i < 8; i++) {
      const ix = 80 + i * 115 + Math.sin(localTick * 0.05 + i) * 6;
      const iy = cy - 70 + Math.cos(localTick * 0.05 + i) * 5;
      drawIon(ctx, ix, iy, 'Na⁺', '#f59e0b');
    }
    for (let i = 0; i < 7; i++) {
      const ix = 120 + i * 125 + Math.sin(localTick * 0.05 + i * 2) * 6;
      const iy = cy + 75 + Math.cos(localTick * 0.05 + i * 2) * 5;
      drawIon(ctx, ix, iy, 'K⁺', '#38bdf8');
    }
  } else if (step === 1) {
    for (let i = 0; i < 6; i++) {
      const t = ((localTick * 1.5 + i * 40) % 240) / 240;
      const ny = (topHeadY - 60) + t * 150;
      drawIon(ctx, cx + Math.sin(t * 10) * 4, ny, 'Na⁺', '#f59e0b');
    }
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = -localTick * 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, topHeadY - 50);
    ctx.lineTo(cx, botHeadY + 50);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    drawIon(ctx, cx - 18, cy - 25 - (localTick % 60) * 0.5, 'Na⁺', '#f59e0b');
    drawIon(ctx, cx - 30, cy - 20 - (localTick % 60) * 0.5, 'Na⁺', '#f59e0b');
    drawIon(ctx, cx - 8, cy - 22 - (localTick % 60) * 0.5, 'Na⁺', '#f59e0b');

    drawIon(ctx, cx + 18, cy + 15 + (localTick % 60) * 0.5, 'K⁺', '#38bdf8');
    drawIon(ctx, cx + 30, cy + 20 + (localTick % 60) * 0.5, 'K⁺', '#38bdf8');

    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 10px monospace';
    ctx.fillText('ATP  →  ADP  +  Pᵢ', cx, cy + 68);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText('Active Hydrolysis restores resting gradient', cx, cy + 82);
  }
}

/* ── DOMAIN DRAWING METHOD: PHYSICS / BOHR ATOM ── */
function drawPhysicsDiagram(ctx, W, H, localTick, step, node, data, themeCol) {
  const cx = W / 2 - 80;
  const cy = H / 2 - 15;

  const r1 = 45, r2 = 90, r3 = 145;

  [
    { r: r1, label: 'n = 1 (Ground)' },
    { r: r2, label: 'n = 2 (Excited)' },
    { r: r3, label: 'n = 3 (Rydberg)' }
  ].forEach((shell, idx) => {
    ctx.strokeStyle = idx === 0 ? 'rgba(56, 189, 248, 0.4)' : idx === 1 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, shell.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '9px monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText(shell.label, cx + shell.r + 6, cy - 4);
  });

  const nucleusPulse = Math.sin(localTick * 0.1) * 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 18 + nucleusPulse, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();
  ctx.font = '700 10px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('+Ze', cx, cy + 4);

  let curR = r1;
  const angle = (localTick * 0.03) % (Math.PI * 2);

  if (step === 0) {
    curR = r1;
  } else if (step === 1) {
    curR = r3;
  } else {
    curR = r2;
  }

  const eX = cx + Math.cos(angle) * curR;
  const eY = cy + Math.sin(angle) * curR;

  ctx.beginPath();
  ctx.arc(eX, eY, 9, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(eX, eY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();

  if (step === 1) {
    const photonX = cx - 260 + ((localTick * 2) % 240);
    const photonY = cy - 20;

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = -30; px <= 30; px += 2) {
      const py = Math.sin((px * 0.3) + localTick * 0.4) * 8;
      if (px === -30) ctx.moveTo(photonX + px, photonY + py);
      else ctx.lineTo(photonX + px, photonY + py);
    }
    ctx.stroke();

    ctx.font = '700 10px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText('hν (Photon Absorption)', photonX, photonY - 14);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx + r1, cy);
    ctx.lineTo(cx + r3, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('ΔE = E₃ - E₁', cx + (r1 + r3) / 2, cy - 8);
  } else if (step === 2) {
    const outX = cx + 80 + ((localTick * 2.2) % 220);
    const outY = cy - 60;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = -35; px <= 35; px += 2) {
      const py = Math.sin((px * 0.3) + localTick * 0.4) * 10;
      if (px === -35) ctx.moveTo(outX + px, outY + py);
      else ctx.lineTo(outX + px, outY + py);
    }
    ctx.stroke();

    ctx.font = '700 10px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText('EMITTED PHOTON: λ = 656.3 nm (H-α)', outX, outY - 16);
  }

  const ladX = W - 180;
  const ladY = cy;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(ladX - 90, ladY - 120, 180, 240);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(ladX - 90, ladY - 120, 180, 240);

  ctx.font = '700 10px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.fillText('QUANTUM ENERGY LEVELS', ladX, ladY - 98);

  const levels = [
    { label: 'n = 3 (-1.51 eV)', y: ladY - 60, active: step === 1 },
    { label: 'n = 2 (-3.40 eV)', y: ladY, active: step === 2 },
    { label: 'n = 1 (-13.6 eV)', y: ladY + 80, active: step === 0 }
  ];

  levels.forEach((lvl) => {
    ctx.strokeStyle = lvl.active ? '#f59e0b' : '#64748b';
    ctx.lineWidth = lvl.active ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(ladX - 75, lvl.y);
    ctx.lineTo(ladX + 75, lvl.y);
    ctx.stroke();

    ctx.font = `${lvl.active ? '700' : '400'} 9px monospace`;
    ctx.fillStyle = lvl.active ? '#fbbf24' : '#94a3b8';
    ctx.fillText(lvl.label, ladX, lvl.y - 6);
  });
}

/* ── DOMAIN DRAWING METHOD: SYSTEM ARCHITECTURE (GENERAL) ── */
function drawSystemDiagram(ctx, W, H, localTick, step, node, data, themeCol) {
  const cx = W / 2;
  const cy = H / 2 - 15;
  const title = String(node?.title || 'System Core');
  const cluster = String(node?.cluster || 'Subsystem');

  if (step === 0) {
    const inX = cx - 240;
    const inY = cy;

    ctx.fillStyle = 'rgba(11, 19, 36, 0.9)';
    ctx.fillRect(inX - 140, inY - 120, 280, 240);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(inX - 140, inY - 120, 280, 240);

    ctx.fillStyle = '#06b6d4';
    ctx.font = '700 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('SIGNAL INGESTION REGISTERS', inX - 125, inY - 95);

    const registers = [
      { name: 'REG_0 [PRIMARY_PRECURSOR]', val: '0x7F2A_INIT' },
      { name: 'REG_1 [CONTEXT_VECTOR]', val: '0x09E1_ACTIVE' },
      { name: 'REG_2 [CONFIG_TELEMETRY]', val: '0x44B8_LOCKED' }
    ];

    registers.forEach((r, idx) => {
      const ry = inY - 65 + idx * 55;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
      ctx.fillRect(inX - 125, ry, 250, 44);
      ctx.strokeStyle = '#1e3a5f';
      ctx.strokeRect(inX - 125, ry, 250, 44);

      ctx.font = '700 9px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(r.name, inX - 115, ry + 16);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(`Value: ${r.val}`, inX - 115, ry + 34);
    });

    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = -localTick * 0.9;
    ctx.beginPath();
    ctx.moveTo(inX + 140, inY);
    ctx.lineTo(cx + 80, inY);
    ctx.stroke();
    ctx.setLineDash([]);

    const muxX = cx + 200;
    const muxY = cy;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(muxX - 110, muxY - 90, 220, 180);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(muxX - 110, muxY - 90, 220, 180);

    ctx.font = '700 11px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('BUS MULTIPLEXER', muxX, muxY - 65);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(muxX - 90, muxY - 35, 180, 100);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(muxX - 90, muxY - 35, 180, 100);

    ctx.font = '9px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('SERIALIZED STREAM', muxX, muxY - 10);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Clock Rate: ${(localTick % 60) * 10} MHz`, muxX, muxY + 12);
    ctx.fillText('Sync Token: 0xDEADBEEF', muxX, muxY + 32);
    ctx.fillText('Status: STREAMING', muxX, muxY + 52);
  } else if (step === 1) {
    const coreW = 460;
    const coreH = 240;

    ctx.fillStyle = 'rgba(11, 19, 36, 0.92)';
    ctx.fillRect(cx - coreW / 2, cy - coreH / 2, coreW, coreH);
    ctx.strokeStyle = themeCol;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cx - coreW / 2, cy - coreH / 2, coreW, coreH);

    ctx.font = '700 12px monospace';
    ctx.fillStyle = themeCol;
    ctx.textAlign = 'left';
    ctx.fillText(`TRANSFORMATION CORE: ${title.toUpperCase()}`, cx - coreW / 2 + 20, cy - coreH / 2 + 25);

    const states = ['IDLE', 'TRANSFORM', 'EVALUATE', 'COMMIT'];
    const activeStateIdx = Math.floor((localTick * 0.04) % 4);

    states.forEach((s, idx) => {
      const sx = cx - 165 + idx * 110;
      const sy = cy - 25;
      const isCurState = idx === activeStateIdx;

      ctx.beginPath();
      ctx.arc(sx, sy, 26, 0, Math.PI * 2);
      ctx.fillStyle = isCurState ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.8)';
      ctx.fill();
      ctx.strokeStyle = isCurState ? '#38bdf8' : '#334155';
      ctx.lineWidth = isCurState ? 2.5 : 1.5;
      ctx.stroke();

      ctx.font = '700 8px monospace';
      ctx.fillStyle = isCurState ? '#ffffff' : '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(s, sx, sy + 3);

      if (idx < states.length - 1) {
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx + 26, sy);
        ctx.lineTo(sx + 84, sy);
        ctx.stroke();
      }
    });

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 180, cy + 45, 360, 20);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(cx - 180, cy + 45, 360, 20);

    const progressFill = ((localTick * 1.5) % 360);
    ctx.fillStyle = themeCol;
    ctx.fillRect(cx - 180, cy + 45, progressFill, 20);

    ctx.font = '9px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`PIPELINE EXECUTION: ${Math.round((progressFill / 360) * 100)}% COMPLETE`, cx, cy + 59);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Domain Subsystem: ${cluster}`, cx, cy + 90);
  } else {
    const outX = cx;
    const outY = cy;

    ctx.fillStyle = 'rgba(11, 19, 36, 0.92)';
    ctx.fillRect(outX - 250, outY - 120, 500, 240);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(outX - 250, outY - 120, 500, 240);

    ctx.font = '700 12px monospace';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'left';
    ctx.fillText('DISPATCH TERMINAL & ARTIFACT SYNTHESIS', outX - 230, outY - 95);

    const outputs = [
      { tag: 'VERIFIED_ARTIFACT_01', detail: 'Hash Digest CRC32: [PASS - 0x8FA19230]', valid: true },
      { tag: 'STATE_BUS_PROPAGATION', detail: 'Broadcasting to subscriber channels on port 5173', valid: true },
      { tag: 'INTEGRITY_AUDIT_LOG', detail: 'Zero constraint violations detected across execution trace', valid: true }
    ];

    outputs.forEach((o, idx) => {
      const oy = outY - 65 + idx * 55;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(outX - 230, oy, 460, 44);
      ctx.strokeStyle = '#065f46';
      ctx.strokeRect(outX - 230, oy, 460, 44);

      ctx.font = '700 10px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText(o.tag, outX - 215, oy + 16);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(o.detail, outX - 215, oy + 34);
    });

    ctx.font = '700 10px monospace';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'right';
    ctx.fillText('STATUS: EXECUTION CYCLE COMPLETED WITH SUCCESS', outX + 230, outY + 105);
  }
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT: Explanation2DWorld
───────────────────────────────────────────────────────────── */
export default function Explanation2DWorld({
  data,
  onAwardXP,
  onOpenQuiz,
  onEnterSubject,
  initialTab = 'diagram'
}) {
  // Tabs: 'diagram' = 2D Interactive Diagram, 'world' = 2D Graph Realm, 'pipeline' = Sequential Pipeline
  const [activeTab, setActiveTab] = useState(initialTab || 'diagram');

  // Selected concept node (Current Target)
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Pan, Zoom & Grid state
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [showGrid, setShowGrid] = useState(true);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Simulation controls for diagram view
  const [diagramStep, setDiagramStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Canvas refs
  const worldCanvasRef = useRef(null);
  const diagramCanvasRef = useRef(null);

  // Animation frame ref & tick
  const animFrameRef = useRef(null);
  const tickRef = useRef(0);

  // Extract concepts / nodes from user data safely
  const concepts = useMemo(() => {
    const rawNodes = Array.isArray(data?.nodes) ? data.nodes : [];
    const rawConcepts = Array.isArray(data?.concepts) ? data.concepts : [];
    const sourceList = rawNodes.length > 0 ? rawNodes : rawConcepts;

    if (!sourceList || sourceList.length === 0) {
      return [
        {
          id: 'n1',
          title: data?.subject_title || data?.title || 'Core Concept',
          explanation: data?.summary || data?.raw_transcription || 'Substrate core and foundational mechanism.',
          importance: 'primary',
          cluster: 'Core Topic'
        },
        {
          id: 'n2',
          title: 'Algorithmic Transformation',
          explanation: 'Step-by-step conversion pathway and operational principles.',
          importance: 'secondary',
          cluster: 'Mechanisms'
        },
        {
          id: 'n3',
          title: 'System Validation',
          explanation: 'Empirical verification and observable active recall metrics.',
          importance: 'secondary',
          cluster: 'Verification'
        }
      ];
    }

    return sourceList.filter(Boolean).map((item, idx) => {
      const id = String(item?.node_id || item?.id || `node_${idx}`);
      const title = String(item?.title || item?.name || (typeof item === 'string' ? item : `Concept ${idx + 1}`));
      const explanation = String(item?.explanation || item?.definition || (typeof item === 'string' ? item : ''));
      const importance = item?.importance || (idx === 1 ? 'primary' : 'secondary');
      const cluster = String(item?.suggested_cluster || item?.cluster || 'Core Topic');
      const recallPrompt = item?.recallPrompt || item?.recall_prompt || '';

      return {
        id,
        title,
        explanation,
        importance,
        cluster,
        recallPrompt
      };
    });
  }, [data]);

  // Build Graph Nodes with positions, dimensions & roles
  const nodes = useMemo(() => {
    const total = concepts.length;

    return concepts.map((c, i) => {
      const isCitadel = c.importance === 'primary' || i === 1 || (total === 1);
      const isWaypoint = !isCitadel && (i === 2 || i === 3);

      // Card Dimensions
      const width = isCitadel ? 248 : 210;
      const height = isCitadel ? 112 : 94;

      // Coordinate Layout matching the reference image (left-to-right DAG / pipeline)
      let x, y;
      if (total <= 3) {
        x = 180 + i * 320;
        y = 310 + (i === 1 ? 30 : -20);
      } else if (total === 4) {
        const coords = [
          { x: 150, y: 310 }, // 0. Shard (left)
          { x: 440, y: 340 }, // 1. Citadel (center)
          { x: 750, y: 240 }, // 2. Waypoint (top right)
          { x: 740, y: 460 }  // 3. Waypoint (bottom right)
        ];
        x = coords[i].x;
        y = coords[i].y;
      } else if (total === 5) {
        const coords = [
          { x: 140, y: 290 }, // 0. Shard 01 (left)
          { x: 430, y: 340 }, // 1. Citadel Node (center)
          { x: 740, y: 240 }, // 2. Waypoint (Thermodynamic)
          { x: 670, y: 470 }, // 3. Waypoint (Kinetic)
          { x: 860, y: 410 }  // 4. Shard 05 (Steric Bulk / Locked)
        ];
        x = coords[i].x;
        y = coords[i].y;
      } else {
        // Multi-node distribution across columns
        const col = i === 0 ? 0 : i <= 2 ? 1 : i <= 4 ? 2 : 3;
        const row = i % 2;
        x = 140 + col * 270;
        y = 230 + row * 190 + (col % 2 === 1 ? 30 : -10);
      }

      // Role tag and icon type
      let roleLabel = `[SHARD: 0${i + 1}]`;
      let roleBadge = 'READY';
      let iconType = 'shard';

      if (isCitadel) {
        roleLabel = '★ CITADEL NODE';
        roleBadge = 'TIER 1 PRIMARY';
        iconType = 'citadel';
      } else if (isWaypoint) {
        roleLabel = '[WAYPOINT]';
        roleBadge = i === 2 ? 'THERMODYNAMIC' : 'KINETIC';
        iconType = i === 2 ? 'flame' : 'branch';
      } else if (i >= 4) {
        roleLabel = `[SHARD: 0${i + 1}]`;
        roleBadge = 'ADVANCED';
        iconType = 'shield';
      }

      const colors = ['#38bdf8', '#fbbf24', '#34d399', '#f87171', '#a78bfa', '#22d3ee'];
      const themeColor = isCitadel ? '#fbbf24' : colors[i % colors.length];

      return {
        ...c,
        x,
        y,
        width,
        height,
        isCitadel,
        isWaypoint,
        roleLabel,
        roleBadge,
        iconType,
        themeColor
      };
    });
  }, [concepts]);

  // Build edges / conduits connecting nodes
  const edges = useMemo(() => {
    const rawRels = Array.isArray(data?.relationships) ? data.relationships : [];
    const list = [];

    if (rawRels.length > 0) {
      rawRels.forEach((r, idx) => {
        if (!r) return;
        const fromStr = String(r.from || '').toLowerCase();
        const toStr = String(r.to || '').toLowerCase();
        const sNode = nodes.find(n => n.id === r.from || (n.title && n.title.toLowerCase() === fromStr));
        const tNode = nodes.find(n => n.id === r.to || (n.title && n.title.toLowerCase() === toStr));
        if (sNode && tNode) {
          list.push({
            id: `edge_${idx}`,
            source: sNode,
            target: tNode,
            label: r.type ? `<${r.type}>` : `<transforms_to>`
          });
        }
      });
    }

    // If no relationships or too few, build organic connections like in reference image
    if (list.length === 0 && nodes.length > 1) {
      const citadel = nodes.find(n => n.isCitadel) || nodes[1] || nodes[0];
      if (citadel) {
        nodes.forEach((n, idx) => {
          if (n.id !== citadel.id) {
            if (idx === 0) {
              list.push({ id: `e_${idx}`, source: n, target: citadel, label: '<typea?>' });
            } else if (idx === 2) {
              list.push({ id: `e_${idx}`, source: citadel, target: n, label: '<thermodynamic>' });
            } else if (idx === 3) {
              list.push({ id: `e_${idx}`, source: citadel, target: n, label: '<bulky_base_divergence>' });
            } else if (idx === 4 && nodes[2]) {
              list.push({ id: `e_${idx}`, source: nodes[2], target: n, label: '<heat>' });
            }
          }
        });
      }
    }

    return list;
  }, [nodes, data]);

  // Set default selected node
  useEffect(() => {
    if (nodes.length > 0 && (!selectedNodeId || !nodes.some(n => n.id === selectedNodeId))) {
      const citadel = nodes.find(n => n.isCitadel) || nodes[0];
      if (citadel?.id) {
        setSelectedNodeId(citadel.id);
      }
    }
  }, [nodes, selectedNodeId]);

  const selectedNode = useMemo(() => {
    const found = nodes.find(n => n.id === selectedNodeId) || nodes[0];
    if (found) return found;
    return {
      id: 'default_node',
      title: String(data?.subject_title || data?.title || 'Core Mechanism'),
      explanation: String(data?.summary || data?.raw_transcription || 'Mechanism transformation active.'),
      cluster: 'Core Topic',
      roleBadge: 'PRIMARY',
      roleLabel: '★ CITADEL NODE',
      themeColor: '#38bdf8'
    };
  }, [nodes, selectedNodeId, data]);

  const diagramDomain = useMemo(() => {
    return detectDiagramDomain(selectedNode, data);
  }, [selectedNode, data]);

  const domainStages = useMemo(() => {
    return getDomainStages(diagramDomain, selectedNode, data);
  }, [diagramDomain, selectedNode, data]);

  /* ─────────────────────────────────────────────────────────────
     CANVAS INTERACTION: PAN, ZOOM, DRAG & CLICK
  ───────────────────────────────────────────────────────────── */
  const handleMouseDown = (e) => {
    const canvas = worldCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check zoom toolbar click (top-right under radar)
    const zoomToolX = CANVAS_W - 195;
    const zoomToolY = 135;
    if (mouseX >= zoomToolX && mouseX <= zoomToolX + 175 && mouseY >= zoomToolY && mouseY <= zoomToolY + 34) {
      const btnIdx = Math.floor((mouseX - zoomToolX) / 44);
      retroAudio.playBlip?.();
      if (btnIdx === 0) setCamera(c => ({ ...c, zoom: Math.min(2.0, c.zoom + 0.2) }));
      else if (btnIdx === 1) setCamera(c => ({ ...c, zoom: Math.max(0.6, c.zoom - 0.2) }));
      else if (btnIdx === 2) setCamera({ x: 0, y: 0, zoom: 1 });
      else if (btnIdx === 3) setShowGrid(g => !g);
      return;
    }

    // Convert mouse coords to world space (with pan & zoom)
    const worldX = (mouseX - camera.x) / camera.zoom;
    const worldY = (mouseY - camera.y) / camera.zoom;

    // Check if clicked inside any node box
    let clickedNode = null;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (
        worldX >= n.x &&
        worldX <= n.x + n.width &&
        worldY >= n.y &&
        worldY <= n.y + n.height
      ) {
        clickedNode = n;
        break;
      }
    }

    if (clickedNode) {
      retroAudio.playBlip?.();
      setSelectedNodeId(clickedNode.id);
      return;
    }

    // Otherwise start panning
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - camera.x, y: e.clientY - camera.y };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    setCamera(c => ({
      ...c,
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setCamera(c => ({
      ...c,
      zoom: Math.max(0.5, Math.min(2.2, c.zoom * zoomFactor))
    }));
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER LOOP: 2D GRAPH REALM CANVAS
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== 'world') return;
    const canvas = worldCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let running = true;

    const render = () => {
      if (!running) return;
      tickRef.current += 1;
      const tick = tickRef.current;

      // Clear Canvas (Deep Navy Space Background)
      ctx.fillStyle = '#050a16';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Save context for Camera Transform (Pan & Zoom)
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      // ── 1. Cyber Grid ──
      if (showGrid) {
        ctx.strokeStyle = 'rgba(14, 116, 144, 0.12)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        const minX = -camera.x / camera.zoom - 100;
        const maxX = (CANVAS_W - camera.x) / camera.zoom + 100;
        const minY = -camera.y / camera.zoom - 100;
        const maxY = (CANVAS_H - camera.y) / camera.zoom + 100;

        for (let x = Math.floor(minX / gridSize) * gridSize; x < maxX; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, minY);
          ctx.lineTo(x, maxY);
          ctx.stroke();
        }
        for (let y = Math.floor(minY / gridSize) * gridSize; y < maxY; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(minX, y);
          ctx.lineTo(maxX, y);
          ctx.stroke();
        }
      }

      // ── 2. Draw Curved S-Conduits between Nodes ──
      edges.forEach((edge, eIdx) => {
        const s = edge.source;
        const t = edge.target;
        const fromX = s.x + s.width;
        const fromY = s.y + s.height / 2;
        const toX = t.x;
        const toY = t.y + t.height / 2;

        const isTargetConnected = selectedNodeId === s.id || selectedNodeId === t.id;
        const lineColor = isTargetConnected ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)';

        // Control points for smooth horizontal S-curve
        const dx = toX - fromX;
        const cp1x = fromX + dx * 0.45;
        const cp1y = fromY;
        const cp2x = fromX + dx * 0.55;
        const cp2y = toY;

        // Dashed curved conduit line
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = isTargetConnected ? 2.5 : 1.5;
        ctx.setLineDash([5, 4]);
        ctx.lineDashOffset = -tick * 0.8;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Directed Arrowhead
        const angle = Math.atan2(toY - cp2y, toX - cp2x);
        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - Math.cos(angle - 0.4) * 8, toY - Math.sin(angle - 0.4) * 8);
        ctx.lineTo(toX - Math.cos(angle + 0.4) * 8, toY - Math.sin(angle + 0.4) * 8);
        ctx.closePath();
        ctx.fill();

        // Animated Energy Packet moving along curve
        const progress = ((tick * 0.012 + eIdx * 0.3) % 1);
        const packetX = bezierPoint(fromX, cp1x, cp2x, toX, progress);
        const packetY = bezierPoint(fromY, cp1y, cp2y, toY, progress);

        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 8;
        ctx.fillRect(packetX - 2.5, packetY - 2.5, 5, 5);
        ctx.shadowBlur = 0;

        // Midpoint Relationship Badge: e.g. <bulky_base_divergence>
        const midX = bezierPoint(fromX, cp1x, cp2x, toX, 0.5);
        const midY = bezierPoint(fromY, cp1y, cp2y, toY, 0.5);

        ctx.save();
        ctx.font = '700 8px monospace';
        const labelW = ctx.measureText(edge.label).width + 8;
        ctx.fillStyle = '#060f1c';
        ctx.fillRect(midX - labelW / 2, midY - 7, labelW, 14);
        ctx.strokeStyle = isTargetConnected ? '#38bdf8' : '#1e3852';
        ctx.lineWidth = 1;
        ctx.strokeRect(midX - labelW / 2, midY - 7, labelW, 14);

        ctx.fillStyle = isTargetConnected ? '#7dd3fc' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.label, midX, midY + 0.5);
        ctx.restore();
      });

      // ── 3. Draw Rectangular Cyber Node Boxes ──
      nodes.forEach((n) => {
        const isSelected = selectedNodeId === n.id;
        const x = n.x;
        const y = n.y;
        const w = n.width;
        const h = n.height;

        ctx.save();

        // Citadel floating badge: [ CURRENT TARGET ]
        if (n.isCitadel || isSelected) {
          ctx.fillStyle = '#eab308';
          ctx.fillRect(x + w / 2 - 48, y - 11, 96, 12);
          ctx.font = '700 7px monospace';
          ctx.fillStyle = '#050c18';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('CURRENT TARGET', x + w / 2, y - 5);
        }

        // Card Glow when selected
        if (isSelected || n.isCitadel) {
          ctx.shadowColor = n.isCitadel ? 'rgba(234, 179, 8, 0.45)' : 'rgba(56, 189, 248, 0.45)';
          ctx.shadowBlur = 14;
        }

        // Main Box Body
        ctx.fillStyle = isSelected ? '#081628' : '#07101e';
        ctx.fillRect(x, y, w, h);
        ctx.shadowBlur = 0;

        // Border: Double line for Citadel / Selected, sleek line for standard
        ctx.strokeStyle = isSelected
          ? (n.isCitadel ? '#fbbf24' : '#38bdf8')
          : (n.isCitadel ? '#ca8a04' : '#1c3450');
        ctx.lineWidth = isSelected ? 2 : 1.5;
        ctx.strokeRect(x, y, w, h);

        if (n.isCitadel || isSelected) {
          ctx.strokeStyle = n.isCitadel ? 'rgba(250, 204, 21, 0.35)' : 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
        }

        // ── Card Top Header Bar ──
        ctx.font = '700 8px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = n.isCitadel ? '#facc15' : '#7dd3fc';
        ctx.fillText(n.roleLabel, x + 8, y + 7);

        // Header Right Tag / Indicator
        ctx.textAlign = 'right';
        if (n.isCitadel) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(n.roleBadge, x + w - 8, y + 7);
        } else if (n.isWaypoint) {
          ctx.fillStyle = n.roleBadge === 'THERMODYNAMIC' ? '#38bdf8' : '#818cf8';
          ctx.fillText(n.roleBadge, x + w - 8, y + 7);
        } else {
          // Status light dot
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x + w - 12, y + 7, 5, 5);
        }

        // Horizontal separator line under header
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 20);
        ctx.lineTo(x + w - 8, y + 20);
        ctx.stroke();

        // ── Card Inset Icon Box (Left) ──
        const iconBoxSize = n.isCitadel ? 34 : 30;
        const iconBoxX = x + 10;
        const iconBoxY = y + 28;

        ctx.fillStyle = '#061324';
        ctx.fillRect(iconBoxX, iconBoxY, iconBoxSize, iconBoxSize);
        ctx.strokeStyle = isSelected ? n.themeColor : '#223c58';
        ctx.lineWidth = 1;
        ctx.strokeRect(iconBoxX, iconBoxY, iconBoxSize, iconBoxSize);

        // Icon Graphic
        ctx.save();
        ctx.translate(iconBoxX + iconBoxSize / 2, iconBoxY + iconBoxSize / 2);
        if (n.iconType === 'citadel') {
          // Castle / Citadel Glyph
          ctx.fillStyle = '#fde047';
          ctx.fillRect(-6, -6, 12, 12);
          ctx.fillRect(-8, -2, 16, 8);
          ctx.fillStyle = '#061324';
          ctx.fillRect(-2, -6, 4, 4);
        } else if (n.iconType === 'flame') {
          // Flame Glyph
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.bezierCurveTo(5, -2, 5, 4, 0, 7);
          ctx.bezierCurveTo(-5, 4, -5, -2, 0, -6);
          ctx.stroke();
        } else if (n.iconType === 'branch') {
          // Fork / Branch Glyph
          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 6);
          ctx.lineTo(0, -1);
          ctx.lineTo(-5, -6);
          ctx.moveTo(0, -1);
          ctx.lineTo(5, -6);
          ctx.stroke();
        } else if (n.iconType === 'shield') {
          // Shield / Lock Glyph
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-4, -2, 8, 8);
          ctx.beginPath();
          ctx.arc(0, -2, 3, Math.PI, 0);
          ctx.stroke();
        } else {
          // Shard Data Grid Glyph
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-5, -5, 4, 4);
          ctx.fillRect(1, -5, 4, 4);
          ctx.fillRect(-5, 1, 4, 4);
          ctx.fillRect(1, 1, 4, 4);
        }
        ctx.restore();

        // ── Card Title & Subtitle (Right of Icon) ──
        const textX = iconBoxX + iconBoxSize + 8;
        const textMaxW = w - (iconBoxSize + 24);

        ctx.font = '700 11px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        drawWrappedText(ctx, n.title, textX, y + 27, textMaxW, 13, 2);

        // Subtitle tag
        ctx.font = '9px monospace';
        ctx.fillStyle = n.isCitadel ? '#cbd5e1' : '#4ade80';
        const subtitleText = n.isCitadel
          ? (n.explanation.substring(0, 24))
          : (n.cluster || n.explanation.substring(0, 22));
        ctx.fillText(subtitleText, textX, y + 54);

        // ── Citadel Bottom Footer: QUEST READY & XP ──
        if (n.isCitadel) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + 8, y + 90);
          ctx.lineTo(x + w - 8, y + 90);
          ctx.stroke();

          ctx.font = '700 8px monospace';
          ctx.fillStyle = '#4ade80';
          ctx.textAlign = 'left';
          ctx.fillText('QUEST READY', x + 10, y + 96);

          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'right';
          ctx.fillText('[120 XP]', x + w - 10, y + 96);
        }

        ctx.restore();
      });

      // Restore camera transform
      ctx.restore();

      // ═════════════════════════════════════════════════════════
      // SCREEN-SPACE FIXED HUD OVERLAYS (EXACT TO REFERENCE)
      // ═════════════════════════════════════════════════════════

      // ── 1. TOP-LEFT HUD PANEL ──
      const hudX = 20;
      const hudY = 20;
      const hudW = 440;
      const hudH = 136;

      ctx.fillStyle = 'rgba(7, 15, 28, 0.95)';
      ctx.fillRect(hudX, hudY, hudW, hudH);
      ctx.strokeStyle = '#1d3550';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(hudX, hudY, hudW, hudH);

      // Top Zone & Progress bar
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(hudX + 14, hudY + 12, 6, 6);

      ctx.font = '700 9px monospace';
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`ZONE: ${(data?.world?.theme || 'CHEM-ORBIT_07').toUpperCase()}`, hudX + 26, hudY + 10);

      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'right';
      ctx.fillText('REALM PROGRESS: 65%', hudX + hudW - 14, hudY + 10);

      // Icon Box
      ctx.fillStyle = '#08172c';
      ctx.fillRect(hudX + 14, hudY + 28, 38, 38);
      ctx.strokeStyle = '#22466e';
      ctx.strokeRect(hudX + 14, hudY + 28, 38, 38);

      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hudX + 27, hudY + 36);
      ctx.lineTo(hudX + 39, hudY + 36);
      ctx.lineTo(hudX + 43, hudY + 56);
      ctx.lineTo(hudX + 23, hudY + 56);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Title & Subtitle
      ctx.font = '700 13px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      const realmTitle = (data?.title || 'ALKENE SYNTHESIS & CATALYSIS').toUpperCase();
      ctx.fillText(realmTitle, hudX + 62, hudY + 30);

      ctx.font = '10px monospace';
      ctx.fillStyle = '#94a3b8';
      const notesSource = `Forged from uploaded notes: "${(data?.title || 'Course Material').substring(0, 42)}"`;
      drawWrappedText(ctx, notesSource, hudX + 62, hudY + 48, hudW - 74, 13, 2);

      // Retention Integrity Bar
      ctx.font = '700 9px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('RETENTION INTEGRITY:', hudX + 14, hudY + 110);

      // 10-segmented retention bar
      const barStartX = hudX + 150;
      const barY = hudY + 110;
      for (let b = 0; b < 10; b++) {
        if (b < 6) ctx.fillStyle = '#22c55e'; // Green
        else if (b < 8) ctx.fillStyle = '#f59e0b'; // Amber
        else ctx.fillStyle = '#1e293b'; // Empty
        ctx.fillRect(barStartX + b * 11, barY, 8, 8);
      }

      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'right';
      ctx.fillText('75%', hudX + hudW - 14, barY);

      // ── 2. TOP-RIGHT RADAR HUD ──
      const radarX = CANVAS_W - 195;
      const radarY = 20;
      const radarW = 175;
      const radarH = 105;

      ctx.fillStyle = 'rgba(7, 15, 28, 0.95)';
      ctx.fillRect(radarX, radarY, radarW, radarH);
      ctx.strokeStyle = '#1d3550';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(radarX, radarY, radarW, radarH);

      // Header
      ctx.font = '700 8px monospace';
      ctx.fillStyle = '#7dd3fc';
      ctx.textAlign = 'left';
      ctx.fillText('RADAR HUD', radarX + 10, radarY + 8);
      ctx.textAlign = 'right';
      ctx.fillText(`ZOOM ${camera.zoom.toFixed(1)}X`, radarX + radarW - 10, radarY + 8);

      // Radar Screen Grid
      const radarScreenX = radarX + 10;
      const radarScreenY = radarY + 22;
      const radarScreenW = radarW - 20;
      const radarScreenH = radarH - 30;

      ctx.fillStyle = '#050c18';
      ctx.fillRect(radarScreenX, radarScreenY, radarScreenW, radarScreenH);
      ctx.strokeStyle = 'rgba(14, 116, 144, 0.3)';
      ctx.strokeRect(radarScreenX, radarScreenY, radarScreenW, radarScreenH);

      // Radar Crosshairs
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.beginPath();
      ctx.moveTo(radarScreenX + radarScreenW / 2, radarScreenY);
      ctx.lineTo(radarScreenX + radarScreenW / 2, radarScreenY + radarScreenH);
      ctx.moveTo(radarScreenX, radarScreenY + radarScreenH / 2);
      ctx.lineTo(radarScreenX + radarScreenW, radarScreenY + radarScreenH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Mini-dots for Nodes on Radar
      nodes.forEach((n) => {
        const mx = radarScreenX + (n.x / CANVAS_W) * radarScreenW;
        const my = radarScreenY + (n.y / CANVAS_H) * radarScreenH;
        ctx.fillStyle = n.id === selectedNodeId ? '#facc15' : (n.isCitadel ? '#38bdf8' : '#4ade80');
        ctx.fillRect(mx - 1.5, my - 1.5, 3.5, 3.5);
      });

      // Viewport bounds on radar
      const vpX = radarScreenX - (camera.x / (CANVAS_W * camera.zoom)) * radarScreenW;
      const vpY = radarScreenY - (camera.y / (CANVAS_H * camera.zoom)) * radarScreenH;
      const vpW = (radarScreenW / camera.zoom);
      const vpH = (radarScreenH / camera.zoom);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        Math.max(radarScreenX, Math.min(radarScreenX + radarScreenW - 10, vpX)),
        Math.max(radarScreenY, Math.min(radarScreenY + radarScreenH - 10, vpY)),
        Math.min(radarScreenW, vpW),
        Math.min(radarScreenH, vpH)
      );

      // ── 3. ZOOM CONTROLS TOOLBAR (BELOW RADAR) ──
      const zoomX = CANVAS_W - 195;
      const zoomY = 135;
      ctx.fillStyle = 'rgba(7, 15, 28, 0.95)';
      ctx.fillRect(zoomX, zoomY, 175, 32);
      ctx.strokeStyle = '#1d3550';
      ctx.strokeRect(zoomX, zoomY, 175, 32);

      const buttons = ['+', '−', '⛶', '#'];
      buttons.forEach((btn, bIdx) => {
        const bx = zoomX + bIdx * 44;
        ctx.strokeStyle = '#1e3852';
        ctx.strokeRect(bx, zoomY, 44, 32);
        ctx.font = '700 12px monospace';
        ctx.fillStyle = '#7dd3fc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(btn, bx + 22, zoomY + 16);
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeTab, nodes, edges, selectedNodeId, camera, showGrid, data]);

  /* ─────────────────────────────────────────────────────────────
     RENDER LOOP: INTERACTIVE 2D DIAGRAM SIMULATOR CANVAS
  ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (activeTab !== 'diagram') return;
    const canvas = diagramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let running = true;
    let localTick = 0;

    const renderDiagram = () => {
      if (!running) return;
      try {
        localTick += isSimulating ? simulationSpeed : 0;
        const W = canvas.width || CANVAS_W;
        const H = canvas.height || 560;

        ctx.fillStyle = '#050a16';
        ctx.fillRect(0, 0, W, H);

        // Blueprint grid
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
        for (let y = 0; y < H; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }

        // Safe telemetry values
        const themeCol = selectedNode?.themeColor || '#38bdf8';
        const nodeTitle = String(selectedNode?.title || 'Concept Architecture');
        const nodeCluster = String(selectedNode?.cluster || 'Core Topic');
        const nodeExplanation = String(selectedNode?.explanation || 'Operational mechanism active.');

        const domain = diagramDomain;
        const curStageObj = domainStages[diagramStep] || domainStages[0];

        // Header Telemetry Panel
        ctx.save();
        ctx.fillStyle = 'rgba(8, 15, 30, 0.88)';
        ctx.fillRect(20, 12, W - 40, 50);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 12, W - 40, 50);

        // Cybernetic corner tag
        ctx.fillStyle = themeCol;
        ctx.fillRect(20, 12, 4, 50);

        ctx.font = 'bold 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(`CONCEPT ARCHITECTURE: `, 34, 32);

        const prefixW = ctx.measureText(`CONCEPT ARCHITECTURE: `).width;
        ctx.fillStyle = themeCol;
        ctx.fillText(nodeTitle.toUpperCase(), 34 + prefixW, 32);

        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`CLUSTER: [${nodeCluster}]`, 34, 50);

        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`DOMAIN: [${domain.toUpperCase()}]`, 210, 50);

        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`[PHASE ${diagramStep + 1}/3: ${curStageObj.stage.toUpperCase()}]`, 370, 50);

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(W - 42, 37, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'right';
        ctx.fillText(`LIVE SCHEMATIC`, W - 52, 40);
        ctx.restore();

        // Dispatch to domain-specific scientific / technical diagrams
        if (domain === 'chemistry') {
          drawChemistryDiagram(ctx, W, H, localTick, diagramStep, selectedNode, data, themeCol);
        } else if (domain === 'data_pipeline') {
          drawDataPipelineDiagram(ctx, W, H, localTick, diagramStep, selectedNode, data, themeCol);
        } else if (domain === 'biology') {
          drawBiologyDiagram(ctx, W, H, localTick, diagramStep, selectedNode, data, themeCol);
        } else if (domain === 'physics') {
          drawPhysicsDiagram(ctx, W, H, localTick, diagramStep, selectedNode, data, themeCol);
        } else {
          drawSystemDiagram(ctx, W, H, localTick, diagramStep, selectedNode, data, themeCol);
        }

        // Bottom Banner with Dynamic Domain Stage & Explanation
        ctx.save();
        ctx.fillStyle = 'rgba(8, 15, 30, 0.94)';
        ctx.fillRect(20, H - 76, W - 40, 58);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, H - 76, W - 40, 58);

        // Accent indicator bar
        ctx.fillStyle = themeCol;
        ctx.fillRect(20, H - 76, 5, 58);

        // Phase badge
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.fillRect(34, H - 68, 76, 18);
        ctx.strokeStyle = themeCol;
        ctx.lineWidth = 1;
        ctx.strokeRect(34, H - 68, 76, 18);
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = themeCol;
        ctx.textAlign = 'center';
        ctx.fillText(`PHASE ${diagramStep + 1}/3`, 72, H - 56);

        // Stage Title
        ctx.font = 'bold 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(curStageObj.stage.toUpperCase(), 120, H - 55);

        // Explanation text
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(curStageObj.detail || nodeExplanation, 34, H - 28);
        ctx.restore();
      } catch (err) {
        console.warn('Diagram render catch:', err);
      }

      animFrameRef.current = requestAnimationFrame(renderDiagram);
    };

    renderDiagram();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activeTab, selectedNode, diagramStep, isSimulating, simulationSpeed, diagramDomain, domainStages, data]);

  /* ─────────────────────────────────────────────────────────────
     JSX RETURN: 2D DIAGRAM EXPLANATION
  ───────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col space-y-4">
      {/* ── Sub-Selector for Diagram Topic & Concept Nodes ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d19] p-3 rounded-lg border border-[#192742] shadow-[0_0_20px_rgba(6,182,212,0.08)]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-950/80 border border-cyan-400/80 text-cyan-300 font-mono text-xs font-bold shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wider">CONCEPT ARCHITECTURE:</span>
          </div>

          {nodes.map((n) => {
            const isCur = selectedNodeId === n.id;
            return (
              <button
                key={n.id}
                onClick={() => {
                  retroAudio.playBlip?.();
                  setSelectedNodeId(n.id);
                  setDiagramStep(0);
                }}
                className={`group px-3 py-1.5 rounded font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isCur
                    ? 'bg-amber-500 text-black border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-102'
                    : 'bg-[#0a1324] border border-[#1e2f4d] text-slate-300 hover:text-white hover:border-cyan-500/50 hover:bg-[#0f1d38]'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-transform ${isCur ? 'bg-black' : 'group-hover:scale-125'}`}
                  style={{ backgroundColor: isCur ? '#000000' : (n.themeColor || '#38bdf8') }}
                />
                <span className="truncate max-w-[200px] tracking-wide">{n.title.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-cyan-400/80 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-500/30">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-bold tracking-wider">SCHEMATICS ONLINE</span>
        </div>
      </div>

      {/* ── Canvas + Interactive Controls ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* The Simulation Canvas (3 cols) */}
        <div className="lg:col-span-3 flex flex-col space-y-2">
          <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] bg-[#050a14]">
            <canvas
              ref={diagramCanvasRef}
              width={CANVAS_W}
              height={CANVAS_H - 120}
              className="w-full h-auto block"
            />

            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className="p-1.5 rounded bg-[#091325]/90 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 cursor-pointer backdrop-blur-sm shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all"
                title={isSimulating ? 'Pause Animation' : 'Play Animation'}
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  retroAudio.playBlip?.();
                  setDiagramStep(0);
                }}
                className="p-1.5 rounded bg-[#091325]/90 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 cursor-pointer backdrop-blur-sm shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step Navigation & Mechanism Stepper */}
          <div className="p-3 bg-[#080d19] rounded-lg border border-[#192742] flex flex-wrap items-center justify-between gap-3 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
            <div className="flex items-center gap-2">
              <button
                disabled={diagramStep === 0}
                onClick={() => {
                  retroAudio.playBlip?.();
                  setDiagramStep((s) => Math.max(0, s - 1));
                }}
                className={`px-3 py-1.5 rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  diagramStep === 0
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                    : 'bg-[#0f172a] border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>PREV PHASE</span>
              </button>

              <div className="flex items-center gap-1 mx-1">
                {[0, 1, 2].map((sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => {
                      retroAudio.playBlip?.();
                      setDiagramStep(sIdx);
                    }}
                    className={`px-2.5 py-1 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                      diagramStep === sIdx
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'bg-[#0c1629] text-slate-400 border border-[#1b2b47] hover:text-cyan-300 hover:border-cyan-500/40'
                    }`}
                  >
                    PHASE {sIdx + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={diagramStep >= 2}
                onClick={() => {
                  retroAudio.playBlip?.();
                  setDiagramStep((s) => s + 1);
                }}
                className={`px-3 py-1.5 rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  diagramStep >= 2
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                    : 'bg-[#0f172a] border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                }`}
              >
                <span>NEXT PHASE</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">SIM SPEED:</span>
              <button
                onClick={() => setSimulationSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
                className="px-2.5 py-1 rounded bg-[#091325] border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold hover:bg-cyan-900/40 cursor-pointer transition-all"
              >
                {simulationSpeed}x
              </button>
            </div>
          </div>
        </div>

        {/* Right: Step Analysis Breakdown (1 col) */}
        <div className="p-4 rounded-lg bg-[#080d19] border border-[#192742] space-y-4 text-left flex flex-col justify-between shadow-[0_0_20px_rgba(6,182,212,0.08)]">
          <div className="space-y-3">
            <div className="border-b border-[#16233a] pb-2.5 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-cyan-400"></span>
                  <span>MECHANISM BREAKDOWN</span>
                </div>
                <div className="font-mono text-xs text-slate-400 mt-1">
                  {selectedNode?.cluster || 'Core Topic'}
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold text-cyan-300/80 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                PHASE {diagramStep + 1}/3
              </span>
            </div>

            {/* Steps List */}
            <div className="space-y-2.5">
              {domainStages.map((st, idx) => {
                const isStepActive = diagramStep === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      retroAudio.playBlip?.();
                      setDiagramStep(idx);
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                      isStepActive
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] translate-x-1'
                        : 'bg-[#0a1120] border-[#141f36] opacity-80 hover:opacity-100 hover:border-slate-500 hover:bg-[#0c162a]'
                    }`}
                  >
                    {isStepActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-emerald-400"></div>
                    )}
                    <div className="font-mono text-xs font-bold text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isStepActive ? 'bg-cyan-400 text-black' : 'bg-slate-800 text-slate-400'
                        }`}>
                          0{idx + 1}
                        </span>
                        <span>{st.stage}</span>
                      </div>
                      {isStepActive && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {st.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Node Recall Prompt at the bottom */}
          <div className="pt-3 border-t border-[#16233a] space-y-1.5">
            <div className="font-mono text-[11px] font-bold text-slate-400 tracking-wider">
              RECALL TARGET:
            </div>
            <p className="font-mono text-xs text-amber-300/90 leading-relaxed italic bg-amber-950/20 p-2 rounded border border-amber-500/20">
              "{selectedNode?.recallPrompt || 'How does this mechanism operate within the system?'}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
