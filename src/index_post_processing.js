import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {TWEEN} from 'three/addons/libs/tween.module.min.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {RGBELoader} from 'three/addons/loaders/RGBELoader.js';

import {BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset} from 'postprocessing';

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
scene.background = new THREE.Color(0x191919);

/////////////////////////////////////////////////////////////////////////
///// RENDERER CREATION
const renderer = new THREE.WebGLRenderer({
  antialias: false,
  powerPreference: 'high-performance',
}); // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight); // make it full screen
renderer.outputEncoding = THREE.LinearEncoding; // set color encoding
renderer.toneMapping = THREE.LinearToneMapping; // set the toneMapping
renderer.toneMappingExposure = 1.2; // set the exposure
container.appendChild(renderer.domElement); // append the renderer to container div element

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
scene.add(camera);

/////////////////////////////////////////////////////////////////////////
///// CREATING LIGHT
const light = new THREE.PointLight(0xffff00, 1, 100);
light.position.set(-3, 12, 8);
scene.add(light);

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);

/////////////////////////////////////////////////////////////////////////
///// LOADING THE TEXTURE FOR THE ENVIRONMENT
new RGBELoader().load(
  'https://cdn.glitch.global/df35b9e1-0fa8-49d1-b430-bed29251dfb5/gem_2.hdr?v=1675257556766',
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  },
);

/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
loader.load(
  'https://cdn.glitch.global/84b42a01-59de-4a46-a133-517eb21aee3c/threejs_logo.glb?v=1675285403141',
  function (gltf) {
    scene.add(gltf.scene);
  },
);

const composer = new EffectComposer(renderer);
composer.multisampling = 4;
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new EffectPass(camera, new BloomEffect({mipmapBlur: true})));
composer.addPass(new EffectPass(camera, new SMAAEffect({preset: SMAAPreset.HIGH})));

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION
function rendeLoop() {
  TWEEN.update(); // update animations

  controls.update(); // update orbit controls

  composer.render();

  // renderer.render(scene, camera); //render the scene without the composer

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

  composer.setSize(width, height);
});

/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
  new TWEEN.Tween(camera.position.set(4, 2, 25))
    .to(
      {
        x: 4,
        y: 1.8,
        z: 9.5,
      },
      1800,
    )
    .easing(TWEEN.Easing.Cubic.InOut)
    .start();

  new TWEEN.Tween(controls.target)
    .to(
      {
        y: 2,
        z: 0,
      },
      1800,
    )
    .easing(TWEEN.Easing.Cubic.InOut)
    .start();
}
introAnimation(); // call intro animation on start
