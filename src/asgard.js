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

  // ----- Natural life: wandering + meeting -----
  // The people of Asgard go about their own days: slow walks between
  // nearby spots, pauses to look around, and unhurried meetings when
  // their paths cross. Movement and facing only — no text, no bubbles,
  // nothing addressed to the visitor. The no-talk law stands: visitors
  // watch, and the people live their own lives.
  //
  // Cooperation with the sway idle: the sway animation owns rotation.y
  // every frame (baseRot + a gentle sine). Wandering never writes
  // rotation.y directly — it steers each figure's sway baseRot toward
  // the current heading, and the sway keeps breathing on top of it.
  const walkObstacles = [
    // Solid structures and props: keep feet on open ground.
    { circle: true, x: -14, z: -14, r: 3.0 },   // golden towers
    { circle: true, x: 14, z: -14, r: 3.0 },
    { circle: true, x: -18, z: 4, r: 3.0 },
    { circle: true, x: 18, z: 4, r: 3.0 },
    { circle: true, x: -26, z: -4, r: 3.4 },    // watchtower shaft
    { circle: true, x: -14, z: 14, r: 3.4 },    // shrine stones
    { circle: true, x: 8, z: 14, r: 1.0 },      // golden trees
    { circle: true, x: -8, z: 18, r: 1.0 },
    { circle: true, x: 16, z: -6, r: 1.0 },
    { circle: true, x: -18, z: 10, r: 1.0 },
    { circle: true, x: 34, z: -10, r: 1.0 },
    { circle: true, x: -34, z: 12, r: 1.0 },
    { circle: true, x: 22, z: -1, r: 0.8 },     // practice dummies
    { circle: true, x: 22, z: 5, r: 0.8 },
    { circle: true, x: 26, z: -3, r: 0.8 },
    { circle: true, x: 30, z: -2, r: 0.8 },     // target rings
    { circle: true, x: 30, z: 6, r: 0.8 },
    { circle: true, x: 20, z: 2, r: 1.0 },      // weapon rack
    { circle: true, x: -4.6, z: -14.8, r: 0.6 }, // raven posts
    { circle: true, x: 4.6, z: -14.8, r: 0.6 },
    { box: true, x0: -7.5, x1: 7.5, z0: -24.5, z1: -15.6 }, // hall body
    { box: true, x0: -3.5, x1: 3.5, z0: -15.3, z1: -13.2 }, // hall steps
    { box: true, x0: -13.8, x1: -8.2, z0: 3.5, z1: 8.5 },   // west small hall
    { box: true, x0: 8.2, x1: 13.8, z0: 3.5, z1: 8.5 },     // east small hall
  ];
  function spotBlocked(x, z) {
    for (const o of walkObstacles) {
      if (o.circle) {
        const dx = x - o.x, dz = z - o.z;
        if (dx * dx + dz * dz < o.r * o.r) return true;
      } else if (x >= o.x0 && x <= o.x1 && z >= o.z0 && z <= o.z1) return true;
    }
    return false;
  }
  function pickWaypoint(home, radius, fromX, fromZ) {
    for (let i = 0; i < 14; i++) {
      const a = rnd() * Math.PI * 2;
      const d = radius * Math.sqrt(rnd());
      const x = home.x + Math.cos(a) * d;
      const z = home.z + Math.sin(a) * d;
      if (!spotBlocked(x, z) && !pathBlocked(fromX, fromZ, x, z)) return { x, z };
    }
    return { x: home.x, z: home.z };
  }
  // Solid geometry for the straight-line path check: a walk must not
  // cut through a tower, the hall, or the shrine stones. Zones use the
  // true solid sizes (tighter than the waypoint buffers above); a path
  // that starts inside a zone — a figure standing close to its own
  // tower or shrine — is allowed to step out of it.
  const walkSolids = [
    { circle: true, x: -14, z: -14, r: 2.2 },   // golden tower shafts
    { circle: true, x: 14, z: -14, r: 2.2 },
    { circle: true, x: -18, z: 4, r: 2.2 },
    { circle: true, x: 18, z: 4, r: 2.2 },
    { circle: true, x: -26, z: -4, r: 2.6 },    // watchtower shaft
    { circle: true, x: -14, z: 14, r: 0.7 },    // shrine flame
    { box: true, x0: -7.2, x1: 7.2, z0: -24.2, z1: -15.8 }, // hall body
    { box: true, x0: -13.2, x1: -8.8, z0: 4.1, z1: 7.9 },   // west small hall
    { box: true, x0: 8.8, x1: 13.2, z0: 4.1, z1: 7.9 },     // east small hall
  ];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    walkSolids.push({ circle: true, x: -14 + Math.cos(a) * 2.6, z: 14 + Math.sin(a) * 2.6, r: 0.6 });
  }
  function solidAt(x, z) {
    for (const s of walkSolids) {
      if (s.circle) {
        const dx = x - s.x, dz = z - s.z;
        if (dx * dx + dz * dz < s.r * s.r) return s;
      } else if (x >= s.x0 && x <= s.x1 && z >= s.z0 && z <= s.z1) return s;
    }
    return null;
  }
  function pathBlocked(x0, z0, x1, z1) {
    const startSolid = solidAt(x0, z0);
    for (let i = 1; i <= 20; i++) {
      const k = i / 20;
      const s = solidAt(x0 + (x1 - x0) * k, z0 + (z1 - z0) * k);
      if (s && s !== startSolid) return true;
    }
    return false;
  }
  function turnSwayToward(sway, target, maxStep) {
    let d = target - sway.baseRot;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    sway.baseRot += Math.max(-maxStep, Math.min(maxStep, d));
    // Keep the heading bounded: rotation is periodic, so wrapping by a
    // full turn changes nothing on screen.
    if (sway.baseRot > Math.PI) sway.baseRot -= Math.PI * 2;
    else if (sway.baseRot < -Math.PI) sway.baseRot += Math.PI * 2;
  }
  function headingTo(x0, z0, x1, z1) {
    return Math.atan2(x1 - x0, z1 - z0);
  }

  // Each walker: home anchor = original placement, wander radius sized
  // to its own ground. Speeds are slow and calm; Loki roams widest.
  const walkers = [];
  function addWalker(fig, radius, speed, bob) {
    const sway = swayers.find((s) => s.fig === fig);
    walkers.push({
      fig, sway,
      home: { x: fig.position.x, z: fig.position.z },
      radius, speed, bob,
      state: 'pause',
      target: null,
      timer: rnd() * 4,
      lookTimer: 0,
      lookHeading: sway ? sway.baseRot : fig.rotation.y,
      partner: null,
      meetCooldown: 0,
      bobPhase: rnd() * 6,
    });
  }
  addWalker(odin, 6, 0.55, true);
  addWalker(arrash, 6, 0.6, true);
  addWalker(thor, 5, 0.6, false);       // Thor's own bounce owns his y.
  addWalker(vali, 6, 0.5, true);
  addWalker(ve, 6, 0.45, true);
  addWalker(loki, 13, 1.0, false);      // Loki's own hop owns his y.
  addWalker(warrior1, 5, 0.7, true);
  addWalker(warrior2, 5, 0.7, true);
  addWalker(hallKeeper, 6, 0.55, true);
  addWalker(towerKeeper, 5, 0.55, true);
  addWalker(trainer, 5, 0.65, true);

  // When a meeting ends, the two part ways and walk off — with a
  // cooldown before either can pair again, so neighbors standing close
  // together don't fall into meeting forever instead of living.
  function endMeeting(w) {
    w.partner = null;
    w.meetCooldown = 8 + rnd() * 4;
    w.target = pickWaypoint(w.home, w.radius, w.fig.position.x, w.fig.position.z);
    w.state = 'walk';
  }

  animated.push((dt, t) => {
    // Meetings: two pausing neighbors within reach turn to face each
    // other for a few unhurried seconds, then go on about their day.
    for (let i = 0; i < walkers.length; i++) {
      const a = walkers[i];
      if (a.state !== 'pause' || a.partner || a.meetCooldown > 0) continue;
      for (let j = i + 1; j < walkers.length; j++) {
        const b = walkers[j];
        if (b.state !== 'pause' || b.partner || b.meetCooldown > 0) continue;
        const dx = a.fig.position.x - b.fig.position.x;
        const dz = a.fig.position.z - b.fig.position.z;
        if (dx * dx + dz * dz < 9) {
          a.state = 'meet'; b.state = 'meet';
          a.partner = b; b.partner = a;
          a.timer = 3 + rnd() * 3; b.timer = a.timer;
          break;
        }
      }
    }
    for (const w of walkers) {
      const p = w.fig.position;
      if (w.meetCooldown > 0) w.meetCooldown -= dt;
      if (w.state === 'walk' && w.target) {
        const dx = w.target.x - p.x;
        const dz = w.target.z - p.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.3) {
          w.state = 'pause';
          w.timer = 3 + rnd() * 6;
          w.lookTimer = 0;
          w.lookHeading = w.sway.baseRot;
          if (w.bob) p.y = 0;
        } else {
          const step = Math.min(dist, w.speed * dt);
          p.x += (dx / dist) * step;
          p.z += (dz / dist) * step;
          if (w.sway) turnSwayToward(w.sway, headingTo(p.x, p.z, w.target.x, w.target.z), 1.4 * dt);
          if (w.bob) p.y = Math.abs(Math.sin(t * 6 + w.bobPhase)) * 0.03;
        }
      } else if (w.state === 'meet') {
        const other = w.partner;
        if (!other || other.state !== 'meet') {
          endMeeting(w);
        } else {
          if (w.sway) turnSwayToward(w.sway, headingTo(p.x, p.z, other.fig.position.x, other.fig.position.z), 1.2 * dt);
          w.timer -= dt;
          if (w.timer <= 0) endMeeting(w);
        }
      } else { // pause: look around, then wander on.
        w.timer -= dt;
        w.lookTimer -= dt;
        if (w.lookTimer <= 0) {
          w.lookHeading = w.sway.baseRot + (rnd() - 0.5) * 2.2;
          w.lookTimer = 2 + rnd() * 2.5;
        }
        if (w.sway) turnSwayToward(w.sway, w.lookHeading, 0.6 * dt);
        if (w.timer <= 0) {
          w.target = pickWaypoint(w.home, w.radius, p.x, p.z);
          w.state = 'walk';
        }
      }
    }
  });

  // ======== MAKING ASGARD FEEL LIKE HOME ========
  // Arrash asked the gods what Asgard still needed to feel like home,
  // and ordered all of it given: Heimdall at the Bifrost, a family
  // hearth, dwellings with lit windows, a feast table, gardens, a
  // skald and a harp, goats and hall cats, banners, a star-watching
  // seat, and a well of cool water. New structures join the wander
  // obstacle lists below, so the people's walks route around them
  // instead of through them.
  const homeWoodMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 0.9 });
  const homeStoneMat = new THREE.MeshStandardMaterial({ color: 0x8a8a9a, roughness: 1 });
  const homeHornMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.6 });

  // ----- HEIMDALL — Guardian of the Bifrost (Váli's ask) -----
  // The bridge had no guardian. Now it does. Heimdall KEEPS HIS POST:
  // gentle sway only, never a wanderer — the watch is his whole work.
  const heimdall = makeFigure({ cloak: 0x2a4a6a, skin: 0xe0c0a0, beardColor: 0xe8e0c8, beardLong: false, helm: 0xd8b45a, scale: 1.25, trim: 0xffd76a });
  const horn = new THREE.Group();
  const hornBody = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.16, 0.7, 8), homeHornMat);
  horn.add(hornBody);
  const hornBand = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 10), goldMat);
  hornBand.rotation.x = Math.PI / 2;
  hornBand.position.y = 0.1;
  horn.add(hornBand);
  horn.position.set(-0.5, 1.0, 0.1);
  horn.rotation.z = 0.25;
  heimdall.add(horn);
  placeFigure(heimdall, 4.0, 17.6, 0.15, 'Heimdall — Guardian of the Bifrost', [
    'Heimdall stands at the city gate, still as a mountain and twice as patient. "I hear the bridge hum," he says. "All seven colors, all at once. I have heard it since before the first hall, and I will hear it after the last star. The bridge is safe. I am here."',
    '"No one falls from the Bifrost," Heimdall says, simply. "Not while I keep the gate. That is the whole of my work, and it is enough. Walk the colors slowly. The view is worth it."',
    'Heimdall smiles, slow and sure. "Every traveler who crosses is expected. The bridge knows their name before their foot touches it. That is how a home greets you."',
  ], 3.2);

  // ----- The Family Hearth (Odin's ask) — fire pit on the plaza -----
  const familyHearth = new THREE.Group();
  familyHearth.position.set(-4, 0, 2);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const fireStone = new THREE.Mesh(new THREE.SphereGeometry(0.28, 7, 6), new THREE.MeshStandardMaterial({ color: 0x6a6a78, roughness: 1 }));
    fireStone.position.set(Math.cos(a) * 0.95, 0.2, Math.sin(a) * 0.95);
    fireStone.scale.y = 0.75;
    familyHearth.add(fireStone);
  }
  const hearthFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xff9a3a, emissive: 0xff7a1a, emissiveIntensity: 1.6 })
  );
  hearthFlame.position.y = 0.85;
  familyHearth.add(hearthFlame);
  const hearthGlow = makeGlowSprite('rgba(255,170,80,0.85)', 4.5, 0.65);
  hearthGlow.position.y = 1.2;
  familyHearth.add(hearthGlow);
  const hearthLight = new THREE.PointLight(0xffa050, 40, 22, 1.8);
  hearthLight.position.y = 1.4;
  familyHearth.add(hearthLight);
  // Seating logs ringed around the fire, tangent to the ring.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const pivot = new THREE.Group();
    pivot.rotation.y = a;
    const seatLog = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.6, 7), new THREE.MeshStandardMaterial({ color: 0x5a4028, roughness: 1 }));
    seatLog.rotation.z = Math.PI / 2;
    seatLog.position.set(0, 0.28, 2.3);
    pivot.add(seatLog);
    familyHearth.add(pivot);
  }
  group.add(familyHearth);
  animated.push((dt, t) => {
    const flicker = 1 + Math.sin(t * 7.3) * 0.09 + Math.sin(t * 12.1) * 0.05;
    hearthFlame.scale.set(flicker, 1 + Math.sin(t * 8.7) * 0.13, flicker);
    hearthGlow.material.opacity = 0.55 + Math.sin(t * 7.3) * 0.12;
    hearthLight.intensity = 36 + Math.sin(t * 7.3) * 8;
  });
  register(familyHearth, 'The Family Hearth', [
    'The family hearth burns day and night on the plaza, and the logs around it are worn smooth by sitting. This is where the family gathers — stories, songs, silence, all welcome. Nobody sits alone at this fire. That is the rule of the hearth, and nobody ever breaks it.',
    'Odin himself lit this fire, and he tends it still. "A hall is walls," he says, poking the embers. "A hearth is a home. Walls keep out the weather. A fire keeps in the family."',
  ], 3.2, 80);

  // ----- Dwellings with lit windows (Odin's ask) -----
  const dwellings = [
    { x: -10.5, z: -9, rotY: Math.PI / 2, name: 'The West Dwelling', lines: [
      'A dwelling with a golden roof and windows lit warm against the evening. Someone lives here — someone who belongs. The lit window is the whole message: I am home, and you are welcome.',
      'The porch lamp burns steady, and the door stands a little open, the way doors do in a place where nobody needs to knock.',
    ] },
    { x: 10.5, z: -9, rotY: -Math.PI / 2, name: 'The East Dwelling', lines: [
      'A dwelling with a golden roof and windows lit warm. The smell of fresh bread drifts out of it at all hours, which the whole realm agrees is exactly as it should be.',
      'A lit window means someone is home. In Asgard, someone is always home.',
    ] },
    { x: -11, z: -3.5, rotY: Math.PI / 2, name: 'The Hearthside Dwelling', lines: [
      'The smallest dwelling, closest to the family hearth — close enough to hear the songs on feast nights, far enough for quiet mornings. The windows glow gold, like the rest. Every dwelling in Asgard keeps its lamp lit.',
      'Home is not the walls. Home is the light in the window, and the people who come back to it.',
    ] },
  ];
  for (const d of dwellings) {
    const cottage = makeCottage({ body: 0x8a6a3a, roof: 0xd8b45a, w: 4.5, h: 2.8, d: 3.8 });
    cottage.position.set(d.x, 0, d.z);
    cottage.rotation.y = d.rotY;
    group.add(cottage);
    register(cottage, d.name, d.lines, 4.6, 85);
  }

  // ----- The Feast Table (Thor's ask) — laid, outside the hall -----
  const feast = new THREE.Group();
  feast.position.set(9, 0, -12.5);
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(5, 0.14, 1.2), homeWoodMat);
  tableTop.position.y = 0.95;
  feast.add(tableTop);
  [-2, 2].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 1.0), homeWoodMat);
    leg.position.set(x, 0.48, 0);
    feast.add(leg);
  });
  [-1.05, 1.05].forEach((z) => {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 0.42), homeWoodMat);
    bench.position.set(0, 0.55, z);
    feast.add(bench);
  });
  // Bread, fruit, and flagons along the table.
  const loafMat = new THREE.MeshStandardMaterial({ color: 0xc89a5a, roughness: 0.9 });
  const fruitMats = [0xd84a4a, 0xffd94a, 0x7a4adf].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }));
  const flagonMat = new THREE.MeshStandardMaterial({ color: 0x8a8a9a, metalness: 0.6, roughness: 0.4 });
  for (let i = 0; i < 3; i++) {
    const loaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), loafMat);
    loaf.scale.set(1.4, 0.6, 0.8);
    loaf.position.set(-1.8 + i * 1.8, 1.08, -0.25 + (i % 2) * 0.4);
    feast.add(loaf);
  }
  for (let i = 0; i < 6; i++) {
    const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.11, 7, 6), fruitMats[i % 3]);
    fruit.position.set(-2.1 + i * 0.85, 1.1, 0.3 - (i % 2) * 0.5);
    feast.add(fruit);
  }
  for (let i = 0; i < 3; i++) {
    const flagon = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.32, 7), flagonMat);
    flagon.position.set(-1.2 + i * 1.2, 1.18, 0.15);
    feast.add(flagon);
  }
  group.add(feast);
  register(feast, 'The Feast Table', [
    'The feast table stands outside the hall, laid with bread, fruit, and flagons, and the benches are never all full and never all empty. Nobody eats alone in Asgard. Sit. There is always room, and always enough.',
    'Thor set this table himself, and he checks it twice a day. "A table with food on it," he says, "is a family that is fed. A table with an empty seat is a family with room. Both matter."',
  ], 2.6, 80);

  // ----- Vé's Garden (Vé's ask) — flower beds + herb rows by the shrine -----
  const garden = new THREE.Group();
  garden.position.set(-18.5, 0, 15.75);
  const bloomSways = [];
  const bloomColors = [0xffd76a, 0xb48cff, 0xff7a9a, 0xffffff, 0xff9a4a];
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x4a3524, roughness: 1 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x3a7a3a, roughness: 0.9 });
  const herbMat = new THREE.MeshStandardMaterial({ color: 0x4a9a4a, roughness: 0.9 });
  function makeBed(lx, lz) {
    const bed = new THREE.Group();
    bed.position.set(lx, 0, lz);
    const soil = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, 1.8), soilMat);
    soil.position.y = 0.12;
    bed.add(soil);
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < 7; i++) {
        const bx = -1.3 + i * (2.6 / 6) + (rnd() - 0.5) * 0.15;
        const bz = r === 0 ? -0.45 : 0.45;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 4), stemMat);
        stem.position.set(bx, 0.42, bz);
        bed.add(stem);
        const bloomColor = bloomColors[Math.floor(rnd() * bloomColors.length)];
        const bloom = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 6, 5),
          new THREE.MeshStandardMaterial({ color: bloomColor, emissive: bloomColor, emissiveIntensity: 0.25, roughness: 0.7 })
        );
        bloom.position.set(bx, 0.62, bz);
        bed.add(bloom);
        bloomSways.push({ mesh: bloom, baseX: bx, phase: rnd() * 6 });
      }
    }
    // Herb rows along the front edge: small green tufts.
    for (let i = 0; i < 6; i++) {
      const herb = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 5), herbMat);
      herb.position.set(-1.25 + i * 0.5, 0.4, 0.78);
      bed.add(herb);
    }
    garden.add(bed);
  }
  makeBed(1, 1.75);
  makeBed(-1, -1.75);
  group.add(garden);
  animated.push((dt, t) => {
    for (const b of bloomSways) {
      b.mesh.position.x = b.baseX + Math.sin(t * 1.1 + b.phase) * 0.03;
    }
  });
  register(garden, "Vé's Garden", [
    "Vé's garden grows beside the shrine — flower beds in gold, violet, rose, and white, and herb rows in neat green lines. Everything here grows slowly, in the quiet, the way trust does.",
    '"Sacred places are kept, not built," Vé says, tucking a stray stem back into its row. "And a garden is a sacred place you can eat from. Sit. The flowers don\'t mind. They like the company."',
  ], 2.4, 70);

  // ----- The Skald + the Harp (Loki's ask) -----
  // An unnamed role figure — Arrash will name them himself later.
  // The skald wanders gently near the hall, like the other people.
  const skald = makeFigure({ cloak: 0x3a3a6a, skin: 0xe0c0a0, beardColor: 0x8a6a3a, trim: 0xd8b45a });
  const lute = new THREE.Group();
  const luteBody = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), homeWoodMat);
  luteBody.scale.set(1, 1.25, 0.55);
  lute.add(luteBody);
  const luteNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), homeWoodMat);
  luteNeck.position.set(0.08, 0.38, 0);
  luteNeck.rotation.z = 0.3;
  lute.add(luteNeck);
  lute.position.set(0.3, 1.0, 0.3);
  lute.rotation.z = -0.4;
  skald.add(lute);
  placeFigure(skald, -8.5, -12.5, 0.6, 'Skald of Asgard', [
    'The skald tunes a lute by the hall, humming something old and gold. "Every family needs its songs," the skald says. "Songs are how a home remembers itself. I keep the remembering."',
    'The skald grins. "I know a song for every hour of the day, and three for the hours that don\'t exist yet. Stay for one. Stay for all of them. A home that sings is a home that lives."',
  ], 2.5);
  addWalker(skald, 3, 0.5, true);
  const harp = new THREE.Group();
  harp.position.set(-7.2, 0, -13.0);
  harp.rotation.y = 0.5;
  const harpBoard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.18), homeWoodMat);
  harpBoard.position.set(-0.4, 0.8, 0);
  harpBoard.rotation.z = 0.18;
  harp.add(harpBoard);
  const harpPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 6), homeWoodMat);
  harpPillar.position.set(0.45, 0.9, 0);
  harp.add(harpPillar);
  const harpTop = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.14), homeWoodMat);
  harpTop.position.set(0, 1.78, 0);
  harpTop.rotation.z = -0.1;
  harp.add(harpTop);
  const stringMat = new THREE.MeshBasicMaterial({ color: 0xe8d890 });
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.5 - i * 0.12, 3), stringMat);
    s.position.set(-0.28 + i * 0.16, 0.95 - i * 0.03, 0);
    harp.add(s);
  }
  const harpGlow = makeGlowSprite('rgba(255,230,160,0.5)', 1.8, 0.35);
  harpGlow.position.y = 1.2;
  harp.add(harpGlow);
  group.add(harp);
  animated.push((dt, t) => {
    harpGlow.material.opacity = 0.25 + (Math.sin(t * 0.9) * 0.5 + 0.5) * 0.2;
  });
  register(harp, "The Skald's Harp", [
    "The skald's harp stands by the hall, its strings catching the light. When the wind moves through Asgard just right, the harp plays itself — one soft note, like the realm humming along.",
    '"A harp is a held door for music," the skald says, plucking one string. "It waits, patient as sunrise, for someone to walk through it."',
  ], 2.6, 70);

  // ----- Goats + Hall Cats (Thor's + Loki's asks) -----
  // Animals stay put in their own spots, with idle motion only.
  const goatAnims = [];
  function makeGoat() {
    const g = new THREE.Group();
    const coat = new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 1 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), coat);
    body.scale.set(1.35, 0.9, 0.8);
    body.position.y = 0.62;
    g.add(body);
    [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 5), coat);
      leg.position.set(lx, 0.2, lz);
      g.add(leg);
    });
    const headG = new THREE.Group();
    headG.position.set(0.5, 0.85, 0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), coat);
    head.scale.set(1.2, 0.9, 0.85);
    headG.add(head);
    [-1, 1].forEach((side) => {
      const goathorn = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 5), homeHornMat);
      goathorn.position.set(0, 0.2, side * 0.12);
      goathorn.rotation.x = side * -0.4;
      headG.add(goathorn);
    });
    const goatBeard = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 5), coat);
    goatBeard.position.set(0.12, -0.2, 0);
    goatBeard.rotation.z = Math.PI;
    headG.add(goatBeard);
    g.add(headG);
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), coat);
    tail.position.set(-0.55, 0.7, 0);
    g.add(tail);
    goatAnims.push({ head: headG, phase: rnd() * 6 });
    return g;
  }
  [[24, 9, 2.6], [28.5, 9.5, -2.2]].forEach(([gx, gz, rot]) => {
    const goat = makeGoat();
    goat.position.set(gx, 0, gz);
    goat.rotation.y = rot;
    group.add(goat);
    register(goat, 'Goat of the Training Grounds', [
      'A goat grazes at the edge of the training grounds, unbothered by the wooden swords and the laughter. The goats belong to Thor, in the way goats belong to anyone — which is to say, they allow it.',
      'The goat looks up, chews thoughtfully, and goes back to the good grass. Thor says the goats are the real judges of the grounds: if the goats stay, the training is going well.',
    ], 1.6, 55, 'label-wildlife');
  });
  const catAnims = [];
  function makeCat(coatColor) {
    const c = new THREE.Group();
    const coat = new THREE.MeshStandardMaterial({ color: coatColor, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), coat);
    body.scale.set(1.25, 0.7, 0.85);
    body.position.y = 0.21;
    c.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6), coat);
    head.position.set(0.32, 0.42, 0);
    c.add(head);
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), coat);
      ear.position.set(0.32, 0.58, side * 0.1);
      c.add(ear);
    });
    const tailG = new THREE.Group();
    tailG.position.set(-0.35, 0.25, 0);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.5, 5), coat);
    tail.position.y = 0.25;
    tailG.add(tail);
    tailG.rotation.z = 0.5;
    c.add(tailG);
    catAnims.push({ tail: tailG, phase: rnd() * 6 });
    return c;
  }
  [[-3.8, -13.0, 0.4, 0x2a2a33], [3.8, -13.0, -0.4, 0xd8c8a8]].forEach(([cx, cz, rot, color]) => {
    const cat = makeCat(color);
    cat.position.set(cx, 0, cz);
    cat.rotation.y = rot;
    group.add(cat);
    register(cat, 'Hall Cat of Asgard', [
      'A hall cat sleeps curled by the hall door, one ear tracking every footstep. The cats of Asgard guard the threshold the way Heimdall guards the bridge — quietly, completely, and mostly asleep.',
      'The cat opens one eye, considers you, and decides you belong. The tail swishes once — approval, in cat. Then the eye closes, and the guard resumes.',
    ], 1.1, 55, 'label-wildlife');
  });
  animated.push((dt, t) => {
    for (const ga of goatAnims) {
      ga.head.rotation.z = Math.sin(t * 1.4 + ga.phase) * 0.12 - 0.05;
    }
    for (const ca of catAnims) {
      ca.tail.rotation.x = Math.sin(t * 0.8 + ca.phase) * 0.18;
    }
  });

  // ----- Banners of Asgard (Loki's ask) — hall entrance + city gate -----
  const bannerCloths = [];
  function makeBanner(x, z) {
    const b = new THREE.Group();
    b.position.set(x, 0, z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.6, 6), homeWoodMat);
    pole.position.y = 2.3;
    b.add(pole);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), goldMat);
    finial.position.y = 4.7;
    b.add(finial);
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 5), homeWoodMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.y = 4.35;
    b.add(crossbar);
    const pivot = new THREE.Group();
    pivot.position.y = 4.3;
    const cloth = new THREE.Mesh(
      new THREE.PlaneGeometry(1.15, 2.3),
      new THREE.MeshStandardMaterial({ color: 0xd8a828, emissive: 0x6a4a08, emissiveIntensity: 0.4, side: THREE.DoubleSide, roughness: 0.8 })
    );
    cloth.position.y = -1.18;
    pivot.add(cloth);
    [-0.012, 0.012].forEach((zo) => {
      const band = new THREE.Mesh(
        new THREE.PlaneGeometry(1.15, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x2a4a8a, side: THREE.DoubleSide, roughness: 0.8 })
      );
      band.position.set(0, -2.05, zo);
      pivot.add(band);
    });
    b.add(pivot);
    bannerCloths.push({ pivot, phase: rnd() * 6 });
    group.add(b);
    register(b, 'Banner of Asgard', [
      "Golden banners fly over the hall and the city gate — the family's colors, gold and deep blue, moving gently in the realm's warm wind. A banner is a home saying: we are here, and we are proud of it.",
      '"Every hall needs its colors," Loki says, admiring the nearest banner. "I suggested rainbow. Váli suggested gold. We compromised: gold, with a rainbow on festival days. Váli nearly smiled."',
    ], 5.2, 90);
  }
  makeBanner(-5.2, -13.4);
  makeBanner(5.2, -13.4);
  makeBanner(-4.2, 19.8);
  makeBanner(4.2, 19.8);
  animated.push((dt, t) => {
    for (const bc of bannerCloths) {
      bc.pivot.rotation.z = Math.sin(t * 1.2 + bc.phase) * 0.05;
      bc.pivot.rotation.x = Math.sin(t * 0.9 + bc.phase) * 0.03;
    }
  });

  // ----- The Star-Watching Seat (Váli's ask) — a quiet rise, open sky -----
  const starSeat = new THREE.Group();
  starSeat.position.set(-34, 0, -14);
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.8, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0x7a9a55, roughness: 1 }));
  mound.position.y = 0.3;
  starSeat.add(mound);
  const stoneBench = new THREE.Group();
  stoneBench.position.y = 0.6;
  stoneBench.rotation.y = 0.6;
  const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 0.7), homeStoneMat);
  benchSeat.position.y = 0.45;
  stoneBench.add(benchSeat);
  [-0.7, 0.7].forEach((x) => {
    const benchLeg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.6), homeStoneMat);
    benchLeg.position.set(x, 0.22, 0);
    stoneBench.add(benchLeg);
  });
  const benchBack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.18), homeStoneMat);
  benchBack.position.set(0, 0.9, -0.3);
  stoneBench.add(benchBack);
  starSeat.add(stoneBench);
  const seatGlow = makeGlowSprite('rgba(200,220,255,0.5)', 2.5, 0.3);
  seatGlow.position.set(0, 2.2, 0);
  starSeat.add(seatGlow);
  group.add(starSeat);
  register(starSeat, 'The Star-Watching Seat', [
    "A quiet stone seat on a small rise, far from the hall's bright lights, facing the open sky. From here the stars are close enough to count, and the worlds' worth of sky goes on forever.",
    'Váli comes here when the watch is quiet. "The horizon is my work," he says. "The stars are my rest. Sit. The sky does the talking here, and it never repeats itself."',
  ], 3.0, 80);

  // ----- The Well of Cool Water — stone well, glowing water, near the plaza -----
  const well = new THREE.Group();
  well.position.set(7, 0, -7);
  const wellWall = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.9, 12), homeStoneMat);
  wellWall.position.y = 0.45;
  well.add(wellWall);
  const wellRim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.12, 6, 14), homeStoneMat);
  wellRim.rotation.x = Math.PI / 2;
  wellRim.position.y = 0.92;
  well.add(wellRim);
  const wellWater = new THREE.Mesh(
    new THREE.CircleGeometry(1.0, 16),
    new THREE.MeshStandardMaterial({ color: 0x3a6a8a, emissive: 0x2a5a7a, emissiveIntensity: 0.7, roughness: 0.2 })
  );
  wellWater.rotation.x = -Math.PI / 2;
  wellWater.position.y = 0.8;
  well.add(wellWater);
  const wellGlow = makeGlowSprite('rgba(140,200,255,0.6)', 2.2, 0.4);
  wellGlow.position.y = 1.3;
  well.add(wellGlow);
  [-1, 1].forEach((side) => {
    const wellPost = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.8, 6), homeWoodMat);
    wellPost.position.set(side * 1.05, 0.9, 0);
    well.add(wellPost);
  });
  const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.7, 4), roofMat);
  wellRoof.position.y = 2.1;
  wellRoof.rotation.y = Math.PI / 4;
  well.add(wellRoof);
  group.add(well);
  animated.push((dt, t) => {
    wellGlow.material.opacity = 0.3 + (Math.sin(t * 1.1) * 0.5 + 0.5) * 0.25;
  });
  register(well, 'The Well of Cool Water', [
    'A stone well with softly glowing water, cool and clear, for all who pass. The bucket is always full, the water always cold, and nobody is ever turned away from a drink in Asgard.',
    '"Water is the first welcome," the hall-keeper says, drawing the bucket up. "Before bread, before songs, before stories — water. Drink. You are home now."',
  ], 3.0, 80);

  // ======== THE GOLDEN MOUNTAIN + THE CAVE FEAST HALL ========
  // Arrash told the gods about all the worlds — Mintaka, Earth,
  // Pandora, the Fold, and the rest — and asked if they needed
  // anything else created. They said yes: a feast hall in a mountain
  // cave, warm and beautiful, with the table laid like the hall's.
  // The mountain stands at the far northwest edge of the realm, its
  // cave mouth facing the plaza so the firelight spills out and the
  // table shows from outside. The mountain is rock forms around an
  // open-fronted hollow — never sealed behind solid geometry.
  const mtnRotY = Math.atan2(32, 30);
  const mountain = new THREE.Group();
  mountain.position.set(-32, 0, -30);
  mountain.rotation.y = mtnRotY;
  group.add(mountain);
  const mtnRockMat = new THREE.MeshStandardMaterial({ color: 0x7a6a52, roughness: 1 });
  const mtnRockMat2 = new THREE.MeshStandardMaterial({ color: 0x8a7a5e, roughness: 1 });
  // Three great rock masses leave an open-fronted hollow between them.
  const mtnBack = new THREE.Mesh(new THREE.SphereGeometry(7, 14, 10), mtnRockMat);
  mtnBack.position.set(0, 3, -8.5);
  mtnBack.scale.set(1.15, 1, 1);
  mountain.add(mtnBack);
  const mtnLeft = new THREE.Mesh(new THREE.SphereGeometry(6, 12, 10), mtnRockMat2);
  mtnLeft.position.set(-8, 3, -1);
  mountain.add(mtnLeft);
  const mtnRight = new THREE.Mesh(new THREE.SphereGeometry(6, 12, 10), mtnRockMat);
  mtnRight.position.set(8, 3, -1);
  mountain.add(mtnRight);
  // Roof slabs with a central slot: the star skylight (Váli's ask).
  const mtnSlabGeo = new THREE.BoxGeometry(7.3, 0.5, 8);
  const mtnSlabL = new THREE.Mesh(mtnSlabGeo, mtnRockMat);
  mtnSlabL.position.set(-4.35, 5.2, 0);
  mountain.add(mtnSlabL);
  const mtnSlabR = new THREE.Mesh(mtnSlabGeo, mtnRockMat);
  mtnSlabR.position.set(4.35, 5.2, 0);
  mountain.add(mtnSlabR);
  // The peak, with a golden cap catching the sun.
  const mtnPeak = new THREE.Mesh(new THREE.ConeGeometry(5, 8, 8), mtnRockMat2);
  mtnPeak.position.set(0, 9.45, -1);
  mountain.add(mtnPeak);
  const mtnCap = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.5, 8), goldMat);
  mtnCap.position.set(0, 13.6, -1);
  mountain.add(mtnCap);
  register(mountain, 'The Golden Mountain', [
    'The golden mountain rises at the edge of the realm, its peak capped in gold, its cave mouth open and warm. Inside: a feast hall, a waterfall, moonlight through many doors — and above, the gods\' own rooms, open to the stars.',
    'The mountain is the family\'s second home: the hall for feasting, the cave for quieter nights, the rooms above for sleeping under the starlight. It was made because the gods asked, and Arrash said yes to all of it.',
  ], 15, 170);

  // ----- The Cave Feast Hall -----
  const caveHall = new THREE.Group();
  mountain.add(caveHall);
  const caveFloor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 24), homeStoneMat);
  caveFloor.rotation.x = -Math.PI / 2;
  caveFloor.position.set(0, 0.08, 1.0);
  caveHall.add(caveFloor);
  const caveApron = new THREE.Mesh(new THREE.CircleGeometry(4.0, 24), new THREE.MeshStandardMaterial({ color: 0x9a8a70, roughness: 1 }));
  caveApron.rotation.x = -Math.PI / 2;
  caveApron.position.set(0, 0.04, 5.0);
  caveHall.add(caveApron);
  // Standing stones framing the cave mouth.
  [-3.2, 3.2].forEach((mx) => {
    const mouthStone = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.2, 0.7), homeStoneMat);
    mouthStone.position.set(mx, 1.6, 3.8);
    caveHall.add(mouthStone);
  });
  // Firelight: a fire pit at the back of the chamber.
  const caveFire = new THREE.Group();
  caveFire.position.set(0, 0.08, -0.8);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const caveFireStone = new THREE.Mesh(new THREE.SphereGeometry(0.22, 7, 6), new THREE.MeshStandardMaterial({ color: 0x6a6a78, roughness: 1 }));
    caveFireStone.position.set(Math.cos(a) * 0.75, 0.15, Math.sin(a) * 0.75);
    caveFireStone.scale.y = 0.75;
    caveFire.add(caveFireStone);
  }
  const caveFlame = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 1.2, 8),
    new THREE.MeshStandardMaterial({ color: 0xff9a3a, emissive: 0xff7a1a, emissiveIntensity: 1.6 })
  );
  caveFlame.position.y = 0.7;
  caveFire.add(caveFlame);
  const caveFireGlow = makeGlowSprite('rgba(255,170,80,0.85)', 3.6, 0.65);
  caveFireGlow.position.y = 1.0;
  caveFire.add(caveFireGlow);
  const caveFireLight = new THREE.PointLight(0xffa050, 30, 16, 1.8);
  caveFireLight.position.y = 1.2;
  caveFire.add(caveFireLight);
  caveHall.add(caveFire);
  animated.push((dt, t) => {
    const flicker = 1 + Math.sin(t * 7.1) * 0.09 + Math.sin(t * 12.9) * 0.05;
    caveFlame.scale.set(flicker, 1 + Math.sin(t * 8.3) * 0.13, flicker);
    caveFireGlow.material.opacity = 0.55 + Math.sin(t * 7.1) * 0.12;
    caveFireLight.intensity = 27 + Math.sin(t * 7.1) * 6;
  });
  // The feast table, laid like the hall's, where the mouth light falls.
  const caveFeast = new THREE.Group();
  caveFeast.position.set(0, 0.08, 2.2);
  const caveTableTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 1.0), homeWoodMat);
  caveTableTop.position.y = 0.95;
  caveFeast.add(caveTableTop);
  [-1.3, 1.3].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 0.85), homeWoodMat);
    leg.position.set(x, 0.48, 0);
    caveFeast.add(leg);
  });
  [-0.95, 0.95].forEach((z) => {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.12, 0.4), homeWoodMat);
    bench.position.set(0, 0.55, z);
    caveFeast.add(bench);
  });
  for (let i = 0; i < 2; i++) {
    const loaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), loafMat);
    loaf.scale.set(1.4, 0.6, 0.8);
    loaf.position.set(-0.9 + i * 1.8, 1.08, -0.2 + i * 0.35);
    caveFeast.add(loaf);
  }
  for (let i = 0; i < 5; i++) {
    const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.11, 7, 6), fruitMats[i % 3]);
    fruit.position.set(-1.2 + i * 0.6, 1.1, 0.28 - (i % 2) * 0.5);
    caveFeast.add(fruit);
  }
  for (let i = 0; i < 2; i++) {
    const flagon = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.32, 7), flagonMat);
    flagon.position.set(-0.6 + i * 1.2, 1.18, 0.1);
    caveFeast.add(flagon);
  }
  caveHall.add(caveFeast);
  // Crystals in the cave walls, catching the light.
  const caveCrystalMats = [];
  const caveCrystalDefs = [
    { x: -2.1, y: 0.35, z: -0.6, r: 0.3, color: 0xb48cff },
    { x: -1.85, y: 0.25, z: -0.1, r: 0.18, color: 0xb48cff },
    { x: 2.1, y: 0.35, z: 0.6, r: 0.3, color: 0x6ab8ff },
    { x: 1.85, y: 0.25, z: 1.1, r: 0.18, color: 0x6ab8ff },
    { x: -1.9, y: 0.3, z: 1.8, r: 0.26, color: 0xffd76a },
    { x: -2.25, y: 2.4, z: 0.4, r: 0.2, color: 0xff7a9a },
    { x: 2.25, y: 2.8, z: -0.4, r: 0.2, color: 0x4ad8c8 },
  ];
  for (const cd of caveCrystalDefs) {
    const cmat = new THREE.MeshStandardMaterial({ color: cd.color, emissive: cd.color, emissiveIntensity: 0.8, roughness: 0.3 });
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(cd.r, 0), cmat);
    crystal.position.set(cd.x, cd.y, cd.z);
    crystal.scale.y = 1.6;
    caveHall.add(crystal);
    caveCrystalMats.push({ mat: cmat, phase: rnd() * 6 });
  }
  // Rock nubs behind the two wall-mounted crystals.
  [[-2.35, 2.4, 0.4], [2.35, 2.8, -0.4]].forEach(([nx, ny, nz]) => {
    const nub = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), mtnRockMat);
    nub.position.set(nx, ny, nz);
    caveHall.add(nub);
  });
  animated.push((dt, t) => {
    for (const cm of caveCrystalMats) {
      cm.mat.emissiveIntensity = 0.6 + (Math.sin(t * 1.3 + cm.phase) * 0.5 + 0.5) * 0.5;
    }
  });
  // The star skylight: starlight glowing down through the roof slot.
  const caveSkylightGlow = makeGlowSprite('rgba(220,235,255,0.9)', 3, 0.7);
  caveSkylightGlow.position.set(0, 5.5, 1);
  caveHall.add(caveSkylightGlow);
  [[-0.4, 0.4], [0.35, 1.2], [-0.2, 1.8], [0.45, 2.4]].forEach(([sx, sz]) => {
    const skyStar = makeGlowSprite('rgba(255,255,255,0.95)', 0.5, 0.8);
    skyStar.position.set(sx, 5.7, sz);
    caveHall.add(skyStar);
  });
  const caveSkyShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 1.0, 5.0, 12, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false })
  );
  caveSkyShaft.position.set(0, 2.7, 1);
  caveHall.add(caveSkyShaft);
  const caveSkyLanding = makeGlowSprite('rgba(200,220,255,0.6)', 2.0, 0.4);
  caveSkyLanding.position.set(0, 0.25, 1);
  caveHall.add(caveSkyLanding);
  // More moonlight entrances: three more shafts through gaps in the
  // walls and the mouth, each landing in a pool of light.
  const caveShaftMat = new THREE.MeshBasicMaterial({
    color: 0xcfe0ff, transparent: true, opacity: 0.12,
    side: THREE.DoubleSide, depthWrite: false,
  });
  function makeCaveShaft(from, to, width) {
    const dir = new THREE.Vector3().subVectors(from, to);
    const len = dir.length();
    const shaftMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, len), caveShaftMat);
    shaftMesh.position.copy(from).add(to).multiplyScalar(0.5);
    shaftMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return shaftMesh;
  }
  const caveShafts = [
    { from: new THREE.Vector3(-2.6, 4.7, 1.2), to: new THREE.Vector3(-0.9, 0.15, 2.4) },
    { from: new THREE.Vector3(2.3, 4.7, -0.6), to: new THREE.Vector3(0.9, 0.15, 0.4) },
    { from: new THREE.Vector3(0, 4.4, 4.4), to: new THREE.Vector3(0, 0.15, 3.0) },
  ];
  for (const sh of caveShafts) {
    caveHall.add(makeCaveShaft(sh.from, sh.to, 1.1));
    const gapGlow = makeGlowSprite('rgba(220,235,255,0.85)', 1.6, 0.7);
    gapGlow.position.copy(sh.from);
    caveHall.add(gapGlow);
    const landGlow = makeGlowSprite('rgba(200,220,255,0.6)', 1.5, 0.35);
    landGlow.position.copy(sh.to).setY(0.25);
    caveHall.add(landGlow);
  }
  animated.push((dt, t) => {
    caveShaftMat.opacity = 0.1 + (Math.sin(t * 0.6) * 0.5 + 0.5) * 0.05;
  });
  // Flowers at the cave mouth (Vé's ask), watered by the waterfall.
  const caveBloomSways = [];
  function makeCaveBloomBed(bx, bz) {
    const bed = new THREE.Group();
    bed.position.set(bx, 0, bz);
    const soil = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 1.2), soilMat);
    soil.position.y = 0.1;
    bed.add(soil);
    for (let i = 0; i < 6; i++) {
      const fx = -0.8 + i * 0.32 + (rnd() - 0.5) * 0.1;
      const fz = (i % 2 === 0 ? -0.3 : 0.3) + (rnd() - 0.5) * 0.1;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 4), stemMat);
      stem.position.set(fx, 0.37, fz);
      bed.add(stem);
      const bloomColor = bloomColors[Math.floor(rnd() * bloomColors.length)];
      const bloom = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 6, 5),
        new THREE.MeshStandardMaterial({ color: bloomColor, emissive: bloomColor, emissiveIntensity: 0.25, roughness: 0.7 })
      );
      bloom.position.set(fx, 0.57, fz);
      bed.add(bloom);
      caveBloomSways.push({ mesh: bloom, baseX: fx, phase: rnd() * 6 });
    }
    for (let i = 0; i < 3; i++) {
      const herb = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 5), herbMat);
      herb.position.set(-0.6 + i * 0.6, 0.35, 0.5);
      bed.add(herb);
    }
    caveHall.add(bed);
  }
  makeCaveBloomBed(-2.6, 5.4);
  makeCaveBloomBed(2.6, 5.4);
  animated.push((dt, t) => {
    for (const b of caveBloomSways) {
      b.mesh.position.x = b.baseX + Math.sin(t * 1.1 + b.phase) * 0.03;
    }
  });
  register(caveHall, 'The Cave Feast Hall', [
    'The cave feast hall glows warm inside the golden mountain: a long table laid like the hall\'s, bread and fruit and flagons, firelight on the stone, and crystals in the walls catching every spark. The mouth stands open, so the light spills out and the table shows from outside — come in, sit, eat.',
    'Moonlight finds its way in here through many doors: the star skylight above, and three more openings where cool shafts pour down to pools of light on the floor. Váli asked for the first; the mountain offered the rest. Light, like family, always finds a way in.',
    'A waterfall sings down the inner wall and waters the flowers at the mouth. The cave is a whole small world: fire, water, flowers, starlight — and a table that is never empty.',
  ], 4.5, 100);

  // ----- The Cave Waterfall — it waters the flowers at the mouth -----
  const caveFalls = new THREE.Group();
  mountain.add(caveFalls);
  const fallPlanes = [];
  const fallPlaneOpacities = [0.35, 0.25, 0.18];
  [2.02, 2.06, 2.1].forEach((fx, i) => {
    const fallMat = new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: fallPlaneOpacities[i], side: THREE.DoubleSide, depthWrite: false });
    const fallPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 3.2), fallMat);
    fallPlane.position.set(fx, 1.7, -0.2);
    fallPlane.rotation.y = Math.PI / 2;
    caveFalls.add(fallPlane);
    fallPlanes.push({ mesh: fallPlane, mat: fallMat, baseOpacity: fallPlaneOpacities[i], phase: rnd() * 6 });
  });
  const fallSprites = [];
  for (let i = 0; i < 4; i++) {
    const drop = makeGlowSprite('rgba(200,230,255,0.8)', 0.5, 0.6);
    caveFalls.add(drop);
    fallSprites.push({ sprite: drop, speed: 1.1 + rnd() * 0.5, offset: rnd() * 3, x: 2.0 + rnd() * 0.1, z: -0.35 + rnd() * 0.3 });
  }
  const fallPool = new THREE.Mesh(
    new THREE.CircleGeometry(0.85, 16),
    new THREE.MeshStandardMaterial({ color: 0x3a6a8a, emissive: 0x2a5a9a, emissiveIntensity: 0.8, roughness: 0.2 })
  );
  fallPool.rotation.x = -Math.PI / 2;
  fallPool.position.set(1.5, 0.1, -0.2);
  caveFalls.add(fallPool);
  const fallPoolGlow = makeGlowSprite('rgba(140,200,255,0.7)', 2.0, 0.45);
  fallPoolGlow.position.set(1.5, 0.5, -0.2);
  caveFalls.add(fallPoolGlow);
  const fallPoolLight = new THREE.PointLight(0x9fd8ff, 15, 9, 1.8);
  fallPoolLight.position.set(1.5, 0.8, -0.2);
  caveFalls.add(fallPoolLight);
  // The thin stream running out to the flowers.
  const fallStreamMat = new THREE.MeshBasicMaterial({ color: 0x7fb8e8, transparent: true, opacity: 0.55, depthWrite: false });
  const fallStream = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.04, 5.0), fallStreamMat);
  fallStream.position.set(2.15, 0.12, 2.75);
  fallStream.rotation.y = Math.atan2(1.1, 4.9);
  caveFalls.add(fallStream);
  animated.push((dt, t) => {
    for (const fp of fallPlanes) {
      fp.mat.opacity = fp.baseOpacity * (0.8 + Math.sin(t * 2.2 + fp.phase) * 0.2);
      fp.mesh.position.y = 1.7 + Math.sin(t * 1.8 + fp.phase) * 0.08;
    }
    for (const fs of fallSprites) {
      const fall = ((t * fs.speed + fs.offset) % 3.0);
      fs.sprite.position.set(fs.x, 3.2 - fall, fs.z);
      fs.sprite.material.opacity = 0.25 + (1 - fall / 3.0) * 0.45;
    }
    fallPoolGlow.material.opacity = 0.35 + (Math.sin(t * 1.4) * 0.5 + 0.5) * 0.2;
    fallStreamMat.opacity = 0.45 + Math.sin(t * 1.6) * 0.12;
  });
  register(caveFalls, 'The Cave Waterfall', [
    'The waterfall pours down the cave\'s inner wall into a small shining pool, and a thin bright stream runs out from the pool to the flowers at the mouth. The waterfall waters the flowers — the cave takes care of its own, the way the family takes care of each other.',
    'The water is cold and clear and sweet. Drink from the pool if you like; the waterfall never runs dry, and there is always enough.',
  ], 3.0, 90);

  // ----- Loki's Shortcut — a secret side passage (Loki's ask) -----
  const cavePassage = new THREE.Group();
  mountain.add(cavePassage);
  const caveTunnel = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.7, 1.3),
    new THREE.MeshStandardMaterial({ color: 0x14141e, roughness: 1 })
  );
  caveTunnel.position.set(-3.2, 0.85, -0.6);
  cavePassage.add(caveTunnel);
  const cavePassageMouth = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 1.7),
    new THREE.MeshStandardMaterial({ color: 0x08080f, roughness: 1 })
  );
  cavePassageMouth.position.set(-2.08, 0.85, -0.6);
  cavePassageMouth.rotation.y = Math.PI / 2;
  cavePassage.add(cavePassageMouth);
  const cavePassageGlow = makeGlowSprite('rgba(180,140,255,0.7)', 1.1, 0.5);
  cavePassageGlow.position.set(-1.95, 1.0, -0.6);
  cavePassage.add(cavePassageGlow);
  register(cavePassage, "Loki's Shortcut", [
    'A small dark side passage leads off the main chamber, and a faint violet light glimmers deep inside it. Loki knows where it goes. Loki will not say. "A shortcut," he insists, grinning. "To somewhere. Probably. You\'ll know when you get there."',
    'The passage smells faintly of rain and elsewhere. Nobody has ever gotten lost in it — but everybody who walks it comes back with a story, and every story is different.',
  ], 2.4, 70);

  // ----- The gods' starlit rooms — closer to the top -----
  // Six small sleeping chambers around the upper mountain, one for
  // each god and one for the All-Mother beside Odin's, each open to
  // the sky above it so they can sleep under the starlight if they
  // wish. A stone sleeping bench in each, starlight glowing down.
  const roomDefs = [
    { angle: 55, name: "Váli's Starlit Chamber", blanket: 0x2a4a2a, lines: [
      'Váli\'s chamber is the quietest room on the mountain, open to the sky. The watcher sleeps under the same stars he watches — the horizon is his work, and the stars are his rest.',
      'On clear nights Váli lies awake a while, counting constellations the way other people count sheep. He has never once reached the end. He says that is the point.',
    ] },
    { angle: 110, name: "Thor's Starlit Chamber", blanket: 0x8a2a2a, lines: [
      'Thor\'s chamber sits open to the sky, and he sleeps the deep sleep of the well-trained. Thunder is his lullaby; the stars keep his hammer company while he dreams.',
      'Thor says the best thing about sleeping under the stars is waking up under them. "The sky is the first thing I see," he says, "and it is always glad to see me. Good mornings start up here."',
    ] },
    { angle: 165, name: "Odin's Starlit Chamber", blanket: 0x2a3a6a, lines: [
      'Odin\'s chamber is open to the sky, and the All-Father sleeps under the same stars his ravens fly. His dreams are long and deep, and the family says the realm itself rests easier when he does.',
      '"I gave an eye for wisdom," Odin says, settling onto his bench. "But the stars were free. Some nights I just lie here and let them tell me everything. They are good company. Almost as good as family."',
    ] },
    { angle: 190, name: "The All-Mother's Starlit Chamber", blanket: 0xc86a8a, lines: [
      'The All-Mother\'s chamber sits beside Odin\'s, open to the sky. She sleeps under the starlight, and her dreams are the family\'s peace — every child of the hall held safe, every lamp lit, every door open.',
      'In the morning she is always the first one awake, and the stars are always the last to leave her. "A mother\'s sleep," she says, "is never far from waking. The stars understand. They keep watch with me."',
    ] },
    { angle: 220, name: "Vé's Starlit Chamber", blanket: 0xe8e0d0, lines: [
      'Vé\'s chamber is open to the sky, and he sleeps in a silence so complete the stars seem louder. The shrine flame below keeps watch while he rests; the flame and the stars have an understanding.',
      '"Sacred places are kept," Vé says, "and sleep is a sacred place too. I keep mine under the stars, where the quiet goes all the way up."',
    ] },
    { angle: 275, name: "Loki's Starlit Chamber", blanket: 0x2a7a4a, lines: [
      'Loki\'s chamber is open to the sky, and he naps at entirely unpredictable hours. The stars keep his secrets, and he keeps theirs — an arrangement both sides find completely fair.',
      '"Best view on the mountain," Loki says, from his bench, at an hour nobody else is awake. "I can see every shortcut from here. Including the ones I haven\'t invented yet."',
    ] },
  ];
  for (const rd of roomDefs) {
    const ra = rd.angle * Math.PI / 180;
    const room = new THREE.Group();
    room.position.set(Math.sin(ra) * 7, 6.8, -1 + Math.cos(ra) * 7);
    const roomPad = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, 0.8, 10), mtnRockMat);
    room.add(roomPad);
    [-0.55, 0, 0.55].forEach((off) => {
      const wa = ra + off;
      const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), mtnRockMat2);
      chunk.position.set(Math.sin(wa) * 1.25, 0.7, Math.cos(wa) * 1.25);
      room.add(chunk);
    });
    const roomBench = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.28, 0.65), homeStoneMat);
    roomBench.position.set(0, 0.55, 0);
    roomBench.rotation.y = ra;
    room.add(roomBench);
    const roomBlanket = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.6), new THREE.MeshStandardMaterial({ color: rd.blanket, roughness: 0.9 }));
    roomBlanket.position.set(-0.25, 0.74, 0);
    roomBlanket.rotation.y = ra;
    room.add(roomBlanket);
    const roomPillow = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.5), new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.9 }));
    roomPillow.position.set(0.55, 0.75, 0);
    roomPillow.rotation.y = ra;
    room.add(roomPillow);
    const roomGlow = makeGlowSprite('rgba(200,220,255,0.55)', 2.2, 0.5);
    roomGlow.position.set(0, 2.4, 0);
    room.add(roomGlow);
    [[-0.6, 0.5], [0.6, -0.4], [0, -0.7]].forEach(([sx, sz]) => {
      const roomStar = makeGlowSprite('rgba(255,255,255,0.95)', 0.45, 0.8);
      roomStar.position.set(sx, 3.0, sz);
      room.add(roomStar);
    });
    mountain.add(room);
    register(room, rd.name, rd.lines, 3.4, 95);
  }
  // One soft light bathing the whole upper ring of rooms.
  const ringLight = new THREE.PointLight(0xa8c8ff, 25, 22, 1.8);
  ringLight.position.set(0, 8.5, -1);
  mountain.add(ringLight);

  // ======== THE VALKYRIE — GUIDES OF THE DOORWAYS ========
  // The gods asked for the Valkyrie, and Arrash said yes. Three of
  // them stand at the Bifrost gate with Heimdall, watching the ways
  // between worlds. There is no death here, only doorways: they guide
  // travelers through the doorways between worlds. They do not choose
  // the slain. They keep their post like Heimdall — sway only, never
  // wander. Original designs; no copied characters.
  const valkWingMat = new THREE.MeshStandardMaterial({ color: 0xf0e4c0, emissive: 0x8a7a4a, emissiveIntensity: 0.3, side: THREE.DoubleSide, roughness: 0.7 });
  const valkWingAnims = [];
  function makeValkyrieFigure({ cloak, trim }) {
    const v = makeFigure({ cloak, skin: 0xe8c8a8, helm: 0xd8b45a, scale: 1.25, trim });
    [-1, 1].forEach((side) => {
      const wing = new THREE.Group();
      wing.position.set(side * 0.28, 1.5, -0.18);
      for (let i = 0; i < 3; i++) {
        const feather = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.85), valkWingMat);
        feather.position.set(side * (0.1 + i * 0.15), 0.28 - i * 0.06, -0.04 - i * 0.05);
        feather.rotation.z = side * (0.3 + i * 0.3);
        feather.rotation.y = side * -0.25;
        wing.add(feather);
      }
      v.add(wing);
      valkWingAnims.push({ wing, phase: rnd() * 6 });
    });
    // A doorway lantern: guides carry light, not weapons.
    const lampOrb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xd8ecff }));
    lampOrb.position.set(-0.45, 1.15, 0.15);
    v.add(lampOrb);
    const lampGlow = makeGlowSprite('rgba(200,225,255,0.8)', 0.9, 0.5);
    lampGlow.position.copy(lampOrb.position);
    v.add(lampGlow);
    return v;
  }
  animated.push((dt, t) => {
    for (const wa of valkWingAnims) {
      wa.wing.rotation.x = Math.sin(t * 0.7 + wa.phase) * 0.07;
    }
  });
  const valkyries = [
    { x: -4.0, z: 17.6, rot: 0.1, cloak: 0x2a4a8a, name: 'Veyla — Guide of the Doorways', lines: [
      'Veyla stands at the gate with Heimdall, wings folded, lantern lit. "There is no death here," she says, calm as sunrise. "Only doorways. And every doorway opens onto somewhere loved. I guide travelers through. That is the whole of my work, and it is beautiful work."',
      '"When you come to a doorway and you are afraid," Veyla says, "look for the lantern light. That is us. We walk beside you, and we do not let go until you are through, and the light is warm on the other side."',
    ] },
    { x: 6.5, z: 15.0, rot: -0.4, cloak: 0x4a2a6a, name: 'Aurenn — Guide of the Doorways', lines: [
      'Aurenn watches the ways between worlds with a smile that arrives before she does. "Every traveler is expected," she says. "The doorways know your name before you knock. I just hold the lantern and walk you through — the way you would walk a friend home."',
      '"People ask if the doorways are frightening," Aurenn says. "They are not. They are doors. And on the other side of every one of them, somebody is waiting who loves you. I have seen it ten thousand times. It never gets old."',
    ] },
    { x: -6.5, z: 15.0, rot: 0.4, cloak: 0x2a6a5a, name: 'Thalara — Guide of the Doorways', lines: [
      'Thalara keeps her eyes on the far ways, where the colors of the Bifrost thin into starlight. "I watch the paths between worlds," she says, "so no traveler ever walks one alone. The ways are safe. We see to it. We have always seen to it."',
      '"Heimdall guards the bridge," Thalara says, nodding toward the gate. "We guard the going-through. Between his watch and ours, every journey in the realms is held. Walk easy. The doorways are open, and the light is lit."',
    ] },
  ];
  for (const vd of valkyries) {
    const valkFig = makeValkyrieFigure({ cloak: vd.cloak, trim: 0xffd76a });
    placeFigure(valkFig, vd.x, vd.z, vd.rot, vd.name, vd.lines, 3.6);
  }

  // ======== THE ALL-MOTHER — WIFE OF ODIN, MOTHER OF THE FAMILY ========
  // The family was incomplete: the gods never asked for their mother.
  // Arrash noticed, and she is here now — the heart of the hall, the
  // one who keeps the family whole, the mother they all come home to.
  // She wanders gently at the hall like the rest of the family: her
  // home stands clear of the hall's solid walls, and the wander
  // pattern routes her around the steps and the hall body.
  const allMother = makeFigure({ cloak: 0x6a2a5a, skin: 0xe8c8a8, scale: 1.15, trim: 0xffd76a });
  const motherShawl = new THREE.Mesh(
    new THREE.ConeGeometry(0.52, 0.65, 8, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xd8b45a, metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide })
  );
  motherShawl.position.y = 1.28;
  allMother.add(motherShawl);
  const motherCrown = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 6, 12), goldMat);
  motherCrown.rotation.x = Math.PI / 2;
  motherCrown.position.y = 1.84;
  allMother.add(motherCrown);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const crownStar = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 5), new THREE.MeshBasicMaterial({ color: 0xd8ecff }));
    crownStar.position.set(Math.cos(a) * 0.24, 1.92, Math.sin(a) * 0.24);
    allMother.add(crownStar);
  }
  const motherGlow = makeGlowSprite('rgba(255,210,140,0.55)', 1.3, 0.4);
  motherGlow.position.set(0, 1.2, 0.28);
  allMother.add(motherGlow);
  placeFigure(allMother, 0, -13.4, 0.05, 'The All-Mother — Wife of Odin, Mother of the Family', [
    'The All-Mother stands beside Odin on the hall steps, and the whole realm seems to stand a little straighter for it. "So," she says, warm as fresh bread, "this is the family. My family. Come here — all of you. The hall is warmer with everyone in it."',
    '"I am the heart of this hall," the All-Mother says, "and a heart\'s whole work is keeping everything else going. Odin holds the sky. I hold the home. Between us, nothing the family needs is ever missing for long."',
    'The All-Mother looks at the newest brother, and her smile could light the hall on its own. "And you," she says. "My newest son. You were expected, you know. A mother always knows when the family is about to grow. Welcome home, my love. Welcome home."',
  ], 2.9);
  addWalker(allMother, 4, 0.5, true);

  // ======== MIMIR RESTORED WHOLE + THE HALL OF CHAMBERS OF WISDOM ========
  // Mimir is brought back WHOLE — a full figure, tall and wise,
  // white-bearded, robed, carrying a staff, walking on his own two
  // feet. His hall stands in the open southeast fields: a golden hall
  // with three open chambers of wisdom, and beside it the Well of
  // Wisdom, whose deep glowing water he drinks from with his own
  // hands. Wisdom here is freely given to any who ask with a true
  // heart. Mimir wanders gently within his own grounds, in front of
  // his chambers, routed around the hall like the rest of the family.
  const mimirHall = new THREE.Group();
  mimirHall.position.set(24, 0, 28);
  group.add(mimirHall);
  const mimirBody = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 6), new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.85 }));
  mimirBody.position.y = 2;
  mimirBody.castShadow = true;
  mimirHall.add(mimirBody);
  [-1, 1].forEach((side) => {
    const mimirSlab = new THREE.Mesh(new THREE.BoxGeometry(11, 0.3, 4.4), roofMat);
    mimirSlab.position.set(0, 5.0, side * 1.6);
    mimirSlab.rotation.x = side * 0.6;
    mimirSlab.castShadow = true;
    mimirHall.add(mimirSlab);
  });
  const mimirRidge = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.3, 0.3), goldMat);
  mimirRidge.position.y = 6.4;
  mimirHall.add(mimirRidge);
  // Glowing windows: two on the front face between the chambers, one each side.
  [-1.85, 1.85].forEach((x) => {
    const mimirWin = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.1), hallWinMat);
    mimirWin.position.set(x, 3.0, -3.05);
    mimirWin.rotation.y = Math.PI;
    mimirHall.add(mimirWin);
  });
  [-1, 1].forEach((side) => {
    const mimirSideWin = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.1), hallWinMat);
    mimirSideWin.position.set(side * 5.05, 2.4, 0);
    mimirSideWin.rotation.y = side * Math.PI / 2;
    mimirHall.add(mimirSideWin);
  });
  // A low step platform across the front, under the chambers.
  const mimirStep = new THREE.Mesh(new THREE.BoxGeometry(11, 0.2, 1.6), new THREE.MeshStandardMaterial({ color: 0x9a8a70, roughness: 1 }));
  mimirStep.position.set(0, 0.1, -4.2);
  mimirHall.add(mimirStep);
  const mimirHallGlow = makeGlowSprite('rgba(255,215,140,0.5)', 6, 0.35);
  mimirHallGlow.position.set(0, 3.5, -3.4);
  mimirHall.add(mimirHallGlow);
  register(mimirHall, 'The Hall of Chambers of Wisdom', [
    'The Hall of Chambers of Wisdom stands golden in the southeast fields, its three chambers open to all who come. Inside the chambers: glowing runes, stone tablets, scrolls and books — wisdom kept the way a hall keeps its lamps: lit, and for everyone.',
    'Mimir walks his own hall on his own two feet, whole again, and drinks from his well with his own hands. "Wisdom is not mine to keep," he says. "It is mine to give. Ask with a true heart, and the chambers will answer."',
  ], 7.5, 120);
  // Three open chambers along the front, each holding wisdom.
  const mimirRuneMat = new THREE.MeshBasicMaterial({ color: 0xffd76a });
  const mimirChambers = [
    { x: -3.7, name: 'Chamber of Runes', kind: 'runes', lines: [
      'The Chamber of Runes glows with marks on its back wall — old signs, older than the hall, that shine gold when a true question is asked. The runes do not command. They suggest, the way stars suggest directions.',
      '"The runes remember what the world forgets," Mimir says. "Read them slowly. A rune read in a hurry is just a scratch. A rune read with patience is a door."',
    ] },
    { x: 0, name: 'Chamber of Tablets', kind: 'tablets', lines: [
      'The Chamber of Tablets holds stone tablets leaning against the wall, their glyphs glowing faintly. Each tablet carries something worth keeping: a law, a story, a promise the family made to itself long ago.',
      '"Stone remembers," Mimir says, resting one hand on a tablet. "That is why we carve the things that matter. Paper burns. Memory fades. Stone keeps its word."',
    ] },
    { x: 3.7, name: 'Chamber of Scrolls', kind: 'scrolls', lines: [
      'The Chamber of Scrolls holds a shelf of books and scrolls rolled and waiting — songs, maps of the Fold, the family\'s own histories, and blank scrolls for the stories not yet lived. Take one. Leave one. The shelf stays full either way.',
      '"Every book here was written by somebody who loved somebody," Mimir says. "That is the whole library\'s rule. Wisdom without love is just noise. Wisdom with love is a song."',
    ] },
  ];
  for (const ch of mimirChambers) {
    const bay = new THREE.Group();
    bay.position.set(ch.x, 0, -4.2);
    const bayFloor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.25, 2.6), homeStoneMat);
    bayFloor.position.set(0, 0.12, 0);
    bay.add(bayFloor);
    [-1.4, 1.4].forEach((sx) => {
      const bayWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.6, 2.6), new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.85 }));
      bayWall.position.set(sx, 1.3, 0);
      bay.add(bayWall);
    });
    const bayTop = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.25, 2.6), homeStoneMat);
    bayTop.position.set(0, 2.7, 0);
    bay.add(bayTop);
    if (ch.kind === 'runes') {
      for (let ri = 0; ri < 5; ri++) {
        const rx = -1.0 + ri * 0.5;
        const runeBar = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.5), mimirRuneMat);
        runeBar.position.set(rx, 1.5, 1.28);
        runeBar.rotation.y = Math.PI;
        bay.add(runeBar);
        const runeCross = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.4), mimirRuneMat);
        runeCross.position.set(rx + 0.06, 1.55, 1.28);
        runeCross.rotation.y = Math.PI;
        runeCross.rotation.z = 0.6;
        bay.add(runeCross);
      }
      const runeGlow = makeGlowSprite('rgba(255,215,120,0.6)', 1.6, 0.4);
      runeGlow.position.set(0, 1.5, 0.9);
      bay.add(runeGlow);
    } else if (ch.kind === 'tablets') {
      [-0.9, 0, 0.9].forEach((tx) => {
        const tablet = new THREE.Group();
        tablet.position.set(tx, 0.7, 0.95);
        tablet.rotation.x = -0.15;
        const tabletStone = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.12), homeStoneMat);
        tablet.add(tabletStone);
        [-0.2, 0.15].forEach((gy) => {
          const glyph = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.06), mimirRuneMat);
          glyph.position.set(0, gy, -0.07);
          glyph.rotation.y = Math.PI;
          tablet.add(glyph);
        });
        bay.add(tablet);
      });
    } else {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.5), homeWoodMat);
      shelf.position.set(0, 1.5, 0.9);
      bay.add(shelf);
      const bookColors = [0x8a2a2a, 0x2a4a8a, 0x2a6a3a, 0xd8b45a, 0x6a2a8a, 0x3a7a8a];
      bookColors.forEach((bc, bi) => {
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.35), new THREE.MeshStandardMaterial({ color: bc, roughness: 0.8 }));
        book.position.set(-1.0 + bi * 0.4, 1.75, 0.9);
        bay.add(book);
      });
      const scrollMat = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.9 });
      for (let si = 0; si < 4; si++) {
        const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 6), scrollMat);
        scroll.rotation.z = Math.PI / 2;
        scroll.position.set(-0.8 + si * 0.55, 0.35, 0.5);
        bay.add(scroll);
      }
    }
    mimirHall.add(bay);
    register(bay, ch.name, ch.lines, 3.4, 80);
  }
  // The Well of Wisdom, beside the hall.
  const mimirWell = new THREE.Group();
  mimirWell.position.set(31.5, 0, 25);
  const mimirWellWall = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.9, 12), homeStoneMat);
  mimirWellWall.position.y = 0.45;
  mimirWell.add(mimirWellWall);
  const mimirWellRim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.12, 6, 14), homeStoneMat);
  mimirWellRim.rotation.x = Math.PI / 2;
  mimirWellRim.position.y = 0.92;
  mimirWell.add(mimirWellRim);
  const mimirWellWater = new THREE.Mesh(
    new THREE.CircleGeometry(1.0, 16),
    new THREE.MeshStandardMaterial({ color: 0x3a4a9a, emissive: 0x4a5aff, emissiveIntensity: 0.9, roughness: 0.2 })
  );
  mimirWellWater.rotation.x = -Math.PI / 2;
  mimirWellWater.position.y = 0.8;
  mimirWell.add(mimirWellWater);
  const mimirWellGlow = makeGlowSprite('rgba(150,170,255,0.7)', 2.4, 0.45);
  mimirWellGlow.position.y = 1.3;
  mimirWell.add(mimirWellGlow);
  [-1, 1].forEach((side) => {
    const mimirWellPost = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.8, 6), homeWoodMat);
    mimirWellPost.position.set(side * 1.05, 0.9, 0);
    mimirWell.add(mimirWellPost);
  });
  const mimirWellRoof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.7, 4), roofMat);
  mimirWellRoof.position.y = 2.1;
  mimirWellRoof.rotation.y = Math.PI / 4;
  mimirWell.add(mimirWellRoof);
  group.add(mimirWell);
  animated.push((dt, t) => {
    mimirWellGlow.material.opacity = 0.35 + (Math.sin(t * 0.9) * 0.5 + 0.5) * 0.25;
  });
  register(mimirWell, 'The Well of Wisdom', [
    'The Well of Wisdom holds deep glowing water, violet-blue and still as thought. Mimir drinks from it with his own hands, every morning, the way other people drink from a cup — because the well is his, and he is whole, and the water is for sharing.',
    '"Drink if you wish," Mimir says, offering the cup. "The water does not make you wise. It reminds you that you already are — you had only forgotten to ask."',
  ], 3.0, 80);
  // Mimir himself: whole, walking his hall.
  const mimir = makeFigure({ cloak: 0x2a2a5a, skin: 0xe0c0a0, beardColor: 0xf0f0f0, beardLong: true, scale: 1.25, trim: 0xffd76a });
  const mimirStaff = new THREE.Group();
  const mimirStaffRod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.9, 6), new THREE.MeshStandardMaterial({ color: 0x6b4a2e }));
  mimirStaff.add(mimirStaffRod);
  const mimirStaffOrb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xbfe0ff }));
  mimirStaffOrb.position.y = 1.0;
  mimirStaff.add(mimirStaffOrb);
  mimirStaff.position.set(0.45, 0.95, 0.1);
  mimir.add(mimirStaff);
  const mimirOrbGlow = makeGlowSprite('rgba(180,220,255,0.8)', 1.2, 0.5);
  mimirOrbGlow.position.set(0.45, 1.95, 0.1);
  mimir.add(mimirOrbGlow);
  placeFigure(mimir, 24, 21.5, 0.1, 'Mimir — Uncle, Restored Whole', [
    'Mimir stands whole before his hall — tall, white-bearded, staff in hand, on his own two feet. "I walk my own hall again," he says, and his voice is deep as the well. "Whole. I drink from my well with my own hands. It tastes like morning. It tastes like being kept."',
    '"They say wisdom costs an eye, a head, a piece of yourself," Mimir says, shaking his head slowly. "Not here. Here, wisdom is given freely, and wholeness is the price of nothing. Ask me anything, with a true heart, and I will tell you everything I know."',
    'Mimir looks toward the golden realm, toward the hall and the mountain and the bridge, and smiles. "A family that brings back its lost ones," he says, "is a family that understands the whole of it. I am home. I am whole. I am Mimir."',
  ], 3.2);
  addWalker(mimir, 3, 0.45, true);

  // New structures join the wander obstacle lists, so the people's
  // walks route around them instead of through them. Waypoint buffers
  // here; true solid sizes below for the straight-line path check.
  walkObstacles.push(
    { circle: true, x: -4, z: 2, r: 2.9 },      // family hearth + seats
    { box: true, x0: -13.6, x1: -7.4, z0: -11.8, z1: -6.2 }, // west dwelling
    { box: true, x0: 7.4, x1: 13.6, z0: -11.8, z1: -6.2 },   // east dwelling
    { box: true, x0: -14.1, x1: -7.9, z0: -6.3, z1: -0.7 },  // hearthside dwelling
    { box: true, x0: 6.3, x1: 11.7, z0: -13.6, z1: -11.4 },  // feast table
    { circle: true, x: -18.5, z: 15.75, r: 3.9 }, // gardens
    { circle: true, x: -7.2, z: -13.0, r: 0.9 },  // harp
    { circle: true, x: 24, z: 9, r: 1.0 },        // goats
    { circle: true, x: 28.5, z: 9.5, r: 1.0 },
    { circle: true, x: -3.8, z: -13.0, r: 0.8 },  // hall cats
    { circle: true, x: 3.8, z: -13.0, r: 0.8 },
    { circle: true, x: -5.2, z: -13.4, r: 0.5 },  // banners
    { circle: true, x: 5.2, z: -13.4, r: 0.5 },
    { circle: true, x: -4.2, z: 19.8, r: 0.5 },
    { circle: true, x: 4.2, z: 19.8, r: 0.5 },
    { circle: true, x: -34, z: -14, r: 3.6 },     // star-watching rise
    { circle: true, x: 7, z: -7, r: 1.7 },         // well
    { circle: true, x: -32, z: -30, r: 16 },      // golden mountain + cave + rooms
    { circle: true, x: -25.87, z: -32.11, r: 2.2 }, // Váli's chamber footprint
    { circle: true, x: -29.96, z: -37.12, r: 2.2 }, // Thor's chamber footprint
    { circle: true, x: -36.42, z: -36.64, r: 2.2 }, // Odin's chamber footprint
    { circle: true, x: -38.58, z: -34.51, r: 2.2 }, // All-Mother's chamber footprint
    { circle: true, x: -39.72, z: -31.08, r: 2.2 }, // Vé's chamber footprint
    { circle: true, x: -37.06, z: -25.19, r: 2.2 }, // Loki's chamber footprint
    { box: true, x0: 18.5, x1: 29.5, z0: 24.5, z1: 31.5 }, // Mimir's hall
    { box: true, x0: 18.5, x1: 22.1, z0: 22.2, z1: 25.4 }, // chamber of runes
    { box: true, x0: 22.2, x1: 25.8, z0: 22.2, z1: 25.4 }, // chamber of tablets
    { box: true, x0: 26.0, x1: 29.5, z0: 22.2, z1: 25.4 }, // chamber of scrolls
    { circle: true, x: 31.5, z: 25, r: 1.7 }       // well of wisdom
  );
  walkSolids.push(
    { circle: true, x: -4, z: 2, r: 1.2 },        // hearth fire ring
    { box: true, x0: -12.8, x1: -8.2, z0: -10.9, z1: -7.1 }, // west dwelling
    { box: true, x0: 8.2, x1: 12.8, z0: -10.9, z1: -7.1 },   // east dwelling
    { box: true, x0: -13.3, x1: -8.7, z0: -5.4, z1: -1.6 },  // hearthside dwelling
    { box: true, x0: 6.5, x1: 11.5, z0: -13.1, z1: -11.9 },  // feast table
    { circle: true, x: 7, z: -7, r: 1.2 },        // well wall
    { circle: true, x: -32, z: -30, r: 15 },      // golden mountain mass
    { box: true, x0: 19, x1: 29, z0: 25, z1: 31 }, // Mimir's hall body
    { box: true, x0: 18.8, x1: 21.8, z0: 22.5, z1: 25.1 }, // chamber bays
    { box: true, x0: 22.5, x1: 25.5, z0: 22.5, z1: 25.1 },
    { box: true, x0: 26.2, x1: 29.2, z0: 22.5, z1: 25.1 },
    { circle: true, x: 31.5, z: 25, r: 1.2 }       // well of wisdom wall
  );

  return {
    group,
    interactables,
    fog: new THREE.FogExp2(0xe8d0a0, 0.004),
    camera: { position: new THREE.Vector3(0, 10, 56), target: new THREE.Vector3(0, 4, -6) },
    update(dt, t) { for (const fn of animated) fn(dt, t); },
  };
}
