// agentbar.js — the Agent Bar: every inhabitant of Mintaka, live, in
// one strip along the bottom of the world.
//
// Arrash's ask (Nov 16): "add an agent bar inside our website that's
// working" — the people, creatures, and animals as individual agents,
// each one showing what it is doing right now and what it is thinking
// right now, updating as the world turns.
//
// It is LIVE, not a mockup: every refresh reads the same live roster
// the Neighbors Box shows (getSubjects) and the same awakening record
// the character sheets show (getAwakening). The "doing now" line is the
// subject's live activity — the village routines move with the
// world-clock phases, the scientists and keepers move on their own
// dwell timers — and the "thinking now" line is the day-seeded thought
// from the awakening. Creatures and animals carry their standing
// activity from the roster, exactly as the Neighbors Box shows it;
// their thoughts are the awakening's, same as everyone else's. Nothing
// here is hardcoded, and nothing here invents a line.
//
// Watch-only, like everything else in the world: the bar only SHOWS
// what each agent does and thinks. No chat, no talk, no input to
// anyone. Clicking a card does exactly what clicking a roster name
// does — flies the camera to them and opens their character sheet.
//
// Scope is the same world the Neighbors Box shows: Mintaka only.
// Homes, places, and trees are not agents and never appear. There is
// no Nyx entry and no entry for Arrash himself — the bar lists only
// the subjects getSubjects() returns with kind person, creature, or
// animal, and neither of them is one.
//
// The bar never throws: a bad record for one agent is skipped with a
// warning, and the whole refresh is guarded, so this strip can never
// take down the render loop.

import { getAwakening, worldDay } from './awakening.js';

// Only living inhabitants are agents. Places, homes, and trees stay
// in the roster, never in the bar.
const AGENT_KINDS = new Set(['person', 'creature', 'animal']);

export function createAgentBar({ barEl, stripEl, dayEl, toggleEl, getSubjects, onSelect }) {
  // If the markup is absent, the bar silently does nothing — the world
  // must never break over a missing panel.
  if (!barEl || !stripEl || typeof getSubjects !== 'function') {
    return { refresh() {} };
  }

  const cardEls = new Map(); // id -> { card, doingEl, thoughtEl }
  let lastSignature = '';

  // The awakening record for a subject, or null. Guarded so a bad
  // record never takes down the bar.
  function awakeningFor(p) {
    try {
      return getAwakening(p);
    } catch (err) {
      console.warn('[agentbar] awakening failed for', p && p.id, err);
      return null;
    }
  }

  // Build the strip once per roster membership. Names, titles, and
  // areas never change, so they are written here and never touched
  // again; only the live lines move in refresh(). Rebuilding only when
  // the membership changes keeps the strip's scroll position steady.
  function buildCards(agents) {
    stripEl.innerHTML = '';
    cardEls.clear();
    for (const p of agents) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'agent-card';
      card.setAttribute('data-agent-id', p.id);
      card.setAttribute('aria-label', p.name + ' — open their character sheet');

      const area = document.createElement('span');
      area.className = 'agent-area';
      area.textContent = p.area || '';
      card.appendChild(area);

      const name = document.createElement('span');
      name.className = 'agent-name';
      name.textContent = p.name;
      if (p.title) {
        const title = document.createElement('span');
        title.className = 'agent-title';
        title.textContent = ' · ' + p.title;
        name.appendChild(title);
      }
      card.appendChild(name);

      const doing = document.createElement('span');
      doing.className = 'agent-doing';
      card.appendChild(doing);

      const thought = document.createElement('span');
      thought.className = 'agent-thought';
      card.appendChild(thought);

      card.addEventListener('click', () => onSelect(p.id));
      stripEl.appendChild(card);
      cardEls.set(p.id, { card, doingEl: doing, thoughtEl: thought });
    }
  }

  // Refresh the live lines in place: the doing line from the live
  // roster snapshot, the thinking line from the awakening. Text is
  // only rewritten when it actually changed, so the strip never
  // flickers or reflows on a beat where nothing moved.
  function refresh() {
    try {
      const subjects = getSubjects();
      if (!subjects.length) return;
      const agents = subjects.filter((p) => AGENT_KINDS.has(p.kind));
      if (!agents.length) return;
      const signature = agents.map((p) => p.id).join('|');
      if (signature !== lastSignature) {
        lastSignature = signature;
        buildCards(agents);
      }
      if (dayEl) {
        const label = 'Day ' + worldDay() + ' · Live';
        if (dayEl.textContent !== label) dayEl.textContent = label;
      }
      for (const p of agents) {
        const els = cardEls.get(p.id);
        if (!els) continue;
        const doing = p.activity || '';
        if (els.doingEl.textContent !== doing) els.doingEl.textContent = doing;
        els.doingEl.style.display = doing ? '' : 'none';
        const awak = awakeningFor(p);
        const thought = awak && awak.thought ? awak.thought : '';
        if (els.thoughtEl.textContent !== thought) els.thoughtEl.textContent = thought;
        els.thoughtEl.style.display = thought ? '' : 'none';
      }
    } catch (err) {
      console.warn('[agentbar] refresh failed', err);
    }
  }

  // Collapse: the strip hides, the header stays, and the body class
  // lets the panels drop back down (see styles.css). The live lines
  // keep refreshing while collapsed, so reopening shows the world
  // as it is, not as it was.
  if (toggleEl) {
    toggleEl.addEventListener('click', () => {
      const collapsed = barEl.classList.toggle('collapsed');
      document.body.classList.toggle('agentbar-collapsed', collapsed);
      toggleEl.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      toggleEl.textContent = collapsed ? '▴' : '▾';
    });
  }

  return { refresh };
}
