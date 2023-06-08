import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAPreset,
  SMAAEffect,
  ChromaticAberrationEffect,
  HueSaturationEffect,
} from 'postprocessing';

/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader();
const loader = new GLTFLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
dracoLoader.setDecoderConfig({type: 'js'});
loader.setDRACOLoader(dracoLoader);

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement('div');
document.body.appendChild(container);
container.classList.add('threejs');

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

/////////////////////////////////////////////////////////////////////////
///// RENDERER CREATION
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
}); // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight); // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding; // set color encoding
renderer.toneMapping = THREE.LinearToneMapping; // set the toneMapping
container.appendChild(renderer.domElement); // append the renderer to container div element

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
scene.add(camera);
camera.position.set(0, 3, 9);

/////////////////////////////////////////////////////////////////////////
///// ADD A GROUP AND PUT THE CAMERA INSIDE OF IT
const cameraGroup = new THREE.Group();
cameraGroup.add(camera);

/////////////////////////////////////////////////////////////////////////
///// CREATING LIGHT
const light = new THREE.PointLight(0xffff00, 1, 100);
light.position.set(-3, 0, 8);
scene.add(light);

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.2, 0);
controls.autoRotate = true;
controls.enableDamping = true;

/////////////////////////////////////////////////////////////////////////
///// LOADING THE TEXTURE FOR THE ENVIRONMENT
new RGBELoader().load('../assets/envmap.hdr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
loader.load('https://03fltx.csb.app/assets/model/cyberpunk_model.glb', function (gltf) {
  scene.add(gltf.scene);
});

/////////////////////////////////////////////////////////////////////////
//// POST PROCESSING
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new BloomEffect({intensity: 1.9, mipmapBlur: true, luminanceThreshold: 0.1, radius: 1.1});
const bloom2 = new BloomEffect({intensity: 3.2, mipmapBlur: true, luminanceThreshold: 0.1, radius: 0.5});
const bloom3 = new BloomEffect({intensity: 1.2, mipmapBlur: true, luminanceThreshold: 0.1, radius: 0.5});

const smaaAliasEffect = new SMAAEffect({preset: SMAAPreset.ULTRA});

const chromaticAberration = new ChromaticAberrationEffect({
  offset: new THREE.Vector2(0.002, 0.02),
  radialModulation: true,
  modulationOffset: 0.7,
});

const hueSaturationEffect = new HueSaturationEffect({
  hue: -0.1,
  saturation: 0.25,
});

composer.addPass(new EffectPass(camera, bloom, bloom2, bloom3, smaaAliasEffect));
composer.addPass(new EffectPass(camera, chromaticAberration, hueSaturationEffect));

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION
const cursor = new THREE.Vector3(); // creates a new vector to store the mouse position
const lerpedPosition = new THREE.Vector3(); //creates another vector to store the inertia mouse position

function rendeLoop() {
  lerpedPosition.lerp(cursor, 0.01); //uses lerp function to create inertia movement
  controls.update(); // update orbit controls
  composer.render(); //render the scene with Post Processing Effects
  cameraGroup.position.y = lerpedPosition.y * 8; // moves the camera group using the lerped position
  light.position.x = -lerpedPosition.x * 50; //moves the horizontal light position using the lerped position
  light.position.y = lerpedPosition.y * 60; //moves the vertical light position using the lerped position
  //renderer.render(scene, camera); //render the scene without the composer
  requestAnimationFrame(rendeLoop); //loop the render function
}

rendeLoop(); //start rendering

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//////////////////////////////////////////////////
//// ON MOUSE MOVE TO GET MOUSE POSITION
document.addEventListener(
  'mousemove',
  (event) => {
    event.preventDefault();
    cursor.x = event.clientX / window.innerWidth - 0.5;
    cursor.y = event.clientY / window.innerHeight - 0.5;
  },
  false,
);
