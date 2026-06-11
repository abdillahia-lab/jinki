/*
  mission.ts — the Mission Player scene. Loaded ONLY via dynamic import
  behind a capability gate (desktop-class, fine pointer, no reduced-motion).

  A procedural low-poly data-center campus in the Intelligence Brief
  palette: ink world, hairline edges, signal-orange heat. One mission loop:
    FLY   t 0.00-0.30  aircraft enters on a drawn path, camera settles
    SEE   t 0.30-0.62  scan cone sweeps the roof, tiles paint ironbow
    FIND  t 0.62-0.85  three findings flare + leader lines + labels
    REPORT t 0.85-1.0  camera pulls back, report card collates
  Driven by scroll progress through the host section; drag orbits ±35°.
*/
import * as THREE from 'three';

const INK_BG = 0x0a0a0a;
const SURFACE = 0x181818;
const BUILDING = 0x262626;
const EDGE = 0x4a4a4a;
const SIGNAL = 0xff4f00;

// ironbow stops for roof-tile heat (cold -> hot)
const IRON: [number, THREE.Color][] = [
  [0.0, new THREE.Color(0x16001f)],
  [0.3, new THREE.Color(0x4a0a6e)],
  [0.55, new THREE.Color(0xa01a78)],
  [0.75, new THREE.Color(0xe05a28)],
  [0.9, new THREE.Color(0xffb000)],
  [1.0, new THREE.Color(0xfff4cc)],
];
function ironColor(t: number, out: THREE.Color) {
  t = Math.max(0, Math.min(1, t));
  for (let i = 0; i < IRON.length - 1; i++) {
    const [t0, c0] = IRON[i];
    const [t1, c1] = IRON[i + 1];
    if (t >= t0 && t <= t1) {
      out.copy(c0).lerp(c1, (t - t0) / (t1 - t0));
      return;
    }
  }
  out.copy(IRON[IRON.length - 1][1]);
}

export interface MissionAPI {
  setProgress(t: number): void;
  setPhaseCallback(cb: (phase: number) => void): void;
  destroy(): void;
}

