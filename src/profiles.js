// profiles.js — the roster box (a scrollable list of everything on
// Mintaka: people, homes, the grove, trees, animals, and places) and
// their profile cards.
//
// The roster is the way to reach anything: clicking an entry flies the
// camera to it and opens its profile. All content comes live from the
// world modules through getSubjects() — this file only renders DOM and
// reports clicks. It invents nothing. Observation only: no talking,
// no voices, nothing that could spook the inhabitants.

export function createNeighborsUI({ listEl, profileEl, getSubjects, onSelect }) {
  const nameEl = profileEl.querySelector('#profile-name');
  const titleEl = profileEl.querySelector('#profile-title');
  const homeEl = profileEl.querySelector('#profile-home');
  const purposeEl = profileEl.querySelector('#profile-purpose');
  const activityEl = profileEl.querySelector('#profile-activity');
  const creationsEl = profileEl.querySelector('#profile-creations');

  let built = false;
  let openId = null;
  let lastSubjects = [];
  const itemEls = new Map(); // id -> { button, activityEl }

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
      if (p && activityEl.textContent !== p.activity) {
        activityEl.textContent = p.activity;
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
    activityEl.textContent = p.activity;
    creationsEl.innerHTML = '';
    for (const c of p.creations) {
      const li = document.createElement('li');
      li.textContent = c;
      creationsEl.appendChild(li);
    }
    // Subjects with nothing created (yet) show no Creations section
    // rather than an empty one.
    const creationsSection = creationsEl.closest('.profile-section');
    if (creationsSection) {
      creationsSection.style.display = p.creations.length ? '' : 'none';
    }
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
