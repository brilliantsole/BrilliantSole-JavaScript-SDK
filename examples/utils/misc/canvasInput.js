window.addEventListener("load", () => {
  /**
   * https://github.com/mrdoob/three.js/blob/master/src/math/MathUtils.js#L82
   * Returns the percentage in the closed interval `[0, 1]` of the given value
   * between the start and end point.
   *
   * @param {number} x - The start point
   * @param {number} y - The end point.
   * @param {number} value - A value between start and end.
   * @return {number} The interpolation factor.
   */
  function inverseLerp(x, y, value) {
    // https://www.gamedev.net/tutorials/programming/general-and-gameplay-programming/inverse-lerp-a-super-useful-yet-often-overlooked-function-r5230/

    if (x !== y) {
      return (value - x) / (y - x);
    } else {
      return 0;
    }
  }

  /**
   * https://github.com/mrdoob/three.js/blob/master/src/math/MathUtils.js#L107
   * Returns a value linearly interpolated from two known points based on the given interval -
   * `t = 0` will return `x` and `t = 1` will return `y`.
   *
   * @param {number} x - The start point
   * @param {number} y - The end point.
   * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
   * @return {number} The interpolated value.
   */
  function lerp(x, y, t) {
    return (1 - t) * x + t * y;
  }

  /**
   * https://github.com/mrdoob/three.js/blob/master/src/math/MathUtils.js#L35C1-L47C2
   * Clamps the given value between min and max.
   *
   * @param {number} value - The value to clamp.
   * @param {number} min - The min value.
   * @param {number} max - The max value.
   * @return {number} The clamped value.
   */
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  const loadCanvas = (canvas) => {
    if (!("input" in canvas.dataset)) {
      return;
    }
    const value = { x: 0, y: 0 };

    canvas.style.border = "solid";
    canvas.style.boxSizing = "border-box";

    if ("value" in canvas.dataset) {
      canvas.dataset.valueX = canvas.dataset.valueY = canvas.dataset.value;
      delete canvas.dataset.value;
    }
    if ("min" in canvas.dataset) {
      canvas.dataset.minX = canvas.dataset.minY = canvas.dataset.min;
      delete canvas.dataset.min;
    }
    if ("max" in canvas.dataset) {
      canvas.dataset.maxX = canvas.dataset.maxY = canvas.dataset.max;
      delete canvas.dataset.max;
    }

    canvas.dataset.fillStyle = canvas.dataset.fillStyle ?? "black";
    canvas.dataset.radius = canvas.dataset.radius ?? 5;

    canvas.dataset.minX = canvas.dataset.minX ?? 0;
    canvas.dataset.maxX = canvas.dataset.maxX ?? 1;

    canvas.dataset.minY = canvas.dataset.minY ?? 0;
    canvas.dataset.maxY = canvas.dataset.maxY ?? 1;

    canvas.dataset.valueX = canvas.dataset.valueX ?? 0;
    canvas.dataset.valueY = canvas.dataset.valueY ?? 0;

    const lerpValue = ({ x, y }) => {
      return {
        x: lerp(canvas.dataset.minX, canvas.dataset.maxX, x),
        y: lerp(canvas.dataset.minY, canvas.dataset.maxY, y),
      };
    };
    const inverseLerpValue = ({ x, y }) => {
      return {
        x: inverseLerp(canvas.dataset.minX, canvas.dataset.maxX, x),
        y: inverseLerp(canvas.dataset.minY, canvas.dataset.maxY, y),
      };
    };

    const context = canvas.getContext("2d");
    const draw = () => {
      context.fillStyle = canvas.dataset.fillStyle;

      context.clearRect(0, 0, canvas.width, canvas.height);
      const { x, y } = inverseLerpValue(value);
      //console.log(value, { x, y });
      context.beginPath();
      context.arc(
        canvas.width * x,
        canvas.height * (1 - y),
        canvas.dataset.radius,
        0,
        2 * Math.PI
      );
      context.fill();
    };
    draw();

    const setValue = (newValue) => {
      if (!isNaN(newValue)) {
        newValue = { x: newValue, y: newValue };
      }

      if (value.x == newValue.x && value.y == newValue.y) {
        return;
      }

      const xRange = [canvas.dataset.minX, canvas.dataset.maxX];
      value.x = clamp(newValue.x, Math.min(...xRange), Math.max(...xRange));

      const yRange = [canvas.dataset.minY, canvas.dataset.maxY];
      value.y = clamp(newValue.y, Math.min(...yRange), Math.max(...yRange));

      canvas.dataset.valueX = value.x;
      canvas.dataset.valueY = value.y;

      draw();
    };

    Object.defineProperty(canvas, "value", {
      get() {
        return value;
      },
      set(newValue) {
        setValue(newValue);
      },
      configurable: true,
      enumerable: true,
    });

    Object.defineProperty(canvas, "min", {
      get() {
        return {
          x: +canvas.dataset.minX,
          y: +canvas.dataset.minY,
        };
      },
      set(newValue) {
        if (!isNaN(newValue)) {
          newValue = { x: newValue, y: newValue };
        }
        canvas.dataset.minX = newValue.x;
        canvas.dataset.minY = newValue.y;
        draw();
      },
      configurable: true,
      enumerable: true,
    });
    Object.defineProperty(canvas, "max", {
      get() {
        return {
          x: +canvas.dataset.maxX,
          y: +canvas.dataset.maxY,
        };
      },
      set(newValue) {
        if (!isNaN(newValue)) {
          newValue = { x: newValue, y: newValue };
        }
        canvas.dataset.maxX = newValue.x;
        canvas.dataset.maxY = newValue.y;
        draw();
      },
      configurable: true,
      enumerable: true,
    });

    let isMouseDown = false;
    const setIsMouseDown = (newIsMouseDown) => {
      if (newIsMouseDown == isMouseDown) {
        return;
      }
      isMouseDown = newIsMouseDown;
      //console.log({ isMouseDown });
    };
    const dispatchEvent = () => {
      canvas.dispatchEvent(new Event("input"));
    };
    document.addEventListener("mouseup", () => {
      setIsMouseDown(false);
    });

    canvas.addEventListener("mousedown", (event) => {
      const { offsetX, offsetY } = event;
      const x = offsetX / canvas.clientWidth;
      const y = 1 - offsetY / canvas.clientHeight;
      canvas.value = lerpValue({ x, y });
      setIsMouseDown(true);
      dispatchEvent();
    });
    document.addEventListener("mousemove", (event) => {
      if (!isMouseDown) return;

      const rect = canvas.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      const x = offsetX / rect.width;
      const y = 1 - offsetY / rect.height;

      canvas.value = lerpValue({ x, y });
      dispatchEvent();
    });
  };

  document.querySelectorAll("canvas").forEach((canvas) => {
    loadCanvas(canvas);
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        // Check the node itself
        if (node.tagName === "CANVAS" && node.hasAttribute("data-input")) {
          loadCanvas(node);
        }

        // Check inside subtree (if a container was added)
        const canvases = node.querySelectorAll?.("canvas[data-input]");
        canvases?.forEach((canvas) => loadCanvas(canvas));
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
});
