import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Zap,
  HelpCircle,
  Eye,
  Crosshair,
  Award
} from 'lucide-react';
import { retroAudio } from '../audio/retroAudio';

const CANVAS_W = 1050;
const CANVAS_H = 520;

// Text wrapping helper for Canvas with exact line measurement
function drawWrappedNodeText(ctx, title, subtitle, subtitleColor, x, y, maxW, isCitadel) {
  // Title in Space Grotesk bold
  ctx.font = '700 11px "Space Grotesk", monospace, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const words = (title || '').toUpperCase().split(' ');
  const lines = [];
  let cur = '';

  for (let i = 0; i < words.length; i++) {
    const test = cur ? cur + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = words[i];
      if (lines.length === 2) break;
    } else {
      cur = test;
    }
  }
  if (cur && lines.length < 2) lines.push(cur);

  if (lines.length === 1) {
    ctx.fillText(lines[0], x, y + 2);
    // Subtitle nicely spaced below single line title
    ctx.font = '9px monospace';
    ctx.fillStyle = subtitleColor;
    ctx.fillText(subtitle, x, y + 20);
  } else {
    ctx.fillText(lines[0], x, y - 1);
    ctx.fillText(lines[1], x, y + 12);
    // Subtitle placed cleanly below 2nd line
    ctx.font = '9px monospace';
    ctx.fillStyle = subtitleColor;
    ctx.fillText(subtitle, x, y + 26);
  }
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

// Compute clean punchy subtitles matching reference layout
function getPunchySubtitle(title, explanation, cluster, index, isCitadel, isWaypoint) {
  const t = (title || '').toLowerCase();
  if (t.includes('alkyl halide')) return 'Substrate Core';
  if (t.includes('e2') || t.includes('elimination')) return 'Concerted Elimination';
  if (t.includes('zaitsev')) return 'More Substituted';
  if (t.includes('hofmann')) return 'Less Substituted';
  if (t.includes('steric') || t.includes('buok')) return 'Unlocks at Level 5';
  if (t.includes('dehydration')) return 'β-Elimination Substrate';
  if (t.includes('addition')) return 'Electrophilic Pathway';
  if (t.includes('hydrogenation')) return 'Catalytic Reduction';
  if (t.includes('bromine')) return 'Unsaturation Test';
  
  if (cluster && cluster.length <= 20) return cluster;
  if (explanation) {
    const clause = explanation.split(/[,.:;—]/)[0].trim();
    if (clause.length <= 22) return clause;
    return clause.substring(0, 20) + '…';
  }
  return isCitadel ? 'Primary Core' : `Phase 0${index + 1}`;
}

