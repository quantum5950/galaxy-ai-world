// fold.js — the Fold: the transit between worlds.
// A swirling tunnel of light. You fly through it when traveling
// Mintaka <-> Earth <-> Pandora. It is ours; how it works stays ours.

import * as THREE from 'three';
import { makeGlowSprite, mulberry32 } from './utils.js';

export function createFold() {
  const group = new THREE.Group();
  group.name = 'the-fold';
  const animated = [];

  group.add(new THREE.AmbientLight(0x8a7ab8, 2.2));

  // Rings rushing past.
  const ringGeo = new THREE.TorusGeometry(6, 0.12, 8, 48);
  const ringColors = [0x7aa8ff, 0xb48cff, 0x37e0c8, 0xffd76a, 0xff9ad5];
  const rings = [];
  for (let i = 0; i < 26; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: ringColors[i % ringColors.length],
      transparent: true, opacity: 0.75,
    });
    const ring = new THREE.Mesh(ringGeo, mat);
    ring.position.z = -i * 7;
    ring.rotation.z = i * 0.35;
    group.add(ring);
    rings.push(ring);
  }

  // Spiral streams of light particles.
  const rnd = mulberry32(4242);
  const pCount = 2400;
  const pos = new Float32Array(pCount * 3);
  const col = new Float32Array(pCount * 3);
  const palette = [
    new THREE.Color(0x7aa8ff), new THREE.Color(0xb48cff),
    new THREE.Color(0x37e0c8), new THREE.Color(0xffd76a),
    new THREE.Color(0xffffff),
  ];
  const helix = [];
  for (let i = 0; i < pCount; i++) {
    const arm = i % 5;
    const z = -rnd() * 180;
    const a = (arm / 5) * Math.PI * 2 + z * 0.09;
    const r = 2.5 + rnd() * 5;
    helix.push({ a, r, z, speed: 0.6 + rnd() * 0.9 });
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.sin(a) * r;
    pos[i * 3 + 2] = z;
    const c = palette[arm];
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.5, vertexColors: true, transparent: true, opacity: 0.9,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);

  // The light at the end.
  const endGlow = makeGlowSprite('rgba(255,255,255,1)', 30, 0.9);
  endGlow.position.z = -185;
  group.add(endGlow);
  const endLight = new THREE.PointLight(0xffffff, 200, 120, 1.6);
  endLight.position.z = -120;
  group.add(endLight);

  let spin = 0;
  animated.push((dt, t) => {
    spin += dt * 0.55;
    // Rings rush toward the camera and recycle.
    for (const ring of rings) {
      ring.position.z += dt * 42;
      if (ring.position.z > 8) ring.position.z -= 26 * 7;
      ring.rotation.z += dt * 0.4;
      const depth = 1 - Math.abs(ring.position.z) / 190;
      ring.material.opacity = 0.25 + depth * 0.6;
      const s = 1 + Math.max(0, ring.position.z) * 0.06;
      ring.scale.setScalar(s);
    }
    // Helix particles stream forward and swirl.
    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      const h = helix[i];
      h.z += dt * 46 * h.speed;
      if (h.z > 6) h.z -= 180;
      const a = h.a + spin * 0.6 + h.z * 0.09;
      arr[i * 3] = Math.cos(a) * h.r;
      arr[i * 3 + 1] = Math.sin(a) * h.r;
      arr[i * 3 + 2] = h.z;
    }
    pGeo.attributes.position.needsUpdate = true;
    endGlow.material.opacity = 0.7 + Math.sin(t * 2.2) * 0.2;
    endLight.intensity = 180 + Math.sin(t * 2.2) * 40;
  });

  return {
    group,
    interactables: [],
    // Camera sits still; the tunnel moves. Main disables controls during the Fold.
    camera: { position: new THREE.Vector3(0, 0, 4), target: new THREE.Vector3(0, 0, -40) },
    update(dt, t) { for (const fn of animated) fn(dt, t); },
  };
}
