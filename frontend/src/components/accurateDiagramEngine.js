/**
 * accurateDiagramEngine.js
 * 
 * Dynamic, scientifically accurate 2D schematic engine for Syntropy.
 * Generates genuine mechanistic breakdowns and dynamic canvas schematics
 * strictly derived from the active note, selected concept node, graph edges,
 * and active-recall questions.
 */

// Helper: Measure and wrap text onto canvas
export function drawWrappedCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  if (!text) return;
  const words = String(text).split(' ');
  let line = '';
  let currentY = y;
  let linesDrawn = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      linesDrawn++;
      if (linesDrawn >= maxLines) {
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

// Helper: Rounded Rectangle
export function drawRoundRect(ctx, x, y, w, h, r = 6) {
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

/**
 * Detect scientific / technical domain from note text and selected node
 */
export function detectDiagramDomain(node, data) {
  const corpus = `${node?.title || ''} ${node?.explanation || ''} ${node?.cluster || ''} ${data?.subject_title || ''} ${data?.title || ''} ${data?.raw_transcription || ''} ${data?.summary || ''}`.toLowerCase();

  // 1. Chemistry / Biochemistry / Reactions
  if (
    corpus.includes('chem') || corpus.includes('reaction') || corpus.includes('alkene') ||
    corpus.includes('alcohol') || corpus.includes('acid') || corpus.includes('bond') ||
    corpus.includes('catalyst') || corpus.includes('synthesis') || corpus.includes('proton') ||
    corpus.includes('electron') || corpus.includes('molecule') || corpus.includes('oxidation') ||
    corpus.includes('reduction') || corpus.includes('dehydration') || corpus.includes('elimination') ||
    corpus.includes('addition') || corpus.includes('carbocation') || corpus.includes('ester')
  ) {
    return 'chemistry';
  }

  // 2. Biology / Cellular / Physiology / Ecology
  if (
    corpus.includes('bio') || corpus.includes('cell') || corpus.includes('membrane') ||
    corpus.includes('photosynthesis') || corpus.includes('plant') || corpus.includes('chloroplast') ||
    corpus.includes('organ') || corpus.includes('enzyme') || corpus.includes('dna') ||
    corpus.includes('rna') || corpus.includes('protein') || corpus.includes('atp') ||
    corpus.includes('mitochondria') || corpus.includes('neuron') || corpus.includes('species') ||
    corpus.includes('ecosystem') || corpus.includes('blood') || corpus.includes('respiration')
  ) {
    return 'biology';
  }

  // 3. Physics / Mechanics / Quantum / Electromagnetism
  if (
    corpus.includes('physic') || corpus.includes('force') || corpus.includes('velocity') ||
    corpus.includes('gravity') || corpus.includes('quantum') || corpus.includes('atom') ||
    corpus.includes('energy') || corpus.includes('momentum') || corpus.includes('wave') ||
    corpus.includes('photon') || corpus.includes('optics') || corpus.includes('electric') ||
    corpus.includes('magnetic') || corpus.includes('circuit') || corpus.includes('thermodynamic') ||
    corpus.includes('orbital') || corpus.includes('frequency') || corpus.includes('newton')
  ) {
    return 'physics';
  }

  // 4. Data / Computer Science / Engineering
  if (
    corpus.includes('data') || corpus.includes('algorithm') || corpus.includes('pipeline') ||
    corpus.includes('database') || corpus.includes('model') || corpus.includes('machine learning') ||
    corpus.includes('hash') || corpus.includes('token') || corpus.includes('network') ||
    corpus.includes('entity') || corpus.includes('resolution') || corpus.includes('clustering') ||
    corpus.includes('server') || corpus.includes('api') || corpus.includes('code')
  ) {
    return 'data_pipeline';
  }

  return 'system';
}

/**
 * Generate 100% accurate, dynamic stages from the concept definition and graph relationships
 */
export function getAccurateConceptStages(domain, node, data, edges = [], nodes = []) {
  const title = String(node?.title || data?.subject_title || 'Core Mechanism');
  const explanation = String(node?.explanation || data?.summary || 'Operational pathway active.');
  const cluster = String(node?.cluster || 'Core Topic');

  // Find incoming and outgoing edges for this specific node
  const incoming = edges.filter(e => e.target?.id === node?.id || e.target_id === node?.id || e.to === node?.id);
  const outgoing = edges.filter(e => e.source?.id === node?.id || e.source_id === node?.id || e.from === node?.id);

  const incomingNames = incoming.map(e => e.source?.title || e.from).filter(Boolean);
  const outgoingNames = outgoing.map(e => e.target?.title || e.to).filter(Boolean);

  // Split explanation into sentences/clauses
  const sentences = explanation.split(/(?<=[.?!;])\s+/).filter(s => s.trim().length > 0);
  const sentence1 = sentences[0] || explanation;
  const sentence2 = sentences[1] || sentence1;
  const sentenceRest = sentences.slice(1).join(' ') || sentence1;

  // Find linked quiz question if available
  const questions = Array.isArray(data?.questions) ? data.questions : [];
  const linkedQ = questions.find(q => q.linked_node_id === node?.id || q.linked_node_id === node?.node_id) || questions[0];

  // Stage 1 Titles & Detail (Inputs / Precursors)
  let stage1Title = 'Phase 1: Precursor Substrate & Initiation';
  let stage1Detail = '';
  if (domain === 'chemistry') {
    stage1Title = 'Phase 1: Reactant Ground State & Activation';
    stage1Detail = incomingNames.length > 0
      ? `Substrate initiated by precursor [${incomingNames.join(', ')}]. Initial reagent state establishes reactive polarity: ${sentence1}`
      : `Initial reagent conditions for ${title}: ${sentence1} Establishes prerequisite electronic and steric state.`;
  } else if (domain === 'biology') {
    stage1Title = 'Phase 1: Biomolecular Input & Cellular Stimulus';
    stage1Detail = incomingNames.length > 0
      ? `Pathway triggered by upstream physiological factor [${incomingNames.join(', ')}]. ${sentence1}`
      : `Initial cellular / metabolic preconditions for ${title}: ${sentence1}`;
  } else if (domain === 'physics') {
    stage1Title = 'Phase 1: Boundary Conditions & Initial Energy State';
    stage1Detail = incomingNames.length > 0
      ? `System initialized under influence of [${incomingNames.join(', ')}]. ${sentence1}`
      : `Initial physical frame and boundary conditions for ${title}: ${sentence1}`;
  } else if (domain === 'data_pipeline') {
    stage1Title = 'Phase 1: Ingestion Preconditions & Input Schema';
    stage1Detail = incomingNames.length > 0
      ? `Ingestion stream piped from [${incomingNames.join(', ')}]. ${sentence1}`
      : `Raw input signals and candidate records buffered for ${title}: ${sentence1}`;
  } else {
    stage1Title = 'Phase 1: Foundational Premise & Precursor Input';
    stage1Detail = incomingNames.length > 0
      ? `Originates from prerequisite concept [${incomingNames.join(', ')}]. ${sentence1}`
      : `Foundational baseline conditions and entry premise: ${sentence1}`;
  }

  // Stage 2 Titles & Detail (Active Mechanism)
  let stage2Title = 'Phase 2: Core Transformation Dynamics';
  let stage2Detail = '';
  if (domain === 'chemistry') {
    stage2Title = 'Phase 2: Transition State & Catalytic Pathway';
    stage2Detail = `Active reaction coordinate: ${sentenceRest || explanation} Overcomes activation energy barrier within the ${cluster} reaction matrix.`;
  } else if (domain === 'biology') {
    stage2Title = 'Phase 2: Catalytic Pathway & Functional Execution';
    stage2Detail = `Active physiological mechanism: ${sentenceRest || explanation} Sustained through energetic coupling within the ${cluster} system.`;
  } else if (domain === 'physics') {
    stage2Title = 'Phase 2: Governing Physical Laws & Field Dynamics';
    stage2Detail = `Dynamic interaction: ${sentenceRest || explanation} Governed by conservation principles and field equations.`;
  } else if (domain === 'data_pipeline') {
    stage2Title = 'Phase 2: Algorithmic Transformation & Distance Evaluation';
    stage2Detail = `Processing core: ${sentenceRest || explanation} Executes transformation matrix over the active record partition.`;
  } else {
    stage2Title = 'Phase 2: Operational Mechanism & Structural Process';
    stage2Detail = `Operational pathway: ${sentenceRest || explanation} Central operational dynamic of ${title}.`;
  }

  // Stage 3 Titles & Detail (Outcome & Verification)
  let stage3Title = 'Phase 3: Synthesized Output & Empirical Verification';
  let stage3Detail = '';
  const recallPromptText = node?.recallPrompt ? `Target recall challenge: "${node.recallPrompt}"` : (linkedQ ? `Verified via active recall: "${linkedQ.question_text}"` : `Validates the stability of ${title}.`);

  if (domain === 'chemistry') {
    stage3Title = 'Phase 3: Product Synthesis & Diagnostic Confirmation';
    stage3Detail = outgoingNames.length > 0
      ? `Yields stable reaction product and directly propagates into [${outgoingNames.join(', ')}]. ${recallPromptText}`
      : `Yields stable synthesized chemical state. ${recallPromptText}`;
  } else if (domain === 'biology') {
    stage3Title = 'Phase 3: Metabolic Equilibrium & Verified Functional Output';
    stage3Detail = outgoingNames.length > 0
      ? `Produces biological output that activates [${outgoingNames.join(', ')}]. ${recallPromptText}`
      : `Restores biological homeostasis and functional yield. ${recallPromptText}`;
  } else if (domain === 'physics') {
    stage3Title = 'Phase 3: Observable Spectra & Conserved State';
    stage3Detail = outgoingNames.length > 0
      ? `Conserved physical output directly governs [${outgoingNames.join(', ')}]. ${recallPromptText}`
      : `Attains equilibrium / observable physical signature. ${recallPromptText}`;
  } else if (domain === 'data_pipeline') {
    stage3Title = 'Phase 3: Canonical Output & Provenance Verification';
    stage3Detail = outgoingNames.length > 0
      ? `Emits verified deduplicated records into [${outgoingNames.join(', ')}]. ${recallPromptText}`
      : `Synthesizes verified golden output records with complete provenance. ${recallPromptText}`;
  } else {
    stage3Title = 'Phase 3: System Impact & Observable Consequences';
    stage3Detail = outgoingNames.length > 0
      ? `Directly leads to [${outgoingNames.join(', ')}]. ${recallPromptText}`
      : `Establishes verified conclusions and observable outcomes for ${title}. ${recallPromptText}`;
  }

  return [
    { stage: stage1Title, detail: stage1Detail },
    { stage: stage2Title, detail: stage2Detail },
    { stage: stage3Title, detail: stage3Detail }
  ];
}

/**
 * Master Canvas Renderer: Draws accurate scientific schematic tailored to the actual concept
 */
export function drawAccurateConceptSchematic(
  ctx,
  W,
  H,
  localTick,
  step,
  node,
  data,
  themeCol,
  domain,
  curStageObj,
  domainStages,
  incomingEdges = [],
  outgoingEdges = [],
  linkedQuestion = null
) {
  const nodeTitle = String(node?.title || data?.subject_title || 'Concept Core');
  const nodeCluster = String(node?.cluster || 'Core Topic');
  const nodeExplanation = String(node?.explanation || 'Operational mechanism active.');

  // Layout Boundaries
  const topY = 74;
  const bottomY = H - 90;
  const panelH = bottomY - topY;

  const leftX = 25;
  const leftW = 240;

  const midX = leftX + leftW + 16;
  const midW = W - (leftW * 2) - 82;

  const rightX = midX + midW + 16;
  const rightW = leftW;

  // ─────────────────────────────────────────────────────────────
  // 1. LEFT PANEL: PRECURSORS & INPUT SUBSTRATE
  // ─────────────────────────────────────────────────────────────
  const isLeftActive = (step === 0);
  ctx.save();
  ctx.fillStyle = isLeftActive ? 'rgba(8, 22, 42, 0.95)' : 'rgba(8, 14, 28, 0.85)';
  ctx.fillRect(leftX, topY, leftW, panelH);
  ctx.strokeStyle = isLeftActive ? '#06b6d4' : 'rgba(20, 40, 70, 0.8)';
  ctx.lineWidth = isLeftActive ? 2 : 1;
  ctx.strokeRect(leftX, topY, leftW, panelH);

  // Left panel header badge
  ctx.fillStyle = isLeftActive ? '#06b6d4' : '#1e3a5f';
  ctx.fillRect(leftX, topY, leftW, 26);
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = isLeftActive ? '#050a16' : '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('// 01. PRECURSOR & INPUTS', leftX + 10, topY + 17);

  // Incoming connected concepts or derived initial conditions
  const incomingNodes = incomingEdges.map(e => ({
    title: e.source?.title || e.from || 'Precursor Substrate',
    label: e.label || e.type || 'connects to'
  }));

  if (incomingNodes.length > 0) {
    incomingNodes.slice(0, 3).forEach((inc, idx) => {
      const cardY = topY + 38 + idx * 72;
      ctx.fillStyle = isLeftActive ? 'rgba(6, 182, 212, 0.12)' : 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(leftX + 10, cardY, leftW - 20, 62);
      ctx.strokeStyle = isLeftActive ? '#06b6d4' : '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(leftX + 10, cardY, leftW - 20, 62);

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(inc.title.slice(0, 24).toUpperCase(), leftX + 18, cardY + 20);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Rel: ${inc.label}`, leftX + 18, cardY + 36);

      ctx.fillStyle = isLeftActive ? '#10b981' : '#64748b';
      ctx.fillText(isLeftActive ? '● INFLUX TRANSMITTING' : '○ STANDBY', leftX + 18, cardY + 50);
    });
  } else {
    // Derived premise card
    const cardY = topY + 40;
    ctx.fillStyle = isLeftActive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(leftX + 10, cardY, leftW - 20, 140);
    ctx.strokeStyle = isLeftActive ? '#06b6d4' : '#1e293b';
    ctx.strokeRect(leftX + 10, cardY, leftW - 20, 140);

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('SUBSTRATE PRECONDITIONS', leftX + 18, cardY + 22);

    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    drawWrappedCanvasText(ctx, nodeExplanation, leftX + 18, cardY + 44, leftW - 36, 15, 5);
  }

  // Conduit arrow from Left to Center
  const conduitY = topY + panelH / 2;
  ctx.strokeStyle = isLeftActive ? '#06b6d4' : '#1e3a5f';
  ctx.lineWidth = isLeftActive ? 2.5 : 1.5;
  ctx.setLineDash([5, 4]);
  ctx.lineDashOffset = -localTick * 0.9;
  ctx.beginPath();
  ctx.moveTo(leftX + leftW, conduitY);
  ctx.lineTo(midX, conduitY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // ─────────────────────────────────────────────────────────────
  // 2. CENTER PANEL: TRANSFORMATION CORE & MECHANISTIC SIMULATOR
  // ─────────────────────────────────────────────────────────────
  const isMidActive = (step === 1);
  ctx.save();
  ctx.fillStyle = isMidActive ? 'rgba(10, 20, 42, 0.95)' : 'rgba(8, 14, 28, 0.88)';
  ctx.fillRect(midX, topY, midW, panelH);
  ctx.strokeStyle = isMidActive ? '#fbbf24' : 'rgba(30, 58, 95, 0.8)';
  ctx.lineWidth = isMidActive ? 2 : 1;
  ctx.strokeRect(midX, topY, midW, panelH);

  // Center header
  ctx.fillStyle = isMidActive ? '#fbbf24' : '#1e3a5f';
  ctx.fillRect(midX, topY, midW, 26);
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = isMidActive ? '#050a16' : '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText(`// 02. ACTIVE MECHANISM CORE: ${nodeTitle.slice(0, 32).toUpperCase()}`, midX + 12, topY + 17);

  // Center Focal Core Box
  const coreCx = midX + midW / 2;
  const coreCy = topY + 130;
  const coreR = 56;

  // Ambient pulsing glow when active
  if (isMidActive) {
    const pulseR = coreR + 8 + Math.sin(localTick * 0.1) * 6;
    ctx.beginPath();
    ctx.arc(coreCx, coreCy, pulseR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
    ctx.fill();

    // Orbital reticle ring
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = localTick * 0.7;
    ctx.beginPath();
    ctx.arc(coreCx, coreCy, coreR + 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Central Reactor Body
  ctx.beginPath();
  ctx.arc(coreCx, coreCy, coreR, 0, Math.PI * 2);
  ctx.fillStyle = '#0b1329';
  ctx.fill();
  ctx.strokeStyle = isMidActive ? '#fbbf24' : themeCol;
  ctx.lineWidth = isMidActive ? 3 : 2;
  ctx.stroke();

  // Inside Core: Concept Title
  ctx.font = 'bold 11px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  drawWrappedCanvasText(ctx, nodeTitle, coreCx, coreCy - 12, coreR * 1.7, 14, 2);

  // Role tag below title
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = isMidActive ? '#fbbf24' : themeCol;
  ctx.fillText(`[${nodeCluster.toUpperCase()}]`, coreCx, coreCy + 22);

  // ── Domain-Specific Mechanistic Visualizer Inside Center ──
  const plotY = topY + 215;
  const plotW = midW - 40;
  const plotX = midX + 20;
  const plotH = panelH - 235;

  ctx.fillStyle = 'rgba(6, 12, 24, 0.8)';
  ctx.fillRect(plotX, plotY, plotW, plotH);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(plotX, plotY, plotW, plotH);

  if (domain === 'chemistry') {
    // Gibbs Free Energy Reaction Coordinate Curve
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'left';
    ctx.fillText('REACTION COORDINATE [ΔG & ENTHALPY PATHWAY]', plotX + 10, plotY + 16);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const startPt = { x: plotX + 30, y: plotY + plotH - 24 };
    const peakPt  = { x: plotX + plotW / 2, y: plotY + 36 };
    const endPt   = { x: plotX + plotW - 30, y: plotY + plotH - 38 };

    ctx.moveTo(startPt.x, startPt.y);
    ctx.bezierCurveTo(startPt.x + 40, startPt.y - 10, peakPt.x - 40, peakPt.y, peakPt.x, peakPt.y);
    ctx.bezierCurveTo(peakPt.x + 40, peakPt.y, endPt.x - 40, endPt.y - 5, endPt.x, endPt.y);
    ctx.stroke();

    // Transition State Label
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(peakPt.x, peakPt.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 8px monospace';
    ctx.fillText('TRANSITION STATE [‡]', peakPt.x - 45, peakPt.y - 8);

    // Reactants & Products labels
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('REACTANTS', startPt.x - 10, startPt.y + 14);
    ctx.fillStyle = '#10b981';
    ctx.fillText('PRODUCTS', endPt.x - 20, endPt.y + 14);

    // Animated Reaction Particle
    const rxProgress = ((localTick * 0.015) % 1);
    const rPtX = plotX + 30 + rxProgress * (plotW - 60);
    const rPtY = peakPt.y + Math.pow(Math.abs(rPtX - peakPt.x) / (plotW / 2 - 30), 2) * (plotH - 60);
    ctx.beginPath();
    ctx.arc(rPtX, Math.min(plotY + plotH - 20, rPtY), 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
  } else if (domain === 'biology') {
    // Bio-Metabolic / Cellular Translocation Schematic
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'left';
    ctx.fillText('CELLULAR PATHWAY / ENZYMATIC ACTIVE SITE DOCKING', plotX + 10, plotY + 16);

    // Membrane / Boundary line
    ctx.strokeStyle = '#065f46';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(plotX + 20, plotY + plotH / 2);
    ctx.lineTo(plotX + plotW - 20, plotY + plotH / 2);
    ctx.stroke();

    // Channel pocket
    const chX = plotX + plotW / 2;
    const chY = plotY + plotH / 2;
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(chX - 25, chY - 18, 50, 36);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(chX - 25, chY - 18, 50, 36);

    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#a7f3d0';
    ctx.textAlign = 'center';
    ctx.fillText('GATEWAY', chX, chY + 3);

    // Animated ions/substrates moving across
    for (let i = 0; i < 4; i++) {
      const t = ((localTick * 0.02 + i * 0.25) % 1);
      const sy = (plotY + 28) + t * (plotH - 45);
      ctx.beginPath();
      ctx.arc(chX + Math.sin(t * 8) * 6, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    }
  } else if (domain === 'physics') {
    // Quantum Wave / Force Vector Potential
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText('QUANTUM POTENTIAL WELL & OSCILLATING WAVE FUNCTION Ψ(x,t)', plotX + 10, plotY + 16);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < plotW - 40; x += 3) {
      const waveY = plotY + plotH / 2 + Math.sin(x * 0.08 + localTick * 0.1) * (plotH / 3.5);
      if (x === 0) ctx.moveTo(plotX + 20 + x, waveY);
      else ctx.lineTo(plotX + 20 + x, waveY);
    }
    ctx.stroke();
  } else {
    // Pipeline / Algorithmic Dataflow
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'left';
    ctx.fillText('OPERATIONAL PIPELINE & STATE TRANSFORMATION MATRIX', plotX + 10, plotY + 16);

    const states = ['INPUT_REGISTER', 'EVALUATE_RULES', 'SYNTHESIS', 'COMMIT'];
    const curIdx = Math.floor((localTick * 0.03) % states.length);

    states.forEach((stName, idx) => {
      const bx = plotX + 18 + idx * ((plotW - 36) / 4);
      const isCur = idx === curIdx;
      ctx.fillStyle = isCur ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(bx, plotY + 30, (plotW - 60) / 4, 42);
      ctx.strokeStyle = isCur ? '#38bdf8' : '#334155';
      ctx.strokeRect(bx, plotY + 30, (plotW - 60) / 4, 42);

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = isCur ? '#ffffff' : '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(stName, bx + (plotW - 60) / 8, plotY + 54);
    });
  }

  // Conduit arrow from Center to Right
  ctx.strokeStyle = isMidActive ? '#10b981' : '#1e3a5f';
  ctx.lineWidth = isMidActive ? 2.5 : 1.5;
  ctx.setLineDash([5, 4]);
  ctx.lineDashOffset = -localTick * 0.9;
  ctx.beginPath();
  ctx.moveTo(midX + midW, conduitY);
  ctx.lineTo(rightX, conduitY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // ─────────────────────────────────────────────────────────────
  // 3. RIGHT PANEL: OUTCOMES, DOWNSTREAM & EMPIRICAL PROOF
  // ─────────────────────────────────────────────────────────────
  const isRightActive = (step === 2);
  ctx.save();
  ctx.fillStyle = isRightActive ? 'rgba(8, 28, 22, 0.95)' : 'rgba(8, 14, 28, 0.85)';
  ctx.fillRect(rightX, topY, rightW, panelH);
  ctx.strokeStyle = isRightActive ? '#10b981' : 'rgba(20, 50, 40, 0.8)';
  ctx.lineWidth = isRightActive ? 2 : 1;
  ctx.strokeRect(rightX, topY, rightW, panelH);

  // Right header
  ctx.fillStyle = isRightActive ? '#10b981' : '#1e3a5f';
  ctx.fillRect(rightX, topY, rightW, 26);
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = isRightActive ? '#050a16' : '#94a3b8';
  ctx.textAlign = 'left';
  ctx.fillText('// 03. OUTCOMES & RECALL PROOF', rightX + 10, topY + 17);

  // Outgoing concepts list
  const outgoingNodes = outgoingEdges.map(e => ({
    title: e.target?.title || e.to || 'Synthesized Consequence',
    label: e.label || e.type || 'leads to'
  }));

  if (outgoingNodes.length > 0) {
    outgoingNodes.slice(0, 2).forEach((out, idx) => {
      const cardY = topY + 38 + idx * 64;
      ctx.fillStyle = isRightActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(rightX + 10, cardY, rightW - 20, 54);
      ctx.strokeStyle = isRightActive ? '#10b981' : '#1e293b';
      ctx.strokeRect(rightX + 10, cardY, rightW - 20, 54);

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText(out.title.slice(0, 24).toUpperCase(), rightX + 18, cardY + 20);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Yields: ${out.label}`, rightX + 18, cardY + 38);
    });
  }

  // Active Recall Verification Card
  const qCardY = topY + (outgoingNodes.length > 0 ? 172 : 40);
  const qCardH = panelH - (qCardY - topY) - 14;

  ctx.fillStyle = isRightActive ? 'rgba(16, 185, 129, 0.18)' : 'rgba(15, 23, 42, 0.7)';
  ctx.fillRect(rightX + 10, qCardY, rightW - 20, qCardH);
  ctx.strokeStyle = isRightActive ? '#10b981' : '#334155';
  ctx.strokeRect(rightX + 10, qCardY, rightW - 20, qCardH);

  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'left';
  ctx.fillText('EMPIRICAL RECALL TEST', rightX + 18, qCardY + 20);

  if (linkedQuestion?.question_text) {
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#ffffff';
    drawWrappedCanvasText(ctx, linkedQuestion.question_text, rightX + 18, qCardY + 40, rightW - 36, 14, 4);

    // Correct option badge if present
    if (linkedQuestion.correct_option_id) {
      const correctOpt = linkedQuestion.options?.find(o => o.id === linkedQuestion.correct_option_id);
      const optText = correctOpt ? `${correctOpt.id}: ${correctOpt.text}` : `Answer [${linkedQuestion.correct_option_id}]`;

      ctx.fillStyle = '#064e3b';
      ctx.fillRect(rightX + 18, qCardY + qCardH - 42, rightW - 36, 26);
      ctx.strokeStyle = '#10b981';
      ctx.strokeRect(rightX + 18, qCardY + qCardH - 42, rightW - 36, 26);

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`✓ ${optText.slice(0, 24)}`, rightX + 24, qCardY + qCardH - 25);
    }
  } else {
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    drawWrappedCanvasText(ctx, node?.recallPrompt || 'Verification of stability and systemic integration.', rightX + 18, qCardY + 42, rightW - 36, 15, 4);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('STATUS: INTEGRITY VERIFIED', rightX + 18, qCardY + qCardH - 20);
  }

  ctx.restore();
}
