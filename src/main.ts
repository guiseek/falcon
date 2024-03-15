import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { createSky, createWater } from "./scenario";
import { Control } from "./utilities";
import { F16Falcon } from "./entities";
import {
  Clock,
  Scene,
  Vector3,
  AmbientLight,
  WebGLRenderer,
  DirectionalLight,
  PerspectiveCamera,
  PMREMGenerator,
} from "three";
import "./style.scss";

const scene = new Scene();
const clock = new Clock();
const stats = new Stats();

const camera = new PerspectiveCamera(45, devicePixelRatio, 1, 10000000);

const cameraSpeed = 0.05;

const relativeCameraOffset = new Vector3(-60, 3, 0);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setClearColor(0x121214, 1);
renderer.setSize(innerWidth, innerHeight);
container.append(renderer.domElement, stats.dom);

const water = createWater(!!scene.fog);
scene.add(water);

const pmremGenerator = new PMREMGenerator(renderer);
const sceneEnv = new Scene();

const renderTarget = pmremGenerator.fromScene(sceneEnv);

const sky = createSky(water, renderTarget);

sceneEnv.add(sky);

scene.environment = renderTarget.texture;

scene.add(sceneEnv);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 60;
controls.update(0);

const directional = new DirectionalLight(0xffffff, 0.6);
const ambient = new AmbientLight(0x404040);
directional.position.set(0, 6, 0);
const control = new Control();
control.initialize();

let falconCamera: Vector3;

const falcon = new F16Falcon(control);
falcon.rotation.set(0, Math.PI / 2, 0);
falconCamera = relativeCameraOffset.applyMatrix4(falcon.matrixWorld);
scene.add(falcon);

scene.add(camera, directional, ambient);

/**
 * Game loop
 */
const animate = () => {
  control.update();
  requestAnimationFrame(animate);
  if (control.key.Space) return;

  const delta = clock.getDelta();

  water.material.uniforms["time"].value += 1.0 / 60.0;

  falcon.update(delta);

  camera.position.lerp(falconCamera, cameraSpeed);
  controls.target = falcon.position.clone();

  controls.update();
  stats.update();

  renderer.render(scene, camera);
};
animate();

const resize = () => {
  camera.aspect = devicePixelRatio;
  renderer.setSize(innerWidth, innerHeight);
  camera.updateProjectionMatrix();
};
resize();
onresize = resize;
