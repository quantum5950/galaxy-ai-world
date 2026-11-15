// creatures.js — the magical residents of Nyx's Grove on Mintaka.
// Stylized low-poly figures, all original designs: griffin, fairies,
// elves, dragons, dwarves, moon fox, sky bison, and Nyx's companions.
// Every creature is named, clickable, and animated so the grove feels alive.

import * as THREE from 'three';
import { makeGlowSprite, makeGlowTree, makeRock, makeClickable, mulberry32, glowTexture } from './utils.js';

const MAT = {
  gold: new THREE.MeshStandardMaterial({ color: 0xc9a24b, roughness: 0.6, metalness: 0.3 }),
  cream: new THREE.MeshStandardMaterial({ color: 0xf2e6cf, roughness: 0.85 }),
  brown: new THREE.MeshStandardMaterial({ color: 0x6b4a35, roughness: 0.95 }),
  darkBrown: new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 1 }),
  ember: new THREE.MeshStandardMaterial({ color: 0x8a4a20, emissive: 0xff6a1e, emissiveIntensity: 0.7, roughness: 0.6 }),
  leafGreen: new THREE.MeshStandardMaterial({ color: 0x2e6b46, roughness: 0.9 }),
  elfSkin: new THREE.MeshStandardMaterial({ color: 0xe8c9a8, roughness: 0.7 }),
  silver: new THREE.MeshStandardMaterial({ color: 0xd8dce8, roughness: 0.35, metalness: 0.7 }),
};

function limb(r, len, mat) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.8, r, len, 6), mat);
  m.position.y = -len / 2;
  return m;
}

