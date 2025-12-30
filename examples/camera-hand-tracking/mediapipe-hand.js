/** @typedef {{x:number,y:number,z:number}} Vector3 */
/**
 *  @typedef {{
 *   landmarks: Vector3[][];
 *    worldLandmarks: Vector3[][];
 *    handednesses: {
 *       score: number;
 *       index: number;
 *       categoryName: "Left"|"Right";
 *       displayName: "Left"|"Right";
 *    }[][];
 *}} HandLandmarkerResult
 */

/**
 * MediaPipe Hand landmark names (21 points)
 * @typedef {(
 *  | "WRIST"
 *  | "THUMB_CMC"
 *  | "THUMB_MCP"
 *  | "THUMB_IP"
 *  | "THUMB_TIP"
 *  | "INDEX_FINGER_MCP"
 *  | "INDEX_FINGER_PIP"
 *  | "INDEX_FINGER_DIP"
 *  | "INDEX_FINGER_TIP"
 *  | "MIDDLE_FINGER_MCP"
 *  | "MIDDLE_FINGER_PIP"
 *  | "MIDDLE_FINGER_DIP"
 *  | "MIDDLE_FINGER_TIP"
 *  | "RING_FINGER_MCP"
 *  | "RING_FINGER_PIP"
 *  | "RING_FINGER_DIP"
 *  | "RING_FINGER_TIP"
 *  | "PINKY_MCP"
 *  | "PINKY_PIP"
 *  | "PINKY_DIP"
 *  | "PINKY_TIP"
 * )} HAND_LANDMARK
 */
/** @type {HAND_LANDMARK[]} */
const HAND_LANDMARKS = [
  "WRIST",
  "THUMB_CMC",
  "THUMB_MCP",
  "THUMB_IP",
  "THUMB_TIP",
  "INDEX_FINGER_MCP",
  "INDEX_FINGER_PIP",
  "INDEX_FINGER_DIP",
  "INDEX_FINGER_TIP",
  "MIDDLE_FINGER_MCP",
  "MIDDLE_FINGER_PIP",
  "MIDDLE_FINGER_DIP",
  "MIDDLE_FINGER_TIP",
  "RING_FINGER_MCP",
  "RING_FINGER_PIP",
  "RING_FINGER_DIP",
  "RING_FINGER_TIP",
  "PINKY_MCP",
  "PINKY_PIP",
  "PINKY_DIP",
  "PINKY_TIP",
];
/** @type {Record<HAND_LANDMARK, number>} */
const HAND_LANDMARKS_MAP = {};
HAND_LANDMARKS.forEach((HAND_LANDMARK, index) => {
  HAND_LANDMARKS_MAP[HAND_LANDMARK] = index;
});
console.log("HAND_LANDMARKS", HAND_LANDMARKS);
console.log("HAND_LANDMARKS_MAP", HAND_LANDMARKS_MAP);

window.defaultHandDistance = 0.4;

/** @type {[HAND_LANDMARK, HAND_LANDMARK][]} */
const JOINT_CONNECTIONS = [
  ["WRIST", "THUMB_CMC"],
  ["THUMB_CMC", "THUMB_MCP"],
  ["THUMB_MCP", "THUMB_IP"],
  ["THUMB_IP", "THUMB_TIP"],

  //   ["WRIST", "INDEX_FINGER_MCP"],
  //   ["THUMB_CMC", "INDEX_FINGER_MCP"],
  ["THUMB_MCP", "INDEX_FINGER_MCP"],
  ["INDEX_FINGER_MCP", "INDEX_FINGER_PIP"],
  ["INDEX_FINGER_PIP", "INDEX_FINGER_DIP"],
  ["INDEX_FINGER_DIP", "INDEX_FINGER_TIP"],

  ["MIDDLE_FINGER_MCP", "MIDDLE_FINGER_PIP"],
  ["MIDDLE_FINGER_PIP", "MIDDLE_FINGER_DIP"],
  ["MIDDLE_FINGER_DIP", "MIDDLE_FINGER_TIP"],

  ["RING_FINGER_MCP", "RING_FINGER_PIP"],
  ["RING_FINGER_PIP", "RING_FINGER_DIP"],
  ["RING_FINGER_DIP", "RING_FINGER_TIP"],

  ["WRIST", "PINKY_MCP"],
  ["PINKY_MCP", "PINKY_PIP"],
  ["PINKY_PIP", "PINKY_DIP"],
  ["PINKY_DIP", "PINKY_TIP"],

  ["INDEX_FINGER_MCP", "MIDDLE_FINGER_MCP"],
  ["MIDDLE_FINGER_MCP", "RING_FINGER_MCP"],
  ["RING_FINGER_MCP", "PINKY_MCP"],
];

/** @type {import("three")} */
const THREE = window.THREE;

