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

// Texture loader
const textureLoader = new THREE.TextureLoader()

const worriedFaceTexture = textureLoader.load('textures/face/worried.png')

// Create video and play
const sleepytextureVid = document.createElement('video')
sleepytextureVid.src = 'textures/face/sleeping.mp4'
sleepytextureVid.loop = true

// Load video texture
const sleepyFaceTexture = new THREE.VideoTexture(sleepytextureVid)
sleepyFaceTexture.format = THREE.RGBAFormat
sleepyFaceTexture.minFilter = THREE.NearestFilter
sleepyFaceTexture.maxFilter = THREE.NearestFilter
sleepyFaceTexture.generateMipmaps = false

// Create happy face video and play
const originalVideoSrc = 'textures/face/happyblink.mp4'
const textureVid = document.createElement('video')
textureVid.src = originalVideoSrc
textureVid.loop = true
document.addEventListener('click', () => {
  // Play the video once the user clicks anywhere on the page.
  textureVid.play()
})
// Load video texture
const happyFace = new THREE.VideoTexture(textureVid)
happyFace.format = THREE.RGBAFormat
happyFace.minFilter = THREE.NearestFilter
happyFace.maxFilter = THREE.NearestFilter
happyFace.generateMipmaps = false

/**
 * Functions
 */

const raycaster = new THREE.Raycaster()
const beeInstances = []

function raycast(event) {
  const mouse = new THREE.Vector2()
  mouse.x = (event.clientX / sizes.width) * 2 - 1
  mouse.y = -(event.clientY / sizes.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(beeInstances, true)

  if (intersects.length > 0) {
    // console.log('Bee clicked')
    const clickedObject = intersects[0].object
    const parentName = clickedObject.parent ? clickedObject.parent.name : null
    // console.log(clickedObject.name)

    if (
      clickedObject.name.startsWith('Cube007') ||
      clickedObject.name.startsWith('wingL') ||
      clickedObject.name.startsWith('wingR')
    ) {
      // console.log('Removing bee:', clickedObject.parent.parent.name)
      removeBee(clickedObject.parent.parent)
    }
  }
}

function removeBee(beeInstance) {
  // console.log('Inside removeBee start :', beeInstance.name)
  // Check if the beeInstance is in the scene
  const index = beeInstances.indexOf(beeInstance)
  if (index !== -1) {
    // Remove the bee from the scene
    scene.remove(beeInstance)
    // Remove the bee from the beeInstances array
    beeInstances.splice(index, 1)

    // Remove the corresponding position from the randomPositions array
    const beeIndex = parseInt(beeInstance.name.replace('breezyBee_', ''))
    if (
      !isNaN(beeIndex) &&
      beeIndex >= 0 &&
      beeIndex < randomPositions.length
    ) {
      randomPositions.splice(beeIndex, 1)
    }
    faceMaterial.map = worriedFaceTexture

    // Revert back to the happy face after 3 seconds
    setTimeout(() => {
      faceMaterial.map = happyFace
    }, 3000)
    // console.log('Bee removed', beeInstance.name)
  }
}

// Function to change the video source and switch back to the original video after 3 seconds
function changeVideoSource(newSrc) {
  textureVid.src = newSrc
  setTimeout(() => {
    textureVid.src = originalVideoSrc
  }, 3000)
}

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

canvas.addEventListener('click', raycast)

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */

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

// const straightFace = textureLoader.load('happyblink.gif')

const faceMaterial = new THREE.MeshBasicMaterial({ map: sleepyFaceTexture })

const groundMaterial = new THREE.MeshBasicMaterial({ map: bakedGround })

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
  mixer = new THREE.AnimationMixer(gltf.scene)
  // console.log(gltf)
  gltf.scene.scale.set(0.7, 0.7, 0.7)
  gltf.scene.position.y = 0.07
  gltf.scene.position.x = 0.45
  gltf.scene.traverse((child) => {
    child.material = bakedMaterial
  })
  const face = gltf.scene.children.find((child) => child.name === 'face')
  face.material = faceMaterial
  // Revert back to the happy face after 3 seconds
  setTimeout(() => {
    faceMaterial.map = happyFace
  }, 8000)
  // const animations = gltf.animations
  // console.log(animations) // Check if animations are present
  // load the animation

  mixer.clipAction(gltf.animations[1]).play()
  mixer.clipAction(gltf.animations[4]).play()

  scene.add(gltf.scene)
})

gltfLoader.load('stylized-tree.glb', (gltf) => {
  // console.log(gltf.scene.children[0])
  gltf.scene.children[0].material = bakedTreeMaterial
  gltf.scene.children[0].scale.set(1.5, 1.5, 1.5)
  gltf.scene.children[0].rotateY((5 * Math.PI) / 6)
  gltf.scene.children[0].position.y = 6.7
  gltf.scene.children[0].position.z = 0.15
  gltf.scene.children[0].position.x = -1
  scene.add(gltf.scene.children[0])
})

gltfLoader.load('ground.glb', (gltf) => {
  // console.log(gltf)
  gltf.scene.rotateY(-Math.PI / 2)
  gltf.scene.position.z = -1.5
  gltf.scene.position.y = -0.4
  gltf.scene.position.x = 46
  gltf.scene.traverse((child) => {
    child.material = groundMaterial
  })
  scene.add(gltf.scene)
})

