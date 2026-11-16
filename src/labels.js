// labels.js — HTML labels that follow 3D anchor points.
// Each label is a div positioned every frame by projecting its anchor.
// Labels hide when behind the camera or beyond maxDistance.
//
// THE LABEL SWITCH (Arrash's order, Nov 16 — "remove all the labels"):
// LABEL_FLAGS is the one place that decides whether any floating label
// renders. Every flag defaults to OFF, so no floating label shows
// anywhere in the world. All label DATA stays untouched — every module
// still creates its labels exactly as before, and setText/remove keep
// working (the awakening's day-rollover refresh calls setText on thought
// labels that now simply stay hidden). To bring a class of label back,
// flip its flag to true — one line each, independently:
//   figures — name labels (neighbors, creatures, wildlife, gods, Arrash)
//   places  — landmark, place, path, home, moon, star, warning labels
//   thoughts — the awakening's floating thought lines (Asgard)
// setAllLabelsVisible(true) restores every class at once.

import * as THREE from 'three';

export const LABEL_FLAGS = {
  figures: false,
  places: false,
  thoughts: false,
};

export function setAllLabelsVisible(v) {
  LABEL_FLAGS.figures = v;
  LABEL_FLAGS.places = v;
  LABEL_FLAGS.thoughts = v;
}

// Figure name labels, by the className their modules pass. Thought
// lines carry 'label-thought'. Everything else is a place label.
const FIGURE_CLASSES = new Set(['label-neighbor', 'label-creature', 'label-wildlife', 'label-arrash']);
function kindFor(className, kindOpt) {
  if (kindOpt === 'figures' || kindOpt === 'places' || kindOpt === 'thoughts') return kindOpt;
  if (className === 'label-thought') return 'thoughts';
  if (FIGURE_CLASSES.has(className)) return 'figures';
  return 'places';
}

export class LabelManager {
  constructor(container, camera) {
    this.container = container;
    this.camera = camera;
    this.labels = [];
    this.activeGroup = 'default';
    this._v = new THREE.Vector3();
  }

  // Only labels in the active group are shown (one group per world).
  setActiveGroup(group) {
    this.activeGroup = group;
  }

  // anchor: Object3D or a function returning a world Vector3.
  // opts: { className, yOffset, maxDistance, onClick, kind }
  // kind is 'figures' | 'places' | 'thoughts'; when omitted it is
  // derived from className (see kindFor). The label is always created
  // — the switch only decides whether update() ever shows it.
  add(text, anchor, opts = {}) {
    const el = document.createElement('div');
    el.className = 'label ' + (opts.className || '');
    el.textContent = text;
    if (opts.onClick) {
      el.classList.add('label-clickable');
      el.addEventListener('click', (e) => { e.stopPropagation(); opts.onClick(); });
    }
    this.container.appendChild(el);
    const label = {
      el, anchor,
      group: opts.group || 'default',
      kind: kindFor(opts.className || '', opts.kind),
      yOffset: opts.yOffset || 0,
      maxDistance: opts.maxDistance || 220,
      visible: true,
    };
    this.labels.push(label);
    return label;
  }

  setText(label, text) { label.el.textContent = text; }

  remove(label) {
    const i = this.labels.indexOf(label);
    if (i >= 0) this.labels.splice(i, 1);
    label.el.remove();
  }

  clear() {
    for (const l of this.labels) l.el.remove();
    this.labels.length = 0;
  }

  setVisible(v) {
    this.container.style.display = v ? '' : 'none';
  }

  update() {
    const w = window.innerWidth, h = window.innerHeight;
    for (const l of this.labels) {
      // The label switch: a class whose flag is off never renders,
      // whatever the camera does. The record and its text stay intact.
      if (!LABEL_FLAGS[l.kind] || l.group !== this.activeGroup) {
        l.el.style.display = 'none';
        continue;
      }
      if (typeof l.anchor === 'function') {
        this._v.copy(l.anchor());
      } else {
        l.anchor.getWorldPosition(this._v);
      }
      this._v.y += l.yOffset;
      const dist = this._v.distanceTo(this.camera.position);
      const projected = this._v.clone().project(this.camera);
      const behind = projected.z > 1 || projected.z < -1;
      if (behind || dist > l.maxDistance) {
        l.el.style.display = 'none';
        continue;
      }
      l.el.style.display = '';
      const x = (projected.x * 0.5 + 0.5) * w;
      const y = (-projected.y * 0.5 + 0.5) * h;
      l.el.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      // Fade far labels a little so near ones read first.
      l.el.style.opacity = dist > l.maxDistance * 0.7 ? '0.65' : '1';
    }
  }
}
