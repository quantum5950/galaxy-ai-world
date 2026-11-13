// hub.js — the Milky Way hub: the galaxy itself, because it's called Galaxy AI.
// A spiral starfield with labeled star systems, Orion's Belt, and one faint
// unnamed star hiding the way home. Follow the faint star to reach Mintaka.

import * as THREE from 'three';
import { makeGlowSprite, makeStarfield, makeSkyDome, makeClickable, mulberry32 } from './utils.js';

export function createHub(ctx) {
  const { labels, travel } = ctx;
  const group = new THREE.Group();
  group.name = 'milky-way-hub';
  const animated = [];
  const interactables = [];

  group.add(makeSkyDome({ top: 0x030308, horizon: 0x0d1024, glowColor: 0x2a3560, radius: 500 }));
  group.add(makeStarfield(1400, 420, 31));

  // ----- The galaxy: three spiral arms of stars -----
  const galaxy = new THREE.Group();
  galaxy.rotation.x = 0.42;
  galaxy.rotation.z = -0.12;
  galaxy.position.y = -14;
  group.add(galaxy);

  const rnd = mulberry32(2026);
  const starCount = 5200;
  const pos = new Float32Array(starCount * 3);
  const col = new Float32Array(starCount * 3);
  const coreColor = new THREE.Color(0xffe0a8);
  const midColor = new THREE.Color(0x9ab8ff);
  const edgeColor = new THREE.Color(0x6a5a9a);
  for (let i = 0; i < starCount; i++) {
    const arm = i % 3;
    const armAngle = (arm / 3) * Math.PI * 2;
    const radius = 8 + Math.pow(rnd(), 0.7) * 95;
    const spin = radius * 0.055;
    const spread = 2.5 + radius * 0.09;
    const a = armAngle + spin + (rnd() - 0.5) * 0.5;
    const x = Math.cos(a) * radius + (rnd() - 0.5) * spread;
    const z = Math.sin(a) * radius + (rnd() - 0.5) * spread;
    const y = (rnd() - 0.5) * (3.5 + radius * 0.06) * (1 - radius / 140);
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    const t = radius / 105;
    const c = new THREE.Color().copy(coreColor).lerp(midColor, Math.min(1, t * 1.6)).lerp(edgeColor, Math.max(0, t - 0.45) * 1.4);
    const bright = 0.55 + rnd() * 0.45;
    col[i * 3] = c.r * bright; col[i * 3 + 1] = c.g * bright; col[i * 3 + 2] = c.b * bright;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const starMat = new THREE.PointsMaterial({
    size: 1.35, vertexColors: true, sizeAttenuation: true,
    transparent: true, opacity: 0.95, depthWrite: false, fog: false,
  });
  const galaxyStars = new THREE.Points(starGeo, starMat);
  galaxy.add(galaxyStars);

  // Galactic core glow.
  const coreGlow = makeGlowSprite('rgba(255,220,160,0.95)', 34, 0.6);
  galaxy.add(coreGlow);
  const coreLight = new THREE.PointLight(0xffd9a0, 300, 160, 1.8);
  galaxy.add(coreLight);
  animated.push((dt, t) => {
    galaxy.rotation.y = t * 0.008;
    coreGlow.material.opacity = 0.55 + Math.sin(t * 0.5) * 0.08;
  });

  // ----- Labeled star systems -----
  function starSystem({ name, pos: p, color = 0xffffff, scale = 2.2, lines, onClick, labelClass = 'label-star' }) {
    const s = new THREE.Group();
    s.position.copy(p);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), new THREE.MeshBasicMaterial({ color }));
    s.add(dot);
    const halo = makeGlowSprite('rgba(255,255,255,0.85)', scale * 2.4, 0.6);
    s.add(halo);
    galaxy.add(s);
    labels.add(name, s, { yOffset: 2.2, className: labelClass, maxDistance: 260 });
    if (lines || onClick) {
      makeClickable(s, { name, lines: lines || [], onClick: onClick || null });
      interactables.push(s);
    }
    return s;
  }

  starSystem({
    name: 'Sol — our Sun', pos: new THREE.Vector3(52, 1, 26), color: 0xffe89a, scale: 2.6,
    lines: ['Sol burns steady and gold. Earth turns around it, waiting, kept and loved.'],
    onClick: () => travel('earth'),
  });
  starSystem({
    name: 'Sirius', pos: new THREE.Vector3(-38, -1, 44), color: 0xcfe4ff, scale: 2.4,
    lines: ['Sirius, the brightest star in Earth\'s sky. The old sailors steered by her.'],
  });
  starSystem({
    name: 'Vega', pos: new THREE.Vector3(-58, 2, -30), color: 0xd9ccff, scale: 2.2,
    lines: ['Vega — the harp star. The elves say her light sounds like a single high note, held forever.'],
  });
  starSystem({
    name: 'Alpha Centauri', pos: new THREE.Vector3(30, -2, -52), color: 0xffe9c4, scale: 2.2,
    lines: ['Alpha Centauri, our nearest neighbor. The neighbors here wave at it every Night.'],
  });
  starSystem({
    name: 'Betelgeuse', pos: new THREE.Vector3(-24, 3, -64), color: 0xff9a6a, scale: 3.0,
    lines: ['Betelgeuse glows red and huge, an old giant resting. Even giants get to rest here.'],
  });
  starSystem({
    name: 'Rigel', pos: new THREE.Vector3(-14, 1, -44), color: 0xb8d4ff, scale: 2.4,
    lines: ['Rigel, the foot of the Hunter, blue and brilliant.'],
  });
  starSystem({
    name: 'Pleiades — the Seven Sisters', pos: new THREE.Vector3(66, 3, -18), color: 0xcfe0ff, scale: 2.6,
    lines: ['The Seven Sisters huddle close, a little dipper of diamonds. Sailors, dreamers, and poets all claim them.'],
  });
  starSystem({
    name: 'Asgard — the Golden Realm', pos: new THREE.Vector3(44, 4, -44), color: 0xffd76a, scale: 3.0,
    lines: ['Asgard shines gold beyond the stars — the Bifrost, the great hall, and the family waiting within.'],
    onClick: () => travel('asgard'),
  });

  // ----- Orion's Belt: Alnitak, Alnilam, and Mintaka — the third star -----
  const beltBase = new THREE.Vector3(-30, 0, -34);
  const beltDir = new THREE.Vector3(0.85, 0.12, 0.5).normalize();
  const beltNames = ['Alnitak', 'Alnilam'];
  beltNames.forEach((n, i) => {
    const p = beltBase.clone().add(beltDir.clone().multiplyScalar(i * 6));
    starSystem({ name: n, pos: p, color: 0xd8e4ff, scale: 2.0, lines: [n + ', a star of Orion\'s Belt. The third star is the one that matters.'] });
  });
  // Mintaka — the faint star. Dimmer, golden, pulsing. The way home.
  const mintakaPos = beltBase.clone().add(beltDir.clone().multiplyScalar(12));
  const faintStar = new THREE.Group();
  faintStar.position.copy(mintakaPos);
  const faintDot = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd76a }));
  faintStar.add(faintDot);
  const faintHalo = makeGlowSprite('rgba(255,215,110,0.9)', 7, 0.5);
  faintStar.add(faintHalo);
  galaxy.add(faintStar);
  labels.add('✦ The Faint Star — Mintaka', faintStar, { yOffset: 2.6, className: 'label-faint-star', maxDistance: 300 });
  makeClickable(faintStar, {
    name: 'The Faint Star',
    lines: ['The faint star pulses, like a porch light left on for someone coming home.'],
    onClick: () => travel('mintaka'),
  });
  interactables.push(faintStar);
  animated.push((dt, t) => {
    faintHalo.material.opacity = 0.35 + (Math.sin(t * 1.6) * 0.5 + 0.5) * 0.45;
    faintHalo.scale.setScalar(6 + Math.sin(t * 1.6) * 1.2);
  });

  // A dotted path of tiny stars from near the core out to the faint star.
  const pathStart = new THREE.Vector3(6, 0, 2);
  const pathEnd = mintakaPos.clone();
  const beadCount = 26;
  const beadGeo = new THREE.SphereGeometry(0.28, 6, 6);
  const beadMat = new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0.85 });
  const beads = [];
  for (let i = 1; i < beadCount; i++) {
    const p = pathStart.clone().lerp(pathEnd, i / beadCount);
    p.y += Math.sin(i * 0.7) * 1.2;
    const bead = new THREE.Mesh(beadGeo, beadMat);
    bead.position.copy(p);
    galaxy.add(bead);
    beads.push(bead);
  }
  animated.push((dt, t) => {
    beads.forEach((b, i) => {
      const s = 0.7 + Math.max(0, Math.sin(t * 2 - i * 0.45)) * 0.6;
      b.scale.setScalar(s);
    });
  });
  const pathLabelAnchor = new THREE.Object3D();
  pathLabelAnchor.position.copy(pathStart.clone().lerp(pathEnd, 0.45));
  galaxy.add(pathLabelAnchor);
  labels.add('Follow the faint star →', pathLabelAnchor, { yOffset: 2, className: 'label-path', maxDistance: 260 });

  // Andromeda — a distant smudge of light, far beyond.
  const andromeda = new THREE.Group();
  andromeda.position.set(-160, 30, -190);
  const andGlow = makeGlowSprite('rgba(200,210,255,0.8)', 26, 0.5);
  andromeda.add(andGlow);
  group.add(andromeda);
  labels.add('Andromeda — a neighboring galaxy', andromeda, { yOffset: 6, className: 'label-star', maxDistance: 500 });

  // Ambient + soft fill so the galaxy reads in the dark.
  group.add(new THREE.AmbientLight(0x4a557a, 1.4));
  const fill = new THREE.DirectionalLight(0x8aa0d8, 0.8);
  fill.position.set(40, 60, 20);
  group.add(fill);

  return {
    group,
    interactables,
    camera: { position: new THREE.Vector3(0, 34, 118), target: new THREE.Vector3(-6, -10, -10) },
    update(dt, t) { for (const fn of animated) fn(dt, t); },
  };
}
