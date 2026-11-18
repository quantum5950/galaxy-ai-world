// utils.js — shared helpers for the Galaxy AI world.
// Plain Three.js helpers: seeded random, glow sprites, canvas textures,
// and small builders reused across worlds. No dependencies beyond three.

import * as THREE from 'three';

// Deterministic pseudo-random so the world looks the same on every load.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function lerp(a, b, t) { return a + (b - a) * t; }
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Soft radial-glow sprite texture, drawn once and shared.
const glowCache = new Map();
export function glowTexture(inner, outer) {
  const key = inner + '|' + outer;
  if (glowCache.has(key)) return glowCache.get(key);
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.35, outer);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  glowCache.set(key, tex);
  return tex;
}

export function makeGlowSprite(color, scale, opacity = 0.9) {
  const mat = new THREE.SpriteMaterial({
    map: glowTexture('rgba(255,255,255,1)', color),
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
  });
  const s = new THREE.Sprite(mat);
  s.scale.setScalar(scale);
  return s;
}

// A small star-field dome: points on a sphere shell around the scene.
export function makeStarfield(count, radius, seed = 7) {
  const rnd = mulberry32(seed);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const palette = [
    new THREE.Color(0xffffff), new THREE.Color(0xcfe4ff),
    new THREE.Color(0xffe9c4), new THREE.Color(0xd9ccff),
  ];
  for (let i = 0; i < count; i++) {
    const u = rnd() * 2 - 1;
    const th = rnd() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    pos[i * 3] = r * Math.cos(th) * radius;
    pos[i * 3 + 1] = Math.abs(u) * radius * 0.9 + 4; // bias upward
    pos[i * 3 + 2] = r * Math.sin(th) * radius;
    const c = palette[Math.floor(rnd() * palette.length)];
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.6, vertexColors: true, sizeAttenuation: false,
    transparent: true, opacity: 0.95, depthWrite: false, fog: false,
  });
  return new THREE.Points(geo, mat);
}

