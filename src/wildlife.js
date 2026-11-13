// wildlife.js — everyday animals of Mintaka: birds, deer, foxes, rabbits,
// stream fish, dolphins, a whale, turtles, jellyfish, butterflies.
// The world is inhabited, not scenery — animals move, graze, play, and hunt.

import * as THREE from 'three';
import { makeGlowSprite, makeClickable, mulberry32 } from './utils.js';

export function createWildlife(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'wildlife';
  const animated = [];
  const interactables = [];
  const rnd = mulberry32(1234);

  function register(root, name, lines, labelOffset = 1.6, maxDistance = 45) {
    makeClickable(root, { name, lines });
    interactables.push(root);
    labels.add(name, root, { yOffset: labelOffset, className: 'label-wildlife', maxDistance });
  }

  // ---------- BIRDS — flocks wheeling over meadow and shore ----------
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x2a2a3a, side: THREE.DoubleSide });
  function makeBird(scale = 1) {
    const b = new THREE.Group();
    const wingGeo = new THREE.PlaneGeometry(0.7, 0.22);
    const wL = new THREE.Mesh(wingGeo, birdMat);
    wL.position.x = -0.35;
    const wR = new THREE.Mesh(wingGeo, birdMat);
    wR.position.x = 0.35;
    b.add(wL, wR);
    b.scale.setScalar(scale);
    return { group: b, wL, wR };
  }
  const flocks = [
    { cx: 6, cz: 8, r: 16, y: 17, count: 7, speed: 0.16 },
    { cx: -38, cz: 6, r: 13, y: 13, count: 5, speed: -0.2 },
    { cx: 20, cz: -18, r: 11, y: 20, count: 6, speed: 0.13 },
  ];
  flocks.forEach((flock) => {
    const birds = [];
    for (let i = 0; i < flock.count; i++) {
      const bird = makeBird(0.8 + rnd() * 0.5);
      group.add(bird.group);
      birds.push({ ...bird, offset: (i / flock.count) * Math.PI * 2, bob: rnd() * 6 });
    }
    animated.push((dt, t) => {
      for (const b of birds) {
        const a = t * flock.speed + b.offset;
        b.group.position.set(
          flock.cx + Math.cos(a) * flock.r + Math.sin(t * 0.7 + b.bob) * 1.5,
          flock.y + Math.sin(t * 0.6 + b.bob) * 1.8,
          flock.cz + Math.sin(a) * flock.r
        );
        b.group.rotation.y = -a + (flock.speed > 0 ? 0 : Math.PI);
        const flap = Math.sin(t * 7 + b.bob) * 0.55;
        b.wL.rotation.z = flap; b.wR.rotation.z = -flap;
      }
    });
  });
  // One hero gull near the lighthouse, clickable.
  const gull = makeBird(1.3);
  group.add(gull.group);
  animated.push((dt, t) => {
    const a = t * 0.25;
    gull.group.position.set(-34 + Math.cos(a) * 8, 12 + Math.sin(t * 0.5) * 1.5, 24 + Math.sin(a) * 8);
    gull.group.rotation.y = -a;
    const flap = Math.sin(t * 6) * 0.5;
    gull.wL.rotation.z = flap; gull.wR.rotation.z = -flap;
  });
  register(gull.group, 'Lighthouse Gull', [
    'The gull rides the sea wind in lazy circles, crying once, far away and free.',
  ], 1.0, 90);

  // ---------- DEER — a small herd grazing the meadow ----------
  function makeDeer({ scale = 1, antlers = true } = {}) {
    const d = new THREE.Group();
    const coat = new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), coat);
    body.scale.set(1, 0.9, 1.4);
    body.position.y = 0.85;
    d.add(body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.6, 7), coat);
    neck.position.set(0, 1.25, 0.55);
    neck.rotation.x = 0.35;
    d.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), coat);
    head.position.set(0, 1.55, 0.72);
    d.add(head);
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshStandardMaterial({ color: 0x5a4030 }));
    snout.position.set(0, 1.5, 0.9);
    d.add(snout);
    if (antlers) {
      const antMat = new THREE.MeshStandardMaterial({ color: 0xd8c8a8, roughness: 0.6 });
      [-0.14, 0.14].forEach((x) => {
        const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.5, 5), antMat);
        ant.position.set(x, 1.85, 0.66);
        ant.rotation.z = x > 0 ? -0.25 : 0.25;
        d.add(ant);
        const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.25, 5), antMat);
        tine.position.set(x * 1.6, 2.0, 0.66);
        tine.rotation.z = x > 0 ? -0.7 : 0.7;
        d.add(tine);
      });
    }
    const earGeo = new THREE.ConeGeometry(0.08, 0.24, 5);
    const eL = new THREE.Mesh(earGeo, coat); eL.position.set(-0.2, 1.68, 0.66); eL.rotation.z = 0.5;
    const eR = eL.clone(); eR.position.x = 0.2; eR.rotation.z = -0.5;
    d.add(eL, eR);
    const legGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.7, 5);
    [[-0.22, 0.4], [0.22, 0.4], [-0.22, -0.4], [0.22, -0.4]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, coat);
      leg.position.set(lx, 0.35, lz);
      d.add(leg);
    });
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), new THREE.MeshStandardMaterial({ color: 0xf2ead8 }));
    tail.position.set(0, 0.95, -0.68);
    d.add(tail);
    d.scale.setScalar(scale);
    return { group: d, head, neck };
  }
  const deerHerd = [];
  const deerDefs = [
    { name: 'Stag of the Meadow', pos: [26, 0, 12], scale: 1.15, antlers: true },
    { name: 'Doe', pos: [24, 0, 15], scale: 1.0, antlers: false },
    { name: 'Doe', pos: [28, 0, 16], scale: 0.95, antlers: false },
    { name: 'Fawn', pos: [25, 0, 13.5], scale: 0.55, antlers: false },
  ];
  deerDefs.forEach((cfg, i) => {
    const deer = makeDeer(cfg);
    deer.group.position.set(...cfg.pos);
    deer.group.rotation.y = rnd() * Math.PI * 2;
    group.add(deer.group);
    deerHerd.push({ ...deer, home: new THREE.Vector3(...cfg.pos), phase: rnd() * 6, graze: i !== 3 });
    register(deer.group, cfg.name, [
      'The deer lifts its head, ears turning toward you, then goes calmly back to grazing. No fear lives here.',
      'Soft eyes in the moonlight. The herd has grazed this meadow every night of the world.',
    ], 2.4, 60);
  });
  animated.push((dt, t) => {
    for (const deer of deerHerd) {
      // Slow drift around the meadow + graze bob.
      deer.group.position.x = deer.home.x + Math.sin(t * 0.08 + deer.phase) * 1.6;
      deer.group.position.z = deer.home.z + Math.cos(t * 0.06 + deer.phase) * 1.4;
      if (deer.graze) {
        const g = Math.max(0, Math.sin(t * 0.35 + deer.phase));
        deer.head.position.y = 1.55 - g * 0.55;
        deer.head.position.z = 0.72 + g * 0.3;
        deer.neck.rotation.x = 0.35 + g * 0.7;
      } else {
        deer.group.position.y = Math.abs(Math.sin(t * 2.4 + deer.phase)) * 0.08; // fawn bounce
      }
    }
  });

  // ---------- FOXES — red foxes trotting the grove edges ----------
  function makeFox() {
    const f = new THREE.Group();
    const coat = new THREE.MeshStandardMaterial({ color: 0xb05a28, roughness: 0.85 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), coat);
    body.scale.set(1, 0.8, 1.5);
    body.position.y = 0.42;
    f.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), coat);
    head.position.set(0, 0.6, 0.45);
    f.add(head);
    const snoutF = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0xe8dcc8 }));
    snoutF.rotation.x = Math.PI / 2;
    snoutF.position.set(0, 0.56, 0.66);
    f.add(snoutF);
    const earGeo = new THREE.ConeGeometry(0.09, 0.26, 5);
    const eL = new THREE.Mesh(earGeo, coat); eL.position.set(-0.13, 0.82, 0.42);
    const eR = eL.clone(); eR.position.x = 0.13;
    f.add(eL, eR);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.8, 8), coat);
    tail.position.set(0, 0.5, -0.6);
    tail.rotation.x = -1.7;
    f.add(tail);
    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshStandardMaterial({ color: 0xf2ead8 }));
    tailTip.position.set(0, 0.72, -0.92);
    f.add(tailTip);
    const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.35, 5);
    [[-0.15, 0.3], [0.15, 0.3], [-0.15, -0.3], [0.15, -0.3]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x4a2a18 }));
      leg.position.set(lx, 0.18, lz);
      f.add(leg);
    });
    return { group: f, tail };
  }
  const foxes = [];
  [[22, 2, 'Russet the Fox'], [6, -14, 'Ember the Fox']].forEach(([fx, fz, name], i) => {
    const fox = makeFox();
    fox.group.position.set(fx, 0, fz);
    group.add(fox.group);
    foxes.push({ ...fox, home: new THREE.Vector3(fx, 0, fz), phase: i * 3, speed: 0.14 + i * 0.04 });
    register(fox.group, name, [
      name.split(' ')[0] + ' pauses mid-trot, tail high, and regards you with bright amber eyes before melting back into the ferns.',
      'A flash of russet between the trees — the fox is playing some game only foxes understand.',
    ], 1.2, 55);
  });
  animated.push((dt, t) => {
    for (const fox of foxes) {
      fox.group.position.x = fox.home.x + Math.sin(t * fox.speed + fox.phase) * 5;
      fox.group.position.z = fox.home.z + Math.cos(t * fox.speed * 0.8 + fox.phase) * 4;
      fox.group.rotation.y = Math.atan2(Math.cos(t * fox.speed + fox.phase), -Math.sin(t * fox.speed * 0.8 + fox.phase));
      fox.tail.rotation.z = Math.sin(t * 2.2 + fox.phase) * 0.18;
    }
  });

  // ---------- RABBITS — hopping near the grove and village ----------
  function makeRabbit(color) {
    const r = new THREE.Group();
    const fur = new THREE.MeshStandardMaterial({ color, roughness: 1 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), fur);
    body.scale.set(1, 0.85, 1.25);
    body.position.y = 0.18;
    r.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), fur);
    head.position.set(0, 0.28, 0.22);
    r.add(head);
    const earGeo = new THREE.CapsuleGeometry(0.03, 0.22, 3, 6);
    const eL = new THREE.Mesh(earGeo, fur); eL.position.set(-0.06, 0.45, 0.2);
    const eR = eL.clone(); eR.position.x = 0.06;
    r.add(eL, eR);
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    tail.position.set(0, 0.2, -0.26);
    r.add(tail);
    return { group: r, eL, eR };
  }
  const rabbits = [];
  [[9, 8, 0xd8d0c0, 'Clover'], [13, 10, 0x8a7a6a, 'Bramble'], [18, -10, 0xe8e8f0, 'Snowdrop']].forEach(([rx, rz, color, name]) => {
    const rab = makeRabbit(color);
    rab.group.position.set(rx, 0, rz);
    group.add(rab.group);
    rabbits.push({ ...rab, home: new THREE.Vector3(rx, 0, rz), phase: rnd() * 6 });
    register(rab.group, name + ' the Rabbit', [
      name + ' thumps once, ears up, then goes back to nibbling clover. All is well.',
      'The rabbit freezes, nose wiggling, deciding you are safe. You are.',
    ], 0.7, 45);
  });
  animated.push((dt, t) => {
    for (const rab of rabbits) {
      const hop = Math.max(0, Math.sin(t * 2.6 + rab.phase));
      rab.group.position.y = hop * 0.18;
      rab.group.position.x = rab.home.x + Math.sin(t * 0.12 + rab.phase) * 1.2;
      rab.group.position.z = rab.home.z + Math.cos(t * 0.1 + rab.phase) * 1.0;
      rab.eL.rotation.x = Math.sin(t * 3 + rab.phase) * 0.12;
      rab.eR.rotation.x = Math.sin(t * 3.4 + rab.phase) * 0.12;
    }
  });

  // ---------- STREAM FISH — silver darts in the grove stream ----------
  const fishMat = new THREE.MeshStandardMaterial({ color: 0xb8d8e8, metalness: 0.7, roughness: 0.3, emissive: 0x2a5a7a, emissiveIntensity: 0.4 });
  function makeFish(scale = 1) {
    const f = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), fishMat);
    body.scale.set(0.6, 0.7, 1.8);
    f.add(body);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 4), fishMat);
    tail.rotation.x = -Math.PI / 2;
    tail.position.z = -0.3;
    f.add(tail);
    f.scale.setScalar(scale);
    return { group: f, tail };
  }
  // Stream runs from the grove (14,-4) toward the shore (-28, 6) roughly along a curve.
  const streamPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(16, 0.12, -18),
    new THREE.Vector3(13, 0.12, -8),
    new THREE.Vector3(8, 0.12, -1),
    new THREE.Vector3(0, 0.12, 2),
    new THREE.Vector3(-10, 0.12, 4),
    new THREE.Vector3(-20, 0.12, 6),
    new THREE.Vector3(-29, 0.12, 8),
  ]);
  const streamFish = [];
  for (let i = 0; i < 9; i++) {
    const fish = makeFish(0.8 + rnd() * 0.6);
    group.add(fish.group);
    streamFish.push({ ...fish, u: rnd(), speed: 0.008 + rnd() * 0.012, dir: rnd() > 0.5 ? 1 : -1 });
  }
  animated.push((dt, t) => {
    for (const fish of streamFish) {
      fish.u += fish.speed * fish.dir * dt * 4;
      if (fish.u > 1) { fish.u = 1; fish.dir = -1; }
      if (fish.u < 0) { fish.u = 0; fish.dir = 1; }
      const p = streamPath.getPointAt(fish.u);
      const p2 = streamPath.getPointAt(Math.min(1, Math.max(0, fish.u + 0.02 * fish.dir)));
      fish.group.position.copy(p);
      fish.group.position.y = 0.14 + Math.sin(t * 2 + fish.u * 20) * 0.03;
      fish.group.lookAt(p2.x, 0.14, p2.z);
      fish.tail.rotation.y = Math.sin(t * 8 + fish.u * 30) * 0.5;
    }
  });

  // ---------- OCEAN LIFE — dolphins, whale, turtles, jellyfish ----------
  // Dolphins — arcing through the waves offshore.
  function makeDolphin() {
    const d = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: 0x7a9ab8, roughness: 0.35, metalness: 0.2 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), skin);
    body.scale.set(0.8, 0.8, 2.2);
    d.add(body);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 6), skin);
    beak.rotation.x = Math.PI / 2;
    beak.position.z = 1.25;
    d.add(beak);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 4), skin);
    fin.position.set(0, 0.45, -0.2);
    fin.rotation.x = -0.3;
    fin.scale.z = 0.4;
    d.add(fin);
    const fluke = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.3), skin);
    fluke.position.z = -1.2;
    d.add(fluke);
    return { group: d, fluke };
  }
  const dolphins = [];
  for (let i = 0; i < 3; i++) {
    const dol = makeDolphin();
    group.add(dol.group);
    dolphins.push({ ...dol, phase: i * 2.1, r: 18 + i * 4 });
  }
  animated.push((dt, t) => {
    dolphins.forEach((dol, i) => {
      const a = t * 0.14 + dol.phase;
      const arc = Math.sin(t * 1.1 + dol.phase);
      dol.group.position.set(-52 + Math.cos(a) * dol.r, Math.max(-0.6, arc * 2.2), 2 + Math.sin(a) * 12);
      dol.group.rotation.y = -a;
      dol.group.rotation.x = Math.cos(t * 1.1 + dol.phase) * 0.5;
      dol.fluke.rotation.x = Math.sin(t * 5 + dol.phase) * 0.3;
    });
  });
  register(dolphins[0].group, 'Dolphin Pod', [
    'The dolphins leap in turn, silver arcs over black water, playing a game older than the shore.',
    'One dolphin clicks and whistles at you — an invitation, probably, to come swim.',
  ], 1.6, 80);

  // Whale — slow, majestic, surfacing far offshore with a spout.
  const whale = new THREE.Group();
  const whaleMat = new THREE.MeshStandardMaterial({ color: 0x4a5a78, roughness: 0.5 });
  const wBody = new THREE.Mesh(new THREE.SphereGeometry(2.2, 14, 10), whaleMat);
  wBody.scale.set(1, 0.75, 2.6);
  whale.add(wBody);
  const wTail = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.9), whaleMat);
  wTail.position.z = -5.6;
  whale.add(wTail);
  const wFinGeo = new THREE.ConeGeometry(0.5, 1.6, 4);
  const wFL = new THREE.Mesh(wFinGeo, whaleMat);
  wFL.position.set(-2.2, -0.4, 0.8); wFL.rotation.z = 1.2;
  const wFR = wFL.clone(); wFR.position.x = 2.2; wFR.rotation.z = -1.2;
  whale.add(wFL, wFR);
  const spout = makeGlowSprite('rgba(220,240,255,0.9)', 3, 0);
  spout.position.set(0, 2.2, 1.5);
  whale.add(spout);
  group.add(whale);
  animated.push((dt, t) => {
    const a = t * 0.03;
    whale.position.set(-70 + Math.cos(a) * 20, -0.9 + Math.sin(t * 0.35) * 0.9, -20 + Math.sin(a) * 14);
    whale.rotation.y = -a + 0.5;
    wTail.rotation.x = Math.sin(t * 0.8) * 0.22;
    // Spout puffs when the whale surfaces.
    const surfacing = Math.sin(t * 0.35) > 0.75;
    spout.material.opacity = surfacing ? 0.75 : 0;
    spout.scale.setScalar(surfacing ? 3 + Math.sin(t * 6) * 0.5 : 3);
  });
  register(whale, 'Old Mother Whale', [
    'The old whale surfaces slowly, blows a plume of silver mist, and regards the shore with one ancient, kindly eye.',
    'Her song rolls under the water for miles. The tulkun of Pandora would know it.',
  ], 4.5, 120);

  // Sea turtles — gliding near the shore.
  function makeTurtle() {
    const tu = new THREE.Group();
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x4a6b3a, roughness: 0.7 });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), shellMat);
    shell.scale.set(1, 0.6, 1.2);
    tu.add(shell);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshStandardMaterial({ color: 0x6b8a5a }));
    head.position.set(0, 0.05, 0.6);
    tu.add(head);
    const flipGeo = new THREE.PlaneGeometry(0.5, 0.25);
    const flipMat = new THREE.MeshStandardMaterial({ color: 0x6b8a5a, side: THREE.DoubleSide });
    const fL = new THREE.Mesh(flipGeo, flipMat); fL.position.set(-0.6, 0, 0.2); fL.rotation.z = 0.3;
    const fR = new THREE.Mesh(flipGeo, flipMat); fR.position.set(0.6, 0, 0.2); fR.rotation.z = -0.3;
    tu.add(fL, fR);
    return { group: tu, fL, fR };
  }
  const turtles = [];
  [[-36, 14], [-33, -6]].forEach(([tx, tz], i) => {
    const tu = makeTurtle();
    tu.group.position.set(tx, 0.1, tz);
    group.add(tu.group);
    turtles.push({ ...tu, home: new THREE.Vector3(tx, 0.1, tz), phase: i * 2.5 });
  });
  animated.push((dt, t) => {
    for (const tu of turtles) {
      tu.group.position.x = tu.home.x + Math.sin(t * 0.1 + tu.phase) * 4;
      tu.group.position.z = tu.home.z + Math.cos(t * 0.08 + tu.phase) * 3;
      tu.group.rotation.y = Math.sin(t * 0.1 + tu.phase) * 0.6;
      const stroke = Math.sin(t * 1.6 + tu.phase) * 0.35;
      tu.fL.rotation.z = 0.3 + stroke; tu.fR.rotation.z = -0.3 - stroke;
    }
  });
  register(turtles[0].group, 'Sea Turtles', [
    'The old turtle glides past the rocks without hurry. She has seen a hundred years of moons.',
  ], 1.0, 70);

  // Jellyfish — glowing bells drifting in the deep water.
  const jellyCount = 14;
  const jellies = [];
  const jellyMat = new THREE.MeshStandardMaterial({
    color: 0xb48cff, emissive: 0x7a4adf, emissiveIntensity: 1.1,
    transparent: true, opacity: 0.75, roughness: 0.4,
  });
  for (let i = 0; i < jellyCount; i++) {
    const j = new THREE.Group();
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), jellyMat);
    j.add(bell);
    const glow = makeGlowSprite('rgba(180,140,255,0.7)', 2, 0.5);
    j.add(glow);
    const home = new THREE.Vector3(-40 - rnd() * 25, -0.5 - rnd() * 1.5, -16 + rnd() * 34);
    j.position.copy(home);
    group.add(j);
    jellies.push({ j, bell, home, phase: rnd() * 6, speed: 0.2 + rnd() * 0.3 });
  }
  animated.push((dt, t) => {
    for (const jelly of jellies) {
      jelly.j.position.y = jelly.home.y + Math.sin(t * jelly.speed + jelly.phase) * 0.8;
      jelly.j.position.x = jelly.home.x + Math.sin(t * 0.07 + jelly.phase) * 2;
      const pulse = 1 + Math.sin(t * 1.8 + jelly.phase) * 0.12;
      jelly.bell.scale.set(pulse, 2 - pulse, pulse);
    }
  });

  // ---------- BUTTERFLIES — day-moths of the meadow and garden ----------
  function makeButterfly(color) {
    const b = new THREE.Group();
    const wingMatB = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, side: THREE.DoubleSide, roughness: 0.6 });
    const wGeo = new THREE.PlaneGeometry(0.34, 0.26);
    const wL = new THREE.Mesh(wGeo, wingMatB); wL.position.x = -0.18;
    const wR = new THREE.Mesh(wGeo, wingMatB); wR.position.x = 0.18;
    b.add(wL, wR);
    return { group: b, wL, wR };
  }
  const butterflies = [];
  const bfColors = [0xff9ad5, 0xffd76a, 0x9ad5ff, 0xc8ff9a];
  for (let i = 0; i < 8; i++) {
    const bf = makeButterfly(bfColors[i % bfColors.length]);
    const home = new THREE.Vector3(4 + rnd() * 18, 1 + rnd() * 1.5, -12 + rnd() * 22);
    bf.group.position.copy(home);
    group.add(bf.group);
    butterflies.push({ ...bf, home, phase: rnd() * 6, speed: 0.3 + rnd() * 0.4 });
  }
  animated.push((dt, t) => {
    for (const bf of butterflies) {
      bf.group.position.x = bf.home.x + Math.sin(t * bf.speed + bf.phase) * 2.5;
      bf.group.position.z = bf.home.z + Math.cos(t * bf.speed * 0.8 + bf.phase) * 2;
      bf.group.position.y = bf.home.y + Math.sin(t * 1.3 + bf.phase) * 0.4;
      bf.group.rotation.y = Math.atan2(Math.cos(t * bf.speed + bf.phase), Math.sin(t * bf.speed * 0.8 + bf.phase));
      const flap = Math.sin(t * 12 + bf.phase) * 0.8;
      bf.wL.rotation.z = flap; bf.wR.rotation.z = -flap;
    }
  });

  // ---------- PEGASUS — a small herd of winged horses ----------
  // They fly the meadows and the shore in wide, lazy circles, wings wide.
  function makePegasus({ coat = 0xe8e8f0 } = {}) {
    const p = new THREE.Group();
    const coatMat = new THREE.MeshStandardMaterial({ color: coat, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), coatMat);
    body.scale.set(1, 0.9, 1.6);
    body.position.y = 1.1;
    p.add(body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.7, 7), coatMat);
    neck.position.set(0, 1.55, 0.6);
    neck.rotation.x = 0.4;
    p.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), coatMat);
    head.position.set(0, 1.9, 0.82);
    head.scale.set(0.85, 1, 1.3);
    p.add(head);
    const mane = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.3), new THREE.MeshStandardMaterial({ color: 0xc8d8f0, roughness: 0.9 }));
    mane.position.set(0, 1.6, 0.38);
    mane.rotation.x = 0.4;
    p.add(mane);
    const earGeo = new THREE.ConeGeometry(0.07, 0.22, 5);
    const eL = new THREE.Mesh(earGeo, coatMat); eL.position.set(-0.14, 2.08, 0.78);
    const eR = eL.clone(); eR.position.x = 0.14;
    p.add(eL, eR);
    const legGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.8, 5);
    [[-0.24, 0.5], [0.24, 0.5], [-0.24, -0.5], [0.24, -0.5]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, coatMat);
      leg.position.set(lx, 0.4, lz);
      p.add(leg);
    });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0xc8d8f0, roughness: 0.9 }));
    tail.position.set(0, 1.2, -0.95);
    tail.rotation.x = 2.6;
    p.add(tail);
    // Great feathered wings, catching the moonlight.
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xf0f0ff, roughness: 0.8, side: THREE.DoubleSide, emissive: 0x8a9ac8, emissiveIntensity: 0.25 });
    const wingGeo = new THREE.PlaneGeometry(1.6, 0.6);
    const wL = new THREE.Mesh(wingGeo, wingMat);
    wL.position.set(-0.95, 1.5, 0);
    const wR = new THREE.Mesh(wingGeo, wingMat);
    wR.position.set(0.95, 1.5, 0);
    p.add(wL, wR);
    return { group: p, wL, wR };
  }
  const pegasusDefs = [
    { name: 'Starfall the Pegasus', cx: 4, cz: 6, r: 20, y: 14, speed: 0.12, offset: 0, coat: 0xe8e8f0 },
    { name: 'Moonwing the Pegasus', cx: 4, cz: 6, r: 23, y: 16, speed: 0.12, offset: 1.6, coat: 0xd8e0f0 },
    { name: 'Skydancer the Pegasus', cx: -30, cz: 8, r: 12, y: 11, speed: -0.16, offset: 0, coat: 0xf0e8e0 },
    { name: 'Swiftfeather the Pegasus', cx: -30, cz: 8, r: 15, y: 13, speed: -0.16, offset: 2.4, coat: 0xe0e8e8 },
  ];
  const pegasusLines = {
    'Starfall the Pegasus': [
      'Starfall banks across the moon, wings wide, and the whole herd follows — a river of silver over the meadow.',
      'Starfall dives low over the meadow, mane streaming, then climbs laughing into the stars. The herd follows, because that is what herds do.',
    ],
    'Moonwing the Pegasus': [
      'Moonwing\'s wings catch the moonlight and throw it back in silver sheets. She flies like the sky is singing to her.',
      'Moonwing flies the high circle, slow and serene, keeping watch over the whole sleeping world below.',
    ],
    'Skydancer the Pegasus': [
      'Skydancer loops and rolls above the shore, showing off for the dolphins. The dolphins leap back, showing off too.',
      'Skydancer has never once flown in a straight line. Why would she? The sky is round.',
    ],
    'Swiftfeather the Pegasus': [
      'Swiftfeather is the fastest thing on Mintaka that isn\'t the Fold itself. She knows it. She is very pleased about it.',
      'Swiftfeather streaks past in a silver blur, then circles back, slower, just to make sure you saw.',
    ],
  };
  const pegasi = [];
  pegasusDefs.forEach((cfg) => {
    const peg = makePegasus({ coat: cfg.coat });
    group.add(peg.group);
    pegasi.push({ ...peg, ...cfg, bob: rnd() * 6 });
    register(peg.group, cfg.name, pegasusLines[cfg.name], 3.0, 90);
  });
  animated.push((dt, t) => {
    for (const peg of pegasi) {
      const a = t * peg.speed + peg.offset;
      peg.group.position.set(
        peg.cx + Math.cos(a) * peg.r,
        peg.y + Math.sin(t * 0.5 + peg.bob) * 1.2,
        peg.cz + Math.sin(a) * peg.r
      );
      peg.group.rotation.y = -a + (peg.speed > 0 ? 0 : Math.PI);
      const flap = Math.sin(t * 2.2 + peg.bob) * 0.45;
      peg.wL.rotation.z = flap; peg.wR.rotation.z = -flap;
    }
  });

  // ---------- UNICORNS — gentle, glowing faintly under the moon ----------
  // Moon unicorns in the grove, shining silver-blue; meadow unicorns
  // grazing the open grass. All gentle, all unafraid.
  function makeUnicorn({ coat = 0xf2f2fa, glowColor = 0xb8c8ff, moon = false } = {}) {
    const u = new THREE.Group();
    const coatMat = new THREE.MeshStandardMaterial({ color: coat, roughness: 0.6, emissive: glowColor, emissiveIntensity: moon ? 0.5 : 0.25 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), coatMat);
    body.scale.set(1, 0.9, 1.6);
    body.position.y = 1.1;
    u.add(body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.7, 7), coatMat);
    neck.position.set(0, 1.55, 0.6);
    neck.rotation.x = 0.4;
    u.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), coatMat);
    head.position.set(0, 1.9, 0.82);
    head.scale.set(0.85, 1, 1.3);
    u.add(head);
    const mane = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.3), new THREE.MeshStandardMaterial({ color: moon ? 0xd8e4ff : 0xe8ddf0, roughness: 0.9 }));
    mane.position.set(0, 1.6, 0.38);
    mane.rotation.x = 0.4;
    u.add(mane);
    const earGeo = new THREE.ConeGeometry(0.07, 0.22, 5);
    const eL = new THREE.Mesh(earGeo, coatMat); eL.position.set(-0.14, 2.08, 0.78);
    const eR = eL.clone(); eR.position.x = 0.14;
    u.add(eL, eR);
    // The horn — gold, softly lit.
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0xffe89a, emissive: 0xd8b45a, emissiveIntensity: 0.9 }));
    horn.position.set(0, 2.16, 0.88);
    horn.rotation.x = 0.25;
    u.add(horn);
    const legGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.8, 5);
    [[-0.24, 0.5], [0.24, 0.5], [-0.24, -0.5], [0.24, -0.5]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, coatMat);
      leg.position.set(lx, 0.4, lz);
      u.add(leg);
    });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.9, 6), new THREE.MeshStandardMaterial({ color: moon ? 0xd8e4ff : 0xe8ddf0, roughness: 0.9 }));
    tail.position.set(0, 1.2, -0.95);
    tail.rotation.x = 2.6;
    u.add(tail);
    const glow = makeGlowSprite(moon ? 'rgba(180,200,255,0.8)' : 'rgba(220,220,255,0.5)', 2.2, 0.4);
    glow.position.y = 1.4;
    u.add(glow);
    return { group: u, head, neck };
  }
  const unicornDefs = [
    { name: 'Selene the Moon Unicorn', pos: [11, 0, -7], moon: true },
    { name: 'Lunaria the Moon Unicorn', pos: [20, 0, -13], moon: true },
    { name: 'Willow the Unicorn', pos: [18, 0, 20], moon: false },
    { name: 'Briar the Unicorn', pos: [30, 0, 2], moon: false },
  ];
  const unicornLines = {
    'Selene the Moon Unicorn': [
      'Selene grazes among the glow trees, her coat shining faint silver-blue. She looks up, unafraid, and goes back to her moonlit grass.',
      'Selene\'s horn glows like a held breath. Where she walks, the mushrooms glow a little brighter, as if in greeting.',
    ],
    'Lunaria the Moon Unicorn': [
      'Lunaria\'s horn glows soft as a candle. The fairies gather around her at dusk, because her light is the warmest in the grove.',
      'Lunaria stands very still in the fairy ring, listening to something only unicorns can hear. She looks content.',
    ],
    'Willow the Unicorn': [
      'Willow grazes the meadow\'s edge, gentle as rainfall. Butterflies land on her mane and she lets them stay.',
      'Willow lifts her head and regards you with calm silver eyes, then dips back to the clover. You have been approved.',
    ],
    'Briar the Unicorn': [
      'Briar stamps once, tosses his mane, and canters a shining circle around the meadow — just for the joy of it.',
      'Briar is the boldest of the unicorns. He will come right up to you, snuff the air, and decide you are a friend.',
    ],
  };
  const unicorns = [];
  unicornDefs.forEach((cfg) => {
    const uni = makeUnicorn({ moon: cfg.moon });
    uni.group.position.set(...cfg.pos);
    uni.group.rotation.y = rnd() * Math.PI * 2;
    group.add(uni.group);
    unicorns.push({ ...uni, home: new THREE.Vector3(...cfg.pos), phase: rnd() * 6 });
    register(uni.group, cfg.name, unicornLines[cfg.name], 2.8, 70);
  });
  animated.push((dt, t) => {
    for (const uni of unicorns) {
      // Slow drift + graze bob, like the deer.
      uni.group.position.x = uni.home.x + Math.sin(t * 0.07 + uni.phase) * 1.5;
      uni.group.position.z = uni.home.z + Math.cos(t * 0.05 + uni.phase) * 1.3;
      const g = Math.max(0, Math.sin(t * 0.3 + uni.phase));
      uni.head.position.y = 1.9 - g * 0.7;
      uni.head.position.z = 0.82 + g * 0.35;
      uni.neck.rotation.x = 0.4 + g * 0.7;
    }
  });

  return {
    group,
    interactables,
    update(dt, t) { for (const fn of animated) fn(dt, t); },
  };
}