export function createMission(canvas: HTMLCanvasElement, labelLayer: HTMLElement): MissionAPI {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(INK_BG);
  scene.fog = new THREE.Fog(INK_BG, 60, 160);

  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.5, 400);

  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-30, 50, 20);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6688ff, 0.25);
  rim.position.set(40, 20, -30);
  scene.add(rim);

  /* ---------- ground: plane + mono grid ---------- */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshLambertMaterial({ color: SURFACE })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  const grid = new THREE.GridHelper(400, 80, 0x222222, 0x1a1a1a);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.5;
  grid.position.y = 0.02;
  scene.add(grid);

  /* ---------- campus: two halls + plant ---------- */
  const edgeMat = new THREE.LineBasicMaterial({ color: EDGE });
  function building(w: number, h: number, d: number, x: number, z: number) {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: BUILDING }));
    m.position.set(x, h / 2, z);
    scene.add(m);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat);
    edges.position.copy(m.position);
    scene.add(edges);
    return m;
  }
  const hallA = building(36, 7, 16, -6, -4);
  building(24, 6, 12, 14, 12);          // hall B
  building(8, 4, 8, -28, 10);           // plant
  // cooling towers
  for (let i = 0; i < 3; i++) {
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.8, 3.2, 12),
      new THREE.MeshLambertMaterial({ color: 0x242424 })
    );
    cyl.position.set(-28 + i * 5, 1.6, 17);
    scene.add(cyl);
  }

  /* ---------- roof tiles on hall A (the scan target) ---------- */
  const TX = 12, TZ = 5;
  const tileGeo = new THREE.BoxGeometry(36 / TX - 0.35, 0.22, 16 / TZ - 0.35);
  const tileMat = new THREE.MeshBasicMaterial();
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, TX * TZ);
  const tilePos: THREE.Vector3[] = [];
  const dummy = new THREE.Object3D();
  const cold = new THREE.Color(0x141414);
  let ti = 0;
  for (let ix = 0; ix < TX; ix++) {
    for (let iz = 0; iz < TZ; iz++) {
      const x = -6 - 18 + (ix + 0.5) * (36 / TX);
      const z = -4 - 8 + (iz + 0.5) * (16 / TZ);
      dummy.position.set(x, 7.13, z);
      dummy.updateMatrix();
      tiles.setMatrixAt(ti, dummy.matrix);
      tiles.setColorAt(ti, cold);
      tilePos.push(new THREE.Vector3(x, 7.13, z));
      ti++;
    }
  }
  tiles.instanceColor!.needsUpdate = true;
  scene.add(tiles);
  // RTU blocks on some tiles
  const rtuIdx = [7, 18, 26, 33, 41, 52];
  for (const i of rtuIdx) {
    const rtu = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.9, 1.2),
      new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
    );
    rtu.position.copy(tilePos[i]).y += 0.55;
    scene.add(rtu);
  }
  const exposure = new Float32Array(TX * TZ);
  const FINDINGS = [
    { tile: 18, boost: 1.0, label: 'SEV-1 · ΔT +14.2°C' },
    { tile: 41, boost: 0.85, label: 'SEV-2 · CRAH BEARING' },
    { tile: 33, boost: 0.7, label: 'SEV-2 · MOISTURE' },
  ];

  /* ---------- aircraft + path + scan cone ---------- */
  const pathPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 100; i++) {
    const u = i / 100;
    // approach arc then a lawnmower pass over hall A
    if (u < 0.35) {
      const a = u / 0.35;
      pathPts.push(new THREE.Vector3(
        -70 + a * 40, 26 - a * 8, 50 - a * 44
      ));
    } else {
      const s = (u - 0.35) / 0.65;
      const lane = Math.floor(s * 3);
      const lu = (s * 3) % 1;
      const dir = lane % 2 === 0 ? 1 : -1;
      pathPts.push(new THREE.Vector3(
        -24 + (dir > 0 ? lu : 1 - lu) * 36,
        18,
        -10 + lane * 6
      ));
    }
  }
  const curve = new THREE.CatmullRomCurve3(pathPts);
  const pathGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(220));
  const pathLine = new THREE.Line(
    pathGeo,
    new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.55 })
  );
  scene.add(pathLine);
  pathGeo.setDrawRange(0, 0);

  const craft = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xf4f4f2 })
  );
  craft.add(body);
  const beacon = new THREE.PointLight(SIGNAL, 8, 24);
  craft.add(beacon);
  scene.add(craft);

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(5.2, 12, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.10, side: THREE.DoubleSide, depthWrite: false })
  );
  cone.rotation.x = Math.PI; // point down
  scene.add(cone);
  cone.visible = false;

  /* ---------- finding markers (leader line + HTML label) ---------- */
  const markers = FINDINGS.map((f) => {
    const p = tilePos[f.tile];
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      p.clone(), p.clone().setY(p.y + 7),
    ]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: SIGNAL }));
    line.visible = false;
    scene.add(line);
    const el = document.createElement('span');
    el.className = 'mission-label';
    el.textContent = f.label;
    el.style.opacity = '0';
    labelLayer.appendChild(el);
    return { ...f, line, el, anchor: p.clone().setY(p.y + 7.4) };
  });

  /* ---------- camera rig ---------- */
  let azimuth = 0; // drag offset
  let dragging = false, lastX = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; });
  addEventListener('pointermove', (e) => {
    if (!dragging) return;
    azimuth += (e.clientX - lastX) * 0.004;
    azimuth = Math.max(-0.6, Math.min(0.6, azimuth));
    lastX = e.clientX;
  });
  addEventListener('pointerup', () => { dragging = false; });

  const camTarget = new THREE.Vector3(-4, 4, 0);
  function placeCamera(t: number) {
    // FLY: wide arrival -> SEE: high oblique -> FIND: push in -> REPORT: pull back
    let r: number, h: number, baseAz: number;
    if (t < 0.3) {
      const a = t / 0.3;
      r = 70 - a * 22; h = 34 - a * 10; baseAz = -0.9 + a * 0.5;
    } else if (t < 0.62) {
      const a = (t - 0.3) / 0.32;
      r = 48 - a * 6; h = 24 - a * 2; baseAz = -0.4 + a * 0.25;
    } else if (t < 0.85) {
      const a = (t - 0.62) / 0.23;
      r = 42 - a * 14; h = 22 - a * 8; baseAz = -0.15 + a * 0.2;
    } else {
      const a = (t - 0.85) / 0.15;
      r = 28 + a * 26; h = 14 + a * 16; baseAz = 0.05 + a * 0.25;
    }
    const az = baseAz + azimuth;
    camera.position.set(camTarget.x + r * Math.sin(az), h, camTarget.z + r * Math.cos(az));
    camera.lookAt(camTarget);
  }

  /* ---------- timeline ---------- */
  let progress = 0;
  let currentPhase = -1;
  let phaseCb: (p: number) => void = () => {};
  const tmpColor = new THREE.Color();

  function update() {
    const t = progress;
    const phase = t < 0.3 ? 0 : t < 0.62 ? 1 : t < 0.85 ? 2 : 3;
    if (phase !== currentPhase) { currentPhase = phase; phaseCb(phase); }

    // path draw + craft position
    const pu = Math.min(1, t / 0.62);
    pathGeo.setDrawRange(0, Math.floor(221 * pu));
    const cp = curve.getPointAt(Math.max(0.001, pu));
    craft.position.copy(cp);

    // scan cone + exposure
    const scanning = t >= 0.3 && t < 0.66;
    cone.visible = scanning;
    if (scanning) {
      cone.position.set(cp.x, cp.y - 6, cp.z);
      for (let i = 0; i < tilePos.length; i++) {
        const d = Math.hypot(tilePos[i].x - cp.x, tilePos[i].z - cp.z);
        if (d < 5.2) exposure[i] = Math.min(1, exposure[i] + 0.08);
      }
    }
    // findings flare during FIND
    for (const f of FINDINGS) {
      const flareT = t < 0.62 ? 0 : Math.min(1, (t - 0.62) / 0.1);
      exposure[f.tile] = Math.max(exposure[f.tile], Math.min(1, exposure[f.tile] + flareT * f.boost));
    }
    // paint tiles
    for (let i = 0; i < tilePos.length; i++) {
      const isFinding = FINDINGS.some((f) => f.tile === i);
      const e = exposure[i];
      const heat = isFinding && t >= 0.62 ? Math.min(1, 0.55 + e * 0.45) : e * 0.45;
      if (e > 0) { ironColor(heat, tmpColor); tiles.setColorAt(i, tmpColor); }
    }
    tiles.instanceColor!.needsUpdate = true;

    // markers + labels
    markers.forEach((m, i) => {
      const on = t >= 0.64 + i * 0.05 && t < 0.97;
      m.line.visible = on;
      m.el.style.opacity = on ? '1' : '0';
      if (on) {
        const sp = m.anchor.clone().project(camera);
        m.el.style.left = ((sp.x + 1) / 2) * 100 + '%';
        m.el.style.top = ((1 - sp.y) / 2) * 100 + '%';
      }
    });

    placeCamera(t);
    renderer.render(scene, camera);
  }

  /* ---------- resize + rAF ---------- */
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let raf = 0;
  let running = true;
  const loop = () => {
    if (running) update();
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  const onVis = () => { running = document.visibilityState === 'visible'; };
  document.addEventListener('visibilitychange', onVis);

  return {
    setProgress(t: number) { progress = Math.max(0, Math.min(1, t)); },
    setPhaseCallback(cb) { phaseCb = cb; },
    destroy() {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      ro.disconnect();
      renderer.dispose();
      markers.forEach((m) => m.el.remove());
    },
  };
}