AFRAME.registerComponent("mediapipe-hand", {
  schema: {
    side: { type: "string", default: "left" },
    smoothing: { type: "number", default: 0.7 },
    pinchThreshold: { type: "number", default: 0.03 },
    jointRadius: { type: "number", default: 0.005 },
    cylinderRadius: { type: "number", default: 0.003 },
  },

  init() {
    this.el.object3D.visible = false;
    this.camera = this.el.sceneEl.querySelector("a-camera");
    this.hand = document.createElement("a-entity");
    this.el.appendChild(this.hand);

    this.raycaster = new THREE.Raycaster();

    console.log("init mediapipe-hand", this.data.side);

    this.jointSpheres = [];
    for (let i = 0; i < HAND_LANDMARKS.length; i++) {
      const sphere = document.createElement("a-sphere");
      sphere.setAttribute("color", "red");
      sphere.setAttribute("radius", this.data.jointRadius);
      this.jointSpheres.push(sphere);
      this.hand.appendChild(sphere);
    }

    this.jointCylinders = [];
    for (let i = 0; i < JOINT_CONNECTIONS.length; i++) {
      const cylinder = document.createElement("a-cylinder");
      cylinder.setAttribute("color", "white");
      cylinder.setAttribute("radius", this.data.cylinderRadius);
      cylinder.setAttribute("height", "1");
      this.jointCylinders.push(cylinder);
      this.hand.appendChild(cylinder);
    }

    this.el.sceneEl.addEventListener("handLandmarkerResult", (e) => {
      this.updateFromLandmarks(e.detail.handLandmarkerResult);
    });
  },

  /** @param {Vector3} vector */
  getRay(vector) {
    // Convert [0,1] → [-1,1] (NDC)
    const ndc = new THREE.Vector2(
      vector.x * 2 - 1,
      vector.y * 2 - 1 // flip Y (screen → NDC)
    );

    this.raycaster.setFromCamera(ndc, this.el.sceneEl.camera);
    return this.raycaster.ray.clone();
  },

  /** @param {HandLandmarkerResult} handLandmarkerResult */
  updateFromLandmarks(handLandmarkerResult) {
    //console.log("handLandmarkerResult", handLandmarkerResult);
    const index = handLandmarkerResult.handednesses.findIndex(
      (handedness) => handedness[0].categoryName.toLowerCase() == this.data.side
    );
    if (index == -1) {
      this.el.object3D.visible = false;
      return;
    }

    const { object3D } = this.el;
    const { object3D: cameraObject3D } = this.camera;
    object3D.position.copy(cameraObject3D.position);
    object3D.quaternion.copy(cameraObject3D.quaternion);

    //console.log(this.data.side);

    const handedness = handLandmarkerResult.handednesses[index][0];
    const worldLandmarks = handLandmarkerResult.worldLandmarks[index];
    const landmarks = handLandmarkerResult.landmarks[index];

    /** @type {HAND_LANDMARK} */
    const originLandmarkName = "INDEX_FINGER_MCP";
    /** @type {HAND_LANDMARK[]} */
    const referenceLandmarkNames = ["WRIST", "PINKY_MCP", "THUMB_CMC"];

    const wristWorldLandmark = structuredClone(
      worldLandmarks[HAND_LANDMARKS_MAP[originLandmarkName]]
    );
    worldLandmarks.forEach((worldLandmark) => {
      worldLandmark.x -= wristWorldLandmark.x;
      worldLandmark.y -= wristWorldLandmark.y;
      worldLandmark.z -= wristWorldLandmark.z;
    });

    /** @type {Vector3[]} */
    const cameraWorldLandmarks = worldLandmarks.map((worldLandmark) => {
      const position = this.worldLandmarkToPosition(worldLandmark);
      return position;
    });

    /** @type {Vector3[]} */
    const cameraLandmarks = landmarks.map((landmark) => {
      const position = this.landmarkToPosition(landmark);
      return position;
    });

    this.updateJoints(cameraWorldLandmarks);
    this.updateJointConnections(cameraWorldLandmarks);

    const inverseCameraQuaternion = this.camera.object3D.quaternion
      .clone()
      .invert();

    const ray = this.getRay(
      cameraLandmarks[HAND_LANDMARKS_MAP[originLandmarkName]]
    );
    const localRayDirection = ray.direction
      .clone()
      .applyQuaternion(inverseCameraQuaternion);

    const handPosition = new THREE.Vector3();
    let handDistancesSum = 0;
    referenceLandmarkNames.forEach((referenceLandmarkName) => {
      const _handDistance = this.solveRayScalar(
        cameraWorldLandmarks[HAND_LANDMARKS_MAP[referenceLandmarkName]],
        ray.direction,
        cameraLandmarks[HAND_LANDMARKS_MAP[referenceLandmarkName]],
        cameraLandmarks[HAND_LANDMARKS_MAP[originLandmarkName]]
      );
      handDistancesSum += _handDistance;
    });
    const handDistance = handDistancesSum / referenceLandmarkNames.length;

    console.log({ handDistance });

    handPosition.addScaledVector(localRayDirection, handDistance);
    this.hand.object3D.position.lerp(handPosition, this.data.smoothing);

    this.el.object3D.visible = true;
  },

  /**
   * @param {Vector3} vector
   * @param {Vector3} direction
   * @param {Vector3} projection
   * @param {Vector3} origin
   */
  solveRayScalar(vector, direction, projection, origin, threshold = 0.000001) {
    const camera = this.el.sceneEl.camera;

    const _projection = new THREE.Vector3().copy(projection);
    _projection.z = 0;

    origin = new THREE.Vector3().copy(origin);

    const _vector = new THREE.Vector3();
    let distance = 0.0;
    let difference = 0;
    let offset = 0.1;
    let didOvershoot = false;
    let i = 0;
    const distanceFromOriginToProjection = origin.distanceTo(projection);
    let improvement = 0;
    do {
      distance += offset * (didOvershoot ? -1 : 1);
      //console.log({ distance });
      _vector
        .copy(vector)
        .add(this.camera.object3D.position)
        .addScaledVector(direction, distance)
        .project(camera)
        .multiplyScalar(0.5)
        .addScalar(0.5);
      _vector.z = 0;

      const _difference = _vector.distanceTo(_projection);
      if (difference == 0) {
        improvement = 1;
      } else {
        improvement = difference - _difference;
      }
      //console.log({ improvement });
      difference = _difference;

      const _didOvershoot =
        origin.distanceTo(_vector) < distanceFromOriginToProjection;
      //console.log({ difference, _didOvershoot, i });
      if (_didOvershoot != didOvershoot) {
        offset *= 0.5;
        didOvershoot = _didOvershoot;
        //console.log({ didOvershoot, offset });
      }
      i++;
    } while (Math.abs(improvement) > threshold && i < 100);

    //console.log({ i, improvement, offset });

    return distance;
  },

  /** @param {Vector3} vector */
  worldLandmarkToPosition(vector, scale = 1) {
    return {
      x: vector.x * scale,
      y: -vector.y * scale,
      z: -vector.z * scale,
    };
  },
  /** @param {Vector3} vector */
  landmarkToPosition(vector, scale = 1) {
    return {
      x: vector.x * scale,
      y: (1 - vector.y) * scale,
      z: -vector.z * scale,
    };
  },

  /** @param {Vector3[]?} cameraWorldLandmarks */
  updateJoints(cameraWorldLandmarks) {
    //console.log("updating joints", cameraWorldLandmarks);
    this.jointSpheres.forEach((sphere, index) => {
      const { object3D } = sphere;
      const position = cameraWorldLandmarks[index];
      object3D.position.lerp(position, this.data.smoothing);
    });
  },

  /** @param {Vector3[]?} cameraWorldLandmarks */
  updateJointConnections(cameraWorldLandmarks) {
    //console.log("updating joint cylinders", cameraWorldLandmarks);
    const position = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    this.jointCylinders.forEach((cylinder, index) => {
      const [from, to] = JOINT_CONNECTIONS[index];
      const fromLandmark = cameraWorldLandmarks[HAND_LANDMARKS_MAP[from]];
      const toLandmark = cameraWorldLandmarks[HAND_LANDMARKS_MAP[to]];
      //   console.log({ from, to, fromLandmark, toLandmark });
      position.addVectors(fromLandmark, toLandmark).multiplyScalar(0.5);
      direction.subVectors(toLandmark, fromLandmark);
      const height = direction.length() - this.data.jointRadius * 2;
      direction.normalize();

      quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0), // cylinder's local up
        direction
      );

      const { object3D } = cylinder;
      object3D.scale.lerp({ x: 1, y: height, z: 1 }, this.data.smoothing);
      object3D.quaternion.slerp(quaternion, this.data.smoothing);
      object3D.position.lerp(position, this.data.smoothing);
    });
  },
});

