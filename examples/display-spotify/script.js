import * as BS from "../../build/brilliantsole.module.js";

// DEVICE
const device = new BS.Device();
window.device = device;
window.BS = BS;

// CONNECT

const toggleConnectionButton = document.getElementById("toggleConnection");
toggleConnectionButton.addEventListener("click", () =>
  device.toggleConnection()
);
device.addEventListener("connectionStatus", () => {
  let disabled = false;
  let innerText = device.connectionStatus;
  switch (device.connectionStatus) {
    case "notConnected":
      innerText = "connect";
      break;
    case "connected":
      innerText = "disconnect";
      break;
  }
  toggleConnectionButton.disabled = disabled;
  toggleConnectionButton.innerText = innerText;
});

// CANVAS
/** @type {HTMLCanvasElement} */
const displayCanvas = document.getElementById("display");

// DISPLAY CANVAS HELPER
const displayCanvasHelper = new BS.DisplayCanvasHelper();
// displayCanvasHelper.setBrightness("veryLow");
displayCanvasHelper.canvas = displayCanvas;
window.displayCanvasHelper = displayCanvasHelper;

device.addEventListener("connected", () => {
  if (device.isDisplayAvailable) {
    displayCanvasHelper.device = device;
  } else {
    console.error("device doesn't have a display");
    device.disconnect();
  }
});

// BRIGHTNESS
/** @type {HTMLSelectElement} */
const setDisplayBrightnessSelect = document.getElementById(
  "setDisplayBrightnessSelect"
);
/** @type {HTMLOptGroupElement} */
const setDisplayBrightnessSelectOptgroup =
  setDisplayBrightnessSelect.querySelector("optgroup");
BS.DisplayBrightnesses.forEach((displayBrightness) => {
  setDisplayBrightnessSelectOptgroup.appendChild(new Option(displayBrightness));
});
setDisplayBrightnessSelect.addEventListener("input", () => {
  displayCanvasHelper.setBrightness(setDisplayBrightnessSelect.value);
});

setDisplayBrightnessSelect.value = displayCanvasHelper.brightness;

// COLORS

/** @type {HTMLTemplateElement} */
const displayColorTemplate = document.getElementById("displayColorTemplate");
const displayColorsContainer = document.getElementById("displayColors");
const setDisplayColor = BS.ThrottleUtils.throttle(
  (colorIndex, colorString) => {
    console.log({ colorIndex, colorString });
    displayCanvasHelper.setColor(colorIndex, colorString, true);
  },
  100,
  true
);
/** @type {HTMLInputElement[]} */
const displayColorInputs = [];
const setupColors = () => {
  displayColorsContainer.innerHTML = "";
  for (
    let colorIndex = 0;
    colorIndex < displayCanvasHelper.numberOfColors;
    colorIndex++
  ) {
    const displayColorContainer = displayColorTemplate.content
      .cloneNode(true)
      .querySelector(".displayColor");

    const colorInput = displayColorContainer.querySelector(".color");
    displayColorInputs[colorIndex] = colorInput;
    colorInput.addEventListener("input", () => {
      setDisplayColor(colorIndex, colorInput.value);
    });

    displayColorsContainer.appendChild(displayColorContainer);
  }
};
displayCanvasHelper.addEventListener("numberOfColors", () => setupColors());
displayCanvasHelper.addEventListener("color", (event) => {
  const { colorHex, colorIndex } = event.message;
  displayColorInputs[colorIndex].value = colorHex;
});
setupColors();
const getImageNumberOfColors = () => displayCanvasHelper.numberOfColors - 3;
const getTextColorIndex = () => displayCanvasHelper.numberOfColors - 1;
const getCurrentTextBackgroundColorIndex = () =>
  displayCanvasHelper.numberOfColors - 2;
const getTextBackgroundColorIndex = () =>
  displayCanvasHelper.numberOfColors - 3;
displayCanvasHelper.setColor(getTextColorIndex(), "white");
displayCanvasHelper.setColor(getCurrentTextBackgroundColorIndex(), "green");
displayCanvasHelper.setColor(getTextBackgroundColorIndex(), "#004700");
displayCanvasHelper.flushContextCommands();

// DRAW
let isDrawing = false;
let isUpdated = true;
let isWaitingToRedraw = false;