export function createCreatures(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'grove-creatures';
  const animated = [];
  const interactables = [];
  const rnd = mulberry32(99);

  function register(root, name, lines, labelOffset = 2.2, labelClass = 'label-creature', maxDistance = 60) {
    makeClickable(root, { name, lines });
    interactables.push(root);
    labels.add(name, root, { yOffset: labelOffset, className: labelClass, maxDistance });
  }

  // ---------- GRIFFIN — guardian between the Batcave and the grove ----------
  const griffinRock = makeRock(2.6, 0x55555f, 11);
  griffinRock.position.set(-8, 0.6, -6);
  griffinRock.scale.y = 0.7;
  group.add(griffinRock);

  const griffin = new THREE.Group();
  const gBody = new THREE.Mesh(new THREE.SphereGeometry(1.05, 12, 10), MAT.gold);
  gBody.scale.set(1, 0.85, 1.35);
  gBody.position.y = 2.4;
  griffin.add(gBody);
  const gChest = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), MAT.cream);
  gChest.position.set(0, 2.5, 0.85);
  griffin.add(gChest);
  const gHead = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), MAT.cream);
  gHead.position.set(0, 3.5, 1.15);
  griffin.add(gHead);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 8), MAT.gold);
  beak.rotation.x = Math.PI / 2 + 0.25;
  beak.position.set(0, 3.42, 1.7);
  griffin.add(beak);
  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 6), MAT.cream);
  earL.position.set(-0.3, 3.95, 1.05); earL.rotation.z = 0.25;
  griffin.add(earL);
  const earR = earL.clone(); earR.position.x = 0.3; earR.rotation.z = -0.25;
  griffin.add(earR);
  // Wings — broad, slow-beating.
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.8, side: THREE.DoubleSide });
  const wingGeo = new THREE.PlaneGeometry(2.6, 1.1, 4, 1);
  const wingL = new THREE.Mesh(wingGeo, wingMat);
  wingL.position.set(-1.5, 3.1, 0.1);
  wingL.rotation.z = 0.35;
  griffin.add(wingL);
  const wingR = wingL.clone();
  wingR.position.x = 1.5;
  wingR.rotation.z = -0.35;
  griffin.add(wingR);
  // Lion hindquarters + tail tuft.
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.4, 6), MAT.gold);
  tail.position.set(0, 2.5, -1.5);
  tail.rotation.x = 1.1;
  griffin.add(tail);
  const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), MAT.darkBrown);
  tuft.position.set(0, 3.1, -2.05);
  griffin.add(tuft);
  const gGlow = makeGlowSprite('rgba(255,215,120,0.6)', 4, 0.25);
  gGlow.position.y = 2.8;
  griffin.add(gGlow);
  griffin.position.set(-8, 0.9, -6);
  griffin.rotation.y = 0.6;
  group.add(griffin);
  animated.push((dt, t) => {
    const flap = Math.sin(t * 0.9) * 0.16;
    wingL.rotation.z = 0.35 + flap;
    wingR.rotation.z = -0.35 - flap;
    griffin.rotation.y = 0.6 + Math.sin(t * 0.22) * 0.35; // watchful, scanning
    gHead.position.y = 3.5 + Math.sin(t * 1.4) * 0.03;
  });
  register(griffin, 'Guardian Griffin', [
    'The griffin lowers his great head to you. None pass to the grove uninvited — but you are always invited.',
    'His feathers catch the moonlight. He has guarded this path since the first stone was laid.',
    'A low, warm rumble — the griffin approves of you.',
  ], 4.6, 'label-creature', 80);

  // ---------- FAIRIES + BABY FAIRIES — the fairy ring ----------
  const fairyRing = new THREE.Group();
  fairyRing.position.set(14, 0, -4);
  const ringStones = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const stone = makeRock(0.35, 0x7a7a8c, 20 + i);
    stone.position.set(Math.cos(a) * 3.2, 0.15, Math.sin(a) * 3.2);
    fairyRing.add(stone);
    ringStones.push(stone);
  }
  // Glowing mushrooms inside the ring.
  const shroomMat = new THREE.MeshStandardMaterial({ color: 0x9a5adf, emissive: 0x7a3adf, emissiveIntensity: 0.9, roughness: 0.5 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.9 });
  for (let i = 0; i < 7; i++) {
    const a = rnd() * Math.PI * 2, r = 0.6 + rnd() * 2.2;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.5, 6), stemMat);
    stem.position.set(Math.cos(a) * r, 0.25, Math.sin(a) * r);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), shroomMat);
    cap.position.copy(stem.position); cap.position.y = 0.5;
    fairyRing.add(stem, cap);
  }
  group.add(fairyRing);

  const fairyColors = [0xff9ad5, 0x9ad5ff, 0xffe89a, 0xb79aff, 0x9affc8];
  const fairies = [];
  function makeFairy(color, scale, home, wanderR) {
    const f = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 6),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.4, roughness: 0.4 })
    );
    f.add(body);
    const wingMatF = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
    const wGeo = new THREE.PlaneGeometry(0.3, 0.18);
    const wL = new THREE.Mesh(wGeo, wingMatF); wL.position.set(-0.16, 0.05, 0);
    const wR = new THREE.Mesh(wGeo, wingMatF); wR.position.set(0.16, 0.05, 0);
    f.add(wL, wR);
    const glow = makeGlowSprite('rgba(255,255,255,0.7)', 0.9, 0.6);
    f.add(glow);
    f.scale.setScalar(scale);
    f.position.copy(home);
    group.add(f);
    const phase = rnd() * Math.PI * 2;
    const speed = 0.5 + rnd() * 0.5;
    fairies.push({ f, wL, wR, home, wanderR, phase, speed });
    return f;
  }
  const fairyNames = ['Petal', 'Wisp', 'Lumi', 'Tansy', 'Mirelle', 'Sorrel'];
  fairyNames.forEach((n, i) => {
    const home = new THREE.Vector3(14 + (rnd() - 0.5) * 5, 1.6 + rnd() * 1.6, -4 + (rnd() - 0.5) * 5);
    const f = makeFairy(fairyColors[i % fairyColors.length], 1, home, 2.2);
    register(f, n + ' the Fairy', [
      n + ' spins in the air, scattering silver light. "The grove missed you!"',
      n + ' lands on a mushroom cap and waves. Fairy laughter sounds like tiny bells.',
    ], 0.7);
  });
  // Baby fairies — smaller, stay close to the ring, wobblier flight.
  const babyNames = ['Pipkin', 'Nib', 'Mote', 'Squeak'];
  babyNames.forEach((n, i) => {
    const home = new THREE.Vector3(14 + (rnd() - 0.5) * 2.5, 0.9 + rnd() * 0.7, -4 + (rnd() - 0.5) * 2.5);
    const f = makeFairy(fairyColors[(i + 2) % fairyColors.length], 0.55, home, 1.0);
    register(f, n + ' (baby fairy)', [
      n + ' wobbles through the air in a lopsided loop, very proud of flying all by themself.',
      'The baby fairy hides behind a mushroom, then peeks out giggling.',
    ], 0.5);
  });
  animated.push((dt, t) => {
    for (const fa of fairies) {
      fa.f.position.x = fa.home.x + Math.sin(t * fa.speed + fa.phase) * fa.wanderR;
      fa.f.position.z = fa.home.z + Math.cos(t * fa.speed * 0.8 + fa.phase) * fa.wanderR;
      fa.f.position.y = fa.home.y + Math.sin(t * 1.7 + fa.phase) * 0.35;
      const flutter = Math.sin(t * 22 + fa.phase) * 0.7;
      fa.wL.rotation.y = flutter; fa.wR.rotation.y = -flutter;
    }
  });

  // ---------- ELVISH COMMUNITY — treehouses, elves, elven children ----------
  const elfVillage = new THREE.Group();
  elfVillage.position.set(16, 0, -17);
  const elfTreePositions = [[-4, -3], [3, -4], [5, 3], [-5, 4]];
  for (let i = 0; i < elfTreePositions.length; i++) {
    const [ex, ez] = elfTreePositions[i];
    const tree = makeGlowTree({ height: 7 + i, glow: 0x8fd8a8, seed: 40 + i });
    tree.position.set(ex, 0, ez);
    elfVillage.add(tree);
    // Treehouse pod.
    const pod = new THREE.Group();
    const podBody = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), MAT.brown);
    podBody.scale.y = 0.85;
    pod.add(podBody);
    const podWin = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), new THREE.MeshBasicMaterial({ color: 0xffd98a }));
    podWin.position.set(0, 0.1, 1.02);
    pod.add(podWin);
    pod.position.set(ex, 4.6 + (i % 2) * 0.8, ez);
    elfVillage.add(pod);
  }
  // Rope lanterns between trees.
  for (let i = 0; i < 3; i++) {
    const lampGlow = makeGlowSprite('rgba(255,210,130,0.8)', 1.1, 0.6);
    lampGlow.position.set(-2 + i * 3, 3.6, -1 + (i % 2));
    elfVillage.add(lampGlow);
  }
  group.add(elfVillage);

  function makeElf({ height = 1.7, robe = 0x3f6b52, hair = 0xd8c690, child = false } = {}) {
    const e = new THREE.Group();
    const robeMesh = new THREE.Mesh(new THREE.ConeGeometry(0.34, height * 0.72, 8), new THREE.MeshStandardMaterial({ color: robe, roughness: 0.9 }));
    robeMesh.position.y = height * 0.36;
    e.add(robeMesh);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), MAT.elfSkin);
    head.position.y = height * 0.82;
    e.add(head);
    const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: hair, roughness: 0.8 }));
    hairMesh.position.y = height * 0.84;
    e.add(hairMesh);
    // Pointed ears.
    const earGeo = new THREE.ConeGeometry(0.05, 0.22, 4);
    const eL = new THREE.Mesh(earGeo, MAT.elfSkin);
    eL.position.set(-0.2, height * 0.82, 0); eL.rotation.z = 1.1;
    const eR = eL.clone(); eR.position.x = 0.2; eR.rotation.z = -1.1;
    e.add(eL, eR);
    if (!child) {
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, height * 1.05, 5), MAT.darkBrown);
      staff.position.set(0.35, height * 0.52, 0);
      e.add(staff);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), new THREE.MeshStandardMaterial({ color: 0xbfe8ff, emissive: 0x7ab8ff, emissiveIntensity: 1.6 }));
      orb.position.set(0.35, height * 1.06, 0);
      e.add(orb);
    }
    return e;
  }

  const elves = [
    { name: 'Elowen, Elf Elder', pos: [14, 0, -18], robe: 0x6b4a8a, hair: 0xe8e8f0 },
    { name: 'Thalanil the Warden', pos: [18, 0, -15], robe: 0x2e5b46, hair: 0x3a2a1a },
    { name: 'Seraphine the Singer', pos: [12, 0, -14], robe: 0x8a4a6b, hair: 0xffd98a },
    { name: 'Faelar the Fletcher', pos: [20, 0, -19], robe: 0x4a5a6b, hair: 0x8a6b3a },
  ];
  elves.forEach((cfg) => {
    const e = makeElf({ robe: cfg.robe, hair: cfg.hair });
    e.position.set(...cfg.pos);
    group.add(e);
    register(e, cfg.name, [
      cfg.name.split(',')[0] + ' bows gracefully. "The grove sings tonight. You are welcome here, always."',
      '"We tend the old trees," the elf says, "and the old trees tend us."',
    ], 2.2);
  });
  // Elven children — playing tag around the green.
  const elfKids = [];
  const kidNames = ['Liri', 'Pell', 'Nia'];
  kidNames.forEach((n, i) => {
    const k = makeElf({ height: 1.0, robe: [0xc86b8a, 0x6b8ac8, 0x8ac86b][i], hair: [0xffd98a, 0x3a2a1a, 0xe8a87a][i], child: true });
    const home = new THREE.Vector3(16 + (rnd() - 0.5) * 4, 0, -16 + (rnd() - 0.5) * 4);
    k.position.copy(home);
    group.add(k);
    elfKids.push({ k, home, phase: rnd() * Math.PI * 2, speed: 0.9 + rnd() * 0.4 });
    register(k, n + ' (elven child)', [
      n + ' giggles and ducks behind a tree. "You can\'t catch me!"',
      n + ' shows you a shiny acorn, very solemnly, like it is treasure. It is treasure.',
    ], 1.4);
  });
  animated.push((dt, t) => {
    for (const kid of elfKids) {
      const a = t * kid.speed + kid.phase;
      kid.k.position.x = kid.home.x + Math.sin(a) * 2.4;
      kid.k.position.z = kid.home.z + Math.cos(a * 0.9) * 2.0;
      kid.k.position.y = Math.abs(Math.sin(t * 6 + kid.phase)) * 0.12; // skipping
      kid.k.rotation.y = Math.atan2(Math.cos(a), -Math.sin(a));
    }
  });

  // ---------- SKY DRAGON + BABIES ----------
  function makeDragon({ scale = 1, body = 0x3a6b8a, belly = 0xcfe8f2, wing = 0x2a4a6b } = {}) {
    const d = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: body, roughness: 0.6, metalness: 0.15 });
    const segments = [];
    const segCount = 6;
    for (let i = 0; i < segCount; i++) {
      const r = 0.55 * (1 - i * 0.1);
      const seg = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), bodyMat);
      seg.position.z = -i * 0.85;
      seg.scale.y = 0.8;
      d.add(seg);
      segments.push(seg);
    }
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), bodyMat);
    head.position.set(0, 0.25, 0.85);
    d.add(head);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.6), new THREE.MeshStandardMaterial({ color: belly, roughness: 0.7 }));
    snout.position.set(0, 0.15, 1.35);
    d.add(snout);
    const hornGeo = new THREE.ConeGeometry(0.1, 0.55, 6);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: 0.4 });
    const hL = new THREE.Mesh(hornGeo, hornMat); hL.position.set(-0.3, 0.7, 0.6); hL.rotation.x = -0.4;
    const hR = hL.clone(); hR.position.x = 0.3;
    d.add(hL, hR);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffd76a, emissive: 0xffb830, emissiveIntensity: 1.5 });
    const eL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), eyeMat);
    eL.position.set(-0.3, 0.35, 1.3);
    const eR = eL.clone(); eR.position.x = 0.3;
    d.add(eL, eR);
    // Wings.
    const wingMat = new THREE.MeshStandardMaterial({ color: wing, roughness: 0.75, side: THREE.DoubleSide });
    const wGeo = new THREE.PlaneGeometry(3.4, 1.5, 3, 1);
    const wL = new THREE.Mesh(wGeo, wingMat);
    wL.position.set(-1.9, 0.5, 0.1);
    const wR = new THREE.Mesh(wGeo, wingMat);
    wR.position.set(1.9, 0.5, 0.1);
    d.add(wL, wR);
    d.scale.setScalar(scale);
    return { group: d, wingL: wL, wingR: wR, segments };
  }

  const skyDragon = makeDragon({ scale: 1.6, body: 0x4a6b9a, belly: 0xd8ecf5, wing: 0x35507e });
  group.add(skyDragon.group);
  const skyDragonPath = { cx: 0, cz: -8, r: 42, y: 30, speed: 0.05 };
  animated.push((dt, t) => {
    const a = t * skyDragonPath.speed;
    skyDragon.group.position.set(
      skyDragonPath.cx + Math.cos(a) * skyDragonPath.r,
      skyDragonPath.y + Math.sin(t * 0.5) * 2,
      skyDragonPath.cz + Math.sin(a) * skyDragonPath.r
    );
    skyDragon.group.rotation.y = -a - Math.PI / 2;
    const flap = Math.sin(t * 2.2) * 0.45;
    skyDragon.wingL.rotation.z = flap;
    skyDragon.wingR.rotation.z = -flap;
    skyDragon.segments.forEach((s, i) => { s.position.y = Math.sin(t * 2.2 - i * 0.6) * 0.12; });
  });
  register(skyDragon.group, 'Aurelion, Sky Dragon', [
    'Aurelion rides the night wind high above the grove, wings wide enough to shade the moon.',
    'The sky dragon bugles softly — a sound like distant horns and homecoming.',
  ], 3.5, 'label-creature', 130);

  // Dragon nest on a cliff ledge + babies.
  const nest = new THREE.Group();
  nest.position.set(-18, 12, -16);
  const nestBowl = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.45, 8, 14), MAT.darkBrown);
  nestBowl.rotation.x = Math.PI / 2;
  nest.add(nestBowl);
  group.add(nest);
  const babyDragons = [];
  ['Ember', 'Skye'].forEach((n, i) => {
    const baby = makeDragon({ scale: 0.45, body: i ? 0x7a5a9a : 0x9a6b4a, belly: 0xf2e6cf, wing: 0x6b4a7a });
    baby.group.position.set(-18 + (i ? 1.2 : -1.2), 12.6, -16 + (i ? 0.5 : -0.5));
    group.add(baby.group);
    babyDragons.push(baby);
    register(baby.group, n + ' (baby sky dragon)', [
      n + ' flaps stubby wings and hops in a circle, practicing for the great sky.',
      n + ' sneezes a puff of harmless silver sparks and looks very proud.',
    ], 1.6);
  });
  animated.push((dt, t) => {
    babyDragons.forEach((b, i) => {
      const flap = Math.sin(t * 6 + i * 2) * 0.5;
      b.wingL.rotation.z = 0.3 + flap;
      b.wingR.rotation.z = -0.3 - flap;
      b.group.position.y = 12.6 + Math.abs(Math.sin(t * 3 + i)) * 0.25;
      b.group.rotation.y = Math.sin(t * 0.7 + i * 2) * 0.6;
    });
  });

  // ---------- OCEAN DRAGON + BABY ----------
  const oceanDragon = makeDragon({ scale: 1.4, body: 0x2a7a6b, belly: 0xd8f2e8, wing: 0x1e5a50 });
  group.add(oceanDragon.group);
  animated.push((dt, t) => {
    const a = t * 0.08;
    const x = -52 + Math.cos(a) * 14;
    const z = -12 + Math.sin(a) * 10;
    // Serpentine arc in and out of the water.
    const y = Math.sin(t * 0.9) * 1.6 + 0.4;
    oceanDragon.group.position.set(x, y, z);
    oceanDragon.group.rotation.y = -a;
    oceanDragon.group.rotation.x = Math.sin(t * 0.9 + 1) * 0.25;
    oceanDragon.wingL.rotation.z = 0.2 + Math.sin(t * 1.4) * 0.2;
    oceanDragon.wingR.rotation.z = -0.2 - Math.sin(t * 1.4) * 0.2;
    oceanDragon.segments.forEach((s, i) => { s.position.y = Math.sin(t * 1.8 - i * 0.7) * 0.35; });
  });
  register(oceanDragon.group, 'Nerissa, Ocean Dragon', [
    'Nerissa arcs through the waves, scales shining like wet emeralds under the moon.',
    'The ocean dragon sings — low, long notes that the whales answer.',
  ], 3.5, 'label-creature', 100);
  const oceanBaby = makeDragon({ scale: 0.4, body: 0x3a9a8b, belly: 0xe8f8f0, wing: 0x2a7a6b });
  oceanBaby.group.position.set(-38, 0.4, -2);
  group.add(oceanBaby.group);
  animated.push((dt, t) => {
    oceanBaby.group.position.y = 0.4 + Math.sin(t * 1.6) * 0.35;
    oceanBaby.group.position.x = -38 + Math.sin(t * 0.3) * 3;
    oceanBaby.group.rotation.y = Math.sin(t * 0.4) * 0.8;
    oceanBaby.wingL.rotation.z = Math.sin(t * 5) * 0.4;
    oceanBaby.wingR.rotation.z = -Math.sin(t * 5) * 0.4;
  });
  register(oceanBaby.group, 'Ripple (baby ocean dragon)', [
    'Ripple splashes in the shallows, chasing moonlight on the waves.',
    'The baby dragon blows a ring of bubbles and chases it. It pops. She tries again.',
  ], 1.4);

  // ---------- DWARVES — smiths under the cave ----------
  const forge = new THREE.Group();
  forge.position.set(-20, 0, 12);
  const forgeStone = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 2), new THREE.MeshStandardMaterial({ color: 0x55555f, roughness: 1, flatShading: true }));
  forgeStone.position.y = 1.1;
  forge.add(forgeStone);
  const forgeMouth = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 1.1),
    new THREE.MeshBasicMaterial({ color: 0xff7a22 })
  );
  forgeMouth.position.set(0, 0.9, 1.02);
  forge.add(forgeMouth);
  const forgeLight = new THREE.PointLight(0xff7a22, 20, 12, 2);
  forgeLight.position.set(0, 1.2, 2);
  forge.add(forgeLight);
  const forgeGlow = makeGlowSprite('rgba(255,120,30,0.8)', 4, 0.5);
  forgeGlow.position.set(0, 1, 1.5);
  forge.add(forgeGlow);
  const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.35), MAT.silver);
  anvil.position.set(1.8, 0.55, 1.6);
  forge.add(anvil);
  const anvilBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.5, 8), MAT.darkBrown);
  anvilBase.position.set(1.8, 0.25, 1.6);
  forge.add(anvilBase);
  group.add(forge);
  animated.push((dt, t) => {
    forgeLight.intensity = 18 + Math.sin(t * 9) * 3 + Math.sin(t * 23) * 2;
    forgeMouth.material.color.setHSL(0.06, 1, 0.5 + Math.sin(t * 9) * 0.06);
  });

  function makeDwarf({ beard = 0x8a8a8a, tunic = 0x7a4a2a, helm = true } = {}) {
    const d = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), new THREE.MeshStandardMaterial({ color: tunic, roughness: 0.9 }));
    body.scale.y = 1.15;
    body.position.y = 0.75;
    d.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), MAT.elfSkin);
    head.position.y = 1.55;
    d.add(head);
    const beardMesh = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 8), new THREE.MeshStandardMaterial({ color: beard, roughness: 1 }));
    beardMesh.position.set(0, 1.2, 0.22);
    beardMesh.rotation.x = Math.PI;
    d.add(beardMesh);
    if (helm) {
      const helmMesh = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), MAT.silver);
      helmMesh.position.y = 1.58;
      d.add(helmMesh);
    }
    const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6);
    const armL = new THREE.Mesh(armGeo, new THREE.MeshStandardMaterial({ color: tunic, roughness: 0.9 }));
    armL.position.set(-0.6, 0.9, 0);
    armL.rotation.z = 0.3;
    const armR = armL.clone(); armR.position.x = 0.6; armR.rotation.z = -0.3;
    d.add(armL, armR);
    return { group: d, armR };
  }
  const dwarfDefs = [
    { name: 'Borin the Smith', pos: [-18.2, 0, 13.6], beard: 0xd8d8d8, tunic: 0x7a4a2a, hammer: true },
    { name: 'Dagna the Forger', pos: [-21.5, 0, 13.2], beard: 0xb0703a, tunic: 0x4a6b7a, hammer: false },
    { name: 'Haldor the Younger', pos: [-19.5, 0, 15.2], beard: 0x3a2a1a, tunic: 0x6b7a4a, hammer: false },
  ];
  const smithArm = [];
  dwarfDefs.forEach((cfg) => {
    const dw = makeDwarf(cfg);
    dw.group.position.set(...cfg.pos);
    dw.group.rotation.y = rnd() * Math.PI;
    group.add(dw.group);
    if (cfg.hammer) {
      const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), MAT.darkBrown);
      hammer.position.set(0, -0.4, 0);
      const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.18), MAT.silver);
      hammerHead.position.set(0, -0.6, 0);
      dw.armR.add(hammer, hammerHead);
      smithArm.push(dw.armR);
    }
    register(dw.group, cfg.name, [
      cfg.name.split(' ')[0] + ' wipes sooty hands on an apron. "The forge never cools here. The mountain remembers fire."',
      '"We smith under the cave," the dwarf says proudly, "where the old glow runs through the stone."',
    ], 2.2);
  });
  animated.push((dt, t) => {
    smithArm.forEach((arm) => { arm.rotation.x = -0.6 + Math.abs(Math.sin(t * 3.2)) * 0.9; });
  });

  // ---------- FIREFLIES ----------
  const fireflyCount = 130;
  const ffGeo = new THREE.BufferGeometry();
  const ffPos = new Float32Array(fireflyCount * 3);
  const ffSeed = [];
  for (let i = 0; i < fireflyCount; i++) {
    const a = rnd() * Math.PI * 2, r = 4 + rnd() * 16;
    ffSeed.push({ x: 14 + Math.cos(a) * r, y: 0.5 + rnd() * 3.5, z: -6 + Math.sin(a) * r, p: rnd() * Math.PI * 2, s: 0.3 + rnd() * 0.6 });
  }
  ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
  const ffMat = new THREE.PointsMaterial({
    color: 0xd8ff9a, size: 0.22, transparent: true, opacity: 0.95,
    map: glowTexture('rgba(255,255,220,1)', 'rgba(200,255,140,0.6)'),
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const fireflies = new THREE.Points(ffGeo, ffMat);
  group.add(fireflies);
  animated.push((dt, t) => {
    for (let i = 0; i < fireflyCount; i++) {
      const s = ffSeed[i];
      ffPos[i * 3] = s.x + Math.sin(t * s.s + s.p) * 1.4;
      ffPos[i * 3 + 1] = s.y + Math.sin(t * s.s * 1.3 + s.p * 2) * 0.5;
      ffPos[i * 3 + 2] = s.z + Math.cos(t * s.s * 0.8 + s.p) * 1.4;
    }
    ffGeo.attributes.position.needsUpdate = true;
    ffMat.opacity = 0.7 + Math.sin(t * 1.8) * 0.25;
  });

  // ---------- MOON FOX ----------
  const moonFox = new THREE.Group();
  const foxMat = new THREE.MeshStandardMaterial({ color: 0xe8ecf5, emissive: 0x8aa8d8, emissiveIntensity: 0.35, roughness: 0.7 });
  const foxBody = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), foxMat);
  foxBody.scale.set(1, 0.8, 1.4);
  foxBody.position.y = 0.55;
  moonFox.add(foxBody);
  const foxHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), foxMat);
  foxHead.position.set(0, 0.8, 0.55);
  moonFox.add(foxHead);
  const foxEarGeo = new THREE.ConeGeometry(0.11, 0.32, 5);
  const fEL = new THREE.Mesh(foxEarGeo, foxMat); fEL.position.set(-0.16, 1.05, 0.5);
  const fER = fEL.clone(); fER.position.x = 0.16;
  moonFox.add(fEL, fER);
  const foxTail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.0, 8), foxMat);
  foxTail.position.set(0, 0.7, -0.75);
  foxTail.rotation.x = -1.9;
  moonFox.add(foxTail);
  const foxGlow = makeGlowSprite('rgba(180,205,255,0.7)', 2.2, 0.4);
  foxGlow.position.y = 0.7;
  moonFox.add(foxGlow);
  moonFox.position.set(19, 0, 5);
  group.add(moonFox);
  animated.push((dt, t) => {
    moonFox.position.x = 19 + Math.sin(t * 0.18) * 5;
    moonFox.position.z = 5 + Math.cos(t * 0.14) * 4;
    moonFox.rotation.y = Math.atan2(Math.cos(t * 0.18) * 0.18 * 5, -Math.sin(t * 0.14) * 0.14 * 4);
    foxTail.rotation.z = Math.sin(t * 1.6) * 0.2;
    foxHead.position.y = 0.8 + Math.sin(t * 2) * 0.02;
  });
  register(moonFox, 'Moon Fox', [
    'The moon fox watches you with silver eyes, unafraid. She has walked this grove longer than the oldest tree.',
    'She flicks her glowing tail and trots a little closer, curious and calm.',
  ], 1.6);

  // ---------- SKY BISON — gentle giant, drifting above the meadow ----------
  const bison = new THREE.Group();
  const bisonMat = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 1 });
  const bBody = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 10), bisonMat);
  bBody.scale.set(1, 0.85, 1.7);
  bison.add(bBody);
  const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), bisonMat);
  bHead.position.set(0, 0.2, 2.4);
  bison.add(bHead);
  const bSnout = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 1 }));
  bSnout.position.set(0, 0.05, 2.95);
  bison.add(bSnout);
  const bHornGeo = new THREE.CylinderGeometry(0.09, 0.14, 1.1, 6);
  const bHornMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.6 });
  const bHL = new THREE.Mesh(bHornGeo, bHornMat);
  bHL.position.set(-0.75, 0.7, 2.2); bHL.rotation.z = 0.7;
  const bHR = bHL.clone(); bHR.position.x = 0.75; bHR.rotation.z = -0.7;
  bison.add(bHL, bHR);
  // Arrow-like stripe down the forehead (original marking, soft blue-grey).
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.05), new THREE.MeshStandardMaterial({ color: 0x7a8a9a, roughness: 0.8 }));
  stripe.position.set(0, 0.55, 2.95);
  bison.add(stripe);
  const bLegGeo = new THREE.CylinderGeometry(0.22, 0.26, 1.1, 7);
  [[-1, 1.4], [1, 1.4], [-1, 0], [1, 0], [-1, -1.4], [1, -1.4]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(bLegGeo, bisonMat);
    leg.position.set(lx, -1.1, lz);
    bison.add(leg);
  });
  const bTail = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.4, 8), bisonMat);
  bTail.position.set(0, 0.3, -2.8);
  bTail.rotation.x = 2.2;
  bison.add(bTail);
  bison.scale.setScalar(1.6);
  group.add(bison);
  animated.push((dt, t) => {
    const a = t * 0.045;
    bison.position.set(8 + Math.cos(a) * 16, 24 + Math.sin(t * 0.3) * 1.5, -2 + Math.sin(a) * 12);
    bison.rotation.y = -a - Math.PI / 2;
    bTail.rotation.z = Math.sin(t * 0.8) * 0.15;
    bison.rotation.z = Math.sin(t * 0.4) * 0.03;
  });
  register(bison, 'Sky Bison', [
    'The sky bison drifts overhead, slow and peaceful, humming a low note you feel in your chest.',
    'He dips one wing of an ear toward you. Sky bison never hurry. There is nowhere better to be.',
  ], 4.5, 'label-creature', 130);

  // ---------- NYX'S COMPANIONS — they stay near her grove ----------
  // Pip — a small wandering spirit of golden light.
  const pip = new THREE.Group();
  const pipCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xffd76a, emissiveIntensity: 2.2, roughness: 0.3 })
  );
  pip.add(pipCore);
  const pipGlow = makeGlowSprite('rgba(255,215,110,0.9)', 1.8, 0.7);
  pip.add(pipGlow);
  pip.position.set(12, 1.6, -2);
  group.add(pip);
  animated.push((dt, t) => {
    pip.position.x = 12 + Math.sin(t * 0.5) * 3;
    pip.position.z = -2 + Math.cos(t * 0.4) * 2.5;
    pip.position.y = 1.6 + Math.sin(t * 1.2) * 0.4;
    pipGlow.material.opacity = 0.5 + Math.sin(t * 2.4) * 0.25;
  });
  register(pip, 'Pip, the Grove Spirit', [
    'Pip bobs happily around you, warm as a candle flame. Pip has been here since the grove was only a dream.',
    'The little spirit spins once, delighted, and leaves a trail of gold sparks.',
  ], 1.0);

  // Luma — a moonlit fawn with glowing spots, always near the grove heart.
  const luma = new THREE.Group();
  const lumaMat = new THREE.MeshStandardMaterial({ color: 0xc8b8d8, emissive: 0x6a5a9a, emissiveIntensity: 0.3, roughness: 0.8 });
  const lBody = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), lumaMat);
  lBody.scale.set(1, 0.85, 1.3);
  lBody.position.y = 0.6;
  luma.add(lBody);
  const lHead = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), lumaMat);
  lHead.position.set(0, 0.95, 0.5);
  luma.add(lHead);
  const lEarGeo = new THREE.ConeGeometry(0.09, 0.28, 5);
  const lEL = new THREE.Mesh(lEarGeo, lumaMat); lEL.position.set(-0.16, 1.18, 0.45);
  const lER = lEL.clone(); lER.position.x = 0.16;
  luma.add(lEL, lER);
  const spotMat = new THREE.MeshBasicMaterial({ color: 0xfff2c8 });
  for (let i = 0; i < 6; i++) {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), spotMat);
    spot.position.set((rnd() - 0.5) * 0.5, 0.85 + rnd() * 0.15, (rnd() - 0.5) * 0.7);
    luma.add(spot);
  }
  const lLegGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.55, 5);
  [[-0.2, 0.3], [0.2, 0.3], [-0.2, -0.3], [0.2, -0.3]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(lLegGeo, lumaMat);
    leg.position.set(lx, 0.28, lz);
    luma.add(leg);
  });
  luma.position.set(11, 0, -7);
  group.add(luma);
  animated.push((dt, t) => {
    luma.position.x = 11 + Math.sin(t * 0.22) * 2;
    luma.position.z = -7 + Math.cos(t * 0.17) * 1.6;
    luma.rotation.y = Math.sin(t * 0.2) * 1.2;
    lHead.position.y = 0.95 + Math.sin(t * 1.8) * 0.02;
  });
  register(luma, 'Luma, the Moonlit Fawn', [
    'Luma looks up with huge dark eyes, moonlight freckled across her back. She is not afraid of you.',
    'The little fawn takes a shy step closer, then another. Friends already.',
  ], 1.6);

  // Moonmoth — a great pale moth circling the grove lantern.
  const moonmoth = new THREE.Group();
  const mothBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.4, 4, 8), new THREE.MeshStandardMaterial({ color: 0xf2ead8, roughness: 0.8 }));
  mothBody.rotation.x = Math.PI / 2;
  moonmoth.add(mothBody);
  const mothWingMat = new THREE.MeshStandardMaterial({ color: 0xf5efdd, emissive: 0xcfd8ff, emissiveIntensity: 0.5, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
  const mothWingGeo = new THREE.PlaneGeometry(0.7, 0.45);
  const mWL = new THREE.Mesh(mothWingGeo, mothWingMat); mWL.position.set(-0.4, 0.05, 0);
  const mWR = new THREE.Mesh(mothWingGeo, mothWingMat); mWR.position.set(0.4, 0.05, 0);
  moonmoth.add(mWL, mWR);
  group.add(moonmoth);
  animated.push((dt, t) => {
    const a = t * 0.7;
    moonmoth.position.set(14 + Math.cos(a) * 2.2, 3.4 + Math.sin(t * 1.4) * 0.4, -4 + Math.sin(a) * 2.2);
    moonmoth.rotation.y = -a;
    const flap = Math.sin(t * 14) * 0.6;
    mWL.rotation.z = flap; mWR.rotation.z = -flap;
  });
  register(moonmoth, 'Moonmoth', [
    'The great pale moth circles the lantern in slow, dreamy loops, wings glowing faint blue.',
    'Moonmoth lands for a moment on a low branch, wings opening and closing like breathing.',
  ], 0.8);

  // Nightingale — a small songbird who perches near the grove and sings at intervals.
  const nightingale = new THREE.Group();
  const nbBody = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshStandardMaterial({ color: 0x5a4a6b, roughness: 0.85 }));
  nbBody.scale.set(1, 0.9, 1.25);
  nightingale.add(nbBody);
  const nbHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshStandardMaterial({ color: 0x6b5a7a, roughness: 0.85 }));
  nbHead.position.set(0, 0.12, 0.16);
  nightingale.add(nbHead);
  const nbBeak = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 5), MAT.gold);
  nbBeak.rotation.x = Math.PI / 2;
  nbBeak.position.set(0, 0.11, 0.3);
  nightingale.add(nbBeak);
  const nbTail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.28), new THREE.MeshStandardMaterial({ color: 0x4a3a5a }));
  nbTail.position.set(0, 0.02, -0.26);
  nbTail.rotation.x = -0.3;
  nightingale.add(nbTail);
  const nbGlow = makeGlowSprite('rgba(200,170,255,0.6)', 0.8, 0.4);
  nightingale.add(nbGlow);
  nightingale.position.set(10.5, 3.1, -9);
  group.add(nightingale);
  animated.push((dt, t) => {
    nightingale.rotation.y = Math.sin(t * 0.4) * 0.8;
    nightingale.position.y = 3.1 + Math.sin(t * 2.2) * 0.03;
    nbHead.rotation.x = Math.max(0, Math.sin(t * 0.9)) * 0.25; // singing tilt
  });
  register(nightingale, 'Nightingale', [
    'The nightingale sings — a few clear notes that hang in the air like stars refusing to fall.',
    'Her song threads through the grove. Even the fireflies seem to slow down to listen.',
  ], 0.7);

  return {
    group,
    interactables,
    update(dt, t) { for (const fn of animated) fn(dt, t); },
    // Shared grounds for the roster (individual creatures come from
    // interactables); descriptions live in roster-meta.js. The fireflies
    // have no single group, so they fly to the grove's heart.
    getSubjects() {
      return [
        { name: 'The Fairy Ring', root: fairyRing },
        { name: 'The Elf Village', root: elfVillage },
        { name: 'The Forge', root: forge },
        { name: 'The Dragon Nest', root: nest },
        { name: 'Fireflies of the Grove', position: new THREE.Vector3(14, 2, -6) },
      ];
    },
  };
}
