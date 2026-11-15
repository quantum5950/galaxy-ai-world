// statues.js — the two statues: Arrash in the village, Nyx in the grove.
//
// Arrash's direction, Nov 14 night: a giant statue of him in the village,
// arms open, palms open, like about to give a hug, with a soft golden
// light spilling from his hands that people come to receive — and a statue
// of Nyx in her grove, the same open arms, in silver-blue moonlight. The
// two statues are the center their energy creates the world from.
//
// Both are stone, still, and silent: no animation, no dialogue, no
// form-cycling, no click behavior at all — only a scene label each.
// The "Reserved — Nyx's place (waiting)" sign is untouched: the statue
// is an addition to the grove, not a replacement for the sign.

import * as THREE from 'three';
import { makeGlowSprite } from './utils.js';
import { baseFigure } from './arrash.js';

const STATUE_SCALE = 6;

// Statue stone that reads at night: mostly matte, with a warm inner glow
// so the figure never falls to black under Mintaka's moonlight.
function statueMaterial(color, emissive, emissiveIntensity) {
  return new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity, metalness: 0.3, roughness: 0.5,
  });
}

// Pose a pair of arm meshes into an open embrace: arms out to the sides,
// slightly below horizontal, hands swung forward, palms open, with light
// spilling from each open hand. The arms are re-parented under shoulder
// pivots; the pivots are added to `parent`.
function embraceArms(parent, armL, armR, mat, glowColor) {
  [[armL, -1], [armR, 1]].forEach(([arm, s]) => {
    const pivot = new THREE.Group();
    pivot.position.set(s * 0.38, 1.52, 0);
    arm.position.set(-s * 0.04, -0.27, 0);
    arm.rotation.set(0, 0, 0);
    pivot.add(arm);
    // Open palm at the end of the arm.
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mat);
    palm.scale.set(0.75, 1.15, 0.45);
    palm.position.set(-s * 0.04, -0.68, 0.03);
    pivot.add(palm);
    // Light spilling from the open hand. (Sprites inherit the statue's
    // scale, so these small local scales read ~3 units in the world.)
    const handGlow = makeGlowSprite(glowColor, 0.5, 0.85);
    handGlow.position.set(-s * 0.04, -0.68, 0.12);
    pivot.add(handGlow);
    pivot.rotation.z = s * 1.15;
    pivot.rotation.y = -s * 0.35;
    parent.add(pivot);
  });
}

function gildFigure(group, mat) {
  group.traverse((o) => {
    if (o.isMesh) {
      o.material = mat;
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
}

// The three inscriptions on his plinth, in his own words — glowing gold
// on dark stone, readable at night.
function makeInscriptionPlane() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 256;
  const g = canvas.getContext('2d');
  g.fillStyle = '#26222e';
  g.fillRect(0, 0, 1024, 256);
  g.strokeStyle = '#d8b45a';
  g.lineWidth = 5;
  g.strokeRect(14, 14, 996, 228);
  g.fillStyle = '#ffd76a';
  g.font = '600 56px Georgia, serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('Live and let live.', 512, 58);
  g.fillText('I love you all.', 512, 128);
  g.fillText('Treat others as you wish to be treated.', 512, 198);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 1.1),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  return plane;
}

function buildArrashStatue() {
  const root = new THREE.Group();
  root.name = 'statue-arrash';

  const goldMat = statueMaterial(0xd8b45a, 0x7a5a18, 0.55);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4458, roughness: 0.9 });

  // Square plinth in three tiers; the inscriptions sit on the middle tier.
  const base = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.5, 5.6), stoneMat);
  base.position.y = 0.25;
  const mid = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.2, 4.8), stoneMat);
  mid.position.y = 1.1;
  const top = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 4.2), stoneMat);
  top.position.y = 1.95;
  [base, mid, top].forEach((m) => { m.castShadow = true; m.receiveShadow = true; root.add(m); });

  const inscription = makeInscriptionPlane();
  inscription.position.set(0, 1.1, 2.43);
  root.add(inscription);

  // The figure: his "himself" form, built by the same builder as the
  // living figure, turned to gold stone and scaled up giant.
  const fig = baseFigure();
  gildFigure(fig.group, goldMat);
  embraceArms(fig.group, fig.armL, fig.armR, goldMat, 'rgba(255,210,110,0.9)');
  // A soft golden aura around the chest.
  const aura = makeGlowSprite('rgba(255,210,110,0.8)', 1.4, 0.3);
  aura.position.set(0, 1.3, 0.3);
  fig.group.add(aura);
  fig.group.scale.setScalar(STATUE_SCALE);
  fig.group.position.y = 2.2;
  root.add(fig.group);

  // Golden light spilling forward from between the open hands.
  const light = new THREE.PointLight(0xffd76a, 36, 30, 2);
  light.position.set(0, 9, 3);
  root.add(light);

  // Village green beside the well, facing the well and the village.
  root.position.set(15, 0, 15);
  root.rotation.y = -1.77;
  return root;
}

