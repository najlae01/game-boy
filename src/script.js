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

let beeMixer
gltfLoader.load(
  'breezy.glb',
  (gltf) => {
    beeMixer = new THREE.AnimationMixer(gltf.scene)

    console.log('breezy')
    console.log(gltf)
    gltf.scene.scale.set(0.2, 0.2, 0.2)
    gltf.scene.position.y = 4
    gltf.scene.position.x = 6
    const animations = gltf.animations
    console.log(animations) // Check if animations are present
    // load the animation
    //   beeMixer.clipAction(gltf.animations[1]).play()
    //   beeMixer.clipAction(gltf.animations[2]).play()

    //   // Add the breezy bees to the scene
    //   for (let i = 0; i < breezyBeeCount; i++) {
    //     const beeInstance = gltf.scene.clone()
    //     beeInstance.position.set(
    //       positionBeeArray[i * 3],
    //       positionBeeArray[i * 3 + 1],
    //       positionBeeArray[i * 3 + 2]
    //     )

    //     beeInstance.name = 'breezyBee_' + i

    //     beeInstance.scale.set(scaleBeeArray[i], scaleBeeArray[i], scaleBeeArray[i])

    //     // Generate a random rotation angle around the Y-axis
    //     const randomRotationY = Math.random() * Math.PI * 2
    //     beeInstance.rotation.y = randomRotationY

    //     scene.add(beeInstance)
    //   }
    // })

    if (animations && animations.length >= 3) {
      beeMixer.clipAction(animations[1]).play()
      beeMixer.clipAction(animations[2]).play()
    } else {
      console.error('Error: No valid animations found in the GLTF file.')
      return
    }

    function checkCollision(position, boundingSphereRadius) {
      for (const object of scene.children) {
        // Check if the object is a 3D mesh with a valid geometry and boundingSphere
        if (
          object.isMesh &&
          object.geometry &&
          object.geometry.boundingSphere
        ) {
          const distance = position.distanceTo(object.position)
          if (
            distance <
            boundingSphereRadius + object.geometry.boundingSphere.radius
          ) {
            return true // Collision detected
          }
        }
      }
      return false // No collision
    }

    // Add the breezy bees to the scene with random Y rotation and non-overlapping positions
    const beeBoundingSphereRadius = 1 // Adjust this value based on your bee model size

    for (let i = 0; i < breezyBeeCount; i++) {
      const beeInstance = gltf.scene.clone()
      beeInstance.name = 'breezyBee_' + i

      // beeInstance.position.set(
      //   positionBeeArray[i * 3],
      //   positionBeeArray[i * 3 + 1],
      //   positionBeeArray[i * 3 + 2]
      // )

      // Generate a random rotation angle around the Y-axis
      const randomRotationY = Math.random() * Math.PI * 2
      beeInstance.rotation.y = randomRotationY

      // Generate a random position and check for collisions
      // let newPosition = new THREE.Vector3()
      // let collisionDetected = true
      // while (collisionDetected) {
      //   newPosition.set(
      //     (Math.random() - 0.5) * 4,
      //     Math.random() * 1.5,
      //     (Math.random() - 0.5) * 4
      //   )
      //   collisionDetected = checkCollision(newPosition, beeBoundingSphereRadius)
      // }

      // beeInstance.position.copy(newPosition)

      // Generate a random scale between 0.5 and 1
      beeInstance.scale.set(
        scaleBeeArray[i],
        scaleBeeArray[i],
        scaleBeeArray[i]
      )

      scene.add(beeInstance)
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

const beeMoveSpeed = 0.2 // Adjust the move speed as desired
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
  for (let i = 0; i < breezyBeeCount; i++) {
    const beeInstance = scene.getObjectByName('breezyBee_' + i)

    if (beeInstance) {
      // Calculate the angle for the circular path based on the elapsed time and bee index
      const angleX = randomPositions[i].x + 
        elapsedTime * beeMoveSpeed +
        (randomPositions[i].x * 5 + i * (Math.PI * 2)) / breezyBeeCount

      const angleZ = randomPositions[i].z +
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

  if (beeMixer != null) beeMixer.update(deltaTime)

  updateBeeMovement()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
