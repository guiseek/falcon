import { isMobile, loader, math, type Control } from "../utilities";
import {
  Vector3,
  MathUtils,
  Quaternion,
  AnimationMixer,
  type AnimationAction,
} from "three";

const MAX_YAW_ACCELERATION = 0.001; // Maximum yaw acceleration. Adjust as needed.

export class F16Falcon extends loader("models/f16-falcon.glb") {
  #speed = 1.2;
  #maxSpeed = 4;
  #acceleration = 0.6;

  #rotation = new Quaternion();
  get quat() {
    return this.#rotation;
  }

  #yawVelocity = 0;
  #pitchVelocity = 0;
  #rollVelocity = 0;

  #planeSpeed = 0.06;
  #maxVelocity = 0.4;
  #friction = 0.96;

  #mixer?: AnimationMixer;
  #actions: AnimationAction[] = [];

  actions = {};

  constructor(private control: Control) {
    super();
    this.onLoad = (scene) => {
      this.#mixer = new AnimationMixer(scene);

      scene.position.set(0, 0, 0);
      for (const animation of this.animations) {
        this.#actions.push(this.#mixer.clipAction(animation));
      }

      this.#activateActions(0.3)
    };
  }

  #rotateSmoothly(alpha: number) {
    const quaternion = new Quaternion();
    quaternion.slerpQuaternions(this.quaternion, this.#rotation, alpha);
    this.quaternion.copy(quaternion);
  }

  #toForward(speed = 0) {
    const currentSpeed = Math.min(speed + this.#acceleration, this.#maxSpeed);
    const direction = new Vector3(0, 0, -1).applyQuaternion(this.quaternion);
    this.position.addScaledVector(direction, -currentSpeed);
  }

  #activateActions(weight: number) {
    this.#actions.forEach((action) => {
      action.enabled = true;
      action.setEffectiveWeight(1);
      action.setEffectiveWeight(weight);
      action.play();
    });
  }

  #handleInput(yawAcceleration: number) {
    if (this.control.key.E) {
      this.#yawVelocity -= yawAcceleration;
    }
    if (this.control.key.Q) {
      this.#yawVelocity += yawAcceleration;
    }

    if (this.control.key.A || this.control.key.Left) {
      this.#rollVelocity -= this.#acceleration / 500;
    }
    if (this.control.key.D || this.control.key.Right) {
      this.#rollVelocity += this.#acceleration / 500;
    }

    if (this.control.key.W || this.control.key.Up) {
      this.#pitchVelocity += this.#acceleration / 500;
    }
    if (this.control.key.S || this.control.key.Down) {
      this.#pitchVelocity -= this.#acceleration / 500;
    }
  }

  update(delta: number): void {
    this.#yawVelocity *= this.#friction;
    this.#pitchVelocity *= this.#friction;
    this.#rollVelocity *= this.#friction;

    const yawAcceleration = MathUtils.clamp(
      MathUtils.lerp(
        0.0001,
        this.#acceleration,
        Math.abs(this.#planeSpeed) / this.#maxVelocity
      ),
      0.0001,
      MAX_YAW_ACCELERATION
    );

    this.#handleInput(yawAcceleration);

    this.#toForward(this.#speed);

    if (isMobile()) {
      this.#rotateSmoothly(Math.min(4 + delta, 1));
    }

    this.#yawVelocity = math.clamp(
      this.#yawVelocity,
      -this.#maxVelocity,
      this.#maxVelocity
    );
    this.#pitchVelocity = math.clamp(
      this.#pitchVelocity,
      -this.#maxVelocity,
      this.#maxVelocity
    );
    this.#rollVelocity = math.clamp(
      this.#rollVelocity,
      -this.#maxVelocity,
      this.#maxVelocity
    );

    this.rotateY(this.#yawVelocity);
    this.rotateX(this.#pitchVelocity);
    this.rotateZ(this.#rollVelocity);

    this.rotation.z += this.#rollVelocity;
    // this.position.x += this.#planeSpeed * 1

    if (this.#mixer && delta) {
      this.#mixer.update(delta * this.#speed);
    }
  }
}
