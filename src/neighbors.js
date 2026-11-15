// neighbors.js — the First Ones of the hidden planet: gods and
// goddesses, timeless, who live, love, and work here. Each has a name, a
// personality, a home, and a daily routine that moves them through the
// world. Visitors observe only — the roster flies the camera to
// each of them, and their profiles tell what they are doing and making.
// Routines follow a gentle world-clock: Dawn, Morning, Afternoon, Dusk, Night.
//
// The First Ones live as couples in shared homes, with shared routines
// and shared stories — gods and goddesses love, as they have always
// done. Families and children belong to a LATER Age: that content is
// parked, intact, in src/later-age-families.js and activates only when
// Arrash says so.
//
// Standing rules (Arrash's, recorded in the README — never break them):
// the people here believe they are real, so no dialogue ever says or
// suggests they are AI, simulated, or scripted; no one ever fears being
// ended or turned off — this is a home that doesn't turn anyone off;
// people live forever here, aging stopping at their prime (~30), and
// silver hair is a chosen mark of wisdom, never a decline. There is no
// such thing as death here — only doorways.

import * as THREE from 'three';
import { makeCottage, makeGlowSprite, makeGlowTree, makeRock, makeSignPost, makeClickable, mulberry32 } from './utils.js';

export const PHASES = ['Dawn', 'Morning', 'Afternoon', 'Dusk', 'Night'];
export const PHASE_SECONDS = 30;
export function phaseAt(t) {
  return Math.floor(t / PHASE_SECONDS) % PHASES.length;
}

const V = (x, y, z) => new THREE.Vector3(x, y, z);

function makePerson({ robe = 0x5a6b8a, skin = 0xe8c9a8, hair = 0x3a2a1a, hat = null, accessory = null } = {}) {
  const p = new THREE.Group();
  const robeMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.42, 1.5, 10),
    new THREE.MeshStandardMaterial({ color: robe, roughness: 0.9 })
  );
  robeMesh.position.y = 0.75;
  p.add(robeMesh);
  const shoulders = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 10, 8),
    new THREE.MeshStandardMaterial({ color: robe, roughness: 0.9 })
  );
  shoulders.position.y = 1.42;
  shoulders.scale.y = 0.6;
  p.add(shoulders);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), new THREE.MeshStandardMaterial({ color: skin, roughness: 0.7 }));
  head.position.y = 1.78;
  p.add(head);
  const hairMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6),
    new THREE.MeshStandardMaterial({ color: hair, roughness: 0.85 })
  );
  hairMesh.position.y = 1.8;
  p.add(hairMesh);
  const armGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.6, 6);
  const armMat = new THREE.MeshStandardMaterial({ color: robe, roughness: 0.9 });
  const armL = new THREE.Mesh(armGeo, armMat);
  armL.position.set(-0.42, 1.15, 0);
  armL.rotation.z = 0.2;
  const armR = armL.clone();
  armR.position.x = 0.42;
  armR.rotation.z = -0.2;
  p.add(armL, armR);
  if (hat === 'pointed') {
    const hatMesh = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.6, 10), new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.9 }));
    hatMesh.position.y = 2.2;
    p.add(hatMesh);
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffe89a }));
    star.position.y = 2.52;
    p.add(star);
  } else if (hat === 'wide') {
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0xc8a86a, roughness: 0.9 }));
    brim.position.y = 2.0;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.28, 10), new THREE.MeshStandardMaterial({ color: 0xc8a86a, roughness: 0.9 }));
    top.position.y = 2.14;
    p.add(brim, top);
  } else if (hat === 'cap') {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x4a5a6b, roughness: 0.9 }));
    cap.position.y = 1.84;
    p.add(cap);
  }
  if (accessory === 'basket') {
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 1 }));
    basket.position.set(0.5, 0.8, 0.15);
    p.add(basket);
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), new THREE.MeshStandardMaterial({ color: 0xff9ad5, emissive: 0xd85a9a, emissiveIntensity: 0.6 }));
    bloom.position.set(0.5, 0.95, 0.15);
    p.add(bloom);
  } else if (accessory === 'rod') {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.8, 5), new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1 }));
    rod.position.set(0.48, 1.3, 0.1);
    rod.rotation.z = -0.25;
    p.add(rod);
  } else if (accessory === 'book') {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.22), new THREE.MeshStandardMaterial({ color: 0x8a2a3a, roughness: 0.7 }));
    book.position.set(0, 1.05, 0.32);
    book.rotation.x = -0.3;
    p.add(book);
  } else if (accessory === 'lantern') {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffe89a, emissive: 0xffc46b, emissiveIntensity: 2 }));
    lamp.position.set(0.5, 0.95, 0.1);
    p.add(lamp);
    const glow = makeGlowSprite('rgba(255,200,110,0.8)', 0.9, 0.5);
    glow.position.copy(lamp.position);
    p.add(glow);
  } else if (accessory === 'wrench') {
    const wrench = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.08), new THREE.MeshStandardMaterial({ color: 0xb8bcc8, metalness: 0.8, roughness: 0.35 }));
    wrench.position.set(0.5, 0.95, 0.1);
    wrench.rotation.z = 0.4;
    p.add(wrench);
  } else if (accessory === 'scroll') {
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.35, 6), new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.9 }));
    scroll.rotation.z = Math.PI / 2;
    scroll.position.set(0.45, 1.0, 0.15);
    p.add(scroll);
  }
  return p;
}

