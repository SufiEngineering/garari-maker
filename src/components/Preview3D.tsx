// ============================================================================
// Preview3D — Three.js extruded sprocket with orbit controls
// ============================================================================

import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SprocketParams, CalculatedDimensions } from "../types/sprocket";
import { buildSprocketGeometry } from "../engine/sprocketMesh";
import { useSettings } from "../i18n/SettingsContext";

// ---------------------------------------------------------------------------
// Material colours
// ---------------------------------------------------------------------------
const MATERIAL_COLORS: Record<string, number> = {
  mild_steel: 0xb0b0b0,
  ss_304: 0xc8c8c8,
  ss_316: 0xd0d0d0,
  aluminum_6061: 0xd8dce2,
  aluminum_7075: 0xccd0d6,
  cast_iron: 0x707070,
  brass: 0xc8a832,
  nylon: 0xf0eed8,
  hardox: 0x606468,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Preview3DProps {
  params: SprocketParams;
  dims: CalculatedDimensions | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function Preview3D({ params, dims }: Preview3DProps) {
  const { theme } = useSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number>(0);

  // Build Three.js geometry from sprocket profile (shared with STL export)
  const geometry = useMemo(() => {
    if (!dims) return null;
    return buildSprocketGeometry(params);
  }, [params, dims]);

  // ---------------------------------------------------------------------------
  // Set up renderer, scene, camera, controls (once)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0f0808, 1); // theme effect below sets the real colour
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    camera.position.set(0, 0, 150);
    cameraRef.current = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 10;
    controls.maxDistance = 2000;
    controlsRef.current = controls;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const dir1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dir1.position.set(50, 80, 100);
    dir1.castShadow = true;
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0xff4444, 0.3);
    dir2.position.set(-40, -60, 50);
    scene.add(dir2);

    // Animate
    function animate() {
      frameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);
    onResize();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Keep clear colour in sync with the active theme
  useEffect(() => {
    rendererRef.current?.setClearColor(
      theme === "light" ? 0xf4f1ee : 0x0f0808,
      1
    );
  }, [theme]);

  // ---------------------------------------------------------------------------
  // Update mesh when geometry or material changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera) return;

    // Remove old mesh
    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
      meshRef.current = null;
    }

    if (!geometry) return;

    const color = MATERIAL_COLORS[params.materialKey] ?? 0xb0b0b0;
    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: params.materialKey === "nylon" ? 0.0 : 0.7,
      roughness: params.materialKey === "nylon" ? 0.8 : 0.35,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    // Fit camera
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim / (2 * Math.tan((Math.PI * camera.fov) / 360));
    camera.position.set(0, 0, dist * 1.4);
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [geometry, params.materialKey]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: 200 }}
    />
  );
}