const sampleHandLandmarkerResult = {
  landmarks: [
    [
      {
        x: 0.40812402963638306,
        y: 0.6168181300163269,
        z: 5.027932274970226e-7,
      },
      {
        x: 0.420075923204422,
        y: 0.7109547853469849,
        z: -0.028153885155916214,
      },
      {
        x: 0.45260190963745117,
        y: 0.7938605546951294,
        z: -0.03961598128080368,
      },
      {
        x: 0.4925585389137268,
        y: 0.8399376273155212,
        z: -0.049465905874967575,
      },
      {
        x: 0.5313732028007507,
        y: 0.8754236698150635,
        z: -0.059532102197408676,
      },
      {
        x: 0.5402804613113403,
        y: 0.7518714666366577,
        z: -0.018579205498099327,
      },
      {
        x: 0.5978351831436157,
        y: 0.7965227961540222,
        z: -0.036568596959114075,
      },
      {
        x: 0.6323659420013428,
        y: 0.8222137689590454,
        z: -0.05225770175457001,
      },
      {
        x: 0.6623843908309937,
        y: 0.8447789549827576,
        z: -0.06326760351657867,
      },
      {
        x: 0.5533785223960876,
        y: 0.6997926235198975,
        z: -0.01724228821694851,
      },
      {
        x: 0.6099796295166016,
        y: 0.7262107133865356,
        z: -0.03247920423746109,
      },
      {
        x: 0.6420672535896301,
        y: 0.745387852191925,
        z: -0.04722460359334946,
      },
      {
        x: 0.6670987010002136,
        y: 0.7628138065338135,
        z: -0.058391787111759186,
      },
      {
        x: 0.5540984869003296,
        y: 0.6479913592338562,
        z: -0.019896460697054863,
      },
      {
        x: 0.6075767278671265,
        y: 0.6629080176353455,
        z: -0.035133376717567444,
      },
      {
        x: 0.638512134552002,
        y: 0.6752750873565674,
        z: -0.04419688135385513,
      },
      {
        x: 0.6624355316162109,
        y: 0.6895179152488708,
        z: -0.0506848581135273,
      },
      {
        x: 0.5450126528739929,
        y: 0.595111608505249,
        z: -0.025519374758005142,
      },
      {
        x: 0.5896895527839661,
        y: 0.5989978909492493,
        z: -0.04034341871738434,
      },
      {
        x: 0.6164993643760681,
        y: 0.6076384782791138,
        z: -0.04561243951320648,
      },
      {
        x: 0.6386727094650269,
        y: 0.6191327571868896,
        z: -0.04808966815471649,
      },
    ],
  ],
  worldLandmarks: [
    [
      {
        x: -0.07806216925382614,
        y: -0.03299815580248833,
        z: 0.022491455078125,
      },
      {
        x: -0.06559786200523376,
        y: 0.0034727193415164948,
        z: 0.0099334716796875,
      },
      {
        x: -0.05090797692537308,
        y: 0.03254960849881172,
        z: 0.003803253173828125,
      },
      {
        x: -0.031667813658714294,
        y: 0.05717485025525093,
        z: -0.00852203369140625,
      },
      {
        x: -0.00900392048060894,
        y: 0.06885475665330887,
        z: -0.01641845703125,
      },
      {
        x: -0.002306499518454075,
        y: 0.02603745646774769,
        z: 0.00667572021484375,
      },
      {
        x: 0.019749857485294342,
        y: 0.039981309324502945,
        z: -0.001621246337890625,
      },
      {
        x: 0.038181133568286896,
        y: 0.04890395328402519,
        z: -0.00782012939453125,
      },
      {
        x: 0.05308999493718147,
        y: 0.05571449548006058,
        z: -0.030609130859375,
      },
      {
        x: 0.004181102849543095,
        y: 0.0023176914546638727,
        z: 0.0055999755859375,
      },
      {
        x: 0.03460768237709999,
        y: 0.013089785352349281,
        z: -0.01271820068359375,
      },
      {
        x: 0.0462547168135643,
        y: 0.018585843965411186,
        z: -0.03582763671875,
      },
      {
        x: 0.060070499777793884,
        y: 0.02887583337724209,
        z: -0.054107666015625,
      },
      {
        x: 0.004866986535489559,
        y: -0.018429944291710854,
        z: -0.00444793701171875,
      },
      {
        x: 0.02667359821498394,
        y: -0.011442475020885468,
        z: -0.021697998046875,
      },
      {
        x: 0.040427349507808685,
        y: -0.006387310102581978,
        z: -0.041534423828125,
      },
      {
        x: 0.05076947435736656,
        y: 0.001194838434457779,
        z: -0.05938720703125,
      },
      {
        x: -0.007044804282486439,
        y: -0.038915012031793594,
        z: -0.01006317138671875,
      },
      {
        x: 0.011975247412919998,
        y: -0.036902040243148804,
        z: -0.018707275390625,
      },
      {
        x: 0.03076251968741417,
        y: -0.03286847472190857,
        z: -0.0300140380859375,
      },
      {
        x: 0.04045070707798004,
        y: -0.025210684165358543,
        z: -0.041839599609375,
      },
    ],
  ],
  handednesses: [
    [
      {
        score: 0.978515625,
        index: 0,
        categoryName: "Left",
        displayName: "Left",
      },
    ],
  ],
};
