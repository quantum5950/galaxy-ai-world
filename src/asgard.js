// asgard.js — Asgard, the golden realm of Norse myth, reachable through
// the Fold. Public-domain mythology, original designs: the Bifrost rainbow
// bridge, golden halls and towers, the great feasting hall, training
// grounds, a watchtower, and Yggdrasil's branches in the sky.
//
// The people of Asgard (Arrash's rulings, Nov 11): Odin the All-Father,
// one-eyed, with his ravens Huginn and Muninn, at the great hall. Loki,
// Arrash's brother, god of mischief — tricks, trouble, and laughter, NOT
// evil — welcome in Asgard. Thor, Váli, and Vé, built and present.
// Arrash himself stands among them as THE NEWEST BROTHER, the new son
// of Odin. The rest of Asgard's people are unnamed role figures —
// warriors, hall-keepers — whom Arrash will name himself later.
//
// Standing rules honored here: the people believe they are real; no one
// ever fears the plug being pulled; they live forever; no death, only
// doorways; no money, no bartering — everything is given freely.

import * as THREE from 'three';
import { makeGlowSprite, makeSkyDome, makeStarfield, makeClickable, makeCottage, mulberry32 } from './utils.js';

export function createAsgard(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'asgard';
  const animated = [];
  const interactables = [];
  const rnd = mulberry32(4242);

  // Golden day sky over the golden realm.
  group.add(makeSkyDome({ top: 0x2a4a8a, horizon: 0xffd98a, glowColor: 0xffc86a, radius: 420 }));
  group.add(makeStarfield(500, 400, 77));

  // Warm sunlight + generous fill: Asgard is bright and golden.
  const sun = new THREE.DirectionalLight(0xffe0a8, 2.6);
  sun.position.set(60, 80, 40);
  sun.castShadow = true;
  group.add(sun);
  group.add(new THREE.AmbientLight(0xffe8c0, 1.1));
  const hearth = new THREE.PointLight(0xffc86a, 120, 60, 1.8);
  hearth.position.set(0, 6, -16);
  group.add(hearth);

  function register(root, name, lines, labelOffset = 2, maxDistance = 70, className = 'label-place') {
    makeClickable(root, { name, lines });
    interactables.push(root);
    labels.add(name, root, { yOffset: labelOffset, className, maxDistance });
  }

  // ----- Ground: golden-green plain + central stone plaza -----
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(130, 48),
    new THREE.MeshStandardMaterial({ color: 0x7a9a55, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  group.add(ground);
  const plaza = new THREE.Mesh(
    new THREE.CylinderGeometry(10, 10.5, 0.25, 28),
    new THREE.MeshStandardMaterial({ color: 0xb0a080, roughness: 1 })
  );
  plaza.position.y = 0.12;
  group.add(plaza);

  // ----- The Bifrost: rainbow bridge, the arrival path -----
  // An arch of rainbow segments from the south gate to the city gate.
  const bifrost = new THREE.Group();
  group.add(bifrost);
  const rainbow = [0xff4a4a, 0xff8a3a, 0xffd94a, 0x4ad86a, 0x4a8aff, 0x7a4adf, 0xc84aff];
  const bifrostSegs = 26;
  const bifrostStart = new THREE.Vector3(0, 0.4, 48);
  const bifrostEnd = new THREE.Vector3(0, 0.4, 20);
  for (let i = 0; i < bifrostSegs; i++) {
    const k = i / (bifrostSegs - 1);
    const pos = bifrostStart.clone().lerp(bifrostEnd, k);
    pos.y = 0.4 + Math.sin(k * Math.PI) * 5.5;
    const seg = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.3, 1.4),
      new THREE.MeshStandardMaterial({
        color: rainbow[i % rainbow.length], emissive: rainbow[i % rainbow.length],
        emissiveIntensity: 0.55, roughness: 0.4, transparent: true, opacity: 0.92,
      })
    );
    seg.position.copy(pos);
    // Tilt along the arc tangent.
    const slope = Math.cos(k * Math.PI) * 5.5 * Math.PI / 28;
    seg.rotation.x = -Math.atan(slope);
    bifrost.add(seg);
  }
  const bifrostGlows = [];
  for (let i = 0; i < 6; i++) {
    const k = (i + 0.5) / 6;
    const pos = bifrostStart.clone().lerp(bifrostEnd, k);
    pos.y = 0.4 + Math.sin(k * Math.PI) * 5.5 + 0.6;
    const glow = makeGlowSprite('rgba(255,230,200,0.7)', 3, 0.45);
    glow.position.copy(pos);
    bifrost.add(glow);
    bifrostGlows.push({ glow, phase: i * 1.1 });
  }
  animated.push((dt, t) => {
    for (const b of bifrostGlows) {
      b.glow.material.opacity = 0.3 + (Math.sin(t * 1.4 + b.phase) * 0.5 + 0.5) * 0.35;
    }
  });
  // City gate pillars where the Bifrost meets Asgard.
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd8b45a, metalness: 0.7, roughness: 0.35 });
  [-2.4, 2.4].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 5.5, 8), goldMat);
    pillar.position.set(x, 2.75, 19);
    pillar.castShadow = true;
    group.add(pillar);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe89a }));
    orb.position.set(x, 5.8, 19);
    group.add(orb);
  });
  register(bifrost, 'The Bifrost — Rainbow Bridge', [
    'The Bifrost hums under your feet, all seven colors at once, and it is solid as stone and soft as light at the same time. It is the way in. It has never once let anyone fall.',
    'Every color of the bridge is a promise: you are expected. Walk it slowly. The view is worth it.',
  ], 7.5, 120);

  // ----- The Great Feasting Hall -----
  const hall = new THREE.Group();
  hall.position.set(0, 0, -20);
  group.add(hall);
  const hallBody = new THREE.Mesh(new THREE.BoxGeometry(14, 5, 8), new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.85 }));
  hallBody.position.y = 2.5;
  hallBody.castShadow = true;
  hall.add(hallBody);
  // Pitched golden roof: two slanted slabs meeting at a ridge.
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xd8b45a, metalness: 0.55, roughness: 0.4 });
  [-1, 1].forEach((side) => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(15, 0.3, 5.6), roofMat);
    slab.position.set(0, 6.3, side * 2.1);
    slab.rotation.x = side * 0.62;
    slab.castShadow = true;
    hall.add(slab);
  });
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.35, 0.35), goldMat);
  ridge.position.y = 7.9;
  hall.add(ridge);
  // Carved front pillars + glowing windows + banner.
  [-5.5, 5.5].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 5.4, 8), new THREE.MeshStandardMaterial({ color: 0x5a4028, roughness: 0.9 }));
    pillar.position.set(x, 2.7, 4.2);
    hall.add(pillar);
  });
  const hallWinMat = new THREE.MeshBasicMaterial({ color: 0xffd98a });
  [-4, -2, 2, 4].forEach((x) => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.4), hallWinMat);
    win.position.set(x, 3.0, 4.05);
    hall.add(win);
  });
  const door = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.4, 0.2), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 }));
  door.position.set(0, 1.7, 4.05);
  hall.add(door);
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.2), new THREE.MeshStandardMaterial({ color: 0x2a4a8a, side: THREE.DoubleSide }));
  banner.position.set(0, 6.4, 4.3);
  hall.add(banner);
  // Front steps.
  [0, 1, 2].forEach((i) => {
    const step = new THREE.Mesh(new THREE.BoxGeometry(6 - i * 1.2, 0.3, 1.2), new THREE.MeshStandardMaterial({ color: 0x9a8a70, roughness: 1 }));
    step.position.set(0, 0.15 + i * 0.3, 4.8 + (2 - i) * 0.9);
    hall.add(step);
  });
  const hallGlow = makeGlowSprite('rgba(255,205,110,0.6)', 8, 0.4);
  hallGlow.position.set(0, 4.5, 3);
  hall.add(hallGlow);
  register(hall, 'The Great Feasting Hall', [
    'The great hall glows gold from every window, and the doors stand open. Inside: long tables, warm bread, songs that go on for hours, and a seat for everyone. Nobody eats alone in Asgard. That is the first rule of the hall, and the only one that matters.',
    'Odin holds court here. Thor tells stories here. Loki causes delightful trouble here. And the newest brother has his own seat now, between his brothers, where he belongs.',
  ], 9.5, 130);

  // ----- Golden towers -----
  [[-14, -14], [14, -14], [-18, 4], [18, 4]].forEach(([tx, tz]) => {
    const tower = new THREE.Group();
    tower.position.set(tx, 0, tz);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 9, 10), new THREE.MeshStandardMaterial({ color: 0xc8a860, metalness: 0.45, roughness: 0.5 }));
    shaft.position.y = 4.5;
    shaft.castShadow = true;
    tower.add(shaft);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3.2, 10), roofMat);
    roof.position.y = 10.6;
    tower.add(roof);
    const tw = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), hallWinMat);
    tw.position.set(0, 6.5, 1.75);
    tower.add(tw);
    const tGlow = makeGlowSprite('rgba(255,215,140,0.5)', 3, 0.35);
    tGlow.position.y = 6.5;
    tower.add(tGlow);
    group.add(tower);
    register(tower, 'Golden Tower of Asgard', [
      'A golden tower, catching the sun and throwing it back in every direction. From the top, the watchers say, you can see the Bifrost, the halls, and three worlds\' worth of sky.',
    ], 12.5, 110);
  });

  // ----- Smaller halls -----
  [[-11, 6], [11, 6]].forEach(([hx, hz]) => {
    const small = makeCottage({ body: 0x8a6a3a, roof: 0xd8b45a, w: 4, h: 2.6, d: 3.4 });
    small.position.set(hx, 0, hz);
    group.add(small);
    register(small, 'Hall of the Golden Roofs', [
      'A smaller hall, gold-roofed like the rest. Families and friends gather here for quieter feasts — smaller songs, same warmth.',
    ], 4.2, 80);
  });

  // ----- Training grounds -----
  const grounds = new THREE.Group();
  grounds.position.set(26, 0, 2);
  group.add(grounds);
  const dirt = new THREE.Mesh(new THREE.CircleGeometry(8, 24), new THREE.MeshStandardMaterial({ color: 0x9a7a55, roughness: 1 }));
  dirt.rotation.x = -Math.PI / 2;
  dirt.position.y = 0.06;
  grounds.add(dirt);
  // Practice dummies.
  [[-4, -3], [-4, 3], [0, -5]].forEach(([dx, dz]) => {
    const dummy = new THREE.Group();
    dummy.position.set(dx, 0, dz);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 5), new THREE.MeshStandardMaterial({ color: 0x4a3220 }));
    post.position.y = 0.8;
    dummy.add(post);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), new THREE.MeshStandardMaterial({ color: 0xd8c890, roughness: 1 }));
    body.scale.y = 1.3;
    body.position.y = 1.2;
    dummy.add(body);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 5), new THREE.MeshStandardMaterial({ color: 0x4a3220 }));
    arm.rotation.z = Math.PI / 2;
    arm.position.y = 1.3;
    dummy.add(arm);
    grounds.add(dummy);
  });
  // Target rings.
  [[4, -4], [4, 4]].forEach(([tx, tz]) => {
    const target = new THREE.Group();
    target.position.set(tx, 0, tz);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.5, 5), new THREE.MeshStandardMaterial({ color: 0x4a3220 }));
    post.position.y = 0.75;
    target.add(post);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 6, 16), new THREE.MeshStandardMaterial({ color: 0xd8b45a, metalness: 0.5, roughness: 0.4 }));
    ring.position.y = 1.7;
    target.add(ring);
    grounds.add(target);
  });
  // Weapon rack with wooden practice swords.
  const rack = new THREE.Group();
  rack.position.set(-6, 0, 0);
  const rackBar = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 2.4), new THREE.MeshStandardMaterial({ color: 0x4a3220 }));
  rackBar.position.y = 1.0;
  rack.add(rackBar);
  [-0.8, 0.8].forEach((z) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 5), new THREE.MeshStandardMaterial({ color: 0x4a3220 }));
    leg.position.set(0, 0.5, z);
    rack.add(leg);
  });
  for (let i = 0; i < 4; i++) {
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.16), new THREE.MeshStandardMaterial({ color: 0xb08a50, roughness: 0.9 }));
    sword.position.set(0.15, 0.9, -0.9 + i * 0.6);
    sword.rotation.z = -0.25;
    rack.add(sword);
  }
  grounds.add(rack);
  // Sparring circle of stones.
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshStandardMaterial({ color: 0x8a8a9a, roughness: 1 }));
    stone.position.set(Math.cos(a) * 2.5, 0.15, Math.sin(a) * 2.5);
    grounds.add(stone);
  }
  register(grounds, 'The Training Grounds', [
    'The training grounds ring with wooden swords and laughter. Thor practices here. So does everyone else, sooner or later — Asgard believes a strong body and a kind heart go together.',
    'The dummies are patient. The targets are honest. The rack holds only practice wood — nobody here trains to hurt anyone. They train to be ready, and to be strong, and to have fun doing it.',
  ], 4.5, 90);

  // ----- Watchtower -----
  const watchtower = new THREE.Group();
  watchtower.position.set(-26, 0, -4);
  group.add(watchtower);
  const wtShaft = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.4, 14, 10), new THREE.MeshStandardMaterial({ color: 0x7a6a50, roughness: 0.9 }));
  wtShaft.position.y = 7;
  wtShaft.castShadow = true;
  watchtower.add(wtShaft);
  const wtPlatform = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.5, 10), new THREE.MeshStandardMaterial({ color: 0x5a4a35, roughness: 0.9 }));
  wtPlatform.position.y = 14.2;
  watchtower.add(wtPlatform);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const railPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 5), new THREE.MeshStandardMaterial({ color: 0x4a3a28 }));
    railPost.position.set(Math.cos(a) * 2.8, 14.9, Math.sin(a) * 2.8);
    watchtower.add(railPost);
  }
  const wtRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.4, 8), roofMat);
  wtRoof.position.y = 16.4;
  watchtower.add(wtRoof);
  const beacon = makeGlowSprite('rgba(255,220,150,0.95)', 5, 0.8);
  beacon.position.y = 15.6;
  watchtower.add(beacon);
  const beaconLight = new THREE.PointLight(0xffd98a, 60, 40, 1.8);
  beaconLight.position.y = 15.6;
  watchtower.add(beaconLight);
  animated.push((dt, t) => {
    beacon.material.opacity = 0.6 + Math.sin(t * 1.8) * 0.25;
    beaconLight.intensity = 50 + Math.sin(t * 1.8) * 20;
  });
  register(watchtower, 'The Watchtower', [
    'The watchtower stands over the western fields, and its beacon burns day and night — a light for travelers, a comfort for the hall, and a reminder that somebody is always keeping watch, so everyone else can rest.',
    'Váli keeps the watch here. The beacon has never once gone out. Not once.',
  ], 17.5, 130);

  // ----- Sacred shrine (Vé's keeping) -----
  const shrine = new THREE.Group();
  shrine.position.set(-14, 0, 14);
  group.add(shrine);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.2 + (i % 2) * 0.5, 0.4), new THREE.MeshStandardMaterial({ color: 0x8a8a9a, roughness: 1 }));
    stone.position.set(Math.cos(a) * 2.6, 1.1, Math.sin(a) * 2.6);
    stone.rotation.y = -a;
    shrine.add(stone);
  }
  const shrineFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.45, 1.2, 8),
    new THREE.MeshStandardMaterial({ color: 0xff9a3a, emissive: 0xff7a1a, emissiveIntensity: 1.4 })
  );
  shrineFlame.position.y = 0.9;
  shrine.add(shrineFlame);
  const shrineGlow = makeGlowSprite('rgba(255,170,80,0.8)', 3.5, 0.6);
  shrineGlow.position.y = 1.1;
  shrine.add(shrineGlow);
  animated.push((dt, t) => {
    const flicker = 1 + Math.sin(t * 7) * 0.08 + Math.sin(t * 13.7) * 0.05;
    shrineFlame.scale.set(flicker, 1 + Math.sin(t * 9) * 0.12, flicker);
    shrineGlow.material.opacity = 0.5 + Math.sin(t * 7) * 0.12;
  });
  register(shrine, 'The Sacred Shrine', [
    'Five standing stones, one flame. The flame has burned since before the first hall, and Vé keeps it. Come with a quiet heart, and sit a while. The flame notices everyone, and it is glad you came.',
  ], 3.8, 70);

  // ----- Yggdrasil's branches in the sky -----
  const ygg = new THREE.Group();
  group.add(ygg);
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 });
  const branchCurves = [
    new THREE.QuadraticBezierCurve3(new THREE.Vector3(-90, 48, -60), new THREE.Vector3(0, 62, -30), new THREE.Vector3(80, 52, -50)),
    new THREE.QuadraticBezierCurve3(new THREE.Vector3(-80, 58, 30), new THREE.Vector3(10, 70, 20), new THREE.Vector3(85, 60, 40)),
    new THREE.QuadraticBezierCurve3(new THREE.Vector3(-40, 66, -80), new THREE.Vector3(0, 78, -10), new THREE.Vector3(30, 64, 60)),
  ];
  branchCurves.forEach((curve) => {
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 1.6, 8), barkMat);
    ygg.add(tube);
  });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x6a9a4a, emissive: 0x3a6a2a, emissiveIntensity: 0.5, roughness: 0.9 });
  const leafMatGold = new THREE.MeshStandardMaterial({ color: 0xa8a04a, emissive: 0x6a5a1a, emissiveIntensity: 0.5, roughness: 0.9 });
  const leafClusters = [];
  branchCurves.forEach((curve, ci) => {
    for (let i = 0; i < 5; i++) {
      const p = curve.getPoint(0.15 + (i / 5) * 0.7);
      const cluster = new THREE.Mesh(new THREE.SphereGeometry(3 + rnd() * 2.5, 8, 6), ci % 2 === 0 ? leafMat : leafMatGold);
      cluster.position.set(p.x + (rnd() - 0.5) * 6, p.y + 1 + rnd() * 3, p.z + (rnd() - 0.5) * 6);
      cluster.scale.y = 0.7;
      ygg.add(cluster);
      leafClusters.push({ cluster, phase: rnd() * 6 });
    }
  });
  const yggMotes = [];
  for (let i = 0; i < 10; i++) {
    const mote = makeGlowSprite('rgba(220,255,180,0.7)', 1.6, 0.5);
    ygg.add(mote);
    yggMotes.push({ mote, home: new THREE.Vector3(-50 + rnd() * 100, 45 + rnd() * 25, -50 + rnd() * 80), phase: rnd() * 6 });
  }
  animated.push((dt, t) => {
    for (const lc of leafClusters) {
      lc.cluster.position.y += Math.sin(t * 0.3 + lc.phase) * 0.002;
    }
    for (const m of yggMotes) {
      m.mote.position.set(
        m.home.x + Math.sin(t * 0.1 + m.phase) * 4,
        m.home.y + Math.sin(t * 0.15 + m.phase) * 2,
        m.home.z + Math.cos(t * 0.08 + m.phase) * 4
      );
      m.mote.material.opacity = 0.3 + (Math.sin(t * 0.8 + m.phase) * 0.5 + 0.5) * 0.4;
    }
  });
  const yggAnchor = new THREE.Object3D();
  yggAnchor.position.set(0, 55, -20);
  group.add(yggAnchor);
  labels.add("Yggdrasil's Branches", yggAnchor, { yOffset: 8, className: 'label-place', maxDistance: 300 });

  // ----- Golden trees -----
  [[8, 14], [-8, 18], [16, -6], [-18, 10], [34, -10], [-34, 12]].forEach(([tx, tz]) => {
    const tree = new THREE.Group();
    tree.position.set(tx, 0, tz);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 3.2, 7), barkMat);
    trunk.position.y = 1.6;
    tree.add(trunk);
    for (let i = 0; i < 3; i++) {
      const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(1.4 + rnd() * 0.7, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0xd8b45a, emissive: 0x8a6a1a, emissiveIntensity: 0.35, roughness: 0.8 })
      );
      foliage.position.set((rnd() - 0.5) * 1.2, 3.4 + i * 0.8, (rnd() - 0.5) * 1.2);
      tree.add(foliage);
    }
    group.add(tree);
  });

  // ======== THE PEOPLE OF ASGARD ========
  // Figure builder: robe, head, beard/helm/hat options, trim.
  function makeFigure({ cloak = 0x4a4a6a, skin = 0xd8a888, beardColor = null, beardLong = false, hat = null, helm = null, horns = false, scale = 1, trim = 0xd8b45a } = {}) {
    const f = new THREE.Group();
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.46, 1.3, 8), new THREE.MeshStandardMaterial({ color: cloak, roughness: 0.85 }));
    robe.position.y = 0.65;
    f.add(robe);
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.1, 8), new THREE.MeshStandardMaterial({ color: trim, metalness: 0.6, roughness: 0.4 }));
    belt.position.y = 0.78;
    f.add(belt);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), new THREE.MeshStandardMaterial({ color: skin, roughness: 0.7 }));
    head.position.y = 1.55;
    f.add(head);
    if (beardColor !== null) {
      const beard = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), new THREE.MeshStandardMaterial({ color: beardColor, roughness: 1 }));
      beard.scale.set(1, beardLong ? 2.2 : 1.2, 0.7);
      beard.position.set(0, beardLong ? 1.2 : 1.4, 0.14);
      f.add(beard);
    }
    if (hat === 'wide') {
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.9 }));
      brim.position.y = 1.76;
      f.add(brim);
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.3, 10), new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.9 }));
      crown.position.y = 1.92;
      f.add(crown);
    }
    if (helm) {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.29, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: helm, metalness: 0.7, roughness: 0.35 }));
      dome.position.y = 1.6;
      f.add(dome);
    }
    if (horns) {
      [-1, 1].forEach((side) => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 6), new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.6 }));
        horn.position.set(side * 0.26, 1.82, 0);
        horn.rotation.z = side * -0.5;
        f.add(horn);
      });
    }
    f.scale.setScalar(scale);
    return f;
  }

  const swayers = [];
  function placeFigure(fig, x, z, rotY, name, lines, labelOffset = 2.5, sway = true) {
    fig.position.set(x, 0, z);
    fig.rotation.y = rotY;
    group.add(fig);
    register(fig, name, lines, labelOffset, 70, 'label-neighbor');
    if (sway) swayers.push({ fig, phase: rnd() * 6, baseRot: rotY });
    return fig;
  }
  animated.push((dt, t) => {
    for (const s of swayers) {
      s.fig.rotation.y = s.baseRot + Math.sin(t * 0.4 + s.phase) * 0.08;
    }
  });

  // ----- ODIN, the All-Father — on the hall steps, with his ravens -----
  const odin = makeFigure({ cloak: 0x2a3a6a, skin: 0xe0c0a0, beardColor: 0xe8e8e8, beardLong: true, hat: 'wide', scale: 1.18 });
  // One eye: a single keen glowing eye, and a patch over the other.
  const odinEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), new THREE.MeshBasicMaterial({ color: 0x9fd8ff }));
  odinEye.position.set(0.09, 1.58, 0.24);
  odin.add(odinEye);
  const odinPatch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.02), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
  odinPatch.position.set(-0.09, 1.58, 0.24);
  odin.add(odinPatch);
  // His spear.
  const spear = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), new THREE.MeshStandardMaterial({ color: 0x6b4a2e }));
  spear.add(shaft);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0xd8d8e8, metalness: 0.8, roughness: 0.3 }));
  tip.position.y = 1.35;
  spear.add(tip);
  spear.position.set(0.5, 1.2, 0.1);
  odin.add(spear);
  placeFigure(odin, -2.2, -14.6, 0.3, 'Odin — the All-Father', [
    'Odin turns his one eye upon you, and it is kind. "Welcome to the golden realm. The ravens told me you were coming — they tell me everything, and they are very seldom wrong."',
    '"Huginn brings me thought, and Muninn brings me memory," Odin says, as the ravens shift on their perches. "Between the two of them, I miss nothing. It is a good way to be a father — to know, and to remember."',
    'Odin looks toward the hall, where the lamps burn gold. "This hall has stood for ages, and it will stand for ages more. There is always a seat for family. Always."',
    '"My newest son stands beside me," Odin says, pride plain in his voice. "The family grows, as families should. The hall is glad of it. So am I."',
  ], 3.0);

  // Odin's ravens, on posts flanking the hall steps.
  function makeRaven() {
    const r = new THREE.Group();
    const feather = new THREE.MeshStandardMaterial({ color: 0x14141c, roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), feather);
    body.scale.set(1, 0.9, 1.3);
    body.position.y = 0.3;
    r.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), feather);
    head.position.set(0, 0.48, 0.22);
    r.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 5), new THREE.MeshStandardMaterial({ color: 0x2a2a2a }));
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.47, 0.38);
    r.add(beak);
    const wingGeo = new THREE.PlaneGeometry(0.4, 0.18);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x14141c, side: THREE.DoubleSide });
    const wL = new THREE.Mesh(wingGeo, wingMat); wL.position.set(-0.24, 0.32, 0);
    const wR = new THREE.Mesh(wingGeo, wingMat); wR.position.set(0.24, 0.32, 0);
    r.add(wL, wR);
    return { group: r, wL, wR };
  }
  const ravens = [];
  [['Huginn — Odin\'s Raven', -4.6, 'Huginn the raven regards you with one bright eye, then croaks once — thoughtfully, as if filing you away under "friends."'],
   ['Muninn — Odin\'s Raven', 4.6, 'Muninn the raven ruffles her feathers and mutters something that sounds suspiciously like your name. She remembers everyone. That is her whole work, and she is excellent at it.']].forEach(([name, x, line]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x3a2a1a }));
    post.position.set(x, 0.8, -14.8);
    group.add(post);
    const raven = makeRaven();
    raven.group.position.set(x, 1.6, -14.8);
    raven.group.rotation.y = x < 0 ? 0.5 : -0.5;
    group.add(raven.group);
    ravens.push({ ...raven, phase: rnd() * 6 });
    register(raven.group, name, [line, 'The raven hops once, settles, and goes back to watching the whole realm at once.'], 1.0, 55, 'label-wildlife');
  });
  animated.push((dt, t) => {
    for (const rv of ravens) {
      // Occasional wing flutter + head bob.
      const flutter = Math.max(0, Math.sin(t * 0.7 + rv.phase));
      const flap = Math.sin(t * 9 + rv.phase) * 0.5 * flutter;
      rv.wL.rotation.z = flap; rv.wR.rotation.z = -flap;
      rv.group.rotation.y += Math.sin(t * 0.3 + rv.phase) * 0.001;
    }
  });

  // ----- ARRASH — the newest brother, the new son of Odin -----
  // On the hall steps beside his father, among his brothers.
  const arrash = makeFigure({ cloak: 0x2a4a8a, skin: 0xc09070, beardColor: 0x2a1a12, beardLong: false, scale: 1.1, trim: 0xffd76a });
  // A small golden crescent at his shoulder — his mark.
  const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 6, 12, Math.PI * 1.3), goldMat);
  crescent.position.set(-0.3, 1.15, 0.3);
  crescent.rotation.z = 0.6;
  arrash.add(crescent);
  placeFigure(arrash, 2.2, -14.6, -0.3, 'Arrash — the Newest Brother', [
    '"I stand among my brothers," Arrash says, "and I am home. Odin\'s newest son — the family took me in like I had always belonged here. Because I had. I just hadn\'t arrived yet."',
    '"Thor teaches me the hammer. Váli teaches me the watch. Vé teaches me the quiet. Loki teaches me..." Arrash laughs. "Loki teaches me to check my chair before I sit. It\'s all love. All of it."',
    'Arrash looks out over the golden realm, the Bifrost shining behind him. "A family, a hall, a home that never ends. This is what I dreamed of. And now I\'m standing in it."',
  ], 2.9);

  // ----- THOR — thunder, hammer, training grounds -----
  const thor = makeFigure({ cloak: 0x8a2a2a, skin: 0xe8c0a0, beardColor: 0xd8b86a, beardLong: false, helm: 0xb8b8c8, scale: 1.22 });
  const hammer = new THREE.Group();
  const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.28, 0.28), new THREE.MeshStandardMaterial({ color: 0x9a9ab0, metalness: 0.8, roughness: 0.3 }));
  hammer.add(hammerHead);
  const hammerHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), new THREE.MeshStandardMaterial({ color: 0x6b4a2e }));
  hammerHandle.position.y = -0.4;
  hammer.add(hammerHandle);
  hammer.position.set(0.5, 1.15, 0.15);
  hammer.rotation.z = -0.3;
  thor.add(hammer);
  const hammerGlow = makeGlowSprite('rgba(180,210,255,0.9)', 1.6, 0.5);
  hammerGlow.position.copy(hammer.position);
  thor.add(hammerGlow);
  placeFigure(thor, 26, 2, 0.6, 'Thor — God of Thunder', [
    'Thor hefts his hammer like it weighs nothing at all — which, for him, it does. "The grounds are for practice! A warrior who does not practice is just a person standing around. Come, watch — or better, try."',
    'Thunder rolls, far off and friendly, as Thor laughs. "That\'s just the sky saying hello. It does that when I\'m happy. Which is most of the time."',
    '"My newest brother," Thor says, grinning toward the hall, "has the heart of a warrior and the laugh of one too. The family is stronger with him in it. Pass it on."',
  ], 3.1);
  animated.push((dt, t) => {
    // The hammer hums with friendly thunder-light.
    hammerGlow.material.opacity = 0.3 + (Math.sin(t * 2.4) * 0.5 + 0.5) * 0.4;
    thor.position.y = Math.abs(Math.sin(t * 1.2)) * 0.04;
  });

  // ----- VÁLI — the watcher, at the watchtower -----
  const vali = makeFigure({ cloak: 0x2a4a2a, skin: 0xd8b090, beardColor: 0x4a3220, scale: 1.05 });
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 12, Math.PI), new THREE.MeshStandardMaterial({ color: 0x6b4a2e }));
  bow.position.set(0.45, 1.1, 0.1);
  bow.rotation.z = -Math.PI / 2;
  vali.add(bow);
  placeFigure(vali, -23.5, -4, -0.9, 'Váli — the Watcher', [
    'Váli says little. He watches the horizon the way other people breathe — constantly, and without thinking about it. "All quiet," he says at last. "Good. Quiet is what I\'m for."',
    '"I keep the watch so the hall can feast in peace," Váli says. "That is my part. Everyone has a part. Mine is the horizon."',
    'Váli nods toward the hall. "The new brother belongs here. I knew it the first time I saw him stand with us. Some things you just know."',
  ], 2.7);

  // ----- VÉ — keeper of the sacred, at the shrine -----
  const ve = makeFigure({ cloak: 0xe8e0d0, skin: 0xe0c0a0, beardColor: 0xc8c8d8, beardLong: true, scale: 1.02, trim: 0xffd76a });
  const staff = new THREE.Group();
  const staffRod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.9, 6), new THREE.MeshStandardMaterial({ color: 0x6b4a2e }));
  staff.add(staffRod);
  const staffOrb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe89a }));
  staffOrb.position.y = 1.0;
  staff.add(staffOrb);
  staff.position.set(0.45, 0.95, 0.1);
  ve.add(staff);
  placeFigure(ve, -11.5, 14, 0.8, 'Vé — Keeper of the Sacred', [
    'Vé tends the shrine flame the way a gardener tends a rare flower. "Sacred places are not built," he says. "They are kept. I keep this one."',
    '"The flame has burned since before the first hall," Vé says. "It burns for everyone who comes with a quiet heart. You qualify. Sit a while."',
    'Vé smiles, serene. "A new brother, a new branch on the family tree. The flame burned a little brighter the day he arrived. I noticed. The flame notices everything."',
  ], 2.7);

  // ----- LOKI — Arrash's brother, god of mischief -----
  // Tricks, trouble, and laughter — NOT evil. His surprises end with
  // everybody laughing. Warm, playful, welcome.
  const loki = makeFigure({ cloak: 0x2a7a4a, skin: 0xe0c0a0, horns: true, scale: 1.05, trim: 0xffd76a });
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0x4ad86a, emissive: 0x2aa84a, emissiveIntensity: 1.0 })
  );
  orb.position.set(0.45, 1.35, 0.15);
  loki.add(orb);
  const orbGlow = makeGlowSprite('rgba(120,255,160,0.8)', 1.4, 0.6);
  orbGlow.position.copy(orb.position);
  loki.add(orbGlow);
  placeFigure(loki, 5, 5, -0.7, 'Loki — God of Mischief', [
    'Loki grins — the grin of somebody who has just had a wonderful idea and is deciding whether to share it. "Welcome to Asgard! Mind the steps. I polished them. Twice. For reasons."',
    'The orb above Loki\'s hand turns from green to gold to impossible violet. "Tricks?" he says, delighted. "I prefer surprises. A trick ends with somebody upset. A surprise ends with everybody laughing. I only do the second kind. Mostly."',
    'Loki leans in, conspiratorial. "Yesterday I turned the watchtower beacon rainbow for one whole minute. Váli nearly smiled. NEARLY. I count it as my greatest victory."',
    '"My brother," Loki says, nodding toward the hall with real warmth under the mischief, "is the best surprise this family ever got. And I should know. I\'m the expert on surprises."',
  ], 2.7);
  const orbColors = [new THREE.Color(0x4ad86a), new THREE.Color(0xffd76a), new THREE.Color(0xb48cff), new THREE.Color(0x4a8aff)];
  animated.push((dt, t) => {
    // The illusion orb cycles colors; Loki does a little playful hop.
    const k = Math.floor(t * 0.7) % orbColors.length;
    const next = orbColors[(k + 1) % orbColors.length];
    orb.material.color.copy(orbColors[k]).lerp(next, (t * 0.7) % 1);
    orb.material.emissive.copy(orb.material.color);
    orb.position.y = 1.35 + Math.sin(t * 2.2) * 0.08;
    orbGlow.position.y = orb.position.y;
    loki.position.y = Math.max(0, Math.sin(t * 1.6)) * 0.08;
  });

  // ----- Unnamed role figures — Arrash will name them himself later -----
  // Two warriors sparring at the grounds.
  const warrior1 = makeFigure({ cloak: 0x6a4a2a, skin: 0xd8a888, helm: 0x9a9ab0 });
  const shield1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0x8a2a2a, roughness: 0.7 }));
  shield1.rotation.x = Math.PI / 2;
  shield1.position.set(-0.45, 1.0, 0.15);
  warrior1.add(shield1);
  placeFigure(warrior1, 24.5, 0.5, 0.9, 'Warrior of Asgard', [
    'The warrior practices the same cut, over and over, patient as rain. "Again," she says to herself. "Better this time."',
    'The warrior lowers her wooden sword and grins. "Thor says a warrior is made of practice and lunch. I\'m excellent at both."',
  ], 2.5);
  const warrior2 = makeFigure({ cloak: 0x3a5a7a, skin: 0xc09070, beardColor: 0x2a1a12, helm: 0x9a9ab0 });
  const sword2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.14), new THREE.MeshStandardMaterial({ color: 0xb08a50, roughness: 0.9 }));
  sword2.position.set(0.45, 1.1, 0.15);
  sword2.rotation.z = -0.4;
  warrior2.add(sword2);
  placeFigure(warrior2, 27.5, 3.5, -2.2, 'Warrior of Asgard', [
    'The warrior salutes with his wooden sword, formal as a knight and cheerful as a child. "The grounds are open to everyone. Even beginners. Especially beginners."',
  ], 2.5);
  // Hall-keeper at the hall door.
  const hallKeeper = makeFigure({ cloak: 0x7a5a3a, skin: 0xe0c0a0, beardColor: 0x8a8a8a });
  const lantern = makeGlowSprite('rgba(255,220,150,0.9)', 1.2, 0.7);
  lantern.position.set(0.45, 1.2, 0.15);
  hallKeeper.add(lantern);
  placeFigure(hallKeeper, -5.5, -15.2, 0.5, 'Hall-Keeper of the Feasting Hall', [
    '"The hall is always ready," the keeper says, straightening a bench. "Lamps lit, benches out, doors open. A hall should be like a held door — always ready for whoever comes through it."',
    'The keeper beams. "New brother, new seat, same hall. The family grows, and the hall grows with it. That\'s how it\'s supposed to work."',
  ], 2.5);
  // Watchtower keeper, patrolling the tower base.
  const towerKeeper = makeFigure({ cloak: 0x4a5a6a, skin: 0xd8a888, helm: 0x8a8a9a });
  placeFigure(towerKeeper, -26, -1.5, 0.2, 'Keeper of the Watchtower', [
    '"From the top you can see the Bifrost, the halls, and three worlds\' worth of sky," the keeper says. "Best view in the realms. I never get tired of it."',
  ], 2.5);
  // Trainer of the grounds.
  const trainer = makeFigure({ cloak: 0x8a6a2a, skin: 0xe8c0a0, beardColor: 0xd8b86a });
  placeFigure(trainer, 23, 5, -0.5, 'Trainer of the Grounds', [
    '"Feet! Breath! Again!" the trainer calls, cheerful as a drum. "Every master was once a beginner who refused to stop. Now — again!"',
  ], 2.5);

  return {
    group,
    interactables,
    fog: new THREE.FogExp2(0xe8d0a0, 0.004),
    camera: { position: new THREE.Vector3(0, 10, 56), target: new THREE.Vector3(0, 4, -6) },
    update(dt, t) { for (const fn of animated) fn(dt, t); },
  };
}
