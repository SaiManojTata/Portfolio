import * as THREE from './node_modules/three'
console.log(THREE)
// import * as dat from 'dat.gui'

import gsap from './node_modules/gsap'

import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls'

// const gui = new dat.GUI()

const world = {
  plane: {
    width: 400,
    height: 400, 
    widthSegments: 50,
    heightSegments: 50
  }
}

function generatePlane()
{
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width, 
    world.plane.height, 
    world.plane.widthSegments, 
    world.plane.heightSegments
    )

    const {array} = planeMesh.geometry.attributes.position
    const randomValues = []

    for(let i = 0; i < array.length; i+=3)
    {
      const x = array[i]
      const y = array[i + 1]
      const z = array[i + 2]

      array[i] = x + (Math.random() - 0.5) * 3
      array[i + 1] = y + (Math.random() - 0.5) * 3
      array[i + 2] = z + (Math.random() - 0.5) * 5

      randomValues.push(Math.random() * Math.PI * 2)
      randomValues.push(Math.random() * Math.PI * 2)
      randomValues.push(Math.random() * Math.PI * 2)
    }

  planeMesh.geometry.attributes.position.originalPosition 
  = planeMesh.geometry.attributes.position.array

  planeMesh.geometry.attributes.position.randomValues = randomValues

  const colors = []
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++)
  {
    colors.push(0, 0.19, 0.4)
  }

  planeMesh.geometry.setAttribute(
    'color', 
    new THREE.BufferAttribute( new 
      Float32Array(colors), // R G B (but from 0 to 1)
      3 //item size (3 coordinates)
    )
  )
}

/*
gui.add(world.plane, 'width', 1, 1000).
  onChange(generatePlane)

gui.add(world.plane, 'height', 1, 1000).
  onChange(generatePlane)

gui.add(world.plane, 'widthSegments', 1, 300).
  onChange(generatePlane)

gui.add(world.plane, 'heightSegments', 1, 300).
  onChange(generatePlane)
*/

// a raycaster can be considered as a laser pointer relative to the scene
const raycaster = new THREE.Raycaster()
console.log(raycaster)

// a new Threejs scene
const scene = new THREE.Scene(); 

// a new Threejs camera

/*
param1 - default, 75 degrees
param2 - aspect ratio set
param3 - initial camera snapping
param4 - final camera snapping
*/
const camera = new THREE.PerspectiveCamera(75, 
  innerWidth / innerHeight, 
  0.1, 
  1000)

  // a new Threejs renderer
const renderer = new THREE.WebGLRenderer()

// setting size of scene to match the screen width and height
renderer.setSize(innerWidth, innerHeight)

// added to remove jagged edges of render
renderer.setPixelRatio(devicePixelRatio)

// adding our renderer to the dom 
document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement)

// setting our camera position in between to actually see the render
camera.position.z = 75

const planeGeometry = new THREE.PlaneGeometry(world.plane.width, 
  world.plane.height, world.plane.widthSegments, 
  world.plane.heightSegments); 
console.log(planeGeometry)
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide, 
  flatShading: THREE.FlatShading, 
  vertexColors: true})
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)

scene.add(planeMesh)
generatePlane(); 



const light = new THREE.DirectionalLight(
  0xffffff, 1)
light.position.set(0, 1, 1)
scene.add(light)

const backLight = new THREE.DirectionalLight(
  0xffffff, 1)
backLight.position.set(0, 0, -1)
scene.add(backLight)

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff
})

const starVertices = []
for(let i = 0; i < 10000; i++)
{
  const x = (Math.random() - 0.5) * 2000
  const y = (Math.random() - 0.5) * 2000
  const z = (Math.random() - 0.5) * 2000

  starVertices.push(x, y, z) 
}

starGeometry.setAttribute('position', 
    new THREE.Float32BufferAttribute(starVertices, 3)
)



const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)

const mouse = {
  x: undefined, 
  y: undefined
}

// time frame
let frame = 0; 

