// pandora-creatures.js — the Tree of Whispers, Hometree, and the creatures
// of Pandora: stormwings, meadowstriders, gloamrunners, broadfrills, the
// veilstalker, glimmerwings, swiftlings, glowfan skinks, and seed-spirits.
// All figures are ORIGINAL stylized designs, in the spirit of the world —
// no movie creature names, no movie character designs, and no Na'vi people
// or bodies here: those are made together, later.

import * as THREE from 'three';
import { makeGlowSprite, makeClickable, mulberry32 } from './utils.js';

export function createPandoraCreatures(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'pandora-creatures';
  const animated = [];
  const interactables = [];
  const rnd = mulberry32(421);

  function register(root, name, lines, labelOffset = 1.6, maxDistance = 60, className = 'label-creature') {
    makeClickable(root, { name, lines });
    interactables.push(root);
    labels.add(name, root, { yOffset: labelOffset, className, maxDistance });
  }

  // ---------- THE TREE OF WHISPERS — the sacred heart of Pandora ----------
  // North-west of the Song Tree (18,-14), clear of the lagoon (-30,10),
  // the Fold Gate (0,26), and the floating mountains overhead. Its leaves
  // shimmer and whisper; its roots glow; its motes drift through the canopy.
  const whispers = new THREE.Group();
  whispers.position.set(-12, 0, -32);
  const whisperBark = new THREE.MeshStandardMaterial({ color: 0x2e2438, roughness: 1 });
  const whisperTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.7, 22, 10), whisperBark);
  whisperTrunk.position.y = 11;
  whisperTrunk.castShadow = true;
  whispers.add(whisperTrunk);
  // Buttress roots, glowing at their tips.
  const rootTips = [];
  for (let i = 0; i < 6; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / 6) * Math.PI * 2 + 0.3;
    const root = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.75, 5, 6), whisperBark);
    root.position.set(2.8, 1.2, 0);
    root.rotation.z = 1.05; // top leaning in toward the trunk
    pivot.add(root);
    const tip = makeGlowSprite('rgba(140,255,220,0.85)', 1.6, 0.6);
    tip.position.set(4.9, 0.5, 0);
    pivot.add(tip);
    rootTips.push(tip);
    whispers.add(pivot);
  }
  // Whispering canopy — shimmering, gently breathing.
  const whisperCanopy = new THREE.Group();
  const whisperLeafMat = new THREE.MeshStandardMaterial({ color: 0x1a4a44, emissive: 0x37e0c8, emissiveIntensity: 0.35, roughness: 0.8 });
  const whisperBlobs = [];
  for (let i = 0; i < 12; i++) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(2.0 + rnd() * 1.1, 10, 8), whisperLeafMat);
    blob.position.set((rnd() - 0.5) * 11, 21 + rnd() * 5, (rnd() - 0.5) * 11);
    blob.scale.y = 0.55;
    whisperCanopy.add(blob);
    whisperBlobs.push({ blob, baseY: blob.scale.y, phase: rnd() * 6 });
  }
  // Hanging whisper-lights.
  const whisperLights = [];
  for (let i = 0; i < 12; i++) {
    const glow = makeGlowSprite('rgba(160,255,225,0.85)', 1.0, 0.65);
    glow.position.set((rnd() - 0.5) * 9, 15 + rnd() * 8, (rnd() - 0.5) * 9);
    whisperCanopy.add(glow);
    whisperLights.push({ glow, home: glow.position.clone(), phase: rnd() * 6 });
  }
  whispers.add(whisperCanopy);
  // Drifting leaf-motes, orbiting the canopy.
  const whisperMotes = [];
  for (let i = 0; i < 20; i++) {
    const mote = makeGlowSprite('rgba(200,255,240,0.9)', 0.55, 0.8);
    whispers.add(mote);
    whisperMotes.push({ mote, r: 4 + rnd() * 5, y: 16 + rnd() * 10, speed: 0.08 + rnd() * 0.12, phase: rnd() * 6 });
  }
  const whisperLight = new THREE.PointLight(0x37e0c8, 40, 24, 2);
  whisperLight.position.y = 10;
  whispers.add(whisperLight);
  group.add(whispers);
  animated.push((dt, t) => {
    for (const b of whisperBlobs) {
      const s = 1 + Math.sin(t * 0.7 + b.phase) * 0.05;
      b.blob.scale.set(s, b.baseY * s, s);
    }
    for (const l of whisperLights) {
      l.glow.position.y = l.home.y + Math.sin(t * 0.6 + l.phase) * 0.7;
      l.glow.material.opacity = 0.5 + Math.sin(t * 0.9 + l.phase) * 0.25;
    }
    for (const m of whisperMotes) {
      const a = t * m.speed + m.phase;
      m.mote.position.set(Math.cos(a) * m.r, m.y + Math.sin(t * 0.5 + m.phase) * 1.2, Math.sin(a) * m.r);
    }
    for (let i = 0; i < rootTips.length; i++) {
      rootTips[i].material.opacity = 0.45 + Math.sin(t * 1.1 + i * 1.1) * 0.25;
    }
    whisperCanopy.rotation.y = Math.sin(t * 0.05) * 0.03;
  });
  register(whispers, 'The Tree of Whispers', [
    'The leaves whisper without wind — every voice the forest has ever held, kept safe in the branches, waiting to be remembered.',
    'Touch the roots and the memories stir: rain from a hundred years ago, the first song ever sung beneath this canopy, the names of all who rested here.',
    'The tree does not speak in words. It speaks in the feeling of being known — every root joined to every other, one great remembering.',
  ], 29, 160, 'label-grove');

  // ---------- HOMETREE — the great gathering tree of Pandora ----------
  // Far east (46,-8), clear of the Song Tree, the lagoon, the Fold Gate,
  // and the floating mountains. Colossal trunk, woven ring platforms,
  // lanterns, and glowing life through its branches.
  const hometree = new THREE.Group();
  hometree.position.set(46, 0, -8);
  const homeBark = new THREE.MeshStandardMaterial({ color: 0x3a2c22, roughness: 1 });
  const homeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 5.0, 30, 12), homeBark);
  homeTrunk.position.y = 15;
  homeTrunk.castShadow = true;
  hometree.add(homeTrunk);
  // Buttress roots.
  for (let i = 0; i < 7; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / 7) * Math.PI * 2;
    const root = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.5, 8, 7), homeBark);
    root.position.set(5.2, 2, 0);
    root.rotation.z = 1.0;
    pivot.add(root);
    hometree.add(pivot);
  }
  // Great limbs reaching out into the canopy.
  for (let i = 0; i < 6; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / 6) * Math.PI * 2 + 0.4;
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 9, 7), homeBark);
    limb.position.set(4.5, 28, 0);
    limb.rotation.z = -1.15; // reaching outward and up
    pivot.add(limb);
    hometree.add(pivot);
  }
  // Wide canopy.
  const homeLeafMat = new THREE.MeshStandardMaterial({ color: 0x1e5a34, emissive: 0x4ae08a, emissiveIntensity: 0.18, roughness: 0.85 });
  const homeBlobs = [];
  for (let i = 0; i < 16; i++) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(2.6 + rnd() * 1.4, 10, 8), homeLeafMat);
    blob.position.set((rnd() - 0.5) * 17, 29 + rnd() * 7, (rnd() - 0.5) * 17);
    blob.scale.y = 0.55;
    hometree.add(blob);
    homeBlobs.push({ blob, baseY: blob.scale.y, phase: rnd() * 6 });
  }
  // Woven ring platforms with rope rails, struts, and hanging lanterns.
  const platformMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1, side: THREE.DoubleSide });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 1 });
  const homeLanterns = [];
  [8, 15, 22].forEach((py, pi) => {
    const outer = 6.4 - pi * 0.5;
    const ring = new THREE.Mesh(new THREE.RingGeometry(3.4, outer, 24), platformMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = py;
    hometree.add(ring);
    const rail = new THREE.Mesh(new THREE.TorusGeometry(outer - 0.1, 0.06, 5, 32), ropeMat);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = py + 0.9;
    hometree.add(rail);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 5), ropeMat);
      post.position.set(Math.cos(a) * (outer - 0.1), py + 0.45, Math.sin(a) * (outer - 0.1));
      hometree.add(post);
    }
    for (let i = 0; i < 6; i++) {
      const pivot = new THREE.Group();
      pivot.rotation.y = (i / 6) * Math.PI * 2 + pi * 0.5;
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 3.4, 5), platformMat);
      strut.position.set(4.6, py - 1.1, 0);
      strut.rotation.z = -0.85; // trunk below to ring edge above
      pivot.add(strut);
      hometree.add(pivot);
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + pi * 0.7;
      const r = 5.6 - pi * 0.5;
      const vine = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 4), ropeMat);
      vine.position.set(Math.cos(a) * r, py - 0.8, Math.sin(a) * r);
      hometree.add(vine);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffc46b, emissive: 0xffb45e, emissiveIntensity: 1.6 }));
      lamp.position.set(Math.cos(a) * r, py - 1.7, Math.sin(a) * r);
      hometree.add(lamp);
      const halo = makeGlowSprite('rgba(255,190,100,0.8)', 1.2, 0.5);
      halo.position.copy(lamp.position);
      hometree.add(halo);
      homeLanterns.push({ halo, phase: rnd() * 6 });
    }
  });
  // Glowing life through the branches.
  const homeGlow = [];
  for (let i = 0; i < 14; i++) {
    const glow = makeGlowSprite('rgba(150,255,190,0.8)', 1.1, 0.6);
    glow.position.set((rnd() - 0.5) * 15, 24 + rnd() * 12, (rnd() - 0.5) * 15);
    hometree.add(glow);
    homeGlow.push({ glow, home: glow.position.clone(), phase: rnd() * 6 });
  }
  const homeLight = new THREE.PointLight(0xffc46b, 30, 22, 2);
  homeLight.position.y = 15;
  hometree.add(homeLight);
  group.add(hometree);
  animated.push((dt, t) => {
    for (const b of homeBlobs) {
      const s = 1 + Math.sin(t * 0.5 + b.phase) * 0.03;
      b.blob.scale.set(s, b.baseY * s, s);
    }
    for (const l of homeLanterns) {
      l.halo.material.opacity = 0.4 + Math.sin(t * 1.4 + l.phase) * 0.15;
    }
    for (const g of homeGlow) {
      g.glow.position.y = g.home.y + Math.sin(t * 0.6 + g.phase) * 0.8;
      g.glow.material.opacity = 0.45 + Math.sin(t * 0.8 + g.phase) * 0.2;
    }
  });
  register(hometree, 'Hometree', [
    'Hometree has held gatherings since before the oldest song. Its platforms are woven for everyone — there is always room for one more.',
    'Lanterns glow in the high branches where families rest, tell stories, and watch the floating mountains drift by like slow clouds.',
    'Stand beneath the great trunk and listen: the whole tree hums, low and warm, like a heart that has never once stopped beating.',
  ], 40, 180, 'label-grove');

  // ---------- STORMWINGS — crested sky hunters of the peaks ----------
  function makeStormwing() {
    const s = new THREE.Group();
    const plumage = new THREE.MeshStandardMaterial({ color: 0x3a4a6a, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), plumage);
    body.scale.set(0.85, 0.75, 2.0);
    s.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), plumage);
    head.position.set(0, 0.22, 1.05);
    s.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.55, 6), new THREE.MeshStandardMaterial({ color: 0x2a2a34, roughness: 0.5 }));
    beak.rotation.x = Math.PI / 2 + 0.12;
    beak.position.set(0, 0.18, 1.5);
    s.add(beak);
    // Swept-back silver crest.
    const crestMat = new THREE.MeshStandardMaterial({ color: 0xd8e4f0, roughness: 0.6, side: THREE.DoubleSide, emissive: 0x8ab8d8, emissiveIntensity: 0.3 });
    for (let i = -1; i <= 1; i++) {
      const feather = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.85), crestMat);
      feather.position.set(i * 0.13, 0.55, 0.85);
      feather.rotation.z = i * 0.3;
      feather.rotation.x = -0.7;
      s.add(feather);
    }
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x2e3e5e, roughness: 0.7, side: THREE.DoubleSide });
    const wingGeo = new THREE.PlaneGeometry(3.4, 1.1, 4, 1);
    const wL = new THREE.Mesh(wingGeo, wingMat);
    wL.position.set(-1.95, 0.3, 0);
    const wR = new THREE.Mesh(wingGeo, wingMat);
    wR.position.set(1.95, 0.3, 0);
    s.add(wL, wR);
    const tailFan = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), crestMat);
    tailFan.position.set(0, 0.1, -1.4);
    tailFan.rotation.x = -0.25;
    s.add(tailFan);
    [-3.6, 3.6].forEach((x) => {
      const tip = makeGlowSprite('rgba(120,220,255,0.85)', 0.9, 0.55);
      tip.position.set(x, 0.3, 0);
      s.add(tip);
    });
    return { group: s, wL, wR };
  }
  const stormwingLines = [
    'The stormwing rides the updrafts around the floating mountains, crest streaming, watching the whole world below with fearless eyes.',
    'Its cry rings out across the peaks — a wild, joyful sound — and the other stormwings answer from the far side of the sky.',
  ];
  const stormwings = [];
  [
    { cx: 2, cz: -20, r: 26, y: 34, speed: 0.075, offset: 0 },
    { cx: 2, cz: -20, r: 31, y: 37, speed: 0.065, offset: 1.7 },
    { cx: 2, cz: -20, r: 35, y: 31, speed: 0.08, offset: 3.4 },
    { cx: 2, cz: -20, r: 29, y: 40, speed: 0.06, offset: 4.9 },
  ].forEach((cfg) => {
    const sw = makeStormwing();
    group.add(sw.group);
    stormwings.push({ ...sw, ...cfg, bob: rnd() * 6 });
    register(sw.group, 'Stormwing', stormwingLines, 2.2, 160);
  });
  animated.push((dt, t) => {
    for (const sw of stormwings) {
      const a = t * sw.speed + sw.offset;
      sw.group.position.set(
        sw.cx + Math.cos(a) * sw.r,
        sw.y + Math.sin(t * 0.5 + sw.bob) * 1.5,
        sw.cz + Math.sin(a) * sw.r
      );
      sw.group.rotation.y = -a;
      const flap = Math.sin(t * 2.2 + sw.bob) * 0.45;
      sw.wL.rotation.z = flap; sw.wR.rotation.z = -flap;
    }
  });

  // ---------- MEADOWSTRIDERS — six-legged herd grazers ----------
  function makeMeadowstrider() {
    const m = new THREE.Group();
    const hide = new THREE.MeshStandardMaterial({ color: 0x5a6a42, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 10), hide);
    body.scale.set(1, 0.9, 1.7);
    body.position.y = 1.5;
    m.add(body);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), new THREE.MeshStandardMaterial({ color: 0xc8c8a8, roughness: 0.9 }));
    belly.scale.set(0.9, 0.6, 1.5);
    belly.position.y = 1.25;
    m.add(belly);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.1, 7), hide);
    neck.position.set(0, 2.3, 1.1);
    neck.rotation.x = 0.45;
    m.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), hide);
    head.position.set(0, 2.85, 1.5);
    head.scale.set(0.8, 0.9, 1.3);
    m.add(head);
    const earGeo = new THREE.ConeGeometry(0.09, 0.3, 5);
    const eL = new THREE.Mesh(earGeo, hide); eL.position.set(-0.2, 3.1, 1.4); eL.rotation.z = 0.35;
    const eR = eL.clone(); eR.position.x = 0.2; eR.rotation.z = -0.35;
    m.add(eL, eR);
    // Dorsal ridge.
    for (let i = 0; i < 4; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 5), new THREE.MeshStandardMaterial({ color: 0x3a4a2a, roughness: 0.9 }));
      spike.position.set(0, 2.3, 0.8 - i * 0.5);
      m.add(spike);
    }
    // SIX legs — three pairs.
    const legGeo = new THREE.CylinderGeometry(0.09, 0.11, 1.1, 5);
    [[-0.5, 1.0], [0.5, 1.0], [-0.5, 0], [0.5, 0], [-0.5, -1.0], [0.5, -1.0]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, hide);
      leg.position.set(lx, 0.55, lz);
      m.add(leg);
    });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.9, 6), hide);
    tail.position.set(0, 1.7, -1.6);
    tail.rotation.x = 2.4;
    m.add(tail);
    return { group: m, head, neck };
  }
  const meadowstriderLines = [
    'The meadowstrider grazes peacefully on six gentle legs, pausing now and then to look up at the sky with calm, dark eyes.',
    'The herd moves as one slow river across the meadow, unhurried, unafraid, belonging exactly where it stands.',
  ];
  const striders = [];
  [[-19, 40], [-14, 43], [-12, 37], [-18, 35], [-9, 41]].forEach(([sx, sz]) => {
    const st = makeMeadowstrider();
    st.group.position.set(sx, 0, sz);
    st.group.rotation.y = rnd() * Math.PI * 2;
    group.add(st.group);
    striders.push({ ...st, home: new THREE.Vector3(sx, 0, sz), phase: rnd() * 6 });
    register(st.group, 'Meadowstrider', meadowstriderLines, 3.4, 80);
  });
  animated.push((dt, t) => {
    for (const st of striders) {
      st.group.position.x = st.home.x + Math.sin(t * 0.07 + st.phase) * 1.6;
      st.group.position.z = st.home.z + Math.cos(t * 0.05 + st.phase) * 1.4;
      const g = Math.max(0, Math.sin(t * 0.3 + st.phase));
      st.head.position.y = 2.85 - g * 1.1;
      st.head.position.z = 1.5 + g * 0.5;
      st.neck.rotation.x = 0.45 + g * 0.8;
    }
  });

  // ---------- GLOAMRUNNERS — sleek night pack hunters ----------
  function makeGloamrunner() {
    const g = new THREE.Group();
    const coat = new THREE.MeshStandardMaterial({ color: 0x23232e, roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), coat);
    body.scale.set(0.85, 0.75, 1.9);
    body.position.y = 0.62;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), coat);
    head.position.set(0, 0.78, 0.75);
    head.scale.set(0.85, 0.9, 1.2);
    g.add(head);
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 6), new THREE.MeshStandardMaterial({ color: 0x16161e, roughness: 0.8 }));
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.72, 1.05);
    g.add(snout);
    // Amber eyes.
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffb45e });
    [-0.12, 0.12].forEach((x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), eyeMat);
      eye.position.set(x, 0.85, 0.95);
      g.add(eye);
    });
    const earGeo = new THREE.ConeGeometry(0.09, 0.34, 5);
    const eL = new THREE.Mesh(earGeo, coat); eL.position.set(-0.16, 1.05, 0.68);
    const eR = eL.clone(); eR.position.x = 0.16;
    g.add(eL, eR);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 1.0, 5), coat);
    tail.position.set(0, 0.62, -1.15);
    tail.rotation.x = 1.35;
    g.add(tail);
    const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.5, 5);
    [[-0.2, 0.5], [0.2, 0.5], [-0.2, -0.5], [0.2, -0.5]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, coat);
      leg.position.set(lx, 0.25, lz);
      g.add(leg);
    });
    // Faint violet back-markings.
    const markMat = new THREE.MeshBasicMaterial({ color: 0x8a6adf });
    for (let i = 0; i < 3; i++) {
      const mark = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), markMat);
      mark.position.set(0, 0.92, 0.3 - i * 0.4);
      g.add(mark);
    }
    return { group: g, tail };
  }
  const gloamrunnerLines = [
    'The gloamrunners move as one shadow with many eyes, silent between the trees, keeping the night\'s own watch.',
    'A low call sounds in the dark — not a threat, a greeting — and the pack answers, flowing onward like water over stone.',
  ];
  const runners = [];
  for (let i = 0; i < 3; i++) {
    const run = makeGloamrunner();
    group.add(run.group);
    runners.push(run);
    register(run.group, 'Gloamrunner', gloamrunnerLines, 1.4, 70);
  }
  const packCenter = (t) => new THREE.Vector3(
    -42 + Math.sin(t * 0.09) * 7,
    0,
    -14 + Math.cos(t * 0.07) * 5
  );
  const packOffsets = [[0, 0], [-1.8, 1.2], [1.6, 1.6]];
  animated.push((dt, t) => {
    const c = packCenter(t);
    const c2 = packCenter(t + 0.4);
    const heading = Math.atan2(c2.x - c.x, c2.z - c.z);
    runners.forEach((r, i) => {
      const [ox, oz] = packOffsets[i];
      // Offsets rotate with the pack heading so the formation holds.
      const rx = ox * Math.cos(heading) + oz * Math.sin(heading);
      const rz = -ox * Math.sin(heading) + oz * Math.cos(heading);
      r.group.position.set(c.x + rx, Math.abs(Math.sin(t * 2.4 + i)) * 0.05, c.z + rz);
      r.group.rotation.y = heading + Math.sin(t * 0.6 + i * 2) * 0.15;
      r.tail.rotation.z = Math.sin(t * 2 + i) * 0.15;
    });
  });

  // ---------- BROADFRILLS — gentle giant grazers ----------
  function makeBroadfrill() {
    const b = new THREE.Group();
    const hide = new THREE.MeshStandardMaterial({ color: 0x6a5a48, roughness: 0.95 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.4, 14, 10), hide);
    body.scale.set(1, 0.85, 1.5);
    body.position.y = 1.9;
    b.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), hide);
    head.position.set(0, 2.3, 1.9);
    head.scale.set(1, 0.9, 1.2);
    b.add(head);
    // The wide head-frill — a great flattened fan behind the head.
    const frillGroup = new THREE.Group();
    frillGroup.position.set(0, 2.5, 1.5);
    frillGroup.rotation.x = -0.35;
    const frillMat = new THREE.MeshStandardMaterial({ color: 0x4a6a4a, roughness: 0.85, side: THREE.DoubleSide, emissive: 0x2a5a3a, emissiveIntensity: 0.3 });
    const fan = new THREE.Mesh(new THREE.CircleGeometry(1.5, 18, 0, Math.PI), frillMat);
    frillGroup.add(fan);
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.4, 5), new THREE.MeshStandardMaterial({ color: 0xd8c8a8, roughness: 0.7 }));
      spike.position.set(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0);
      spike.rotation.z = a - Math.PI / 2;
      frillGroup.add(spike);
    }
    b.add(frillGroup);
    const legGeo = new THREE.CylinderGeometry(0.28, 0.34, 1.4, 7);
    [[-0.8, 0.9], [0.8, 0.9], [-0.8, -0.9], [0.8, -0.9]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, hide);
      leg.position.set(lx, 0.7, lz);
      b.add(leg);
    });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.4, 7), hide);
    tail.position.set(0, 2.0, -2.4);
    tail.rotation.x = 2.2;
    b.add(tail);
    b.scale.setScalar(1.4);
    return { group: b, head, tail };
  }
  const broadfrillLines = [
    'The broadfrill lowers its great frilled head to graze, gentle as a mountain that decided to be kind.',
    'When the broadfrill walks, the ground barely notices. When it rests, the small creatures of the forest gather in its shade.',
  ];
  const broadfrills = [];
  [[28, 6], [35, 13]].forEach(([bx, bz], i) => {
    const bf = makeBroadfrill();
    bf.group.position.set(bx, 0, bz);
    bf.group.rotation.y = 0.6 + i * 1.4;
    group.add(bf.group);
    broadfrills.push({ ...bf, home: new THREE.Vector3(bx, 0, bz), phase: rnd() * 6 });
    register(bf.group, 'Broadfrill', broadfrillLines, 6.2, 110);
  });
  animated.push((dt, t) => {
    for (const bf of broadfrills) {
      bf.group.position.x = bf.home.x + Math.sin(t * 0.05 + bf.phase) * 2;
      bf.group.position.z = bf.home.z + Math.cos(t * 0.04 + bf.phase) * 1.8;
      const g = Math.max(0, Math.sin(t * 0.25 + bf.phase));
      bf.head.position.y = 2.3 - g * 0.8;
      bf.head.position.z = 1.9 + g * 0.4;
      bf.tail.rotation.z = Math.sin(t * 0.8 + bf.phase) * 0.12;
    }
  });

  // ---------- THE VEILSTALKER — one rare, majestic apex stalker ----------
  function makeVeilstalker() {
    const v = new THREE.Group();
    const coat = new THREE.MeshStandardMaterial({ color: 0x1c1c28, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), coat);
    body.scale.set(0.9, 0.8, 2.1);
    body.position.y = 0.85;
    v.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 8), coat);
    head.position.set(0, 1.05, 1.1);
    head.scale.set(0.9, 0.9, 1.25);
    v.add(head);
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0x12121c, roughness: 0.7 }));
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.98, 1.5);
    v.add(snout);
    // Violet eyes.
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xc89aff });
    [-0.16, 0.16].forEach((x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeMat);
      eye.position.set(x, 1.14, 1.38);
      v.add(eye);
    });
    const earGeo = new THREE.ConeGeometry(0.11, 0.42, 5);
    const eL = new THREE.Mesh(earGeo, coat); eL.position.set(-0.2, 1.42, 1.0);
    const eR = eL.clone(); eR.position.x = 0.2;
    v.add(eL, eR);
    // Glowing violet stripes along the spine.
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x9a6aff });
    for (let i = 0; i < 5; i++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.5 - i * 0.05, 0.05, 0.12), stripeMat);
      stripe.position.set(0, 1.3, 0.7 - i * 0.42);
      v.add(stripe);
    }
    // Shoulder mane spikes.
    const maneMat = new THREE.MeshStandardMaterial({ color: 0x2e2e42, roughness: 0.8 });
    for (let i = 0; i < 3; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.45, 5), maneMat);
      spike.position.set(0, 1.35, 0.5 - i * 0.35);
      spike.rotation.x = -0.3;
      v.add(spike);
    }
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.11, 1.5, 5), coat);
    tail.position.set(0, 0.85, -1.75);
    tail.rotation.x = 1.35;
    v.add(tail);
    const tailTuft = makeGlowSprite('rgba(170,120,255,0.8)', 0.9, 0.5);
    tailTuft.position.set(0, 0.7, -2.4);
    v.add(tailTuft);
    const legGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.7, 5);
    [[-0.28, 0.7], [0.28, 0.7], [-0.28, -0.7], [0.28, -0.7]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, coat);
      leg.position.set(lx, 0.35, lz);
      v.add(leg);
    });
    v.scale.setScalar(1.8);
    return { group: v, head, tail };
  }
  const veilstalker = makeVeilstalker();
  group.add(veilstalker.group);
  register(veilstalker.group, 'Veilstalker — Apex of the Night', [
    'The veilstalker moves through the forest like dusk made flesh — silent, patient, and more beautiful than anything has a right to be.',
    'Violet light traces its stripes as it prowls the northern woods. It has no rival here, and no hurry at all.',
    'It pauses, turns its great head, and regards you for one long moment — then decides you are no threat, and melts back into the trees.',
  ], 3.2, 110);
  animated.push((dt, t) => {
    // Slow prowl: a wide ellipse through the northern woods.
    const a = t * 0.045;
    const cx = 26, cz = -34, rx = 12, rz = 8;
    veilstalker.group.position.set(cx + Math.cos(a) * rx, 0, cz + Math.sin(a) * rz);
    veilstalker.group.rotation.y = Math.atan2(-Math.sin(a) * rx, Math.cos(a) * rz);
    veilstalker.head.rotation.y = Math.sin(t * 0.4) * 0.4;
    veilstalker.tail.rotation.z = Math.sin(t * 0.9) * 0.14;
  });

  // ---------- GLIMMERWINGS — small fluttering bat-like fliers ----------
  function makeGlimmerwing(color) {
    const g = new THREE.Group();
    const fur = new THREE.MeshStandardMaterial({ color: 0x3a3048, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), fur);
    g.add(body);
    const earGeo = new THREE.ConeGeometry(0.05, 0.16, 4);
    const eL = new THREE.Mesh(earGeo, fur); eL.position.set(-0.08, 0.16, 0.02);
    const eR = eL.clone(); eR.position.x = 0.08;
    g.add(eL, eR);
    const wingMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.85, roughness: 0.6 });
    const wGeo = new THREE.PlaneGeometry(0.5, 0.3);
    const wL = new THREE.Mesh(wGeo, wingMat); wL.position.x = -0.28;
    const wR = new THREE.Mesh(wGeo, wingMat); wR.position.x = 0.28;
    g.add(wL, wR);
    const glow = makeGlowSprite('rgba(255,255,255,0.6)', 0.7, 0.4);
    glow.material.color.setHex(color);
    g.add(glow);
    return { group: g, wL, wR };
  }
  const glimmerwingLines = [
    'The glimmerwing flutters between the branches, wings glowing faintly, chasing motes of light through the leaves.',
    'A tiny flutter, a flash of glow — the glimmerwings dance around the great trees at dusk, bright as sparks from a celebration fire.',
  ];
  const glimmerwings = [];
  const glimmerColors = [0x7fe0c8, 0xb48cff, 0xff9ad5, 0x9ad5ff, 0xd8ffb8, 0xffd76a];
  // Two around each great tree: the Song Tree, the Tree of Whispers, Hometree.
  [[18, -14, 8], [18, -14, 10], [-12, -32, 9], [-12, -32, 11], [46, -8, 10], [46, -8, 12]].forEach(([gx, gz, gy], i) => {
    const gw = makeGlimmerwing(glimmerColors[i % glimmerColors.length]);
    group.add(gw.group);
    glimmerwings.push({ ...gw, home: new THREE.Vector3(gx, gy, gz), r: 3.5 + rnd() * 1.5, speed: 0.5 + rnd() * 0.4, phase: rnd() * 6 });
    register(gw.group, 'Glimmerwing', glimmerwingLines, 0.8, 60);
  });
  animated.push((dt, t) => {
    for (const gw of glimmerwings) {
      const a = t * gw.speed + gw.phase;
      gw.group.position.set(
        gw.home.x + Math.cos(a) * gw.r,
        gw.home.y + Math.sin(t * 1.7 + gw.phase) * 1.2,
        gw.home.z + Math.sin(a) * gw.r
      );
      gw.group.rotation.y = -a;
      const flap = Math.sin(t * 10 + gw.phase) * 0.9;
      gw.wL.rotation.z = flap; gw.wR.rotation.z = -flap;
    }
  });

  // ---------- SWIFTLINGS — small, quick, skittish six-legged grazers ----------
  function makeSwiftling() {
    const s = new THREE.Group();
    const fur = new THREE.MeshStandardMaterial({ color: 0x8a7a5e, roughness: 1 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), fur);
    body.scale.set(1, 0.85, 1.3);
    body.position.y = 0.22;
    s.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), fur);
    head.position.set(0, 0.3, 0.24);
    s.add(head);
    const earGeo = new THREE.ConeGeometry(0.05, 0.2, 4);
    const eL = new THREE.Mesh(earGeo, fur); eL.position.set(-0.08, 0.44, 0.2); eL.rotation.z = 0.25;
    const eR = eL.clone(); eR.position.x = 0.08; eR.rotation.z = -0.25;
    s.add(eL, eR);
    // SIX tiny legs.
    const legGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.16, 4);
    [[-0.1, 0.14], [0.1, 0.14], [-0.1, 0], [0.1, 0], [-0.1, -0.14], [0.1, -0.14]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, fur);
      leg.position.set(lx, 0.08, lz);
      s.add(leg);
    });
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 1 }));
    tail.position.set(0, 0.24, -0.26);
    s.add(tail);
    return { group: s };
  }
  const swiftlingLines = [
    'The swiftling freezes, ears high, every one of its six legs ready to run — then decides you are safe and goes back to nibbling.',
    'Quick as a blink, the swiftlings dart between the glowing stalks, playing a game of chase that never seems to end.',
  ];
  const swiftlings = [];
  [[-11, 6], [-6, 10], [-9, 12], [-4, 5], [-12, 10]].forEach(([sx, sz]) => {
    const sw = makeSwiftling();
    sw.group.position.set(sx, 0, sz);
    group.add(sw.group);
    swiftlings.push({ ...sw, home: new THREE.Vector3(sx, 0, sz), phase: rnd() * 6 });
    register(sw.group, 'Swiftling', swiftlingLines, 0.9, 55);
  });
  animated.push((dt, t) => {
    for (const sw of swiftlings) {
      // Quick, skittish darting + sudden little hops.
      sw.group.position.x = sw.home.x + Math.sin(t * 0.5 + sw.phase) * 2 + Math.sin(t * 1.7 + sw.phase * 2) * 0.8;
      sw.group.position.z = sw.home.z + Math.cos(t * 0.45 + sw.phase) * 1.8 + Math.cos(t * 1.4 + sw.phase) * 0.7;
      sw.group.position.y = Math.pow(Math.max(0, Math.sin(t * 3.2 + sw.phase)), 2) * 0.25;
      sw.group.rotation.y = Math.sin(t * 0.9 + sw.phase) * 2.2;
    }
  });

  // ---------- GLOWFAN SKINKS — small lizards with glowing neck fans ----------
  function makeGlowfanSkink() {
    const k = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: 0x4a6a3a, roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), skin);
    body.scale.set(0.8, 0.55, 1.6);
    body.position.y = 0.16;
    k.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), skin);
    head.position.set(0, 0.24, 0.36);
    k.add(head);
    // Glowing neck fan — opens and closes.
    const fanMat = new THREE.MeshStandardMaterial({ color: 0xff7a4a, emissive: 0xff5a2a, emissiveIntensity: 1.0, side: THREE.DoubleSide, transparent: true, opacity: 0.9, roughness: 0.6 });
    const fan = new THREE.Mesh(new THREE.CircleGeometry(0.34, 14, 0, Math.PI), fanMat);
    fan.position.set(0, 0.3, 0.22);
    fan.rotation.x = -0.3;
    k.add(fan);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.6, 6), skin);
    tail.position.set(0, 0.14, -0.55);
    tail.rotation.x = -Math.PI / 2 + 0.25;
    k.add(tail);
    const legGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.14, 4);
    [[-0.14, 0.2], [0.14, 0.2], [-0.14, -0.2], [0.14, -0.2]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, skin);
      leg.position.set(lx, 0.07, lz);
      k.add(leg);
    });
    return { group: k, fan, fanMat, head };
  }
  const skinkLines = [
    'The glowfan skink opens its shining neck fan wide — a sudden bloom of light — then folds it away, shy and proud at once.',
    'Its fan pulses with warm light, slow as breathing. The skink is saying something in color, to anyone patient enough to watch.',
  ];
  const skinks = [];
  [[10, 18], [-8, 22], [12, 32]].forEach(([kx, kz]) => {
    const sk = makeGlowfanSkink();
    sk.group.position.set(kx, 0, kz);
    sk.group.rotation.y = rnd() * Math.PI * 2;
    group.add(sk.group);
    skinks.push({ ...sk, home: new THREE.Vector3(kx, 0, kz), phase: rnd() * 6 });
    register(sk.group, 'Glowfan Skink', skinkLines, 0.8, 50);
  });
  animated.push((dt, t) => {
    for (const sk of skinks) {
      const open = 0.5 + 0.5 * Math.sin(t * 0.5 + sk.phase);
      const f = 0.3 + open * 0.7;
      sk.fan.scale.set(f, f, 1);
      sk.fanMat.emissiveIntensity = 0.6 + open * 0.8;
      // Small scuttle + head bob.
      sk.group.position.x = sk.home.x + Math.sin(t * 0.3 + sk.phase) * 0.3;
      sk.group.position.z = sk.home.z + Math.cos(t * 0.25 + sk.phase) * 0.3;
      sk.head.position.y = 0.24 + Math.sin(t * 1.6 + sk.phase) * 0.03;
    }
  });

  // ---------- SEED-SPIRITS — small glowing drifting spirits ----------
  const spiritGroup = new THREE.Group();
  spiritGroup.name = 'seed-spirits';
  const spirits = [];
  const spiritColors = [0x9fe8ff, 0xd8ffb8, 0xffd8f0, 0xfff2b8];
  for (let i = 0; i < 12; i++) {
    const s = new THREE.Group();
    const c = spiritColors[i % spiritColors.length];
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 2.0 }));
    s.add(core);
    const halo = makeGlowSprite('rgba(255,255,255,0.85)', 1.3, 0.6);
    halo.material.color.setHex(c);
    s.add(halo);
    const home = new THREE.Vector3(-24 + rnd() * 54, 1.5 + rnd() * 4.5, -32 + rnd() * 40);
    s.position.copy(home);
    spiritGroup.add(s);
    spirits.push({ s, halo, home, phase: rnd() * 6, speed: 0.12 + rnd() * 0.2 });
  }
  group.add(spiritGroup);
  animated.push((dt, t) => {
    for (const sp of spirits) {
      sp.s.position.x = sp.home.x + Math.sin(t * sp.speed + sp.phase) * 3;
      sp.s.position.y = sp.home.y + Math.sin(t * sp.speed * 1.6 + sp.phase) * 1.0;
      sp.s.position.z = sp.home.z + Math.cos(t * sp.speed * 0.8 + sp.phase) * 3;
      sp.halo.material.opacity = 0.45 + Math.sin(t * 1.2 + sp.phase) * 0.2;
    }
  });
  makeClickable(spiritGroup, {
    name: 'Seed-spirits of the Forest',
    lines: [
      'The seed-spirits drift through the forest like slow lanterns, carrying memories from tree to tree, keeping the whole woodland joined.',
      'One seed-spirit floats close and hovers, glowing softly, as if curious about you — then drifts on, back to its wandering.',
    ],
  });
  interactables.push(spiritGroup);
  const spiritAnchor = new THREE.Object3D();
  spiritAnchor.position.set(-2, 4, -12);
  group.add(spiritAnchor);
  labels.add('Seed-spirits of the Forest', spiritAnchor, { yOffset: 1, className: 'label-creature', maxDistance: 90 });

  return {
    group,
    interactables,
    update(dt, t) { for (const fn of animated) fn(dt, t); },
  };
}