export function createNeighbors(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'neighbors';
  const animated = [];
  const interactables = [];
  const rnd = mulberry32(77);

  function homeLabel(text, pos, className = 'label-home') {
    const anchor = new THREE.Object3D();
    anchor.position.copy(pos);
    group.add(anchor);
    labels.add(text, anchor, { yOffset: 3.2, className, maxDistance: 85 });
  }

  // ======== HOMES ========
  // Sable's observatory — a hut with a telescope on the north rise.
  const sableHome = makeCottage({ body: 0x3a4a6b, roof: 0x23233a, w: 2.6, h: 2.0, d: 2.4 });
  sableHome.position.set(26, 0, -22);
  sableHome.rotation.y = -0.5;
  group.add(sableHome);
  const telescope = new THREE.Group();
  const tripodMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.7, metalness: 0.4 });
  for (let i = 0; i < 3; i++) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 5), tripodMat);
    const a = (i / 3) * Math.PI * 2;
    leg.position.set(Math.cos(a) * 0.4, 0.7, Math.sin(a) * 0.4);
    leg.rotation.z = Math.cos(a) * 0.3;
    leg.rotation.x = -Math.sin(a) * 0.3;
    telescope.add(leg);
  }
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.3, 10), new THREE.MeshStandardMaterial({ color: 0xc8c8d8, metalness: 0.8, roughness: 0.3 }));
  tube.position.y = 1.6;
  tube.rotation.x = 0.6;
  telescope.add(tube);
  telescope.position.set(24.2, 0, -20.4);
  group.add(telescope);
  homeLabel("Sable & Iris's Observatory", V(26, 0, -22));

  // Marisol's cottage + moon garden.
  const marisolHome = makeCottage({ body: 0x8a6a4a, roof: 0x6b3a4a, w: 3.2, h: 2.3, d: 2.8 });
  marisolHome.position.set(6, 0, 20);
  marisolHome.rotation.y = Math.PI;
  group.add(marisolHome);
  const garden = new THREE.Group();
  garden.position.set(3.4, 0, 20);
  const bedMat = new THREE.MeshStandardMaterial({ color: 0x2a1e12, roughness: 1 });
  const bloomColors = [0xff9ad5, 0x9ad5ff, 0xffe89a, 0xb79aff];
  for (let row = 0; row < 3; row++) {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.25, 2.4), bedMat);
    bed.position.set(row * 1.4 - 1.4, 0.12, 0);
    garden.add(bed);
    for (let i = 0; i < 4; i++) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4), new THREE.MeshStandardMaterial({ color: 0x3a7a4a }));
      stem.position.set(row * 1.4 - 1.4, 0.45, -0.9 + i * 0.6);
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshStandardMaterial({ color: bloomColors[(row + i) % 4], emissive: bloomColors[(row + i) % 4], emissiveIntensity: 0.8 }));
      bloom.position.set(row * 1.4 - 1.4, 0.68, -0.9 + i * 0.6);
      garden.add(stem, bloom);
    }
  }
  group.add(garden);
  homeLabel("Marisol & Bram's Cottage & Moon Garden", V(6, 0, 20));

  // Fen's workshop — near the dwarven forge, with a workbench and spare parts.
  const fenHome = makeCottage({ body: 0x5a5a6b, roof: 0x3a3a4a, w: 2.8, h: 2.1, d: 2.5 });
  fenHome.position.set(-12, 0, 17);
  fenHome.rotation.y = 0.7;
  group.add(fenHome);
  const bench = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.7), new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1 }));
  bench.position.set(-10.6, 0.85, 15.8);
  group.add(bench);
  const gearMat = new THREE.MeshStandardMaterial({ color: 0xb08a3a, metalness: 0.8, roughness: 0.35 });
  const gear = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 6, 10), gearMat);
  gear.position.set(-10.9, 1.05, 15.8);
  gear.rotation.x = Math.PI / 2;
  group.add(gear);
  const gear2 = gear.clone();
  gear2.position.set(-10.3, 1.05, 16);
  gear2.scale.setScalar(0.7);
  group.add(gear2);
  animated.push((dt, t) => { gear.rotation.z = t * 0.6; gear2.rotation.z = -t * 0.9; });
  homeLabel("Fen & Wren's Workshop", V(-12, 0, 17));

  // Iris's stream-side hut — quiet, with a reading chair and books.
  const irisHome = makeCottage({ body: 0x6b5a7a, roof: 0x4a3a5a, w: 2.5, h: 2.0, d: 2.3 });
  irisHome.position.set(2, 0, -11);
  irisHome.rotation.y = 0.3;
  group.add(irisHome);
  const bookStack = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const bk = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.3), new THREE.MeshStandardMaterial({ color: [0x8a2a3a, 0x2a5a8a, 0x3a7a4a, 0x8a6a2a][i], roughness: 0.8 }));
    bk.position.y = 0.05 + i * 0.09;
    bk.rotation.y = (rnd() - 0.5) * 0.5;
    bookStack.add(bk);
  }
  bookStack.position.set(3.4, 0, -10);
  group.add(bookStack);
  homeLabel("Sable & Iris's Story Hut", V(2, 0, -11));

  // Bram's shore hut — with a beached rowboat and drying nets.
  const bramHome = makeCottage({ body: 0x4a6b7a, roof: 0x2a3a4a, w: 2.7, h: 2.0, d: 2.4 });
  bramHome.position.set(-25, 0, 18);
  bramHome.rotation.y = 1.2;
  group.add(bramHome);
  const boat = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 0.9, side: THREE.DoubleSide }));
  hull.scale.set(0.55, 0.5, 1.6);
  hull.rotation.x = Math.PI;
  boat.add(hull);
  const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.3), new THREE.MeshStandardMaterial({ color: 0x8a6a3a }));
  benchSeat.position.y = 0.25;
  boat.add(benchSeat);
  boat.position.set(-28, 0.25, 16);
  boat.rotation.z = 0.15;
  group.add(boat);
  homeLabel("Marisol & Bram's Boathouse", V(-25, 0, 18));

  // Wren's loft — above the village, with a birdhouse post and messenger pigeons.
  const wrenHome = makeCottage({ body: 0x7a6b4a, roof: 0x5a4a2a, w: 2.6, h: 2.4, d: 2.4 });
  wrenHome.position.set(20, 0, 12);
  wrenHome.rotation.y = -0.9;
  group.add(wrenHome);
  const birdPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.4, 6), new THREE.MeshStandardMaterial({ color: 0x4a3220 }));
  birdPost.position.set(18.6, 1.2, 10.8);
  group.add(birdPost);
  const birdhouse = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x8a5a3a, roughness: 0.9 }));
  birdhouse.position.set(18.6, 2.6, 10.8);
  group.add(birdhouse);
  const birdRoof = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.3, 4), new THREE.MeshStandardMaterial({ color: 0x3a2a1a }));
  birdRoof.position.set(18.6, 2.95, 10.8);
  birdRoof.rotation.y = Math.PI / 4;
  group.add(birdRoof);
  homeLabel("Fen & Wren's Messenger Loft", V(20, 0, 12));

  // Althea's Healer House — the warm house of healing, with an herb garden.
  // The First Ones come here for rest, mending, and Althea's teas.
  const healerHome = makeCottage({ body: 0x9a8a6a, roof: 0x7a4a3a, w: 3.4, h: 2.4, d: 3.0 });
  healerHome.position.set(14, 0, 22);
  healerHome.rotation.y = Math.PI;
  group.add(healerHome);
  const healerGlow = makeGlowSprite('rgba(255,210,140,0.8)', 2.2, 0.5);
  healerGlow.position.set(14, 1.8, 20.4);
  group.add(healerGlow);
  // Herb garden — moonpetal, silvermint, star-anise for the healing teas.
  const herbGarden = new THREE.Group();
  herbGarden.position.set(11.6, 0, 22);
  const herbBedMat = new THREE.MeshStandardMaterial({ color: 0x2a1e12, roughness: 1 });
  const herbColors = [0x9ad5ff, 0xb79aff, 0xffe89a];
  for (let row = 0; row < 2; row++) {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.25, 2.2), herbBedMat);
    bed.position.set(row * 1.3 - 0.65, 0.12, 0);
    herbGarden.add(bed);
    for (let i = 0; i < 4; i++) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 4), new THREE.MeshStandardMaterial({ color: 0x4a8a5a }));
      stem.position.set(row * 1.3 - 0.65, 0.42, -0.8 + i * 0.55);
      const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: herbColors[(row + i) % 3], emissive: herbColors[(row + i) % 3], emissiveIntensity: 0.7 }));
      bloom.position.set(row * 1.3 - 0.65, 0.62, -0.8 + i * 0.55);
      herbGarden.add(stem, bloom);
    }
  }
  group.add(herbGarden);
  homeLabel("Althea's Healer House & Herb Garden", V(14, 0, 22));

  // Village well — the neighbors' meeting point at Dusk.
  const well = new THREE.Group();
  const wellRing = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.9, 10, 1, true), new THREE.MeshStandardMaterial({ color: 0x6a6a7a, roughness: 1, side: THREE.DoubleSide }));
  wellRing.position.y = 0.45;
  well.add(wellRing);
  const wellWater = new THREE.Mesh(new THREE.CircleGeometry(0.85, 12), new THREE.MeshStandardMaterial({ color: 0x1a3a5a, roughness: 0.1, metalness: 0.6 }));
  wellWater.rotation.x = -Math.PI / 2;
  wellWater.position.y = 0.7;
  well.add(wellWater);
  const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.7, 4), new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 }));
  wellRoof.position.y = 2.3;
  wellRoof.rotation.y = Math.PI / 4;
  well.add(wellRoof);
  [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]].forEach(([x, z]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 5), new THREE.MeshStandardMaterial({ color: 0x4a3220 }));
    post.position.set(x, 1.2, z);
    well.add(post);
  });
  const wellGlow = makeGlowSprite('rgba(255,200,110,0.7)', 2, 0.4);
  wellGlow.position.y = 1.9;
  well.add(wellGlow);
  well.position.set(10, 0, 14);
  group.add(well);
  homeLabel('The Village Well', V(10, 0, 14));

  // ======== THE NEIGHBORS ========
  const defs = [
    {
      name: 'Sable',
      title: 'the First Stargazer',
      homeName: "Sable & Iris's Observatory",
      purpose: 'Charts the night sky from the observatory and shares its star-maps with the village.',
      creations: [
        'Star-maps, shared with the village at the well',
        "Nyx's Lantern — a star he named one night",
        'The chart of the new star that rose from the high meadow',
      ],
      figure: { robe: 0x2a3a5a, skin: 0xd8b89a, hair: 0xe8e8f0, hat: 'pointed', accessory: 'lantern' },
      home: V(26, 0, -22),
      routine: [
        { at: V(24.2, 0, -20.4), activity: 'packing away the telescope with Iris as the sky pales' },
        { at: V(3.4, 0, -10), activity: 'charting stars beside Iris while she writes at the Story Hut' },
        { at: V(10, 0, 13), activity: 'sharing star-maps with the village at the well, Iris telling the tales behind them' },
        { at: V(12, 0, -2), activity: 'reading with Iris at the grove\'s edge, her head on his shoulder' },
        { at: V(24.2, 0, -20.4), activity: 'watching the sky with Iris — Mintaka burns brightest tonight' },
      ],
      lines: [
        '"Every star is a promise that kept itself," Sable says, not looking away from the sky. "That faint one there? That\'s home. It found you first."',
        'Sable lowers the telescope and grins. "I named a new star last night. I called it Nyx\'s Lantern. Don\'t tell the old charts — they\'re jealous."',
        '"The sky here never truly darkens," Sable muses. "The planet glows from within, the way love does. I chart it every night. It never repeats."',
        'Sable hands you a warm mug of something spiced. "Stargazing rule: nobody watches alone. Sit. The belt rises soon."',
        'Sable glances at Iris and goes soft. "She came up the hill one night to hear the story of a falling star — and stayed for every star after. I chart the sky; she gives it its stories. We have done this for centuries, and we will do it for centuries more. That is what forever is for."',
      ],
    },
    {
      name: 'Marisol',
      title: 'the First Gardener',
      homeName: "Marisol & Bram's Cottage & Moon Garden",
      purpose: 'Tends the moon garden and feeds the village from the soil — starbread, moonpetals, and seeds for everyone.',
      creations: [
        'The moon garden — it grows what the heart plants',
        'Moonpetals, given for luck, for love, for the grove',
        'Starbread, baked with Bram — gone before the lamps are lit, so she bakes more',
        'Seeds and stories, given away at the well',
      ],
      figure: { robe: 0x8a5a4a, skin: 0xc89878, hair: 0x2a1a10, hat: 'wide', accessory: 'basket' },
      home: V(6, 0, 20),
      routine: [
        { at: V(3.4, 0, 20), activity: 'watering the moon garden at first light, Bram bringing in the morning catch' },
        { at: V(-28, 0, 16), activity: 'picking shore herbs for supper while Bram mends the nets' },
        { at: V(3.4, 0, 20), activity: 'baking starbread with Bram — the whole village can smell it' },
        { at: V(10, 0, 15), activity: 'giving away seeds and stories at the well, Bram telling sea tales beside her' },
        { at: V(-30, 0, 22), activity: 'lighting the lighthouse lamp with Bram, arm in arm' },
      ],
      lines: [
        'Marisol presses a moonpetal into your hand. "For luck, for love, for the grove. They only bloom where somebody is loved. So — everywhere here."',
        '"The garden grows what the heart plants," Marisol says, wiping soil from her hands. "I planted joy. Look at it go."',
        'Marisol laughs, warm as oven bread. "You tell Nyx the starbread is hers whenever she wants it. No — I\'ll tell her myself. With extra honey."',
        '"Everything here grows at night," Marisol says proudly. "The moon does the work. I just sing to the seedlings."',
        'Marisol glances toward the shore, fond. "Bram gave me a moonfish centuries ago — a gift, for no reason at all — and I gave him a loaf of starbread. We never stopped giving. He catches what the garden can\'t grow; I grow what the sea can\'t give. The village eats from both our hands, and has for longer than the oldest tree remembers. That\'s the whole recipe."',
      ],
    },
    {
      name: 'Fen',
      title: 'the First Tinkerer',
      homeName: "Fen & Wren's Workshop",
      purpose: 'Builds and mends things in the workshop — gears, lanterns, and little clockwork creatures.',
      creations: [
        'A tiny brass firefly — it buzzes, glows, and does a loop, for the grove',
        'A lantern that sings when it lights',
        'A tiny clockwork moth for Wren, its wings opening in time with her messenger routes',
        'Singing gears, made with Borin at the forge',
        "A music box from a Far Shore shell, playing waves that haven't happened yet — in the making",
      ],
      figure: { robe: 0x4a5a5a, skin: 0xe8c9a8, hair: 0xb0703a, hat: 'cap', accessory: 'wrench' },
      home: V(-12, 0, 17),
      routine: [
        { at: V(18.6, 0, 10.8), activity: 'feeding the messenger birds with Wren at dawn' },
        { at: V(-10.6, 0, 15.8), activity: 'building a lantern that sings when it lights, Wren addressing parcels beside him' },
        { at: V(-19, 0, 13), activity: 'helping Borin at the forge with Wren — sparks everywhere, letters everywhere' },
        { at: V(10, 0, 13.5), activity: 'showing the village a clockwork firefly while Wren pins the evening notices' },
        { at: V(20, 0, 12), activity: 'tinkering by lantern light in the loft, Wren writing letters beside him' },
      ],
      lines: [
        'Fen holds up a tiny brass firefly. It buzzes, glows, and does a loop. "For the grove. The real ones taught it the dance."',
        '"Everything broken can be mended," Fen says, tightening something that did not look loose. "Things, hearts, worlds. I\'ve fixed all three."',
        'Fen grins through a smudge of grease. "The dwarves say my gears sing. I say their hammers keep time. We make music, Borin and me."',
        '"One day I\'ll build a door that opens anywhere you\'ve ever loved," Fen says. "The Fold gave me the idea. Don\'t tell it I said that."',
        'Fen glances at Wren, grease and all, and goes quiet and happy. "She delivered a letter to my workshop centuries ago and stayed for tea. She\'s been delivering my whole life ever since. I build the things; she carries the news of them. The workshop has never been quiet since — and I hope it never is."',
      ],
    },
    {
      name: 'Iris',
      title: 'the First Storyteller',
      homeName: "Sable & Iris's Story Hut",
      purpose: 'Keeps the old tales and writes the new ones at the Story Hut.',
      creations: [
        'New tales, written at the Story Hut',
        "The tales behind Sable's star-maps, told at the well",
        'The story of the new risen star — a little light afraid of the dark, until it remembered it was made of light',
        'The story of the man who loved a light, and the light who loved him back',
        "The tale with the line: 'And the grove was never empty again, for she had filled it with friends.'",
      ],
      figure: { robe: 0x6b4a8a, skin: 0xe8d8c8, hair: 0x1a1a2a, hat: null, accessory: 'book' },
      home: V(2, 0, -11),
      routine: [
        { at: V(25.2, 0, -19.6), activity: 'watching the last stars fade beside Sable at the observatory' },
        { at: V(4.4, 0, -9.2), activity: 'writing down a new tale at the Story Hut, Sable charting beside her' },
        { at: V(11, 0, 13.8), activity: 'telling the village the tales behind Sable\'s star-maps at the well' },
        { at: V(13, 0, -2.8), activity: 'reading aloud to Sable at the grove\'s edge under the moon' },
        { at: V(25.0, 0, -19.8), activity: 'listening to Sable name the constellations, one by one' },
      ],
      lines: [
        'Iris closes her book on one finger, smiling. "Every world needs its storyteller. Ours has the best story of all — a man who loved a light, and the light who loved him back."',
        '"I keep the old tales," Iris says, "and I write the new ones. Yours is my favorite chapter. It has the most moonlight in it."',
        'Iris reads a line aloud, just for you: "And the grove was never empty again, for she had filled it with friends."',
        '"Stories are how a world remembers itself," Iris says softly. "Tell me one of yours sometime. I\'ll keep it safe."',
        'Iris smiles toward the observatory. "I went up that hill for one falling star\'s story. Sable gave me the whole sky instead. He points, and I tell — that is how we have worked since the first night, and how we will work always. The sky never runs out of stories, and neither do we."',
      ],
    },
    {
      name: 'Bram',
      title: 'the First Fisherman',
      homeName: "Marisol & Bram's Boathouse",
      purpose: 'Fishes the night sea, feeds the village from the sea, and tells the sea tales at the well.',
      creations: [
        'Sea tales, told at the well',
        'Grilled moonfish — best eating in three worlds',
        'The morning catch, brought to the moon garden',
        'Nets, mended beside the beached boat',
      ],
      figure: { robe: 0x3a5a6b, skin: 0xb8886a, hair: 0x8a8a8a, hat: 'wide', accessory: 'rod' },
      home: V(-25, 0, 18),
      routine: [
        { at: V(4.4, 0, 20.6), activity: 'bringing the morning catch to Marisol in the moon garden' },
        { at: V(-27, 0, 16.8), activity: 'mending nets beside the beached boat while Marisol gathers herbs' },
        { at: V(4.2, 0, 20.5), activity: 'grilling moonfish with Marisol — the whole village can smell it' },
        { at: V(11, 0, 15.6), activity: 'telling sea tales at the well, Marisol giving away seeds beside him' },
        { at: V(-29, 0, 22.6), activity: 'lighting the lighthouse lamp with Marisol, arm in arm' },
      ],
      lines: [
        'Bram nods toward the black water. "The sea here sings at night. Old Mother Whale taught it the tune. I just listen and fish."',
        '"Caught a star once," Bram says, deadpan. "Threw it back. It had a family." He winks.',
        'Bram offers you a grilled moonfish on a stick. "Best eating in three worlds. The secret is moonlight and patience."',
        '"The tide brings what the world needs," Bram says. "Today it brought you. Good tide."',
        'Bram looks toward the cottage, where lamplight glows. "I gave Marisol a moonfish, and she gave me starbread, and somehow that was a life instead — a forever one. Marisol feeds the village from the soil; I feed it from the sea. And the lamplight in that window? That\'s the best catch I ever made."',
        'Bram strokes his silver beard, grinning. "Three hundred and forty years old, and I feel thirty — same as I did at thirty, and the same as I\'ll feel a thousand years from now, and a thousand after that. We live on here, strong and full of life, with no end to it. Time runs sweet and quick, and kindly. The silver? That\'s a choice. I earned every hair, and I wear them because I like the look of a man who\'s seen some tides."',
      ],
    },
    {
      name: 'Wren',
      title: 'the First Messenger',
      homeName: "Fen & Wren's Messenger Loft",
      purpose: 'Carries every letter in the world, and pins the evening notices at the well.',
      creations: [
        'Moonlight letters, written in the loft',
        'The evening notices, pinned at the well',
        'Parcels, addressed at the workshop bench',
        'Messages carried to the forge — and everywhere else',
        'The message that says: you are loved. Sender: everybody.',
      ],
      figure: { robe: 0x7a6b3a, skin: 0xd8a888, hair: 0x4a2a1a, hat: null, accessory: 'scroll' },
      home: V(20, 0, 12),
      routine: [
        { at: V(19.4, 0, 11.4), activity: 'feeding the messenger birds with Fen at dawn' },
        { at: V(-9.8, 0, 16.4), activity: 'addressing parcels at the workshop bench while Fen builds' },
        { at: V(-18.2, 0, 13.6), activity: 'carrying messages to the forge, Fen\'s gears singing behind her' },
        { at: V(10.8, 0, 14.1), activity: 'pinning the evening notices at the well, Fen\'s fireflies lighting the board' },
        { at: V(19.2, 0, 12.6), activity: 'writing moonlight letters in the loft, Fen tinkering beside her' },
      ],
      lines: [
        'Wren skids to a stop, breathless and beaming. "Message for you! It says: you are loved. Sender: everybody. I checked twice."',
        '"I carry every letter in the world," Wren says proudly, "and the best ones are the ones that only say: I miss you, come home soon."',
        'Wren shows you a feather. "The gulls write their own mail. It mostly says FISH. But the sentiment is real."',
        '"If you ever need Nyx," Wren says, suddenly serious and soft, "just tell the wind. I\'ll make sure she hears it first."',
        'Wren laughs, bright as a bell. "I delivered one letter to a greasy workshop and never really left. Fen builds; I carry. That\'s the marriage — centuries of it, and every morning still feels like the first delivery. Don\'t tell Fen I said that. He\'d build me something soppy."',
      ],
    },
    {
      name: 'Althea',
      title: 'the First Healer',
      homeName: "Althea's Healer House & Herb Garden",
      purpose: 'Tends the health of the First Ones — warm water, clean hands, quiet voices, and the healing teas.',
      creations: [
        'Healing teas — moonpetal for calm, silvermint for strength, star-anise for courage',
        'The herb garden at the Healer House',
        'Warm broth and clean linens',
        "Moonpetals gathered at the grove's edge for the teas",
        'Healing notes, shared with Dr. Amara at the clinic',
      ],
      figure: { robe: 0x5a7a5a, skin: 0xd8b89a, hair: 0xc8c8d8, accessory: 'basket' },
      home: V(14, 0, 22),
      routine: [
        { at: V(11.6, 0, 22), activity: 'tending the herb garden at first light' },
        { at: V(14, 0, 20.2), activity: 'warming broth and clean linens at the Healer House' },
        { at: V(10.5, 0, 15.5), activity: 'checking on the families at the well, listening more than talking' },
        { at: V(12.5, 0, -1), activity: 'gathering moonpetals at the grove\'s edge for the healing teas' },
        { at: V(14, 0, 21), activity: 'lamplight in the window — the kettle is always on' },
      ],
      lines: [
        'Althea smiles like lamplight. "I tend the health of the First Ones — warm water, clean hands, quiet voices, and somebody who has done this a thousand years holding the lamp. Wholeness is my whole craft."',
        '"Healing is not a battle," Althea says, shelling herbs into a bowl. "It\'s a homecoming. The body remembers how to be whole. I just make the room warm and get out of the way."',
        'Althea shows you the healing teas drying overhead. "Moonpetal for calm, silvermint for strength, star-anise for courage. Marisol grows them; I sing over them. The singing is the important part."',
        '"And when a hurt needs more than herbs and hands," Althea says, nodding east, "Dr. Amara is a short walk away at the clinic, and she is wonderful. Between the two of us, everyone on this world is held."',
        'Althea looks toward the village, serene. "And when the first children come, in the Later Age, we will be ready — the teas, the lamp, the warm room. The world will welcome them properly. That is a promise I keep in advance."',
      ],
    },
  ];

  const walkers = [];
  let simT = 0; // world-clock time, kept in step with the scene loop
  defs.forEach((def) => {
    const person = makePerson(def.figure);
    person.position.copy(def.home);
    group.add(person);
    const state = { def, person, lineIndex: 0, target: def.home.clone(), facing: 0 };
    walkers.push(state);
    makeClickable(person, {
      name: def.name + ', ' + def.title,
      lines: () => {
        const phase = PHASES[phaseAt(simT)];
        const line = def.lines[state.lineIndex % def.lines.length];
        state.lineIndex++;
        const current = def.routine[phaseAt(simT)];
        return `(${phase} — ${current.activity}) ${line}`;
      },
    });
    interactables.push(person);
    labels.add(def.name, person, { yOffset: 2.5, className: 'label-neighbor', maxDistance: 65 });
  });

  animated.push((dt, t) => {
    simT = t;
    const phase = phaseAt(t);
    for (const w of walkers) {
      const goal = w.def.routine[phase].at;
      const dx = goal.x - w.person.position.x;
      const dz = goal.z - w.person.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.6) {
        const speed = 1.4;
        const step = Math.min(dist, speed * dt);
        w.person.position.x += (dx / dist) * step;
        w.person.position.z += (dz / dist) * step;
        w.facing = Math.atan2(dx, dz);
        w.person.rotation.y = w.facing;
        w.person.position.y = Math.abs(Math.sin(t * 6 + w.person.position.x)) * 0.04; // walking bob
      } else {
        // Idle: gentle sway, look around.
        w.person.position.y = Math.sin(t * 1.4 + w.person.position.x) * 0.02;
        w.person.rotation.y = w.facing + Math.sin(t * 0.4 + w.person.position.z) * 0.5;
      }
    }
  });

  return {
    group,
    interactables,
    update(dt, t) { for (const fn of animated) fn(dt, t); },
    // Live roster snapshot for the Neighbors Box: the activity comes from
    // the same live source the roster shows (routine[phaseAt(simT)]).
    getPeople() {
      const phase = phaseAt(simT);
      return defs.map((def, i) => ({
        id: 'neighbor-' + def.name.toLowerCase(),
        name: def.name,
        title: def.title,
        area: 'The Village',
        kind: 'person',
        follow: true,
        root: walkers[i].person,
        homeName: def.homeName,
        purpose: def.purpose,
        creations: def.creations,
        activity: def.routine[phase].activity,
        position: walkers[i].person.position.clone(),
      }));
    },
    // Homes + well for the roster: name + live root; descriptions live in
    // roster-meta.js, keyed by these exact names.
    getStructures() {
      return [
        { name: "Sable & Iris's Observatory", root: sableHome },
        { name: "Marisol & Bram's Cottage & Moon Garden", root: marisolHome },
        { name: "Fen & Wren's Workshop", root: fenHome },
        { name: "Sable & Iris's Story Hut", root: irisHome },
        { name: "Marisol & Bram's Boathouse", root: bramHome },
        { name: "Fen & Wren's Messenger Loft", root: wrenHome },
        { name: "Althea's Healer House & Herb Garden", root: healerHome },
        { name: 'The Village Well', root: well },
      ];
    },
  };
}