let isUploading = false;
displayCanvasHelper.addEventListener("deviceSpriteSheetUploadStart", () => {
  isUploading = true;
  console.log({ isUploading });
});
displayCanvasHelper.addEventListener("deviceSpriteSheetUploadComplete", () => {
  isUploading = false;
  console.log({ isUploading });
});
displayCanvasHelper.addEventListener("deviceConnected", () => {
  isUpdated = false;
  console.log({ isUpdated });
});
displayCanvasHelper.addEventListener("deviceUpdated", () => {
  isUpdated = true;
  console.log({ isUpdated });
  draw();
});
let trackStringOffsetX = 0;
let trackStringOffsetXScalar = 0.01;
let lastTrackStringOffsetXUpdate = 0;
let didLoad = false;
const timelineHeight = 38;
const lineDurationTimerWidth = 50;
let lyricSpacing = 40;
let lyricAnimationDuration = 600;
let trackString = "";
let trackMetrics;
const interpolate = (from, to, interpolation) => {
  return from + interpolation * (to - from);
};
let lyricsOffsetY = 0;
const draw = async () => {
  if (isUploading) {
    console.warn("can't draw - isUploading");
    return;
  }
  if (!isUpdated) {
    console.warn("can't draw - !isUpdated");
    return;
  }
  if (!didLoad) {
    console.warn("can't draw - hasn't loaded yet");
    return;
  }
  if (!spotifyPlayer || !spotifyState) {
    console.warn("can't draw - !spotifyPlayer or !spotifyState");
    return;
  }
  if (isDrawing) {
    //console.warn("busy drawing");
    isWaitingToRedraw = true;
    return;
  }
  isDrawing = true;

  //console.log("drawing...");

  if (spotifyState) {
    const { current_track } = spotifyState.track_window;

    const artistName = current_track.artists[0].name;
    const trackName = current_track.name;
    const albumName = current_track.album.name;
    // console.log({ timelineInterpolation, spotifyPosition, duration });
    // console.log({ artistName, trackName, albumName });
    // console.log({ duration, spotifyPosition, spotifyPaused });

    if (syncedLyrics && !isUpdatingNonEnglishCharacters) {
      const currentLyric = syncedLyrics[currentSpotifyLyricsLineIndex];
      const nextLyric = syncedLyrics[currentSpotifyLyricsLineIndex + 1];
      const nextNextLyric = syncedLyrics[currentSpotifyLyricsLineIndex + 2];

      // console.log("currentLyric", currentLyric);
      // console.log("nextLyric", nextLyric);
      // console.log("nextNextLyric", nextNextLyric);

      let nextNextLyricLine, currentLyricLine, nextLyricLine;
      let nextNextLyricSize, currentLyricSize, nextLyricSize;
      let nextNextLyricY, currentLyricY, nextLyricY;

      if (currentLyric) {
        await displayCanvasHelper.setSpriteScale(1.1); // FIX
        await displayCanvasHelper.saveContext();
      }

      const maxLyricWidth =
        displayCanvasHelper.width - lineDurationTimerWidth - 16;

      lyricSpacing = spritesLineHeight;

      let lyricInterpolationOffsetY = lyricSpacing;
      let currentLyricMetrics;
      if (currentLyric) {
        currentLyricLine =
          useCustomNoteSprite && currentLyric.line == noteCharacter
            ? currentLyric.line
            : currentLyric.line + " ";

        currentLyricMetrics = displayCanvasHelper.stringToSpriteLinesMetrics(
          currentLyricLine,
          false,
          maxLyricWidth
        );
        currentLyricSize = currentLyricMetrics.size;
        lyricInterpolationOffsetY += currentLyricSize.height / 2;
      }

      if (nextLyric) {
        nextLyricLine =
          useCustomNoteSprite && nextLyric.line == noteCharacter
            ? nextLyric.line
            : nextLyric.line + " ";

        const nextLyricMetrics = displayCanvasHelper.stringToSpriteLinesMetrics(
          nextLyricLine,
          false,
          maxLyricWidth
        );
        nextLyricSize = nextLyricMetrics.size;
        lyricInterpolationOffsetY += nextLyricSize.height / 2;
      }

      if (nextNextLyric) {
        nextNextLyricLine =
          useCustomNoteSprite && nextNextLyric.line == noteCharacter
            ? nextNextLyric.line
            : nextNextLyric.line + " ";

        const nextNextLyricMetrics =
          displayCanvasHelper.stringToSpriteLinesMetrics(
            nextNextLyricLine,
            false,
            maxLyricWidth
          );
        nextNextLyricSize = nextNextLyricMetrics.size;
      }

      const lyricOffsetY =
        (spritesLineHeight / 2) * currentLyricMetrics.numberOfLines;

      if (currentLyric) {
        //console.log("currentLyric", currentLyric);
        //console.log("nextLyric", nextLyric);

        const lyricInterpolation =
          (spotifyPosition - currentLyric.timestamp) / currentLyric.duration;
        const arcLyricInterpolation = Math.max(
          0,
          Math.min(
            1,
            (spotifyPosition - currentLyric.timestamp) /
              (currentLyric.duration - lyricAnimationDuration / 2)
          )
        );

        //console.log({ lyricInterpolation });

        await displayCanvasHelper.setFillBackground(true);

        await displayCanvasHelper.selectSpriteColor(1, getTextColorIndex());

        const centerX = displayCanvasHelper.width / 2;

        const timeUntilEndOfLyric = currentLyric.endTimestamp - spotifyPosition;
        let lyricAnimationInterpolation = 0;
        const isAnimatingLyric = timeUntilEndOfLyric < lyricAnimationDuration;

        if (isAnimatingLyric) {
          lyricAnimationInterpolation =
            1 -
            Math.max(
              0,
              Math.min(1, timeUntilEndOfLyric / lyricAnimationDuration)
            );
          lyricAnimationInterpolation **= 2;
          //console.log({ lyricAnimationInterpolation });
          lyricInterpolationOffsetY = interpolate(
            0,
            lyricInterpolationOffsetY,
            lyricAnimationInterpolation
          );
        } else {
          lyricInterpolationOffsetY = 0;
        }

        let drawCurrentLyric = async () => {};
        let drawNextLyric = async () => {};
        let drawNextNextLyric = async () => {};

        const lyricX = centerX - lineDurationTimerWidth / 2 - 4;
        currentLyricY = lyricOffsetY;

        drawCurrentLyric = async () => {
          await displayCanvasHelper.drawSpritesString(
            lyricX,
            currentLyricY - lyricInterpolationOffsetY + lyricsOffsetY,
            currentLyricLine,
            false,
            maxLyricWidth
          );
        };

        if (nextLyric) {
          nextLyricY =
            currentLyricY +
            currentLyricSize.height / 2 +
            nextLyricSize.height / 2 +
            lyricSpacing;

          drawNextLyric = async () => {
            await displayCanvasHelper.drawSpritesString(
              lyricX,
              nextLyricY - lyricInterpolationOffsetY + lyricsOffsetY,
              nextLyricLine,
              false,
              maxLyricWidth
            );
          };
        }

        if (nextNextLyric && isAnimatingLyric) {
          nextNextLyricY =
            currentLyricY +
            currentLyricSize.height / 2 +
            nextLyricSize.height +
            nextNextLyricSize.height / 2 +
            lyricSpacing * 2;

          drawNextNextLyric = async () => {
            await displayCanvasHelper.drawSpritesString(
              lyricX,
              nextNextLyricY - lyricInterpolationOffsetY + lyricsOffsetY,
              nextNextLyricLine,
              false,
              maxLyricWidth
            );
          };
        }

        await displayCanvasHelper.selectBackgroundColor(
          getCurrentTextBackgroundColorIndex()
        );
        await displayCanvasHelper.selectSpriteColor(
          0,
          getCurrentTextBackgroundColorIndex()
        );
        if (isAnimatingLyric) {
          await drawNextLyric();
        } else {
          await drawCurrentLyric();
        }
        await displayCanvasHelper.selectBackgroundColor(
          getTextBackgroundColorIndex()
        );
        await displayCanvasHelper.selectSpriteColor(
          0,
          getTextBackgroundColorIndex()
        );
        if (isAnimatingLyric) {
          await drawCurrentLyric();
          await drawNextNextLyric();
        } else {
          await drawNextLyric();
          await drawNextNextLyric();
        }

        await displayCanvasHelper.restoreContext();

        if (!isSpotifyTimeInputChanging) {
          await displayCanvasHelper.selectLineColor(getTextColorIndex());
          await displayCanvasHelper.setLineWidth(8);
          await displayCanvasHelper.setIgnoreFill(true);
          await displayCanvasHelper.drawArc(
            centerX +
              (false && isAnimatingLyric
                ? nextLyricSize.width
                : currentLyricSize.width) /
                2 +
              8,
            lyricsOffsetY +
              (false && isAnimatingLyric ? nextLyricY : currentLyricY) -
              lyricInterpolationOffsetY,
            lineDurationTimerWidth / 2 - 4,
            -90,
            arcLyricInterpolation * 360
          );
        }
      }
    }

    if (!isUpdatingNonEnglishCharacters) {
      await displayCanvasHelper.saveContext();
      await displayCanvasHelper.selectSpriteColor(1, getTextColorIndex());
      await displayCanvasHelper.selectSpriteColor(0, 0);
      await displayCanvasHelper.setFillBackground(false);

      await displayCanvasHelper.setHorizontalAlignment("start");
      await displayCanvasHelper.setVerticalAlignment("end");
      await displayCanvasHelper.setSpriteScale(fontScale);
      const trackStringMaxWidth =
        displayCanvasHelper.width - (imageHeight + imagePadding);
      const isTrackStringTooWide =
        trackMetrics.size.width > trackStringMaxWidth;
      // console.log({ isTrackStringTooWide });

      if (isTrackStringTooWide) {
        const now = Date.now();
        let timeSinceLastTrackStringOffsetXUpdate =
          now - lastTrackStringOffsetXUpdate;
        const isEarly = timeSinceLastTrackStringOffsetXUpdate < 0;
        timeSinceLastTrackStringOffsetXUpdate = Math.max(
          0,
          timeSinceLastTrackStringOffsetXUpdate
        );
        trackStringOffsetX +=
          timeSinceLastTrackStringOffsetXUpdate * trackStringOffsetXScalar;
        let isDoneMoving =
          trackStringOffsetX >=
          trackMetrics.size.width - trackStringMaxWidth + 50;
        trackStringOffsetX = Math.min(
          trackStringOffsetX,
          trackMetrics.size.width - trackStringMaxWidth + 50
        );
        // console.log({ isDoneMoving, timeSinceLastTrackStringOffsetXUpdate });
        if (isDoneMoving && timeSinceLastTrackStringOffsetXUpdate > 2000) {
          trackStringOffsetX = 0;
          isDoneMoving = false;
        }
        if (!isEarly && !isDoneMoving) {
          lastTrackStringOffsetXUpdate = now;
        }
      }
      await displayCanvasHelper.drawSpritesString(
        imageHeight + imagePadding - trackStringOffsetX,
        displayCanvasHelper.height - timelineHeight - 10,
        trackString
      );
      await displayCanvasHelper.restoreContext();
    }

    {
      await displayCanvasHelper.saveContext();
      await displayCanvasHelper.resetSpriteScale();
      await displayCanvasHelper.resetSpriteColors();
      await displayCanvasHelper.selectSpriteColor(1, getTextColorIndex());
      await displayCanvasHelper.selectSpriteColor(
        2,
        getCurrentTextBackgroundColorIndex()
      );
      // await displayCanvasHelper.selectBackgroundColor(1);
      // await displayCanvasHelper.setFillBackground(true);
      await displayCanvasHelper.setHorizontalAlignment("start");
      await displayCanvasHelper.setVerticalAlignment("end");
      const spriteWidth =
        displayCanvasHelper.width - imageHeight - imagePadding - 10;
      const spriteHeight = timelineHeight;
      await displayCanvasHelper.startSprite(
        imageHeight + imagePadding,
        displayCanvasHelper.height - 6,
        spriteWidth,
        38
      );
      await displayCanvasHelper.setHorizontalAlignment("start");

      const width = spriteWidth - 6;
      const height = spriteHeight - 8;
      const x = -width / 2;
      await displayCanvasHelper.selectFillColor(
        spotifyPaused || isSpotifyTimeInputChanging ? 1 : 2
      );
      await displayCanvasHelper.drawRect(
        x + 3,
        0,
        width * timelineInterpolation,
        height - 6
      );
      await displayCanvasHelper.setLineWidth(6);
      await displayCanvasHelper.setIgnoreFill(true);
      await displayCanvasHelper.drawRoundRect(x - 2, 0, width, height, 10);

      await displayCanvasHelper.endSprite();
      await displayCanvasHelper.restoreContext();
    }

    if (didUploadSpotifyAlbumArt && displayCanvasHelper.spriteSheets["album"]) {
      //console.log("drawing album art...");
      await displayCanvasHelper.saveContext();
      await displayCanvasHelper.setHorizontalAlignment("start");
      await displayCanvasHelper.setVerticalAlignment("end");
      await displayCanvasHelper.selectSpriteSheet("album");
      await displayCanvasHelper.selectSpriteSheetPalette("album", 0, true);
      await displayCanvasHelper.setSpriteScale(1);
      await displayCanvasHelper.drawSprite(
        0,
        displayCanvasHelper.height,
        "image"
      );
      await displayCanvasHelper.selectSpriteSheetPalette("album", 0);
      await displayCanvasHelper.restoreContext();
    }
  }

  await displayCanvasHelper.show();
};
window.draw = draw;

