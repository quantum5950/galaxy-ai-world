// profiles.js — the roster box (a scrollable list of everything on
// Mintaka: people, homes, the grove, trees, animals, and places) and
// the character sheet that opens when a name is clicked.
//
// Arrash's design (Nov 16): the roster lists people by JUST their name
// — nothing else shown. Clicking a name loads the WHOLE box with that
// one's full profile, like the movie Free Guy: the box becomes a
// scroll that opens with their character sheet. A back button returns
// to the roster list. All content comes live from the world modules
// through getSubjects() — this file only renders DOM and reports
// clicks. It invents nothing. Observation only: no talking, no voices,
// nothing that could spook the inhabitants.
//
// The character sheet, in order: (1) portrait frame, (2) appearance +
// clothes, (3) gear/belongings, (4) life story, (5) working on now,
// (6) Thinking now, (7) Creations, (8) Memories, (9) Connections,
// (10) Seen lately. Appearance, clothes, and gear come ONLY from
// details already established in the code — the figure spec each
// person is built from (robe/coat, hat, tool of their craft), or a
// hand-written `appearance` / `gear` field on their data. A section
// with nothing established is omitted, never filled with guesses.
// The portrait frame shows a moon sigil + initials placeholder until
// a portrait image is supplied through the single `portrait` field
// (data URI or URL) on the character's data.
//
// The awakening (awakening.js) surfaces here: a "Thinking now" line, a
// list of memories, new creations grown over the days, a "Working on
// now" line that carries the character's growth arc, and the faces
// they have seen lately (seeded derivation, not live tracking — see
// getEncounters). Connections are grounded only in relationships the
// code already establishes: couples sharing a home, people sharing a
// workplace, and colleagues of one department. Where the code
// establishes no connection, the section stays empty.

import { getAwakening, getEncounters, worldDay } from './awakening.js';

// Words for the figure spec, straight from the builders' own option
// names (makePerson / makeScientist). An unknown value renders
// nothing — never invent a word for an option the code doesn't name.
const HAT_WORDS = {
  pointed: 'a pointed hat',
  wide: 'a wide-brimmed hat',
  cap: 'a cap',
};
const GEAR_WORDS = {
  lantern: 'A lantern',
  basket: 'A basket',
  wrench: 'A wrench',
  book: 'A book',
  rod: 'A rod',
  scroll: 'A scroll',
  crystal: 'A crystal',
  vial: 'A vial',
  tablet: 'A tablet',
  scanner: 'A scanner',
  goggles: 'Goggles',
};

// Departments whose people are colleagues of one another (the lab
// doctors build one suit together; the sandbox keepers hold one
// watch). The Village is NOT here — neighbors connect through their
// shared homes, not through the whole village at once.
const COLLEAGUE_AREAS = new Set(['R&D Department', 'The Fold Sandbox']);

