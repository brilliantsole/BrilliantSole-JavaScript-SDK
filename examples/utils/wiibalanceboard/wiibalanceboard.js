/** @typedef {"not connected" | "connecting" | "connected" | "disconnecting"} ConnectionStatus */

/**
 * @typedef {Object} CallbackOptions
 * @property {Boolean} once
 */

/**
 * @typedef {Object} BaseEvent
 * @property {string} type
 * @property {WiiBalanceBoard} target
 */

/**
 * @typedef {BaseEvent & {
 *   type: "connected"
 * }} ConnectedEvent
 */
/**
 * @callback OnConnectedCallback
 * @param {ConnectedEvent} event
 */

/**
 * @typedef {BaseEvent & {
 *   type: "disconnected"
 * }} DisconnectedEvent
 */
/**
 * @callback OnDisconnectedCallback
 * @param {DisconnectedEvent} event
 */

/**
 * @typedef {BaseEvent & {
 *   type: "isConnected",
 *   detail: {isConnected: Boolean}
 * }} IsConnectedEvent
 */
/**
 * @callback OnIsConnectedCallback
 * @param {IsConnectedEvent} event
 */

/**
 * @typedef {BaseEvent & {
 *   type: "connectionStatus",
 *   detail: {connectionStatus: ConnectionStatus}
 * }} ConnectionStatusEvent
 */
/**
 * @callback OnConnectionStatusCallback
 * @param {ConnectionStatusEvent} event
 */

/** @typedef {"topRight" | "bottomRight" | "topLeft" | "bottomLeft"} WeightPosition */
/** @type {WeightPosition[]} */
const weightPositions = ["topRight", "bottomRight", "topLeft", "bottomLeft"];

/** @type {Record<WeightPosition,Vector2>} */
const weightPositionVectors = {
  topRight: { x: 1, y: 1 },
  bottomRight: { x: 1, y: -1 },
  topLeft: { x: -1, y: 1 },
  bottomLeft: { x: -1, y: -1 },
};

/**
 * @typedef {Object} Vector2
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} WeightData
 * @property {number} netWeight
 * @property {number[]} rawWeightsArray
 * @property {number[]} weightsArray
 * @property {Record<WeightPosition, number>} weights
 * @property {Vector2} centerOfPressure
 */

/** @type {WeightData} */
const defaultWeightData = {
  weights: {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  },
  weightsArray: new Array(4).fill(0),
  rawWeightsArray: new Array(4).fill(0),
  netWeight: 0,
  centerOfPressure: { x: 0, y: 0 },
};

/**
 * @typedef {BaseEvent & {
 *   type: "weights",
 *   detail: WeightData
 * }} WeightsEvent
 */
/**
 * @callback OnWeightsCallback
 * @param {WeightsEvent} event
 */

/**
 * @typedef { ConnectionStatus |
 * "isConnected" |
 * "weights"
 * } EventType
 */

/**
 * @typedef { ConnectedEvent |
 * DisconnectedEvent |
 * IsConnectedEvent |
 * WeightsEvent
 * } Event
 */

class WiiBalanceBoard {
  // EVENT LISTENERS START
  #eventListeners = {};

