import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import WebGL from "three/addons/capabilities/WebGL.js";

const gold = 0xeed28d;
const white = 0xffffff;

if (!WebGL.isWebGLAvailable()) {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById("container").appendChild(warning);
  process.exit();
}

/* const hudElement = document.createElement("div");
hudElement.style.position = "absolute";
hudElement.style.top = "0";
hudElement.style.left = "0";
hudElement.style.border = "1px solid gray";
hudElement.style.borderRadius = "5px";
hudElement.style.padding = "10px";

hudElement.textContent = "Hello world";

document.body.appendChild(hudElement); */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);
// scene.fog = new THREE.FogExp2(0xcccccc, 0.15);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

const cubes = [];

for (let i = 0; i < 4; i++) {
  const geometry = new THREE.BoxGeometry(1.5, 1.2, 1.5);
  const fileName = Math.abs(4 - i);
  const textureMaterials = [
    new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(`a/${fileName}.jpg`),
      color: 0xffffff,
    }),
    new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(`b/${fileName}.jpg`),
      color: 0xffffff,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
    }),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
    }),
    new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(`c/${fileName}.jpg`),
      color: 0xffffff,
    }),
    new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(`d/${fileName}.jpg`),
      color: 0xffffff,
    }),
  ];
  const cube = new THREE.Mesh(geometry, textureMaterials);
  cube.castShadow = true;
  cube.receiveShadow = true;
  cube.position.x = 0;
  cube.position.y = (i - 1.8) * 1.3;
  cube.position.z = 0;
  scene.add(cube);
  cubes.push(cube);
}

let selectedCubeIndex = 0;

colorCube(cubes[selectedCubeIndex], gold);

// point light pointing from the camera to the scene
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(0, 0, 4);
pointLight.castShadow = true;

pointLight.shadow.mapSize.width = 512;
pointLight.shadow.mapSize.height = 512;
pointLight.shadow.camera.near = 0.5;
pointLight.shadow.camera.far = 500;
scene.add(pointLight);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove(event) {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
  }
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  /* hudElement.style.top = `${event.clientY}px`;
  hudElement.style.left = `${event.clientX + 20}px`; */
}

function animate() {
  pointLight.position.set(
    camera.position.x,
    camera.position.y,
    camera.position.z
  );
  requestAnimationFrame(animate);
  TWEEN.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("pointermove", onPointerMove);

window.addEventListener("click", (event) => {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    const intersect = intersects[0];
    for (let i = 0; i < cubes.length; i++) {
      if (cubes[i] === intersect.object) {
        colorCube(cubes[selectedCubeIndex], white);
        selectedCubeIndex = i;
        colorCube(cubes[selectedCubeIndex], gold);
      }
    }
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    colorCube(cubes[selectedCubeIndex], white);
    selectedCubeIndex = (selectedCubeIndex + 1) % cubes.length;
    colorCube(cubes[selectedCubeIndex], gold);
  } else if (e.key === "ArrowDown") {
    colorCube(cubes[selectedCubeIndex], white);
    selectedCubeIndex = (selectedCubeIndex - 1) % cubes.length;
    colorCube(cubes[selectedCubeIndex], gold);
  } else if (e.key === "ArrowLeft") {
    const rotationTween = new TWEEN.Tween(cubes[selectedCubeIndex].rotation)
      .to({ y: cubes[selectedCubeIndex].rotation.y - Math.PI / 2 }, 400)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  } else if (e.key === "ArrowRight") {
    const rotationTween = new TWEEN.Tween(cubes[selectedCubeIndex].rotation)
      .to({ y: cubes[selectedCubeIndex].rotation.y + Math.PI / 2 }, 400)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }
});

function colorCube(cube, color) {
  for (let material of cube.material) {
    material.color.set(color);
  }
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.querySelector(".reset-btn").addEventListener("click", () => {
  for (let cube of cubes) {
    const rotationTween = new TWEEN.Tween(cube.rotation)
      .to({ y: 0 }, 400)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();
  }
});
