// xr.js — "Step inside (VR)": immersive-vr sessions when the browser
// supports them, graceful fallback otherwise. In VR the headset pose is
// relative to a dolly (rig) placed at the current viewpoint, so you step
// into the world exactly where you were looking.

export function setupXR({ renderer, camera, rig, button, statusEl, controls, getTarget }) {
  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local-floor');

  let saved = null;

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }

  if (!('xr' in navigator)) {
    button.disabled = true;
    button.textContent = 'VR not available in this browser';
    setStatus('Explore with mouse or touch — or open this page in a WebXR browser (Quest, Vision Pro, Galaxy XR) to step inside.');
    return { supported: false };
  }

  navigator.xr.isSessionSupported('immersive-vr').then((ok) => {
    if (!ok) {
      button.disabled = true;
      button.textContent = 'VR not available in this browser';
      setStatus('This browser can\'t start an immersive VR session. Mouse / touch explore works everywhere.');
      return;
    }
    button.disabled = false;
    button.textContent = 'Step inside (VR)';
    setStatus('VR ready — a headset can step into this world.');
  }).catch(() => {
    button.disabled = true;
    button.textContent = 'VR not available in this browser';
  });

  button.addEventListener('click', async () => {
    if (renderer.xr.isPresenting) {
      const session = renderer.xr.getSession();
      if (session) session.end();
      return;
    }
    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor'],
      });
      // Place the dolly where the camera is, facing the current target.
      saved = {
        camPos: camera.position.clone(),
        camQuat: camera.quaternion.clone(),
        target: getTarget ? getTarget().clone() : null,
        controlsEnabled: controls ? controls.enabled : true,
      };
      rig.position.copy(camera.position);
      rig.quaternion.copy(camera.quaternion);
      camera.position.set(0, 0, 0);
      camera.quaternion.identity();
      if (controls) controls.enabled = false;
      button.textContent = 'Leave VR';
      setStatus('You are inside the world. Look around — you are standing where you were looking.');
      session.addEventListener('end', () => {
        if (saved) {
          camera.position.copy(saved.camPos);
          camera.quaternion.copy(saved.camQuat);
          if (controls && saved.target) {
            controls.target.copy(saved.target);
            controls.enabled = saved.controlsEnabled;
            controls.update();
          }
        }
        rig.position.set(0, 0, 0);
        rig.quaternion.identity();
        button.textContent = 'Step inside (VR)';
        setStatus('Back to the window. The world is still here.');
      });
      await renderer.xr.setSession(session);
    } catch (err) {
      setStatus('Could not start VR: ' + (err && err.message ? err.message : 'unknown error'));
    }
  });

  return { supported: true };
}
