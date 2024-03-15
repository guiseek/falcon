import {MathUtils, Vector3, type RenderTarget} from 'three'
import {Sky, type Water} from 'three/examples/jsm/Addons.js'

export function createSky(water: Water, renderTarget: RenderTarget) {
  const sun = new Vector3()

  const sky = new Sky()
  sky.scale.setScalar(10000)

  const skyUniforms = sky.material.uniforms

  skyUniforms['turbidity'].value = 10
  skyUniforms['rayleigh'].value = 2
  skyUniforms['mieCoefficient'].value = 0.005
  skyUniforms['mieDirectionalG'].value = 0.8

  const parameters = {
    elevation: 2,
    azimuth: 180,
  }

  // const pmremGenerator = new PMREMGenerator(renderer);
  // const sceneEnv = new Scene();

  // let renderTarget: RenderTarget;

  function updateSun() {
    const phi = MathUtils.degToRad(90 - parameters.elevation)
    const theta = MathUtils.degToRad(parameters.azimuth)

    sun.setFromSphericalCoords(1, phi, theta)

    sky.material.uniforms['sunPosition'].value.copy(sun)
    water.material.uniforms['sunDirection'].value.copy(sun).normalize()

    if (renderTarget) renderTarget.dispose()

    // sceneEnv.add(sky);
    // renderTarget = pmremGenerator.fromScene(sceneEnv);

    // scene.environment = renderTarget.texture;
  }

  updateSun()

  return sky
}
