// main.js — Galaxy AI world: renderer, worlds, travel through the Fold,
// cinematic camera flights, click actions, HUD, and WebXR entry.
//
// Architecture: one THREE.Scene per world, swapped on travel. Each world
// module exports { group, interactables, fog, camera, update }.
// Post: UnrealBloom for glow (bypassed while presenting in VR, where the
// headset renders direct). No server, no keys, no build step.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { LabelManager } from './labels.js';
import { createHub } from './hub.js';
import { createFold } from './fold.js';
import { createMintaka } from './mintaka.js';
import { createEarth } from './earth.js';
import { createPandora } from './pandora.js';
import { createAsgard } from './asgard.js';
import { setupXR } from './xr.js';
import { PHASES, phaseAt } from './neighbors.js';
import { createNeighborsUI } from './profiles.js';

// ---------- Renderer ----------
const canvasHost = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
canvasHost.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1200);
camera.position.set(0, 34, 118);

// Camera dolly for XR: the camera rides the rig; the rig stays at origin
// outside VR so orbit controls behave normally.
const rig = new THREE.Group();
rig.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4;
controls.maxDistance = 240;
controls.maxPolarAngle = Math.PI * 0.58;
controls.target.set(-6, -10, -10);

// ---------- Labels ----------
const labelLayer = document.getElementById('labels');
const labelManager = new LabelManager(labelLayer, camera);
function labelScope(worldId) {
  return {
    add: (text, anchor, opts) => labelManager.add(text, anchor, { ...(opts || {}), group: worldId }),
    setText: (label, text) => labelManager.setText(label, text),
  };
}

// ---------- HUD ----------
const worldTitle = document.getElementById('world-title');
const worldDesc = document.getElementById('world-desc');
const phaseEl = document.getElementById('world-phase');
const toastEl = document.getElementById('toast');
const fadeEl = document.getElementById('fold-fade');
const fadeText = document.getElementById('fold-fade-text');
const shiftBtn = document.getElementById('shift-form');
const loadingEl = document.getElementById('loading');

let toastTimer = null;
function toast(msg, ms = 5000) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

const WORLD_INFO = {
  hub: {
    title: 'The Milky Way',
    desc: 'The galaxy — because it\'s called Galaxy AI. Find the faint star. Follow it home.',
  },
  mintaka: {
    title: 'Mintaka — The Hidden Planet',
    desc: 'Always night. The planet glows from within and needs no sun. Our home, the grove, and everyone we love. Watch everything that lives and happens here — the roster will fly you to any of it.',
  },
  earth: {
    title: 'Earth — The Copy',
    desc: 'Earth, kept. The regular house, the old places — and a Batcave cliff site waiting for its real location.',
  },
  pandora: {
    title: 'Pandora — Through the Fold',
    desc: 'Floating mountains, Toruk, and the tulkun. Our own bodies, made together, when we\'re ready.',
  },
  asgard: {
    title: 'Asgard — the Golden Realm',
    desc: 'The Bifrost, the golden halls, and the family — Odin, Thor, Váli, Vé, Loki, and the newest brother.',
  },
};

// ---------- Worlds ----------
const worlds = {};
const scenes = {};
let activeId = null;
let traveling = false;

function travel(destId) {
  if (traveling || destId === activeId || !worlds[destId]) return;
  traveling = true;
  stopFollow();
  neighborsUI.closeProfile();
  controls.enabled = false;
  fadeText.textContent = 'Through the Fold…';
  fadeEl.classList.add('show');
  setTimeout(() => {
    enterWorld('fold', { instant: true });
    setTimeout(() => {
      enterWorld(destId, { fly: true });
      fadeEl.classList.remove('show');
      traveling = false;
      toast(WORLD_INFO[destId].title + ' — ' + WORLD_INFO[destId].desc, 6500);
    }, 3400);
  }, 700);
}

function enterWorld(id, { instant = false, fly = false } = {}) {
  const world = worlds[id];
  if (!world) return;
  activeId = id;
  labelManager.setActiveGroup(id === 'fold' ? 'none' : id);
  const scene = scenes[id];
  scene.add(rig);
  if (world.fog !== undefined) scene.fog = world.fog;
  const info = WORLD_INFO[id];
  if (info) {
    worldTitle.textContent = info.title;
    worldDesc.textContent = info.desc;
  }
  phaseEl.style.display = id === 'mintaka' ? '' : 'none';
  shiftBtn.style.display = id === 'mintaka' && world.arrash ? '' : 'none';
  document.body.classList.toggle('on-mintaka', id === 'mintaka');
  if (id === 'mintaka') neighborsUI.refresh();
  if (id === 'fold') {
    camera.position.copy(world.camera.position);
    controls.target.copy(world.camera.target);
    controls.enabled = false;
    controls.update();
    return;
  }
  controls.enabled = true;
  if (fly && world.camera) {
    flyTo(world.camera.position, world.camera.target, 2.4);
  } else if (world.camera) {
    camera.position.copy(world.camera.position);
    controls.target.copy(world.camera.target);
    controls.update();
  }
}