  /**
   * @param {EventType} type
   * @param {CallbackOptions} options
   */
  #addEventListener(type, callback, options = {}) {
    this.#eventListeners[type] = this.#eventListeners[type] ?? [];
    this.#eventListeners[type].push({ callback, options });
  }
  /** @param {EventType} type */
  #removeEventListener(type, callback) {
    const eventListeners = this.#eventListeners[type];
    if (!eventListeners) {
      return;
    }
    const index = eventListeners.findIndex(
      (eventListener) => eventListener.callback == eventListener.callback
    );
    if (index == -1) {
      return;
    }
    eventListeners.splice(index, 1);
  }
  /** @param {EventType} type */
  #dispatchEvent(type, detail) {
    const eventListeners = this.#eventListeners[type];
    if (!eventListeners) {
      return;
    }
    this.#eventListeners[type] = eventListeners.filter(
      ({ callback, options }) => {
        callback({ type, target: this, detail });
        if (options.once) {
          return false;
        }
        return true;
      }
    );
  }
  /** @param {EventType} type */
  async waitForEvent(type) {
    return new Promise((resolve) => {
      const onceListener = (event) => {
        resolve(event);
      };
      this.#addEventListener(type, onceListener, { once: true });
    });
  }
  // EVENT LISTENERS END

  // WEBSOCKET START
  /** @type {WebSocket?} */
  #websocket;

  /** @param {globalThis.Event} */
  #onWebSocketOpen(event) {
    // console.log("onWebSocketOpen", event);
    this.#onConnect();
  }
  /** @param {MessageEvent<Blob>} event */
  async #onWebSocketMessage(event) {
    //console.log("onWebSocketMessage", event);
    const arrayBuffer = await event.data.arrayBuffer();
    const weightsArray = Array.from(new Float32Array(arrayBuffer));
    this.#onWeights(weightsArray);
  }
  /** @param {CloseEvent} event */
  #onWebSocketClose(event) {
    // console.log("onWebSocketClose", event);
    this.#onDisconnect();
  }
  /** @param {globalThis.Event} event */
  #onWebSocketError(event) {
    console.log("onWebSocketError", event);
  }
  // WEBSOCKET END

  // CONNECTION STATUS START
  get isConnected() {
    return this.#websocket?.readyState == WebSocket.OPEN;
  }

  /** @type {ConnectionStatus} */
  #connectionStatus = "not connected";
  get connectionStatus() {
    return this.#connectionStatus;
  }
  /** @param {ConnectionStatus} newConnectionStatus */
  #setConnectionStatus(newConnectionStatus) {
    if (newConnectionStatus == this.#connectionStatus) {
      return;
    }
    this.#connectionStatus = newConnectionStatus;
    console.log({ connectionStatus: newConnectionStatus });

    this.#dispatchEvent("connectionStatus", {
      connectionStatus: this.connectionStatus,
    });
    this.#dispatchEvent(this.connectionStatus);

    switch (this.#connectionStatus) {
      case "not connected":
      case "connected":
        this.#dispatchEvent("isConnected", {
          isConnected: this.isConnected,
        });
        break;
    }
  }
  // CONNECTION STATUS END

  // CONNECTION START
  async connect() {
    await this.disconnect();
    this.#setConnectionStatus("connecting");
    const promise = this.waitForEvent("connected");
    this.#websocket = new WebSocket("ws://wiibalanceboard.local/ws");
    this.#websocket.addEventListener("open", this.#onWebSocketOpen.bind(this));
    this.#websocket.addEventListener(
      "close",
      this.#onWebSocketClose.bind(this)
    );
    this.#websocket.addEventListener(
      "message",
      this.#onWebSocketMessage.bind(this)
    );
    this.#websocket.addEventListener(
      "error",
      this.#onWebSocketError.bind(this)
    );
    await promise;
  }
  async disconnect() {
    if (this.#connectionStatus == "connecting") {
      this.#setConnectionStatus("disconnecting");
      this.#websocket.close();
      this.#setConnectionStatus("not connected");
      return;
    }

    if (!this.isConnected) {
      return;
    }
    const promise = this.waitForEvent("not connected");
    this.#websocket.close();
    await promise;
  }
  async toggleConnection() {
    if (this.isConnected || this.connectionStatus == "connecting") {
      await this.disconnect();
    } else {
      await this.connect();
    }
  }
  // CONNECTION END

  // CONNECTION LISTENERS START
  async #onConnect() {
    this.#setConnectionStatus("connected");
  }
  #onDisconnect() {
    this.#setConnectionStatus("not connected");
  }

  /**
   * @param {OnConnectedCallback} callback
   * @param {CallbackOptions} options
   */
  onConnected(callback, options) {
    this.#addEventListener("connected", callback, options);
  }
  /** @param {OnConnectedCallback} callback */
  offConnected(callback) {
    this.#removeEventListener("connected", callback);
  }

  /**
   * @param {OnDisconnectedCallback} callback
   * @param {CallbackOptions} options
   */
  onDisconnected(callback, options) {
    this.#addEventListener("disconnected", callback, options);
  }
  /** @param {OnDisconnectedCallback} callback */
  offDisconnected(callback) {
    this.#removeEventListener("disconnected", callback);
  }

  /**
   * @param {OnIsConnectedCallback} callback
   * @param {CallbackOptions} options
   */
  onIsConnected(callback, options) {
    this.#addEventListener("isConnected", callback, options);
  }
  /** @param {OnIsConnectedCallback} callback */
  offIsConnected(callback) {
    this.#removeEventListener("isConnected", callback);
  }

  /**
   * @param {OnConnectionStatusCallback} callback
   * @param {CallbackOptions} options
   */
  onConnectionStatus(callback, options) {
    this.#addEventListener("connectionStatus", callback, options);
  }
  /** @param {OnConnectionStatusCallback} callback */
  offConnectionStatus(callback) {
    this.#removeEventListener("connectionStatus", callback);
  }
  // CONNECTION LISTENERS END

  // WEIGHTS START
  /** @param {number[]} rawWeightsArray */
  #onWeights(rawWeightsArray) {
    //console.log(rawWeightsArray);
    const weightsArray = rawWeightsArray.map((weight, index) => {
      return weight - this.#tareWeightsArray[index];
    });
    /** @type { Record<WeightPosition, number>} */
    const weights = {};
    weightPositions.forEach((name, index) => {
      weights[name] = weightsArray[index];
    });
    let netWeight = 0;
    weightsArray.forEach((weight) => {
      netWeight += weight;
    });
    /** @type {Vector2} */
    const centerOfPressure = { x: 0, y: 0 };
    weightPositions.forEach((name) => {
      const vector = weightPositionVectors[name];
      const weightInfluence = weights[name] / netWeight;

      centerOfPressure.x += vector.x * weightInfluence;
      centerOfPressure.y += vector.y * weightInfluence;
    });

    this.#weightData = {
      rawWeightsArray,
      netWeight,
      weightsArray,
      weights,
      centerOfPressure,
    };
    this.#dispatchEvent("weights", this.#weightData);
  }

  /**
   * @param {OnWeightsCallback} callback
   * @param {CallbackOptions} options
   */
  onWeights(callback, options) {
    this.#addEventListener("weights", callback, options);
  }
  /** @param {OnWeightsCallback} callback */
  offWeights(callback) {
    this.#removeEventListener("weights", callback);
  }

  /** @type {WeightData} */
  #weightData = structuredClone(defaultWeightData);
  get weightData() {
    return this.#weightData;
  }

  #tareWeightsArray = new Array(4).fill(0);
  tareWeight() {
    this.#tareWeightsArray = this.#weightData.rawWeightsArray.slice();
  }
  // WEIGHTS END
}

export default WiiBalanceBoard;