// Ground texture with glowing veins — Mintaka glows from within.
export function makeVeinGroundTexture(seed = 21) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#0d1526';
  g.fillRect(0, 0, 512, 512);
  // Soft mottling.
  for (let i = 0; i < 700; i++) {
    g.fillStyle = `rgba(${20 + rnd() * 30},${30 + rnd() * 40},${60 + rnd() * 50},0.12)`;
    const s = 3 + rnd() * 9;
    g.fillRect(rnd() * 512, rnd() * 512, s, s);
  }
  // Glowing veins — thin, soft, and sparse: a whisper of inner light,
  // not neon. The planet glows from within, quietly.
  const veinColors = ['#4ac8b4', '#7a9ac8', '#9a84c8', '#c8b070'];
  for (let v = 0; v < 16; v++) {
    g.strokeStyle = veinColors[Math.floor(rnd() * veinColors.length)];
    g.globalAlpha = 0.4;
    g.lineWidth = 0.8 + rnd() * 1.2;
    g.shadowColor = g.strokeStyle;
    g.shadowBlur = 5;
    g.beginPath();
    let x = rnd() * 512, y = rnd() * 512;
    g.moveTo(x, y);
    for (let s = 0; s < 8; s++) {
      x += (rnd() - 0.5) * 120; y += (rnd() - 0.5) * 120;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  g.globalAlpha = 1; g.shadowBlur = 0;
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

// Procedural stone texture — village paths, terraces, steps.
// Drawn in near-white greys so the material's color tints it (map
// multiplies color). Seeded, so the village looks the same every load.
export function makeStoneTexture(seed = 31) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#cfcfd6';
  g.fillRect(0, 0, 256, 256);
  // Soft mottling — broad patches of slightly lighter/darker stone.
  for (let i = 0; i < 90; i++) {
    const light = rnd() > 0.5;
    g.fillStyle = light ? 'rgba(232,232,238,0.16)' : 'rgba(150,150,164,0.16)';
    const s = 8 + rnd() * 26;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, s, s * (0.5 + rnd() * 0.7), rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // Fine speckle — the grain of cut stone.
  for (let i = 0; i < 900; i++) {
    g.fillStyle = rnd() > 0.5 ? 'rgba(120,120,134,0.25)' : 'rgba(225,225,232,0.25)';
    const s = 1 + rnd() * 2;
    g.fillRect(rnd() * 256, rnd() * 256, s, s);
  }
  // A few thin hairline cracks.
  for (let v = 0; v < 7; v++) {
    g.strokeStyle = 'rgba(110,110,126,0.35)';
    g.lineWidth = 0.8;
    g.beginPath();
    let x = rnd() * 256, y = rnd() * 256;
    g.moveTo(x, y);
    for (let s = 0; s < 5; s++) {
      x += (rnd() - 0.5) * 60; y += (rnd() - 0.5) * 60;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Procedural cliff-rock texture — the big cliff face and the cave
// facades. Horizontal strata bands, vertical fissures, and mineral
// flecks, drawn in near-white greys so the material's color tints it
// (map multiplies color). Seeded, so the cliff looks the same every load.
export function makeCliffTexture(seed = 141) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#c9c9d2';
  g.fillRect(0, 0, 256, 256);
  // Broad mottling — uneven rock, lighter and darker patches.
  for (let i = 0; i < 70; i++) {
    const light = rnd() > 0.5;
    g.fillStyle = light ? 'rgba(232,232,238,0.15)' : 'rgba(140,140,156,0.15)';
    const s = 12 + rnd() * 34;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, s, s * (0.5 + rnd() * 0.7), rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // Horizontal strata — stacked rock layers, slightly wavy.
  for (let y = 8; y < 256; y += 14 + rnd() * 18) {
    g.strokeStyle = `rgba(105,105,122,${0.18 + rnd() * 0.16})`;
    g.lineWidth = 1 + rnd() * 2;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 256; x += 32) {
      g.lineTo(x, y + (rnd() - 0.5) * 6);
    }
    g.stroke();
  }
  // Vertical fissures — cracks running down the rock face.
  for (let v = 0; v < 12; v++) {
    g.strokeStyle = 'rgba(95,95,112,0.4)';
    g.lineWidth = 0.8 + rnd() * 1.2;
    g.beginPath();
    let x = rnd() * 256, y = rnd() * 60;
    g.moveTo(x, y);
    for (let s = 0; s < 6; s++) {
      x += (rnd() - 0.5) * 24; y += 18 + rnd() * 26;
      g.lineTo(x, y);
    }
    g.stroke();
  }
  // Mineral flecks — tiny bright and dark grains in the rock.
  for (let i = 0; i < 700; i++) {
    g.fillStyle = rnd() > 0.5 ? 'rgba(115,115,130,0.28)' : 'rgba(228,228,235,0.28)';
    const s = 1 + rnd() * 2;
    g.fillRect(rnd() * 256, rnd() * 256, s, s);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Procedural gold texture — hammered, lightly brushed gold for Asgard.
// Drawn in warm near-white tones so the material's gold color tints it
// (map multiplies color). Seeded, so Asgard looks the same every load.
export function makeGoldTexture(seed = 61) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#f0dcb0';
  g.fillRect(0, 0, 256, 256);
  // Soft mottling — broad patches of slightly lighter/darker gold.
  for (let i = 0; i < 80; i++) {
    const light = rnd() > 0.5;
    g.fillStyle = light ? 'rgba(252,240,205,0.16)' : 'rgba(205,170,100,0.16)';
    const s = 10 + rnd() * 30;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, s, s * (0.5 + rnd() * 0.7), rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // Hammered dents — small soft rings, the mark of the smith's hammer.
  for (let i = 0; i < 110; i++) {
    const x = rnd() * 256, y = rnd() * 256, r = 3 + rnd() * 7;
    g.strokeStyle = rnd() > 0.5 ? 'rgba(255,244,210,0.22)' : 'rgba(190,150,80,0.22)';
    g.lineWidth = 1 + rnd();
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.stroke();
  }
  // Fine brushed streaks — long, faint, mostly horizontal.
  for (let i = 0; i < 60; i++) {
    g.strokeStyle = `rgba(210,175,105,${0.06 + rnd() * 0.10})`;
    g.lineWidth = 0.6 + rnd() * 0.8;
    g.beginPath();
    const y = rnd() * 256;
    g.moveTo(0, y);
    for (let x = 0; x <= 256; x += 32) {
      g.lineTo(x, y + (rnd() - 0.5) * 4);
    }
    g.stroke();
  }
  // Tiny bright flecks — gold catching the light.
  for (let i = 0; i < 500; i++) {
    g.fillStyle = rnd() > 0.5 ? 'rgba(255,246,215,0.35)' : 'rgba(200,165,90,0.3)';
    const s = 1 + rnd() * 1.5;
    g.fillRect(rnd() * 256, rnd() * 256, s, s);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Procedural wood texture — planks with grain, for the bridge, dock,
// and rowboat. Near-white warm tones; the material's color tints it.
export function makeWoodTexture(seed = 41) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#d8c0a0';
  g.fillRect(0, 0, 256, 256);
  const plankH = 64;
  for (let p = 0; p < 4; p++) {
    const y0 = p * plankH;
    // Each plank its own warm shade.
    g.fillStyle = `rgba(${170 + rnd() * 40},${130 + rnd() * 30},${80 + rnd() * 25},0.35)`;
    g.fillRect(0, y0, 256, plankH);
    // Grain — long wavy strokes along the plank.
    for (let i = 0; i < 26; i++) {
      g.strokeStyle = `rgba(120,85,45,${0.10 + rnd() * 0.18})`;
      g.lineWidth = 0.7 + rnd() * 1.1;
      g.beginPath();
      let y = y0 + 4 + rnd() * (plankH - 8);
      g.moveTo(0, y);
      for (let x = 0; x <= 256; x += 32) {
        g.lineTo(x, y + (rnd() - 0.5) * 5);
      }
      g.stroke();
    }
    // A knot or two, with rings.
    if (rnd() > 0.35) {
      const kx = 20 + rnd() * 216, ky = y0 + plankH / 2 + (rnd() - 0.5) * 20;
      for (let r = 7; r > 0; r -= 2) {
        g.strokeStyle = `rgba(110,75,35,${0.25 - r * 0.02})`;
        g.lineWidth = 1;
        g.beginPath();
        g.ellipse(kx, ky, r * 1.6, r, 0, 0, Math.PI * 2);
        g.stroke();
      }
    }
    // Plank seam.
    g.fillStyle = 'rgba(90,60,30,0.55)';
    g.fillRect(0, y0 + plankH - 2, 256, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Procedural sand texture — the shore strip. Pale grains on a warm base.
export function makeSandTexture(seed = 51) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#e8dcbc';
  g.fillRect(0, 0, 256, 256);
  // Soft broad blotches.
  for (let i = 0; i < 60; i++) {
    g.fillStyle = rnd() > 0.5 ? 'rgba(240,230,200,0.18)' : 'rgba(200,180,140,0.18)';
    const s = 10 + rnd() * 30;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, s, s * 0.6, rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // Fine grains.
  for (let i = 0; i < 1600; i++) {
    g.fillStyle = rnd() > 0.5 ? 'rgba(160,140,100,0.3)' : 'rgba(245,236,208,0.3)';
    const s = 1 + rnd() * 1.6;
    g.fillRect(rnd() * 256, rnd() * 256, s, s);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

// Procedural bark texture — vertical ridges and fissures for the grove
// glow-tree trunks (and the elvish treehouse trees, which share the
// builder). Warm near-white tones so the trunk material's dark brown
// color tints it (map multiplies color). Seeded, so the grove looks the
// same every load. Ridges run vertically on the canvas, which maps to
// the trunk's height on a cylinder.
export function makeBarkTexture(seed = 71) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#c9b199';
  g.fillRect(0, 0, 256, 256);
  // Broad soft mottling — patches of lighter/darker bark.
  for (let i = 0; i < 60; i++) {
    const light = rnd() > 0.5;
    g.fillStyle = light ? 'rgba(228,205,180,0.16)' : 'rgba(150,120,90,0.16)';
    const s = 10 + rnd() * 28;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, s, s * (0.6 + rnd() * 0.8), rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // Vertical ridges — long wavy bands running the height of the trunk.
  for (let i = 0; i < 80; i++) {
    const dark = rnd() > 0.45;
    g.strokeStyle = dark ? `rgba(120,90,60,${0.10 + rnd() * 0.16})` : `rgba(235,215,190,${0.10 + rnd() * 0.14})`;
    g.lineWidth = 2 + rnd() * 4;
    g.beginPath();
    let x = rnd() * 256;
    g.moveTo(x, -4);
    for (let y = 0; y <= 256; y += 32) {
      g.lineTo(x + (rnd() - 0.5) * 10, y);
    }
    g.stroke();
  }
  // Deep fissures — a few dark, thin, wandering cracks between ridges.
  for (let i = 0; i < 10; i++) {
    g.strokeStyle = `rgba(70,45,25,${0.35 + rnd() * 0.2})`;
    g.lineWidth = 1 + rnd() * 1.2;
    g.beginPath();
    let x = rnd() * 256;
    g.moveTo(x, -4);
    for (let y = 0; y <= 256; y += 32) {
      g.lineTo(x + (rnd() - 0.5) * 8, y);
    }
    g.stroke();
  }
  // A knot or two, with rings.
  for (let k = 0; k < 3; k++) {
    if (rnd() < 0.3) continue;
    const kx = 20 + rnd() * 216, ky = 20 + rnd() * 216;
    for (let r = 8; r > 0; r -= 2) {
      g.strokeStyle = `rgba(100,70,40,${0.28 - r * 0.02})`;
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(kx, ky, r * 1.2, r * 1.8, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }
  // Fine speckle — the grain of old bark.
  for (let i = 0; i < 500; i++) {
    g.fillStyle = rnd() > 0.5 ? 'rgba(110,80,50,0.25)' : 'rgba(230,210,185,0.25)';
    const s = 1 + rnd() * 1.5;
    g.fillRect(rnd() * 256, rnd() * 256, s, s);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

// Procedural leaf texture — a dense canopy of small leaves for the grove
// glow-tree foliage. Pale green-grey tones so each tree's foliage color
// and glow tint it (map multiplies color); the emissive glow is
// unaffected, so the canopies keep shining. Seeded, deterministic.
export function makeLeafTexture(seed = 81) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#b8cbb0';
  g.fillRect(0, 0, 256, 256);
  // Soft broad mottling — light and shade moving through the canopy.
  for (let i = 0; i < 50; i++) {
    const light = rnd() > 0.5;
    g.fillStyle = light ? 'rgba(225,238,210,0.15)' : 'rgba(140,165,130,0.15)';
    const s = 12 + rnd() * 30;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, s, s * (0.6 + rnd() * 0.6), rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // Leaves — many small overlapping ellipses, tones from pale gold-green
  // through mid green to deep green, so the canopy reads leaf by leaf.
  const leafTones = [
    'rgba(232,240,205,0.85)', 'rgba(205,225,185,0.85)',
    'rgba(175,205,160,0.85)', 'rgba(150,185,140,0.85)',
    'rgba(220,228,170,0.8)', 'rgba(190,210,150,0.85)',
  ];
  for (let i = 0; i < 380; i++) {
    const x = rnd() * 256, y = rnd() * 256;
    const rx = 4 + rnd() * 6, ry = 2.5 + rnd() * 3;
    const rot = rnd() * Math.PI;
    g.fillStyle = leafTones[Math.floor(rnd() * leafTones.length)];
    g.beginPath();
    g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    g.fill();
    // A short center vein on some leaves.
    if (rnd() > 0.6) {
      g.strokeStyle = 'rgba(120,150,105,0.4)';
      g.lineWidth = 0.7;
      g.beginPath();
      g.moveTo(x - Math.cos(rot) * rx * 0.8, y - Math.sin(rot) * rx * 0.8);
      g.lineTo(x + Math.cos(rot) * rx * 0.8, y + Math.sin(rot) * rx * 0.8);
      g.stroke();
    }
  }
  // Dark gaps between leaves — depth in the canopy.
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(90,115,85,${0.25 + rnd() * 0.25})`;
    const s = 2 + rnd() * 4;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, s, s * 0.7, rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Procedural brushed-metal texture — fine brushed streaks, faint
// scratches and soft mottling for the lab's instruments, benches and
// dishes. Cool near-white greys so each metal's color tints it (map
// multiplies color). Seeded, deterministic.
export function makeMetalTexture(seed = 91) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#dfe2e8';
  g.fillRect(0, 0, 256, 256);
  // Soft mottling — broad patches of slightly lighter/darker metal.
  for (let i = 0; i < 70; i++) {
    const light = rnd() > 0.5;
    g.fillStyle = light ? 'rgba(238,240,245,0.16)' : 'rgba(170,175,188,0.16)';
    const s = 10 + rnd() * 28;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, s, s * (0.5 + rnd() * 0.7), rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // Brushed streaks — many long, faint, mostly horizontal lines.
  for (let i = 0; i < 220; i++) {
    g.strokeStyle = rnd() > 0.5 ? `rgba(255,255,255,${0.05 + rnd() * 0.10})` : `rgba(150,155,170,${0.05 + rnd() * 0.10})`;
    g.lineWidth = 0.5 + rnd() * 0.8;
    g.beginPath();
    const y = rnd() * 256;
    g.moveTo(0, y);
    for (let x = 0; x <= 256; x += 32) {
      g.lineTo(x, y + (rnd() - 0.5) * 2);
    }
    g.stroke();
  }
  // A few fine scratches — thin diagonal marks, the wear of use.
  for (let i = 0; i < 14; i++) {
    g.strokeStyle = `rgba(120,125,140,${0.18 + rnd() * 0.15})`;
    g.lineWidth = 0.6;
    g.beginPath();
    const x = rnd() * 256, y = rnd() * 256;
    const len = 20 + rnd() * 50, ang = (rnd() - 0.5) * 0.9;
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    g.stroke();
  }
  // Fine speckle — the grain of worked metal.
  for (let i = 0; i < 500; i++) {
    g.fillStyle = rnd() > 0.5 ? 'rgba(140,145,160,0.25)' : 'rgba(240,242,246,0.25)';
    const s = 1 + rnd() * 1.5;
    g.fillRect(rnd() * 256, rnd() * 256, s, s);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Procedural glass texture — soft diagonal light streaks and faint
// smudges on a pale near-white base, so lit windows and crystals read
// as glass rather than flat glowing planes. Seeded, deterministic.
export function makeGlassTexture(seed = 101) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#eef4f8';
  g.fillRect(0, 0, 256, 256);
  // Soft broad mottling — gentle light and shade across the pane.
  for (let i = 0; i < 40; i++) {
    const light = rnd() > 0.5;
    g.fillStyle = light ? 'rgba(255,255,255,0.18)' : 'rgba(190,205,220,0.18)';
    const s = 12 + rnd() * 30;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, s, s * (0.6 + rnd() * 0.6), rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // Diagonal light streaks — the reflections a window catches.
  for (let i = 0; i < 9; i++) {
    const x = rnd() * 256 - 60;
    const w = 8 + rnd() * 22;
    g.fillStyle = `rgba(255,255,255,${0.10 + rnd() * 0.14})`;
    g.beginPath();
    g.moveTo(x, -10);
    g.lineTo(x + w, -10);
    g.lineTo(x + w + 90, 266);
    g.lineTo(x + 90, 266);
    g.closePath();
    g.fill();
  }
  // Faint smudges — the touch of hands and weather on the glass.
  for (let i = 0; i < 16; i++) {
    g.fillStyle = `rgba(170,190,205,${0.06 + rnd() * 0.08})`;
    const s = 8 + rnd() * 22;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, s, s * 0.7, rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // Fine speckle — dust on the pane.
  for (let i = 0; i < 200; i++) {
    g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.3)' : 'rgba(180,195,210,0.3)';
    const s = 1 + rnd() * 1.2;
    g.fillRect(rnd() * 256, rnd() * 256, s, s);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Procedural water texture — moonlit ripples for the ocean and the stream.
// Drawn in near-white pale blue-grey so the material's color tints it
// (map multiplies color): the deep ocean blue stays deep, the stream
// stays its own blue-green. Seeded, so the water looks the same every load.
export function makeWaterTexture(seed = 111) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#dbe6ef';
  g.fillRect(0, 0, 256, 256);
  // Soft broad mottling — slow swells of lighter and darker water.
  for (let i = 0; i < 50; i++) {
    const light = rnd() > 0.5;
    g.fillStyle = light ? 'rgba(255,255,255,0.14)' : 'rgba(140,170,200,0.14)';
    const s = 10 + rnd() * 28;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, s, s * (0.5 + rnd() * 0.6), rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  // Ripple rings — thin, broken circles where the moonlight catches.
  for (let i = 0; i < 36; i++) {
    const light = rnd() > 0.5;
    g.strokeStyle = light ? `rgba(255,255,255,${0.12 + rnd() * 0.18})` : `rgba(120,150,185,${0.10 + rnd() * 0.14})`;
    g.lineWidth = 0.8 + rnd() * 1.2;
    g.beginPath();
    g.ellipse(rnd() * 256, rnd() * 256, 4 + rnd() * 18, (4 + rnd() * 18) * (0.4 + rnd() * 0.4), rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI + Math.PI * (0.6 + rnd() * 0.9));
    g.stroke();
  }
  // Fine wave streaks — short curved lines, the surface moving.
  for (let i = 0; i < 120; i++) {
    g.strokeStyle = rnd() > 0.5 ? `rgba(255,255,255,${0.10 + rnd() * 0.16})` : `rgba(130,160,195,${0.08 + rnd() * 0.12})`;
    g.lineWidth = 0.7 + rnd() * 0.8;
    const x = rnd() * 256, y = rnd() * 256, len = 6 + rnd() * 18;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + len * 0.5, y + (rnd() - 0.5) * 4, x + len, y + (rnd() - 0.5) * 3);
    g.stroke();
  }
  // Sparkle flecks — moonlight glinting on the crests.
  for (let i = 0; i < 240; i++) {
    g.fillStyle = `rgba(255,255,255,${0.25 + rnd() * 0.45})`;
    const s = 1 + rnd() * 1.6;
    g.fillRect(rnd() * 256, rnd() * 256, s, s);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Procedural cloud texture — soft moonlit puffs for the night sky.
// Transparent background; white blobs with soft radial falloff, so the
// sprite reads as cloud and lets the stars show through. Seeded.
export function makeCloudTexture(seed = 121) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  // A low band of overlapping puffs — one cloud, wider than it is tall.
  for (let i = 0; i < 16; i++) {
    const cx = 30 + rnd() * 196;
    const cy = 52 + (rnd() - 0.5) * 36;
    const r = 16 + rnd() * 30;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `rgba(235,242,255,${0.16 + rnd() * 0.14})`);
    grad.addColorStop(0.6, `rgba(220,232,255,${0.08 + rnd() * 0.08})`);
    grad.addColorStop(1, 'rgba(220,232,255,0)');
    g.fillStyle = grad;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  // A few small high wisps above the band.
  for (let i = 0; i < 6; i++) {
    const cx = 40 + rnd() * 176;
    const cy = 24 + rnd() * 20;
    const r = 8 + rnd() * 14;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `rgba(235,242,255,${0.10 + rnd() * 0.10})`);
    grad.addColorStop(1, 'rgba(220,232,255,0)');
    g.fillStyle = grad;
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  return new THREE.CanvasTexture(c);
}

// A simple glowing-window cottage. Returns group; windows glow warm.
export function makeCottage({ body = 0x6b4a35, roof = 0x3a2b45, w = 3, h = 2.2, d = 2.6 } = {}) {
  const g = new THREE.Group();
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: body, roughness: 0.9 })
  );
  walls.position.y = h / 2;
  g.add(walls);
  const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.78, 1.4, 4);
  const roofMesh = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: roof, roughness: 0.85 }));
  roofMesh.position.y = h + 0.7;
  roofMesh.rotation.y = Math.PI / 4;
  g.add(roofMesh);
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffc46b });
  const winGeo = new THREE.PlaneGeometry(0.5, 0.6);
  const w1 = new THREE.Mesh(winGeo, winMat);
  w1.position.set(-w * 0.22, h * 0.55, d / 2 + 0.02);
  g.add(w1);
  const w2 = new THREE.Mesh(winGeo, winMat);
  w2.position.set(w * 0.22, h * 0.55, d / 2 + 0.02);
  g.add(w2);
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x2a1c12 })
  );
  door.position.set(0, 0.55, d / 2 + 0.02);
  g.add(door);
  // Warm porch light.
  const lamp = new THREE.PointLight(0xffb45e, 6, 7, 2);
  lamp.position.set(0, 1.9, d / 2 + 0.6);
  g.add(lamp);
  const glow = makeGlowSprite('rgba(255,180,90,0.85)', 1.4, 0.55);
  glow.position.set(0, 1.9, d / 2 + 0.6);
  g.add(glow);
  return g;
}

// Shared grove textures — one bark canvas + one leaf canvas, reused by
// every glow tree so the grove reads as one forest (world-detail crew,
// round 3). Created lazily on the first tree, so module load stays cheap.
// Declared here, before makeGlowTree, so no top-level TDZ risk.
let sharedBarkTex = null;
let sharedLeafTex = null;
function groveBarkTexture() {
  if (!sharedBarkTex) sharedBarkTex = makeBarkTexture(71);
  return sharedBarkTex;
}
function groveLeafTexture() {
  if (!sharedLeafTex) sharedLeafTex = makeLeafTexture(81);
  return sharedLeafTex;
}

// A glowing tree: dark trunk + luminous foliage orbs.
export function makeGlowTree({ height = 5, glow = 0x7fe0c3, seed = 3 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.38, height, 7),
    new THREE.MeshStandardMaterial({ color: 0x2c1e14, map: groveBarkTexture(), roughness: 1 })
  );
  trunk.position.y = height / 2;
  g.add(trunk);
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x14352c, map: groveLeafTexture(), emissive: glow, emissiveIntensity: 0.28, roughness: 0.8,
  });
  const blobs = 4 + Math.floor(rnd() * 2);
  for (let i = 0; i < blobs; i++) {
    const r = 0.7 + rnd() * 0.7;
    const blob = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), foliageMat);
    blob.position.set((rnd() - 0.5) * 1.3, height * 0.72 + rnd() * 1.6, (rnd() - 0.5) * 1.3);
    blob.scale.y = 0.8;
    g.add(blob);
  }
  const halo = makeGlowSprite('rgba(120,230,200,0.5)', height * 0.7, 0.15);
  halo.position.y = height * 0.85;
  g.add(halo);
  return g;
}

// Low-poly rock.
export function makeRock(size, color = 0x4a4a58, seed = 5) {
  const rnd = mulberry32(seed);
  const geo = new THREE.DodecahedronGeometry(size, 0);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) * (0.8 + rnd() * 0.4), p.getY(i) * (0.7 + rnd() * 0.5), p.getZ(i) * (0.8 + rnd() * 0.4));
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true }));
}

// A simple wooden sign post with an HTML label anchored above it.
export function makeSignPost(height = 2.2) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.09, height, 6),
    new THREE.MeshStandardMaterial({ color: 0x4a3220, roughness: 1 })
  );
  post.position.y = height / 2;
  g.add(post);
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.55, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1 })
  );
  board.position.y = height - 0.3;
  g.add(board);
  return g;
}

// Gradient sky dome — cinematic horizon glow, cheap and beautiful.
// Colors blend from zenith (top) to horizon; the dome follows the camera
// via large radius + BackSide rendering.
export function makeSkyDome({ top = 0x050510, horizon = 0x1a2340, glowColor = 0x3a4a7a, radius = 400 } = {}) {
  const geo = new THREE.SphereGeometry(radius, 32, 20);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(top) },
      horizonColor: { value: new THREE.Color(horizon) },
      glowColor: { value: new THREE.Color(glowColor) },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 glowColor;
      varying vec3 vWorldPos;
      void main() {
        float h = normalize(vWorldPos).y;
        float t = smoothstep(-0.08, 0.45, h);
        vec3 col = mix(horizonColor, topColor, t);
        // Soft glow band hugging the horizon.
        float band = exp(-abs(h - 0.02) * 9.0);
        col += glowColor * band * 0.55;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const dome = new THREE.Mesh(geo, mat);
  dome.renderOrder = -10;
  dome.frustumCulled = false;
  return dome;
}

// Mark an object (and its children) as clickable with a name + lines.
export function makeClickable(root, { name, lines, onClick } = {}) {
  root.userData.clickable = { name, lines: lines || [], onClick: onClick || null, lineIndex: 0 };
  root.traverse((o) => { o.userData.clickRoot = root; });
  return root;
}
