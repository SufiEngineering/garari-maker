// ============================================================================
// Preview3D — Three.js extruded sprocket with orbit controls
// ============================================================================

import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { SprocketParams, CalculatedDimensions } from "../types/sprocket";
import { getSprocketProfile } from "../engine/sprocketGeometry";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number>(0);

  // Build Three.js geometry from sprocket profile
  const geometry = useMemo(() => {
    if (!dims) return null;
    const profile = getSprocketProfile(params);
    if (!profile || profile.toothProfile.length < 3) return null;

    // Outer tooth shape
    const shape = new THREE.Shape();
    const pts = profile.toothProfile;
    shape.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      shape.lineTo(pts[i][0], pts[i][1]);
    }
    shape.closePath();

    // Bore hole (always present)
    const boreHole = new THREE.Path();
    const SEGS = 64;
    for (let i = 0; i <= SEGS; i++) {
      const a = (i / SEGS) * Math.PI * 2;
      const x = profile.boreRadius * Math.cos(a);
      const y = profile.boreRadius * Math.sin(a);
      if (i === 0) boreHole.moveTo(x, y);
      else boreHole.lineTo(x, y);
    }
    shape.holes.push(boreHole);

    // Mounting holes
    for (const h of profile.mountingHoles) {
      const holePath = new THREE.Path();
      for (let i = 0; i <= SEGS; i++) {
        const a = (i / SEGS) * Math.PI * 2;
        const x = h.cx + h.r * Math.cos(a);
        const y = h.cy + h.r * Math.sin(a);
        if (i === 0) holePath.moveTo(x, y);
        else holePath.lineTo(x, y);
      }
      shape.holes.push(holePath);
    }

    // Keyway slot
    if (profile.keyway) {
      const k = profile.keyway;
      const kw = new THREE.Path();
      kw.moveTo(-k.halfW, k.innerY);
      kw.lineTo(-k.halfW, k.outerY);
      kw.lineTo(k.halfW, k.outerY);
      kw.lineTo(k.halfW, k.innerY);
      kw.closePath();
      shape.holes.push(kw);
    }

    // Extrude
    const depth = params.plateThickness || 6;
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth,
      bevelEnabled: true,
      bevelThickness: Math.min(0.3, depth * 0.05),
      bevelSize: Math.min(0.3, depth * 0.05),
      bevelSegments: 2,
      curveSegments: 1,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
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
    renderer.setClearColor(0x0f0808, 1);
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
