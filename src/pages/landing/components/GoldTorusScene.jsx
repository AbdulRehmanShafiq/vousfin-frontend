import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function GoldTorusScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // WebGL support check
    try {
      const canvas = document.createElement('canvas');
      if (!window.WebGLRenderingContext || (!canvas.getContext('webgl') && !canvas.getContext('experimental-webgl'))) {
        return; // Fallback to nothing if WebGL is not supported
      }
    } catch (e) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(300, 300);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xC8A96E,
      metalness: 0.9,
      roughness: 0.1,
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(25, 25, 25);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xC8A96E, 2);
    pointLight2.position.set(-25, -25, 25);
    scene.add(pointLight2);

    camera.position.z = 35;

    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      torusKnot.rotation.x += 0.005;
      torusKnot.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (mount && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-[300px] h-[300px] max-w-full opacity-50 absolute -bottom-16 -right-16 pointer-events-none z-0" 
      style={{ mixBlendMode: 'screen' }} 
    />
  );
}
