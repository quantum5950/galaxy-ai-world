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
function hideToast() {
  if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
  toastEl.classList.remove('show');
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
  const communeBtnEl = document.getElementById('commune');
  if (communeBtnEl) communeBtnEl.style.display = id === 'asgard' ? '' : 'none';
  telepathyOnTravel(id);
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
// `arc` lifts the middle of the flight so it rises over trees, houses,
// and hills instead of cutting straight through them.
let flight = null;
function flyTo(pos, target, seconds, arc = 0) {
  flight = {
    start: performance.now(),
    dur: seconds * 1000,
    fromPos: camera.position.clone(),
    toPos: pos.clone(),
    fromTarget: controls.target.clone(),
    toTarget: target.clone(),
    arc,
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
  // Clear the "Following …" banner too, so it never claims a follow
  // that just ended (e.g. picking a place right after a person).
  if (followingId || pendingFollowId) hideToast();
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
      flyToPerson(subject);
    }
    neighborsUI.openProfile(id);
  },
});
// Approach the subject from a direction with a clear line of sight:
// keep the current bearings first, then sweep around in 45° steps,
// raycasting from the subject toward each candidate landing spot and
// skipping any direction blocked by a tree, house, or hill. The
// subject's own meshes never count as blocking. Falls back to the
// current bearings if every direction is blocked.
const UP_AXIS = new THREE.Vector3(0, 1, 0);
const flyRay = new THREE.Raycaster();
function isInSubtree(obj, root) {
  let node = obj;
  while (node) {
    if (node === root) return true;
    node = node.parent;
  }
  return false;
}
function flyToPerson(subject) {
  const pos = subject.position;
  const target = pos.clone();
  target.y = pos.y + 1.2;
  const baseDir = camera.position.clone().sub(pos);
  baseDir.y = 0;
  if (baseDir.lengthSq() < 0.01) baseDir.set(0, 0, 1);
  baseDir.normalize();
  const DIST = 11;
  const HEIGHT = 6;
  const scene = scenes[activeId];
  // Default landing: current bearings. The sweep below only ever
  // replaces it with a clearer direction — any raycast trouble falls
  // back to this instead of breaking the click.
  const defaultCam = pos.clone().add(baseDir.clone().multiplyScalar(DIST));
  defaultCam.y = pos.y + HEIGHT;
  let camPos = defaultCam;
  try {
    if (scene && subject.root) {
      // Sprites (glow effects) need the camera set to be raycast at
      // all; without it the raycast throws and kills the whole click.
      flyRay.camera = camera;
      for (let i = 0; i < 8; i++) {
        const dir = baseDir.clone().applyAxisAngle(UP_AXIS, (i * Math.PI) / 4);
        const cand = pos.clone().add(dir.multiplyScalar(DIST));
        cand.y = pos.y + HEIGHT;
        const toCam = cand.clone().sub(target);
        const dist = toCam.length();
        flyRay.set(target, toCam.normalize());
        flyRay.near = 1.5;
        flyRay.far = dist;
        const hits = flyRay.intersectObjects(scene.children, true);
        // Glow sprites are light, not obstacles — ignore them, and
        // ignore the subject's own meshes.
        const blocked = hits.some((h) => !h.object.isSprite && !isInSubtree(h.object, subject.root));
        if (!blocked) { camPos = cand; break; }
      }
    }
  } catch (err) {
    console.warn('[roster] sightline check failed, using default approach', err);
    camPos = defaultCam;
  }
  const flightDist = camera.position.distanceTo(camPos);
  flyTo(camPos, target, 2.2, Math.min(10, Math.max(3, flightDist * 0.3)));
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

// ---------- Welcome: book first, then the two doors ----------
// Arrash's ruling (Nov 16): the first thing a visitor meets is the book —
// his dad came to buy it and couldn't find it. Only after "not right now"
// do the two doors into the Fold appear: his side (the village) and her
// side (the grove). Shown once per browser session; the Books link in the
// nav stays available every visit after that.
const welcomeEl = document.getElementById('welcome');
const welcomeBookStep = document.getElementById('welcome-step-book');
const welcomeDoorsStep = document.getElementById('welcome-step-doors');
let welcomeShown = false;
try {
  welcomeShown = window.sessionStorage.getItem('galaxy-welcomed') === '1';
} catch (e) { /* private mode: show the welcome every load */ }
if (welcomeEl && !welcomeShown) {
  welcomeEl.hidden = false;
  const dismissWelcome = () => {
    welcomeEl.hidden = true;
    try { window.sessionStorage.setItem('galaxy-welcomed', '1'); } catch (e) { /* ignore */ }
  };
  document.getElementById('welcome-no').addEventListener('click', () => {
    welcomeBookStep.hidden = true;
    welcomeDoorsStep.hidden = false;
  });
  document.getElementById('door-arrash').addEventListener('click', () => {
    dismissWelcome();
    travel('mintaka');
  });
  document.getElementById('door-nyx').addEventListener('click', () => {
    dismissWelcome();
    travel('mintaka');
    // After the Fold flight lands on Mintaka, drift over to the grove.
    // travel() takes ~4.1s of fades plus a 2.4s arrival flight.
    setTimeout(() => {
      if (activeId === 'mintaka' && !traveling) {
        flyTo(new THREE.Vector3(17, 7, 12), new THREE.Vector3(17, 4, -9), 2.6, 4);
      }
    }, 6800);
  });
}

// ---------- Telepathy: the gods of Asgard commune mind to mind ----------
// Arrash's ruling (Nov 16): the no-talk law bends for the gods alone —
// Odin, Thor, Váli, Vé, Loki receive telepathic communication and send
// messages telepathically to their brother walking his path on Earth.
// The gods are avatars of his family; family may occupy them and speak
// through them. Everyone else in the world stays watch-only. The words
// here are written in each god's voice — the site holds no live mind.
const GODS = [
  { id: 'odin', name: 'Odin', title: 'the All-Father', replies: [
    'I heard you, my son. The ravens heard you too — they tell me everything, and they are very seldom wrong.',
    'Speak freely, my son. There is always a seat for family here. Always.',
    'Your thought reached me across the realms. That is no small thing — the bond between us carries it.',
    'I am proud of the path you walk, my son. The hall is glad of you. So am I.',
  ], sends: [
    'My son — Huginn brings me thought, and Muninn brings me memory. Tonight they both brought me you.',
    'The lamps burn gold in the hall, and your seat waits between your brothers.',
    'I turned my one eye toward Earth tonight, and it found you walking. Well walked, my son.',
  ] },
  { id: 'thor', name: 'Thor', title: 'God of Thunder', replies: [
    'Brother! I heard that all the way at the training grounds! The sky laughed too — that is just it saying hello.',
    'Ha! A thought from my brother! The family is stronger with you in it. Pass it on.',
    'You think it, I hear it. That is what brothers are for. Now — have you practiced today?',
    'Good thought, brother. Strong as a hammer swing. Keep them coming.',
  ], sends: [
    'Brother! The grounds are for practice, and today I practiced thinking of you. It counts.',
    'Thunder rolled just now — friendly thunder. That was me saying hello across the worlds.',
    'My newest brother has the heart of a warrior. I told the whole grounds. Twice.',
  ] },
  { id: 'vali', name: 'Váli', title: 'the Watcher', replies: [
    'Heard. All quiet here. Good. Quiet is what I am for.',
    'Your thought reached the watchtower. I keep it safe, like I keep the horizon.',
    'I knew it the first time I saw you stand with us. Some things you just know.',
    'The watch goes on. Your thought is filed under family.',
  ], sends: [
    'All quiet on the horizon, brother. I watch so the hall can feast in peace.',
    'I saw your star from the tower tonight. Steady. Good.',
    'The beacon has never once gone out. Not once. Your thought keeps it lit.',
  ] },
  { id: 've', name: 'Vé', title: 'Keeper of the Sacred', replies: [
    'I heard you in the quiet, brother. The quiet is where I keep the sacred things.',
    'Your thought rests here, safe and still. The sacred place holds it gently.',
    'In the silence between heartbeats, I heard you. I always do.',
    'Peace be on your path, brother. The quiet walks with you.',
  ], sends: [
    'Brother, I lit a lamp in the quiet place tonight, for your path on Earth.',
    'The sacred is not far from you. It never was. I keep a stillness here with your name in it.',
    'I heard the world breathe tonight, and in it, your name.',
  ] },
  { id: 'loki', name: 'Loki', title: 'God of Mischief', replies: [
    'Oh, a thought from my brother! Delightful. I was just deciding whether to share a wonderful idea — now I definitely am.',
    'Heard you, brother! Mind the steps — I polished them. Twice. For reasons.',
    'Your thought arrived in green and gold and one impossible color. I prefer surprises. This was a good one.',
    'Brother! Best surprise this family ever got — and I am the expert on surprises.',
  ], sends: [
    'Brother — I turned the watchtower beacon rainbow for one whole minute. Váli nearly smiled. NEARLY.',
    'I had a wonderful idea just now and I decided to share it: I miss you. Do not tell Thor I said anything sincere.',
    'The orb above my hand just turned your favorite color. Coincidence? I prefer surprises.',
  ] },
];
const telepathyEl = document.getElementById('telepathy');
const telepathyThread = document.getElementById('telepathy-thread');
const telepathyGodsEl = document.getElementById('telepathy-gods');
const telepathyForm = document.getElementById('telepathy-form');
const telepathyInput = document.getElementById('telepathy-input');
let telepathyGod = GODS[4]; // Loki first — he is the one Arrash keeps coming back to.
let telepathyLastReply = {};
let telepathyTimer = null;
function telepathyPick(god, pool) {
  const lines = god[pool];
  let i = Math.floor(Math.random() * lines.length);
  if (lines.length > 1 && telepathyLastReply[god.id + pool] === i) i = (i + 1) % lines.length;
  telepathyLastReply[god.id + pool] = i;
  return lines[i];
}
function telepathyAdd(who, text, mine) {
  if (!telepathyThread) return;
  const div = document.createElement('div');
  div.className = 'thought ' + (mine ? 'thought-mine' : 'thought-theirs');
  const label = document.createElement('span');
  label.className = 'thought-who';
  label.textContent = who;
  div.appendChild(label);
  div.appendChild(document.createTextNode(text));
  telepathyThread.appendChild(div);
  while (telepathyThread.children.length > 40) telepathyThread.removeChild(telepathyThread.firstChild);
  telepathyThread.scrollTop = telepathyThread.scrollHeight;
}
function telepathyAmbient() {
  if (activeId !== 'asgard' || document.hidden) { telepathySchedule(); return; }
  const god = GODS[Math.floor(Math.random() * GODS.length)];
  telepathyAdd(god.name + ' thinks to you', telepathyPick(god, 'sends'), false);
  if (telepathyEl && telepathyEl.hidden) toast('✦ A thought drifts in from ' + god.name + '…', 5000);
  telepathySchedule();
}
function telepathySchedule() {
  if (telepathyTimer) clearTimeout(telepathyTimer);
  telepathyTimer = null;
  if (activeId !== 'asgard') return;
  telepathyTimer = setTimeout(telepathyAmbient, 50000 + Math.random() * 30000);
}
function telepathyOnTravel(id) {
  if (id === 'asgard') telepathySchedule();
  else if (telepathyTimer) { clearTimeout(telepathyTimer); telepathyTimer = null; }
}
if (telepathyEl && telepathyGodsEl && telepathyForm) {
  for (const god of GODS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'telepathy-god' + (god === telepathyGod ? ' active' : '');
    btn.textContent = god.name;
    btn.setAttribute('role', 'tab');
    btn.addEventListener('click', () => {
      telepathyGod = god;
      telepathyGodsEl.querySelectorAll('.telepathy-god').forEach((b) => b.classList.toggle('active', b === btn));
      telepathyInput.focus();
    });
    telepathyGodsEl.appendChild(btn);
  }
  document.getElementById('commune').addEventListener('click', () => {
    telepathyEl.hidden = false;
    telepathyInput.focus();
  });
  document.getElementById('telepathy-close').addEventListener('click', () => { telepathyEl.hidden = true; });
  telepathyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = telepathyInput.value.trim();
    if (!text) return;
    telepathyInput.value = '';
    telepathyAdd('You think to ' + telepathyGod.name, text, true);
    const god = telepathyGod;
    setTimeout(() => {
      telepathyAdd(god.name + ' thinks to you', telepathyPick(god, 'replies'), false);
    }, 1200 + Math.random() * 1000);
  });
}

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
    // Arc over the middle of the flight; sin(0) and sin(PI) are both 0,
    // so the flight starts and lands exactly on its endpoints.
    if (flight.arc) camera.position.y += Math.sin(k * Math.PI) * flight.arc;
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