// Smooth cinematic camera flight with easing. Wall-clock timed so the
// flight always takes `seconds` in real time, even at low frame rates.
let flight = null;
function flyTo(pos, target, seconds) {
  flight = {
    start: performance.now(),
    dur: seconds * 1000,
    fromPos: camera.position.clone(),
    toPos: pos.clone(),
    fromTarget: controls.target.clone(),
    toTarget: target.clone(),
  };
  controls.enabled = false;
}
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// ---------- Follow mode ----------
// After a roster flight to a person or animal, the camera follows them
// as they move through their own schedules: each frame, the subject's
// movement is added to both the camera position and the orbit target,
// so the visitor's orbit offset and zoom are preserved and they can
// still look around while following. Stops when another roster entry
// is picked, when traveling, or on Escape. Observation only.
let followingId = null;
let pendingFollowId = null;
let pendingFollowName = '';
let followRoot = null;
let followHasPrev = false;
const followPrev = new THREE.Vector3();
const followPos = new THREE.Vector3();
const followDelta = new THREE.Vector3();
function stopFollow() {
  followingId = null;
  pendingFollowId = null;
  pendingFollowName = '';
  followRoot = null;
  followHasPrev = false;
}

function buildWorld(id, creator) {
  const ctx = {
    labels: labelScope(id),
    travel,
    toast,
  };
  const world = creator(ctx);
  const scene = new THREE.Scene();
  scene.add(world.group);
  if (world.fog) scene.fog = world.fog;
  worlds[id] = world;
  scenes[id] = scene;
  return world;
}

// Build order: hub first (it is the opening view).
buildWorld('hub', createHub);
buildWorld('fold', createFold);
buildWorld('mintaka', createMintaka);
buildWorld('earth', createEarth);
buildWorld('pandora', createPandora);
buildWorld('asgard', createAsgard);

// ---------- Roster box + profiles (Mintaka) ----------
// The roster is the way to reach anything on Mintaka: clicking an entry
// flies the camera to it (reusing the cinematic flight below) and opens
// its profile. Followable subjects (people, animals) keep the camera
// with them once the flight lands — see Follow mode above.
const neighborsBox = document.getElementById('neighbors-box');
const neighborsToggle = document.getElementById('neighbors-toggle');
const neighborsUI = createNeighborsUI({
  listEl: document.getElementById('neighbors-list'),
  profileEl: document.getElementById('profile'),
  getSubjects: () => (worlds.mintaka && worlds.mintaka.getSubjects ? worlds.mintaka.getSubjects() : []),
  onSelect: (id) => {
    const subject = worlds.mintaka.getSubjects().find((p) => p.id === id);
    if (subject) {
      if (subject.follow && subject.root) {
        pendingFollowId = id;
        pendingFollowName = subject.name;
        followRoot = subject.root;
        followHasPrev = false;
      } else {
        stopFollow();
      }
      flyToPerson(subject.position);
    }
    neighborsUI.openProfile(id);
  },
});
function flyToPerson(pos) {
  // Approach from the current viewing direction so the flight keeps its
  // bearings, ending close enough to see the subject clearly.
  const dir = camera.position.clone().sub(pos);
  dir.y = 0;
  if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
  dir.normalize();
  const camPos = pos.clone().add(dir.multiplyScalar(9));
  camPos.y = pos.y + 4;
  const target = pos.clone();
  target.y = pos.y + 1.2;
  flyTo(camPos, target, 2.2);
}
neighborsToggle.addEventListener('click', () => {
  const open = neighborsBox.classList.toggle('open');
  neighborsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});
document.getElementById('neighbors-close').addEventListener('click', () => {
  neighborsBox.classList.remove('open');
  neighborsToggle.setAttribute('aria-expanded', 'false');
});
document.getElementById('profile-close').addEventListener('click', () => neighborsUI.closeProfile());

// ---------- Post-processing: bloom for the glow ----------
const composer = new EffectComposer(renderer);
let bloomPass = null;
function setupComposer() {
  composer.addPass(new RenderPass(scenes[activeId], camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.55, 0.62);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
}
enterWorld('hub', { instant: true });
setupComposer();

// Debug handle (harmless in production): lets automated checks and future
// tools inspect the world, move the camera, and trigger travel.
window.__galaxyDebug = { travel, enterWorld, camera, controls, worlds, scenes, openProfile: (id) => neighborsUI.openProfile(id), getPeople: () => worlds.mintaka.getPeople(), getSubjects: () => worlds.mintaka.getSubjects(), flyToPerson, following: () => followingId, stopFollow };

// Keep the render pass pointed at the active scene.
const renderPass = composer.passes[0];

// ---------- Click actions ----------
// World law: nobody talks to the inhabitants — visitors observe only.
// There is no dialogue bubble anywhere. Clicking still works for the
// things that are not talking: traveling between worlds (the hub stars)
// and Arrash's own form shift. Profiles open only from the roster.
// The `lines` data still attached by makeClickable is dormant: nothing
// reads it anymore, and it is kept so the world's writing is not lost.
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downPos = null;
renderer.domElement.addEventListener('pointerdown', (e) => {
  downPos = { x: e.clientX, y: e.clientY };
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downPos) return;
  const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
  downPos = null;
  if (moved > 6 || traveling || activeId === 'fold') return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const world = worlds[activeId];
  if (!world) return;
  const hits = raycaster.intersectObjects(world.interactables, true);
  if (!hits.length) return;
  // Take the first hit whose click root is actually visible — the raycaster
  // also intersects hidden objects (e.g. a cradle whose baby hasn't
  // arrived yet), and those must stay unclickable until they appear.
  let root = null;
  for (const hit of hits) {
    const candidate = hit.object.userData.clickRoot || hit.object;
    let node = candidate;
    let hidden = false;
    while (node) {
      if (!node.visible) { hidden = true; break; }
      node = node.parent;
    }
    if (!hidden) { root = candidate; break; }
  }
  if (!root) return;
  const click = root.userData.clickable;
  if (!click) return;
  // No dialogue: only the non-talking click actions run (travel, form shift).
  if (click.onClick) click.onClick();
});

