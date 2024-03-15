import {Group, type AnimationClip} from 'three'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('js/')
gltfLoader.setDRACOLoader(dracoLoader)

export const loader = (path: string) => {
  return class extends Group {
    #onLoad = new Set<(scene: Group, animations: AnimationClip[]) => void>()

    set onLoad(fn: (scene: Group, animations: AnimationClip[]) => void) {
      this.#onLoad.add(fn)
    }

    constructor() {
      super()
      this.#initialize(path)
    }

    async #initialize(path: string) {
      await gltfLoader.loadAsync(path).then((gltf) => {
        this.animations = gltf.animations
        this.add(gltf.scene)
        for (const fn of this.#onLoad) {
          fn(gltf.scene, gltf.animations)
        }
      })
    }
  }
}
