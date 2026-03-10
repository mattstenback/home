// ── Shared Verlet rope chain physics factory ─────────────────────
// Creates a pixel-art pull chain with full interaction physics.
// Each call returns an independent chain instance.

const NS = 'http://www.w3.org/2000/svg';

export function createChain({
  svgId,
  handleHitId,
  rootId,
  onTrigger,
  cursorLabel = 'Pull',
  handleSymbolId,
  buildHandleSymbol, // (NS) => SVGSymbolElement
  numNodes = 14,
  linkLen = 8,
  maxBeads = 35,
  cx = 10,
  gravity = 0.5,
  damping = 0.87,
  iters = 8,
  trigger = 50,
  cursorR = 50,
  cursorF = 0.15,
}) {
  const naturalH = (numNodes - 1) * linkLen;
  const maxPull = naturalH * 2;

  const svg = document.getElementById(svgId);
  const handleHit = document.getElementById(handleHitId);
  const root = document.getElementById(rootId);

  let nodes = [];
  let linkEls = [];
  let handleEl = null;
  let dragging = false;
  let handleHovered = false;
  let pendingToggle = false;
  let dragTargetX = cx;
  let dragTargetY = naturalH;
  let startDragX = cx;
  let startDragY = naturalH;
  let startClientX = 0;
  let startClientY = 0;
  let animId = null;
  let loopStart = 0;
  let mouseX = -9999;
  let mouseY = -9999;
  let prevMouseX = -9999;
  let prevMouseY = -9999;

  // ── Build SVG ──────────────────────────────────────────────────
  (function buildSVG() {
    const defs = document.createElementNS(NS, 'defs');

    // Bead symbol (shared pixel style)
    const sym = document.createElementNS(NS, 'symbol');
    sym.id = `${svgId}-bead-sym`;
    sym.setAttribute('overflow', 'visible');
    const bb = document.createElementNS(NS, 'rect');
    bb.setAttribute('x', '-3'); bb.setAttribute('y', '-3');
    bb.setAttribute('width', '6'); bb.setAttribute('height', '6');
    bb.setAttribute('fill', '#a0a0a0');
    sym.appendChild(bb);
    const bh = document.createElementNS(NS, 'rect');
    bh.setAttribute('x', '-3'); bh.setAttribute('y', '-3');
    bh.setAttribute('width', '2'); bh.setAttribute('height', '2');
    bh.setAttribute('fill', '#d0d0d0');
    sym.appendChild(bh);
    const bs = document.createElementNS(NS, 'rect');
    bs.setAttribute('x', '1'); bs.setAttribute('y', '1');
    bs.setAttribute('width', '2'); bs.setAttribute('height', '2');
    bs.setAttribute('fill', '#707070');
    sym.appendChild(bs);
    defs.appendChild(sym);

    // Handle symbol (custom per chain)
    if (buildHandleSymbol) {
      const hSym = buildHandleSymbol(NS);
      hSym.id = handleSymbolId;
      hSym.setAttribute('overflow', 'visible');
      defs.appendChild(hSym);
    }

    svg.appendChild(defs);

    for (let i = 0; i < maxBeads; i++) {
      const el = document.createElementNS(NS, 'use');
      el.setAttribute('href', `#${svgId}-bead-sym`);
      svg.appendChild(el);
      linkEls.push(el);
    }

    handleEl = document.createElementNS(NS, 'use');
    handleEl.setAttribute('href', `#${handleSymbolId}`);
    handleEl.style.pointerEvents = 'none';
    svg.appendChild(handleEl);
  })();

  // ── Init nodes ─────────────────────────────────────────────────
  const swingX = (Math.random() < 0.5 ? 1 : -1) * (15 + Math.random() * 25);
  function initNodes() {
    nodes.length = 0;
    loopStart = performance.now();
    for (let i = 0; i < numNodes; i++) {
      const restY = i * linkLen;
      const y = restY - 200;
      const t = i / (numNodes - 1);
      const x = cx + swingX * t;
      nodes.push({ x, y, px: x, py: y - 14 });
    }
  }
  initNodes();

  // ── Physics tick ───────────────────────────────────────────────
  function tick() {
    // Verlet integration
    for (let i = 1; i < numNodes; i++) {
      const n = nodes[i];
      const vx = (n.x - n.px) * damping;
      const vy = (n.y - n.py) * damping;
      n.px = n.x; n.py = n.y;
      n.x += vx; n.y += vy + gravity;
    }

    // Cursor influence — tangential nudge
    const cvx = mouseX - prevMouseX, cvy = mouseY - prevMouseY;
    const speed = Math.sqrt(cvx * cvx + cvy * cvy);
    if (speed > 0.3) {
      for (let i = 1; i < numNodes; i++) {
        const n = nodes[i];
        const dx = n.x - mouseX, dy = n.y - mouseY;
        const d2 = dx * dx + dy * dy;
        if (d2 < cursorR * cursorR) {
          const dist = Math.sqrt(d2);
          const falloff = 1 - dist / cursorR;
          const nx = dx / dist, ny = dy / dist;
          const dot = cvx * nx + cvy * ny;
          const tx = cvx - dot * nx, ty = cvy - dot * ny;
          n.x += tx * falloff * cursorF;
          n.y += ty * falloff * cursorF;
        }
      }
    }

    // Handle sticky
    if (!dragging && handleHovered) {
      const last = nodes[numNodes - 1];
      const dx = mouseX - last.x, dy = mouseY - last.y;
      last.x += dx * 0.06;
      last.y += dy * 0.06;
    }

    // Jakobsen constraints
    for (let iter = 0; iter < iters; iter++) {
      nodes[0].x = cx; nodes[0].y = 0;
      for (let i = 0; i < numNodes - 1; i++) {
        const a = nodes[i], b = nodes[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const c = (d - linkLen) / d * 0.5;
        if (i > 0) { a.x += dx * c; a.y += dy * c; }
        b.x -= dx * c; b.y -= dy * c;
      }
      if (dragging) {
        nodes[numNodes - 1].x = dragTargetX;
        nodes[numNodes - 1].y = dragTargetY;
      }
    }

    if (dragging) {
      const pullDist = Math.sqrt((dragTargetX - cx) ** 2 + dragTargetY ** 2) - naturalH;
      handleEl.style.opacity = (pullDist / trigger) > 0.75 ? '0.5' : '1';
    }
  }

  // ── Point on rope ──────────────────────────────────────────────
  function pointOnRope(t) {
    const segs = []; let total = 0;
    for (let i = 0; i < numNodes - 1; i++) {
      const dx = nodes[i+1].x - nodes[i].x, dy = nodes[i+1].y - nodes[i].y;
      const l = Math.sqrt(dx*dx + dy*dy);
      segs.push(l); total += l;
    }
    const target = t * total; let acc = 0;
    for (let i = 0; i < numNodes - 1; i++) {
      const next = acc + segs[i];
      if (next >= target || i === numNodes - 2) {
        const lt = segs[i] > 0 ? Math.min(1, (target - acc) / segs[i]) : 0;
        return {
          x: nodes[i].x + (nodes[i+1].x - nodes[i].x) * lt,
          y: nodes[i].y + (nodes[i+1].y - nodes[i].y) * lt,
        };
      }
      acc = next;
    }
    return { x: nodes[numNodes-1].x, y: nodes[numNodes-1].y };
  }

  // ── Render ─────────────────────────────────────────────────────
  function render() {
    const last = nodes[numNodes - 1];
    svg.setAttribute('height', Math.max(last.y + 22, 20));

    let ropeLen = 0;
    for (let i = 0; i < numNodes - 1; i++) {
      const dx = nodes[i+1].x - nodes[i].x, dy = nodes[i+1].y - nodes[i].y;
      ropeLen += Math.sqrt(dx*dx + dy*dy);
    }
    const numBeads = Math.min(maxBeads, Math.floor(ropeLen / linkLen));

    for (let i = 0; i < maxBeads; i++) {
      const bi = i + 1;
      if (i < numBeads) {
        const t = Math.max(0, 1 - (bi * linkLen) / ropeLen);
        const pt = pointOnRope(t);
        linkEls[i].setAttribute('transform', `translate(${pt.x},${pt.y})`);
        linkEls[i].style.display = '';
      } else {
        linkEls[i].style.display = 'none';
      }
    }

    handleEl.setAttribute('transform', `translate(${last.x},${last.y + 5})`);
    handleHit.style.left = `${last.x}px`;
    handleHit.style.top = `${last.y + 5}px`;
  }

  // ── Loop control ───────────────────────────────────────────────
  function settled() {
    return nodes.every((n, i) =>
      i === 0 || (Math.abs(n.x - n.px) < 0.05 && Math.abs(n.y - n.py) < 0.05));
  }
  function cursorNear() {
    return nodes.some(n => (n.x - mouseX) ** 2 + (n.y - mouseY) ** 2 < cursorR ** 2);
  }
  function loop() {
    tick(); render();
    const dropping = performance.now() - loopStart < 2500;
    animId = (dropping || !settled() || dragging || cursorNear())
      ? requestAnimationFrame(loop) : null;
  }
  function run() { if (!animId) animId = requestAnimationFrame(loop); }

  // ── Cursor tracking ────────────────────────────────────────────
  document.addEventListener('mousemove', e => {
    prevMouseX = mouseX; prevMouseY = mouseY;
    const r = svg.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
    run();
  });

  // ── Cursor ring ────────────────────────────────────────────────
  handleHit.addEventListener('mouseenter', () => {
    handleHovered = true;
    window.__cursorRing?.setLabel(cursorLabel);
    window.__cursorRing?.show();
    window.__cursorRing?.showLabel();
  });
  handleHit.addEventListener('mouseleave', () => {
    handleHovered = false;
    window.__cursorRing?.hide();
    window.__cursorRing?.hideLabel();
  });

  // ── Pointer events ─────────────────────────────────────────────
  handleHit.addEventListener('pointerdown', e => {
    e.preventDefault();
    dragging = true; pendingToggle = false;
    startClientX = e.clientX; startClientY = e.clientY;
    startDragX = nodes[numNodes - 1].x;
    startDragY = nodes[numNodes - 1].y;
    handleHit.setPointerCapture(e.pointerId);
    document.body.classList.add('chain-grabbing');
    window.__cursorRing?.hideAll();
    run();
  });

  handleHit.addEventListener('pointermove', e => {
    if (!dragging) return;
    let tx = startDragX + (e.clientX - startClientX);
    let ty = startDragY + (e.clientY - startClientY);
    const tdx = tx - cx, tdy = ty;
    const dist = Math.sqrt(tdx * tdx + tdy * tdy);
    if (dist > maxPull) {
      const s = maxPull / dist;
      tx = cx + tdx * s; ty = tdy * s;
    }
    dragTargetX = tx; dragTargetY = ty;
    if (dist - naturalH >= trigger) pendingToggle = true;
    run();
  });

  handleHit.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    handleEl.style.opacity = '1';
    document.body.classList.remove('chain-grabbing');
    window.__cursorRing?.unhideAll();
    if (pendingToggle && onTrigger) onTrigger();
    pendingToggle = false;
    dragTargetX = cx; dragTargetY = naturalH;
    run();
  });

  // ── Public API ─────────────────────────────────────────────────
  return {
    initNodes,
    render,
    run,
    reveal() {
      root.style.visibility = '';
      initNodes();
      render();
      run();
    },
    hide() {
      root.style.visibility = 'hidden';
      if (animId) { cancelAnimationFrame(animId); animId = null; }
    },
    isVisible() {
      return root.style.visibility !== 'hidden';
    },
  };
}
