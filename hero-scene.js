import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const card = document.querySelector(".portrait-card");
const canvas = document.querySelector("#hero-webgl");
if (!card || !canvas || !("WebGLRenderingContext" in window)) {
  // Leave the CSS orbital artwork in place when WebGL is unavailable.
} else {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(card.clientWidth, card.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, card.clientWidth / card.clientHeight, 0.1, 40);
    camera.position.set(0, 0, 6.8);

    scene.add(new THREE.HemisphereLight(0xcad9ff, 0x101320, 2.1));
    const keyLight = new THREE.PointLight(0x9efc68, 25, 12);
    keyLight.position.set(-2.3, 2.2, 3.1);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xb5a0ff, 20, 12);
    rimLight.position.set(2.4, -1.6, 2.2);
    scene.add(rimLight);

    const world = new THREE.Group();
    scene.add(world);

    const core = new THREE.Group();
    world.add(core);
    const gemstone = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.78, 2),
      new THREE.MeshPhysicalMaterial({
        color: 0x7de4b2,
        emissive: 0x123624,
        emissiveIntensity: 0.55,
        metalness: 0.42,
        roughness: 0.24,
        clearcoat: 0.8,
        clearcoatRoughness: 0.18,
        flatShading: true,
      })
    );
    core.add(gemstone);

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.98, 1),
      new THREE.MeshBasicMaterial({
        color: 0xb5a0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.42,
      })
    );
    core.add(wire);

    const orbitGroup = new THREE.Group();
    world.add(orbitGroup);
    const ringMaterialA = new THREE.MeshBasicMaterial({
      color: 0xb5a0ff,
      transparent: true,
      opacity: 0.88,
    });
    const ringMaterialB = new THREE.MeshBasicMaterial({
      color: 0xaefc78,
      transparent: true,
      opacity: 0.8,
    });
    const makeRing = (radius, material, rotation) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.012, 8, 180),
        material
      );
      ring.rotation.set(...rotation);
      orbitGroup.add(ring);
      return ring;
    };
    const orbitA = makeRing(1.42, ringMaterialA, [1.12, 0.12, 0.1]);
    const orbitB = makeRing(1.68, ringMaterialB, [0.92, 0.82, -0.2]);
    const orbitC = makeRing(1.18, ringMaterialA, [1.4, -0.5, 0.6]);
    orbitC.scale.set(1.24, 1, 1);

    const dustPositions = [];
    for (let i = 0; i < 240; i += 1) {
      const theta = Math.acos(2 * ((i * 0.61803398875) % 1) - 1);
      const phi = Math.PI * (1 + Math.sqrt(5)) * i;
      const radius = 1.9 + ((i * 17) % 100) / 100 * 0.48;
      dustPositions.push(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta)
      );
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.Float32BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({
        color: 0xe7e0ff,
        size: 0.018,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
      })
    );
    world.add(dust);

    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      target.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.5;
      target.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.4;
    });
    card.addEventListener("pointerleave", () => {
      target.x = 0;
      target.y = 0;
    });

    const resize = () => {
      const width = card.clientWidth;
      const height = card.clientHeight;
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(card);
    resize();

    card.classList.add("webgl-ready");
    canvas.addEventListener("webglcontextlost", () => {
      card.classList.remove("webgl-ready");
      resizeObserver.disconnect();
      renderer.dispose();
    });

    if (!reducedMotion) {
      const visibility = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      }, { threshold: 0.05 });
      let visible = true;
      visibility.observe(card);
      document.addEventListener("visibilitychange", () => {
        visible = !document.hidden;
      });

      let lastFrame = 0;
      const animate = (time) => {
        requestAnimationFrame(animate);
        if (!visible || time - lastFrame < 1000 / 30) return;
        lastFrame = time;
        pointer.x += (target.x - pointer.x) * 0.045;
        pointer.y += (target.y - pointer.y) * 0.045;
        world.rotation.y += 0.0032;
        world.rotation.x += (pointer.y - world.rotation.x) * 0.025;
        world.rotation.z += pointer.x * 0.004;
        core.rotation.y -= 0.006;
        core.rotation.x += 0.0025;
        orbitA.rotation.z += 0.006;
        orbitB.rotation.y -= 0.004;
        orbitC.rotation.z += 0.008;
        dust.rotation.y -= 0.0008;
        keyLight.position.x = -2.3 + pointer.x * 2;
        rimLight.position.y = -1.6 - pointer.y * 2;
        renderer.render(scene, camera);
      };
      requestAnimationFrame(animate);
    }
  } catch (error) {
    card.classList.remove("webgl-ready");
    console.warn("3D hero unavailable; using the CSS artwork instead.", error);
    renderer?.dispose();
  }
}
