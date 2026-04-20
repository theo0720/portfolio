/**
 * particles.js — Grille réseau animée
 * Nœuds reliés par des arêtes, pulsations sur les hubs, interaction souris.
 * Thème : infrastructure réseau / IT — en cohérence avec le portfolio SISR.
 */

(function () {
  "use strict";

  const CFG = {
    nodeCount:    55,
    nodeRadius:   2.2,
    nodeRadiusBig:5.5,
    hubChance:    0.08,
    speed:        0.45,
    linkDist:     175,
    linkWidth:    0.9,
    pulseSpeed:   0.018,
    pulseMax:     28,
    mouseRadius:  160,
    mouseRepulse: 3.5,
    colorNode:    [27,  43,  75],
    colorGold:    [200, 169, 110],
    colorLink:    [27,  43,  75],
    alphaNode:    0.55,
    alphaHub:     0.80,
    alphaLink:    0.13,
    alphaPulse:   0.08,
  };

  function initCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    let W, H, nodes, raf;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width  = r.width;
      H = canvas.height = r.height;
    }

    function makeNode() {
      const isHub = Math.random() < CFG.hubChance;
      const col   = isHub ? CFG.colorGold : CFG.colorNode;
      return {
        x:     Math.random() * W,
        y:     Math.random() * H,
        vx:    (Math.random() - 0.5) * CFG.speed,
        vy:    (Math.random() - 0.5) * CFG.speed,
        r:     isHub ? CFG.nodeRadiusBig : CFG.nodeRadius,
        isHub,
        col,
        phase: Math.random() * Math.PI * 2,
      };
    }

    function build() {
      nodes = Array.from({ length: CFG.nodeCount }, makeNode);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const t = performance.now() * 0.001;

      /* Liens */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CFG.linkDist) {
            const ratio = 1 - dist / CFG.linkDist;
            const alpha = CFG.alphaLink * ratio * (a.isHub || b.isHub ? 2.2 : 1);
            const cr = Math.round((a.col[0] + b.col[0]) / 2);
            const cg = Math.round((a.col[1] + b.col[1]) / 2);
            const cb = Math.round((a.col[2] + b.col[2]) / 2);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${Math.min(alpha, 0.35)})`;
            ctx.lineWidth = CFG.linkWidth * (a.isHub || b.isHub ? 1.6 : 1);
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      /* Nœuds */
      for (const n of nodes) {
        if (n.isHub) {
          const pulse = (Math.sin(t * 1.8 + n.phase) + 1) / 2;
          const haloR = n.r + CFG.pulseMax * pulse;
          const grad = ctx.createRadialGradient(n.x, n.y, n.r, n.x, n.y, haloR);
          grad.addColorStop(0, `rgba(${n.col[0]},${n.col[1]},${n.col[2]},${CFG.alphaPulse * 1.5})`);
          grad.addColorStop(1, `rgba(${n.col[0]},${n.col[1]},${n.col[2]},0)`);
          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(${n.col[0]},${n.col[1]},${n.col[2]},${n.isHub ? CFG.alphaHub : CFG.alphaNode})`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        n.x += n.vx;
        n.y += n.vy;

        if (n.x < n.r)     { n.x = n.r;     n.vx =  Math.abs(n.vx); }
        if (n.x > W - n.r) { n.x = W - n.r; n.vx = -Math.abs(n.vx); }
        if (n.y < n.r)     { n.y = n.r;      n.vy =  Math.abs(n.vy); }
        if (n.y > H - n.r) { n.y = H - n.r; n.vy = -Math.abs(n.vy); }

        const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < CFG.mouseRadius && mdist > 0.1) {
          const force = (1 - mdist / CFG.mouseRadius) * CFG.mouseRepulse;
          n.vx += (mdx / mdist) * force * 0.08;
          n.vy += (mdy / mdist) * force * 0.08;
          n.vx *= 0.96; n.vy *= 0.96;
          const sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
          if (sp > CFG.speed * 6) { n.vx = (n.vx / sp) * CFG.speed * 6; n.vy = (n.vy / sp) * CFG.speed * 6; }
        } else {
          const sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
          if (sp > CFG.speed * 1.1)      { n.vx *= 0.98; n.vy *= 0.98; }
          else if (sp < CFG.speed * 0.6) { const a = Math.atan2(n.vy, n.vx); n.vx = Math.cos(a) * CFG.speed; n.vy = Math.sin(a) * CFG.speed; }
        }
      }

      raf = requestAnimationFrame(draw);
    }

    canvas.parentElement.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.parentElement.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });

    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { if (!raf) draw(); }
        else { cancelAnimationFrame(raf); raf = null; }
      });
    }).observe(canvas);

    new ResizeObserver(() => { resize(); build(); }).observe(canvas.parentElement);

    resize();
    build();
  }

  function init() {
    document.querySelectorAll("canvas[data-particles]").forEach((c) => initCanvas(c));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.initParticles = initCanvas;
})();
