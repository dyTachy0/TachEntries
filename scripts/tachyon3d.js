import * as THREE from 'three';
import { OrbitControls } from './libs/controls/OrbitControls.js';
import { MMDLoader } from './libs/loaders/MMDLoader.js';
import { MMDAnimationHelper } from './libs/animation/MMDAnimationHelper.js';

const container = document.getElementById('tachyon-canvas-container');

// 1. Escena y cámara ajustadas al tamaño del contenedor
const width  = container.clientWidth  || 260;
const height = container.clientHeight || 260;

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
camera.position.set(0, 6, 17);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 4, 0);
controls.enablePan  = false;
controls.minDistance = 8;
controls.maxDistance = 22;
controls.update();

// 2. Luces
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const dirLight = new THREE.DirectionalLight(0xffe6d0, 1.2);
dirLight.position.set(4, 10, 6);
scene.add(dirLight);

// 3. Carga del modelo PMX (sin animación VMD por ahora)
let helper;
const clock = new THREE.Clock();

function loadModel() {
  helper = new MMDAnimationHelper();
  const loader = new MMDLoader();

  loader.load(
    './models/1032_Agnes Tachyon.pmx',
    (mesh) => {
      // Girar el modelo para que mire a la cámara
      mesh.rotation.y = Math.PI;

      // Evita recuadros negros en texturas con transparencia (pestañas, brillo)
      mesh.material.forEach((mat) => {
        mat.alphaTest = 0.5;
      });

      scene.add(mesh);
      helper.add(mesh, { physics: false });
    },
    (xhr) => {
      if (xhr.total) console.log(`PMX: ${(xhr.loaded / xhr.total * 100).toFixed(0)}%`);
    },
    (err) => console.error('Error cargando modelo PMX:', err)
  );
}

// Ammo.js: puede ser factory (función) o ya estar inicializado (objeto)
if (typeof window.Ammo === 'function') {
  window.Ammo().then(loadModel).catch(() => {
    console.warn('Ammo.js falló al inicializar, cargando modelo sin física');
    loadModel();
  });
} else {
  if (!window.Ammo) console.warn('Ammo.js no detectado, cargando modelo sin física');
  loadModel();
}

// 4. Pausar cuando no esté visible en pantalla (ahorro de recursos para el blog)
let isVisible = true;
const observer = new IntersectionObserver(([entry]) => {
  isVisible = entry.isIntersecting;
}, { threshold: 0.1 });
observer.observe(container);

// 5. Bucle de animación
function animate() {
  requestAnimationFrame(animate);
  if (!isVisible) return;

  const delta = clock.getDelta();
  if (helper) helper.update(delta);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// 6. Resize responsivo
window.addEventListener('resize', () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});