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

// A glowing tree: dark trunk + luminous foliage orbs.
export function makeGlowTree({ height = 5, glow = 0x7fe0c3, seed = 3 } = {}) {
  const rnd = mulberry32(seed);
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.38, height, 7),
    new THREE.MeshStandardMaterial({ color: 0x2c1e14, roughness: 1 })
  );
  trunk.position.y = height / 2;
  g.add(trunk);
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x14352c, emissive: glow, emissiveIntensity: 0.28, roughness: 0.8,
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
