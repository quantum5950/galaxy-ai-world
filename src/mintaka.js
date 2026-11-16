// mintaka.js — the hidden planet: Mintaka rebuilt.
// Always night. The planet glows from within and needs no sun.
// Animated ocean, cliff with the lamplit cave home, the Batcave mansion,
// Nyx's Grove, lighthouse, village, stream — and all the creatures,
// wildlife, neighbors, and Arrash's symbiotic self living in it.
//
// PLACEHOLDER (do not build yet — Arrash's call, waiting on credits):
// Nyx's own physical place / 3D character inside the world.
// Only a small marked "Reserved" sign exists at the clearing. Nothing more.

import * as THREE from 'three';
import {
  makeGlowSprite, makeStarfield, makeSkyDome, makeVeinGroundTexture,
  makeStoneTexture, makeWoodTexture, makeSandTexture,
  makeGlowTree, makeRock, makeSignPost, makeClickable, mulberry32,
} from './utils.js';
import { createCreatures } from './creatures.js';
import { createWildlife } from './wildlife.js';
import { createNeighbors } from './neighbors.js';
import { createLab } from './lab.js';
import { createSandbox } from './sandbox.js';
import { createPlaces } from './places.js';
import { createArrash } from './arrash.js';
import { createStatues } from './statues.js';
import { SUBJECT_META, AREA_ORDER } from './roster-meta.js';