// animate function for rotation of box render
function animate() {
  requestAnimationFrame(animate)  
  renderer.render(scene, camera)

  raycaster.setFromCamera(mouse, camera)

  frame += 0.01; 

  // object destructuring
  const { array, originalPosition, randomValues } = planeMesh.geometry.attributes.position

  for(let i = 0; i < array.length; i+=3)
  {
      array[i] = originalPosition[i] + (Math.cos(frame + randomValues[i]))*0.0025
      array[i + 1] = originalPosition[i + 1] + (Math.sin(frame + randomValues[i + 1]))*0.0025
  }

  planeMesh.geometry.attributes.position.needsUpdate = true

  const intersects = raycaster.intersectObject(planeMesh)

  if(intersects.length > 0)
  {
    const {color} = intersects[0].object.geometry.attributes

    // vertex 1 
    color.setX(intersects[0].face.a, 0.1)
    color.setY(intersects[0].face.a, 0.5)
    color.setZ(intersects[0].face.a, 1)
    

    // vertex 2
    color.setX(intersects[0].face.b, 0.1)
    color.setY(intersects[0].face.b, 0.5)
    color.setZ(intersects[0].face.b, 1)

    // vertex 3 
    color.setX(intersects[0].face.c, 0.1)
    color.setY(intersects[0].face.c, 0.5)
    color.setZ(intersects[0].face.c, 1)

    color.needsUpdate = true

    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4
    }

    const hoverColor = {
      r: 0.1, 
      g: 0.5, 
      b: 1
    }

    gsap.to(hoverColor, {
      r: initialColor.r, 
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        // vertex 1 
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)
        

        // vertex 2
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)

        // vertex 3 
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)       
        
        color.needsUpdate = true
      }
    })

  }

  stars.rotation.x += 0.0015
}

// calling the animate function
animate()

addEventListener('mousemove', (event) => 
{
  // normalizing mouse coordinates
  mouse.x = (event.clientX / innerWidth)*2 - 1
  mouse.y = (event.clientY / innerHeight)*(-2) + 1
})


// animating the HTML Text

gsap.to('#name', {
  opacity: 1, 
  duration: 2, 
  y: 0, 
  ease: 'expo'
})

gsap.to('#initial-text', {
  opacity: 1, 
  duration: 1.5, 
  delay: 1,
  y: 0, 
  ease: 'power4'
})

gsap.to('#github', {
  opacity: 1, 
  duration: 1, 
  delay: 2,
  y: 0, 
  ease: 'bounce'
})

gsap.to('#linked-in', {
  opacity: 1, 
  duration: 1, 
  delay: 2,
  y: 0, 
  ease: 'bounce'
})

document.querySelector('#github').
  addEventListener('click', (e) => {
    e.preventDefault()
    gsap.to('#container', {
      opacity: 0
    })

    gsap.to(camera.position, {
      z: 30, 
      ease: 'power4.inOut', 
      duration: 2
    })

    gsap.to(camera.rotation, {
      x: 1.57, 
      ease: 'power4.inOut',
      delay: 2, 
      duration: 1.5
    })

    gsap.to(camera.position, {
      y: 500, 
      ease: 'power1.in', 
      delay: 4,
      duration: 1, 
      onComplete: () => {
        window.location = "https:github.com/SaiManojTata"
      }
    })
  })

  document.querySelector('#linked-in').
  addEventListener('click', (e) => {
    e.preventDefault()
    gsap.to('#container', {
      opacity: 0
    })

    gsap.to(camera.position, {
      z: 30, 
      ease: 'power4.inOut', 
      duration: 2
    })

    gsap.to(camera.rotation, {
      x: 1.57, 
      ease: 'power4.inOut',
      delay: 2, 
      duration: 1.5
    })

    gsap.to(camera.position, {
      y: 500, 
      ease: 'power1.in', 
      delay: 4,
      duration: 1, 
      onComplete: () => {
        window.location = "https://www.linkedin.com/in/sai-manoj-tata/"
      }
    })
  })

addEventListener('resize', () => {
  camera.aspect= (innerWidth / innerHeight)
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})

/*
 commented code 

/ a new Threejs geometry 
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

/ a new Threejs material 
const material = new THREE.MeshBasicMaterial({color: 0x00ff00})

/ a new Threejs mesh 
const mesh = new THREE.Mesh(boxGeometry, material)

/ adding our mesh to the scene
scene.add(mesh)
 
/ rotation of box geometry 
mesh.rotation.x += 0.01
mesh.rotation.y += 0.01

/ rotation of plane geometry 
planeMesh.rotation.x += 0.01 
*/