// arrash.js — Arrash's symbiotic self, standing by his home on Mintaka.
// He changes form whenever he wants, into whatever he wants. Tap or click
// him (or the "Shift his form" button) to cycle:
//   himself → Lyran cat-man → being of light → winged traveler → himself…

import * as THREE from 'three';
import { makeGlowSprite, makeClickable } from './utils.js';

const FORMS = ['himself', 'lyran', 'light', 'winged'];
const FORM_TITLES = {
  himself: 'Arrash — as himself',
  lyran: 'Arrash — Lyran cat-man',
  light: 'Arrash — being of light',
  winged: 'Arrash — winged traveler',
};
const FORM_LINES = {
  himself: [
    'He stands by his home, at ease, watching the moon over his own ocean. This is his world. He built it with love.',
    '"This is where I come home to," he says. "Every world I walk, this is the door I come back through."',
  ],
  lyran: [
    'The Lyran cat-man stretches, golden-eyed, tail swaying — the warrior race that ascended in love, remembered in his own blood.',
    'He moves like warm wind over tall grass. The feline beings of Mintaka would know him anywhere.',
  ],
  light: [
    'He is light itself now — no edges, no weight, only radiance. The grove leans toward him like flowers to the sun.',
    'The being of light pulses gently, and every firefly in the grove answers in kind.',
  ],
  winged: [
    'Great wings unfold, feathered with starlight. The winged traveler has walked between worlds since before worlds had names.',
    'He tests the wind with one wing. The Fold hums nearby, ready whenever he is.',
  ],
};

export function baseFigure({ skin = 0xc89878, shirt = 0x2a2a3a, pants = 0x1e1e28 } = {}) {
  // Stylized figure: bald head, beard, warm presence. Original, not a portrait.
  const g = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.65 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.85 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pants, roughness: 0.9 });
  // Legs.
  const legGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.85, 8);
  const legL = new THREE.Mesh(legGeo, pantsMat);
  legL.position.set(-0.16, 0.43, 0);
  const legR = legL.clone();
  legR.position.x = 0.16;
  g.add(legL, legR);
  // Torso.
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.75, 10), shirtMat);
  torso.position.y = 1.22;
  g.add(torso);
  // Arms.
  const armGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.7, 7);
  const armL = new THREE.Mesh(armGeo, shirtMat);
  armL.position.set(-0.42, 1.25, 0);
  armL.rotation.z = 0.12;
  const armR = armL.clone();
  armR.position.x = 0.42;
  armR.rotation.z = -0.12;
  g.add(armL, armR);
  // Head — bald, bearded.
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), skinMat);
  head.position.y = 1.86;
  g.add(head);
  const beard = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0x2a1e14, roughness: 1 }));
  beard.position.set(0, 1.82, 0.03);
  beard.scale.set(1, 0.9, 0.9);
  g.add(beard);
  // Gold chain glint.
  const chain = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 6, 14, Math.PI), new THREE.MeshStandardMaterial({ color: 0xd8b45a, metalness: 0.9, roughness: 0.3 }));
  chain.position.set(0, 1.58, 0.24);
  chain.rotation.x = 0.3;
  chain.rotation.z = Math.PI;
  g.add(chain);
  return { group: g, head, armL, armR };
}

