window.addEventListener("load", () => {
  const loadButton = (button) => {
    if (!("pointerLock" in button.dataset)) {
      return;
    }
    //console.log("loadButton", button);

    let isPointerLocked = false;
    const setIsPointerLocked = (newIsPointerLocked) => {
      isPointerLocked = newIsPointerLocked;
      //   console.log({ isPointerLocked });
      updateButtonText();
      button.dispatchEvent(
        new CustomEvent("isPointerLocked", { detail: { isPointerLocked } })
      );
    };

    let usePointerAsToggle = button.dataset.toggle ?? false;
    const setUsePointerAsToggle = (newUsePointerAsToggle) => {
      usePointerAsToggle = newUsePointerAsToggle;
      // console.log({ usePointerAsToggle });
      button.dispatchEvent(
        new CustomEvent("usePointerAsToggle", {
          detail: { usePointerAsToggle },
        })
      );
    };

    let isPointerDown = false;
    const setIsPointerDown = (newIsPointerDown) => {
      isPointerDown = newIsPointerDown;
      //   console.log({ isPointerDown });
      updateButtonText();
      button.dispatchEvent(
        new CustomEvent("isPointerDown", { detail: { isPointerDown } })
      );
    };

    Object.defineProperty(button, "isPointerLocked", {
      get() {
        return isPointerLocked;
      },
      set(newValue) {
        setIsPointerLocked(newValue);
      },
      configurable: true,
      enumerable: true,
    });
    Object.defineProperty(button, "isPointerDown", {
      get() {
        return isPointerDown;
      },
      set(newValue) {
        setIsPointerDown(newValue);
      },
      configurable: true,
      enumerable: true,
    });
    Object.defineProperty(button, "usePointerAsToggle", {
      get() {
        return usePointerAsToggle;
      },
      set(newValue) {
        setUsePointerAsToggle(newValue);
      },
      configurable: true,
      enumerable: true,
    });

    button.addEventListener("click", async () => {
      if (isPointerLocked) {
        return;
      }
      button.requestPointerLock();
    });

    button.addEventListener("mousedown", () => {
      if (!isPointerLocked) {
        return;
      }
      if (usePointerAsToggle) {
        setIsPointerDown(!isPointerDown);
      } else {
        setIsPointerDown(true);
      }
    });
    button.addEventListener("mouseup", () => {
      if (usePointerAsToggle) {
      } else {
        setIsPointerDown(false);
      }
    });
    button.addEventListener("mousemove", (event) => {
      if (!isPointerLocked) {
        return;
      }
      if (!isPointerDown) {
        return;
      }
      const { movementX, movementY } = event;
      const value = {
        x: movementX,
        y: movementY,
      };
      button.dispatchEvent(new CustomEvent("input", { detail: value }));
    });

    const updateButtonText = () => {
      let innerText = "";
      if (isPointerLocked) {
        innerText = isPointerDown ? "pointer down" : "pointer locked";
      } else {
        innerText = "lock pointer";
      }
      button.innerText = innerText;
    };
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === button) {
        setIsPointerLocked(true);
      } else {
        setIsPointerLocked(false);
      }
    });
  };

  document.querySelectorAll("button").forEach((button) => {
    loadButton(button);
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        // Check the node itself
        if (
          node.tagName === "BUTTON" &&
          node.hasAttribute("data-pointer-lock")
        ) {
          loadButton(node);
        }

        // Check inside subtree (if a container was added)
        const buttons = node.querySelectorAll?.("button[data-pointer-lock]");

        buttons?.forEach((button) => loadButton(button));
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
});
