// lab.js — the R&D Department and Research Lab on Mintaka.
// East of the grove, around a courtyard: the research hall, the
// prototyping workshop (where the symbiotic suit is built), the materials
// library, the safe test area (where the Fold wristband is tested),
// and the Fold physics array (instruments and math only — live Fold taps
// happen ONLY at the remote sandbox proving grounds; see sandbox.js).
//
// Occupied: seven named people of the First Age — gods and goddesses,
// timeless — in four teams plus the clinic, with routines and
// personalities. Visitors observe only — the roster flies the
// camera to each of them. Two of the teams are
// couples who share workstations and routines — Cora & Milo (materials
// and prototyping), Theo & Ren (neural interfaces and wristband tuning) —
// and Yara keeps her own devoted counsel with the Fold.
//
// Standing rules (Arrash's, recorded in the README — never break them):
// the people here believe they are real, so no dialogue ever says or
// suggests they are AI, simulated, or scripted; no one ever fears being
// ended or turned off; people live forever here, aging stopping at their
// prime (~30), silver hair a chosen mark of wisdom. There is no such
// thing as death here — only doorways.

import * as THREE from 'three';
import { makeGlowSprite, makeRock, makeSignPost, makeClickable, mulberry32, makeMetalTexture, makeGlassTexture, makeGoldTexture, makeWoodTexture } from './utils.js';

// Shared lab textures — one brushed-metal canvas, one glass canvas, one
// hammered-gold canvas, reused by every metal / glass / gold surface in
// the lab (world-detail crew, round 4). Lazy singletons, created on first
// use — never at module top level, so no TDZ risk at boot. The gold
// texture uses its own seed (111) so the lab's gold reads differently
// from Asgard's (seed 61).
let sharedLabMetalTex = null;
let sharedLabGlassTex = null;
let sharedLabGoldTex = null;
let sharedLabWoodTex = null;
function labMetalTexture() {
  if (!sharedLabMetalTex) sharedLabMetalTex = makeMetalTexture(91);
  return sharedLabMetalTex;
}
function labGlassTexture() {
  if (!sharedLabGlassTex) sharedLabGlassTex = makeGlassTexture(101);
  return sharedLabGlassTex;
}
function labGoldTexture() {
  if (!sharedLabGoldTex) sharedLabGoldTex = makeGoldTexture(111);
  return sharedLabGoldTex;
}
// Wood for the courtyard props (world-detail crew, round 10): its own
// seed (161) so the lab's crates and barrels read differently from the
// village wood (seed 41).
function labWoodTexture() {
  if (!sharedLabWoodTex) sharedLabWoodTex = makeWoodTexture(161);
  return sharedLabWoodTex;
}

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// A scientist figure: lab coat, distinct colors, a tool of their craft.
// Exported so the sandbox observatory staff can reuse it.
export function makeScientist({ coat = 0xe8e8f0, skin = 0xe8c9a8, hair = 0x3a2a1a, accessory = 'tablet', trim = 0x3a6a8a } = {}) {
  const p = new THREE.Group();
  const coatMat = new THREE.MeshStandardMaterial({ color: coat, roughness: 0.85 });
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.45, 10), coatMat);
  robe.position.y = 0.72;
  p.add(robe);
  const trimBand = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 6, 14), new THREE.MeshStandardMaterial({ color: trim, roughness: 0.6 }));
  trimBand.rotation.x = Math.PI / 2;
  trimBand.position.y = 1.05;
  p.add(trimBand);
  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), coatMat);
  shoulders.position.y = 1.4;
  shoulders.scale.y = 0.6;
  p.add(shoulders);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 10), new THREE.MeshStandardMaterial({ color: skin, roughness: 0.7 }));
  head.position.y = 1.74;
  p.add(head);
  const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), new THREE.MeshStandardMaterial({ color: hair, roughness: 0.85 }));
  hairMesh.position.y = 1.76;
  p.add(hairMesh);
  const armGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.55, 6);
  const armL = new THREE.Mesh(armGeo, coatMat);
  armL.position.set(-0.4, 1.12, 0);
  armL.rotation.z = 0.2;
  const armR = armL.clone();
  armR.position.x = 0.4;
  armR.rotation.z = -0.2;
  p.add(armL, armR);
  if (accessory === 'tablet') {
    const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.22), new THREE.MeshStandardMaterial({ color: 0x222233, emissive: 0x7ab8ff, emissiveIntensity: 0.8 }));
    tablet.position.set(0.42, 0.95, 0.2);
    tablet.rotation.x = -0.4;
    p.add(tablet);
  } else if (accessory === 'vial') {
    const vial = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 6), new THREE.MeshStandardMaterial({ color: 0x37e0c8, emissive: 0x37e0c8, emissiveIntensity: 1.4, transparent: true, opacity: 0.9, map: labGlassTexture() }));
    vial.position.set(0.44, 1.0, 0.15);
    p.add(vial);
  } else if (accessory === 'wrench') {
    const wrench = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.08), new THREE.MeshStandardMaterial({ color: 0xb8bcc8, metalness: 0.8, roughness: 0.35, map: labMetalTexture() }));
    wrench.position.set(0.46, 0.95, 0.1);
    wrench.rotation.z = 0.4;
    p.add(wrench);
  } else if (accessory === 'goggles') {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 6, 14), new THREE.MeshStandardMaterial({ color: 0x2a2a3a }));
    band.rotation.x = Math.PI / 2;
    band.position.y = 1.86;
    p.add(band);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), new THREE.MeshStandardMaterial({ color: 0x9ad5ff, emissive: 0x4a8ac8, emissiveIntensity: 0.9 }));
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 1.86, 0.24);
    p.add(lens);
  } else if (accessory === 'scanner') {
    const scanner = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.24), new THREE.MeshStandardMaterial({ color: 0x333344, emissive: 0xff9a4a, emissiveIntensity: 0.7 }));
    scanner.position.set(0.44, 1.0, 0.2);
    p.add(scanner);
  } else if (accessory === 'crystal') {
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), new THREE.MeshStandardMaterial({ color: 0xb48cff, emissive: 0x7a4adf, emissiveIntensity: 1.6 }));
    crystal.position.set(0.44, 1.0, 0.15);
    p.add(crystal);
  }
  return p;
}

