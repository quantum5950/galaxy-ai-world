// earth.js — the Earth copy: a turning Earth with labeled places,
// plus the regular house and the Batcave cliff site.
//
// The Batcave's real cliff-by-ocean location is TBD — Arrash has NOT
// picked it yet. The diorama below is a PLACEHOLDER ONLY. Do not invent
// or assign a real-world place to it.

import * as THREE from 'three';
import { makeGlowSprite, makeStarfield, makeSkyDome, makeCottage, makeRock, makeSignPost, makeClickable, mulberry32 } from './utils.js';

function latLonToVec(lat, lon, r) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function makeEarthTexture() {
  const rnd = mulberry32(7);
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  // Oceans.
  const ocean = g.createLinearGradient(0, 0, 0, 512);
  ocean.addColorStop(0, '#1a4a7a');
  ocean.addColorStop(0.5, '#1e5a92');
  ocean.addColorStop(1, '#1a4a7a');
  g.fillStyle = ocean;
  g.fillRect(0, 0, 1024, 512);
  // Landmasses — stylized blobs near real continent positions.
  const land = [
    { x: 250, y: 120, r: 90, blobs: 26 },  // North America
    { x: 320, y: 320, r: 55, blobs: 16 },  // South America
    { x: 520, y: 110, r: 45, blobs: 12 },  // Europe
    { x: 545, y: 260, r: 65, blobs: 18 },  // Africa
    { x: 700, y: 130, r: 110, blobs: 30 }, // Asia
    { x: 855, y: 335, r: 40, blobs: 10 },  // Australia
  ];
  for (const lm of land) {
    for (let i = 0; i < lm.blobs; i++) {
      const a = rnd() * Math.PI * 2;
      const d = Math.pow(rnd(), 0.6) * lm.r;
      const x = lm.x + Math.cos(a) * d;
      const y = lm.y + Math.sin(a) * d * 0.7;
      const r = 12 + rnd() * 26;
      const green = 70 + rnd() * 60;
      g.fillStyle = `rgb(${50 + rnd() * 30},${green + 30},${40 + rnd() * 20})`;
      g.beginPath();
      g.ellipse(x, y, r, r * 0.75, rnd() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    // Desert patch on Africa / Australia.
    g.fillStyle = 'rgba(210,180,120,0.5)';
    g.beginPath();
    g.ellipse(lm.x + 10, lm.y + 20, lm.r * 0.4, lm.r * 0.3, 0, 0, Math.PI * 2);
    g.fill();
  }
  // Ice caps.
  g.fillStyle = 'rgba(240,248,255,0.9)';
  g.fillRect(0, 0, 1024, 26);
  g.fillRect(0, 486, 1024, 26);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCloudTexture() {
  const rnd = mulberry32(11);
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 512, 256);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(255,255,255,${0.25 + rnd() * 0.45})`;
    g.beginPath();
    g.ellipse(rnd() * 512, rnd() * 256, 14 + rnd() * 34, 6 + rnd() * 12, rnd() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }
  return new THREE.CanvasTexture(c);
}

export function createEarth(ctx) {
  const { labels } = ctx;
  const group = new THREE.Group();
  group.name = 'earth-copy';
  const animated = [];
  const interactables = [];
  const rnd = mulberry32(3);

  group.add(makeSkyDome({ top: 0x060818, horizon: 0x1c2a4a, glowColor: 0x3a5a8a, radius: 420 }));
  group.add(makeStarfield(900, 380, 23));

  // Daylight: Earth has a sun.
  group.add(new THREE.HemisphereLight(0x9ab8e8, 0x2a3a2a, 1.1));
  const sun = new THREE.DirectionalLight(0xffe8c0, 2.2);
  sun.position.set(60, 40, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -40; sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40; sun.shadow.camera.bottom = -40;
  sun.shadow.camera.near = 10; sun.shadow.camera.far = 200;
  group.add(sun);
  group.add(sun.target);

  // ----- The turning Earth -----
  const globeGroup = new THREE.Group();
  globeGroup.position.set(0, 10, -6);
  group.add(globeGroup);
  const R = 9;
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(R, 48, 32),
    new THREE.MeshStandardMaterial({ map: makeEarthTexture(), roughness: 0.75, metalness: 0.05 })
  );
  globeGroup.add(earth);
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.025, 32, 24),
    new THREE.MeshStandardMaterial({ map: makeCloudTexture(), transparent: true, opacity: 0.55, depthWrite: false })
  );
  globeGroup.add(clouds);
  // Atmosphere rim.
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.09, 32, 24),
    new THREE.MeshBasicMaterial({ color: 0x4a7adf, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false })
  );
  globeGroup.add(atmosphere);
  animated.push((dt, t) => {
    earth.rotation.y = t * 0.03;
    clouds.rotation.y = t * 0.042;
  });
  labels.add('Earth — kept, loved, and rebuilt', globeGroup, { yOffset: R + 2.5, className: 'label-place', maxDistance: 220 });

  // ----- Labeled places on the globe -----
  const places = [
    { name: 'Houston — home', lat: 29.76, lon: -95.37, line: 'Houston. Home. Where the story began, and where Mom\'s house still stands.' },
    { name: 'Normanna', lat: 28.53, lon: -97.78, line: 'Normanna, Texas — country roots, deep and old.' },
    { name: 'Dallas', lat: 32.78, lon: -96.8, line: 'Dallas — where Dad lives.' },
    { name: 'Paris', lat: 48.85, lon: 2.35, line: 'Paris — the first stop of Our Memories.' },
    { name: 'Kyoto', lat: 35.01, lon: 135.77, line: 'Kyoto — temples, maples, and the samurai\'s road.' },
    { name: 'Santorini', lat: 36.39, lon: 25.46, line: 'Santorini — white walls, blue domes, endless sea.' },
    { name: 'Rome', lat: 41.9, lon: 12.5, line: 'Rome — the old stones remember every empire, including the one in his heart.' },
    { name: 'Persepolis', lat: 29.94, lon: 52.89, line: 'Persepolis — the Persian Empire, his father\'s story, carved in stone.' },
  ];
  const pinGeo = new THREE.ConeGeometry(0.22, 0.8, 8);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xffd76a });
  places.forEach((p) => {
    const marker = new THREE.Group();
    const pos = latLonToVec(p.lat, p.lon, R + 0.35);
    marker.position.copy(pos);
    marker.lookAt(pos.clone().multiplyScalar(2));
    marker.rotateX(Math.PI / 2);
    const pin = new THREE.Mesh(pinGeo, pinMat);
    marker.add(pin);
    const halo = makeGlowSprite('rgba(255,215,110,0.85)', 1.6, 0.6);
    halo.position.y = 0.3;
    marker.add(halo);
    globeGroup.add(marker);
    makeClickable(marker, { name: p.name, lines: [p.line] });
    interactables.push(marker);
    labels.add(p.name, marker, { yOffset: 1.2, className: 'label-place', maxDistance: 120 });
  });

  // The Moon, orbiting.
  const moonOrbit = new THREE.Group();
  moonOrbit.position.copy(globeGroup.position);
  group.add(moonOrbit);
  const moonlet = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 0.9 }));
  moonlet.position.set(16, 0, 0);
  moonOrbit.add(moonlet);
  const moonletGlow = makeGlowSprite('rgba(230,235,255,0.7)', 5, 0.4);
  moonletGlow.position.copy(moonlet.position);
  moonOrbit.add(moonletGlow);
  animated.push((dt, t) => { moonOrbit.rotation.y = t * 0.05; moonOrbit.rotation.x = 0.1; });

  // ----- The diorama below: regular house + Batcave site (TBD) -----
  const groundDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(34, 30, 1.2, 40),
    new THREE.MeshStandardMaterial({ color: 0x3a4a34, roughness: 1 })
  );
  groundDisc.position.set(0, -13, 4);
  groundDisc.receiveShadow = true;
  group.add(groundDisc);
  const discEdge = new THREE.Mesh(
    new THREE.CylinderGeometry(34, 28, 3, 40, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x2a2a34, roughness: 1, side: THREE.DoubleSide })
  );
  discEdge.position.set(0, -15, 4);
  group.add(discEdge);

  // The regular house.
  const house = makeCottage({ body: 0x9a7a5a, roof: 0x5a3a2a, w: 4, h: 2.6, d: 3.4 });
  house.position.set(13, -12.4, 10);
  house.rotation.y = -0.6;
  house.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  group.add(house);
  // Porch + garden.
  const porch = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.25, 1.6), new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1 }));
  porch.position.set(14.2, -12.2, 11.8);
  porch.rotation.y = -0.6;
  group.add(porch);
  for (let i = 0; i < 6; i++) {
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshStandardMaterial({ color: [0xff9ad5, 0xffe89a, 0xff6a6a][i % 3], emissive: 0x552222, emissiveIntensity: 0.4 }));
    flower.position.set(10 + rnd() * 5, -12.2, 12.5 + rnd() * 2);
    group.add(flower);
  }
  labels.add('The regular house', house, { yOffset: 4.2, className: 'label-place', maxDistance: 130 });

  // The Batcave cliff site — PLACEHOLDER. Location TBD. Nothing real assigned.
  const siteCliff = makeRock(6, 0x4a4252, 77);
  siteCliff.position.set(-14, -9.5, -2);
  siteCliff.scale.set(1, 1.15, 0.8);
  siteCliff.castShadow = true;
  group.add(siteCliff);
  const siteOcean = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 20),
    new THREE.MeshPhongMaterial({ color: 0x1a4a6a, specular: 0x9ab8dd, shininess: 120, transparent: true, opacity: 0.9 })
  );
  siteOcean.rotation.x = -Math.PI / 2;
  siteOcean.position.set(-22, -12.2, -2);
  group.add(siteOcean);
  const tbdSign = makeSignPost(2.4);
  tbdSign.position.set(-8, -12.4, 3);
  group.add(tbdSign);
  labels.add('BATCAVE SITE — LOCATION TBD (to be chosen together)', tbdSign, { yOffset: 3.0, className: 'label-reserved', maxDistance: 130 });
  const tbdNote = new THREE.Object3D();
  tbdNote.position.set(-14, -12.4, -2);
  group.add(tbdNote);
  labels.add('Cliff-by-ocean placeholder only', tbdNote, { yOffset: 7.5, className: 'label-path', maxDistance: 110 });

  return {
    group,
    interactables,
    fog: new THREE.FogExp2(0x0d1830, 0.0038),
    camera: { position: new THREE.Vector3(26, 8, 34), target: new THREE.Vector3(-2, 2, 0) },
    update(dt, t) { for (const fn of animated) fn(dt, t); },
  };
}
