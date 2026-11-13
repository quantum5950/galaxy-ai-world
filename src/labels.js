// labels.js — HTML labels that follow 3D anchor points.
// Each label is a div positioned every frame by projecting its anchor.
// Labels hide when behind the camera or beyond maxDistance.

import * as THREE from 'three';

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
  // opts: { className, yOffset, maxDistance, onClick }
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
      if (l.group !== this.activeGroup) {
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
