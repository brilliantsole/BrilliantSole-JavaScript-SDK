{
  /** @type {Record<number, Gamepad>} */
  const gamepads = {};
  window.gamepads = gamepads;

  /**
   * @typedef GamepadThumbstick
   * @type {Object}
   * @property {number} x
   * @property {number} y
   * @property {number} angle
   * @property {number} magnitude
   */

  /** @type {Record<number, number>} */
  const gamepadTimestamps = {};
  /** @type {Record<number, number>} */
  const _gamepadTimestamp = {};
  /** @type {Record<number, number[]>} */
  const gamepadAxes = {};
  /** @type {Record<number, GamepadThumbstick[]>} */
  const gamepadThumbsticks = {};
  /** @type {Record<number, GamepadButton[]>} */
  const gamepadButtons = {};

  /**
   * @param {GamepadEvent} e
   * @param {boolean} connected
   */
  const onGamepadConnection = (e, connected) => {
    const { gamepad } = e;
    //console.log({ connected }, gamepad);
    if (connected) {
      gamepads[gamepad.index] = gamepad;
    } else {
      delete gamepads[gamepad.index];
    }

    if (Object.keys(gamepads).length > 0 && !isCheckingGamepads) {
      isCheckingGamepads = true;
      checkGamepads();
    }
  };

  const axisDifferenceThreshold = 0.0001;
  const axisThreshold = 0.02;
  const thumbstickMagnitudeThreshold = 0.03;
  const thumbstickMagnitudeDifferenceThreshold = 0.001;
  const thumbstickAngleDifferenceThreshold = 0.001;
  const buttonValueDifferenceThreshold = 0.0;
  const buttonValueThreshold = 0.0;

  /**
   * @typedef GamepadAxisChange
   * @type {Object}
   * @property {number} index
   * @property {number} value
   */
  /**
   * @typedef GamepadButtonChange
   * @type {Object}
   * @property {number} index
   * @property {number?} value
   * @property {boolean?} pressed
   * @property {boolean?} touched
   */
  /**
   * @typedef GamepadThumbstickChange
   * @type {Object}
   * @property {number} index
   * @property {number} x
   * @property {number} y
   * @property {number} angle
   * @property {number} magnitude
   */
  /**
   * @typedef GamepadChange
   * @type {Object}
   * @property {GamepadAxisChange[]} axes
   * @property {GamepadButtonChange[]} buttons
   * @property {GamepadThumbstickChange[]} thumbsticks
   */

  let isCheckingGamepads = false;
  const checkGamepads = () => {
    const gamepads = navigator.getGamepads();
    if (!gamepads.some(Boolean)) {
      return;
    }

    /** @type {Record<number, GamepadChange>} */
    const allChanges = {};
    /** @type {Record<number, GamepadChange>} */
    const allNonzeroValues = {};

    let didUpdate = false;

    navigator.getGamepads().forEach((gamepad, index) => {
      if (!gamepad) {
        return;
      }
      if (!gamepad.connected) {
        return;
      }
      if (gamepad.mapping != "standard") {
        return;
      }
      const { timestamp } = gamepad;
      if (gamepadTimestamps[index] == timestamp) {
        return;
      }
      gamepadTimestamps[index] = timestamp;

      const timestampDelta = timestamp - _gamepadTimestamp[index] ?? 0;
      _gamepadTimestamp[index] = timestamp;

      didUpdate = true;

      const axes = gamepad.axes.map((value, index) => {
        if (Math.abs(value) < axisThreshold) {
          return 0;
        }
        const sign = index % 2 ? -1 : 1;
        return value * sign;
      });
      const _axes = gamepadAxes[index] ?? axes.slice().fill(0);

      /** @type {GamepadAxisChange[]} */
      const changedAxes = [];
      axes.forEach((value, index) => {
        const axisDifference = Math.abs(value - _axes[index]);
        //console.log({ axisDifference });
        if (axisDifference > axisDifferenceThreshold) {
          changedAxes.push({ index, value });
        }
      });
      if (false && changedAxes.length > 0) {
        console.log("changedAxes", ...changedAxes);
      }
      gamepadAxes[index] = axes;

      /** @type {GamepadAxisChange[]} */
      const nonzeroAxes = [];
      axes.forEach((value, index) => {
        if (value != 0) {
          nonzeroAxes.push({ index, value });
        }
      });
      if (false && nonzeroAxes.length > 0) {
        console.log("nonzeroAxes", ...nonzeroAxes);
      }

      /** @type {GamepadThumbstick[]} */
      const thumbsticks = [];
      gamepad.axes.forEach((axis, axisIndex, axes) => {
        if (axisIndex % 2) {
          return;
        }
        const x = axis;
        const y = -axes[axisIndex + 1];
        let magnitude = Math.sqrt(x ** 2 + y ** 2);
        if (magnitude < thumbstickMagnitudeThreshold) {
          magnitude = 0;
        }
        let angle = magnitude > 0 ? Math.atan2(y, x) : 0;
        if (angle < 0) angle += 2 * Math.PI;
        angle = (180 * angle) / Math.PI;
        thumbsticks.push({ x, y, angle, magnitude });
      });
      const _thumbsticks =
        gamepadThumbsticks[index] ??
        thumbsticks.map(() => ({ x: 0, y: 0, angle: 0, magnitude: 0 }));
      /** @type {GamepadThumbstickChange[]} */
      const changedThumbsticks = [];
      thumbsticks.forEach((thumbstick, index) => {
        const _thumbstick = _thumbsticks[index];

        const angleDifference = Math.abs(thumbstick.angle - _thumbstick.angle);
        const magnitudeDifference = Math.abs(
          thumbstick.magnitude - _thumbstick.magnitude
        );
        //console.log({ angleDifference, magnitudeDifference });
        if (
          angleDifference > thumbstickAngleDifferenceThreshold ||
          magnitudeDifference > thumbstickMagnitudeDifferenceThreshold
        ) {
          changedThumbsticks.push({ ..._thumbstick, index });
        }
      });
      if (false && changedThumbsticks.length > 0) {
        console.log("changedThumbsticks", ...changedThumbsticks);
      }
      gamepadThumbsticks[index] = thumbsticks;

      /** @type {GamepadThumbstickChange[]} */
      const nonzeroThumbsticks = [];
      thumbsticks.forEach((thumbstick, index) => {
        if (thumbstick.magnitude > 0) {
          nonzeroThumbsticks.push({ ...thumbstick, index });
        }
      });
      if (false && nonzeroThumbsticks.length > 0) {
        console.log("nonzeroThumbsticks", ...nonzeroThumbsticks);
      }

      const buttons = gamepad.buttons.map((button) => {
        let { pressed, touched, value } = button;
        value = Math.abs(value) < buttonValueThreshold ? 0 : value;
        return { pressed, touched, value };
      });
      const _buttons =
        gamepadButtons[index] ??
        buttons.map(() => ({ pressed: false, touched: false, value: 0 }));

      /** @type {GamepadButtonChange[]} */
      const changedButtons = [];
      buttons.forEach((button, index) => {
        const changedButton = { index };
        let didButtonChange = false;

        const _button = _buttons[index];

        if (button.pressed != _button.pressed) {
          didButtonChange = true;
          changedButton.pressed = button.pressed;
        }

        if (button.touched != _button.touched) {
          didButtonChange = true;
          changedButton.touched = button.touched;
        }

        const valueDifference = Math.abs(button.value - _button.value);
        //console.log({ valueDifference });
        if (valueDifference > buttonValueDifferenceThreshold) {
          didButtonChange = true;
          changedButton.value = button.value;
        }

        if (didButtonChange) {
          changedButtons.push(changedButton);
        }
      });
      if (false && changedButtons.length > 0) {
        console.log("changedButtons", ...changedButtons);
      }
      gamepadButtons[index] = buttons;

      /** @type {GamepadButtonChange[]} */
      const nonzeroButtons = [];
      buttons.forEach((button, index) => {
        const nonzeroButton = { index };
        let isButtonNonzero = false;

        if (button.touched) {
          isButtonNonzero = true;
          nonzeroButton.touched = button.touched;
        }

        if (button.value > 0) {
          isButtonNonzero = true;
          nonzeroButton.value = button.value;
        }

        if (button.pressed) {
          isButtonNonzero = true;
          nonzeroButton.pressed = button.pressed;
        }

        if (isButtonNonzero) {
          nonzeroButtons.push(nonzeroButton);
        }
      });
      if (false && nonzeroButtons.length > 0) {
        console.log("nonzeroButtons", ...nonzeroButtons);
      }

      if (changedAxes.length > 0 || changedButtons.length > 0) {
        allChanges[index] = {};
        if (changedAxes.length > 0) {
          allChanges[index].axes = changedAxes;
        }
        if (changedButtons.length > 0) {
          allChanges[index].buttons = changedButtons;
        }
        if (changedThumbsticks.length > 0) {
          allChanges[index].thumbsticks = changedThumbsticks;
        }
      }

      if (nonzeroAxes.length > 0 || nonzeroButtons.length > 0) {
        allNonzeroValues[index] = {};
        if (nonzeroAxes.length > 0) {
          allNonzeroValues[index].axes = nonzeroAxes;
        }
        if (nonzeroButtons.length > 0) {
          allNonzeroValues[index].buttons = nonzeroButtons;
        }
        if (nonzeroThumbsticks.length > 0) {
          allNonzeroValues[index].thumbsticks = nonzeroThumbsticks;
        }
      }
    });

    if (didUpdate) {
      Object.entries(allChanges).forEach(
        ([index, { buttons, axes, thumbsticks }]) => {
          const gamepad = gamepads[index];
          index = +index;
          axes?.forEach((axisChange) => {
            window.dispatchEvent(
              new CustomEvent("gamepadaxischange", {
                detail: { gamepadIndex: index, gamepad, axisChange },
              })
            );
          });
          buttons?.forEach((buttonChange) => {
            window.dispatchEvent(
              new CustomEvent("gamepadbuttonchange", {
                detail: { index, gamepad, buttonChange },
              })
            );
          });
          thumbsticks?.forEach((thumbstickChange) => {
            window.dispatchEvent(
              new CustomEvent("gamepadthumbstickchange", {
                detail: { index, gamepad, thumbstickChange },
              })
            );
          });
        }
      );
    }

    navigator.getGamepads().forEach((gamepad, index) => {
      if (!gamepad) {
        return;
      }
      if (!gamepad.connected) {
        return;
      }
      if (gamepad.mapping != "standard") {
        return;
      }
      const { timestamp } = gamepad;
      window.dispatchEvent(
        new CustomEvent("gamepadtick", {
          detail: {
            index,
            gamepad,
            timestamp,
            axes: gamepadAxes[index],
            thumbsticks: gamepadThumbsticks[index],
          },
        })
      );
    });
    requestAnimationFrame(checkGamepads);
  };

  window.addEventListener("gamepadconnected", (e) => {
    onGamepadConnection(e, true);
  });
  window.addEventListener("gamepaddisconnected", (e) => {
    onGamepadConnection(e, false);
  });
}