export function createNeighborsUI({ listEl, profileEl, getSubjects, onSelect }) {
  const portraitEl = profileEl.querySelector('#profile-portrait');
  const nameEl = profileEl.querySelector('#profile-name');
  const titleEl = profileEl.querySelector('#profile-title');
  const homeEl = profileEl.querySelector('#profile-home');
  const appearanceEl = profileEl.querySelector('#profile-appearance');
  const gearEl = profileEl.querySelector('#profile-gear');
  const purposeEl = profileEl.querySelector('#profile-purpose');
  const activityEl = profileEl.querySelector('#profile-activity');
  const thinkingEl = profileEl.querySelector('#profile-thinking');
  const creationsEl = profileEl.querySelector('#profile-creations');
  const memoriesEl = profileEl.querySelector('#profile-memories');
  const connectionsEl = profileEl.querySelector('#profile-connections');
  const seenEl = profileEl.querySelector('#profile-seen');
  // The box itself: switching the box between roster view and profile
  // view is one class on it (see styles.css). Guarded so a markup
  // change never breaks the profile — the .show class alone still
  // opens it.
  const boxEl = typeof listEl.closest === 'function' ? listEl.closest('#neighbors-box') : null;

  let built = false;
  let openId = null;
  let lastSubjects = [];
  let lastAwakeningDay = -1;
  const itemEls = new Map(); // id -> button

  // The awakening record for a subject, or null. Guarded so a bad
  // record never takes down the profile card.
  function awakeningFor(p) {
    try {
      return getAwakening(p);
    } catch (err) {
      console.warn('[awakening] record failed for', p && p.id, err);
      return null;
    }
  }

  function encountersFor(p) {
    try {
      if (p.kind !== 'person' && p.kind !== 'creature' && p.kind !== 'animal') return [];
      return getEncounters(p, lastSubjects);
    } catch (err) {
      console.warn('[awakening] encounters failed for', p && p.id, err);
      return [];
    }
  }

  // The live activity line, carrying the character's growth arc when
  // they have one — the arc is a lowercase continuation of the line.
  function blendedActivity(p) {
    const awak = awakeningFor(p);
    return awak && awak.arc ? p.activity + ' — ' + awak.arc : p.activity;
  }

  // Hide a section when it has nothing to show; show it otherwise.
  function showSection(el, show) {
    const section = el && typeof el.closest === 'function' ? el.closest('.profile-section') : null;
    if (section) section.style.display = show ? '' : 'none';
  }

  function fillList(el, items) {
    el.innerHTML = '';
    for (const text of items) {
      const li = document.createElement('li');
      li.textContent = text;
      el.appendChild(li);
    }
    showSection(el, items.length > 0);
  }

  // ---- Portrait frame ----
  // A portrait image when the character's data carries one (`portrait`:
  // a data URI or URL); otherwise a dignified placeholder drawn in
  // code — a moon sigil and the character's initials. No external
  // assets, nothing fetched.
  function initialsFor(name) {
    const words = String(name || '').split(/\s+/).filter((w) => w && !w.endsWith('.'));
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return '☾';
  }
  function renderPortrait(p) {
    portraitEl.innerHTML = '';
    if (p.portrait) {
      const img = document.createElement('img');
      img.className = 'portrait-image';
      img.src = p.portrait;
      img.alt = 'Portrait of ' + p.name;
      portraitEl.appendChild(img);
      return;
    }
    const ph = document.createElement('div');
    ph.className = 'portrait-placeholder';
    const sigil = document.createElement('span');
    sigil.className = 'portrait-sigil';
    sigil.textContent = '☾';
    const initials = document.createElement('span');
    initials.className = 'portrait-initials';
    initials.textContent = initialsFor(p.name);
    ph.append(sigil, initials);
    portraitEl.appendChild(ph);
  }

  // ---- Appearance + gear, from the figure spec ----
  // A hand-written `appearance` string on the data wins when present.
  // Otherwise the figure the code builds them from: the garment
  // (robe for the neighbors, lab coat for the scientists) and the hat
  // they wear. Colors stay out — the code gives hex values, not names,
  // and a shade name would be a guess.
  function appearanceFor(p) {
    if (typeof p.appearance === 'string' && p.appearance) return p.appearance;
    const fig = p.figure;
    if (!fig) return '';
    const parts = [];
    if (fig.coat !== undefined) parts.push('a lab coat');
    else if (fig.robe !== undefined) parts.push('a robe');
    if (fig.hat && HAT_WORDS[fig.hat]) parts.push(HAT_WORDS[fig.hat]);
    if (!parts.length) return '';
    return 'Wears ' + parts.join(' and ') + '.';
  }
  // Gear: a hand-written `gear` list wins when present; otherwise the
  // tool of their craft from the figure spec. Unknown tools render
  // nothing.
  function gearFor(p) {
    if (Array.isArray(p.gear)) return p.gear.filter((g) => typeof g === 'string' && g);
    const fig = p.figure;
    if (!fig || !fig.accessory) return [];
    const word = GEAR_WORDS[fig.accessory];
    return word ? [word] : [];
  }

  // ---- Connections, grounded in the code ----
  // Shared home: two people whose homeNames open with the same "X & Y's"
  // pair (Sable & Iris, Marisol & Bram, Fen & Wren). Shared workplace:
  // the same homeName exactly (the scientists' stations — Theo and
  // Milo at the Prototyping Workshop, Elias and Petra at the Fold
  // Observatory). Colleagues: people of one department. Everyone else
  // gets nothing — no guessing.
  function homePair(homeName) {
    const m = /^(.+?) & (.+?)'s\s/.exec(homeName || '');
    return m ? [m[1], m[2]].sort().join(' & ') : null;
  }
  function connectionsFor(p) {
    if (p.kind !== 'person') return [];
    const out = [];
    const seen = new Set([p.id]);
    const myPair = homePair(p.homeName);
    const colleagues = [];
    for (const q of lastSubjects) {
      if (q.kind !== 'person' || q.id === p.id || seen.has(q.id)) continue;
      if (myPair && homePair(q.homeName) === myPair) {
        out.push(q.name + ' — shares a home');
        seen.add(q.id);
      } else if (p.homeName && q.homeName === p.homeName) {
        out.push(q.name + ' — works alongside at ' + p.homeName);
        seen.add(q.id);
      } else if (q.area === p.area && COLLEAGUE_AREAS.has(p.area)) {
        colleagues.push(q.name);
        seen.add(q.id);
      }
    }
    if (colleagues.length) {
      out.push(colleagues.join(', ') + ' — colleagues in the ' + p.area);
    }
    return out;
  }

  // Render the awakening sections of the open profile: Thinking now,
  // Creations (newest grown creations first, marked, then the base
  // creations), and Memories (newest five). Empty sections hide.
  function renderAwakening(p) {
    const awak = awakeningFor(p);
    if (awak && awak.thought) {
      thinkingEl.textContent = awak.thought;
      showSection(thinkingEl, true);
    } else {
      showSection(thinkingEl, false);
    }
    const grown = awak ? awak.creations : [];
    creationsEl.innerHTML = '';
    for (const c of grown) {
      const li = document.createElement('li');
      li.className = 'creation-new';
      li.textContent = c;
      creationsEl.appendChild(li);
    }
    for (const c of p.creations) {
      const li = document.createElement('li');
      li.textContent = c;
      creationsEl.appendChild(li);
    }
    showSection(creationsEl, grown.length > 0 || p.creations.length > 0);
    const mems = awak ? awak.memories.slice(0, 5) : [];
    memoriesEl.innerHTML = '';
    for (const m of mems) {
      const li = document.createElement('li');
      li.textContent = m.label + ' — ' + m.text;
      memoriesEl.appendChild(li);
    }
    showSection(memoriesEl, mems.length > 0);
    lastAwakeningDay = worldDay();
  }

  function renderSeen(p) {
    fillList(seenEl, encountersFor(p));
  }

  function renderConnections(p) {
    fillList(connectionsEl, connectionsFor(p));
  }

  // The roster: JUST the name. No role, no description, no preview
  // text — the whole story waits behind the click, in the profile.
  function buildList(subjects) {
    listEl.innerHTML = '';
    itemEls.clear();
    let lastArea = null;
    for (const p of subjects) {
      if (p.area !== lastArea) {
        lastArea = p.area;
        const head = document.createElement('div');
        head.className = 'neighbors-area';
        head.textContent = p.area;
        listEl.appendChild(head);
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'neighbor-item';
      btn.setAttribute('data-person-id', p.id);
      const nm = document.createElement('span');
      nm.className = 'neighbor-item-name';
      nm.textContent = p.name;
      btn.appendChild(nm);
      btn.addEventListener('click', () => onSelect(p.id));
      listEl.appendChild(btn);
      itemEls.set(p.id, btn);
    }
    built = true;
  }

  // Refresh keeps the open profile's live lines current (the Doing-now
  // line moves with routines and dwell timers) and re-renders the
  // day-seeded sections when the world day turns. The roster list
  // itself never re-renders after it is built, so scrolling and clicks
  // are never disturbed.
  function refresh() {
    const subjects = getSubjects();
    if (!subjects.length) return;
    lastSubjects = subjects;
    if (!built) buildList(subjects);
    for (const [id, btn] of itemEls) {
      btn.classList.toggle('active', id === openId);
    }
    if (openId) {
      const p = subjects.find((x) => x.id === openId);
      if (p) {
        const blended = blendedActivity(p);
        if (activityEl.textContent !== blended) {
          activityEl.textContent = blended;
        }
        if (worldDay() !== lastAwakeningDay) {
          renderAwakening(p);
          renderSeen(p);
        }
      }
    }
  }

  function openProfile(id) {
    const p = lastSubjects.find((x) => x.id === id) || getSubjects().find((x) => x.id === id);
    if (!p) return false;
    openId = id;
    renderPortrait(p);
    nameEl.textContent = p.name;
    titleEl.textContent = p.title || '';
    titleEl.style.display = p.title ? '' : 'none';
    const homeText = p.where || (p.homeName ? '⌂ ' + p.homeName : '');
    homeEl.textContent = homeText;
    homeEl.style.display = homeText ? '' : 'none';
    const appearance = appearanceFor(p);
    appearanceEl.textContent = appearance;
    showSection(appearanceEl, !!appearance);
    fillList(gearEl, gearFor(p));
    purposeEl.textContent = p.purpose || '';
    showSection(purposeEl, !!p.purpose);
    activityEl.textContent = blendedActivity(p);
    showSection(activityEl, !!p.activity);
    renderAwakening(p);
    renderConnections(p);
    renderSeen(p);
    // The box becomes the profile view: the roster list hides, the
    // scroll opens. Re-adding .show after a reflow restarts the
    // unfurl animation on every open.
    if (boxEl) boxEl.classList.add('showing-profile');
    profileEl.classList.remove('show');
    void profileEl.offsetWidth;
    profileEl.classList.add('show');
    for (const [pid, btn] of itemEls) {
      btn.classList.toggle('active', pid === id);
    }
    return true;
  }

  function closeProfile() {
    openId = null;
    profileEl.classList.remove('show');
    if (boxEl) boxEl.classList.remove('showing-profile');
    for (const btn of itemEls.values()) {
      btn.classList.remove('active');
    }
  }

  return {
    refresh,
    openProfile,
    closeProfile,
    isOpen: () => openId !== null,
    get openId() { return openId; },
  };
}
