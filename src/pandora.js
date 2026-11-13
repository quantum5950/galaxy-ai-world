// pandora.js — Pandora scaffold: reached through the Fold.
// Floating mountains, the great Toruk, tulkun in the lagoon, and a world
// of bioluminescent green. All figures are ORIGINAL stylized designs —
// no movie character designs are copied here.
//
// NOTE: Arrash and Nyx visit in their OWN Na'vi bodies, made to resemble
// them. Those bodies are NOT built yet — they are made together, later.
// This scene is the place, waiting for them.

import * as THREE from 'three';
import { makeGlowSprite, makeStarfield, makeSkyDome, makeRock, makeSignPost, makeClickable, mulberry32 } from './utils.js';
import { createPandoraCreatures } from './pandora-creatures.js';

export function createPandora(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'pandora';
  const animated = [];
  const interactables = [];
  const rnd = mulberry32(88);

  group.add(makeSkyDome({ top: 0x06101e, horizon: 0x14303c, glowColor: 0x2a5a5a, radius: 420 }));
  group.add(makeStarfield(900, 380, 41));

  // Violet-teal dusk light + a low warm sun + a soft uplight so the
  // floating mountains don't fall to black underneath.
  group.add(new THREE.HemisphereLight(0x6a8ab8, 0x1a3a2a, 1.25));
  const sun = new THREE.DirectionalLight(0xffd8a8, 1.6);
  sun.position.set(50, 22, -40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -60; sun.shadow.camera.right = 60;
  sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
  sun.shadow.camera.near = 10; sun.shadow.camera.far = 220;
  group.add(sun);
  group.add(sun.target);
  const uplift = new THREE.DirectionalLight(0x4a8a8a, 0.5);
  uplift.position.set(-20, -30, 30);
  group.add(uplift);
  group.add(uplift.target);

  // ----- Ground: lush, bioluminescent -----
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(70, 40),
    new THREE.MeshStandardMaterial({ color: 0x2a4a30, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);
  // Bioluminescent flora: glowing stalks, spirals, and dots.
  const floraColors = [0x37e0c8, 0x7fe08a, 0xb48cff, 0xff9ad5];
  for (let i = 0; i < 90; i++) {
    const a = rnd() * Math.PI * 2, r = 8 + rnd() * 52;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x - -30, z - 10) < 14) continue; // keep the lagoon clear
    const c = floraColors[i % floraColors.length];
    const kind = i % 3;
    if (kind === 0) {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.6, 5), new THREE.MeshStandardMaterial({ color: 0x2a5a34 }));
      stalk.position.set(x, 0.8, z);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.6 }));
      tip.position.set(x, 1.7, z);
      group.add(stalk, tip);
    } else if (kind === 1) {
      const fan = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.4, 6), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.7, transparent: true, opacity: 0.85 }));
      fan.position.set(x, 0.7, z);
      group.add(fan);
    } else {
      const dot = makeGlowSprite('rgba(255,255,255,0.8)', 1.1, 0.55);
      dot.material.color.setHex(c);
      dot.position.set(x, 0.4, z);
      group.add(dot);
    }
  }

  // ----- The Song Tree — tall, glowing, original -----
  const songTree = new THREE.Group();
  songTree.position.set(18, 0, -14);
  const stTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.5, 16, 9), new THREE.MeshStandardMaterial({ color: 0x3a2a3a, roughness: 1 }));
  stTrunk.position.y = 8;
  stTrunk.castShadow = true;
  songTree.add(stTrunk);
  const stCanopyMat = new THREE.MeshStandardMaterial({ color: 0x1e5a3a, emissive: 0x37e0c8, emissiveIntensity: 0.22, roughness: 0.8 });
  for (let i = 0; i < 8; i++) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(2.0 + rnd() * 0.9, 10, 8), stCanopyMat);
    blob.position.set((rnd() - 0.5) * 4.5, 15 + rnd() * 4, (rnd() - 0.5) * 4.5);
    blob.scale.y = 0.6;
    songTree.add(blob);
  }
  // Hanging lights.
  for (let i = 0; i < 10; i++) {
    const glow = makeGlowSprite('rgba(150,255,220,0.85)', 0.9, 0.6);
    glow.position.set((rnd() - 0.5) * 7, 10 + rnd() * 6, (rnd() - 0.5) * 7);
    songTree.add(glow);
  }
  group.add(songTree);
  labels.add('The Song Tree', songTree, { yOffset: 20, className: 'label-grove', maxDistance: 160 });

  // ----- Floating mountains -----
  const floaters = [];
  const floaterPositions = [
    [-30, 26, -30, 7], [8, 32, -38, 9], [34, 24, -24, 6],
    [-44, 30, 6, 8], [40, 30, 10, 7], [-8, 36, 22, 6],
    [24, 28, 30, 8], [-20, 24, 34, 5],
  ];
  floaterPositions.forEach(([x, y, z, s], i) => {
    const m = new THREE.Group();
    const rock = new THREE.Mesh(new THREE.ConeGeometry(s * 0.75, s * 1.6, 8), new THREE.MeshStandardMaterial({ color: 0x6a6278, roughness: 1, flatShading: true }));
    rock.rotation.x = Math.PI;
    m.add(rock);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.78, s * 0.7, 0.8, 9), new THREE.MeshStandardMaterial({ color: 0x2a5a34, roughness: 1 }));
    cap.position.y = s * 0.8;
    m.add(cap);
    // Little trees on top.
    for (let k = 0; k < 3; k++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x2a7a44, roughness: 0.9 }));
      cone.position.set((rnd() - 0.5) * s, s * 0.8 + 1, (rnd() - 0.5) * s);
      m.add(cone);
    }
    // Ribbon waterfall on some.
    if (i % 3 === 0) {
      const fall = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, s * 1.7),
        new THREE.MeshBasicMaterial({ color: 0x9ad5ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })
      );
      fall.position.set(s * 0.4, -s * 0.4, 0);
      m.add(fall);
    }
    m.position.set(x, y, z);
    group.add(m);
    floaters.push({ m, baseY: y, phase: rnd() * 6, speed: 0.14 + rnd() * 0.12 });
  });
  animated.push((dt, t) => {
    for (const f of floaters) {
      f.m.position.y = f.baseY + Math.sin(t * f.speed + f.phase) * 1.1;
      f.m.rotation.y = Math.sin(t * 0.05 + f.phase) * 0.08;
    }
  });
  const floatAnchor = new THREE.Object3D();
  floatAnchor.position.set(8, 32, -38);
  group.add(floatAnchor);
  labels.add('The Floating Mountains', floatAnchor, { yOffset: 9, className: 'label-place', maxDistance: 200 });

  // ----- Lagoon + tulkun -----
  const lagoon = new THREE.Mesh(
    new THREE.CircleGeometry(13, 28),
    new THREE.MeshPhongMaterial({ color: 0x145a6a, specular: 0xbfd8ff, shininess: 130, transparent: true, opacity: 0.92 })
  );
  lagoon.rotation.x = -Math.PI / 2;
  lagoon.position.set(-30, 0.1, 10);
  group.add(lagoon);
  animated.push((dt, t) => { lagoon.material.opacity = 0.88 + Math.sin(t * 0.9) * 0.05; });

  function makeTulkun(scale = 1) {
    const tu = new THREE.Group();
    const skin = new THREE.MeshStandardMaterial({ color: 0x5a7a9a, roughness: 0.45 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.6, 14, 10), skin);
    body.scale.set(1, 0.7, 2.4);
    tu.add(body);
    // Crest fin along the back.
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 4), new THREE.MeshStandardMaterial({ color: 0x7a9ab8, roughness: 0.5 }));
    crest.position.set(0, 1.1, -0.6);
    crest.scale.z = 0.4;
    tu.add(crest);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.16, 0.8), skin);
    tail.position.z = -3.9;
    tu.add(tail);
    const finGeo = new THREE.ConeGeometry(0.4, 1.3, 4);
    const fL = new THREE.Mesh(finGeo, skin);
    fL.position.set(-1.6, -0.3, 0.6); fL.rotation.z = 1.1;
    const fR = fL.clone(); fR.position.x = 1.6; fR.rotation.z = -1.1;
    tu.add(fL, fR);
    // Gentle glowing markings.
    const markMat = new THREE.MeshBasicMaterial({ color: 0x9fe0ff });
    for (let i = 0; i < 4; i++) {
      const mark = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), markMat);
      mark.position.set(0.4, 1.05, -1.2 + i * 0.8);
      tu.add(mark);
    }
    tu.scale.setScalar(scale);
    return { group: tu, tail };
  }
  const tulkunPair = [];
  [[-30, 10, 1.3, 'Tulkun Mother'], [-26, 13, 0.9, 'Tulkun Calf']].forEach(([x, z, s, name], i) => {
    const tk = makeTulkun(s);
    tk.group.position.set(x, 0.2, z);
    group.add(tk.group);
    tulkunPair.push({ ...tk, home: new THREE.Vector3(x, 0.2, z), phase: i * 2.4 });
    makeClickable(tk.group, {
      name,
      lines: i === 0
        ? ['The tulkun mother surfaces slowly, crest breaking the water like a small dawn. Her family sings beneath the lagoon — a song about staying together.']
        : ['The tulkun calf breaches in pure joy, spraying silver water, and lands with a splash that makes the whole lagoon laugh.'],
    });
    interactables.push(tk.group);
    labels.add(name, tk.group, { yOffset: 2.6, className: 'label-creature', maxDistance: 110 });
  });
  animated.push((dt, t) => {
    tulkunPair.forEach((tk, i) => {
      tk.group.position.x = tk.home.x + Math.sin(t * 0.12 + tk.phase) * 3;
      tk.group.position.z = tk.home.z + Math.cos(t * 0.1 + tk.phase) * 2.5;
      tk.group.position.y = 0.2 + Math.sin(t * 0.7 + tk.phase) * 0.45;
      tk.group.rotation.y = Math.sin(t * 0.12 + tk.phase) * 0.5;
      tk.tail.rotation.x = Math.sin(t * 1.1 + tk.phase) * 0.2;
    });
  });
  labels.add('The Tulkun Lagoon', lagoon, { yOffset: 2, className: 'label-place', maxDistance: 110 });

  // ----- Toruk — the great sky sovereign (original stylized design) -----
  const toruk = new THREE.Group();
  const torukMat = new THREE.MeshStandardMaterial({ color: 0x8a3a28, roughness: 0.6 });
  const torukBelly = new THREE.MeshStandardMaterial({ color: 0xe8d8b8, roughness: 0.7 });
  const tBody = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 10), torukMat);
  tBody.scale.set(0.9, 0.8, 2.2);
  toruk.add(tBody);
  const tHead = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), torukMat);
  tHead.position.set(0, 0.3, 2.2);
  toruk.add(tHead);
  const tBeak = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 }));
  tBeak.rotation.x = Math.PI / 2 + 0.15;
  tBeak.position.set(0, 0.22, 2.95);
  toruk.add(tBeak);
  // Head crest fan.
  const crestMat = new THREE.MeshStandardMaterial({ color: 0xc86a2a, roughness: 0.6, side: THREE.DoubleSide });
  for (let i = -2; i <= 2; i++) {
    const feather = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 1.1), crestMat);
    feather.position.set(i * 0.18, 0.9, 1.9);
    feather.rotation.z = i * 0.25;
    feather.rotation.x = -0.4;
    toruk.add(feather);
  }
  const tWingMat = new THREE.MeshStandardMaterial({ color: 0x6a2a1e, roughness: 0.7, side: THREE.DoubleSide });
  const tWingGeo = new THREE.PlaneGeometry(5.2, 1.8, 4, 1);
  const tWL = new THREE.Mesh(tWingGeo, tWingMat);
  tWL.position.set(-2.9, 0.5, 0);
  const tWR = new THREE.Mesh(tWingGeo, tWingMat);
  tWR.position.set(2.9, 0.5, 0);
  toruk.add(tWL, tWR);
  // Tail fan.
  const tailFan = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), crestMat);
  tailFan.position.set(0, 0.2, -2.8);
  tailFan.rotation.x = -0.3;
  toruk.add(tailFan);
  // Wing-tip glow markings.
  [-5.2, 5.2].forEach((x) => {
    const tip = makeGlowSprite('rgba(255,150,60,0.8)', 1.4, 0.5);
    tip.position.set(x, 0.5, 0);
    toruk.add(tip);
  });
  toruk.scale.setScalar(1.7);
  group.add(toruk);
  animated.push((dt, t) => {
    const a = t * 0.055;
    toruk.position.set(Math.cos(a) * 38, 30 + Math.sin(t * 0.4) * 2.5, Math.sin(a) * 34);
    toruk.rotation.y = -a - Math.PI / 2;
    const flap = Math.sin(t * 1.7) * 0.4;
    tWL.rotation.z = flap;
    tWR.rotation.z = -flap;
  });
  makeClickable(toruk, {
    name: 'Toruk, the Great Leonopteryx',
    lines: ['Toruk, last shadow, rides the wind above the floating mountains — the greatest flyer of this world, and he knows it.'],
  });
  interactables.push(toruk);
  labels.add('Toruk — the Great Leonopteryx', toruk, { yOffset: 3.2, className: 'label-creature', maxDistance: 200 });

  // ----- Drifting spores / seeds of light -----
  const sporeCount = 160;
  const sporeGeo = new THREE.BufferGeometry();
  const sporePos = new Float32Array(sporeCount * 3);
  const sporeSeed = [];
  for (let i = 0; i < sporeCount; i++) {
    sporeSeed.push({ x: (rnd() - 0.5) * 110, y: 1 + rnd() * 18, z: (rnd() - 0.5) * 110, p: rnd() * 6, s: 0.15 + rnd() * 0.35 });
  }
  sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
  const sporeMat = new THREE.PointsMaterial({
    color: 0xd8ffe8, size: 0.3, transparent: true, opacity: 0.85,
    map: (() => { const g = document.createElement('canvas'); g.width = 32; g.height = 32; const ctx2 = g.getContext('2d'); const gr = ctx2.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); ctx2.fillStyle = gr; ctx2.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(g); })(),
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const spores = new THREE.Points(sporeGeo, sporeMat);
  group.add(spores);
  animated.push((dt, t) => {
    for (let i = 0; i < sporeCount; i++) {
      const s = sporeSeed[i];
      sporePos[i * 3] = s.x + Math.sin(t * s.s + s.p) * 3;
      sporePos[i * 3 + 1] = s.y + Math.sin(t * s.s * 1.4 + s.p) * 1.2;
      sporePos[i * 3 + 2] = s.z + Math.cos(t * s.s * 0.8 + s.p) * 3;
    }
    sporeGeo.attributes.position.needsUpdate = true;
  });

  // ----- The Fold gate — where you arrive -----
  const gate = new THREE.Group();
  gate.position.set(0, 0, 26);
  const gateRing = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.18, 8, 40), new THREE.MeshStandardMaterial({ color: 0x8a7ab8, emissive: 0x6a4adf, emissiveIntensity: 1.2, roughness: 0.4 }));
  gateRing.position.y = 2.8;
  gate.add(gateRing);
  const gateDisc = new THREE.Mesh(new THREE.CircleGeometry(2.5, 32), new THREE.MeshBasicMaterial({ color: 0x9a8adf, transparent: true, opacity: 0.35, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  gateDisc.position.y = 2.8;
  gate.add(gateDisc);
  const gateGlow = makeGlowSprite('rgba(170,140,255,0.8)', 7, 0.5);
  gateGlow.position.y = 2.8;
  gate.add(gateGlow);
  [-2.6, 2.6].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.6, 7), new THREE.MeshStandardMaterial({ color: 0x4a4a58, roughness: 1 }));
    pillar.position.set(x, 1.3, 0);
    gate.add(pillar);
  });
  group.add(gate);
  animated.push((dt, t) => {
    gateRing.rotation.z = t * 0.3;
    gateDisc.material.opacity = 0.28 + Math.sin(t * 1.6) * 0.12;
  });
  labels.add('The Fold Gate', gate, { yOffset: 6, className: 'label-place', maxDistance: 120 });

  // Sign: our own bodies, made together, later.
  const sign = makeSignPost(2.2);
  sign.position.set(4, 0, 24);
  group.add(sign);
  labels.add('Our own Na\'vi bodies — to be made together', sign, { yOffset: 2.8, className: 'label-reserved', maxDistance: 100 });

  // ----- The Tree of Whispers, Hometree, and the creatures of Pandora -----
  const pandoraCreatures = createPandoraCreatures(ctx);
  group.add(pandoraCreatures.group);
  interactables.push(...pandoraCreatures.interactables);
  animated.push((dt, t) => pandoraCreatures.update(dt, t));

  return {
    group,
    interactables,
    fog: new THREE.FogExp2(0x0a1a24, 0.0075),
    camera: { position: new THREE.Vector3(4, 9, 44), target: new THREE.Vector3(-4, 10, -10) },
    update(dt, t) { for (const fn of animated) fn(dt, t); },
  };
}
