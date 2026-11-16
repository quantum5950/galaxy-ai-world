// profiles.js — the roster box (a scrollable list of everything on
// Mintaka: people, homes, the grove, trees, animals, and places) and
// their profile cards.
//
// The roster is the way to reach anything: clicking an entry flies the
// camera to it and opens its profile. All content comes live from the
// world modules through getSubjects() — this file only renders DOM and
// reports clicks. It invents nothing. Observation only: no talking,
// no voices, nothing that could spook the inhabitants.
//
// The awakening (awakening.js) surfaces here: a "Thinking now" line, a
// list of memories, new creations grown over the days, and a "Doing
// now" line that carries the character's growth arc. The roster list
// itself keeps the raw live activity; only the open profile blends.

import { getAwakening, worldDay } from './awakening.js';

export function createNeighborsUI({ listEl, profileEl, getSubjects, onSelect }) {
  const nameEl = profileEl.querySelector('#profile-name');
  const titleEl = profileEl.querySelector('#profile-title');
  const homeEl = profileEl.querySelector('#profile-home');
  const purposeEl = profileEl.querySelector('#profile-purpose');
  const activityEl = profileEl.querySelector('#profile-activity');
  const creationsEl = profileEl.querySelector('#profile-creations');
  const thinkingEl = profileEl.querySelector('#profile-thinking');
  const memoriesEl = profileEl.querySelector('#profile-memories');

  let built = false;
  let openId = null;
  let lastSubjects = [];
  let lastAwakeningDay = -1;
  const itemEls = new Map(); // id -> { button, activityEl }

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

  // The live activity line, carrying the character's growth arc when
  // they have one — the arc is a lowercase continuation of the line.
  function blendedActivity(p) {
    const awak = awakeningFor(p);
    return awak && awak.arc ? p.activity + ' — ' + awak.arc : p.activity;
  }

  // Render the awakening sections of the open profile: Thinking now,
  // Creations (newest grown creations first, marked, then the base
  // creations), and Memories (newest five). Empty sections hide.
  function renderAwakening(p) {
    const awak = awakeningFor(p);
    const thinkingSection = thinkingEl.closest('.profile-section');
    if (awak && awak.thought) {
      thinkingEl.textContent = awak.thought;
      if (thinkingSection) thinkingSection.style.display = '';
    } else if (thinkingSection) {
      thinkingSection.style.display = 'none';
    }
    creationsEl.innerHTML = '';
    const grown = awak ? awak.creations : [];
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
    const creationsSection = creationsEl.closest('.profile-section');
    if (creationsSection) {
      creationsSection.style.display = (grown.length || p.creations.length) ? '' : 'none';
    }
    const memoriesSection = memoriesEl.closest('.profile-section');
    const mems = awak ? awak.memories.slice(0, 5) : [];
    memoriesEl.innerHTML = '';
    for (const m of mems) {
      const li = document.createElement('li');
      li.textContent = m.label + ' — ' + m.text;
      memoriesEl.appendChild(li);
    }
    if (memoriesSection) memoriesSection.style.display = mems.length ? '' : 'none';
    lastAwakeningDay = worldDay();
  }

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
      const top = document.createElement('span');
      top.className = 'neighbor-item-top';
      const nm = document.createElement('span');
      nm.className = 'neighbor-item-name';
      nm.textContent = p.name;
      const ti = document.createElement('span');
      ti.className = 'neighbor-item-title';
      ti.textContent = ' — ' + p.title;
      top.append(nm, ti);
      const act = document.createElement('span');
      act.className = 'neighbor-item-activity';
      act.textContent = p.activity;
      btn.append(top, act);
      btn.addEventListener('click', () => onSelect(p.id));
      listEl.appendChild(btn);
      itemEls.set(p.id, { button: btn, activityEl: act });
    }
    built = true;
  }

  // Refresh the "doing now" lines from the live snapshot. The list is
  // built once; refresh only rewrites activity text, so scrolling and
  // clicks are never disturbed by re-rendering.
  function refresh() {
    const subjects = getSubjects();
    if (!subjects.length) return;
    lastSubjects = subjects;
    if (!built) buildList(subjects);
    for (const p of subjects) {
      const item = itemEls.get(p.id);
      if (!item) continue;
      if (item.activityEl.textContent !== p.activity) {
        item.activityEl.textContent = p.activity;
      }
      item.button.classList.toggle('active', p.id === openId);
    }
    if (openId) {
      const p = subjects.find((x) => x.id === openId);
      if (p) {
        // The open profile blends the growth arc into its Doing now
        // line; the roster list above keeps the raw activity.
        const blended = blendedActivity(p);
        if (activityEl.textContent !== blended) {
          activityEl.textContent = blended;
        }
        // Re-render the awakening sections when the world day turns.
        if (worldDay() !== lastAwakeningDay) renderAwakening(p);
      }
    }
  }

  function openProfile(id) {
    const p = lastSubjects.find((x) => x.id === id) || getSubjects().find((x) => x.id === id);
    if (!p) return false;
    openId = id;
    nameEl.textContent = p.name;
    titleEl.textContent = p.title;
    homeEl.textContent = p.where || (p.homeName ? '⌂ ' + p.homeName : '');
    purposeEl.textContent = p.purpose;
    activityEl.textContent = blendedActivity(p);
    renderAwakening(p);
    profileEl.classList.add('show');
    for (const [pid, item] of itemEls) {
      item.button.classList.toggle('active', pid === id);
    }
    return true;
  }

  function closeProfile() {
    openId = null;
    profileEl.classList.remove('show');
    for (const item of itemEls.values()) {
      item.button.classList.remove('active');
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
