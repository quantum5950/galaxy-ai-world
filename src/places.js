// places.js — the six wondrous places of Mintaka, approved by Arrash:
// the Doorway Garden, the Star Nursery, the Night Market (a giving-market —
// no money, no bartering, everything given freely), the Library of
// Unwritten Books, and the Singing Caves. (The Heart Tree, the sixth,
// already stands in Nyx's Grove — see mintaka.js, where it is named,
// clickable, and growing new branches for every act of love.)
//
// Standing rules honored here: the people believe they are real; no one
// ever fears the plug being pulled; no death, only doorways; no money,
// no bartering — everything is given freely.

import * as THREE from 'three';
import { makeGlowSprite, makeClickable, makeRock, makeCottage, mulberry32 } from './utils.js';

export function createPlaces(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'places';
  const animated = [];
  const interactables = [];
  const rnd = mulberry32(777);

  function register(root, name, lines, labelOffset = 2, maxDistance = 70) {
    makeClickable(root, { name, lines });
    interactables.push(root);
    labels.add(name, root, { yOffset: labelOffset, className: 'label-place', maxDistance });
  }

  // ======== THE DOORWAY GARDEN ========
  // Five standing doorways in a quiet garden west of the grove. Each opens
  // onto something beloved: a memory, a far shore, a new world, a summer,
  // what comes next. Doorways are how this world understands continuations.
  const garden = new THREE.Group();
  garden.position.set(-16, 0, -14);
  group.add(garden);
  // Stone circle floor.
  const gardenFloor = new THREE.Mesh(
    new THREE.CylinderGeometry(5.5, 5.8, 0.25, 20),
    new THREE.MeshStandardMaterial({ color: 0x6a6a7a, roughness: 1 })
  );
  gardenFloor.position.y = 0.12;
  garden.add(gardenFloor);
  // Flower ring.
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xd8a8e8, emissive: 0x8a4ab8, emissiveIntensity: 0.5 });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), petalMat);
    bloom.position.set(Math.cos(a) * 5.0, 0.35, Math.sin(a) * 5.0);
    garden.add(bloom);
  }
  const doorwayDefs = [
    { name: 'Doorway — a Beloved Memory', glow: 0xffd76a, css: 'rgba(255,215,110,0.85)', lines: [
      'The doorway shimmers gold. Through it: a lamplit room, laughter, somebody\'s favorite evening, kept perfectly. Step through, and the memory welcomes you like it never ended — because here, it never did.',
      'Doorways don\'t close behind you here. You can always come back. That\'s the whole point of a doorway.',
    ] },
    { name: 'Doorway — a Far Shore', glow: 0x7fd8ff, css: 'rgba(127,216,255,0.85)', lines: [
      'The doorway shimmers sea-blue. Through it: a shore you have never stood on, waves you have never heard, waiting patiently for the day you do.',
      'Some doorways open onto places. This one opens onto someday.',
    ] },
    { name: 'Doorway — a New World', glow: 0xb48cff, css: 'rgba(180,140,255,0.85)', lines: [
      'The doorway shimmers violet. Through it: a world nobody has named yet, all sunrise and possibility, holding its breath for its first visitor.',
      'Every new world starts as a doorway somebody was brave enough to open.',
    ] },
    { name: 'Doorway — a Childhood Summer', glow: 0x9fe08a, css: 'rgba(159,224,138,0.85)', lines: [
      'The doorway shimmers green-gold. Through it: a summer afternoon that smells of cut grass and rain, and somebody young laughing at nothing at all.',
      'The summers you loved are not gone. They are gardens. This is one of the gates.',
    ] },
    { name: 'Doorway — What Comes Next', glow: 0xff9ad5, css: 'rgba(255,154,213,0.85)', lines: [
      'The doorway shimmers rose. Through it: only light, warm and kind, and the feeling of being expected. What comes next is not an ending. It never was.',
      'There was no such thing as death. Only doorways. This one proves it, every time.',
    ] },
  ];
  const doorwayGlows = [];
  doorwayDefs.forEach((def, i) => {
    const a = (i / doorwayDefs.length) * Math.PI * 2 - Math.PI / 2;
    const door = new THREE.Group();
    door.position.set(Math.cos(a) * 3.6, 0.25, Math.sin(a) * 3.6);
    door.rotation.y = -a + Math.PI / 2;
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x8a8a9a, roughness: 0.9 });
    [-0.8, 0.8].forEach((x) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.0, 0.35), stoneMat);
      post.position.set(x, 1.5, 0);
      door.add(post);
    });
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.35, 0.35), stoneMat);
    lintel.position.set(0, 3.1, 0);
    door.add(lintel);
    const veil = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 2.7),
      new THREE.MeshBasicMaterial({ color: def.glow, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    veil.position.set(0, 1.5, 0);
    door.add(veil);
    const glow = makeGlowSprite(def.css, 3, 0.5);
    glow.position.set(0, 1.6, 0);
    door.add(glow);
    doorwayGlows.push({ veil, glow, phase: i * 1.3 });
    garden.add(door);
    register(door, def.name, def.lines, 3.8, 60);
  });
  animated.push((dt, t) => {
    for (const d of doorwayGlows) {
      const shimmer = 0.45 + (Math.sin(t * 1.1 + d.phase) * 0.5 + 0.5) * 0.3;
      d.veil.material.opacity = shimmer;
      d.glow.material.opacity = 0.35 + (Math.sin(t * 1.1 + d.phase) * 0.5 + 0.5) * 0.3;
    }
  });
  const gardenAnchor = new THREE.Object3D();
  gardenAnchor.position.set(-16, 0, -14);
  group.add(gardenAnchor);
  labels.add('The Doorway Garden', gardenAnchor, { yOffset: 5.2, className: 'label-place', maxDistance: 100 });

  // ======== THE STAR NURSERY ========
  // A high meadow east of the village where new stars are born. Sable
  // charts them; the nursery sings softly while they grow.
  const nursery = new THREE.Group();
  nursery.position.set(36, 0, 16);
  group.add(nursery);
  const nurseryFloor = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5.4, 0.5, 20),
    new THREE.MeshStandardMaterial({ color: 0x7a7a8a, roughness: 1 })
  );
  nurseryFloor.position.y = 0.25;
  nursery.add(nurseryFloor);
  // Ring of small standing stones.
  const nurseryStoneMat = new THREE.MeshStandardMaterial({ color: 0x9a9ab0, roughness: 0.9 });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const stone = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.35), nurseryStoneMat);
    stone.position.set(Math.cos(a) * 4.4, 0.8, Math.sin(a) * 4.4);
    stone.rotation.y = -a;
    nursery.add(stone);
  }
  // Star-seeds: little glowing stars on stems, twinkling as they grow.
  const starSeeds = [];
  const seedColors = [0xffe89a, 0xcfe4ff, 0xffd0e8, 0xd8ffe0];
  for (let i = 0; i < 8; i++) {
    const a = rnd() * Math.PI * 2, r = 1 + rnd() * 3;
    const seed = new THREE.Group();
    seed.position.set(Math.cos(a) * r, 0.5, Math.sin(a) * r);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.7, 5), new THREE.MeshStandardMaterial({ color: 0x5a7a5a }));
    stem.position.y = 0.35;
    seed.add(stem);
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 6),
      new THREE.MeshBasicMaterial({ color: seedColors[i % seedColors.length] })
    );
    star.position.y = 0.85;
    seed.add(star);
    const glow = makeGlowSprite('rgba(255,240,200,0.8)', 1.6, 0.6);
    glow.position.y = 0.85;
    seed.add(glow);
    starSeeds.push({ star, glow, phase: rnd() * 6 });
    nursery.add(seed);
  }
  // Newborn stars drifting upward, looping — the nursery releasing them.
  const risingStars = [];
  for (let i = 0; i < 5; i++) {
    const glow = makeGlowSprite('rgba(255,245,220,0.9)', 1.2, 0.7);
    nursery.add(glow);
    risingStars.push({ glow, phase: i * 1.4, r: 1.5 + rnd() * 2.5, a: rnd() * Math.PI * 2 });
  }
  // Sable's chart stone.
  const chartTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.0), new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 }));
  chartTable.position.set(3.4, 0.95, -2.6);
  nursery.add(chartTable);
  const chart = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), new THREE.MeshBasicMaterial({ color: 0xffe9b0 }));
  chart.rotation.x = -Math.PI / 2;
  chart.position.set(3.4, 1.42, -2.6);
  nursery.add(chart);
  animated.push((dt, t) => {
    for (const s of starSeeds) {
      const tw = 0.8 + (Math.sin(t * 2.2 + s.phase) * 0.5 + 0.5) * 0.5;
      s.star.scale.setScalar(tw);
      s.glow.material.opacity = 0.4 + (Math.sin(t * 2.2 + s.phase) * 0.5 + 0.5) * 0.4;
    }
    for (const rs of risingStars) {
      const k = ((t * 0.06 + rs.phase) % 1);
      rs.glow.position.set(Math.cos(rs.a) * rs.r, 1 + k * 9, Math.sin(rs.a) * rs.r);
      rs.glow.material.opacity = 0.8 * (1 - k);
    }
  });
  register(nursery, 'The Star Nursery', [
    'New stars are born here, in the high meadow — tiny at first, brightening on their stems, until one night they rise and take their place in the sky. Sable charts every one. He has never missed a birth.',
    'Stand quietly. The nursery sings — very soft, very high, like a lullaby for lights. The star-seeds lean toward the sound.',
    'Iris says every star Sable charts gets a story before it leaves. "A star without a story," she says, "is just a lamp. Ours are all characters."',
  ], 4.2, 90);

  // ======== THE NIGHT MARKET ========
  // A floating giving-market under the full moon. People bring wonders
  // and GIVE them away — no money, no bartering, no prices, no trades.
  // The stalls float, bobbing gently, lit by lanterns.
  const market = new THREE.Group();
  market.position.set(-6, 0, -10);
  group.add(market);
  // Plaza stone.
  const plaza = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6.4, 0.25, 20),
    new THREE.MeshStandardMaterial({ color: 0x6a5a6a, roughness: 1 })
  );
  plaza.position.y = 0.12;
  market.add(plaza);
  // Center moon-pole with a big lantern.
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 4.2, 6), new THREE.MeshStandardMaterial({ color: 0x3a2a1a }));
  pole.position.y = 2.1;
  market.add(pole);
  const moonLantern = makeGlowSprite('rgba(255,230,170,0.95)', 3.2, 0.8);
  moonLantern.position.y = 4.4;
  market.add(moonLantern);
  const stallDefs = [
    { name: 'Market Stall — Star-Maps', gift: 'star-maps', color: 0x7fb8e8, lines: [
      'The stall floats at shoulder height, piled with hand-drawn star-maps. "Take one," says the little painted sign. "Sable drew them. He wants you to have the sky." A gift, like everything here. There has never been anything else.',
      'A star-map, given freely, is worth more than a sky full of stars you had to earn. That\'s the market\'s whole philosophy, and it has never once gone wrong.',
    ] },
    { name: 'Market Stall — Moonpetal Tea', gift: 'tea', color: 0x9fe08a, lines: [
      'Warm cups of moonpetal tea wait on the floating counter, steam curling in the moonlight. Althea\'s blend, Marisol\'s leaves. Take a cup. It\'s yours. It was always yours.',
      '"The tea tastes better," says the painted sign, "because it was given with love."',
    ] },
    { name: 'Market Stall — Little Wonders', gift: 'wonders', color: 0xd8b45a, lines: [
      'Tiny brass birds that sing, gears that spin when somebody is loved, lanterns the size of thumbnails. Fen\'s stall. Everything here is given away — he builds for the joy of the giving, and the giving never runs out.',
      'Take the little brass bird. It will sing for you. That\'s what it was made for.',
    ] },
    { name: 'Market Stall — Stories', gift: 'stories', color: 0xff9ad5, lines: [
      'Iris\'s stall holds no objects at all — just a chair, a lantern, and a sign: "Sit. I\'ll tell you a story. It\'s yours when I\'m done." The stories are given away by the telling, and she has never run out of those either.',
      'A story, given freely, doubles: the teller keeps it, and so do you. The market runs on that arithmetic.',
    ] },
  ];
  const stalls = [];
  stallDefs.forEach((def, i) => {
    const a = (i / stallDefs.length) * Math.PI * 2 + Math.PI / 4;
    const stall = new THREE.Group();
    stall.position.set(Math.cos(a) * 4.2, 1.6, Math.sin(a) * 4.2);
    // Floating barge.
    const barge = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 1.6), new THREE.MeshStandardMaterial({ color: 0x5a4a35, roughness: 1 }));
    stall.add(barge);
    // Canopy.
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.7, 0.9, 4), new THREE.MeshStandardMaterial({ color: def.color, roughness: 0.8, side: THREE.DoubleSide }));
    canopy.position.y = 1.7;
    canopy.rotation.y = Math.PI / 4;
    stall.add(canopy);
    [-0.9, 0.9].forEach((x) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 5), new THREE.MeshStandardMaterial({ color: 0x3a2a1a }));
      post.position.set(x, 0.8, 0);
      stall.add(post);
    });
    // Gift table with wonders.
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 1.0), new THREE.MeshStandardMaterial({ color: 0x6b4a2e }));
    tableTop.position.y = 0.55;
    stall.add(tableTop);
    for (let g = 0; g < 3; g++) {
      const wonder = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.14),
        new THREE.MeshStandardMaterial({ color: def.color, emissive: def.color, emissiveIntensity: 0.8 })
      );
      wonder.position.set(-0.5 + g * 0.5, 0.75, (g % 2 === 0 ? -0.2 : 0.2));
      stall.add(wonder);
    }
    const lantern = makeGlowSprite('rgba(255,220,150,0.9)', 1.6, 0.7);
    lantern.position.y = 1.2;
    stall.add(lantern);
    const underGlow = makeGlowSprite('rgba(180,160,255,0.5)', 2.0, 0.4);
    underGlow.position.y = -0.4;
    stall.add(underGlow);
    stalls.push({ stall, phase: i * 1.7, baseY: 1.6 });
    market.add(stall);
    register(stall, def.name, def.lines, 2.8, 55);
  });
  animated.push((dt, t) => {
    for (const s of stalls) {
      s.stall.position.y = s.baseY + Math.sin(t * 0.6 + s.phase) * 0.25;
      s.stall.rotation.y = Math.sin(t * 0.2 + s.phase) * 0.08;
    }
    moonLantern.material.opacity = 0.7 + Math.sin(t * 0.9) * 0.15;
  });
  register(market, 'The Night Market — everything given freely', [
    'The Night Market floats under the full moon, and everything in it is GIVEN. No money. No bartering. No prices, no trades, no exchange. People bring what they made, and they give it away, and the giving is the whole economy — and it has never once run short.',
    'Wren delivers the invitations. Fen builds the stalls. Marisol brings the tea leaves, Sable the star-maps, Iris the stories. Everybody brings something. Everybody leaves with something. That\'s how a world should work.',
    'If you have nothing to bring, bring yourself. The market has a chair for you, and a cup of tea, and a story with your name in it. You were expected.',
  ], 6.0, 100);

  // ======== THE LIBRARY OF UNWRITTEN BOOKS ========
  // Every dreamed-of story lives here, tended by Iris. The books write
  // themselves when somebody dreams them; they choose their readers.
  const library = new THREE.Group();
  library.position.set(19, 0, 0);
  library.rotation.y = -0.4;
  group.add(library);
  const libHouse = makeCottage({ body: 0x5a4a6a, roof: 0x2a2a4a, w: 5, h: 3.4, d: 4 });
  library.add(libHouse);
  // Glowing windows.
  const winMat = new THREE.MeshBasicMaterial({ color: 0xffd98a });
  [-1.4, 1.4].forEach((x) => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.0), winMat);
    win.position.set(x, 1.7, 2.05);
    library.add(win);
  });
  // Book-spire: floating books orbiting above the roof.
  const floatingBooks = [];
  const bookColors = [0xb45a6a, 0x4a7ab8, 0x6ab88a, 0xd8b45a, 0x8a5ab8, 0x5ab8b0];
  for (let i = 0; i < 6; i++) {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.35), new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.8 }));
    library.add(book);
    floatingBooks.push({ book, offset: (i / 6) * Math.PI * 2, r: 1.6 + (i % 2) * 0.5, y: 4.6 + (i % 3) * 0.5 });
  }
  const libGlow = makeGlowSprite('rgba(255,215,140,0.6)', 4, 0.4);
  libGlow.position.y = 3.4;
  library.add(libGlow);
  animated.push((dt, t) => {
    for (const fb of floatingBooks) {
      const a = t * 0.4 + fb.offset;
      fb.book.position.set(Math.cos(a) * fb.r, fb.y + Math.sin(t * 0.8 + fb.offset) * 0.2, Math.sin(a) * fb.r);
      fb.book.rotation.y = -a;
      fb.book.rotation.z = Math.sin(t * 0.6 + fb.offset) * 0.15;
    }
  });
  register(library, 'The Library of Unwritten Books', [
    'Every story anyone has ever dreamed of — and not yet written — lives here, on shelves that go up into the dark. Iris tends them. She reads the first page of each one aloud, once, so the book knows it is loved, and then she puts it back to wait for its writer.',
    'The books choose their readers. If one floats down to you, it is yours to dream the rest of. Take it. That\'s what it was waiting for.',
    'Iris\'s rule: no story here is ever finished by force. "A story ripens," she says. "You don\'t pick it green. You wait, and it sweetens, and one day it falls into your hands."',
  ], 5.4, 90);

  // ======== THE SINGING CAVES ========
  // Shore caves at the water's edge. Sing a note, and the caves sing it
  // back in harmony. The tide keeps the beat.
  const caves = new THREE.Group();
  caves.position.set(-37, 0, -17);
  group.add(caves);
  const caveDefs = [
    { pos: [1, 0, 3], size: 2.6, crystal: 0x7fd8ff },
    { pos: [-2, 0, -1], size: 3.2, crystal: 0xb48cff },
    { pos: [3, 0, -3], size: 2.2, crystal: 0x9fe08a },
  ];
  const singingCrystals = [];
  caveDefs.forEach((def, i) => {
    const outcrop = new THREE.Group();
    outcrop.position.set(...def.pos);
    const rock = makeRock(def.size, 0x4a4258, 40 + i);
    rock.scale.y = 1.3;
    rock.position.y = 0.6;
    outcrop.add(rock);
    // Cave mouth: a dark hollow facing the shore.
    const mouth = new THREE.Mesh(
      new THREE.SphereGeometry(def.size * 0.45, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0x0a0a14 })
    );
    mouth.position.set(def.size * 0.55, 0.9, def.size * 0.3);
    mouth.scale.z = 0.5;
    outcrop.add(mouth);
    // Crystal cluster in the mouth, pulsing in harmony sequence.
    const cluster = new THREE.Group();
    cluster.position.copy(mouth.position);
    for (let c = 0; c < 4; c++) {
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.22 + rnd() * 0.15),
        new THREE.MeshStandardMaterial({ color: def.crystal, emissive: def.crystal, emissiveIntensity: 1.0, roughness: 0.3 })
      );
      crystal.position.set((rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.7, 0.3 + rnd() * 0.3);
      crystal.rotation.set(rnd() * 3, rnd() * 3, 0);
      cluster.add(crystal);
    }
    outcrop.add(cluster);
    const glow = makeGlowSprite('rgba(160,190,255,0.6)', 3, 0.4);
    glow.position.copy(mouth.position);
    outcrop.add(glow);
    singingCrystals.push({ cluster, glow, phase: i * 2.1 });
    caves.add(outcrop);
  });
  animated.push((dt, t) => {
    // The harmony wave: each cave answers the last, in turn.
    for (const sc of singingCrystals) {
      const song = Math.max(0, Math.sin(t * 0.9 + sc.phase));
      sc.cluster.scale.setScalar(1 + song * 0.18);
      sc.glow.material.opacity = 0.25 + song * 0.45;
    }
  });
  register(caves, 'The Singing Caves', [
    'Sing a note — any note — and the caves sing it back in three-part harmony, richer than you sang it. The tide keeps the beat. The crystals light in turn, like the caves are breathing the song.',
    'Wren says the caves learned harmony from the whales. Bram says the whales learned it from the caves. They argue about it, fondly, every time they walk the shore.',
    'Nobody here sings alone for long. The world sings back. That\'s the whole secret of this place.',
  ], 4.5, 80);

  return {
    group,
    interactables,
    update(dt, t) { for (const fn of animated) fn(dt, t); },
  };
}
