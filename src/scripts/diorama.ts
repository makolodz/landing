import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const INK = 0x1b1535;
const YELLOW = 0xffd43b;
const BLUE = 0x4dabf7;
const GREEN = 0x69db7c;
const PINK = 0xff6b6b;
const VIOLET = 0x6741d9;
const WHITE = 0xf4f1ff;

export interface DeviceInfo {
  key: string;
  label: string;
  title: string;
  text: string;
}

function std(color: number, roughness = 0.55) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 });
}

function outlined<T extends THREE.Mesh>(mesh: T, thickness = 0.04): T {
  const outline = new THREE.Mesh(
    mesh.geometry,
    new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }),
  );
  outline.scale.setScalar(1 + thickness);
  outline.userData.isOutline = true;
  mesh.add(outline);
  return mesh;
}

function box(w: number, h: number, d: number, color: number, r = 0.08) {
  return outlined(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), std(color)));
}

export function initDiorama(
  host: HTMLElement,
  infos: DeviceInfo[],
  onSelect: (info: DeviceInfo | null) => void,
): { select: (key: string | null) => void; dispose: () => void } {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const infoByKey = new Map(infos.map((i) => [i.key, i]));

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute(
    'aria-label',
    "Diorama 3D de l'atelier : imprimante 3D, découpeuse laser, prises, bouton, capteur d'air et Raspberry Pi reliés en Zigbee",
  );
  host.appendChild(renderer.domElement);

  const labels = new CSS2DRenderer();
  labels.domElement.className = 'dio-labels';
  host.appendChild(labels.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 7.5, 12.5);

  scene.add(new THREE.AmbientLight(0xffffff, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(5, 9, 6);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xc9b8ff, 1.0);
  fill.position.set(-6, 4, -4);
  scene.add(fill);

  // sol
  const floor = box(11.5, 0.4, 7.6, 0xfff1d6, 0.18);
  floor.position.y = -0.2;
  scene.add(floor);

  const groups = new Map<string, THREE.Group[]>();
  const hl: THREE.MeshStandardMaterial[] = [];

  function register(key: string, g: THREE.Group, labelText: string, labelY: number, showLabel = true) {
    g.userData.key = key;
    scene.add(g);
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(g);
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && !m.userData.isOutline && m.material instanceof THREE.MeshStandardMaterial) {
        m.material = m.material.clone();
        m.userData.baseEmissive = 0;
        hl.push(m.material as THREE.MeshStandardMaterial);
        (m.material as THREE.MeshStandardMaterial).userData.group = key;
      }
    });
    if (showLabel) {
      const div = document.createElement('div');
      div.className = 'dio-tag';
      div.textContent = labelText;
      const tag = new CSS2DObject(div);
      tag.position.set(0, labelY, 0);
      g.add(tag);
    }
  }

  // ----- imprimante 3D -----
  const printer = new THREE.Group();
  const pBase = box(2.1, 0.3, 2.0, 0x9aa0b4);
  pBase.position.y = 0.15;
  printer.add(pBase);
  for (const x of [-0.95, 0.95]) {
    const post = box(0.16, 2.0, 0.16, 0x6b6785, 0.04);
    post.position.set(x, 1.2, -0.8);
    printer.add(post);
  }
  const topBar = box(2.1, 0.16, 0.3, 0x6b6785, 0.04);
  topBar.position.set(0, 2.1, -0.8);
  printer.add(topBar);
  const bed = box(1.5, 0.08, 1.3, BLUE, 0.03);
  bed.position.set(0, 0.36, 0.1);
  printer.add(bed);
  const carriage = new THREE.Group();
  const car = box(0.4, 0.28, 0.4, YELLOW, 0.05);
  const nozzle = outlined(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 16), std(INK)), 0.1);
  nozzle.rotation.x = Math.PI;
  nozzle.position.y = -0.25;
  carriage.add(car, nozzle);
  carriage.position.set(0, 1.2, 0.1);
  printer.add(carriage);
  const part = outlined(new THREE.Mesh(new RoundedBoxGeometry(0.5, 1, 0.5, 3, 0.06), std(PINK)));
  part.position.set(0, 0.4, 0.1);
  printer.add(part);
  printer.position.set(-3.1, 0, 0.2);
  register('printer', printer, 'Imprimante 3D', 2.7);

  // ----- prise de l'imprimante -----
  const makePlug = () => {
    const g = new THREE.Group();
    const body = box(0.6, 0.7, 0.34, WHITE, 0.1);
    body.position.y = 0.35;
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshBasicMaterial({ color: BLUE }));
    led.position.set(0, 0.5, 0.2);
    g.add(body, led);
    g.userData.led = led;
    return g;
  };
  const plug1 = makePlug();
  plug1.position.set(-3.1, 0, 2.5);
  register('plug', plug1, 'Prise Zigbee', 1.1);
  const plug2 = makePlug();
  plug2.position.set(2.7, 0, 2.7);
  register('plug', plug2, 'Prise Zigbee', 1.1, false);

  // ----- capteur de présence (radar) -----
  const presence = new THREE.Group();
  const presBase = outlined(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.14, 24), std(INK)), 0.05);
  presBase.position.y = 0.07;
  const presPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 12), std(INK));
  presPole.position.y = 0.39;
  const presBody = box(0.55, 0.5, 0.3, WHITE, 0.1);
  presBody.position.y = 0.85;
  const presEye = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), new THREE.MeshBasicMaterial({ color: GREEN }));
  presEye.position.set(0, 0.88, 0.16);
  presence.add(presBase, presPole, presBody, presEye);
  const radarRings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.0, 48),
      new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    ring.userData.offset = i / 3;
    presence.add(ring);
    radarRings.push(ring);
  }
  presence.position.set(-1.4, 0, 2.3);
  register('presence', presence, 'Capteur de présence', 1.4);

  // ----- découpeuse laser -----
  const laser = new THREE.Group();
  const lBody = box(2.7, 0.9, 1.9, 0x6b6785);
  lBody.position.y = 0.45;
  laser.add(lBody);
  const lidMat = std(BLUE, 0.2);
  lidMat.transparent = true;
  lidMat.opacity = 0.55;
  const lid = new THREE.Mesh(new RoundedBoxGeometry(2.5, 0.55, 1.7, 3, 0.08), lidMat);
  lid.position.set(0, 1.18, 0);
  laser.add(lid);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8),
    new THREE.MeshBasicMaterial({ color: PINK }),
  );
  beam.position.set(0, 0.98, 0);
  laser.add(beam);
  laser.position.set(2.4, 0, 0.1);
  register('laser', laser, 'Découpeuse laser', 2.0);

  // ----- capteur d'air -----
  const air = new THREE.Group();
  const aBody = box(0.55, 1.0, 0.4, WHITE, 0.1);
  aBody.position.y = 0.5;
  const aStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.08), new THREE.MeshBasicMaterial({ color: PINK }));
  aStrip.position.set(0, 0.72, 0.205);
  air.add(aBody, aStrip);
  air.position.set(0.45, 0, 2.5);
  register('air', air, "Capteur d'air", 1.55);

  // ----- Raspberry Pi + clé Zigbee -----
  const hub = new THREE.Group();
  const table = box(2.4, 0.3, 1.5, 0xd8ccb6, 0.08);
  table.position.y = 0.15;
  const pi = box(1.5, 0.12, 0.95, 0x2f9e44, 0.04);
  pi.position.y = 0.36;
  const chip = box(0.4, 0.1, 0.4, 0x9aa0b4, 0.03);
  chip.position.set(-0.15, 0.47, 0);
  const dongle = box(0.2, 0.1, 0.62, YELLOW, 0.04);
  dongle.position.set(0.95, 0.4, 0.1);
  const antenna = outlined(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8), std(INK)), 0.2);
  antenna.position.set(1.0, 0.75, 0.38);
  hub.add(table, pi, chip, dongle, antenna);
  hub.position.set(-0.2, 0, -2.5);
  register('hub', hub, 'Raspberry Pi + clé Zigbee', 1.3);

  // ----- liaisons Zigbee et impulsions -----
  const hubTop = new THREE.Vector3(0.55, 0.9, -2.5);
  const targets: THREE.Vector3[] = [
    new THREE.Vector3(-3.1, 2.3, 0.2),
    new THREE.Vector3(-3.1, 0.9, 2.5),
    new THREE.Vector3(-1.4, 0.6, 2.3),
    new THREE.Vector3(2.4, 1.6, 0.1),
    new THREE.Vector3(2.7, 0.9, 2.7),
    new THREE.Vector3(0.45, 1.1, 2.5),
  ];
  const curves = targets.map((t) => {
    const mid = hubTop.clone().lerp(t, 0.5);
    mid.y += 1.6;
    return new THREE.QuadraticBezierCurve3(t, mid, hubTop);
  });
  curves.forEach((c) => {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(c.getPoints(40)),
      new THREE.LineDashedMaterial({ color: VIOLET, dashSize: 0.18, gapSize: 0.12 }),
    );
    line.computeLineDistances();
    scene.add(line);
  });
  const pulseGeo = new THREE.SphereGeometry(0.1, 12, 12);
  const pulseMat = new THREE.MeshBasicMaterial({ color: YELLOW });
  const pulses = curves.map((_, i) => {
    const m = new THREE.Mesh(pulseGeo, pulseMat);
    m.userData.offset = i / curves.length;
    m.add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide })));
    scene.add(m);
    return m;
  });

  // ----- particules près de la laser -----
  const N = 70;
  const pos = new Float32Array(N * 3);
  const seeds = Array.from({ length: N }, () => ({
    x: (Math.random() - 0.5) * 2.0,
    z: (Math.random() - 0.5) * 1.4,
    p: Math.random(),
    s: 0.12 + Math.random() * 0.12,
  }));
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const smoke = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0x6b6785, size: 0.09, transparent: true, opacity: 0.7 }),
  );
  scene.add(smoke);

  // ----- contrôles -----
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.9, 0.2);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.5;
  controls.minPolarAngle = 0.75;
  controls.maxPolarAngle = 1.3;
  controls.minAzimuthAngle = -0.9;
  controls.maxAzimuthAngle = 0.9;
  // le défilement vertical de la page reste possible au doigt
  renderer.domElement.style.touchAction = 'pan-y';

  // ----- sélection / survol -----
  let selected: string | null = null;
  let hovered: string | null = null;

  function applyHighlight() {
    const active = hovered ?? selected;
    hl.forEach((m) => {
      const on = m.userData.group === active;
      m.emissive.setHex(on ? 0xffd43b : 0x000000);
      m.emissiveIntensity = on ? 0.45 : 0;
    });
  }

  function select(key: string | null) {
    selected = key;
    applyHighlight();
    onSelect(key ? (infoByKey.get(key) ?? null) : null);
  }

  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const all = [...groups.values()].flat();

  function pick(e: PointerEvent): string | null {
    const r = renderer.domElement.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(all, true)[0];
    if (!hit) return null;
    let o: THREE.Object3D | null = hit.object;
    while (o && !o.userData.key) o = o.parent;
    return o ? (o.userData.key as string) : null;
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const k = pick(e);
    if (k !== hovered) {
      hovered = k;
      renderer.domElement.style.cursor = k ? 'pointer' : 'grab';
      applyHighlight();
    }
  };
  const onLeave = () => {
    hovered = null;
    applyHighlight();
  };
  let downAt = { x: 0, y: 0 };
  const onDown = (e: PointerEvent) => (downAt = { x: e.clientX, y: e.clientY });
  const onUp = (e: PointerEvent) => {
    if (Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6) return; // c'était un glisser
    const k = pick(e);
    select(k === selected ? null : k);
  };
  renderer.domElement.addEventListener('pointermove', onMove);
  renderer.domElement.addEventListener('pointerleave', onLeave);
  renderer.domElement.addEventListener('pointerdown', onDown);
  renderer.domElement.addEventListener('pointerup', onUp);
  renderer.domElement.style.cursor = 'grab';
  controls.addEventListener('start', () => (controls.autoRotate = false));

  // ----- taille -----
  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    labels.setSize(w, h);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 55 : 36;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // ----- boucle -----
  const clock = new THREE.Clock();
  let raf = 0;
  let visible = true;

  function frame() {
    const t = clock.getElapsedTime();
    const k = reduced ? 0.3 : t;

    carriage.position.x = Math.sin(k * 1.4) * 0.45;
    carriage.position.z = 0.1 + Math.cos(k * 0.9) * 0.3;
    const growth = (k * 0.12) % 1;
    part.scale.y = 0.15 + growth * 0.85;
    part.position.y = 0.4 + (part.scale.y - 1) * 0.5;

    radarRings.forEach((r) => {
      const u = (k * 0.35 + (r.userData.offset as number)) % 1;
      r.scale.setScalar(0.4 + u * 2.4);
      (r.material as THREE.MeshBasicMaterial).opacity = (1 - u) * 0.6;
    });
    presEye.scale.setScalar(1 + Math.sin(k * 3) * 0.12);

    beam.visible = Math.sin(k * 14) > -0.4;
    beam.position.x = Math.sin(k * 1.4) * 0.8;

    const blink = Math.sin(k * 5) > 0 ? 1 : 0.3;
    [plug1, plug2].forEach((p) => ((p.userData.led as THREE.Mesh).scale.setScalar(blink)));

    pulses.forEach((m, i) => {
      const u = (k * 0.22 + (m.userData.offset as number)) % 1;
      m.position.copy(curves[i].getPoint(u));
    });

    const arr = pGeo.attributes.position.array as Float32Array;
    seeds.forEach((s, i) => {
      const p = (s.p + k * s.s * 0.3) % 1;
      arr[i * 3] = 2.4 + s.x + Math.sin(k + i) * 0.1 + p * 0.5;
      arr[i * 3 + 1] = 0.9 + p * 2.3;
      arr[i * 3 + 2] = 0.1 + s.z;
    });
    pGeo.attributes.position.needsUpdate = true;

    controls.update();
    renderer.render(scene, camera);
    labels.render(scene, camera);
    if (!reduced && visible) raf = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) frame();
  });
  io.observe(host);
  controls.addEventListener('change', () => reduced && frame());
  frame();

  return {
    select,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      renderer.dispose();
    },
  };
}
