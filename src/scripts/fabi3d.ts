import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const INK = 0x1b1535;
const YELLOW = 0xffd43b;
const BLUE = 0x4dabf7;
const GREEN = 0x69db7c;
const PINK = 0xff6b6b;

/** Contour « Pop » : une copie légèrement agrandie, rendue de l'intérieur. */
function outlined<T extends THREE.Mesh>(mesh: T, thickness = 0.05): T {
  const outline = new THREE.Mesh(
    mesh.geometry,
    new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }),
  );
  outline.scale.setScalar(1 + thickness);
  mesh.add(outline);
  return mesh;
}

function std(color: number, roughness = 0.55) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.05 });
}

function chestTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffd43b';
  g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#1b1535';
  g.font = '900 84px system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('F', 64, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function buildFabi() {
  const root = new THREE.Group();

  // corps
  const body = outlined(new THREE.Mesh(new RoundedBoxGeometry(1.4, 1.2, 1.0, 4, 0.3), std(BLUE)));
  body.position.y = 0.5;
  root.add(body);

  const chest = new THREE.Mesh(
    new THREE.CircleGeometry(0.3, 32),
    new THREE.MeshBasicMaterial({ map: chestTexture() }),
  );
  chest.position.set(0, 0.05, 0.515);
  body.add(chest);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.36, 32), new THREE.MeshBasicMaterial({ color: INK }));
  ring.position.set(0, 0.05, 0.514);
  body.add(ring);

  // pieds
  for (const x of [-0.35, 0.35]) {
    const foot = outlined(new THREE.Mesh(new RoundedBoxGeometry(0.45, 0.2, 0.6, 3, 0.08), std(INK)), 0.0);
    foot.position.set(x, -0.2, 0.08);
    root.add(foot);
  }

  // bras gauche
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.55, 6, 12), std(INK));
  armL.position.set(-0.92, 0.35, 0);
  armL.rotation.z = 0.25;
  root.add(armL);

  // bras droit (salue)
  const wave = new THREE.Group();
  wave.position.set(0.8, 0.85, 0);
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.55, 6, 12), std(INK));
  armR.position.set(0.28, 0.0, 0);
  armR.rotation.z = -Math.PI / 2;
  wave.add(armR);
  const hand = outlined(new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), std(YELLOW)), 0.12);
  hand.position.set(0.62, 0, 0);
  wave.add(hand);
  root.add(wave);

  // tête
  const head = new THREE.Group();
  head.position.y = 1.95;
  root.add(head);

  const shell = outlined(new THREE.Mesh(new RoundedBoxGeometry(2.0, 1.5, 1.4, 4, 0.38), std(YELLOW)), 0.04);
  head.add(shell);

  const screen = new THREE.Mesh(new RoundedBoxGeometry(1.55, 1.0, 0.1, 3, 0.14), std(INK, 0.3));
  screen.position.z = 0.67;
  head.add(screen);

  const eyeMat = new THREE.MeshBasicMaterial({ color: GREEN });
  const eyes: THREE.Mesh[] = [];
  for (const x of [-0.36, 0.36]) {
    const eye = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.14, 4, 12), eyeMat);
    eye.position.set(x, 0.12, 0.74);
    head.add(eye);
    eyes.push(eye);
  }

  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 28, Math.PI), eyeMat);
  mouth.rotation.z = Math.PI;
  mouth.position.set(0, -0.08, 0.74);
  head.add(mouth);

  const cheekMat = new THREE.MeshBasicMaterial({ color: PINK });
  for (const x of [-0.62, 0.62]) {
    const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), cheekMat);
    cheek.position.set(x, -0.2, 0.735);
    head.add(cheek);
  }

  // antenne
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.45, 12), std(INK));
  stick.position.y = 0.95;
  head.add(stick);
  const ball = outlined(new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 20), std(PINK, 0.4)), 0.12);
  ball.position.y = 1.3;
  head.add(ball);

  return { root, head, wave, eyes, ball };
}

function buildChips() {
  const chips: THREE.Group[] = [];
  const white = 0xf4f1ff;

  const plug = new THREE.Group();
  plug.add(outlined(new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.6, 0.32, 3, 0.1), std(white))));
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), new THREE.MeshBasicMaterial({ color: BLUE }));
  led.position.set(0, 0.12, 0.17);
  plug.add(led);
  chips.push(plug);

  const presence = new THREE.Group();
  presence.add(outlined(new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.55, 0.32, 3, 0.1), std(white))));
  const eye = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), new THREE.MeshBasicMaterial({ color: GREEN }));
  eye.position.set(0, 0, 0.17);
  presence.add(eye);
  chips.push(presence);

  const air = new THREE.Group();
  air.add(outlined(new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.75, 0.34, 3, 0.1), std(white))));
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.07), new THREE.MeshBasicMaterial({ color: PINK }));
  strip.position.set(0, 0.2, 0.175);
  air.add(strip);
  chips.push(air);

  const dongle = new THREE.Group();
  dongle.add(outlined(new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.7, 0.12, 3, 0.04), std(YELLOW))));
  const tip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, 0.06), std(INK));
  tip.position.y = -0.4;
  dongle.add(tip);
  chips.push(dongle);

  return chips;
}

export function initFabi(canvas: HTMLCanvasElement): () => void {
  const parent = canvas.parentElement!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
  camera.position.set(0, 1.5, 9.5);
  camera.lookAt(0, 1.1, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb9a6ff, 1.4);
  rim.position.set(-5, 2, -3);
  scene.add(rim);

  const fabi = buildFabi();
  scene.add(fabi.root);

  const chips = buildChips();
  chips.forEach((c) => scene.add(c));

  const pointer = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    pointer.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  function resize() {
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(parent);
  resize();

  const clock = new THREE.Clock();
  let raf = 0;
  let visible = true;

  function frame() {
    const t = clock.getElapsedTime();

    fabi.root.position.y = Math.sin(t * 1.6) * 0.08;
    fabi.wave.rotation.z = reduced ? 0.7 : 0.75 + Math.sin(t * 6) * 0.3;
    fabi.head.rotation.y += (pointer.x * 0.55 - fabi.head.rotation.y) * 0.08;
    fabi.head.rotation.x += (pointer.y * 0.3 - fabi.head.rotation.x) * 0.08;
    fabi.root.rotation.y += (pointer.x * 0.25 - fabi.root.rotation.y) * 0.05;
    fabi.ball.scale.setScalar(1 + Math.sin(t * 3) * 0.12);

    const blink = t % 4.2 > 4.05 ? 0.1 : 1;
    fabi.eyes.forEach((e) => (e.scale.y = blink));

    chips.forEach((chip, i) => {
      const a = t * 0.5 + (i / chips.length) * Math.PI * 2;
      chip.position.set(Math.cos(a) * 3.4, 1.4 + Math.sin(a * 2 + i) * 0.35, Math.sin(a) * 1.8);
      chip.rotation.y = t * 0.8 + i;
    });

    renderer.render(scene, camera);
    if (!reduced && visible) raf = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) frame();
  });
  io.observe(parent);

  frame();

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    renderer.dispose();
  };
}