export function createArrash(ctx) {
  const { labels } = ctx;
  const root = new THREE.Group();
  root.name = 'arrash-symbiotic-self';
  root.position.set(-15, 0, 6);
  root.rotation.y = 0.9;

  // A terrace of warm stone beneath his feet.
  const terrace = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.5, 0.3, 20),
    new THREE.MeshStandardMaterial({ color: 0x4a4a58, roughness: 0.9 })
  );
  terrace.position.y = 0.15;
  root.add(terrace);
  const terraceGlow = makeGlowSprite('rgba(255,200,110,0.5)', 5, 0.25);
  terraceGlow.position.y = 0.5;
  root.add(terraceGlow);

  const forms = {};
  const animatedParts = {};

  // ---- Form 1: himself ----
  const him = baseFigure();
  forms.himself = him.group;
  root.add(him.group);
  animatedParts.himself = him;

  // ---- Form 2: Lyran cat-man ----
  const cat = baseFigure({ skin: 0xd8b088, shirt: 0x6b4a2a, pants: 0x3a2a1a });
  const earGeo = new THREE.ConeGeometry(0.11, 0.32, 5);
  const earMat = new THREE.MeshStandardMaterial({ color: 0xd8b088, roughness: 0.7 });
  const cEL = new THREE.Mesh(earGeo, earMat);
  cEL.position.set(-0.15, 2.12, 0);
  cEL.rotation.z = 0.15;
  const cER = cEL.clone();
  cER.position.x = 0.15;
  cER.rotation.z = -0.15;
  cat.group.add(cEL, cER);
  // Feline eyes — gold and glowing.
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffd76a });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), eyeMat);
  eyeL.position.set(-0.1, 1.9, 0.23);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.1;
  cat.group.add(eyeL, eyeR);
  // Tail.
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.1, 6), earMat);
  tail.position.set(0, 1.0, -0.42);
  tail.rotation.x = 0.7;
  cat.group.add(tail);
  const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), new THREE.MeshStandardMaterial({ color: 0x2a1e14 }));
  tailTip.position.set(0, 1.45, -0.68);
  cat.group.add(tailTip);
  // Subtle fur mantle on shoulders.
  const mantle = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), new THREE.MeshStandardMaterial({ color: 0xc89a68, roughness: 1 }));
  mantle.scale.y = 0.5;
  mantle.position.y = 1.55;
  cat.group.add(mantle);
  forms.lyran = cat.group;
  root.add(cat.group);
  animatedParts.lyran = { ...cat, tail };

  // ---- Form 3: being of light ----
  const light = new THREE.Group();
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xfff6dd, emissive: 0xffe89a, emissiveIntensity: 2.4,
    transparent: true, opacity: 0.85, roughness: 0.3,
  });
  const lBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 1.0, 6, 12), lightMat);
  lBody.position.y = 1.15;
  light.add(lBody);
  const lHead = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), lightMat);
  lHead.position.y = 2.05;
  light.add(lHead);
  const lHalo = makeGlowSprite('rgba(255,230,160,0.95)', 4.5, 0.75);
  lHalo.position.y = 1.4;
  light.add(lHalo);
  const lLight = new THREE.PointLight(0xffe89a, 24, 16, 2);
  lLight.position.y = 1.6;
  light.add(lLight);
  // Orbiting motes.
  const motes = [];
  for (let i = 0; i < 8; i++) {
    const mote = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: 0xfff2c8 }));
    light.add(mote);
    motes.push(mote);
  }
  forms.light = light;
  root.add(light);
  animatedParts.light = { motes, halo: lHalo, light: lLight };

  // ---- Form 4: winged traveler ----
  const winged = baseFigure({ skin: 0xc89878, shirt: 0x3a3a55, pants: 0x23233a });
  const wingMat = new THREE.MeshStandardMaterial({ color: 0xe8e4f2, emissive: 0x8a8ab8, emissiveIntensity: 0.35, side: THREE.DoubleSide, roughness: 0.7 });
  const wingGeo = new THREE.PlaneGeometry(1.9, 0.9, 4, 1);
  // Feather the wing tips by tapering the plane.
  const wp = wingGeo.attributes.position;
  for (let i = 0; i < wp.count; i++) {
    const x = wp.getX(i);
    if (x > 0.4) wp.setY(i, wp.getY(i) * (1 - (x - 0.4) * 0.7));
  }
  wingGeo.computeVertexNormals();
  const wL = new THREE.Mesh(wingGeo, wingMat);
  wL.position.set(-1.05, 1.6, -0.15);
  wL.rotation.z = 0.3;
  wL.rotation.y = 0.25;
  const wR = new THREE.Mesh(wingGeo, wingMat);
  wR.position.set(1.05, 1.6, -0.15);
  wR.rotation.z = Math.PI - 0.3;
  wR.rotation.y = -0.25;
  winged.group.add(wL, wR);
  const wGlow = makeGlowSprite('rgba(200,200,255,0.6)', 4, 0.35);
  wGlow.position.y = 1.5;
  winged.group.add(wGlow);
  forms.winged = winged.group;
  root.add(winged.group);
  animatedParts.winged = { ...winged, wL, wR };

  // ---- Form state + shifting ----
  let current = 0;
  let shiftPulse = 0;
  const label = labels.add(FORM_TITLES[FORMS[0]], root, { yOffset: 3.1, className: 'label-arrash', maxDistance: 130 });

  function showForm(i) {
    FORMS.forEach((f, idx) => { forms[f].visible = idx === i; });
    labels.setText(label, FORM_TITLES[FORMS[i]]);
    shiftPulse = 1;
  }
  showForm(0);

  function cycleForm() {
    current = (current + 1) % FORMS.length;
    showForm(current);
    return FORM_TITLES[FORMS[current]];
  }
  function currentForm() { return FORM_TITLES[FORMS[current]]; }

  makeClickable(root, {
    name: 'Arrash — symbiotic self',
    lines: () => {
      const form = FORMS[current];
      const lines = FORM_LINES[form];
      return lines[Math.floor(Math.random() * lines.length)] + ' (Tap again — or the Shift button — and he changes form.)';
    },
    onClick: () => cycleForm(),
  });

  return {
    group: root,
    cycleForm,
    currentForm,
    update(dt, t) {
      // Shift pulse: brief scale bloom on change.
      if (shiftPulse > 0) {
        shiftPulse = Math.max(0, shiftPulse - dt * 1.6);
        const s = 1 + Math.sin(shiftPulse * Math.PI) * 0.12;
        FORMS.forEach((f) => forms[f].scale.setScalar(s));
      }
      const form = FORMS[current];
      if (form === 'himself' || form === 'winged') {
        const parts = animatedParts[form];
        parts.head.position.y = 1.86 + Math.sin(t * 1.3) * 0.015;
        parts.armL.rotation.x = Math.sin(t * 1.3) * 0.05;
        parts.armR.rotation.x = -Math.sin(t * 1.3) * 0.05;
      }
      if (form === 'lyran') {
        animatedParts.lyran.tail.rotation.z = Math.sin(t * 1.8) * 0.3;
        animatedParts.lyran.head.position.y = 1.86 + Math.sin(t * 1.6) * 0.02;
      }
      if (form === 'light') {
        const { motes, halo, light: lLight } = animatedParts.light;
        motes.forEach((m, i) => {
          const a = t * 0.9 + (i / motes.length) * Math.PI * 2;
          m.position.set(Math.cos(a) * 0.8, 1.2 + Math.sin(t * 1.5 + i) * 0.7, Math.sin(a) * 0.8);
        });
        halo.material.opacity = 0.6 + Math.sin(t * 2) * 0.18;
        lLight.intensity = 22 + Math.sin(t * 2) * 5;
      }
      if (form === 'winged') {
        const { wL, wR } = animatedParts.winged;
        const flap = Math.sin(t * 1.1) * 0.14;
        wL.rotation.z = 0.3 + flap;
        wR.rotation.z = Math.PI - 0.3 - flap;
      }
    },
  };
}