displayCanvasHelper.addEventListener("ready", () => {
  //console.log("ready");
  isDrawing = false;
  if (isWaitingToRedraw) {
    //console.log("redrawing...");
    isWaitingToRedraw = false;
    draw();
  }
});

// PROGRESS

/** @type {HTMLProgressElement} */
const fileTransferProgress = document.getElementById("fileTransferProgress");

device.addEventListener("fileTransferProgress", (event) => {
  const progress = event.message.progress;
  //console.log({ progress });
  fileTransferProgress.value = progress == 1 ? 0 : progress;
});
device.addEventListener("fileTransferStatus", () => {
  if (device.fileTransferStatus == "idle") {
    fileTransferProgress.value = 0;
  }
});

// PASTE
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

window.addEventListener("paste", (event) => {
  if (!spotifyPlayer) {
    return;
  }
  const string = event.clipboardData.getData("text");
  console.log({ string });
  if (isValidUrl(string)) {
    const url = new URL(string);
    if (url.host == "open.spotify.com") {
      const path = url.pathname.split("/").filter(Boolean);
      if (path.length == 2 && path[0] == "track") {
        playSpotifySong(path[1]);
      }
    }
  }
});

async function playSpotifySong(trackId) {
  if (!spotifyPlayer) {
    return;
  }
  if (!spotifyAccessToken) {
    return;
  }
  if (!spotifyDeviceId) {
    return;
  }
  const response = await fetch(
    `https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
      body: JSON.stringify({
        uris: [`spotify:track:${trackId}`],
      }),
    }
  );

  if (response.ok) {
    console.log("Playback started successfully.");
  } else {
    const errorData = await response.json();
    console.error("Error starting playback:", errorData);
  }
}

// SPOTIFY

const spotifyToggleAuthorizationButton = document.getElementById(
  "spotifyToggleAuthorization"
);
const updateSpotifyAuthorizeButton = () => {
  const enabled =
    spotifyAccessToken ||
    (spotifyClientId?.length == spotifyClientIdLength &&
      spotifyClientSecret?.length == spotifyClientSecretLength);
  spotifyToggleAuthorizationButton.disabled = !enabled;
  spotifyToggleAuthorizationButton.innerText = spotifyAccessToken
    ? "relogin to spotify"
    : "login to spotify";
};
const spotifyScopes = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
  "user-read-email",
  "user-read-private",
];
const spotifyRedirectUrl =
  location.origin.replace("localhost", "127.0.0.1") + location.pathname;
console.log({ spotifyRedirectUrl });
spotifyToggleAuthorizationButton.addEventListener("click", () => {
  const authUrl =
    `https://accounts.spotify.com/authorize` +
    `?response_type=code` +
    `&client_id=${encodeURIComponent(spotifyClientId)}` +
    `&scope=${encodeURIComponent(spotifyScopes.join(" "))}` +
    `&redirect_uri=${encodeURIComponent(spotifyRedirectUrl)}`;
  console.log({ authUrl });
  window.open(authUrl, "_blank").focus();
  //window.location = authUrl;
});

let spotifyClientId = "";
const spotifyClientIdLength = 32;
const spotifyClientIdInput = document.getElementById("spotifyClientId");
spotifyClientIdInput.addEventListener("input", () => {
  setSpotifyClientId(spotifyClientIdInput.value);
});
const setSpotifyClientId = (newSpotifyClientId) => {
  spotifyClientId = newSpotifyClientId;
  console.log({ spotifyClientId });
  spotifyClientIdInput.value = spotifyClientId;
  if (spotifyClientId?.length == spotifyClientIdLength) {
    localStorage.setItem("spotifyClientId", spotifyClientId);
  }
  if (didLoad) {
    updateSpotifyAuthorizeButton();
  }
};
setSpotifyClientId(localStorage.getItem("spotifyClientId") ?? "");

