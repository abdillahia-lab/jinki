/*
  mission.ts — the Mission Player scene. Loaded ONLY via dynamic import
  behind a capability gate (desktop-class, fine pointer, no reduced-motion).

  Art direction: TACTICAL HOLOGRAM. Near-black faces, bright drawn edges
  (hidden-line look), wireframe perimeter, mono labels, signal-orange heat.
  The campus reads like a planning-table hologram, not a game prototype.

  Mission loop:
    FLY    t 0.00-0.30  craft enters on a drawn path, camera settles
    SEE    t 0.30-0.62  scan cone sweeps; outlined roof cells paint ironbow
    FIND   t 0.62-0.85  three findings flare + leader lines + labels
    REPORT t 0.85-1.0   camera pulls back, report card collates
  Scroll-scrubbed; drag orbits ±35°.
*/
import * as THREE from 'three';

const INK_BG = 0x0a0a0a;
const FACE = 0x101010;       // occluding faces, nearly black
const EDGE = 0x9a9a96;       // drawn lines — the actual geometry read
const EDGE_DIM = 0x3c3c3a;
const SIGNAL = 0xff4f00;

const IRON: [number, THREE.Color][] = [
  [0.0, new THREE.Color(0x1a0526)],
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
    if (t >= t0 && t <= t1) { out.copy(c0).lerp(c1, (t - t0) / (t1 - t0)); return; }
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
  scene.fog = new THREE.Fog(INK_BG, 70, 190);
  const camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.5, 400);

  /* ---------- materials (basic — hologram doesn't need lighting) ---------- */
  const faceMat = new THREE.MeshBasicMaterial({
    color: FACE, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  });
  const edgeMat = new THREE.LineBasicMaterial({ color: EDGE });
  const edgeDimMat = new THREE.LineBasicMaterial({ color: EDGE_DIM });

  /* ---------- ground: plane + two-tier grid, radial fade via fog ---------- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), new THREE.MeshBasicMaterial({ color: 0x0c0c0c }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  scene.add(ground);
  const gridFine = new THREE.GridHelper(420, 140, 0x161616, 0x141414);
  gridFine.position.y = 0;
  scene.add(gridFine);
  const gridCoarse = new THREE.GridHelper(420, 28, 0x232322, 0x1d1d1c);
  gridCoarse.position.y = 0.01;
  scene.add(gridCoarse);

  /* ---------- hologram solids: dark faces + bright edges ---------- */
  function holo(geo: THREE.BufferGeometry, x: number, y: number, z: number, dim = false) {
    const mesh = new THREE.Mesh(geo, faceMat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 24), dim ? edgeDimMat : edgeMat);
    edges.position.copy(mesh.position);
    scene.add(edges);
    return mesh;
  }

  // Hall A — the scan target (long data hall)
  holo(new THREE.BoxGeometry(36, 7, 16), -6, 3.5, -4);
  // Hall B
  holo(new THREE.BoxGeometry(24, 6, 12), 14, 3, 14);
  // Plant + cooling
  holo(new THREE.BoxGeometry(8, 4, 8), -28, 2, 10);
  for (let i = 0; i < 3; i++) holo(new THREE.CylinderGeometry(1.6, 1.8, 3.2, 10), -28 + i * 5, 1.6, 17, true);
  // Substation yard (small frames)
  for (let i = 0; i < 4; i++) holo(new THREE.BoxGeometry(1.4, 2.2, 1.4), 28 + (i % 2) * 4, 1.1, -12 + Math.floor(i / 2) * 4, true);

  // Perimeter fence — wireframe ring (the SECURITY read)
  const fencePts: THREE.Vector3[] = [];
  const FENCE: [number, number][] = [[-44, -26], [34, -26], [42, -8], [42, 24], [-20, 30], [-44, 18], [-44, -26]];
  for (const [x, z] of FENCE) fencePts.push(new THREE.Vector3(x, 0, z), new THREE.Vector3(x, 1.6, z));
  const fenceGeo = new THREE.BufferGeometry();
  {
    const verts: number[] = [];
    for (let i = 0; i < FENCE.length - 1; i++) {
      const [x1, z1] = FENCE[i], [x2, z2] = FENCE[i + 1];
      verts.push(x1, 1.6, z1, x2, 1.6, z2); // top rail
      verts.push(x1, 0, z1, x1, 1.6, z1);   // post
    }
    fenceGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  }
  scene.add(new THREE.LineSegments(fenceGeo, edgeDimMat));

  // Road strips
  for (const [w, d, x, z] of [[120, 4, -10, 26], [4, 56, 38, 0]] as const) {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color: 0x121211 }));
    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0.02, z);
    scene.add(road);
  }

  /* ---------- roof grid on hall A: outlined cells, ironbow fill ---------- */
  const TX = 12, TZ = 5;
  const CELL_W = 36 / TX, CELL_D = 16 / TZ;
  const tileGeo = new THREE.PlaneGeometry(CELL_W - 0.3, CELL_D - 0.3);
  const tiles = new THREE.InstancedMesh(
    tileGeo,
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.92, side: THREE.DoubleSide }),
    TX * TZ
  );
  const tilePos: THREE.Vector3[] = [];
  const dummy = new THREE.Object3D();
  const coldTile = new THREE.Color(0x141414);
  let ti = 0;
  for (let ix = 0; ix < TX; ix++) {
    for (let iz = 0; iz < TZ; iz++) {
      const x = -6 - 18 + (ix + 0.5) * CELL_W;
      const z = -4 - 8 + (iz + 0.5) * CELL_D;
      dummy.position.set(x, 7.06, z);
      dummy.rotation.x = -Math.PI / 2;
      dummy.updateMatrix();
      tiles.setMatrixAt(ti, dummy.matrix);
      tiles.setColorAt(ti, coldTile);
      tilePos.push(new THREE.Vector3(x, 7.06, z));
      ti++;
    }
  }
  tiles.instanceColor!.needsUpdate = true;
  scene.add(tiles);
  // crisp grid lines over the roof
  {
    const verts: number[] = [];
    for (let ix = 0; ix <= TX; ix++) {
      const x = -24 + ix * CELL_W;
      verts.push(x, 7.1, -12, x, 7.1, 4);
    }
    for (let iz = 0; iz <= TZ; iz++) {
      const z = -12 + iz * CELL_D;
      verts.push(-24, 7.1, z, 12, 7.1, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    scene.add(new THREE.LineSegments(g, edgeDimMat));
  }
  // RTU blocks (hologram)
  const rtuIdx = [7, 18, 26, 33, 41, 52];
  for (const i of rtuIdx) {
    const p = tilePos[i];
    holo(new THREE.BoxGeometry(1.6, 0.9, 1.2), p.x, p.y + 0.5, p.z, true);
  }
  const exposure = new Float32Array(TX * TZ);
  const FINDINGS = [
    { tile: 18, boost: 1.0, label: 'SEV-1 · ΔT +14.2°C' },
    { tile: 41, boost: 0.85, label: 'SEV-2 · CRAH BEARING' },
    { tile: 33, boost: 0.7, label: 'SEV-2 · MOISTURE' },
  ];

  /* ---------- flight path + craft (delta glyph) + scan ---------- */
  const pathPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 100; i++) {
    const u = i / 100;
    if (u < 0.35) {
      const a = u / 0.35;
      pathPts.push(new THREE.Vector3(-70 + a * 40, 26 - a * 8, 50 - a * 44));
    } else {
      const s = (u - 0.35) / 0.65;
      const lane = Math.floor(s * 3);
      const lu = (s * 3) % 1;
      const dir = lane % 2 === 0 ? 1 : -1;
      pathPts.push(new THREE.Vector3(-24 + (dir > 0 ? lu : 1 - lu) * 36, 17, -10 + lane * 6));
    }
  }
  const curve = new THREE.CatmullRomCurve3(pathPts);
  const pathGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(220));
  const pathLine = new THREE.Line(pathGeo, new THREE.LineDashedMaterial({
    color: SIGNAL, dashSize: 1.2, gapSize: 0.8, transparent: true, opacity: 0.85,
  }));
  pathLine.computeLineDistances();
  scene.add(pathLine);
  pathGeo.setDrawRange(0, 0);

  // craft: white delta wedge oriented along the path tangent + glow sprite
  const craft = new THREE.Group();
  const wedge = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 4), new THREE.MeshBasicMaterial({ color: 0xf4f4f2 }));
  wedge.rotation.x = Math.PI / 2; // cone +Y -> +Z (forward)
  craft.add(wedge);
  const glowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,79,0,0.9)');
    grad.addColorStop(0.4, 'rgba(255,79,0,0.25)');
    grad.addColorStop(1, 'rgba(255,79,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false }));
  glow.scale.setScalar(4.5);
  craft.add(glow);
  scene.add(craft);

  // scan cone + expanding ground ring
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(5.2, 10, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false })
  );
  cone.rotation.x = Math.PI;
  cone.visible = false;
  scene.add(cone);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(4.6, 5.0, 40),
    new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  scene.add(ring);

  /* ---------- finding markers ---------- */
  const markers = FINDINGS.map((f) => {
    const p = tilePos[f.tile];
    const lineGeo = new THREE.BufferGeometry().setFromPoints([p.clone(), p.clone().setY(p.y + 7)]);
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

  /* ---------- camera rig + drag orbit ---------- */
  let azimuth = 0, dragging = false, lastX = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; });
  addEventListener('pointermove', (e) => {
    if (!dragging) return;
    azimuth = Math.max(-0.6, Math.min(0.6, azimuth + (e.clientX - lastX) * 0.004));
    lastX = e.clientX;
  });
  addEventListener('pointerup', () => { dragging = false; });

  const camTarget = new THREE.Vector3(-4, 4, 0);
  function placeCamera(t: number) {
    let r: number, h: number, baseAz: number;
    if (t < 0.3) { const a = t / 0.3; r = 66 - a * 20; h = 30 - a * 8; baseAz = -0.9 + a * 0.5; }
    else if (t < 0.62) { const a = (t - 0.3) / 0.32; r = 46 - a * 6; h = 22 - a * 2; baseAz = -0.4 + a * 0.25; }
    else if (t < 0.85) { const a = (t - 0.62) / 0.23; r = 40 - a * 13; h = 20 - a * 7; baseAz = -0.15 + a * 0.2; }
    else { const a = (t - 0.85) / 0.15; r = 27 + a * 27; h = 13 + a * 16; baseAz = 0.05 + a * 0.25; }
    const az = baseAz + azimuth;
    camera.position.set(camTarget.x + r * Math.sin(az), h, camTarget.z + r * Math.cos(az));
    camera.lookAt(camTarget);
  }

  /* ---------- timeline ---------- */
  let progress = 0, currentPhase = -1;
  let phaseCb: (p: number) => void = () => {};
  const tmpColor = new THREE.Color();
  const tangent = new THREE.Vector3();

  function update() {
    const t = progress;
    const phase = t < 0.3 ? 0 : t < 0.62 ? 1 : t < 0.85 ? 2 : 3;
    if (phase !== currentPhase) { currentPhase = phase; phaseCb(phase); }

    const pu = Math.min(1, t / 0.62);
    pathGeo.setDrawRange(0, Math.floor(221 * pu));
    const u = Math.max(0.001, Math.min(0.999, pu));
    const cp = curve.getPointAt(u);
    craft.position.copy(cp);
    curve.getTangentAt(u, tangent);
    craft.lookAt(cp.clone().add(tangent));

    const scanning = t >= 0.3 && t < 0.66;
    cone.visible = scanning;
    ring.visible = scanning;
    if (scanning) {
      cone.position.set(cp.x, cp.y - 5, cp.z);
      ring.position.set(cp.x, 7.12, cp.z);
      const pulse = 0.8 + 0.4 * Math.sin(performance.now() / 240);
      ring.scale.setScalar(pulse);
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.5 - 0.25 * pulse * 0.5;
      for (let i = 0; i < tilePos.length; i++) {
        const d = Math.hypot(tilePos[i].x - cp.x, tilePos[i].z - cp.z);
        if (d < 5.2) exposure[i] = Math.min(1, exposure[i] + 0.08);
      }
    }
    for (const f of FINDINGS) {
      const flareT = t < 0.62 ? 0 : Math.min(1, (t - 0.62) / 0.1);
      exposure[f.tile] = Math.max(exposure[f.tile], Math.min(1, exposure[f.tile] + flareT * f.boost));
    }
    for (let i = 0; i < tilePos.length; i++) {
      const isFinding = FINDINGS.some((f) => f.tile === i);
      const e = exposure[i];
      if (e <= 0) continue;
      const heat = isFinding && t >= 0.62 ? Math.min(1, 0.55 + e * 0.45) : e * 0.45;
      ironColor(heat, tmpColor);
      tiles.setColorAt(i, tmpColor);
    }
    tiles.instanceColor!.needsUpdate = true;

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
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let raf = 0, running = true;
  const loop = () => { if (running) update(); raf = requestAnimationFrame(loop); };
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
