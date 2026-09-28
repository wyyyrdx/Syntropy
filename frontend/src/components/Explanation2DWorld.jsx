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

        // Dynamic Diagram for Selected Concept
        const cx = W / 2;
        const cy = H / 2 - 25;

        // Header Telemetry
        ctx.font = '700 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = themeCol;
        ctx.textAlign = 'left';
        ctx.fillText(`CONCEPT ARCHITECTURE: ${nodeTitle.toUpperCase()}`, 25, 30);
        ctx.font = '11px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`${nodeCluster}  |  ACTIVE STEP: [STAGE ${diagramStep + 1}]  |  CYCLE: ${(localTick % 1000)}`, 25, 48);

        // Left Input Panel
        const inX = cx - 280;
        const inY = cy;
        ctx.fillStyle = diagramStep === 0 ? 'rgba(6, 182, 212, 0.15)' : '#0b1324';
        ctx.fillRect(inX - 70, inY - 70, 140, 140);
        ctx.strokeStyle = diagramStep === 0 ? '#22d3ee' : '#1e293b';
        ctx.lineWidth = diagramStep === 0 ? 2.5 : 1.5;
        ctx.strokeRect(inX - 70, inY - 70, 140, 140);

        ctx.font = '700 10px monospace';
        ctx.fillStyle = diagramStep === 0 ? '#22d3ee' : '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('INPUT SIGNALS', inX, inY - 50);

        ['Raw Precursor', 'Config Param', 'Signal State'].forEach((lbl, idx) => {
          const py = inY - 20 + idx * 26;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(inX - 58, py - 9, 116, 18);
          ctx.strokeStyle = '#334155';
          ctx.strokeRect(inX - 58, py - 9, 116, 18);
          ctx.font = '9px monospace';
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(lbl, inX, py + 3);
        });

        // Conduit to Core
        ctx.strokeStyle = diagramStep === 0 ? '#22d3ee' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -localTick * 0.9;
        ctx.beginPath();
        ctx.moveTo(inX + 70, inY);
        ctx.lineTo(cx - 150, inY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Center Core
        const coreW = 290;
        const coreH = 170;
        ctx.fillStyle = diagramStep === 1 ? 'rgba(15, 23, 42, 0.95)' : '#070f1e';
        ctx.fillRect(cx - coreW / 2, cy - coreH / 2, coreW, coreH);
        ctx.strokeStyle = diagramStep === 1 ? themeCol : '#224060';
        ctx.lineWidth = diagramStep === 1 ? 3 : 1.5;
        ctx.strokeRect(cx - coreW / 2, cy - coreH / 2, coreW, coreH);

        ctx.font = '700 12px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(nodeTitle, cx, cy - 60);

        // Waves inside core
        ctx.strokeStyle = diagramStep === 1 ? 'rgba(34, 211, 238, 0.8)' : 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = cx - 110; x <= cx + 110; x += 4) {
          const yOffset = Math.sin((x * 0.05) + (localTick * 0.1)) * (diagramStep === 1 ? 18 : 8);
          if (x === cx - 110) ctx.moveTo(x, cy - 10 + yOffset);
          else ctx.lineTo(x, cy - 10 + yOffset);
        }
        ctx.stroke();

        // Gauges
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 110, cy + 22, 220, 16);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(cx - 110, cy + 22, 220, 16);

        const progressFill = ((localTick * 1.2) % 220);
        ctx.fillStyle = themeCol;
        ctx.fillRect(cx - 110, cy + 22, progressFill, 16);

        ctx.font = '9px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`EXECUTION STATUS: ${Math.round((progressFill / 220) * 100)}%`, cx, cy + 34);

        // Right Output Panel
        const outX = cx + 280;
        const outY = cy;

        ctx.strokeStyle = diagramStep === 2 ? '#10b981' : 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -localTick * 0.9;
        ctx.beginPath();
        ctx.moveTo(cx + 150, outY);
        ctx.lineTo(outX - 70, outY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = diagramStep === 2 ? 'rgba(16, 185, 129, 0.15)' : '#0b1324';
        ctx.fillRect(outX - 70, outY - 70, 140, 140);
        ctx.strokeStyle = diagramStep === 2 ? '#10b981' : '#1e293b';
        ctx.lineWidth = diagramStep === 2 ? 2.5 : 1.5;
        ctx.strokeRect(outX - 70, outY - 70, 140, 140);

        ctx.font = '700 10px monospace';
        ctx.fillStyle = diagramStep === 2 ? '#10b981' : '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('DISPATCH TERMINAL', outX, outY - 50);

        ['Verified Output', 'State Bus', 'Downstream Pipe'].forEach((lbl, idx) => {
          const py = outY - 20 + idx * 26;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(outX - 58, py - 9, 116, 18);
          ctx.strokeStyle = '#334155';
          ctx.strokeRect(outX - 58, py - 9, 116, 18);
          ctx.font = '9px monospace';
          ctx.fillStyle = '#a7f3d0';
          ctx.fillText(lbl, outX, py + 3);
        });

        // Bottom Banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(25, H - 75, W - 50, 55);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.strokeRect(25, H - 75, W - 50, 55);

        ctx.font = '700 12px "Space Grotesk", sans-serif';
        ctx.fillStyle = themeCol;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`STAGE ${diagramStep + 1}: ${diagramStep === 0 ? 'Input Verification' : diagramStep === 1 ? 'Algorithmic Transformation' : 'Output Confirmation'}`, 40, H - 68);

        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(nodeExplanation, 40, H - 48);
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
  }, [activeTab, selectedNode, diagramStep, isSimulating, simulationSpeed]);

  /* ─────────────────────────────────────────────────────────────
     JSX RETURN: 2D DIAGRAM EXPLANATION
  ───────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col space-y-4">
      {/* ── Sub-Selector for Diagram Topic & Concept Nodes ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#080d19] p-2.5 rounded-lg border border-[#192742]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Layers className="w-3.5 h-3.5" />
            <span>2D DIAGRAM TOPIC:</span>
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
                className={`btn-pixel text-[8px] sm:text-[10px] py-1.5 px-2.5 flex items-center gap-1.5 ${
                  isCur ? 'btn-pixel-amber' : ''
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isCur ? '#ffffff' : n.themeColor }}></div>
                <span className="truncate max-w-[200px]">{n.title.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>2D SCHEMATICS ACTIVE</span>
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
                className="p-1.5 rounded bg-[#091325]/90 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 cursor-pointer backdrop-blur-sm"
                title={isSimulating ? 'Pause Animation' : 'Play Animation'}
              >
                {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  retroAudio.playBlip?.();
                  setDiagramStep(0);
                }}
                className="p-1.5 rounded bg-[#091325]/90 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 cursor-pointer backdrop-blur-sm"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step Navigation Bar */}
          <div className="p-3 bg-[#080d19] rounded-lg border border-[#192742] flex items-center justify-between gap-3">
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
                    : 'bg-[#0f172a] border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>PREV STEP</span>
              </button>

              <span className="font-mono text-xs text-slate-300 font-bold px-2">
                STEP {diagramStep + 1} OF 3
              </span>

              <button
                disabled={diagramStep >= 2}
                onClick={() => {
                  retroAudio.playBlip?.();
                  setDiagramStep((s) => s + 1);
                }}
                className={`px-3 py-1.5 rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
                  diagramStep >= 2
                    ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                    : 'bg-[#0f172a] border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer'
                }`}
              >
                <span>NEXT STEP</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Step Analysis Breakdown (1 col) */}
        <div className="p-4 rounded-lg bg-[#080d19] border border-[#192742] space-y-4 text-left flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-[#16233a] pb-2">
              <div className="font-mono text-xs font-bold text-cyan-400 uppercase">
                MECHANISM BREAKDOWN
              </div>
              <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                {selectedNode?.cluster || 'Core Topic'}
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-2">
              {[
                {
                  stage: 'Stage 1: Input Ingestion',
                  detail: `Prerequisites and input signals initialized for ${selectedNode?.title || 'core concept'}.`
                },
                {
                  stage: 'Stage 2: Core Transformation',
                  detail: selectedNode?.explanation || 'Transformation active.'
                },
                {
                  stage: 'Stage 3: Output Delivery',
                  detail: 'Artifacts and signals verified and transmitted downstream.'
                }
              ].map((st, idx) => {
                const isStepActive = diagramStep === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      retroAudio.playBlip?.();
                      setDiagramStep(idx);
                    }}
                    className={`p-2.5 rounded border transition-all cursor-pointer ${
                      isStepActive
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : 'bg-[#0a1120] border-[#141f36] opacity-75 hover:opacity-100 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold text-white flex items-center justify-between">
                      <span>{st.stage}</span>
                      {isStepActive && <span className="w-2 h-2 rounded-full bg-cyan-400"></span>}
                    </div>
                    <p className="font-sans text-[11px] text-slate-300 mt-1 leading-snug">
                      {st.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