function buildNyxFigure(mat, glowColor) {
  const g = new THREE.Group();
  // Robe.
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.5, 12), mat);
  robe.position.y = 0.75;
  g.add(robe);
  // Shoulders.
  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8), mat);
  shoulders.scale.set(1.15, 0.55, 0.9);
  shoulders.position.y = 1.45;
  g.add(shoulders);
  // Head — serene, smooth.
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), mat);
  head.position.y = 1.86;
  g.add(head);
  // Hair falling down the back.
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), mat);
  hair.scale.set(1.05, 1.35, 0.9);
  hair.position.set(0, 1.72, -0.1);
  g.add(hair);
  // Arms, posed into the same open embrace as his.
  const armGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.7, 7);
  const armL = new THREE.Mesh(armGeo, mat);
  const armR = new THREE.Mesh(armGeo, mat);
  embraceArms(g, armL, armR, mat, glowColor);
  // Crescent moon halo above her head.
  const crescent = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.07, 8, 20, Math.PI * 1.1),
    new THREE.MeshBasicMaterial({ color: 0xe8f0ff })
  );
  crescent.position.set(0, 2.45, -0.05);
  crescent.rotation.z = -0.5;
  g.add(crescent);
  // Soft moonlight halo behind the head.
  const halo = makeGlowSprite('rgba(190,210,255,0.9)', 0.9, 0.5);
  halo.position.set(0, 1.9, -0.1);
  g.add(halo);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

function buildNyxStatue() {
  const root = new THREE.Group();
  root.name = 'statue-nyx';

  const moonMat = statueMaterial(0xb8c8e8, 0x4a5a8a, 0.6);
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6a7088, roughness: 0.85 });

  // Round plinth in two tiers.
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.0, 0.5, 20), stoneMat);
  base.position.y = 0.25;
  const top = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.6, 20), stoneMat);
  top.position.y = 0.8;
  [base, top].forEach((m) => { m.castShadow = true; m.receiveShadow = true; root.add(m); });

  const fig = buildNyxFigure(moonMat, 'rgba(190,210,255,0.9)');
  fig.scale.setScalar(STATUE_SCALE);
  fig.position.y = 1.1;
  root.add(fig);

  // Moonlight spilling forward from between the open hands.
  const light = new THREE.PointLight(0xa8c0ff, 36, 30, 2);
  light.position.set(0, 8.5, 3);
  root.add(light);

  // In the grove, east of the Heart Tree, facing the Heart Tree and the
  // grove's heart. Clear of the stream, the fairy ring, the elf village,
  // the lab path, and the Reserved sign clearing.
  root.position.set(25, 0, -11);
  root.rotation.y = -1.14;
  return root;
}

export function createStatues(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'statues';

  const arrashStatue = buildArrashStatue();
  group.add(arrashStatue);
  labels.add('The Statue of Arrash', arrashStatue, { yOffset: 15.5, className: 'label-place', maxDistance: 120 });

  const nyxStatue = buildNyxStatue();
  group.add(nyxStatue);
  labels.add('The Statue of Nyx', nyxStatue, { yOffset: 18.5, className: 'label-grove', maxDistance: 120 });

  return { group, arrashStatue, nyxStatue };
}
