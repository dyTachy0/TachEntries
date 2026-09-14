import * as THREE from 'three';
import { OrbitControls } from './libs/controls/OrbitControls.js';
import { MMDLoader } from './libs/loaders/MMDLoader.js';
import { MMDAnimationHelper } from './libs/animation/MMDAnimationHelper.js';

const container = document.getElementById('tachyon-canvas-container');
const btnAudio = document.getElementById('btn-audio-toggle');

// 1. Escena y cámara ajustadas al tamaño del contenedor
const width = container.clientWidth;
const height = container.clientHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
camera.position.set(0, 6, 17);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 4, 0);
controls.enablePan = false;
controls.minDistance = 8;
controls.maxDistance = 22;
controls.update();

// Luces
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const dirLight = new THREE.DirectionalLight(0xffe6d0, 1.2);
dirLight.position.set(4, 10, 6);
scene.add(dirLight);

// 2. Audio & Reactividad (Web Audio API)
let audioCtx, analyser, source;
let freqData;
const audio = new Audio('./audio/lab_theme.mp3');
audio.loop = true;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  freqData = new Uint8Array(analyser.frequencyBinCount);

  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

// 3. Carga del modelo PMX y baile VMD
let mmdMesh, helper;
const clock = new THREE.Clock();

// Ammo.js cargado desde CDN global
if (window.Ammo) {
  window.Ammo().then(() => {
    helper = new MMDAnimationHelper();
    const loader = new MMDLoader();

    loader.loadWithAnimation(
      './models/tachyon/chibi.pmx',
      './models/tachyon/dance.vmd',
      (mmd) => {
        mmdMesh = mmd.mesh;
        
        // Evita recuadros negros en texturas con transparencia (pestañas, brillo)
        mmdMesh.material.forEach((mat) => {
          mat.alphaTest = 0.5;
        });

        scene.add(mmdMesh);
        helper.add(mmdMesh, { animation: mmd.animation, physics: false });
      },
      undefined,
      (err) => console.error('Error cargando MMD:', err)
    );
  });
}

// 4. Pausar cuando no esté visible en pantalla (ahorro de recursos para el blog)
let isVisible = true;
const observer = new IntersectionObserver(([entry]) => {
  isVisible = entry.isIntersecting;
}, { threshold: 0.1 });
observer.observe(container);

// 5. Bucle de animación
function render() {
  requestAnimationFrame(render);
  if (!isVisible) return;

  const delta = clock.getDelta();

  let bass = 0;
  if (analyser && !audio.paused) {
    analyser.getByteFrequencyData(freqData);
    // Promedio de frecuencias bajas
    bass = (freqData[1] + freqData[2] + freqData[3]) / (3 * 255);
  }

  if (mmdMesh) {
    // Rebote sutil al ritmo de los bajos
    const targetY = 1 + bass * 0.12;
    const targetXZ = 1 - bass * 0.04;
    mmdMesh.scale.set(targetXZ, targetY, targetXZ);
  }

  if (helper) helper.update(delta);
  controls.update();
  renderer.render(scene, camera);
}
render();

// Control de audio
btnAudio.addEventListener('click', () => {
  initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  if (audio.paused) {
    audio.play();
    btnAudio.innerText = '⏸ PAUSE';
  } else {
    audio.pause();
    btnAudio.innerText = '▶ SOUND';
  }
});

// Resize responsivo
window.addEventListener('resize', () => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});