/**
 * BreezyBees
 */
const breezyBeeCount = 50
const positionBeeArray = new Float32Array(breezyBeeCount * 3)
const scaleBeeArray = new Float32Array(breezyBeeCount)

for (let i = 0; i < breezyBeeCount; i++) {
  positionBeeArray[i * 3] = (Math.random() - 0.5) * 40
  positionBeeArray[i * 3 + 1] = (Math.random() + 0.5) * 5
  positionBeeArray[i * 3 + 2] = (Math.random() - 0.5) * 30

  // Generate a random scale between 0.5 and 1
  scaleBeeArray[i] = 0.07 + Math.random() * 0.15
}

let beeMixer = []
let beeModel
gltfLoader.load(
  'breezy.glb',
  (gltf) => {
    // console.log('breezy')
    // console.log(gltf)
    beeModel = gltf.scene
    beeModel.scale.set(0.2, 0.2, 0.2)
    beeModel.position.y = 4
    beeModel.position.x = 6

    for (let i = 0; i < breezyBeeCount; i++) {
      const beeInstance = beeModel.clone()
      beeInstance.name = 'breezyBee_' + i

      const randomRotationY = Math.random() * Math.PI * 2
      beeInstance.rotation.y = randomRotationY
      beeInstance.scale.set(
        scaleBeeArray[i],
        scaleBeeArray[i],
        scaleBeeArray[i]
      )
      // Create an AnimationMixer for each bee instance
      const mixer = new THREE.AnimationMixer(beeInstance)
      const animations = gltf.animations
      // console.log(animations) // Check if animations are present
      if (animations && animations.length >= 0) {
        mixer.clipAction(animations[1]).play()
        mixer.clipAction(animations[2]).play()
      } else {
        console.error('Error: No valid animations found in the GLTF file.')
        return
      }
      beeMixer.push(mixer)

      scene.add(beeInstance)

      beeInstances.push(beeInstance)
    }
  },
  undefined,
  (error) => {
    console.error('Error loading the GLTF file:', error)
  }
)

const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#CDC942', 0.3)
directionalLight.position.set(1, 0.25, 0)
scene.add(directionalLight)
/**testing ends */

/**
 * FireFlies
 */
const fireFliesGeometry = new THREE.BufferGeometry()
const fireFliesCount = 70
const positionArray = new Float32Array(fireFliesCount * 3)
const scaleArray = new Float32Array(fireFliesCount)

for (let i = 0; i < fireFliesCount; i++) {
  positionArray[i * 3] = (Math.random() - 0.5) * 20
  positionArray[i * 3 + 1] = (Math.random() + 4) * 5
  positionArray[i * 3 + 2] = (Math.random() - 0.5) * 20

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

const beeMoveSpeed = 0.1 // Adjust the move speed as desired
const circleRadius = 2 // Radius of the circular path

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const randomPositions = []

for (let i = 0; i < breezyBeeCount; i++) {
  const randomPosition = new THREE.Vector3() // Initialize as a THREE.Vector3
  randomPosition.x = Math.random() * 4
  randomPosition.y = Math.random() * 4
  randomPosition.z = Math.random() * 4
  randomPositions.push(randomPosition) // Add the randomPosition to the array
}

function updateBeeMovement() {
  const elapsedTime = clock.getElapsedTime()
  previousTime = elapsedTime
  for (let i = 0; i < beeInstances.length; i++) {
    const beeInstance = beeInstances[i]

    if (beeInstance) {
      // Add a check here to ensure beeInstance exists
      // Calculate the angle for the circular path based on the elapsed time and bee index
      const angleX =
        randomPositions[i].x +
        elapsedTime * beeMoveSpeed +
        (randomPositions[i].x * 5 + i * (Math.PI * 2)) / breezyBeeCount

      const angleZ =
        randomPositions[i].z +
        elapsedTime * beeMoveSpeed +
        (randomPositions[i].y * 5 + i * (Math.PI * 2)) / breezyBeeCount

      // Calculate the new position on the circular path
      const x =
        Math.cos(angleX) * circleRadius * (7 + Math.sin(elapsedTime * 0.32))
      const z =
        Math.sin(angleZ) * circleRadius * (7 + Math.sin(elapsedTime * 0.5))

      // Update the bee's position
      beeInstance.position.x = x
      beeInstance.position.z = z
      beeInstance.position.y = randomPositions[i].y + 2
      beeInstance.rotation.y =
        Math.sin(elapsedTime) + Math.sin(elapsedTime * 2.5) * 0.01
    }
  }
}

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Upadte Materials
  fireFliesMaterial.uniforms.uTime.value = elapsedTime
  portalLightMaterial.uniforms.uTime.value = elapsedTime

  // Inside your render loop
  if (mixer != null) mixer.update(deltaTime)

  for (let i = 0; i < beeMixer.length; i++) {
    const mixer = beeMixer[i]
    if (mixer) mixer.update(deltaTime)
  }

  updateBeeMovement()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