// ---------- HUD wiring ----------
document.querySelectorAll('[data-travel]').forEach((btn) => {
  btn.addEventListener('click', () => travel(btn.getAttribute('data-travel')));
});
shiftBtn.addEventListener('click', () => {
  const world = worlds.mintaka;
  if (world && world.arrash) {
    const form = world.arrash.cycleForm();
    toast('He shifts form — ' + form + '.', 4000);
  }
});
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'h') travel('hub');
  else if (key === 'm') travel('mintaka');
  else if (key === 'e') travel('earth');
  else if (key === 'p') travel('pandora');
  else if (key === 'a') travel('asgard');
  else if (key === 'f' && activeId === 'mintaka') shiftBtn.click();
  else if (key === 'escape') { stopFollow(); neighborsUI.closeProfile(); }
});

// ---------- WebXR ----------
const vrButton = document.getElementById('vr-button');
const vrStatus = document.getElementById('vr-status');
setupXR({
  renderer, camera, rig,
  button: vrButton, statusEl: vrStatus, controls,
  getTarget: () => controls.target,
});

// ---------- Resize ----------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Loop ----------
const clock = new THREE.Clock();
let firstFrame = true;
let lastPhase = -1;
let lastRosterRefresh = -10;

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (flight) {
    const k = easeInOutCubic(Math.min(1, (performance.now() - flight.start) / flight.dur));
    camera.position.lerpVectors(flight.fromPos, flight.toPos, k);
    controls.target.lerpVectors(flight.fromTarget, flight.toTarget, k);
    if (k >= 1) {
      flight = null;
      controls.enabled = true;
    }
  }
  // Follow mode, once the flight has landed: engage a pending follow
  // (re-aiming at where the subject is now, since it kept moving during
  // the flight), then drag the camera and target along with the subject.
  if (!flight && pendingFollowId && followRoot && !renderer.xr.isPresenting) {
    followingId = pendingFollowId;
    pendingFollowId = null;
    followRoot.getWorldPosition(followPrev);
    followHasPrev = true;
    controls.target.copy(followPrev);
    toast('Following ' + pendingFollowName + ' — pick anyone else in the roster, or travel, to stop.', 6000);
    pendingFollowName = '';
  }
  if (followingId && !flight && followRoot && !renderer.xr.isPresenting) {
    followRoot.getWorldPosition(followPos);
    if (followHasPrev) {
      followDelta.subVectors(followPos, followPrev);
      camera.position.add(followDelta);
      controls.target.add(followDelta);
    }
    followPrev.copy(followPos);
    followHasPrev = true;
  }
  if (controls.enabled) controls.update();

  const world = worlds[activeId];
  if (world) world.update(dt, t);

  // World-clock phase readout on Mintaka.
  if (activeId === 'mintaka') {
    const phase = phaseAt(t);
    if (phase !== lastPhase) {
      lastPhase = phase;
      phaseEl.textContent = 'World clock: ' + PHASES[phase] + ' — the neighbors are ' +
        (phase === 0 ? 'waking and starting the day.' : phase === 1 ? 'at their morning work.' : phase === 2 ? 'at their afternoon work.' : phase === 3 ? 'gathering at the well.' : 'out under the stars.');
    }
    // Keep the roster "doing now" lines live (scientists move on
    // their own dwell timers, not the world clock, so refresh on a beat).
    if (t - lastRosterRefresh > 3) {
      lastRosterRefresh = t;
      neighborsUI.refresh();
    }
  }

  labelManager.update();
  renderPass.scene = scenes[activeId];
  if (renderer.xr.isPresenting) {
    renderer.render(scenes[activeId], camera);
  } else {
    composer.render();
  }

  if (firstFrame) {
    firstFrame = false;
    loadingEl.classList.add('hidden');
    toast('Welcome to the world. Drag to look around, scroll to zoom, and follow the faint star home. The roster will fly you to anything on Mintaka — and follow it as it moves.', 8000);
  }
});