let spotifyClientSecret = "";
const spotifyClientSecretLength = 32;
const spotifyClientSecretInput = document.getElementById("spotifyClientSecret");
spotifyClientSecretInput.addEventListener("input", () => {
  setSpotifyClientSecret(spotifyClientSecretInput.value);
});
const setSpotifyClientSecret = (newSpotifyClientSecret) => {
  spotifyClientSecret = newSpotifyClientSecret;
  console.log({ spotifyClientSecret });
  spotifyClientSecretInput.value = spotifyClientSecret;
  if (spotifyClientSecret?.length == spotifyClientSecretLength) {
    localStorage.setItem("spotifyClientSecret", spotifyClientSecret);
  }
  if (didLoad) {
    updateSpotifyAuthorizeButton();
  }
};
setSpotifyClientSecret(localStorage.getItem("spotifyClientSecret") ?? "");

let spotifyAccessToken = "";
const setSpotifyAccessToken = (newSpotifyAccessToken) => {
  spotifyAccessToken = newSpotifyAccessToken;
  console.log({ spotifyAccessToken });
  localStorage.setItem("spotifyAccessToken", spotifyAccessToken);
  if (didLoad) {
    updateSpotifyAuthorizeButton();
    setupSpotifyPlayer();
  }
};
setSpotifyAccessToken(localStorage.getItem("spotifyAccessToken") ?? "");

let spotifyRefreshToken = "";
const setSpotifyRefreshToken = (newSpotifyRefreshToken) => {
  if (!newSpotifyRefreshToken) {
    return;
  }
  spotifyRefreshToken = newSpotifyRefreshToken;
  console.log({ spotifyRefreshToken });
  localStorage.setItem("spotifyRefreshToken", spotifyRefreshToken);
  if (didLoad) {
    updateSpotifyAuthorizeButton();
  }
};
setSpotifyRefreshToken(localStorage.getItem("spotifyRefreshToken") ?? "");

let spotifyExpiresIn = "";
const setSpotifyExpiresIn = (newSpotifyExpiresIn) => {
  spotifyExpiresIn = Number(newSpotifyExpiresIn);
  console.log({ spotifyExpiresIn });
  localStorage.setItem("spotifyExpiresIn", spotifyExpiresIn);
  if (didLoad) {
    updateSpotifyAuthorizeButton();
    const spotifyExpiresAt = Date.now() + spotifyExpiresIn * 1000 - 60000;
    setSpotifyExpiresAt(spotifyExpiresAt);
  }
};
setSpotifyExpiresIn(localStorage.getItem("spotifyExpiresIn") ?? "");

let spotifyExpiresAt = "";
const setSpotifyExpiresAt = (newSpotifyExpiresAt) => {
  spotifyExpiresAt = Number(newSpotifyExpiresAt);
  console.log({ spotifyExpiresAt });
  localStorage.setItem("spotifyExpiresAt", spotifyExpiresAt);
  if (didLoad) {
    updateSpotifyAuthorizeButton();
  }
  const didExpire = spotifyExpiresAt < Date.now();
  if (didExpire) {
    refreshSpotifyAccessToken();
  }
};
const refreshSpotifyAccessToken = async () => {
  if (!spotifyRefreshToken) {
    return;
  }

  const tokenUrl = "https://accounts.spotify.com/api/token";

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + btoa(`${spotifyClientId}:${spotifyClientSecret}`),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: spotifyRefreshToken,
    }),
  });
  const json = await response.json();
  console.log("refresh json", json);
  if (json.access_token) {
    setSpotifyAccessToken(json.access_token);
    setSpotifyExpiresIn(json.expires_in);
    window.history.replaceState({}, document.title, spotifyRedirectUrl); // clean URL
  } else {
    console.error("Failed to refresh token");
  }
};
setSpotifyExpiresAt(localStorage.getItem("spotifyExpiresAt") ?? "");

window.addEventListener("load", () => {
  updateSpotifyAuthorizeButton();
});

let isSpotifyWebPlaybackSDKReady = false;
const setIsSpotifyWebPlaybackSDKReady = async (
  newIsSpotifyWebPlaybackSDKReady
) => {
  isSpotifyWebPlaybackSDKReady = newIsSpotifyWebPlaybackSDKReady;
  console.log({ isSpotifyWebPlaybackSDKReady });
  updateSpotifyAuthorizeButton();

  if (isSpotifyWebPlaybackSDKReady) {
    // Handle redirect back with ?code=...
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      const tokenUrl = "https://accounts.spotify.com/api/token";

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + btoa(`${spotifyClientId}:${spotifyClientSecret}`),
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: spotifyRedirectUrl,
        }),
      });
      const json = await response.json();
      console.log("Token response:", json);
      if (json.access_token) {
        setSpotifyAccessToken(json.access_token);
        setSpotifyRefreshToken(json.refresh_token);
        setSpotifyExpiresIn(json.expires_in);
        window.history.replaceState({}, document.title, spotifyRedirectUrl); // clean URL
      } else {
        console.error("Failed to get token");
      }
    }
    setupSpotifyPlayer();
  }
};

window.onSpotifyWebPlaybackSDKReady = () => {
  console.log("onSpotifyWebPlaybackSDKReady");
  setIsSpotifyWebPlaybackSDKReady(true);
};