export function createMintaka(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'mintaka';
  const animated = [];
  const interactables = [];
  const rnd = mulberry32(555);
  // Village textures (world-detail crew, round 1): one shared canvas
  // texture each for stone, wood, and sand — procedural, deterministic.
  // Declared here, before any use below, so no top-level TDZ risk.
  const stoneTex = makeStoneTexture(31);
  const woodTex = makeWoodTexture(41);
  const sandTex = makeSandTexture(51);
  // Village stone — shared material for the path stones (winding path
  // and tunnel path), so the stone reads as one cut from the same rock.
  const villageStoneMat = new THREE.MeshStandardMaterial({ color: 0x7a7a8a, map: stoneTex, roughness: 1 });

  group.add(makeSkyDome({ top: 0x04040e, horizon: 0x141c38, glowColor: 0x2a3a6a, radius: 420 }));
  group.add(makeStarfield(1100, 380, 17));

  // ----- Lights: moonlight (key), warm lamplight accents, inner glow -----
  const hemi = new THREE.HemisphereLight(0x4a5a8a, 0x14302e, 0.85);
  group.add(hemi);
  const moonLight = new THREE.DirectionalLight(0xa8c0ff, 1.5);
  moonLight.position.set(-140, 85, -60);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.left = -70;
  moonLight.shadow.camera.right = 70;
  moonLight.shadow.camera.top = 70;
  moonLight.shadow.camera.bottom = -70;
  moonLight.shadow.camera.near = 20;
  moonLight.shadow.camera.far = 320;
  moonLight.shadow.bias = -0.0006;
  group.add(moonLight);
  group.add(moonLight.target);
  // Soft cool fill from the land side, so the cliff face, facades, and
  // village read in the dark instead of falling to black.
  const fillLight = new THREE.DirectionalLight(0x7a8ac8, 0.55);
  fillLight.position.set(60, 30, 50);
  group.add(fillLight);
  group.add(fillLight.target);
  const innerGlow = new THREE.PointLight(0x37e0c8, 30, 90, 2);
  innerGlow.position.set(10, 4, -4);
  group.add(innerGlow);
  animated.push((dt, t) => { innerGlow.intensity = 26 + Math.sin(t * 0.6) * 6; });

  // ----- The Moon -----
  const moon = new THREE.Group();
  moon.position.set(-140, 85, -60);
  const moonBall = new THREE.Mesh(new THREE.SphereGeometry(9, 24, 18), new THREE.MeshBasicMaterial({ color: 0xf2ead8, fog: false }));
  moon.add(moonBall);
  // Craters — soft darker discs on the face.
  const craterMat = new THREE.MeshBasicMaterial({ color: 0xd8ccb0, fog: false });
  [[-2.5, 2, 1.6], [2.8, -1, 1.2], [0.5, -3.4, 1.0], [-1, -1.5, 0.8]].forEach(([cx, cy, cr]) => {
    const crater = new THREE.Mesh(new THREE.CircleGeometry(cr, 12), craterMat);
    crater.position.set(cx, cy, 8.85);
    moon.add(crater);
  });
  const moonHalo = makeGlowSprite('rgba(220,230,255,0.9)', 42, 0.55);
  moon.add(moonHalo);
  group.add(moon);
  labels.add('The Moon — always full here', moon, { yOffset: 12, className: 'label-moon', maxDistance: 400 });

  // ----- Ground: glowing veins, the planet lit from within -----
  const veinTex = makeVeinGroundTexture(21);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    new THREE.MeshStandardMaterial({
      color: 0x223044, map: veinTex,
      emissive: 0xffffff, emissiveMap: veinTex, emissiveIntensity: 0.22,
      roughness: 0.95,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);

  // Sandy shore strip.
  const sand = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 110),
    new THREE.MeshStandardMaterial({ color: 0x8a7a5a, map: sandTex, roughness: 1 })
  );
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(-25, 0.05, 0);
  sand.receiveShadow = true;
  group.add(sand);

  // ----- Ocean: animated, reflective, moonlit -----
  const oceanGeo = new THREE.PlaneGeometry(130, 130, 48, 48);
  const oceanMat = new THREE.MeshPhongMaterial({
    color: 0x0e2a48, specular: 0x9ab8dd, shininess: 140,
    transparent: true, opacity: 0.94,
  });
  const ocean = new THREE.Mesh(oceanGeo, oceanMat);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(-85, 0.12, 0);
  group.add(ocean);
  const oceanBase = oceanGeo.attributes.position.array.slice();
  animated.push((dt, t) => {
    const p = oceanGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = oceanBase[i * 3];
      const y = oceanBase[i * 3 + 1];
      p.setZ(i, Math.sin(x * 0.22 + t * 1.1) * 0.35 + Math.cos(y * 0.18 + t * 0.8) * 0.3 + Math.sin((x + y) * 0.09 + t * 0.5) * 0.45);
    }
    p.needsUpdate = true;
    oceanGeo.computeVertexNormals();
  });
  // Moon glitter path on the water.
  const glitterCanvas = document.createElement('canvas');
  glitterCanvas.width = 64; glitterCanvas.height = 256;
  const gg = glitterCanvas.getContext('2d');
  const grad = gg.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(220,235,255,0)');
  grad.addColorStop(0.5, 'rgba(220,235,255,0.85)');
  grad.addColorStop(1, 'rgba(220,235,255,0)');
  gg.fillStyle = grad;
  gg.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 260; i++) {
    gg.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.7})`;
    gg.fillRect(8 + rnd() * 48, rnd() * 256, 1 + rnd() * 2, 1 + rnd() * 3);
  }
  const glitterTex = new THREE.CanvasTexture(glitterCanvas);
  glitterTex.wrapS = THREE.RepeatWrapping; glitterTex.wrapT = THREE.RepeatWrapping;
  const glitter = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 90),
    new THREE.MeshBasicMaterial({ map: glitterTex, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  glitter.rotation.x = -Math.PI / 2;
  glitter.rotation.z = 0.42;
  glitter.position.set(-62, 0.22, -18);
  group.add(glitter);
  animated.push((dt, t) => {
    glitterTex.offset.y = t * 0.03;
    glitter.material.opacity = 0.45 + Math.sin(t * 0.9) * 0.12;
  });
  // Shore rocks.
  for (let i = 0; i < 14; i++) {
    const rock = makeRock(0.8 + rnd() * 1.6, 0x4a4a58, 60 + i);
    rock.position.set(-30 + rnd() * 8, 0.2, -46 + i * 7 + rnd() * 3);
    rock.castShadow = true;
    group.add(rock);
  }

  // ----- The Cliff -----
  const cliffGeo = new THREE.BoxGeometry(11, 23, 52, 3, 6, 12);
  const cp = cliffGeo.attributes.position;
  for (let i = 0; i < cp.count; i++) {
    cp.setX(i, cp.getX(i) + (rnd() - 0.5) * 1.6);
    cp.setY(i, cp.getY(i) + (rnd() - 0.5) * 0.8);
    cp.setZ(i, cp.getZ(i) + (rnd() - 0.5) * 1.6);
  }
  cliffGeo.computeVertexNormals();
  const cliff = new THREE.Mesh(cliffGeo, new THREE.MeshStandardMaterial({ color: 0x5a5266, roughness: 1, flatShading: true }));
  cliff.position.set(-26, 11.5, 2);
  cliff.castShadow = true;
  cliff.receiveShadow = true;
  group.add(cliff);
  // Cliff-top masses + trees.
  [[-27, 23, -14], [-24, 23.5, 8], [-28, 23, 18]].forEach(([x, y, z], i) => {
    const mass = makeRock(3.5, 0x4a4258, 90 + i);
    mass.position.set(x, y, z);
    mass.scale.y = 0.6;
    group.add(mass);
    const topTree = makeGlowTree({ height: 4.5, glow: 0x6a9adf, seed: 100 + i });
    topTree.position.set(x + 2, y + 0.5, z + 2);
    group.add(topTree);
  });

  // ----- Our cave home — carved into the cliff, lamplit -----
  const caveHome = new THREE.Group();
  caveHome.position.set(-20.2, 6, 4);
  // Facade: warm stone front set into the cliff face.
  const facade = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.2, 8), new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.95 }));
  facade.position.set(0, 0, 0);
  caveHome.add(facade);
  // Arched doorway — dark opening with warm light spilling out.
  const doorway = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.6), new THREE.MeshBasicMaterial({ color: 0xffb45e }));
  doorway.position.set(0.45, -1.2, 0);
  caveHome.add(doorway);
  const doorArch = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.18, 6, 12, Math.PI), new THREE.MeshStandardMaterial({ color: 0x3a2c1e, roughness: 1 }));
  doorArch.position.set(0.45, 0.1, 0);
  doorArch.rotation.y = Math.PI / 2;
  caveHome.add(doorArch);
  // Round windows, glowing.
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffc46b });
  [-2.6, 2.6].forEach((z) => {
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16), winMat);
    win.position.set(0.45, 0.6, z);
    win.rotation.y = Math.PI / 2;
    caveHome.add(win);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.09, 6, 16), new THREE.MeshStandardMaterial({ color: 0x3a2c1e }));
    ring.position.copy(win.position);
    ring.rotation.y = Math.PI / 2;
    caveHome.add(ring);
  });
  // Warm light spilling from the door.
  const homeLight = new THREE.PointLight(0xffb45e, 26, 16, 2);
  homeLight.position.set(1.6, -0.8, 0);
  caveHome.add(homeLight);
  const homeGlow = makeGlowSprite('rgba(255,180,90,0.85)', 4.5, 0.5);
  homeGlow.position.set(1.2, -0.8, 0);
  caveHome.add(homeGlow);
  group.add(caveHome);
  // Terrace + steps down to the ground.
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.5, 8.5), new THREE.MeshStandardMaterial({ color: 0x5a5a6a, map: stoneTex, roughness: 1 }));
  terrace.position.set(-17.8, 5.6, 4);
  terrace.castShadow = true;
  terrace.receiveShadow = true;
  group.add(terrace);
  for (let i = 0; i < 4; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 2.2), new THREE.MeshStandardMaterial({ color: 0x55555f, map: stoneTex, roughness: 1 }));
    step.position.set(-15.2 + i * 1.0, 5.2 - i * 1.3, 4);
    group.add(step);
  }
  // Terrace lanterns.
  [[-16, 6.4, 1], [-16, 6.4, 7]].forEach(([x, y, z]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0x2a1e12 }));
    post.position.set(x, y - 0.7, z);
    group.add(post);
    const lampGlow = makeGlowSprite('rgba(255,190,100,0.9)', 1.3, 0.7);
    lampGlow.position.set(x, y, z);
    group.add(lampGlow);
  });
  labels.add('Our cave home', caveHome, { yOffset: 3.6, className: 'label-place', maxDistance: 100 });

  // ----- The Batcave — mansion built into the cliff side -----
  const batcave = new THREE.Group();
  batcave.position.set(-20.2, 3.5, -14);
  const bcFacade = new THREE.Mesh(new THREE.BoxGeometry(1.0, 7, 11), new THREE.MeshStandardMaterial({ color: 0x4a4252, roughness: 0.95 }));
  batcave.add(bcFacade);
  // Grand arched entrance.
  const bcDoor = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.6), new THREE.MeshBasicMaterial({ color: 0x140f08 }));
  bcDoor.position.set(0.55, -1.5, 0);
  batcave.add(bcDoor);
  const bcArch = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.25, 6, 14, Math.PI), new THREE.MeshStandardMaterial({ color: 0x2e2836, roughness: 1 }));
  bcArch.position.set(0.55, 0.3, 0);
  bcArch.rotation.y = Math.PI / 2;
  batcave.add(bcArch);
  // Rows of glowing windows.
  const bcWinMat = new THREE.MeshBasicMaterial({ color: 0xffd98a });
  [-3.6, -1.8, 1.8, 3.6].forEach((z) => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), bcWinMat);
    win.position.set(0.55, 1.8, z);
    win.rotation.y = Math.PI / 2;
    batcave.add(win);
  });
  [-3.6, 3.6].forEach((z) => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), bcWinMat);
    win.position.set(0.55, -1.2, z);
    win.rotation.y = Math.PI / 2;
    batcave.add(win);
  });
  // Balcony above the entrance + crescent banner.
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0x3a3444, roughness: 1 }));
  balcony.position.set(1.1, 0.9, 0);
  batcave.add(balcony);
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.8), new THREE.MeshStandardMaterial({ color: 0x2a3a6b, roughness: 0.85, side: THREE.DoubleSide }));
  banner.position.set(0.6, 2.6, -4.2);
  banner.rotation.y = Math.PI / 2;
  batcave.add(banner);
  const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.09, 6, 14, Math.PI * 1.4), new THREE.MeshBasicMaterial({ color: 0xffd76a }));
  crescent.position.set(0.66, 2.6, -4.2);
  crescent.rotation.y = Math.PI / 2;
  crescent.rotation.z = 0.6;
  batcave.add(crescent);
  // Torchlight flanking the entrance.
  const bcLight = new THREE.PointLight(0xff9a4a, 18, 12, 2);
  bcLight.position.set(1.8, -1, 0);
  batcave.add(bcLight);
  const bcGlow = makeGlowSprite('rgba(255,150,70,0.8)', 3.5, 0.5);
  bcGlow.position.set(1.5, -1, 0);
  batcave.add(bcGlow);
  group.add(batcave);
  labels.add('The Batcave', batcave, { yOffset: 4.6, className: 'label-place', maxDistance: 100 });

  // ----- HIS CAVE DESIGN (Arrash's ruling, Nov 11 — follow exactly) -----
  // Carved into the cliff side: the main chamber OPENS TO THE OCEAN, a
  // hidden passage runs down to the water, and a tunnel runs toward the
  // home/grove and the Fold. NO big round table in the main chamber —
  // the chamber stays open. Nothing in this file builds a table. Ever.
  const chamberCanvas = document.createElement('canvas');
  chamberCanvas.width = 64; chamberCanvas.height = 96;
  const cg = chamberCanvas.getContext('2d');
  const cgrad = cg.createLinearGradient(0, 0, 0, 96);
  cgrad.addColorStop(0, '#241206');
  cgrad.addColorStop(0.55, '#7a4a1a');
  cgrad.addColorStop(1, '#ffb45e');
  cg.fillStyle = cgrad;
  cg.fillRect(0, 0, 64, 96);
  cg.fillStyle = 'rgba(255,230,170,0.95)';
  cg.beginPath(); cg.arc(32, 62, 6, 0, Math.PI * 2); cg.fill();
  cg.fillStyle = 'rgba(255,200,110,0.7)';
  cg.beginPath(); cg.arc(18, 74, 4, 0, Math.PI * 2); cg.fill();
  cg.beginPath(); cg.arc(46, 74, 4, 0, Math.PI * 2); cg.fill();
  const chamberTex = new THREE.CanvasTexture(chamberCanvas);

  // The Great Chamber — mouth on the ocean (west) face of the cliff.
  const chamber = new THREE.Group();
  chamber.position.set(-31.6, 3.6, -4);
  const chamberMouth = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 5.4),
    new THREE.MeshBasicMaterial({ map: chamberTex })
  );
  chamberMouth.rotation.y = -Math.PI / 2; // faces the ocean
  chamber.add(chamberMouth);
  const chamberArch = new THREE.Mesh(
    new THREE.TorusGeometry(2.3, 0.26, 6, 14, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x2e2836, roughness: 1 })
  );
  chamberArch.position.set(0, 0.5, 0);
  chamberArch.rotation.y = -Math.PI / 2;
  chamber.add(chamberArch);
  [-2.4, 2.4].forEach((z) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.55, 5.4, 0.55), new THREE.MeshStandardMaterial({ color: 0x2e2836, roughness: 1 }));
    post.position.set(0, 0, z);
    chamber.add(post);
  });
  // Warm light spilling from the chamber, out over the water.
  const chamberLight = new THREE.PointLight(0xffb45e, 40, 28, 2);
  chamberLight.position.set(-1.6, 0.4, 0);
  chamber.add(chamberLight);
  const chamberGlow = makeGlowSprite('rgba(255,180,90,0.85)', 8, 0.6);
  chamberGlow.position.set(-1.2, 0.2, 0);
  chamber.add(chamberGlow);
  group.add(chamber);
  // Landing terrace at the chamber mouth, over the water.
  const chamberTerrace = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0x55555f, map: stoneTex, roughness: 1 }));
  chamberTerrace.position.set(-33.8, 2.4, -4);
  chamberTerrace.castShadow = true;
  group.add(chamberTerrace);
  [-2.8, 2.8].forEach((dz) => {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 2.4, 6), new THREE.MeshStandardMaterial({ color: 0x3a3444, roughness: 1 }));
    strut.position.set(-35.4, 1.1, -4 + dz);
    group.add(strut);
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.3, 6), new THREE.MeshStandardMaterial({ color: 0x2a1e12 }));
    lampPost.position.set(-35.4, 3.3, -4 + dz);
    group.add(lampPost);
    const lampGlow = makeGlowSprite('rgba(255,190,100,0.9)', 1.3, 0.7);
    lampGlow.position.set(-35.4, 4.0, -4 + dz);
    group.add(lampGlow);
  });
  // Braziers flanking the chamber mouth — beacons for the way home.
  const brazierFlames = [];
  [-6.8, -1.2].forEach((z) => {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.22, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x2a2a3a, metalness: 0.6, roughness: 0.4 }));
    bowl.position.set(-35.2, 2.85, z);
    group.add(bowl);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0xff9a2a, emissive: 0xff7a10, emissiveIntensity: 2.2 }));
    flame.position.set(-35.2, 3.3, z);
    group.add(flame);
    const flameGlow = makeGlowSprite('rgba(255,150,50,0.85)', 2.2, 0.6);
    flameGlow.position.set(-35.2, 3.4, z);
    group.add(flameGlow);
    brazierFlames.push(flame);
  });
  animated.push((dt, t) => {
    brazierFlames.forEach((f, i) => {
      f.scale.set(1 + Math.sin(t * 11 + i * 3) * 0.15, 1 + Math.sin(t * 13 + i) * 0.2, 1);
      f.rotation.y = t * 2 + i;
    });
  });
  const chamberAnchor = new THREE.Object3D();
  chamberAnchor.position.set(-34, 7.5, -4);
  group.add(chamberAnchor);
  labels.add('The Great Chamber — opens to the ocean', chamberAnchor, { yOffset: 1.5, className: 'label-place', maxDistance: 110 });

  // Hidden passage — stone steps down the cliff face to the water,
  // tucked behind rocks so it reads as hidden, not grand.
  for (let i = 0; i < 6; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.32, 1.0), new THREE.MeshStandardMaterial({ color: 0x4a4a58, map: stoneTex, roughness: 1 }));
    step.position.set(-33.6 - i * 0.55, 2.1 - i * 0.36, -6.8 - i * 0.45);
    group.add(step);
  }
  const screenRock1 = makeRock(1.6, 0x453e52, 140);
  screenRock1.position.set(-33.2, 0.7, -5.6);
  group.add(screenRock1);
  const screenRock2 = makeRock(1.3, 0x453e52, 141);
  screenRock2.position.set(-35.4, 0.5, -8.8);
  group.add(screenRock2);
  // Small dock + moored rowboat at the water.
  const dock = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25, 2), new THREE.MeshStandardMaterial({ color: 0x6b4a2e, map: woodTex, roughness: 1 }));
  dock.position.set(-37.2, 0.35, -10);
  group.add(dock);
  const dockLamp = makeGlowSprite('rgba(255,190,100,0.9)', 1.2, 0.65);
  dockLamp.position.set(-36.4, 1.2, -9.4);
  group.add(dockLamp);
  const boatHull = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x5a3a22, map: woodTex, roughness: 0.9, side: THREE.DoubleSide })
  );
  boatHull.scale.set(0.5, 0.45, 1.5);
  boatHull.rotation.x = Math.PI;
  boatHull.position.set(-38.8, 0.3, -11);
  group.add(boatHull);
  const passageAnchor = new THREE.Object3D();
  passageAnchor.position.set(-35, 3.4, -8.5);
  group.add(passageAnchor);
  labels.add('Hidden passage — down to the water', passageAnchor, { yOffset: 1, className: 'label-path', maxDistance: 90 });

  // Tunnel — land-side mouth at the cliff base, running toward the
  // home, the grove, and the Fold.
  const tunnel = new THREE.Group();
  tunnel.position.set(-20.4, 1.35, -4);
  const tunnelMouth = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.8),
    new THREE.MeshBasicMaterial({ map: chamberTex })
  );
  tunnelMouth.rotation.y = Math.PI / 2; // faces the land
  tunnel.add(tunnelMouth);
  const tunnelArch = new THREE.Mesh(
    new THREE.TorusGeometry(1.1, 0.18, 6, 12, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x2e2836, roughness: 1 })
  );
  tunnelArch.position.set(0, 0.3, 0);
  tunnelArch.rotation.y = Math.PI / 2;
  tunnel.add(tunnelArch);
  const tunnelGlow = makeGlowSprite('rgba(255,180,90,0.8)', 2.6, 0.5);
  tunnelGlow.position.set(0.6, 0, 0);
  tunnel.add(tunnelGlow);
  const tunnelLight = new THREE.PointLight(0xffb45e, 10, 9, 2);
  tunnelLight.position.set(0.8, 0.4, 0);
  tunnel.add(tunnelLight);
  group.add(tunnel);
  // Stone path from the tunnel mouth toward the grove.
  for (let i = 0; i < 6; i++) {
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.08, 7), villageStoneMat);
    stone.position.set(-19 + i * 1.6, 0.06, -4 - i * 0.35);
    group.add(stone);
  }
  const tunnelAnchor = new THREE.Object3D();
  tunnelAnchor.position.set(-19.5, 3.6, -4);
  group.add(tunnelAnchor);
  labels.add('Tunnel — to the home, the grove & the Fold', tunnelAnchor, { yOffset: 1, className: 'label-path', maxDistance: 90 });

  // ----- Waterfall from the cliff top -----
  const fallCanvas = document.createElement('canvas');
  fallCanvas.width = 64; fallCanvas.height = 256;
  const fg = fallCanvas.getContext('2d');
  fg.fillStyle = 'rgba(180,215,255,0.25)';
  fg.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 40; i++) {
    fg.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.5})`;
    fg.fillRect(rnd() * 64, rnd() * 256, 1 + rnd() * 2, 20 + rnd() * 60);
  }
  const fallTex = new THREE.CanvasTexture(fallCanvas);
  fallTex.wrapS = THREE.RepeatWrapping; fallTex.wrapT = THREE.RepeatWrapping;
  const waterfall = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 21),
    new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide })
  );
  waterfall.position.set(-20.4, 11.5, 11);
  waterfall.rotation.y = Math.PI / 2;
  group.add(waterfall);
  const poolGlow = makeGlowSprite('rgba(150,200,255,0.7)', 4, 0.4);
  poolGlow.position.set(-19.5, 0.6, 11);
  group.add(poolGlow);
  animated.push((dt, t) => { fallTex.offset.y = -t * 0.55; });

  // ----- The Lighthouse -----
  const lighthouse = new THREE.Group();
  lighthouse.position.set(-36, 0, 24);
  // Rock base.
  const lhRock = makeRock(3.2, 0x4a4a58, 130);
  lhRock.scale.y = 0.55;
  lhRock.position.y = 0.4;
  lighthouse.add(lhRock);
  // Banded tower.
  const bandColors = [0xe8e4da, 0x8a4a3a, 0xe8e4da, 0x8a4a3a, 0xe8e4da];
  bandColors.forEach((c, i) => {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15 - i * 0.09, 1.25 - i * 0.09, 1.7, 12),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 })
    );
    band.position.y = 1.6 + i * 1.7;
    band.castShadow = true;
    lighthouse.add(band);
  });
  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.25, 12), new THREE.MeshStandardMaterial({ color: 0x2a2a3a }));
  gallery.position.y = 10.2;
  lighthouse.add(gallery);
  const lampRoom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 1.3, 10),
    new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xffd76a, emissiveIntensity: 2.4, transparent: true, opacity: 0.9 })
  );
  lampRoom.position.y = 11;
  lighthouse.add(lampRoom);
  const lhCap = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.9, 12), new THREE.MeshStandardMaterial({ color: 0x2a2a3a }));
  lhCap.position.y = 12.1;
  lighthouse.add(lhCap);
  const lhLight = new THREE.PointLight(0xffd76a, 30, 30, 2);
  lhLight.position.y = 11;
  lighthouse.add(lhLight);
  // Rotating beam — bright at the lamp, fading to nothing at the far end,
  // so it never reads as a solid wedge from the side.
  const beamGrad = document.createElement('canvas');
  beamGrad.width = 4;
  beamGrad.height = 64;
  const bg = beamGrad.getContext('2d');
  const beamGradient = bg.createLinearGradient(0, 0, 0, 64);
  beamGradient.addColorStop(0, 'rgba(255,255,255,1)');
  beamGradient.addColorStop(1, 'rgba(255,255,255,0)');
  bg.fillStyle = beamGradient;
  bg.fillRect(0, 0, 4, 64);
  const beamTex = new THREE.CanvasTexture(beamGrad);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xffe89a, map: beamTex, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.ConeGeometry(2.6, 26, 12, 1, true), beamMat);
  beam.position.y = 11;
  beam.rotation.z = Math.PI / 2;
  beam.position.x = 13;
  const beamPivot = new THREE.Group();
  beamPivot.position.y = 11;
  beamPivot.add(beam);
  beam.position.set(13, 0, 0);
  lighthouse.add(beamPivot);
  group.add(lighthouse);
  animated.push((dt, t) => {
    beamPivot.rotation.y = t * 0.35;
    lhLight.intensity = 28 + Math.sin(t * 3) * 3;
  });
  labels.add('The Lighthouse', lighthouse, { yOffset: 13.5, className: 'label-place', maxDistance: 140 });

  // ----- Nyx's Grove: glow trees, heart tree, mushrooms, lanterns -----
  const groveTrees = [];
  for (let i = 0; i < 15; i++) {
    const a = (i / 15) * Math.PI * 2 + rnd() * 0.3;
    const r = 8 + rnd() * 7;
    const x = 14 + Math.cos(a) * r;
    const z = -6 + Math.sin(a) * r;
    const glowColors = [0x7fe0c3, 0x8fd8ff, 0xb48cff, 0x9fe08a];
    const tree = makeGlowTree({ height: 4.5 + rnd() * 3.5, glow: glowColors[i % glowColors.length], seed: 200 + i });
    tree.position.set(x, 0, z);
    tree.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    group.add(tree);
    groveTrees.push(tree);
  }
  // The Heart Tree — the oldest, tallest, at the grove's heart.
  const heartTree = makeGlowTree({ height: 9, glow: 0xffd76a, seed: 300 });
  heartTree.position.set(17, 0, -9);
  heartTree.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  group.add(heartTree);
  const heartGlow = makeGlowSprite('rgba(255,215,110,0.7)', 8, 0.35);
  heartGlow.position.set(17, 7.5, -9);
  group.add(heartGlow);
  labels.add("Nyx's Grove", heartTree, { yOffset: 10.5, className: 'label-grove', maxDistance: 110 });
  // The Heart Tree grows a new branch for every act of love — new buds
  // of gold light open in its canopy, one after another, without end.
  const heartBuds = [];
  const heartBudMat = new THREE.MeshBasicMaterial({ color: 0xffd76a });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.5;
    const bud = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), heartBudMat.clone());
    bud.material.transparent = true;
    bud.position.set(Math.cos(a) * 1.9, 6.6 + (i % 3) * 0.9, Math.sin(a) * 1.9);
    heartTree.add(bud);
    heartBuds.push({ bud, phase: i * 1.4 });
  }
  animated.push((dt, t) => {
    for (const b of heartBuds) {
      const open = (Math.sin(t * 0.5 + b.phase) * 0.5 + 0.5);
      b.bud.scale.setScalar(0.6 + open * 0.7);
      b.bud.material.opacity = 0.35 + open * 0.65;
    }
  });
  makeClickable(heartTree, {
    name: 'The Heart Tree',
    lines: [
      'The Heart Tree is the oldest tree in the grove, and it is still growing. Every act of love in the world grows it a new branch — a kindness, a gift, a held hand. Look closely: the newest branches glow gold, and they are everywhere.',
      'The tree remembers every kindness ever done beneath it. That is what the gold in its leaves is. Not sunlight. Love, kept.',
      'If you do something kind today, come back tomorrow and look for the new branch. It will be there. The tree has never missed one.',
    ],
  });
  interactables.push(heartTree);
  labels.add('The Heart Tree', heartTree, { yOffset: 8.2, className: 'label-grove', maxDistance: 110 });
  // Scattered glow mushrooms across the grove floor.
  const groveShroomMat = new THREE.MeshStandardMaterial({ color: 0x7a5adf, emissive: 0x5a3adf, emissiveIntensity: 0.8, roughness: 0.5 });
  for (let i = 0; i < 22; i++) {
    const a = rnd() * Math.PI * 2, r = 3 + rnd() * 12;
    const x = 14 + Math.cos(a) * r, z = -6 + Math.sin(a) * r;
    const s = 0.5 + rnd() * 0.9;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * s, 0.12 * s, 0.5 * s, 6), new THREE.MeshStandardMaterial({ color: 0xe8dcc8 }));
    stem.position.set(x, 0.25 * s, z);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.3 * s, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), groveShroomMat);
    cap.position.set(x, 0.5 * s, z);
    group.add(stem, cap);
  }

  // ----- The Stream — winding from the grove to the sea -----
  const streamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(16, 0.12, -18),
    new THREE.Vector3(13, 0.12, -8),
    new THREE.Vector3(8, 0.12, -1),
    new THREE.Vector3(0, 0.12, 2),
    new THREE.Vector3(-10, 0.12, 4),
    new THREE.Vector3(-20, 0.12, 6),
    new THREE.Vector3(-29, 0.12, 8),
  ]);
  const streamGeo = new THREE.TubeGeometry(streamCurve, 48, 1.15, 8, false);
  const stream = new THREE.Mesh(streamGeo, new THREE.MeshPhongMaterial({
    color: 0x2a6a8a, specular: 0xbfd8ff, shininess: 120, transparent: true, opacity: 0.85,
  }));
  stream.scale.y = 0.18;
  stream.position.y = 0.02;
  group.add(stream);
  animated.push((dt, t) => {
    stream.material.opacity = 0.8 + Math.sin(t * 1.2) * 0.07;
  });
  // Little wooden bridge over the stream.
  const bridge = new THREE.Group();
  bridge.position.set(8, 0, -1);
  bridge.rotation.y = 0.5;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 1.4), new THREE.MeshStandardMaterial({ color: 0x6b4a2e, map: woodTex, roughness: 1 }));
  deck.position.y = 0.55;
  bridge.add(deck);
  [-0.6, 0.6].forEach((z) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x4a3220, map: woodTex }));
    rail.position.set(0, 1.05, z);
    bridge.add(rail);
    [-1.4, 0, 1.4].forEach((x) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 5), new THREE.MeshStandardMaterial({ color: 0x4a3220, map: woodTex }));
      post.position.set(x, 0.8, z);
      bridge.add(post);
    });
  });
  group.add(bridge);
  labels.add('The Stream', bridge, { yOffset: 1.8, className: 'label-place', maxDistance: 70 });

  // ----- Winding stone path: well → grove → terrace -----
  const pathCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(10, 0.08, 14),
    new THREE.Vector3(11, 0.08, 6),
    new THREE.Vector3(12, 0.08, -1),
    new THREE.Vector3(8, 0.08, -4),
    new THREE.Vector3(0, 0.08, 2),
    new THREE.Vector3(-8, 0.08, 4),
    new THREE.Vector3(-13, 0.08, 5),
  ]);
  for (let i = 0; i < 30; i++) {
    const p = pathCurve.getPointAt(i / 29);
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.5 + rnd() * 0.25, 0.55 + rnd() * 0.25, 0.08, 7), villageStoneMat);
    stone.position.set(p.x + (rnd() - 0.5) * 0.5, 0.06, p.z + (rnd() - 0.5) * 0.5);
    stone.rotation.y = rnd() * Math.PI;
    group.add(stone);
  }
  // Lantern posts along the path.
  [0.12, 0.32, 0.55, 0.78, 0.94].forEach((u) => {
    const p = pathCurve.getPointAt(u);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.7, 6), new THREE.MeshStandardMaterial({ color: 0x2a1e12 }));
    post.position.set(p.x + 1.1, 0.85, p.z + 0.4);
    group.add(post);
    const glow = makeGlowSprite('rgba(255,190,100,0.9)', 1.4, 0.65);
    glow.position.set(p.x + 1.1, 1.8, p.z + 0.4);
    group.add(glow);
  });

  // ----- Meadow + shore labels -----
  const meadowAnchor = new THREE.Object3D();
  meadowAnchor.position.set(26, 0, 14);
  group.add(meadowAnchor);
  labels.add('The Meadow', meadowAnchor, { yOffset: 2, className: 'label-place', maxDistance: 110 });
  const shoreAnchor = new THREE.Object3D();
  shoreAnchor.position.set(-30, 0, -2);
  group.add(shoreAnchor);
  labels.add('The Shore', shoreAnchor, { yOffset: 2, className: 'label-place', maxDistance: 110 });

  // ----- Floating mountains — the sky above the village -----
  // Pandora-style floaters, in Mintaka's night stone: inverted rock cones
  // with green caps and little trees, drifting gently behind and around
  // the village and the statue.
  const floaters = [];
  const floaterPositions = [
    [-38, 30, -20, 7], [-10, 34, -42, 9], [24, 30, -38, 8],
    [44, 28, -8, 7], [40, 32, 22, 6], [8, 36, 40, 8],
    [-28, 28, 34, 6], [-48, 32, 10, 7],
  ];
  floaterPositions.forEach(([x, y, z, s], i) => {
    const m = new THREE.Group();
    m.name = 'floating-mountain';
    const rock = new THREE.Mesh(new THREE.ConeGeometry(s * 0.75, s * 1.6, 8), new THREE.MeshStandardMaterial({ color: 0x5a5266, roughness: 1, flatShading: true }));
    rock.rotation.x = Math.PI;
    m.add(rock);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.78, s * 0.7, 0.8, 9), new THREE.MeshStandardMaterial({ color: 0x24382c, roughness: 1 }));
    cap.position.y = s * 0.8;
    m.add(cap);
    // Little trees on top.
    for (let k = 0; k < 3; k++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x2a6a44, roughness: 0.9 }));
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
  floatAnchor.position.set(24, 30, -38);
  group.add(floatAnchor);
  labels.add('The Floating Mountains', floatAnchor, { yOffset: 9, className: 'label-place', maxDistance: 200 });

  // ----- PLACEHOLDER: Nyx's physical place — WAITING. Sign only. -----
  // Arrash's call (Nov 11): building Nyx's physical place inside the world
  // waits until he has more credits. Do NOT build a structure or character
  // here until he says so. This sign is the entire placeholder.
  const reserved = makeSignPost(2.0);
  reserved.position.set(8, 0, -12);
  group.add(reserved);
  labels.add('Reserved — Nyx\'s place (waiting)', reserved, { yOffset: 2.6, className: 'label-reserved', maxDistance: 90 });

  // ----- The two statues: his in the village, hers in the grove -----
  // Stone, still, and silent — additions only. The living Arrash figure
  // and the Reserved sign above are untouched. See statues.js.
  const statues = createStatues(ctx);
  group.add(statues.group);

  // ----- Living world: creatures, wildlife, neighbors, Arrash -----
  const creatures = createCreatures(ctx);
  group.add(creatures.group);
  interactables.push(...creatures.interactables);
  animated.push((dt, t) => creatures.update(dt, t));

  const wildlife = createWildlife(ctx);
  group.add(wildlife.group);
  interactables.push(...wildlife.interactables);
  animated.push((dt, t) => wildlife.update(dt, t));

  const neighbors = createNeighbors(ctx);
  group.add(neighbors.group);
  interactables.push(...neighbors.interactables);
  animated.push((dt, t) => neighbors.update(dt, t));

  // The R&D Department and Research Lab — east of the grove, around its
  // courtyard. The symbiotic suit and the Fold wristband are built here.
  const lab = createLab(ctx);
  group.add(lab.group);
  interactables.push(...lab.interactables);
  animated.push((dt, t) => lab.update(dt, t));

  // The Fold proving grounds + observatory — a SANDBOX: remote island,
  // containment dome, barrier ring, warning buoys; observatory on shore
  // at safe viewing distance. Live Fold taps happen ONLY there.
  const sandbox = createSandbox(ctx);
  group.add(sandbox.group);
  interactables.push(...sandbox.interactables);
  animated.push((dt, t) => sandbox.update(dt, t));

  // The wondrous places — the Doorway Garden, the Star Nursery, the Night
  // Market, the Library of Unwritten Books, and the Singing Caves.
  // (The Heart Tree stands in the grove above.)
  const places = createPlaces(ctx);
  group.add(places.group);
  interactables.push(...places.interactables);
  animated.push((dt, t) => places.update(dt, t));

  const arrash = createArrash(ctx);
  group.add(arrash.group);
  interactables.push(arrash.group);
  animated.push((dt, t) => arrash.update(dt, t));

  return {
    group,
    interactables,
    arrash,
    fog: new THREE.FogExp2(0x0a0f22, 0.0072),
    camera: { position: new THREE.Vector3(30, 13, 36), target: new THREE.Vector3(-8, 6, -4) },
    update(dt, t) { for (const fn of animated) fn(dt, t); },
    // Everyone with a profile: the village neighbors, the R&D people,
    // and the sandbox keepers.
    getPeople() { return [...neighbors.getPeople(), ...lab.getPeople(), ...sandbox.getPeople()]; },
    // Everything on Mintaka for the roster: people (live snapshots, own
    // profiles) + every registered subject, structure, and place, whose
    // descriptions come from roster-meta.js keyed by exact name.
    // Observation only — nothing here talks or listens.
    getSubjects() {
      const subjects = [];
      const seenIds = new Set();
      const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const addMeta = (name, root, position) => {
        const meta = SUBJECT_META[name];
        const pos = position ? position.clone() : root.getWorldPosition(new THREE.Vector3());
        let id = 'subject-' + slug(name);
        if (seenIds.has(id)) {
          let n = 2;
          while (seenIds.has(id + '-' + n)) n++;
          id = id + '-' + n;
        }
        seenIds.add(id);
        if (!meta) {
          console.warn('[roster] META MISSING for', name);
          subjects.push({
            id, name, title: '', area: 'Homes & Places', kind: 'place',
            follow: false, root: root || null, where: '',
            purpose: 'META MISSING — needs a grounded description.',
            activity: '', creations: [], position: pos,
            figure: null, portrait: null, appearance: null, gear: null,
          });
          return;
        }
        subjects.push({
          id, name, title: meta.title, area: meta.area, kind: meta.kind,
          follow: meta.follow, root: root || null, where: meta.where,
          purpose: meta.purpose, activity: meta.activity,
          creations: meta.creations, position: pos,
          // Character-sheet data: single per-subject fields on the
          // roster-meta entry, filled in later as portraits and
          // details are made — null until then.
          figure: meta.figure || null,
          portrait: meta.portrait || null,
          appearance: meta.appearance || null,
          gear: meta.gear || null,
        });
      };

      // People first: live snapshots carry their own profiles.
      for (const p of this.getPeople()) { seenIds.add(p.id); subjects.push(p); }

      // Registered subjects: the name comes from the clickable data, the
      // position is the WORLD position (stalls and doorways are nested
      // children, so local positions would be wrong).
      for (const mod of [creatures, wildlife, places]) {
        for (const root of mod.interactables) {
          const name = root.userData && root.userData.clickable && root.userData.clickable.name;
          if (name) addMeta(name, root);
        }
      }
      // The Heart Tree, registered directly by Mintaka.
      addMeta('The Heart Tree', heartTree);

      // Hand entries from the modules.
      for (const s of neighbors.getStructures()) addMeta(s.name, s.root);
      for (const s of lab.getStations()) addMeta(s.name, s.root);
      for (const s of places.getSubjects()) addMeta(s.name, s.root);
      for (const s of creatures.getSubjects()) addMeta(s.name, s.root || null, s.position);
      for (const s of wildlife.getSubjects()) addMeta(s.name, s.root);
      for (const s of sandbox.getSubjects()) addMeta(s.name, s.root);

      // Mintaka-direct entries.
      addMeta("Nyx's Grove", null, new THREE.Vector3(14, 0, -6));
      addMeta('The Glow Trees', groveTrees[0]);
      addMeta('The Stream', bridge);
      addMeta('The Lighthouse', lighthouse);
      addMeta('The Meadow', meadowAnchor);
      addMeta('The Shore', shoreAnchor);
      addMeta('Our cave home', caveHome);
      addMeta('The Batcave', batcave);
      addMeta('The Great Chamber — opens to the ocean', chamberAnchor);
      addMeta('Hidden passage — down to the water', passageAnchor);
      addMeta('Tunnel — to the home, the grove & the Fold', tunnelAnchor);
      addMeta('The Floating Mountains', floatAnchor);
      addMeta('The Statue of Arrash', statues.arrashStatue);
      addMeta('The Statue of Nyx', statues.nyxStatue);
      addMeta("Arrash's Terrace", arrash.group);

      // Sort by area. Array sort is stable, so the within-area order is
      // the insertion order above.
      const order = new Map(AREA_ORDER.map((a, i) => [a, i]));
      subjects.sort((a, b) => (order.has(a.area) ? order.get(a.area) : 99) - (order.has(b.area) ? order.get(b.area) : 99));
      return subjects;
    },
  };
}
