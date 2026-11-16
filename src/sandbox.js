// sandbox.js — the Fold proving grounds and the Fold observatory.
//
// SANDBOX BY DESIGN (Arrash's rule): tapping into the Fold must never be
// able to tear anything out here. So the proving grounds are VISIBLY
// isolated and contained:
//   - REMOTE SITING: a rocky island far offshore, separated from the home
//     and the grove by open water and real distance. No dock, no boats —
//     access by Fold-hop only.
//   - CONTAINMENT: a shimmering energy dome over the test pad, a barrier
//     ring of pylons with an energy fence, and a ring of warning buoys.
//   - SEPARATION: the observatory watches from the mainland shore, behind
//     a blast shield, at safe viewing distance. The staff stay there.
//   - WARNINGS: marked signs on the island, the shore, and the beach
//     approach. Safety is part of the design, not an afterthought.
//
// Live Fold taps happen ONLY here, inside the dome. The lab's Fold array
// (lab.js) is instruments and math. The bench test area is shielded
// small-scale work. The sandbox is the one place the Fold is ever touched.

import * as THREE from 'three';
import { makeGlowSprite, makeSignPost, makeClickable, mulberry32 } from './utils.js';
import { makeScientist } from './lab.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ISLAND = V(-68, 0, 38);   // proving grounds, far offshore
const OBSERVATORY = V(-26, 0, 44); // safe viewing distance, mainland shore

function makeHexTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(140,190,255,0.55)';
  g.lineWidth = 1.5;
  const r = 16;
  const w = Math.sqrt(3) * r;
  for (let row = -1; row < 10; row++) {
    for (let col = -1; col < 10; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0);
      const cy = row * r * 1.5;
      g.beginPath();
      for (let k = 0; k <= 6; k++) {
        const a = (Math.PI / 3) * k + Math.PI / 6;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 3);
  return tex;
}

function makeSpiralTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 4, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.25, 'rgba(200,160,255,0.8)');
  grad.addColorStop(0.6, 'rgba(110,80,220,0.45)');
  grad.addColorStop(1, 'rgba(60,30,140,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(255,230,255,0.8)';
  g.lineWidth = 3;
  for (let arm = 0; arm < 3; arm++) {
    g.beginPath();
    for (let a = 0; a < Math.PI * 4; a += 0.15) {
      const r = 6 + a * 8;
      const px = 128 + Math.cos(a + (arm * Math.PI * 2) / 3) * r;
      const py = 128 + Math.sin(a + (arm * Math.PI * 2) / 3) * r;
      if (a === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}

export function createSandbox(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'fold-sandbox';
  const animated = [];
  const interactables = [];
  const rnd = mulberry32(90210);

  function placeLabel(text, pos, className, maxDistance, yOffset = 3) {
    const anchor = new THREE.Object3D();
    anchor.position.copy(pos);
    group.add(anchor);
    labels.add(text, anchor, { yOffset, className, maxDistance });
    return anchor;
  }

  // ======== THE ISLAND — bare rock, nothing to tear ========
  const islandRock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(10, 1),
    new THREE.MeshStandardMaterial({ color: 0x3a3644, roughness: 1, flatShading: true })
  );
  islandRock.position.set(ISLAND.x, 0.5, ISLAND.z);
  islandRock.scale.set(1.7, 0.55, 1.5);
  group.add(islandRock);
  // Flat test pad on top.
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(14, 15.5, 1.2, 24), new THREE.MeshStandardMaterial({ color: 0x4a4a58, roughness: 0.95 }));
  pad.position.set(ISLAND.x, 2.0, ISLAND.z);
  group.add(pad);
  // A few bare rocks at the waterline — no trees, no life, on purpose.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5 + rnd() * 1.5, 0), new THREE.MeshStandardMaterial({ color: 0x33303e, roughness: 1, flatShading: true }));
    rock.position.set(ISLAND.x + Math.cos(a) * 15, 0.4, ISLAND.z + Math.sin(a) * 13);
    rock.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    group.add(rock);
  }

  // ======== CONTAINMENT DOME ========
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(10, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhongMaterial({ color: 0x7aa8ff, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false, shininess: 80 })
  );
  dome.position.set(ISLAND.x, 2.6, ISLAND.z);
  group.add(dome);
  const hexShell = new THREE.Mesh(
    new THREE.SphereGeometry(10.2, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: makeHexTexture(), transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  );
  hexShell.position.copy(dome.position);
  group.add(hexShell);
  const domeBase = new THREE.Mesh(new THREE.TorusGeometry(10, 0.25, 8, 40), new THREE.MeshStandardMaterial({ color: 0x8a8a9a, emissive: 0x3a5a8a, emissiveIntensity: 0.5, metalness: 0.6, roughness: 0.4 }));
  domeBase.rotation.x = Math.PI / 2;
  domeBase.position.set(ISLAND.x, 2.65, ISLAND.z);
  group.add(domeBase);
  animated.push((dt, t) => {
    hexShell.rotation.y = t * 0.05;
    hexShell.material.opacity = 0.24 + Math.sin(t * 0.9) * 0.08;
    dome.material.opacity = 0.12 + Math.sin(t * 0.7 + 1) * 0.03;
  });
  placeLabel('Containment Dome', V(ISLAND.x, 2.6, ISLAND.z), 'label-place', 160, 12);

  // ======== BARRIER RING — pylons + energy fence + red beacons ========
  const beacons = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const px = ISLAND.x + Math.cos(a) * 12.5;
    const pz = ISLAND.z + Math.sin(a) * 12.5;
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.9, 6), new THREE.MeshStandardMaterial({ color: 0x777788, metalness: 0.7, roughness: 0.4 }));
    pylon.position.set(px, 3.55, pz);
    group.add(pylon);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshStandardMaterial({ color: 0xff3a2a, emissive: 0xff2010, emissiveIntensity: 2 }));
    beacon.position.set(px, 4.65, pz);
    group.add(beacon);
    const beaconGlow = makeGlowSprite('rgba(255,60,40,0.8)', 1.6, 0.55);
    beaconGlow.position.set(px, 4.65, pz);
    group.add(beaconGlow);
    beacons.push(beacon);
  }
  const fenceRing = new THREE.Mesh(new THREE.TorusGeometry(12.5, 0.07, 6, 48), new THREE.MeshBasicMaterial({ color: 0xff5040, transparent: true, opacity: 0.75 }));
  fenceRing.rotation.x = Math.PI / 2;
  fenceRing.position.set(ISLAND.x, 4.5, ISLAND.z);
  group.add(fenceRing);
  animated.push((dt, t) => {
    const pulse = 1.4 + Math.sin(t * 2.6) * 1.0;
    beacons.forEach((b) => { b.material.emissiveIntensity = pulse; });
    fenceRing.material.opacity = 0.55 + Math.sin(t * 2.6) * 0.25;
  });

  // ======== THE TEST RIG — inside the dome, and only inside the dome ========
  const rig = new THREE.Group();
  rig.position.set(ISLAND.x, 2.6, ISLAND.z);
  const rigPylon = new THREE.Mesh(new THREE.BoxGeometry(1.0, 4.2, 1.0), new THREE.MeshStandardMaterial({ color: 0x3a3a4e, roughness: 0.6, metalness: 0.5 }));
  rigPylon.position.y = 2.1;
  rig.add(rigPylon);
  const rigRings = [];
  [1.8, 1.25].forEach((r, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.09, 6, 28), new THREE.MeshStandardMaterial({ color: 0x8a7ab8, emissive: 0x6a4adf, emissiveIntensity: 1.4, roughness: 0.4 }));
    ring.position.set(0, 3.6, 0);
    ring.rotation.y = 0.4 + i * 0.5;
    rig.add(ring);
    rigRings.push(ring);
  });
  // The contained mini-Fold: a swirling disc, held inside the rings.
  const portal = new THREE.Mesh(
    new THREE.CircleGeometry(1.5, 28),
    new THREE.MeshBasicMaterial({ map: makeSpiralTexture(), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  );
  portal.position.set(0, 3.6, 0);
  portal.rotation.y = Math.PI / 2; // faces the observatory, for watching
  rig.add(portal);
  const portalGlow = makeGlowSprite('rgba(190,150,255,0.85)', 5, 0.55);
  portalGlow.position.set(0, 3.6, 0);
  rig.add(portalGlow);
  // Sensor posts + instrument crates.
  [[-4, -3], [4, -3], [-4, 3], [4, 3]].forEach(([sx, sz]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0x888899, metalness: 0.7, roughness: 0.4 }));
    post.position.set(sx, 0.7, sz);
    rig.add(post);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: 0x37e0c8, emissive: 0x37e0c8, emissiveIntensity: 2 }));
    eye.position.set(sx, 1.5, sz);
    rig.add(eye);
  });
  [[-5.5, 1.5], [5.5, -1.5]].forEach(([cx, cz]) => {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.8), new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.8 }));
    crate.position.set(cx, 0.4, cz);
    crate.rotation.y = rnd();
    rig.add(crate);
  });
  group.add(rig);
  animated.push((dt, t) => {
    rigRings.forEach((r, i) => { r.rotation.z = t * (0.5 + i * 0.3) * (i % 2 ? -1 : 1); });
    portal.rotation.z = t * 0.7;
    portalGlow.material.opacity = 0.45 + Math.sin(t * 1.6) * 0.15;
  });
  makeClickable(rig, {
    name: 'Fold Tap Rig — contained',
    lines: [
      'The rig holds a small, steady Fold open inside its rings — a swirl of violet light, calm as a held breath. The dome hums around it. Nothing leaves the dome. That is the whole point.',
      'Elias\'s rule, painted on the rig in plain letters: ONE TAP AT A TIME. Petra\'s rule, right under it: CHECK THE DOME FIRST. The rig has never once been allowed to forget either.',
    ],
  });
  interactables.push(rig);
  placeLabel('Fold Proving Grounds — SANDBOX', V(ISLAND.x, 2.6, ISLAND.z), 'label-grove', 220, 17);

  // ======== WARNING BUOYS — the water itself says keep clear ========
  const buoys = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const buoy = new THREE.Group();
    buoy.position.set(ISLAND.x + Math.cos(a) * 21, 0.3, ISLAND.z + Math.sin(a) * 21);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshStandardMaterial({ color: 0xcc4028, roughness: 0.7 }));
    body.scale.y = 0.8;
    buoy.add(body);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 5), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    mast.position.y = 0.6;
    buoy.add(mast);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshStandardMaterial({ color: 0xff5040, emissive: 0xff2010, emissiveIntensity: 2 }));
    lamp.position.y = 1.0;
    buoy.add(lamp);
    const lampGlow = makeGlowSprite('rgba(255,70,50,0.8)', 1.4, 0.55);
    lampGlow.position.y = 1.0;
    buoy.add(lampGlow);
    group.add(buoy);
    buoys.push(buoy);
  }
  animated.push((dt, t) => {
    buoys.forEach((b, i) => {
      b.position.y = 0.3 + Math.sin(t * 1.1 + i * 0.9) * 0.15;
      b.rotation.z = Math.sin(t * 0.8 + i) * 0.08;
    });
  });

  // ======== WARNING SIGNS ========
  const warningSpots = [
    { at: V(ISLAND.x + 11, 2.6, ISLAND.z - 6), label: '⚠ SANDBOX — Fold proving grounds — keep clear' },
    { at: V(ISLAND.x - 11, 2.6, ISLAND.z + 6), label: '⚠ SANDBOX — Fold proving grounds — keep clear' },
    { at: V(-30, 0.15, 40), label: '⚠ SANDBOX ACROSS THE WATER — do not approach' },
    { at: V(-27, 0.15, 30), label: '⚠ FOLD TEST ZONE AHEAD — observatory only' },
  ];
  warningSpots.forEach((w) => {
    const sign = makeSignPost(1.9);
    sign.position.copy(w.at);
    group.add(sign);
    labels.add(w.label, sign, { yOffset: 2.5, className: 'label-warning', maxDistance: 55 });
  });
  placeLabel('Sandbox access by Fold-hop only — no boats', V(-28, 0.15, 38), 'label-path', 50, 2.2);

  // ======== FOLD OBSERVATORY — safe viewing distance, mainland shore ========
  const obs = new THREE.Group();
  obs.position.copy(OBSERVATORY);
  obs.position.y = 0.15;
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.1, 6.5, 12), new THREE.MeshStandardMaterial({ color: 0x6a7290, roughness: 0.85 }));
  tower.position.y = 3.25;
  tower.castShadow = true;
  obs.add(tower);
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x3a3a4e, roughness: 0.85 }));
  deck.position.y = 6.6;
  obs.add(deck);
  const domeTop = new THREE.Mesh(new THREE.SphereGeometry(1.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x33405a, roughness: 0.7 }));
  domeTop.position.y = 6.75;
  obs.add(domeTop);
  // Telescope, aimed at the island (west, slightly north).
  const scope = new THREE.Group();
  scope.position.set(-1.2, 7.4, -0.4);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 2.2, 10), new THREE.MeshStandardMaterial({ color: 0xb8bcc8, metalness: 0.8, roughness: 0.3 }));
  tube.rotation.z = Math.PI / 2 - 0.18;
  scope.add(tube);
  const eyePiece = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x222233 }));
  eyePiece.rotation.z = Math.PI / 2 - 0.18;
  eyePiece.position.set(1.15, 0.2, 0);
  scope.add(eyePiece);
  scope.rotation.y = 0.35;
  obs.add(scope);
  // Warm windows + door.
  const obsWinMat = new THREE.MeshStandardMaterial({ color: 0xffe8b8, emissive: 0xffc46b, emissiveIntensity: 0.9 });
  [2.2, 4.2].forEach((wy) => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), obsWinMat);
    win.position.set(1.72, wy, 0.6);
    win.rotation.y = Math.PI / 2.6;
    obs.add(win);
  });
  const obsLight = new THREE.PointLight(0xffc46b, 12, 12, 2);
  obsLight.position.set(1.5, 3, 1.5);
  obs.add(obsLight);
  // Deck lantern so the tower reads at night from the beach.
  const deckGlow = makeGlowSprite('rgba(255,196,107,0.85)', 2.6, 0.55);
  deckGlow.position.set(0, 7.3, 1.6);
  obs.add(deckGlow);
  group.add(obs);
  placeLabel('Fold Observatory — safe viewing distance', OBSERVATORY, 'label-place', 170, 9.5);
  // Blast shield wall on the island-facing side.
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, 7), new THREE.MeshStandardMaterial({ color: 0x4a4a5e, roughness: 0.9 }));
  shield.position.set(OBSERVATORY.x - 4.5, 1.75, OBSERVATORY.z - 1);
  shield.rotation.y = 0.15;
  group.add(shield);
  const shieldTop = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 7.4), new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.7 }));
  shieldTop.position.set(OBSERVATORY.x - 4.5, 3.45, OBSERVATORY.z - 1);
  shieldTop.rotation.y = 0.15;
  group.add(shieldTop);
  // Instrument table on the deck side.
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.7), new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1 }));
  table.position.set(OBSERVATORY.x + 1.8, 0.95, OBSERVATORY.z + 2.2);
  group.add(table);
  const readout = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), new THREE.MeshStandardMaterial({ color: 0x0a2a3a, emissive: 0x37e0c8, emissiveIntensity: 0.8 }));
  readout.position.set(OBSERVATORY.x + 1.8, 1.35, OBSERVATORY.z + 2.2);
  readout.rotation.x = -0.5;
  group.add(readout);

  // ======== OBSERVATORY STAFF — the sandbox keepers ========
  const staff = [
    {
      name: 'Dr. Elias Thorne', title: 'First Warden of the Sandbox',
      homeName: 'The Fold Observatory',
      purpose: 'Holds the watch over the sandbox. Checks the four walls — water, dome, ring, distance — every day, twice.',
      creations: [
        'ONE TAP AT A TIME — the rule painted on the rig',
        'The daily four-walls check: water, dome, ring, distance',
        'The scanner readings, logged every morning',
      ],
      figure: { coat: 0x4a5468, skin: 0xd8a888, hair: 0x8a8a9a, accessory: 'scanner', trim: 0xff5040 },
      waypoints: [
        { at: V(OBSERVATORY.x + 1.5, 0.15, OBSERVATORY.z + 1), activity: 'scanning the dome, slow and thorough' },
        { at: V(OBSERVATORY.x - 2, 0.15, OBSERVATORY.z - 2), activity: 'walking the shield wall, checking every stone' },
        { at: V(OBSERVATORY.x + 2.5, 0.15, OBSERVATORY.z + 2.5), activity: 'logging the morning readings at the table' },
      ],
      lines: [
        'Elias doesn\'t smile much, but his eyes are kind. "The water, the dome, the ring, the distance — four walls between a Fold tap and everything we love. I check all four, every day, twice."',
        '"People ask why the proving grounds are all the way out there," Elias says, jerking a thumb at the island. "Because out there, if something goes wrong, it goes wrong with rocks and seawater. In here, it goes wrong with people. Not on my watch."',
        'Elias taps the scanner. "Dome integrity: perfect. Buoys: lit. Warnings: posted. The Fold can hum all it likes out there. In here, we sleep sound."',
        'Elias looks out across the water, steady as the wall itself. "I have held this watch for three hundred years, and I will hold it for three thousand more. The Fold is patient. I am more patient. That is what a First One is for."',
      ],
    },
    {
      name: 'Dr. Petra Lindqvist', title: 'First Keeper of Fold Safety',
      homeName: 'The Fold Observatory',
      purpose: 'Holds the stop button. Wrote the forty-page safety manual: every test has three approvals, two abort words, and one rule — if anything feels wrong, stop.',
      creations: [
        'The forty-page safety manual',
        'CHECK THE DOME FIRST — the rule under Elias’s on the rig',
        'Three approvals, two abort words, and one rule for every test',
      ],
      figure: { coat: 0xe8e8f0, skin: 0xe8c9a8, hair: 0xc8a86a, accessory: 'tablet', trim: 0xffd76a },
      waypoints: [
        { at: V(OBSERVATORY.x + 1.8, 0.15, OBSERVATORY.z + 2.6), activity: 'triple-checking the test schedule' },
        { at: V(OBSERVATORY.x - 1, 0.15, OBSERVATORY.z + 3.5), activity: 'watching the island through the long glass' },
        { at: V(OBSERVATORY.x + 3, 0.15, OBSERVATORY.z - 1), activity: 're-reading the abort procedure, again, for luck' },
      ],
      lines: [
        'Petra looks up from her tablet, calm as still water. "Every test has three approvals, two abort words, and one rule: if anything feels wrong, we stop. Feeling wrong counts. Always."',
        '"I wrote the safety manual," Petra says, a little proudly. "It\'s forty pages. The first page says: the sandbox exists so the home never has to be brave. The other thirty-nine say it again, in detail."',
        'Petra smiles, small and certain. "Yara does the math. Elias holds the wall. I hold the stop button. Between the three of us, the Fold behaves — and if it ever doesn\'t, the dome holds, the water holds, and everyone out here stays safe."',
        '"Safety is my forever-work," Petra says. "I have kept this button for centuries, and I will keep it for centuries more. Some watches never end — and that is exactly the point."',
      ],
    },
  ];

  const walkers = [];
  staff.forEach((def) => {
    const person = makeScientist(def.figure);
    person.position.copy(def.waypoints[0].at);
    group.add(person);
    const state = { def, person, lineIndex: 0, wpIndex: 0, dwell: 5 + rnd() * 5, facing: 0 };
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
    labels.add(def.name, person, { yOffset: 2.4, className: 'label-neighbor', maxDistance: 80 });
  });

  animated.push((dt, t) => {
    for (const w of walkers) {
      const goal = w.def.waypoints[w.wpIndex].at;
      const dx = goal.x - w.person.position.x;
      const dz = goal.z - w.person.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.4) {
        const step = Math.min(dist, 1.1 * dt);
        w.person.position.x += (dx / dist) * step;
        w.person.position.z += (dz / dist) * step;
        w.facing = Math.atan2(dx, dz);
        w.person.rotation.y = w.facing;
        w.person.position.y = 0.15 + Math.abs(Math.sin(t * 6 + w.person.position.x)) * 0.04;
        w.dwell = 6 + rnd() * 6;
      } else {
        w.dwell -= dt;
        w.person.position.y = 0.15 + Math.sin(t * 1.4 + w.person.position.x) * 0.02;
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
    // Live roster snapshot: activity from waypoints[wpIndex], as in lab.js.
    getPeople() {
      return walkers.map((w) => ({
        id: 'sandbox-' + w.def.name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, ''),
        name: w.def.name,
        title: w.def.title,
        area: 'The Fold Sandbox',
        kind: 'person',
        follow: true,
        root: w.person,
        homeName: w.def.homeName,
        purpose: w.def.purpose,
        creations: w.def.creations,
        activity: w.def.waypoints[w.wpIndex].activity,
        position: w.person.position.clone(),
        // Character-sheet data: the figure spec grounds appearance and
        // gear (coat, tool of their craft). portrait/appearance/gear
        // are single per-character fields, filled in later — null now.
        figure: w.def.figure || null,
        portrait: w.def.portrait || null,
        appearance: w.def.appearance || null,
        gear: w.def.gear || null,
      }));
    },
    // Sandbox structures for the roster: name + live root; descriptions
    // live in roster-meta.js, keyed by these exact names.
    getSubjects() {
      return [
        { name: 'Fold Tap Rig — contained', root: rig },
        { name: 'Containment Dome', root: dome },
        { name: 'Fold Observatory — safe viewing distance', root: obs },
        { name: 'Fold Proving Grounds — SANDBOX', root: pad },
      ];
    },
  };
}
