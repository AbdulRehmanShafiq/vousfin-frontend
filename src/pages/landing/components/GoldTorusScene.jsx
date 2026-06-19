import { useRef, useEffect } from 'react';
import * as THREE from 'three';

// A premium floating gold artifact behind the hero: a metallic torus-knot with a
// wireframe shell and a halo of drifting gold motes. Reacts to mouse + scroll.
// WebGL-guarded, DPR-capped, paused when hidden, fully disposed on unmount.
export default function GoldTorusScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    try {
      const test = document.createElement('canvas');
      if (!window.WebGLRenderingContext || (!test.getContext('webgl') && !test.getContext('experimental-webgl'))) return;
    } catch { return; }

    const SIZE = 460;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 38;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(SIZE, SIZE);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Core metallic knot
    const geometry = new THREE.TorusKnotGeometry(9, 2.6, 180, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xC8A96E, metalness: 1, roughness: 0.18,
      emissive: 0x4a3416, emissiveIntensity: 0.35,
    });
    const knot = new THREE.Mesh(geometry, material);
    group.add(knot);

    // Wireframe shell for sparkle
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0xE7D4A8, transparent: true, opacity: 0.12 })
    );
    wire.scale.setScalar(1.04);
    group.add(wire);

    // Halo of drifting gold motes
    const COUNT = 140;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 16 + Math.random() * 14;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
      positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      positions[i * 3 + 2] = r * Math.cos(ph);
    }
    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const ptsMat = new THREE.PointsMaterial({ color: 0xD4B87A, size: 0.5, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
    const motes = new THREE.Points(ptsGeo, ptsMat);
    scene.add(motes);

    // Lighting — warm key, gold rim, cool fill
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.PointLight(0xffe9c0, 2.2); key.position.set(25, 25, 25); scene.add(key);
    const rim = new THREE.PointLight(0xC8A96E, 2.4); rim.position.set(-28, -18, 18); scene.add(rim);
    const fill = new THREE.PointLight(0x7EB5A6, 0.7); fill.position.set(0, -25, -10); scene.add(fill);

    let mx = 0, my = 0, scrollT = 0, raf, t = 0, running = true;
    const onMove = (e) => { mx = (e.clientX / window.innerWidth - 0.5); my = (e.clientY / window.innerHeight - 0.5); };
    const onScroll = () => { scrollT = window.scrollY * 0.0012; };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const animate = () => {
      if (!running) return;
      raf = requestAnimationFrame(animate);
      t += 0.004;
      group.rotation.y += 0.006;
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, my * 0.6 + scrollT, 0.05);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, mx * 0.4, 0.05);
      group.position.y = Math.sin(t) * 1.2;
      motes.rotation.y -= 0.0016;
      motes.rotation.x += 0.0008;
      renderer.render(scene, camera);
    };
    animate();

    const onVis = () => { running = !document.hidden; if (running) animate(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      geometry.dispose(); material.dispose(); wire.geometry.dispose(); wire.material.dispose();
      ptsGeo.dispose(); ptsMat.dispose(); renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute -right-10 -top-16 z-0 h-[460px] w-[460px] max-w-full opacity-70 sm:-right-20 lg:-right-24"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