export default function ConceptGraphWorld({
  data,
  selectedNode,
  onSelectNode,
  onOpenQuiz,
  onNodeQuizTarget
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const tickRef = useRef(0);

  // Extract concepts / nodes from data
  const rawNodes = data?.nodes || data?.concepts || [];

  const nodes = useMemo(() => {
    if (!rawNodes || rawNodes.length === 0) return [];

    const total = rawNodes.length;

    return rawNodes.map((item, i) => {
      const id = String(item.node_id || item.id || `node_${i}`);
      const title = item.title || item.name || `Node ${i + 1}`;
      const explanation = item.explanation || item.definition || '';
      const importance = item.importance || (i === 1 ? 'primary' : 'secondary');
      const cluster = item.suggested_cluster || item.cluster || 'Core Topic';
      const recallPrompt = item.recallPrompt || item.recall_prompt;

      const isCitadel = importance === 'primary' || i === 1 || (total === 1);
      const isWaypoint = !isCitadel && (i === 2 || i === 3);

      const width = isCitadel ? 250 : 216;
      const height = isCitadel ? 116 : 94;

      // Perfectly centered, uncluttered layout without any top HUD blocking the view
      let x, y;
      if (total === 1) {
        x = 400;
        y = 190;
      } else if (total === 2) {
        x = i === 0 ? 200 : 580;
        y = 190;
      } else if (total === 3) {
        x = 90 + i * 320;
        y = 190;
      } else if (total === 4) {
        const coords = [
          { x: 90, y: 190 },
          { x: 400, y: 190 },
          { x: 730, y: 90 },
          { x: 730, y: 310 }
        ];
        x = coords[i].x;
        y = coords[i].y;
      } else if (total === 5) {
        // Balanced 5-node cyber layout centered across full canvas
        const coords = [
          { x: 80, y: 200 },   // [SHARD: 01]
          { x: 380, y: 190 },  // ★ CITADEL NODE
          { x: 720, y: 80 },   // [WAYPOINT: THERMODYNAMIC]
          { x: 690, y: 320 },  // [WAYPOINT: KINETIC]
          { x: 810, y: 200 }   // [SHARD: 05] 🔒
        ];
        x = coords[i].x;
        y = coords[i].y;
      } else {
        const col = i % 3;
        const row = Math.floor(i / 3);
        x = 80 + col * 320;
        y = 80 + row * 180;
      }

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
        roleBadge = '🔒';
        iconType = 'shield';
      }

      const colors = ['#38bdf8', '#fbbf24', '#f59e0b', '#818cf8', '#64748b', '#22d3ee'];
      const themeColor = isCitadel ? '#fbbf24' : (isWaypoint && i === 2 ? '#f59e0b' : colors[i % colors.length]);
      const subtitle = getPunchySubtitle(title, explanation, cluster, i, isCitadel, isWaypoint);

      return {
        id,
        node_id: id,
        title,
        explanation,
        importance,
        cluster,
        recallPrompt,
        subtitle,
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
  }, [rawNodes]);

  // Build edges
  const edges = useMemo(() => {
    const rawRels = data?.relationships || data?.edges || [];
    const list = [];

    if (rawRels.length > 0) {
      rawRels.forEach((r, idx) => {
        const sNode = nodes.find(n => n.id === r.from || n.id === r.source_id || n.title.toLowerCase() === String(r.from || r.source_id).toLowerCase());
        const tNode = nodes.find(n => n.id === r.to || n.id === r.target_id || n.title.toLowerCase() === String(r.to || r.target_id).toLowerCase());
        if (sNode && tNode) {
          list.push({
            id: `edge_${idx}`,
            source: sNode,
            target: tNode,
            label: r.type || r.relationship_type ? `<${r.type || r.relationship_type}>` : `<transforms_to>`
          });
        }
      });
    }

    // Default graph conduits matching reference diagram
    if (list.length === 0 && nodes.length > 1) {
      const citadel = nodes.find(n => n.isCitadel) || nodes[1] || nodes[0];
      nodes.forEach((n, idx) => {
        if (n.id !== citadel.id) {
          if (idx === 0) {
            list.push({ id: `e_${idx}`, source: n, target: citadel, label: '<typea?>' });
          } else if (idx === 2) {
            list.push({ id: `e_${idx}`, source: citadel, target: n, label: '<operates_via>' });
          } else if (idx === 3) {
            list.push({ id: `e_${idx}`, source: citadel, target: n, label: '<bulky_base_divergence>' });
          } else if (idx === 4 && nodes[2]) {
            list.push({ id: `e_${idx}`, source: nodes[2], target: n, label: '<steric_lock>' });
          }
        }
      });
    }

    return list;
  }, [nodes, data]);

  // Set default selected node
  useEffect(() => {
    if (nodes.length > 0 && !selectedNode) {
      const citadel = nodes.find(n => n.isCitadel) || nodes[0];
      onSelectNode?.(citadel);
    }
  }, [nodes, selectedNode, onSelectNode]);

  // Canvas Node Click Interaction (no zooming or dragging drift)
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let clickedNode = null;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (
        mouseX >= n.x &&
        mouseX <= n.x + n.width &&
        mouseY >= n.y &&
        mouseY <= n.y + n.height
      ) {
        clickedNode = n;
        break;
      }
    }

    if (clickedNode) {
      retroAudio.playBlip?.();
      onSelectNode?.(clickedNode);
    }
  };

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let running = true;

    const render = () => {
      if (!running) return;
      tickRef.current += 1;
      const tick = tickRef.current;

      // Dark sci-fi background
      ctx.fillStyle = '#040813';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Cyber Grid
      ctx.strokeStyle = 'rgba(14, 116, 144, 0.12)';
      ctx.lineWidth = 1;
      const gridSize = 40;

      for (let x = 0; x < CANVAS_W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_H);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }

      // Conduits / Bézier connections
      edges.forEach((edge, eIdx) => {
        const s = edge.source;
        const t = edge.target;
        const fromX = s.x + s.width;
        const fromY = s.y + s.height / 2;
        const toX = t.x;
        const toY = t.y + t.height / 2;

        const isTargetConnected = selectedNode?.id === s.id || selectedNode?.id === t.id;
        const lineColor = isTargetConnected ? '#38bdf8' : 'rgba(56, 189, 248, 0.45)';

        // S-curve control points
        const dx = toX - fromX;
        const cp1x = fromX + dx * 0.45;
        const cp1y = fromY;
        const cp2x = fromX + dx * 0.55;
        const cp2y = toY;

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = isTargetConnected ? 2.5 : 1.5;
        ctx.setLineDash([5, 4]);
        ctx.lineDashOffset = -tick * 0.8;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Direction arrow at target node
        const angle = Math.atan2(toY - cp2y, toX - cp2x);
        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - Math.cos(angle - 0.45) * 8, toY - Math.sin(angle - 0.45) * 8);
        ctx.lineTo(toX - Math.cos(angle + 0.45) * 8, toY - Math.sin(angle + 0.45) * 8);
        ctx.closePath();
        ctx.fill();

        // Pulsing energy packet traveling down conduit
        const progress = ((tick * 0.012 + eIdx * 0.28) % 1);
        const packetX = bezierPoint(fromX, cp1x, cp2x, toX, progress);
        const packetY = bezierPoint(fromY, cp1y, cp2y, toY, progress);

        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 8;
        ctx.fillRect(packetX - 2.5, packetY - 2.5, 5, 5);
        ctx.shadowBlur = 0;

        // Relationship tag badge at midpoint
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

      // Draw rectangular cyber nodes matching reference image
      nodes.forEach((n) => {
        const isSelected = selectedNode?.id === n.id;
        const x = n.x;
        const y = n.y;
        const w = n.width;
        const h = n.height;

        ctx.save();

        // [ CURRENT TARGET ] badge above Citadel or Selected Node
        if (n.isCitadel || isSelected) {
          ctx.fillStyle = '#eab308';
          ctx.fillRect(x + w / 2 - 48, y - 11, 96, 12);
          ctx.font = '700 7px monospace';
          ctx.fillStyle = '#050c18';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('CURRENT TARGET', x + w / 2, y - 5);
        }

        // Glow
        if (isSelected || n.isCitadel) {
          ctx.shadowColor = n.isCitadel ? 'rgba(234, 179, 8, 0.45)' : 'rgba(56, 189, 248, 0.45)';
          ctx.shadowBlur = 14;
        }

        // Card Background
        ctx.fillStyle = isSelected ? '#081628' : '#07101e';
        ctx.fillRect(x, y, w, h);
        ctx.shadowBlur = 0;

        // Card Border
        let borderColor = '#1c3450';
        if (n.isCitadel) {
          borderColor = isSelected ? '#fbbf24' : '#ca8a04';
        } else if (n.isWaypoint && n.roleBadge === 'THERMODYNAMIC') {
          borderColor = isSelected ? '#f59e0b' : '#ca8a04';
        } else if (n.isWaypoint && n.roleBadge === 'KINETIC') {
          borderColor = isSelected ? '#38bdf8' : '#3b82f6';
        } else if (isSelected) {
          borderColor = '#38bdf8';
        }

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = isSelected ? 2 : 1.5;
        ctx.strokeRect(x, y, w, h);

        // Inner subtle outline
        if (n.isCitadel || isSelected) {
          ctx.strokeStyle = n.isCitadel ? 'rgba(250, 204, 21, 0.35)' : 'rgba(56, 189, 248, 0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
        }

        // ── Top Header Row ──
        ctx.font = '700 8px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = n.isCitadel ? '#facc15' : (n.isWaypoint && n.roleBadge === 'THERMODYNAMIC' ? '#f59e0b' : '#7dd3fc');
        ctx.fillText(n.roleLabel, x + 8, y + 7);

        ctx.textAlign = 'right';
        if (n.isCitadel) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(n.roleBadge, x + w - 8, y + 7);
        } else if (n.isWaypoint) {
          ctx.fillStyle = n.roleBadge === 'THERMODYNAMIC' ? '#38bdf8' : '#818cf8';
          ctx.fillText(n.roleBadge, x + w - 8, y + 7);
        } else if (n.iconType === 'shield') {
          // Lock symbol for Shard 05
          ctx.fillStyle = '#64748b';
          ctx.fillText('🔒', x + w - 8, y + 6);
        } else {
          // Green status indicator dot for Shard 01
          ctx.fillStyle = '#4ade80';
          ctx.fillRect(x + w - 12, y + 7, 5, 5);
        }

        // Header separator
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 20);
        ctx.lineTo(x + w - 8, y + 20);
        ctx.stroke();

        // ── Icon Box on the Left ──
        const iconBoxSize = n.isCitadel ? 34 : 30;
        const iconBoxX = x + 10;
        const iconBoxY = y + 27;

        ctx.fillStyle = '#061324';
        ctx.fillRect(iconBoxX, iconBoxY, iconBoxSize, iconBoxSize);
        ctx.strokeStyle = isSelected ? n.themeColor : '#223c58';
        ctx.lineWidth = 1;
        ctx.strokeRect(iconBoxX, iconBoxY, iconBoxSize, iconBoxSize);

        // Icon Rendering
        ctx.save();
        ctx.translate(iconBoxX + iconBoxSize / 2, iconBoxY + iconBoxSize / 2);
        if (n.iconType === 'citadel') {
          // Citadel / Fortress
          ctx.fillStyle = '#fde047';
          ctx.fillRect(-6, -6, 12, 12);
          ctx.fillRect(-8, -2, 16, 8);
          ctx.fillStyle = '#061324';
          ctx.fillRect(-2, -6, 4, 4);
        } else if (n.iconType === 'flame') {
          // Flame icon for Thermodynamic
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.bezierCurveTo(5, -2, 5, 4, 0, 7);
          ctx.bezierCurveTo(-5, 4, -5, -2, 0, -6);
          ctx.stroke();
        } else if (n.iconType === 'branch') {
          // Funnel / Branching icon for Kinetic
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
          // Shield icon
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-4, -2, 8, 8);
          ctx.beginPath();
          ctx.arc(0, -2, 3, Math.PI, 0);
          ctx.stroke();
        } else {
          // Molecule matrix dots for Shard 01
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-5, -5, 4, 4);
          ctx.fillRect(1, -5, 4, 4);
          ctx.fillRect(-5, 1, 4, 4);
          ctx.fillRect(1, 1, 4, 4);
        }
        ctx.restore();

        // ── Title & Subtitle with Clean Text Wrapping ──
        const textX = iconBoxX + iconBoxSize + 8;
        const textMaxW = w - (iconBoxSize + 22);

        let subtitleColor = '#94a3b8';
        if (n.isCitadel) subtitleColor = '#7dd3fc';
        else if (n.isWaypoint && n.roleBadge === 'THERMODYNAMIC') subtitleColor = '#4ade80';
        else if (n.isWaypoint && n.roleBadge === 'KINETIC') subtitleColor = '#cbd5e1';
        else if (n.iconType === 'shield') subtitleColor = '#64748b';

        drawWrappedNodeText(ctx, n.title, n.subtitle, subtitleColor, textX, iconBoxY, textMaxW, n.isCitadel);

        // ── Citadel Node Bottom Row ──
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
          ctx.fillText('QUEST READY', x + 10, y + 97);

          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'right';
          ctx.fillText('[120 XP]', x + w - 10, y + 97);
        }

        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [nodes, edges, selectedNode, data]);

  return (
    <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)] bg-[#040813]">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onMouseDown={handleMouseDown}
        className="w-full h-auto block cursor-pointer"
      />

      {/* Bottom Floating Target Bar */}
      {selectedNode && (
        <div className="absolute bottom-3 left-3 right-3 p-3 rounded bg-[#070e1c]/95 border border-cyan-400 backdrop-blur-md flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded bg-cyan-950 border border-cyan-400 text-cyan-300 shrink-0">
              <Crosshair className="w-4 h-4 animate-spin" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white truncate">
                  {selectedNode.title}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-400/50 text-[9px] font-mono text-cyan-300 uppercase">
                  {selectedNode.roleBadge}
                </span>
              </div>
              <p className="font-sans text-[11px] text-slate-300 truncate mt-0.5">
                {selectedNode.explanation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedNode.recallPrompt && (
              <div className="px-3 py-1.5 rounded bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>INSPECTING NODE</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
