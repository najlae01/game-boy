import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'

/**
 * Spector.js
 */
// var SPECTOR = require('spectorjs')

// var spector = new SPECTOR.Spector()
// spector.displayUI()

/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
  width: 400,
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */

// baked material
const bakedTexture = textureLoader.load('baking.jpg')
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace

const bakedTree = textureLoader.load('textures/tree/baking-small-tree.jpg')
bakedTree.flipY = false
bakedTree.colorSpace = THREE.SRGBColorSpace

const bakedGround = textureLoader.load('textures/grass/baking-ground.jpg')
bakedGround.flipY = false
bakedGround.colorSpace = THREE.SRGBColorSpace

const bakedView = textureLoader.load('textures/view.jpg')
bakedView.flipY = false
bakedView.colorSpace = THREE.SRGBColorSpace

// Create video and play
const textureVid = document.createElement('video')
textureVid.src = `textures/face/happyblink.mp4` // transform gif to mp4
textureVid.loop = true
document.addEventListener('click', () => {
  // Play the video once the user clicks anywhere on the page.
  textureVid.play()
})

// Load video texture
const straightFace = new THREE.VideoTexture(textureVid)
straightFace.format = THREE.RGBAFormat
straightFace.minFilter = THREE.NearestFilter
straightFace.maxFilter = THREE.NearestFilter
straightFace.generateMipmaps = false

// const straightFace = textureLoader.load('happyblink.gif')

// pole Light Material
const faceMaterial = new THREE.MeshBasicMaterial({ map: straightFace })

const groundMaterial = new THREE.MeshBasicMaterial({ map: bakedGround })

const viewMaterial = new THREE.MeshBasicMaterial({ map: bakedView })

// portal Light material
const portalLightMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
    uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) },
  },
  vertexShader: portalVertexShader,
  fragmentShader: portalFragmentShader,
})

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
const bakedTreeMaterial = new THREE.MeshBasicMaterial({ map: bakedTree })
/**
 * Model
 */
let mixer
gltfLoader.load('game-boy.glb', (gltf) => {
  console.log(gltf)
  gltf.scene.scale.set(0.7, 0.7, 0.7)
  gltf.scene.position.y = 0.07
  gltf.scene.position.x = 0.45
  gltf.scene.traverse((child) => {
    child.material = bakedMaterial
  })
  const face = gltf.scene.children.find((child) => child.name === 'face')
  face.material = faceMaterial
  const animations = gltf.animations
  console.log(animations) // Check if animations are present
  // load the animation
  mixer = new THREE.AnimationMixer(gltf.scene)
  mixer.clipAction(gltf.animations[1]).play()
  mixer.clipAction(gltf.animations[4]).play()

  scene.add(gltf.scene)
})

gltfLoader.load('stylized-tree.glb', (gltf) => {
  console.log(gltf.scene.children[0])
  gltf.scene.children[0].material = bakedTreeMaterial
  gltf.scene.children[0].scale.set(1.5, 1.5, 1.5)
  gltf.scene.children[0].rotateY((5 * Math.PI) / 6)
  gltf.scene.children[0].position.y = 6.7
  gltf.scene.children[0].position.z = 0.15
  gltf.scene.children[0].position.x = -1
  scene.add(gltf.scene.children[0])
})

gltfLoader.load('ground.glb', (gltf) => {
  console.log(gltf)
  gltf.scene.rotateY(-Math.PI / 2)
  gltf.scene.position.z = -1.5
  gltf.scene.position.y = -0.4
  gltf.scene.position.x = 46
  gltf.scene.traverse((child) => {
    child.material = groundMaterial
  })
  scene.add(gltf.scene)
})

const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

// const directionalLight = new THREE.DirectionalLight('#00ff00', 0.3)
// directionalLight.position.set(1, 0.25, 0)
// scene.add(directionalLight)
/**testing ends */

/**
 * FireFlies
 */
const fireFliesGeometry = new THREE.BufferGeometry()
const fireFliesCount = 30
const positionArray = new Float32Array(fireFliesCount * 3)
const scaleArray = new Float32Array(fireFliesCount)

for (let i = 0; i < fireFliesCount; i++) {
  positionArray[i * 3] = (Math.random() - 0.5) * 4
  positionArray[i * 3 + 1] = Math.random() * 1.5
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

  scaleArray[i] = Math.random() * 2
}
fireFliesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positionArray, 3)
)
fireFliesGeometry.setAttribute(
  'aScale',
  new THREE.BufferAttribute(scaleArray, 1)
)

// Material
const fireFliesMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 60 },
  },
  vertexShader: firefliesVertexShader,
  fragmentShader: firefliesFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
})

gui
  .add(fireFliesMaterial.uniforms.uSize, 'value')
  .min(0)
  .max(500)
  .step(1)
  .name('Fire Flies Size')

// Points
const fireFlies = new THREE.Points(fireFliesGeometry, fireFliesMaterial)

scene.add(fireFlies)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  //update fireFlies
  fireFliesMaterial.uniforms.uPixelRatio.value = Math.min(
    window.devicePixelRatio,
    2
  )
})

gui.hide()

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.x = 4
camera.position.y = 4
camera.position.z = 10
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

debugObject.clearColor = '#2a0909'
renderer.setClearColor(debugObject.clearColor)
gui.addColor(debugObject, 'clearColor').onChange(() => {
  renderer.setClearColor(debugObject.clearColor)
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Upadte Materials
  fireFliesMaterial.uniforms.uTime.value = elapsedTime
  portalLightMaterial.uniforms.uTime.value = elapsedTime

  // Inside your render loop
  if (mixer != null) mixer.update(deltaTime)

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
