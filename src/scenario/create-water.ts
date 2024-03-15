import {
  Vector3,
  PlaneGeometry,
  RepeatWrapping,
  TextureLoader,
  type Texture,
} from 'three'
import {Water} from 'three/examples/jsm/Addons.js'

export function createWater(hasFog = false) {
  const waterGeometry = new PlaneGeometry(10000, 10000)

  const pathTexture = 'textures/waternormals.jpg'
  const wrapTexture = (texture: Texture) => {
    texture.wrapS = texture.wrapT = RepeatWrapping
  }
  const loader = new TextureLoader()
  const normals = loader.load(pathTexture, wrapTexture)

  const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    sunDirection: new Vector3(),
    waterNormals: normals,
    fog: hasFog,
  })

  water.rotation.x = -Math.PI / 2

  return water
}