let spotifyPlayer;
let spotifyState;
let spotifyPosition = 0;
let spotifyPaused = true;
let timelineInterpolation = 0;
const timelineInterpolationThreshold = 0;
const timelineDurationThreshold = 100;
let spotifyCurrentTrackId;
let lastTimeSpotifyStateUpdated = 0;
/** @type {BS.DisplaySpriteSheet?} */
let nonEnglishSpriteSheet;
let isUpdatingNonEnglishCharacters = false;
const setSpotifyState = async (newSpotifyState) => {
  if (!newSpotifyState) {
    return;
  }
  lastTimeSpotifyStateUpdated = Date.now();
  spotifyState = newSpotifyState;

  window.spotifyState = spotifyState;
  // console.log("spotifyState", spotifyState);
  updateSpotifyPlaybackControls();

  let shouldDraw = false;

  if (spotifyPaused != spotifyState?.paused) {
    lastTrackStringOffsetXUpdate = Date.now() + 1000;
    spotifyPaused = Boolean(spotifyState?.paused);
    // console.log({ spotifyPaused });
    shouldDraw = true;
  }

  const newSpotifyCurrentTrackId =
    spotifyState?.track_window?.current_track?.id;

  if (newSpotifyCurrentTrackId != spotifyCurrentTrackId) {
    didUploadSpotifyAlbumArt = false;
    spotifyCurrentTrackId = newSpotifyCurrentTrackId;
    if (spotifyCurrentTrackId) {
      const { current_track } = spotifyState.track_window;
      const artistName = current_track.artists[0].name;
      const trackName = current_track.name;
      const albumName = current_track.album.name;

      trackString = `${trackName} - ${artistName}`;
      trackMetrics =
        displayCanvasHelper.stringToSpriteLinesMetrics(trackString);
      trackStringOffsetX = 0;
      lastTrackStringOffsetXUpdate = Date.now() + 1000;

      isUpdatingNonEnglishCharacters = true;
      await getSpotifySongLyrics();
      let newNonEnglishCharacters = [];

      newNonEnglishCharacters.push(artistName, trackName, albumName);
      syncedLyrics?.forEach(({ line }) => {
        newNonEnglishCharacters.push(line);
      });
      newNonEnglishCharacters = Array.from(newNonEnglishCharacters.join(""))
        .filter(
          (char) =>
            char.charCodeAt(0) != undefined &&
            !BS.englishRegex.test(char) &&
            (useCustomNoteSprite ? char != noteCharacter : true)
        )
        .filter((char) => char != `\n`);

      console.log("newNonEnglishCharacters", newNonEnglishCharacters);
      const fullName = selectedFont.getEnglishName("fullName");
      nonEnglishSpriteSheet = await BS.fontToSpriteSheet(
        fonts[fullName],
        fontSize,
        "nonEnglish",
        {
          englishOnly: false,
          string: newNonEnglishCharacters.join(""),
          usePath: true,
          ...fontMetrics,
        }
      );
      console.log("nonEnglishSpriteSheet", nonEnglishSpriteSheet);
      await displayCanvasHelper.uploadSpriteSheet(nonEnglishSpriteSheet);
      isUpdatingNonEnglishCharacters = false;
      shouldDraw = true;
    }
  }
  if (shouldDraw) {
    await draw();
  }
};
let spotifyDeviceId;
const setupSpotifyPlayer = async () => {
  if (!isSpotifyWebPlaybackSDKReady) {
    console.log("spotify sdk not ready");
    return;
  }
  if (!spotifyAccessToken) {
    console.log("spotifyAccessToken not defined");
    return;
  }
  if (spotifyPlayer) {
    console.log("already have spotifyPlayer");
    return;
  }
  if (!didLoad) {
    return;
  }
  spotifyPlayer = new Spotify.Player({
    name: "Brilliant Frame Player",
    getOAuthToken: (cb) => cb(spotifyAccessToken),
    volume: 0.5,
  });

  spotifyPlayer.addListener("ready", async ({ device_id }) => {
    spotifyDeviceId = device_id;
    console.log("Ready with Device ID", device_id);

    // Transfer playback to this device
    await fetch("https://api.spotify.com/v1/me/player", {
      method: "PUT",
      body: JSON.stringify({ device_ids: [device_id], play: false }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${spotifyAccessToken}`,
      },
    });

    console.log("Playback transferred to Web SDK device!");
    updateSpotifyPlaybackControls();
  });

  spotifyPlayer.addListener("initialization_error", ({ message }) =>
    console.error(message)
  );
  spotifyPlayer.addListener("authentication_error", ({ message }) => {
    console.error(message);
    refreshSpotifyAccessToken();
  });
  spotifyPlayer.addListener("account_error", ({ message }) =>
    console.error(message)
  );
  spotifyPlayer.addListener("not_ready", ({ device_id }) =>
    console.log("Device ID has gone offline", device_id)
  );

  spotifyPlayer.addListener("player_state_changed", (state) => {
    setSpotifyState(state);
  });

  spotifyPlayer.connect();
  spotifyPlayer.activateElement(); // required for autoplay policies
  window.spotifyPlayer = spotifyPlayer;
};

const toggleSpotifyPlaybackButton = document.getElementById(
  "toggleSpotifyPlayback"
);
toggleSpotifyPlaybackButton.addEventListener("click", () =>
  toggleSpotifyPlayback()
);
const toggleSpotifyPlayback = async () => {
  if (!spotifyPlayer) {
    return;
  }
  await spotifyPlayer.togglePlay();
};
const updateToggleSpotifyPlaybackButton = () => {
  const enabled = Boolean(spotifyPlayer);
  toggleSpotifyPlaybackButton.disabled = !enabled;
  toggleSpotifyPlaybackButton.innerText = spotifyState?.paused
    ? "play"
    : "pause";
};

const previousSpotifyTrackButton = document.getElementById(
  "previousSpotifyTrack"
);
previousSpotifyTrackButton.addEventListener("click", () =>
  previousSpotifyTrack()
);
let spotifyPositionThreshold = 2000;
const previousSpotifyTrack = async () => {
  if (!spotifyPlayer) {
    return;
  }
  if (spotifyPosition > spotifyPositionThreshold) {
    await spotifyPlayer.seek(0);
  } else {
    await spotifyPlayer.previousTrack();
  }
};
const updatePreviousSpotifyTrackButton = () => {
  const enabled = Boolean(spotifyPlayer);
  previousSpotifyTrackButton.disabled = !enabled;
};

const nextSpotifyTrackButton = document.getElementById("nextSpotifyTrack");
nextSpotifyTrackButton.addEventListener("click", () => nextSpotifyTrack());
const nextSpotifyTrack = async () => {
  if (!spotifyPlayer) {
    return;
  }
  await spotifyPlayer.nextTrack();
};
const updateNextSpotifyTrackButton = () => {
  const enabled = Boolean(spotifyPlayer);
  nextSpotifyTrackButton.disabled = !enabled;
};

// SPOTIFY TIME

const spotifyTimeSpan = document.getElementById("spotifyTime");

function millisecondsToMinutes(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const spotifyTimeInput = document.getElementById("spotifyTimeInput");
const updateSpotifyTimeInput = () => {
  const enabled = Boolean(spotifyPlayer);
  spotifyTimeInput.disabled = !enabled;
  if (spotifyState) {
    spotifyTimeInput.max = spotifyState.duration;
  }
};

let isSpotifyTimeInputChanging = false;
const setIsSpotifyTimeInputChanging = (newIsSpotifyTimeInputChanging) => {
  if (isSpotifyTimeInputChanging == newIsSpotifyTimeInputChanging) {
    return;
  }
  isSpotifyTimeInputChanging = newIsSpotifyTimeInputChanging;
  console.log({ isSpotifyTimeInputChanging });
  if (!isSpotifyTimeInputChanging) {
    updateSpotifyTime();
  }
};
const seekSpotifyPlayer = BS.ThrottleUtils.throttle(
  async (position, play) => {
    await spotifyPlayer.seek(position);
    if (play && spotifyPaused) {
      spotifyPlayer.resume();
    }
  },
  200,
  true
);
spotifyTimeInput.addEventListener("input", () => {
  setIsSpotifyTimeInputChanging(true);
  seekSpotifyPlayer(Number(spotifyTimeInput.value));
});
spotifyTimeInput.addEventListener("change", () => {
  setIsSpotifyTimeInputChanging(false);
});

const updateSpotifyTime = () => {
  requestAnimationFrame(_updateSpotifyTime);
};
const _updateSpotifyTime = () => {
  if (!spotifyState) {
    return;
  }
  let shouldDraw = false;

  let { position, duration } = spotifyState;
  const timeSinceSpotifyStateUpdated = Date.now() - lastTimeSpotifyStateUpdated;
  if (!spotifyPaused) {
    position += timeSinceSpotifyStateUpdated;
  }
  if (Math.abs(spotifyPosition - position) > timelineDurationThreshold) {
    spotifyPosition = position;
    const newTimelineInterpolation = spotifyPosition / duration;
    if (
      newTimelineInterpolation == 0 ||
      newTimelineInterpolation == 1 ||
      Math.abs(newTimelineInterpolation - timelineInterpolation) >
        timelineInterpolationThreshold
    ) {
      //console.log({ timelineInterpolation });
      timelineInterpolation = newTimelineInterpolation;
      shouldDraw = true;
    }
  }
  spotifyTimeSpan.innerText = `${millisecondsToMinutes(
    spotifyPosition
  )}/${millisecondsToMinutes(duration)}`;

  if (!isSpotifyTimeInputChanging) {
    spotifyTimeInput.value = spotifyPosition;
  }

  updateSpotifyLyrics();

  if (!spotifyPaused) {
    requestAnimationFrame(_updateSpotifyTime);
  }

  if (shouldDraw) {
    draw();
  }
};

// SPOTIFY VOLUME

const spotifyVolumeInput = document.getElementById("spotifyVolume");
let spotifyVolume = 0.5;
const updateSpotifyVolumeInput = async () => {
  const enabled = Boolean(spotifyPlayer);
  spotifyVolumeInput.disabled = !enabled;
  toggleSpotifyMuteCheckbox.disabled = !enabled;
  if (spotifyPlayer) {
    spotifyVolumeInput.value = spotifyVolume;
  }
};

let isSpotifyVolumeInputChanging = false;
const setIsSpotifyVolumeInputChanging = (newIsSpotifyVolumeInputChanging) => {
  if (isSpotifyVolumeInputChanging == newIsSpotifyVolumeInputChanging) {
    return;
  }
  isSpotifyVolumeInputChanging = newIsSpotifyVolumeInputChanging;
  console.log({ isSpotifyVolumeInputChanging });
};
const setSpotifyVolume = BS.ThrottleUtils.throttle(
  async (newSpotifyVolume) => {
    newSpotifyVolume = Math.max(0, Math.min(1, newSpotifyVolume));
    if (isSpotifyMuted) {
      if (newSpotifyVolume > 0) {
        console.log("unmuting");
        setIsSpotifyMuted(false, false);
      } else {
        await spotifyPlayer.setVolume(0);
        return;
      }
    }
    spotifyVolume = newSpotifyVolume;
    console.log({ spotifyVolume });
    await spotifyPlayer.setVolume(spotifyVolume);
    await updateSpotifyVolumeInput();
  },
  100,
  true
);
spotifyVolumeInput.addEventListener("input", () => {
  setIsSpotifyVolumeInputChanging(true);
  setSpotifyVolume(Number(spotifyVolumeInput.value));
});
spotifyVolumeInput.addEventListener("change", () => {
  setIsSpotifyVolumeInputChanging(false);
});

const toggleSpotifyMuteCheckbox = document.getElementById("toggleSpotifyMute");
toggleSpotifyMuteCheckbox.addEventListener("input", () => {
  setIsSpotifyMuted(toggleSpotifyMuteCheckbox.checked);
});
let isSpotifyMuted = false;
const setIsSpotifyMuted = async (newIsSpotifyMuted, updateVolume = true) => {
  if (newIsSpotifyMuted == isSpotifyMuted) {
    return;
  }
  isSpotifyMuted = newIsSpotifyMuted;
  console.log({ isSpotifyMuted });
  toggleSpotifyMuteCheckbox.checked = isSpotifyMuted;
  if (updateVolume) {
    if (isSpotifyMuted) {
      setSpotifyVolume(0);
    } else {
      setSpotifyVolume(spotifyVolume);
    }
  }
};

// SPOTIFY LYRICS
/** @typedef {{id: number; name: string; trackName: string; artistName: string; albumName: string; duration: number; instrumental: boolean; plainLyrics: string; syncedLyrics: string;}} SpotifyLyrics */
/** @type {SpotifyLyrics?} */
let spotifyLyrics;

const spotifyLyricsContainer = document.getElementById("lyrics");
let latestSpotifyLyricsFetchUrl;

const getSpotifySongLyrics = async () => {
  if (!spotifyState) {
    return;
  }

  setSpotifyLyrics();

  const { current_track } = spotifyState.track_window;

  const artistName = current_track.artists[0].name;
  const trackName = current_track.name;
  const albumName = current_track.album.name;
  const duration = Math.floor(current_track.duration_ms / 1000);

  spotifyLyricsContainer.innerHTML = "";
  currentSpotifyLyricsLineIndex = -1;
  const spotifyLyricsFetchUrl = `https://lrclib.net/api/get?artist_name=${artistName}&track_name=${trackName}&album_name=${albumName}&duration=${duration}`;
  latestSpotifyLyricsFetchUrl = spotifyLyricsFetchUrl;
  try {
    console.log("getting spotify lyrics...");
    const response = await fetch(spotifyLyricsFetchUrl);
    const newSpotifyLyrics = await response.json();
    if (spotifyLyricsFetchUrl == latestSpotifyLyricsFetchUrl) {
      setSpotifyLyrics(newSpotifyLyrics);
    }
  } catch (error) {
    console.error(error);
  }
};
window.getSpotifySongLyrics = getSpotifySongLyrics;

/** @typedef {{timestamp: number, duration: number, endTimestamp: number, line: string, span: HTMLSpanElement}} SyncedLyric */

/** @type {SyncedLyric[]?} */
let syncedLyrics;
const setSpotifyLyrics = async (newSpotifyLyrics) => {
  spotifyLyrics = newSpotifyLyrics;
  console.log("spotifyLyrics", spotifyLyrics);
  if (!spotifyLyrics) {
    syncedLyrics = undefined;
    return;
  }
  syncedLyrics = spotifyLyrics.syncedLyrics
    ?.split("\n")
    .map((string) => {
      const match = string.match(/^\[(\d{2}):(\d{2}\.\d{2})\]\s*(.*)$/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        const timestamp = Math.round((minutes * 60 + seconds) * 1000);
        const line = match[3] || noteCharacter;
        // console.log({ timestamp, line });
        return { timestamp, line };
      }
    })
    .filter(Boolean);
  console.log("syncedLyrics", syncedLyrics);
  currentSpotifyLyricsLineIndex = -1;
  if (syncedLyrics) {
    if (syncedLyrics.length > 0) {
      syncedLyrics.unshift({
        timestamp: 0,
        duration: syncedLyrics[0].timestamp,
        line: noteCharacter,
      });
    }

    syncedLyrics.forEach(({ timestamp, line }, index) => {
      const span = document.createElement("span");
      span.addEventListener("click", () => {
        seekSpotifyPlayer(timestamp, true);
      });
      span.innerText = line;
      syncedLyrics[index].span = span;
      spotifyLyricsContainer.appendChild(span);

      if (index > 0) {
        const previous = syncedLyrics[index - 1];
        previous.duration = timestamp - previous.timestamp;
        previous.endTimestamp = timestamp;
      }
    });

    if (false && syncedLyrics.length > 1) {
      const syncedLyric = syncedLyrics.at(-1);
      const { current_track } = spotifyState.track_window;
      syncedLyric.duration = current_track.duration_ms - syncedLyric.timestamp;
    }
  }
  updateSpotifyLyrics();
};
let currentSpotifyLyricsLineIndex;
const updateSpotifyLyrics = () => {
  if (!syncedLyrics) {
    return;
  }
  //console.log({ spotifyPosition });
  let newCurrentSpotifyLyricsLineIndex =
    syncedLyrics.findIndex(({ timestamp }) => {
      return timestamp > spotifyPosition;
    }) - 1;
  if (newCurrentSpotifyLyricsLineIndex == -2) {
    newCurrentSpotifyLyricsLineIndex = syncedLyrics.length - 1;
  }
  setCurrentSpotifyLyricsLineIndex(newCurrentSpotifyLyricsLineIndex);
};
const setCurrentSpotifyLyricsLineIndex = (newCurrentSpotifyLyricsLineIndex) => {
  if (currentSpotifyLyricsLineIndex == newCurrentSpotifyLyricsLineIndex) {
    return;
  }
  const nextNextLyricsLine = syncedLyrics[currentSpotifyLyricsLineIndex];
  if (nextNextLyricsLine) {
    nextNextLyricsLine.span.classList.remove("current");
  }

  currentSpotifyLyricsLineIndex = newCurrentSpotifyLyricsLineIndex;
  //console.log({ currentSpotifyLyricsLineIndex });

  const lyricsLine = syncedLyrics[currentSpotifyLyricsLineIndex];
  if (lyricsLine) {
    lyricsLine.span.classList.add("current");
  }
};

// SPOTIFY TRACK

const spotifyTrackNameSpan = document.getElementById("spotifyTrackName");
const spotifyArtistNameSpan = document.getElementById("spotifyArtistName");
const spotifyAlbumNameSpan = document.getElementById("spotifyAlbumName");

const updateSpotifyNames = () => {
  if (!spotifyState) {
    return;
  }
  const { current_track } = spotifyState.track_window;

  spotifyTrackNameSpan.innerText = current_track.name;
  spotifyArtistNameSpan.innerText = current_track.artists[0].name;
  spotifyAlbumNameSpan.innerText = current_track.album.name;
};

/** @type {HTMLImageElement} */
const spotifyAlbumArt = document.getElementById("spotifyAlbumArt");
spotifyAlbumArt.crossOrigin = "Anonymous";
const updateSpotifyArtwork = () => {
  if (!spotifyState) {
    return;
  }
  const { current_track } = spotifyState.track_window;

  const albumArtwork = current_track.album.images[0];
  if (spotifyAlbumArt.src != albumArtwork.url) {
    spotifyAlbumArt.src = albumArtwork.url;
  }
};
const imageHeight = 100;
const imagePadding = 10;
/** @type {BS.DisplaySpriteSheet} */
let spotifyAlbumArtSpriteSheet;
let didUploadSpotifyAlbumArt = false;

spotifyAlbumArt.addEventListener("load", async () => {
  console.log("spotifyAlbumArt", spotifyAlbumArt);
  const aspectRatio =
    spotifyAlbumArt.naturalWidth / spotifyAlbumArt.naturalHeight;
  if (false) {
    const roundProfileImage = await imageToRoundedCanvas(
      spotifyAlbumArt,
      imageHeight * aspectRatio,
      imageHeight,
      12
    );
    console.log("roundProfileImage", roundProfileImage);
    spotifyAlbumArtSpriteSheet = await BS.canvasToSpriteSheet(
      roundProfileImage,
      "album",
      getImageNumberOfColors(),
      "album"
    );
  } else {
    spotifyAlbumArtSpriteSheet = await BS.imageToSpriteSheet(
      spotifyAlbumArt,
      "album",
      imageHeight * aspectRatio,
      imageHeight,
      getImageNumberOfColors(),
      "album"
    );
  }
  spotifyAlbumArtSpriteSheet.palettes[0].colors[0] = "black";
  console.log("spotifyAlbumArtSpriteSheet", spotifyAlbumArtSpriteSheet);
  await displayCanvasHelper.uploadSpriteSheet(spotifyAlbumArtSpriteSheet);
  didUploadSpotifyAlbumArt = true;
  await draw();
});
async function imageToRoundedCanvas(src, width, height, radius) {
  // get source dimensions
  const srcW =
    src instanceof HTMLVideoElement
      ? src.videoWidth
      : src.naturalWidth || src.width;
  const srcH =
    src instanceof HTMLVideoElement
      ? src.videoHeight
      : src.naturalHeight || src.height;

  if (!srcW || !srcH) {
    throw new Error("Source image has no dimensions.");
  }

  // devicePixelRatio for crispness
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  const ctx = canvas.getContext("2d");

  // --- normalize radius ---
  let borderRadius = { tl: radius, tr: radius, br: radius, bl: radius };
  // clamp to half size
  borderRadius.tl = Math.min(borderRadius.tl, width / 2, height / 2);
  borderRadius.tr = Math.min(borderRadius.tr, width / 2, height / 2);
  borderRadius.br = Math.min(borderRadius.br, width / 2, height / 2);
  borderRadius.bl = Math.min(borderRadius.bl, width / 2, height / 2);

  // --- draw rounded rect path and clip ---
  function roundedRectPath(ctx, x, y, w, h, rad) {
    ctx.beginPath();
    ctx.moveTo(x + rad.tl, y);
    ctx.lineTo(x + w - rad.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad.tr);
    ctx.lineTo(x + w, y + h - rad.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad.br, y + h);
    ctx.lineTo(x + rad.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad.bl);
    ctx.lineTo(x, y + rad.tl);
    ctx.quadraticCurveTo(x, y, x + rad.tl, y);
    ctx.closePath();
  }

  roundedRectPath(ctx, 0, 0, width, height, borderRadius);
  ctx.clip();

  // --- compute draw parameters based on fit mode ---
  const imgW = srcW;
  const imgH = srcH;

  ctx.drawImage(src, 0, 0, imgW, imgH, 0, 0, width, height);

  return canvas;
}

const updateSpotifyPlaybackControls = () => {
  updateToggleSpotifyPlaybackButton();
  updatePreviousSpotifyTrackButton();
  updateNextSpotifyTrackButton();
  updateSpotifyTime();
  updateSpotifyTimeInput();
  updateSpotifyVolumeInput();
  updateSpotifyNames();
  updateSpotifyArtwork();
};

// FONT

/** @type {HTMLInputElement} */
const loadFontInput = document.getElementById("loadFont");
loadFontInput.addEventListener("input", async () => {
  for (let i = 0; i < loadFontInput.files.length; i++) {
    const file = loadFontInput.files[i];
    if (!file) {
      continue;
    }
    const arrayBuffer = await file.arrayBuffer();
    await loadFont(arrayBuffer);
  }
  loadFontInput.value = "";
});

let fontScale = 1;
const fontScaleContainer = document.getElementById("fontScale");
const fontScaleInput = fontScaleContainer.querySelector("input");
const fontScaleSpan = fontScaleContainer.querySelector(".value");
fontScaleInput.addEventListener("input", () => {
  setFontScale(Number(fontScaleInput.value));
});
const setFontScale = (newFontScale) => {
  fontScale = newFontScale;
  console.log({ fontScale });
  fontScaleSpan.innerText = fontScale;
  fontScaleInput.value = fontScale;
  draw();
};

const loadFont = async (arrayBuffer) => {
  if (!arrayBuffer) {
    return;
  }
  const font = await BS.parseFont(arrayBuffer);
  if (font) {
    await addFont(font);
  }
};

const validFontExtensions = loadFontInput.accept.split(",");
function isGoogleFontsUrl(string) {
  try {
    const url = new URL(string);
    return (
      url.hostname === "fonts.googleapis.com" &&
      (url.pathname.startsWith("/css") || url.pathname.startsWith("/css2"))
    );
  } catch {
    return false;
  }
}
async function getGoogleFontUrls(cssUrl, isEnglish = true) {
  const filterFn = isEnglish ? (r) => /U\+0000-00FF/i.test(r) : undefined;

  const res = await fetch(cssUrl);
  if (!res.ok) throw new Error(`Failed to fetch CSS: ${res.status}`);
  const cssText = await res.text();

  // Capture url and unicode-range
  const regex = /src:\s*url\(([^)]+\.woff2)\)[^}]*unicode-range:\s*([^;]+);/gi;
  const results = [];
  let match;

  while ((match = regex.exec(cssText)) !== null) {
    const url = match[1].replace(/["']/g, "");
    const range = match[2].trim();

    if (!filterFn || filterFn(range)) {
      results.push(url);
    }
  }

  return [...new Set(results)];
}
const loadFontUrl = async (string, isEnglish = true) => {
  if (!isValidUrl(string)) {
    return;
  }

  if (isGoogleFontsUrl(string)) {
    const googleFontUrls = await getGoogleFontUrls(string, isEnglish);
    for (const index in googleFontUrls) {
      const response = await fetch(googleFontUrls[index]);
      const arrayBuffer = await response.arrayBuffer();
      await loadFont(arrayBuffer);
    }
  } else {
    if (validFontExtensions.every((extension) => !string.endsWith(extension))) {
      return;
    }
    const response = await fetch(string);
    const arrayBuffer = await response.arrayBuffer();
    await loadFont(arrayBuffer);
  }
};
window.addEventListener("paste", (event) => {
  const string = event.clipboardData.getData("text");
  loadFontUrl(string);
});
window.addEventListener("paste", async (event) => {
  const items = event.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log("item.type", item.type);
    if (item.type.startsWith("font/")) {
      const file = item.getAsFile();
      const arrayBuffer = await file.arrayBuffer();
      await loadFont(arrayBuffer);
    }
  }
});

window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    console.log(file.type);
    if (
      file.type.startsWith("font/") ||
      file.type.includes("font") ||
      file.name.endsWith("woff2")
    ) {
      const arrayBuffer = await file.arrayBuffer();
      await loadFont(arrayBuffer);
    }
  }
});

/** @type {Record<string, BS.Font[]>} */
const fonts = {};
window.fonts = fonts;
const fontSize = 32;
/** @type {Record<string, BS.DisplaySpriteSheet>} */
const fontSpriteSheets = {};
window.fonts = fonts;
let fontMetrics;
/** @type {BS.FontToSpriteSheetOptions} */
const fontOptions = {
  usePath: true,
  englishOnly: true,
};
/** @param {BS.Font} font */
const addFont = async (font) => {
  const range = BS.getFontUnicodeRange(font);
  if (!range) {
    return;
  }
  const isEnglish = range.min <= 65 && range.max >= 122;

  const fullName = font.getEnglishName("fullName");
  fonts[fullName] = fonts[fullName] || [];
  if (isEnglish) {
    fonts[fullName].unshift(font);
  } else {
    fonts[fullName].push(font);
  }

  console.log(`added font "${fullName}"`);

  if (isEnglish) {
    const spriteSheet = await BS.fontToSpriteSheet(
      font,
      fontSize,
      "english",
      fontOptions
    );
    fontSpriteSheets[fullName] = spriteSheet;
    await updateFontSelect();
    await selectFont(fullName);
  }
};

/** @type {HTMLSelectElement} */
const selectFontSelect = document.getElementById("selectFont");
const selectFontOptgroup = selectFontSelect.querySelector("optgroup");
const updateFontSelect = async () => {
  selectFontOptgroup.innerHTML = "";
  for (const fullName in fonts) {
    selectFontOptgroup.appendChild(new Option(fullName));
  }
};

selectFontSelect.addEventListener("input", async () => {
  const fontName = selectFontSelect.value;
  await selectFont(fontName);
});

/** @type {BS.Font?} */
let selectedFont;
let spritesLineHeight = 0;
const selectFont = async (newFontName) => {
  const newFont = fonts[newFontName][0];
  selectedFont = newFont;

  if (didLoad) {
    console.log(`selected font "${newFontName}"`, selectedFont);
    //console.log(`selected fonts`, selectedFonts);
  }
  selectFontSelect.value = newFontName;
  const spriteSheet = fontSpriteSheets[newFontName];
  fontMetrics = BS.getFontMetrics(selectedFont, fontSize, fontOptions);
  spritesLineHeight = BS.getFontMaxHeight(selectedFont, fontSize);
  await displayCanvasHelper.uploadSpriteSheet(spriteSheet);
  await displayCanvasHelper.selectSpriteSheet(spriteSheet.name);
  console.log({ spritesLineHeight }, selectedFont, fontSize);
  await displayCanvasHelper.setSpritesLineHeight(spritesLineHeight);
  await draw();
};

await loadFontUrl("https://fonts.googleapis.com/css2?family=Roboto");
await loadFontUrl(
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR",
  false
);

// MUSICAL NOTE
/** @type {BS.DisplaySpriteSheet} */
let musicSpriteSheet;
const useCustomNoteSprite = true;
const noteCharacter = "♪♪♪";
const fetchMusicSpriteSheet = async () => {
  try {
    const response = await fetch("./musicSpriteSheet.json");
    const json = await response.json();
    musicSpriteSheet = json;
    //console.log("musicSpriteSheet", musicSpriteSheet);
    displayCanvasHelper.uploadSpriteSheet(musicSpriteSheet);
  } catch (error) {
    console.error(error);
  }
};
if (useCustomNoteSprite) {
  await fetchMusicSpriteSheet();
}

let isLocked = false;
displayCanvas.addEventListener("click", async () => {
  if (isLocked) {
    return;
  }
  await displayCanvas.requestPointerLock();
});

let isMouseDown = false;
displayCanvas.addEventListener("mousedown", () => {
  setIsMouseDown(true);
});
displayCanvas.addEventListener("mouseup", () => {
  setIsMouseDown(false);
});
document.addEventListener("keydown", (event) => {
  if (!isLocked) {
    return;
  }
  const { key } = event;
  console.log({ key });
  event.preventDefault();

  switch (key) {
    case "ArrowLeft":
      previousSpotifyTrack();
      break;
    case "ArrowRight":
      nextSpotifyTrack();
      break;
    case "ArrowUp":
      setSpotifyVolume(spotifyVolume + 0.2);
      break;
    case "ArrowDown":
      setSpotifyVolume(spotifyVolume - 0.2);
      break;
    case "m":
      toggleSpotifyMuteCheckbox.click();
      break;
    case " ":
      toggleSpotifyPlayback();
      break;
    default:
      break;
  }
});
const setIsMouseDown = (newIsMouseDown) => {
  if (isMouseDown == newIsMouseDown) {
    return;
  }
  isMouseDown = newIsMouseDown;
  console.log({ isMouseDown });
};
window.spotifyMouseMovementXScalar = 2000;
displayCanvas.addEventListener("mousemove", (event) => {
  if (!isLocked || !spotifyState) {
    return;
  }
  const { movementX, movementY } = event;
  //console.log({ movementX, movementY });

  if (isMouseDown) {
    seekSpotifyPlayer(
      spotifyState.position + movementX * spotifyMouseMovementXScalar
    );
  }
});
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === displayCanvas) {
    isLocked = true;
  } else {
    isLocked = false;
  }
  console.log({ isLocked });
});

didLoad = true;

setupSpotifyPlayer();
