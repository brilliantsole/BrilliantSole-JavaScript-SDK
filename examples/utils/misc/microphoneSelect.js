window.addEventListener("load", () => {
  /** @param {HTMLSelectElement} select */
  const loadSelect = async (select) => {
    if (!("microphone" in select.dataset)) {
      return;
    }
    //console.log("loadSelect", select);

    const properties = {
      // FILL - extend with more properties
    };

    const addProperty = (name, defaultValue, isFirstLoad) => {
      properties[name] = select.dataset[name] ?? defaultValue;
      if (isFirstLoad) {
        select.dataset[name] = properties[name];
      }
      //console.log({ [name]: properties[name] });
      const setValue = (newValue, updateDataset) => {
        properties[name] = newValue;
        const detail = { [name]: properties[name] };
        //console.log(detail);
        select.dispatchEvent(new CustomEvent(`microphone-${name}`, { detail }));
        if (updateDataset) {
          select.dataset[name] = properties[name];
        }
      };
      Object.defineProperty(select, name, {
        get() {
          return properties[name];
        },
        set(newValue) {
          setValue(newValue);
        },
        configurable: true,
        enumerable: true,
      });
    };
    Object.entries(properties).forEach(([name, defaultValue]) =>
      addProperty(name, defaultValue, true)
    );

    const optgroup = document.createElement("optgroup");
    select.appendChild(optgroup);
    optgroup.label = "select microphone";

    const getDevices = async () => {
      let devices = await navigator.mediaDevices.enumerateDevices();
      devices = devices.filter((device) => device.kind == "videoinput");
      //console.log("devices", devices);
      return devices;
    };

    /** @type {MediaStream?} */
    let stream;
    const stopStream = async () => {
      // console.log("stopStream");
      if (!stream) {
        return;
      }
      stream.getTracks().forEach((track) => track.stop());
      select.dispatchEvent(new CustomEvent("microphoneStreamStop"));
      stream = undefined;
    };
    const getStream = async (deviceId) => {
      await stopStream();
      //console.log("getStream", { deviceId });
      if (deviceId == "none") {
        return;
      }
      stream = await navigator.mediaDevices.getUserMedia({
        target: select,
        video: {
          ...properties,
          deviceId: { exact: deviceId },
        },
      });
      select.dispatchEvent(
        new CustomEvent("microphoneStreamStart", {
          detail: { microphoneStream: stream, deviceId },
        })
      );
    };

    const updateMicrophoneSources = async () => {
      //console.log("updateMicrophoneSources");
      const devices = await getDevices();
      optgroup.innerHTML = "";
      optgroup.appendChild(new Option("none"));
      devices.forEach((device) => {
        optgroup.appendChild(new Option(device.label, device.deviceId));
      });
      select.value = "none";
      select.dispatchEvent(
        new CustomEvent("microphoneDevices", {
          detail: { microphoneDevices: devices },
        })
      );
      //getStream(select.value);
    };

    select.addEventListener("click", async () => {
      const devices = await getDevices();
      if (devices.length == 1 && devices[0].deviceId == "") {
        console.log("getting microphone");
        await getStream();
        await stopStream();
        updateMicrophoneSources();
      }
    });

    navigator.mediaDevices.addEventListener("devicechange", () => {
      updateMicrophoneSources();
    });

    updateMicrophoneSources();

    select.addEventListener("input", (event) => {
      getStream(event.target.value);
    });
  };

  document.querySelectorAll("select").forEach((select) => {
    loadSelect(select);
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        // Check the node itself
        if (node.tagName === "SELECT" && node.hasAttribute("data-microphone")) {
          loadSelect(node);
        }

        // Check inside subtree (if a container was added)
        const selects = node.querySelectorAll?.("select[data-microphone]");

        selects?.forEach((select) => loadSelect(select));
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
});