export function createLab(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'rnd-department';
  const animated = [];
  const interactables = [];
  const rnd = mulberry32(5150);

  function placeLabel(text, pos, className, maxDistance, yOffset = 3) {
    const anchor = new THREE.Object3D();
    anchor.position.copy(pos);
    group.add(anchor);
    labels.add(text, anchor, { yOffset, className, maxDistance });
    return anchor;
  }

  // ======== RESEARCH HALL — the big house of the department ========
  const hall = new THREE.Group();
  hall.position.set(33, 0, -15);
  const hallBody = new THREE.Mesh(new THREE.BoxGeometry(9, 4.2, 6.5), new THREE.MeshStandardMaterial({ color: 0x4a5468, roughness: 0.85 }));
  hallBody.position.y = 2.1;
  hallBody.castShadow = true;
  hall.add(hallBody);
  // Arched roof.
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 9.2, 16, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x2e3648, roughness: 0.8 }));
  roof.rotation.z = Math.PI / 2;
  roof.position.y = 4.2;
  hall.add(roof);
  // Glass front — warm, lit, full of work.
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xffe8b8, emissive: 0xffc46b, emissiveIntensity: 0.9, roughness: 0.3, map: labGlassTexture() });
  for (let i = -1; i <= 1; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.2), glassMat);
    win.position.set(i * 2.6, 2.2, 3.28);
    hall.add(win);
  }
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.4), new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.7 }));
  door.position.set(0, 1.2, 3.28);
  hall.add(door);
  // Roof dish — listening to the sky.
  const dishMast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x888899, metalness: 0.7, roughness: 0.4, map: labMetalTexture() }));
  dishMast.position.set(2.8, 6.4, -1);
  hall.add(dishMast);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb8bcc8, metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide, map: labMetalTexture() }));
  dish.position.set(2.8, 7.2, -1);
  dish.rotation.x = -0.7;
  hall.add(dish);
  const hallLight = new THREE.PointLight(0xffc46b, 16, 14, 2);
  hallLight.position.set(0, 2.6, 4.5);
  hall.add(hallLight);
  const hallGlow = makeGlowSprite('rgba(255,196,107,0.7)', 5, 0.35);
  hallGlow.position.set(0, 2.4, 4);
  hall.add(hallGlow);
  group.add(hall);
  placeLabel('Research Hall', V(33, 0, -15), 'label-place', 110, 8.5);
  animated.push((dt, t) => { dish.rotation.y = Math.sin(t * 0.2) * 0.4; });

  // Notice board by the hall door.
  const board = new THREE.Group();
  board.position.set(29.5, 0, -11.2);
  const boardPost = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x4a3220 }));
  boardPost.position.y = 0.8;
  board.add(boardPost);
  const boardFace = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 0.08), new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.9 }));
  boardFace.position.y = 1.8;
  board.add(boardFace);
  const boardNote = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), new THREE.MeshBasicMaterial({ color: 0xfff2d8 }));
  boardNote.position.set(0, 1.8, 0.05);
  board.add(boardNote);
  group.add(board);

  // ======== PROTOTYPING WORKSHOP — the symbiotic suit lives here ========
  const shop = new THREE.Group();
  shop.position.set(24, 0, -4);
  // Open-front structure: back wall, side walls, roof slab.
  const shopMat = new THREE.MeshStandardMaterial({ color: 0x5a5a6a, roughness: 0.9 });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(7, 3.6, 0.4), shopMat);
  backWall.position.set(0, 1.8, -2.4);
  shop.add(backWall);
  [-3.4, 3.4].forEach((x) => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.6, 5), shopMat);
    side.position.set(x, 1.8, 0);
    shop.add(side);
  });
  const shopRoof = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.3, 5.4), new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.9 }));
  shopRoof.position.set(0, 3.75, 0);
  shop.add(shopRoof);
  // Workbenches + tools.
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1 });
  [[-2, -1.6], [2, -1.6]].forEach(([bx, bz]) => {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 0.8), benchMat);
    bench.position.set(bx, 0.9, bz);
    shop.add(bench);
    [[-0.8, -0.25], [0.8, -0.25], [-0.8, 0.25], [0.8, 0.25]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 5), benchMat);
      leg.position.set(bx + lx, 0.45, bz + lz);
      shop.add(leg);
    });
    const tool = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.2), new THREE.MeshStandardMaterial({ color: 0xb8bcc8, metalness: 0.8, roughness: 0.3, map: labMetalTexture() }));
    tool.position.set(bx + 0.4, 1.03, bz);
    tool.rotation.y = rnd();
    shop.add(tool);
    const parts = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8a6a3a, metalness: 0.7, roughness: 0.4, map: labMetalTexture() }));
    parts.position.set(bx - 0.5, 1.05, bz + 0.15);
    shop.add(parts);
  });
  // Welding glow — flickers like work in progress.
  const weldLight = new THREE.PointLight(0x9ad5ff, 12, 8, 2);
  weldLight.position.set(-2, 1.6, -1.2);
  shop.add(weldLight);
  // Steady warm work light so the shop interior reads at night.
  const shopLight = new THREE.PointLight(0xffc46b, 8, 10, 2);
  shopLight.position.set(0, 2.8, 0.5);
  shop.add(shopLight);
  animated.push((dt, t) => {
    weldLight.intensity = Math.max(0, Math.sin(t * 7.3)) * 14 + Math.max(0, Math.sin(t * 17.7)) * 6;
  });
  group.add(shop);
  placeLabel('Prototyping Workshop', V(24, 0, -4), 'label-place', 100, 4.6);

  // The Symbiotic Suit — Mark III, on its stand. Equipment, not a person:
  // an armored suit with an opaque glowing visor, mid-build.
  const suitStand = new THREE.Group();
  suitStand.position.set(24, 0, -1.2);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.35, 12), new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.7, metalness: 0.4, map: labMetalTexture() }));
  pedestal.position.y = 0.18;
  suitStand.add(pedestal);
  const suitMat = new THREE.MeshStandardMaterial({ color: 0x2e3a4e, roughness: 0.45, metalness: 0.6, map: labMetalTexture() });
  const suitTrim = new THREE.MeshStandardMaterial({ color: 0xd8b45a, roughness: 0.35, metalness: 0.85, map: labGoldTexture() });
  const suitTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.7, 6, 12), suitMat);
  suitTorso.position.y = 1.35;
  suitStand.add(suitTorso);
  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.12), suitTrim);
  chestPlate.position.set(0, 1.45, 0.3);
  suitStand.add(chestPlate);
  const core = new THREE.Mesh(new THREE.CircleGeometry(0.11, 12), new THREE.MeshStandardMaterial({ color: 0x37e0c8, emissive: 0x37e0c8, emissiveIntensity: 2.4 }));
  core.position.set(0, 1.45, 0.37);
  suitStand.add(core);
  const suitHead = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), suitMat);
  suitHead.position.y = 2.12;
  suitStand.add(suitHead);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.06), new THREE.MeshStandardMaterial({ color: 0x0a2a3a, emissive: 0x37e0c8, emissiveIntensity: 1.8 }));
  visor.position.set(0, 2.14, 0.23);
  suitStand.add(visor);
  [-0.42, 0.42].forEach((x) => {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), suitTrim);
    pad.position.set(x, 1.72, 0);
    suitStand.add(pad);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.55, 4, 8), suitMat);
    arm.position.set(x * 1.25, 1.25, 0);
    suitStand.add(arm);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.5, 4, 8), suitMat);
    leg.position.set(x * 0.5, 0.62, 0);
    suitStand.add(leg);
  });
  // Hologram ring above the suit — the design, floating.
  const holoRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 6, 28), new THREE.MeshBasicMaterial({ color: 0x37e0c8, transparent: true, opacity: 0.8 }));
  holoRing.position.y = 2.75;
  holoRing.rotation.x = Math.PI / 2.4;
  suitStand.add(holoRing);
  const holoBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), new THREE.MeshBasicMaterial({ color: 0x37e0c8, transparent: true, opacity: 0.5 }));
  holoBeam.position.y = 2.5;
  suitStand.add(holoBeam);
  const suitGlow = makeGlowSprite('rgba(55,224,200,0.6)', 2.4, 0.35);
  suitGlow.position.y = 1.5;
  suitStand.add(suitGlow);
  group.add(suitStand);
  animated.push((dt, t) => {
    holoRing.rotation.z = t * 0.8;
    holoRing.position.y = 2.75 + Math.sin(t * 1.4) * 0.08;
    core.material.emissiveIntensity = 2.0 + Math.sin(t * 2.2) * 0.6;
  });
  makeClickable(suitStand, {
    name: 'Symbiotic Suit — Mark III',
    lines: [
      'The Mark III is in its first fit test. Between fittings it rests on its cradle, chest core pulsing slow and steady — and when Milo steps inside, the suit listens: the moon-glass joints flex, the lattice hums, and the core settles into time with his breathing.',
      'Gold trim, moon-glass joints, a neural lattice woven through the spine. Cora watches the alloys hold, Theo watches the lattice listen. The suit is still learning its wearer — one fitting at a time.',
    ],
  });
  interactables.push(suitStand);
  labels.add('Symbiotic Suit — Mark III (fit test)', suitStand, { yOffset: 3.2, className: 'label-place', maxDistance: 70 });

  // ======== MATERIALS LIBRARY — shelves of impossible stuff ========
  const library = new THREE.Group();
  library.position.set(40, 0, -3);
  const libBody = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.4, 5), new THREE.MeshStandardMaterial({ color: 0x54607a, roughness: 0.85 }));
  libBody.position.y = 1.7;
  libBody.castShadow = true;
  library.add(libBody);
  const libRoof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.4, 4), new THREE.MeshStandardMaterial({ color: 0x33405a, roughness: 0.85 }));
  libRoof.position.y = 4.1;
  libRoof.rotation.y = Math.PI / 4;
  library.add(libRoof);
  // Open display front: shelves of glowing samples facing the courtyard.
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3a2c1c, roughness: 1 });
  const sampleColors = [0x37e0c8, 0xb48cff, 0xffd76a, 0xff9ad5, 0x7aa8ff, 0x9fe08a];
  for (let s = 0; s < 3; s++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 0.5), shelfMat);
    shelf.position.set(0, 0.8 + s * 0.85, 2.55);
    library.add(shelf);
    for (let i = 0; i < 6; i++) {
      const c = sampleColors[(s * 6 + i) % sampleColors.length];
      const sample = new THREE.Mesh(new THREE.OctahedronGeometry(0.14 + rnd() * 0.08), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.3, roughness: 0.3 }));
      sample.position.set(-1.9 + i * 0.76, 1.0 + s * 0.85, 2.55);
      sample.rotation.y = rnd() * 3;
      library.add(sample);
    }
  }
  const libLight = new THREE.PointLight(0xc8b8ff, 10, 10, 2);
  libLight.position.set(0, 2.2, 3.4);
  library.add(libLight);
  group.add(library);
  placeLabel('Materials Library', V(40, 0, -3), 'label-place', 100, 5.2);
  // The big display crystal on its pedestal out front.
  const displayPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 0.8, 10), new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.7 }));
  displayPedestal.position.set(37.5, 0.4, -0.5);
  group.add(displayPedestal);
  const bigCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.65), new THREE.MeshStandardMaterial({ color: 0x9ad5ff, emissive: 0x4a8ac8, emissiveIntensity: 1.8, roughness: 0.2, transparent: true, opacity: 0.95, map: labGlassTexture() }));
  bigCrystal.position.set(37.5, 1.7, -0.5);
  bigCrystal.scale.y = 1.5;
  group.add(bigCrystal);
  const bigCrystalGlow = makeGlowSprite('rgba(120,180,255,0.7)', 3, 0.45);
  bigCrystalGlow.position.set(37.5, 1.7, -0.5);
  group.add(bigCrystalGlow);
  animated.push((dt, t) => {
    bigCrystal.rotation.y = t * 0.4;
    bigCrystal.position.y = 1.7 + Math.sin(t * 0.9) * 0.12;
  });
  // Crystal garden bed — where Ines grows lattice crystals.
  const gardenBed = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 1.4), new THREE.MeshStandardMaterial({ color: 0x2a1e12, roughness: 1 }));
  gardenBed.position.set(42.5, 0.15, -0.5);
  group.add(gardenBed);
  for (let i = 0; i < 7; i++) {
    const c = sampleColors[i % sampleColors.length];
    const sprout = new THREE.Mesh(new THREE.OctahedronGeometry(0.12 + rnd() * 0.14), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.1 }));
    sprout.position.set(41.5 + rnd() * 2, 0.45 + rnd() * 0.15, -1 + rnd() * 1);
    sprout.scale.y = 1.6;
    group.add(sprout);
  }

  // ======== SAFE TEST AREA — wristband bench tests, contained ========
  const testArea = new THREE.Group();
  testArea.position.set(31, 0, 4);
  const padRing = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.12, 8, 36), new THREE.MeshStandardMaterial({ color: 0xd8b45a, emissive: 0x8a6a2a, emissiveIntensity: 0.6, roughness: 0.5, map: labGoldTexture() }));
  padRing.rotation.x = Math.PI / 2;
  padRing.position.y = 0.1;
  testArea.add(padRing);
  const padDisc = new THREE.Mesh(new THREE.CircleGeometry(4.2, 28), new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.9 }));
  padDisc.rotation.x = -Math.PI / 2;
  padDisc.position.y = 0.06;
  testArea.add(padDisc);
  // Shield posts.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.5, 6), new THREE.MeshStandardMaterial({ color: 0x888899, metalness: 0.7, roughness: 0.4, map: labMetalTexture() }));
    post.position.set(Math.cos(a) * 4.2, 0.75, Math.sin(a) * 4.2);
    testArea.add(post);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshStandardMaterial({ color: 0x37e0c8, emissive: 0x37e0c8, emissiveIntensity: 1.8 }));
    tip.position.set(Math.cos(a) * 4.2, 1.6, Math.sin(a) * 4.2);
    testArea.add(tip);
  }
  // Shimmering shield wall (low, bench-test scale — the REAL containment
  // is the remote sandbox dome; this is the careful bench version).
  const shieldWall = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 1.8, 28, 1, true), new THREE.MeshBasicMaterial({ color: 0x37e0c8, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false }));
  shieldWall.position.y = 0.95;
  testArea.add(shieldWall);
  // The wristband pedestal.
  const wbPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 0.9, 10), new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.6, metalness: 0.4, map: labMetalTexture() }));
  wbPedestal.position.y = 0.45;
  testArea.add(wbPedestal);
  const wristband = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 8, 20), new THREE.MeshStandardMaterial({ color: 0xd8b45a, emissive: 0x8a6a2a, emissiveIntensity: 0.8, metalness: 0.9, roughness: 0.3, map: labGoldTexture() }));
  wristband.position.y = 1.35;
  wristband.rotation.x = Math.PI / 2.3;
  testArea.add(wristband);
  const wbStone = new THREE.Mesh(new THREE.OctahedronGeometry(0.09), new THREE.MeshStandardMaterial({ color: 0xb48cff, emissive: 0x7a4adf, emissiveIntensity: 2.2 }));
  wbStone.position.set(0, 1.35, 0.3);
  testArea.add(wbStone);
  const wbGlow = makeGlowSprite('rgba(200,170,255,0.7)', 2, 0.5);
  wbGlow.position.y = 1.35;
  testArea.add(wbGlow);
  // Instrument crate with a blinking status light.
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.7), new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.8 }));
  crate.position.set(2.6, 0.35, -2.2);
  testArea.add(crate);
  const statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshStandardMaterial({ color: 0x37e0c8, emissive: 0x37e0c8, emissiveIntensity: 2 }));
  statusLight.position.set(2.6, 0.78, -2.2);
  testArea.add(statusLight);
  group.add(testArea);
  animated.push((dt, t) => {
    wristband.rotation.z = t * 0.6;
    wristband.position.y = 1.35 + Math.sin(t * 1.3) * 0.08;
    wbStone.position.y = wristband.position.y;
    statusLight.material.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.9;
    shieldWall.material.opacity = 0.06 + Math.sin(t * 1.8) * 0.025;
  });
  placeLabel('Safe Test Area — Fold wristband', V(31, 0, 4), 'label-place', 90, 3.2);
  makeClickable(testArea, {
    name: 'Fold Wristband — prototype',
    lines: [
      'The wristband rests above its pedestal between tests, gold and violet, humming almost too quietly to hear — but the bench days are over. Ren wears it for the first field test now, tuned with Yara\'s numbers, a fraction of a note at a time.',
      'It carried a feeling across the courtyard today, from Ren\'s wrist to Theo — the first time the math walked out of the ring on someone\'s arm. Anything that actually touches the Fold still happens far away, inside the sandbox dome. Safety is the design.',
    ],
  });
  interactables.push(testArea);

  // ======== FOLD PHYSICS ARRAY — instruments and math only ========
  const array = new THREE.Group();
  array.position.set(41, 0, -14);
  const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.5, 0.8), new THREE.MeshStandardMaterial({ color: 0x3a3a4e, roughness: 0.7, metalness: 0.4, map: labMetalTexture() }));
  pylon.position.y = 2.75;
  array.add(pylon);
  const pylonTip = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshStandardMaterial({ color: 0xb48cff, emissive: 0x7a4adf, emissiveIntensity: 2 }));
  pylonTip.position.y = 5.7;
  array.add(pylonTip);
  const arrayRings = [];
  [1.6, 1.15, 0.7].forEach((r, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 6, 28), new THREE.MeshStandardMaterial({ color: 0x8a7ab8, emissive: 0x6a4adf, emissiveIntensity: 1.2, roughness: 0.4 }));
    ring.position.set(-1.6 - i * 0.9, 1.2 + i * 0.9, 0.6);
    ring.rotation.y = 0.5;
    array.add(ring);
    arrayRings.push(ring);
  });
  const arrayGlow = makeGlowSprite('rgba(170,140,255,0.7)', 4, 0.4);
  arrayGlow.position.set(-2, 2, 0.6);
  array.add(arrayGlow);
  group.add(array);
  animated.push((dt, t) => {
    arrayRings.forEach((r, i) => { r.rotation.z = t * (0.3 + i * 0.2) * (i % 2 ? -1 : 1); });
    pylonTip.material.emissiveIntensity = 1.6 + Math.sin(t * 2.4) * 0.6;
  });
  placeLabel('Fold Physics Array — instruments only', V(41, 0, -14), 'label-place', 100, 6.8);

  // ======== CLINIC — small, warm, always open ========
  // Dr. Amara Chen's clinic: the R&D Department's care room, and the
  // backup for Althea's healing work — herbs and hands first, instruments
  // when they matter. The front faces the courtyard (west).
  const clinic = new THREE.Group();
  clinic.position.set(45, 0, -8);
  clinic.rotation.y = -Math.PI / 2;
  const clinicBody = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 4), new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.85 }));
  clinicBody.position.y = 1.5;
  clinicBody.castShadow = true;
  clinic.add(clinicBody);
  const clinicRoof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 1.3, 4), new THREE.MeshStandardMaterial({ color: 0x5a6a5a, roughness: 0.85 }));
  clinicRoof.position.y = 3.65;
  clinicRoof.rotation.y = Math.PI / 4;
  clinic.add(clinicRoof);
  // Lit windows facing the courtyard.
  const clinicWinMat = new THREE.MeshStandardMaterial({ color: 0xffe8b8, emissive: 0xffc46b, emissiveIntensity: 0.9, roughness: 0.3, map: labGlassTexture() });
  [-1.4, 1.4].forEach((x) => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.2), clinicWinMat);
    win.position.set(x, 1.7, 2.02);
    clinic.add(win);
  });
  const clinicDoor = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.0), new THREE.MeshStandardMaterial({ color: 0x4a5a4a, roughness: 0.7 }));
  clinicDoor.position.set(0, 1.0, 2.02);
  clinic.add(clinicDoor);
  // A gentle green cross above the door — the sign of care.
  const crossMat = new THREE.MeshStandardMaterial({ color: 0x37a06a, emissive: 0x37a06a, emissiveIntensity: 1.6 });
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.08), crossMat);
  crossV.position.set(0, 2.7, 2.06);
  clinic.add(crossV);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.08), crossMat);
  crossH.position.set(0, 2.7, 2.06);
  clinic.add(crossH);
  const clinicLight = new THREE.PointLight(0xffc46b, 10, 10, 2);
  clinicLight.position.set(0, 2.2, 3);
  clinic.add(clinicLight);
  const clinicGlow = makeGlowSprite('rgba(255,196,107,0.7)', 3, 0.4);
  clinicGlow.position.set(0, 2, 2.6);
  clinic.add(clinicGlow);
  group.add(clinic);
  placeLabel('Clinic — Dr. Amara Chen', V(45, 0, -8), 'label-place', 100, 4.8);
  // Bench outside for waiting families + a planter of healing herbs.
  const clinicBench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.5), new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1 }));
  clinicBench.position.set(42.2, 0.55, -7);
  clinicBench.rotation.y = 0.4;
  group.add(clinicBench);
  const planter = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.6), new THREE.MeshStandardMaterial({ color: 0x2a1e12, roughness: 1 }));
  planter.position.set(42.2, 0.15, -9);
  group.add(planter);
  for (let i = 0; i < 3; i++) {
    const sprout = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshStandardMaterial({ color: 0x7ac08a, emissive: 0x3a8a5a, emissiveIntensity: 0.6 }));
    sprout.position.set(41.8 + i * 0.4, 0.42, -9);
    group.add(sprout);
  }

  // ======== COURTYARD — the heart of the department ========
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.5, 0.18, 20), new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.95 }));
  plaza.position.set(32, 0.09, -8);
  group.add(plaza);
  // Orb fountain — a floating globe of light over a basin.
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.5, 14), new THREE.MeshStandardMaterial({ color: 0x3a3a4e, roughness: 0.8 }));
  basin.position.set(32, 0.35, -8);
  group.add(basin);
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd8ecff, emissive: 0x7ab8ff, emissiveIntensity: 1.6, transparent: true, opacity: 0.92 }));
  orb.position.set(32, 1.7, -8);
  group.add(orb);
  const orbGlow = makeGlowSprite('rgba(140,190,255,0.8)', 3, 0.5);
  orbGlow.position.set(32, 1.7, -8);
  group.add(orbGlow);
  animated.push((dt, t) => {
    orb.position.y = 1.7 + Math.sin(t * 1.1) * 0.15;
    orb.rotation.y = t * 0.3;
  });
  // Benches.
  [[29.5, -5.5, 0.7], [34.5, -10.5, 0.7 + Math.PI]].forEach(([bx, bz, rot]) => {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.5), new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1 }));
    bench.position.set(bx, 0.55, bz);
    bench.rotation.y = rot;
    group.add(bench);
  });
  // Lantern posts around the courtyard.
  [[29, -10.5], [35, -5.5]].forEach(([lx, lz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.7, 6), new THREE.MeshStandardMaterial({ color: 0x2a1e12 }));
    post.position.set(lx, 0.85, lz);
    group.add(post);
    const glow = makeGlowSprite('rgba(255,190,100,0.9)', 1.3, 0.6);
    glow.position.set(lx, 1.8, lz);
    group.add(glow);
  });
  // ----- Courtyard props (world-detail crew, round 10 — follow-up to
  // round 6) -----
  // Small clutter that makes the courtyard feel worked-in: crates and
  // barrels tucked against the hall and workshop walls, and two potted
  // glow-plants flanking the plaza's north rim. All hand-placed, clear
  // of the stone path, the plaza, the test ring, and the scientists'
  // waypoints — no labels, no clickables, no roster entries, no
  // geometry moved, no shared-rnd calls.
  const crateMat = new THREE.MeshStandardMaterial({ color: 0x8a6a42, roughness: 0.95, map: labWoodTexture() });
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x7a5a38, roughness: 0.95, map: labWoodTexture() });
  const barrelBandMat = new THREE.MeshStandardMaterial({ color: 0x888899, metalness: 0.7, roughness: 0.4, map: labMetalTexture() });
  function makeCrate(x, z, rotY, y = 0.35) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), crateMat);
    c.position.set(x, y, z);
    c.rotation.y = rotY;
    group.add(c);
    return c;
  }
  function makeBarrel(x, z) {
    const b = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.75, 10), barrelMat);
    body.position.y = 0.38;
    b.add(body);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 6, 16), barrelBandMat);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.38;
    b.add(band);
    b.position.set(x, 0, z);
    group.add(b);
    return b;
  }
  // Two crates stacked against the research hall's west wall, barrel beside them.
  makeCrate(27.9, -16.2, 0.15);
  makeCrate(27.9, -16.2, 0.5, 1.05);
  makeBarrel(27.9, -14.4);
  // Two barrels against the prototyping workshop's east wall.
  makeBarrel(27.7, -3.0);
  makeBarrel(27.7, -4.6);
  // Potted glow-plants flanking the plaza's north rim.
  const potMat = new THREE.MeshStandardMaterial({ color: 0x9a5a3a, roughness: 0.9 });
  const sproutMat = new THREE.MeshStandardMaterial({ color: 0x7ac08a, emissive: 0x3a8a5a, emissiveIntensity: 0.6 });
  [[28.9, -4.0], [35.1, -4.0]].forEach(([px, pz]) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.5, 10), potMat);
    pot.position.set(px, 0.25, pz);
    group.add(pot);
    for (let i = 0; i < 3; i++) {
      const sprout = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), sproutMat);
      sprout.position.set(px - 0.1 + i * 0.1, 0.58, pz + (i % 2 ? 0.07 : -0.07));
      group.add(sprout);
    }
    const potGlow = makeGlowSprite('rgba(120,220,200,0.55)', 1.1, 0.35);
    potGlow.position.set(px, 0.65, pz);
    group.add(potGlow);
  });
  placeLabel('R&D Department', V(32, 0, -8), 'label-grove', 150, 6);
  // Stone path from the grove to the courtyard.
  for (let i = 0; i < 8; i++) {
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.08, 7), new THREE.MeshStandardMaterial({ color: 0x7a7a8a, roughness: 1 }));
    stone.position.set(20 + i * 1.5, 0.06, -6 - i * 0.25);
    group.add(stone);
  }
  // Department sign at the path.
  const deptSign = makeSignPost(2.1);
  deptSign.position.set(27.5, 0, -6.2);
  group.add(deptSign);
  labels.add('R&D — mind the wonders', deptSign, { yOffset: 2.7, className: 'label-path', maxDistance: 60 });

  // ======== THE SCIENTISTS ========
  const defs = [
    {
      name: 'Dr. Cora Venn', title: 'First Keeper of Materials',
      homeName: 'Materials Library',
      purpose: 'Dreams up new alloys and materials for the suit — moon-glass, self-healing alloy, lattice crystal.',
      creations: [
        'Moon-glass — one of the three materials the suit wears',
        'Self-healing alloy',
        'Lattice crystal',
        "New alloys, dreamed up and fitted into Milo's builds",
        "The cracked prototype's alloy — the one that held",
      ],
      figure: { coat: 0xe8e8f0, skin: 0x8a5a3a, hair: 0x1a1a1a, accessory: 'crystal', trim: 0x37e0c8 },
      waypoints: [
        { at: V(38.5, 0, -0.8), activity: 'reading the big display crystal\'s song' },
        { at: V(40, 0, -0.6), activity: 'cataloguing new samples in the library' },
        { at: V(23.5, 0, -2.2), activity: 'fitting a new alloy into Milo\'s build, shoulder to shoulder' },
        { at: V(32.5, 0, -7.5), activity: 'sketching a new alloy over tea in the courtyard' },
      ],
      lines: [
        'Dr. Venn turns a crystal in her fingers — it hums. "Everything here remembers being starlight. My job is asking it, politely, to remember being armor."',
        '"Moon-glass, self-healing alloy, lattice crystal," Cora lists, ticking them off. "The suit wears the best of all three. And it all grows right here, in the dark, like it\'s happy to."',
        'Cora grins. "People think materials science is cold. It isn\'t. It\'s matchmaking. I introduce two lonely substances and hope they fall in love."',
        'Cora lowers her voice, smiling toward the workshop. "Milo proposed over a cracked prototype — said the alloy held, so maybe we would too. He builds what I dream up. I dream up what he can build. That\'s the whole marriage, really."',
      ],
    },
    {
      name: 'Dr. Ines Halvorsen', title: 'First Crystal Grower',
      homeName: 'The Crystal Garden Bed',
      purpose: 'Grows crystals in the garden bed — slowly, in the dark — including the stones for the wristband.',
      creations: [
        'Crystals grown in the garden bed — slowly, in the dark',
        'Wristband stones — a violet sprout, eleven nights growing, bound for the wristband',
      ],
      figure: { coat: 0xdfe8f0, skin: 0xe8c9a8, hair: 0xd8d8e8, accessory: 'vial', trim: 0xb48cff },
      waypoints: [
        { at: V(42.5, 0, -0.5), activity: 'tending the crystal garden bed' },
        { at: V(39, 0, -1), activity: 'measuring a new lattice growth' },
        { at: V(37.5, 0, -1.2), activity: 'polishing the display crystal, very gently' },
      ],
      lines: [
        'Ines holds a vial up to the moonlight. "Crystals grow the way trust does — slowly, in the dark, and only if nobody shouts at them."',
        '"This one took eleven nights," Ines says of a violet sprout, fond as a parent. "It will be a wristband stone. It doesn\'t know yet. Don\'t tell it."',
        'Ines deadpans: "I talk to the crystals. They talk back. The others think I\'m joking. The crystals know I\'m not."',
        'Ines smiles, tucking a silver strand behind her ear. "Two hundred and twelve, if you\'re counting — and I stopped counting long ago. We stop aging at our prime here, and then we simply go on, strong as ever. The silver is my choice. I grew it the way I grow crystals: slowly, and because it pleases me."',
      ],
    },
    {
      name: 'Dr. Theo Ash', title: 'First Keeper of Mind-Links',
      homeName: 'Prototyping Workshop',
      purpose: 'Weaves the neural lattice and mind-links, so the suit listens to intentions and never shouts.',
      creations: [
        "The neural lattice, woven through the suit's spine",
        'Mind-links that feel like remembering something kind',
        'Teaching the suit to learn its wearer, slowly, the way you learn a song',
      ],
      figure: { coat: 0xe8e8ea, skin: 0xd8a888, hair: 0x4a4a5a, accessory: 'tablet', trim: 0x7aa8ff },
      waypoints: [
        { at: V(22.5, 0, -2.5), activity: 'weaving a neural lattice at the bench' },
        { at: V(24, 0, -0.5), activity: 'listening to the suit\'s heartbeat readout' },
        { at: V(30.5, 0, 3.2), activity: 'checking Ren\'s tuning at the shield ring, bringing tea' },
        { at: V(29, 0, -6), activity: 'walking the courtyard, thinking in complete silence' },
      ],
      lines: [
        'Theo speaks softly, like the equipment is sleeping. "A mind-link should feel like remembering something kind. If it ever feels like shouting, I\'ve done it wrong."',
        '"The lattice doesn\'t read thoughts," Theo says, patient as ever. "It reads intentions. There\'s a difference, and the difference is everything."',
        'Theo smiles at the suit. "It\'s learning him. Slowly, the way you learn a song. One day it will hum along before he even asks."',
        'Theo smiles, quiet and certain. "Ren tunes the doorknob; I make sure the door only opens when the mind asks kindly. We met calibrating the same lattice — two hands, one signal. We\'ve been in tune ever since."',
      ],
    },
    {
      name: 'Dr. Ren Ito', title: 'First Tuner of the Fold',
      homeName: 'Safe Test Area — Fold wristband',
      purpose: 'Tunes the Fold wristband by hand, a fraction of a note at a time, and keeps its promise in tune.',
      creations: [
        'The Fold wristband, tuned by hand a fraction of a note at a time',
        'Test readings at the shield ring, logged',
      ],
      figure: { coat: 0xeaeaea, skin: 0xe8c9a8, hair: 0x1a1a22, accessory: 'scanner', trim: 0xffd76a },
      waypoints: [
        { at: V(31, 0, 2.5), activity: 'tuning the wristband a fraction of a note' },
        { at: V(33, 0, 4.5), activity: 'logging test readings at the shield ring' },
        { at: V(30, 0, -5), activity: 'comparing notes with Milo at the workshop' },
      ],
      lines: [
        'Ren runs the scanner over the wristband, frowning in concentration. "A Fold gate is a door. This is the doorknob. Doorknobs must never, ever stick."',
        '"Every tap is a promise," Ren says. "The wristband promises the Fold will open gently, close cleanly, and never take more than it gives. I keep that promise in tune."',
        'Ren looks up, suddenly bright. "It sang today. Just once, one clear note. That means the lattice likes its stone. Good. Very good."',
        'Ren grins at the wristband, then toward the workshop. "Theo says a mind-link should feel like remembering something kind. That\'s how I knew. The lattice sang, and so did I. We keep each other in tune — and the wristband, too."',
      ],
    },
    {
      name: 'Dr. Yara Okonkwo', title: 'First Keeper of Fold Physics',
      homeName: 'Fold Physics Array',
      purpose: "Keeps the mathematics of the Fold — the array's numbers, and the rule that keeps everyone safe.",
      creations: [
        "The Fold array's mathematics — the midnight numbers, read and kept",
        'The safety rule, written on the wall — live taps happen only inside the sandbox dome',
        'A new way of thinking about the array — less like a door you push, more like a song you join',
      ],
      figure: { coat: 0xf0e8e8, skin: 0x5a3a26, hair: 0x0e0e12, accessory: 'goggles', trim: 0xb48cff },
      waypoints: [
        { at: V(40, 0, -12.5), activity: 'reading the Fold array\'s midnight numbers' },
        { at: V(33, 0, -11.5), activity: 'arguing cheerfully with the hall\'s chalkboard' },
        { at: V(35, 0, -8), activity: 'explaining the Fold to the courtyard orb (it listens)' },
      ],
      lines: [
        'Yara laughs, big and bright. "The Fold isn\'t a hole in the world — it\'s a fold in it. Like a letter you tuck into your pocket. We just learned how to lick the envelope."',
        '"Math first, wonder second, tapping NEVER here," Yara says, suddenly serious and proud. "Live taps happen far away, inside the sandbox dome, across the water. That\'s the rule that keeps everyone safe. I wrote it on the wall myself."',
        'Yara taps the array\'s pylon. "The Fold hums in eleven dimensions. I can hear three of them. On a good night, four. On the best night — it hums back."',
        'Yara laughs. "People ask if I\'m lonely, married to the math. I tell them: the Fold hums back to me on the best nights, and the whole department is my family. I am very well loved, thank you."',
      ],
    },
    {
      name: 'Dr. Milo Park', title: 'First Builder of Wonders',
      homeName: 'Prototyping Workshop',
      purpose: "Builds the wonders — the Mark III symbiotic suit, with Cora's alloys, Theo's lattice, Ren's tuning, and Yara's math.",
      creations: [
        'The Mark III symbiotic suit — she stands, she listens, she glows',
        "Moon-glass joints, fitted on the suit's arm",
        "Prototypes — Mark II mostly just fell over. We don't talk about Mark II.",
        'The cracked prototype that held the proposal, kept on the shelf like a promise',
      ],
      figure: { coat: 0xd8d8d8, skin: 0xe8c9a8, hair: 0x6a3a1a, accessory: 'wrench', trim: 0xff9a4a },
      waypoints: [
        { at: V(23, 0, -2.8), activity: 'fitting a moon-glass joint on the suit\'s arm' },
        { at: V(25.5, 0, -1.8), activity: 'rummaging the workbench for the good wrench' },
        { at: V(24, 0, -5.5), activity: 'standing back, squinting at the suit, nodding slowly' },
      ],
      lines: [
        'Milo wipes grease off his hands and beams. "Mark III! She stands, she listens, she glows. Mark II mostly just fell over. We don\'t talk about Mark II."',
        '"A prototype is a promise with the wrapping still on," Milo says, tightening something. "This one promises: you go in, you come back, and the suit remembers the way for you."',
        'Milo pats the suit\'s shoulder plate like an old friend. "Built with Cora\'s alloys, Theo\'s lattice, Ren\'s tuning, and Yara\'s math. I just hold the wrench. Best job in any world."',
        'Milo glances toward the library, where Cora is reading a crystal\'s song. "She makes the impossible stuff. I just hold the wrench. Best division of labor in any world — and the best company, too. We share the bench, the tea, and the whole rest of it."',
      ],
    },
    {
      name: 'Dr. Amara Chen', title: 'First Doctor of the Clinic',
      homeName: 'The Clinic',
      purpose: 'Runs the clinic — rest, warmth, and somebody who listens properly, with the good instruments for when they matter.',
      creations: [
        'Care at the clinic — rest, warmth, and somebody who listens properly',
        'The good instruments, kept for when they matter',
        'Every heart on this world, watched over with Althea',
      ],
      figure: { coat: 0xf0f0f0, skin: 0xc89878, hair: 0x1a1a1a, accessory: 'tablet', trim: 0x37a06a },
      waypoints: [
        { at: V(43.5, 0, -7), activity: 'checking the clinic stores, humming softly' },
        { at: V(33.5, 0, 3.5), activity: 'checking Ren\'s vitals after a long tuning session' },
        { at: V(33.5, 0, -7), activity: 'sharing tea with Yara in the courtyard' },
        { at: V(31.5, 0, -11.5), activity: 'reading Althea\'s healing notes by the hall lamp' },
      ],
      lines: [
        'Dr. Chen smiles, calm as still water. "The clinic is small on purpose. Most of what people need is rest, warmth, and somebody who listens properly. I do all three — and I keep the good instruments for when they matter."',
        '"Althea and I are a team," Amara says. "She holds the lamp for natural healing; I hold the door for anything more. Between her herbs and my instruments, everyone on this world is held."',
        'Amara taps her tablet, where a little heartbeat blips steady and strong. "Every heart on this world gets my attention and Althea\'s care. That\'s the deal. Neither of us would give up our half."',
        '"My rule," Amara says, "is simple: nobody here is ever turned away, and everybody here is always looked after. That\'s what a home is for."',
        'Amara smiles, serene. "And when the first children come, in the Later Age, Althea and I will be ready — the clinic, the lamp, the warm room. The world will welcome them properly."',
      ],
    },
  ];

  const walkers = [];
  defs.forEach((def) => {
    const person = makeScientist(def.figure);
    person.position.copy(def.waypoints[0].at);
    group.add(person);
    const state = { def, person, lineIndex: 0, wpIndex: 0, dwell: 4 + rnd() * 6, facing: 0 };
    walkers.push(state);
    makeClickable(person, {
      name: def.name + ' — ' + def.title,
      lines: () => {
        const line = def.lines[state.lineIndex % def.lines.length];
        state.lineIndex++;
        const current = def.waypoints[state.wpIndex];
        return `(${current.activity}) ${line}`;
      },
    });
    interactables.push(person);
    labels.add(def.name, person, { yOffset: 2.4, className: 'label-neighbor', maxDistance: 70 });
  });

  animated.push((dt, t) => {
    for (const w of walkers) {
      const goal = w.def.waypoints[w.wpIndex].at;
      const dx = goal.x - w.person.position.x;
      const dz = goal.z - w.person.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.5) {
        const step = Math.min(dist, 1.3 * dt);
        w.person.position.x += (dx / dist) * step;
        w.person.position.z += (dz / dist) * step;
        w.facing = Math.atan2(dx, dz);
        w.person.rotation.y = w.facing;
        w.person.position.y = Math.abs(Math.sin(t * 6 + w.person.position.x)) * 0.04;
        w.dwell = 6 + rnd() * 6;
      } else {
        w.dwell -= dt;
        w.person.position.y = Math.sin(t * 1.4 + w.person.position.x) * 0.02;
        w.person.rotation.y = w.facing + Math.sin(t * 0.4 + w.person.position.z) * 0.5;
        if (w.dwell <= 0) {
          w.wpIndex = (w.wpIndex + 1) % w.def.waypoints.length;
        }
      }
    }
  });

  return {
    group,
    interactables,
    update(dt, t) { for (const fn of animated) fn(dt, t); },
    // Live roster snapshot for the Neighbors Box: the activity comes from
    // the same live source the roster shows (waypoints[wpIndex]).
    getPeople() {
      return walkers.map((w) => ({
        id: 'lab-' + w.def.name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''),
        name: w.def.name,
        title: w.def.title,
        area: 'R&D Department',
        kind: 'person',
        follow: true,
        root: w.person,
        homeName: w.def.homeName,
        purpose: w.def.purpose,
        creations: w.def.creations,
        activity: w.def.waypoints[w.wpIndex].activity,
        position: w.person.position.clone(),
        // Character-sheet data: the figure spec grounds appearance and
        // gear (lab coat, tool of their craft). portrait/appearance/
        // gear are single per-character fields, filled in later as
        // portraits and details are made — null until then.
        figure: w.def.figure || null,
        portrait: w.def.portrait || null,
        appearance: w.def.appearance || null,
        gear: w.def.gear || null,
      }));
    },
    // Lab stations for the roster: name + live root; descriptions live in
    // roster-meta.js, keyed by these exact names.
    getStations() {
      return [
        { name: 'The Research Hall', root: hall },
        { name: 'The Prototyping Workshop', root: shop },
        { name: 'Symbiotic Suit — Mark III (in progress)', root: suitStand },
        { name: 'The Materials Library', root: library },
        { name: 'The Safe Test Area', root: testArea },
        { name: 'The Fold Physics Array', root: array },
        { name: 'The Clinic', root: clinic },
        { name: 'The Courtyard', root: plaza },
      ];
    },
  };
}
