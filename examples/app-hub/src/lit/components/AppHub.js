import { waitForGlobals } from "../../utils/cross-origin-storage-utils.js";

const { lit, litRouter, litContext, litRef, BW } = await waitForGlobals();

const { LitElement, html } = lit;
const { ref, createRef } = litRef;
const { Routes } = litRouter;
const { ContextProvider } = litContext;

import { Router } from "../router/Router.js";

import { defaultPath, tabs } from "./tabs/tabs.js";
/** @typedef {import("./tabs/tabs.js").Tab} Tab */

import { createActiveTabContextProvider } from "../contexts/activeTabContext.js";
import { createScreenOrientationContextProvider } from "../contexts/screenOrientationContext.js";

/** @type {Record<Tab, TemplateResult<1>>} */
const tabRenders = {
  layers: () => html`<bw-layers-tab></bw-layers-tab>`,
  apps: () => html`<bw-apps-tab></bw-apps-tab>`,
  devices: () => html`<bw-devices-tab></bw-devices-tab>`,
  settings: () => html`<bw-settings-tab></bw-settings-tab>`,
};

import "./header/header.js";
import "./main/main.js";

import { createIsLeftHandedContextProvider } from "../contexts/isLeftHandedContext.js";
import { createBatteryManagerContextProvider } from "../contexts/batteryManagerContext.js";
import { createDisableViewTransitionsContextProvider } from "../contexts/disableViewTransitionsContext.js";
import { createAnchorHeaderContextProvider } from "../contexts/anchorHeaderContext.js";
import { createReducedMotionContextProvider } from "../contexts/reducedMotionContext.js";
import { createTouchEnabledContextProvider } from "../contexts/touchEnabledContext.js";
import { createViewportOrientationContextProvider } from "../contexts/viewportOrientationContext.js";
import { createVisibilityContextProvider } from "../contexts/visibilityContext.js";
import {
  createFullscreenContextProvider,
  getIsFullscreen,
} from "../contexts/fullscreenContext.js";
import { createIsHeaderHiddenContextProvider } from "../contexts/isHeaderHiddenContext.js";
import { createHeaderSideContextProvider } from "../contexts/headerSideContext.js";
import { isIOS } from "../../utils/environment.js";
import {
  createThemeContextProvider,
  getTheme,
} from "../contexts/themeContext.js";
import { createNavigationStateContextProvider } from "../contexts/navigationStateContext.js";
import { createDisableTransitionsContextProvider } from "../contexts/disableTransitionsContext.js";

import "https://ka-f.webawesome.com/webawesome@3.12.0/components/resize-observer/resize-observer.js";
import { createFlipOnChargeContextProvider } from "../contexts/flipOnChargeContext.js";
import { createScrollAssistContextProvider } from "../contexts/scrollAssistContext.js";
import { createSwipeToChangeTabGestureContextProvider } from "../contexts/swipeToChangeTabGestureContext.js";
import { createSwipeToHideHeaderGestureContextProvider } from "../contexts/swipeToHideHeaderGestureContext.js";
import { createFlipActionButtonContextProvider } from "../contexts/flipActionButtonContext.js";
import { createToggleThemeActionButtonContextProvider } from "../contexts/toggleThemeActionButtonContext.js";
import { createToggleFullscreenActionButtonContextProvider } from "../contexts/toggleFullscreenActionButtonContext.js";
import { createToggleHeaderHiddenActionButtonContextProvider } from "../contexts/toggleHeaderHiddenActionButtonContext.js";
import { createDirectionContextProvider } from "../contexts/directionContext.js";
import { createBluetoothContextProvider } from "../contexts/bluetoothContext.js";
import { waitForAnimationFrames } from "../../utils/rendering.js";

class AppHub extends LitElement {
  createRenderRoot() {
    return this;
  }

  get anchorHeader() {
    return this._anchorHeader;
  }
  set anchorHeader(newAnchorHeader) {
    // console.log("set anchorHeader", { newAnchorHeader });
    this._anchorHeaderProvider.value.update({
      anchorHeader: newAnchorHeader,
    });
  }
  _anchorHeaderProvider = createAnchorHeaderContextProvider(this, null, () =>
    this._onAnchorHeaderUpdate(),
  );
  _onAnchorHeaderUpdate() {
    const { anchorHeader } = this._anchorHeaderProvider.value.state;
    console.log("_onAnchorHeaderUpdate", { anchorHeader });
    this._anchorHeader = anchorHeader;
    if (this._overrideAnchorHeader) {
      return;
    }
    this._disableTransitionsBeforeUpdate();
    document.documentElement.toggleAttribute(
      "data-anchor-header",
      Boolean(this._anchorHeader),
    );
    this._updateHeaderSide();
    this._enableTransitionsAfterUpdate();
  }

  _hidden = false;
  _visibilityProvider = createVisibilityContextProvider(this, null, () =>
    this._onVisibilityUpdate(),
  );
  _onVisibilityUpdate() {
    const { hidden } = this._visibilityProvider.value.state;
    // console.log({ hidden });
    this._hidden = hidden;
    if (!hidden) {
      this._resetViewport();
    }
  }
  async _resetViewport() {
    // console.log("_resetViewport");

    // document.documentElement.scrollTop = 0;
    // document.body.scrollTop = 0;
    // window.scrollTo(0, 0);

    await waitForAnimationFrames();
    document.documentElement.scrollTop = 1;
    document.body.scrollTop = 1;
    window.scrollTo(0, 1);
  }

  _onFlipEvent(event) {
    const { overrideAnchorHeader } = event.detail;
    // console.log("flip", event, { overrideAnchorHeader });
    this._flip(overrideAnchorHeader);
  }
  _flip(overrideAnchorHeader) {
    console.log("_flip", { overrideAnchorHeader });

    let newIsLeftHanded = this.isLeftHanded;
    let newAnchorHeader = this.anchorHeader;

    switch (this._viewportOrientation) {
      case "landscape":
        newIsLeftHanded = this.headerSide != "left";
        if (this.anchorHeader && overrideAnchorHeader) {
          newAnchorHeader = false;
        }
        break;
      case "portrait":
        newIsLeftHanded = !this.isLeftHanded;
        break;
    }

    console.log({ newIsLeftHanded, newAnchorHeader });

    const forceLeftHanded =
      newAnchorHeader != this.anchorHeader && !newAnchorHeader;
    this._overrideAnchorHeader = overrideAnchorHeader;
    this._anchorHeaderProvider.value.update({ anchorHeader: newAnchorHeader });
    this._isLeftHandedProvider.value.update(
      {
        isLeftHanded: newIsLeftHanded,
      },
      forceLeftHanded,
    );
  }

  _disableTransitionsProvider = createDisableTransitionsContextProvider(
    this,
    null,
    () => this._onDisableTransitionsUpdate(),
  );
  _onDisableTransitionsUpdate() {
    const { disableTransitions } = this._disableTransitionsProvider.value.state;
    console.log({ disableTransitions });
    this._disableTransitions = disableTransitions;
    const value = document.documentElement.toggleAttribute(
      "data-disable-transitions",
      Boolean(this._disableTransitions),
    );
  }

  _disableViewTransitionsProvider = createDisableViewTransitionsContextProvider(
    this,
    null,
    () => this._onDisableViewTransitionsUpdate(),
  );
  _onDisableViewTransitionsUpdate() {
    const { disableViewTransitions } =
      this._disableViewTransitionsProvider.value.state;
    console.log({ disableViewTransitions });
    this._disableViewTransitions = disableViewTransitions;
    document.documentElement.toggleAttribute(
      "data-disable-view-transitions",
      Boolean(this._disableViewTransitions),
    );
  }
  get skipViewTransitions() {
    if (!document.startViewTransition) {
      return true;
    }
    if (!this._didFirstUpdate) {
      return true;
    }
    if (this._reducedMotionEnabled) {
      return true;
    }
    if (this._disableViewTransitions) {
      return true;
    }
    if (this._hidden) {
      return true;
    }
    // TODO: - return true if low power mode
    return false;
  }

  refs = {
    tabContent: createRef(),
    tabContentResizeObserver: createRef(),
    header: createRef(),
  };

  _navigationStateProvider = createNavigationStateContextProvider(this);
  router = new Router(
    this,
    tabs.map((tab) => ({
      path: `/${tab}`,
      render: tabRenders[tab],
    })),
    {
      defaultPath,
      beforeGoto: (pathname, activeTab) => {
        this._activeTabProvider.value.update({ activeTab });
        this._navigationStateProvider.value.update(
          navigation.currentEntry.getState(),
        );
        this._lastTouchTime = 0;
        // console.log("clearing _tabContentHeight...");
        this.__tabContentHeight = 0;
        document.documentElement.style.setProperty(
          "--tab-content-height",
          `${0}px`,
        );
      },
      afterGoto: (pathname, activeTab) => {
        console.log("after", pathname, { activeTab });
        this.activeTab = activeTab;

        this._updateTabContentScrollOnResize = true;
        this._updateTabContentScroll();
        setTimeout(() => {
          if (this.__tabContentHeight == 0) {
            // console.log(
            //   "__tabContentHeight didn't updated - updating manually",
            // );
            this._updateTabContentHeight();
          }
          this._ignoreTargetDuringNavigation = undefined;
        }, 10);
      },
    },
  );

  constructor() {
    super();
    this.dataset.axis = "main";

    this._themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!this._themeColorMeta) {
      this._themeColorMeta = document.createElement("meta");
      this._themeColorMeta.name = "theme-color";
      document.head.appendChild(this._themeColorMeta);
    }

    console.log("AppHub", this);
  }

  _updateMetaColor() {
    // console.log("_updateMetaColor");
    const metaContentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("background-color")
      .trim();
    // console.log({ metaContentColor });
    this._themeColorMeta.removeAttribute("content");
    if (this._metaTimeout != undefined) {
      window.clearTimeout(this._metaTimeout);
      this._metaTimeout = undefined;
    }

    this._metaTimeout = setTimeout(() => {
      this._themeColorMeta.setAttribute("content", metaContentColor);
    }, 100);
  }

  connectedCallback() {
    super.connectedCallback();

    this._abortController = new AbortController();
    /** @type {AddEventListenerOptions} */
    const options = { signal: this._abortController.signal };

    window.addEventListener("pageshow", this._resetViewport, options);
    document.addEventListener("scroll", this._onScroll, options);

    this.addEventListener("bw-flip", this._onFlipEvent, options);

    document.addEventListener(
      "pointerdown",
      (event) => {
        const { clientX, clientY, screenX, screenY, pageX, pageY, timeStamp } =
          event;
        const { innerWidth, innerHeight, outerWidth, outerHeight } = window;
        const { width, height, availHeight, availWidth } = screen;
        // console.log("pointerdown", {
        //   clientX,
        //   clientY,
        //   screenX,
        //   screenY,
        //   pageX,
        //   pageY,
        //   innerWidth,
        //   innerHeight,
        //   outerWidth,
        //   outerHeight,
        //   width,
        //   height,
        //   availHeight,
        //   availWidth,
        // });
        this._lastPointerDownPosition = {
          clientX,
          clientY,
          screenX,
          screenY,
          pageX,
          pageY,
          timeStamp,
        };
      },
      options,
    );

    document.addEventListener("touchmove", this._onTouchMove, options);
    document.addEventListener("keydown", this._onKeyDown, options);

    document.addEventListener("touchstart", this._onTouchStart, {
      ...options,
      passive: true,
    });
    document.addEventListener("touchend", this._onTouchEnd, {
      ...options,
      passive: false,
    });

    this._onFullscreenUpdate();
    this._onScreenOrientationUpdate();
    this._updateActiveTab();
    this._onIsLeftHandedUpdate();
    this._onReducedMotionUpdate();
    this._onTouchEnabledUpdate();
    this._onViewportOrientationUpdate();
    this._onVisibilityUpdate();
    this._onAnchorHeaderUpdate();
    this._onThemeUpdate();
    this._onDisableViewTransitionsUpdate();
    this._onDisableTransitionsUpdate();
    this._onScrollAssistUpdate();

    this._onFlipActionButtonUpdate();
    this._onToggleFullscreenActionButtonUpdate();
    this._onToggleHeaderHiddenActionButtonUpdate();
    this._onToggleThemeActionButtonUpdate();
    this._onBluetoothUpdate();

    if (this._batteryManagerState.isAvailable) {
      this._onBatteryChargingChange();
      this._onBatteryLevelChange();
      this._onBatteryChargingTimeChange();
      this._onBatteryDischargingTimeChange();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this._abortController.abort();
  }

  _activeTabProvider = createActiveTabContextProvider(this);
  #activeTab;
  get activeTab() {
    return this.#activeTab;
  }
  set activeTab(newActiveTab) {
    if (this.#activeTab == newActiveTab) {
      return;
    }
    this.#activeTab = newActiveTab;
    // console.log({ activeTab: this.#activeTab });
    document.documentElement.dataset.activeTab = this.activeTab;
    this._updateMetaColor();

    this._clearTabOverlaySizes();
  }

  _screenOrientationProvider = createScreenOrientationContextProvider(
    this,
    null,
    () => this._onScreenOrientationUpdate(),
  );
  /** @type {OrientationType} */
  _screenOrientationType;
  async _onScreenOrientationUpdate() {
    // console.log("_onScreenOrientationUpdate");
    const { type } = this._screenOrientationProvider.value.state;
    this._screenOrientationType = type;
    document.documentElement.setAttribute(
      "data-screen-orientation-type",
      this._screenOrientationType,
    );
    this._updateHeaderSide();

    this._disableTransitionsBeforeUpdate();
    await waitForAnimationFrames(2);
    this._enableTransitionsAfterUpdate();
  }

  _fullscreenProvider = createFullscreenContextProvider(this, null, () =>
    this._onFullscreenUpdate(),
  );

  _onFullscreenUpdate() {
    // console.log("_onFullscreenUpdate");
    const { fullscreenEnabled, fullscreenElement } =
      this._fullscreenProvider.value.state;
    // console.log({ fullscreenEnabled, fullscreenElement });
    document.documentElement.toggleAttribute(
      "data-fullscreen-enabled",
      Boolean(fullscreenEnabled),
    );
    this._updateTabContentScroll(true);
    setTimeout(() => {
      this._updateTabContentScroll(true);
    }, 200);
  }

  _reducedMotionProvider = createReducedMotionContextProvider(
    this,
    null,
    () => {
      this._onReducedMotionUpdate();
    },
  );
  _onReducedMotionUpdate() {
    const { reducedMotion } = this._reducedMotionProvider.value.state;
    // console.log({ reducedMotion });
    this._reducedMotion = reducedMotion;
  }

  _touchEnabledProvider = createTouchEnabledContextProvider(this, null, () => {
    this._onTouchEnabledUpdate();
  });
  _onTouchEnabledUpdate() {
    const { touchEnabled } = this._touchEnabledProvider.value.state;
    // console.log({ touchEnabled });
    this._touchEnabled = touchEnabled;
    if (!this._touchEnabled && this._isHeaderHidden) {
      this._isHeaderHiddenProvider.value.update({ isHeaderHidden: false });
    }
    this._updateHeaderSide();
    this._updateTabResizeObserver(true);
  }

  _viewportOrientationProvider = createViewportOrientationContextProvider(
    this,
    null,
    () => {
      this._onViewportOrientationUpdate();
    },
  );
  /** @type {import("../contexts/viewportOrientationContext.js").ViewportOrientation} */
  _viewportOrientation = "landscape";
  _onViewportOrientationUpdate() {
    const { viewportOrientation } =
      this._viewportOrientationProvider.value.state;
    // console.log({ viewportOrientation });
    this._viewportOrientation = viewportOrientation;
    this._updateCSSVariables();
    this._updateTabResizeObserver(true, true);
  }

  _directionProvider = createDirectionContextProvider(this);

  _themeProvider = createThemeContextProvider(this, null, () => {
    this._onThemeUpdate();
  });
  /** @type {import("../contexts/themeContext.js").ThemeContextState} */
  get _themeState() {
    return this._themeProvider.value.state;
  }
  /** @type {import("../contexts/themeContext.js").ThemeContextValue} */
  _theme;
  async _onThemeUpdate() {
    const theme = getTheme(this._themeState);
    const didThemeChange = this._theme != theme;
    this._theme = theme;
    // console.log({ theme, didThemeChange });

    const { selectedTheme, systemTheme } = this._themeState;

    const position = this._lastPointerDownPosition;
    let isPositionTooLate = true;
    if (position) {
      isPositionTooLate = performance.now() - position.timeStamp > 500;
    }

    console.log({ systemTheme, selectedTheme, isPositionTooLate }, position);

    const showLightClassName =
      selectedTheme == "light" ||
      (selectedTheme == "system" && systemTheme == "light");
    const showDarkClassName =
      selectedTheme == "dark" ||
      (selectedTheme == "system" && systemTheme == "dark");

    const update = () => {
      document.documentElement.classList.toggle("wa-light", showLightClassName);
      document.documentElement.classList.toggle("wa-dark", showDarkClassName);
    };

    if (
      this.skipViewTransitions ||
      !position ||
      !didThemeChange ||
      isPositionTooLate
    ) {
      update();
      this._updateMetaColor();
    } else {
      let { clientX: x, clientY: y } = position;

      const { innerWidth, innerHeight, outerWidth, outerHeight } = window;

      const useOuterWidth = !isIOS && this._touchEnabled;

      const width = useOuterWidth ? outerWidth : innerWidth;
      const height = useOuterWidth ? outerHeight : innerHeight;

      if (useOuterWidth) {
        y += window.outerHeight - window.innerHeight;
      }

      const isRelative = !isIOS;

      const themeTransitionX = isRelative ? `${(100 * x) / width}%` : `${x}px`;
      const themeTransitionY = isRelative ? `${(100 * y) / height}%` : `${y}px`;

      document.documentElement.style.setProperty(
        `--theme-transition-x`,
        themeTransitionX,
      );
      document.documentElement.style.setProperty(
        `--theme-transition-y`,
        themeTransitionY,
      );

      const radius = Math.max(
        Math.hypot(x, y), // top-left
        Math.hypot(width - x, y), // top-right
        Math.hypot(x, height - y), // bottom-left
        Math.hypot(width - x, height - y), // bottom-right
      );

      const themeTransitionRadius = isIOS
        ? `${radius}px`
        : `${(100 * radius) / (Math.hypot(width, height) / Math.SQRT2)}%`;

      const heightRadiusRatio = y / radius;
      // console.log({ heightRadiusRatio });

      document.documentElement.style.setProperty(
        `--theme-transition-radius`,
        themeTransitionRadius,
      );

      const types = ["theme"];
      // console.log("types", types, {
      //   radius,
      //   width,
      //   height,
      //   x,
      //   y,
      //   isRelative,
      //   useOuterWidth,
      // });

      setTimeout(() => {
        this._updateMetaColor();
      }, this._themeTransitionDuration * heightRadiusRatio);
      await document.startViewTransition({
        update: async () => {
          update();
        },
        types,
      }).finished;
      this._updateMetaColor();
    }
  }

  _updateCSSVariables(isOld) {
    const lengthKey =
      this._viewportOrientation == "landscape" ? "width" : "height";
    ["header"].forEach((name) => {
      const element = this.refs[name].value;
      if (element) {
        const rect = element.getBoundingClientRect();
        const length = rect[lengthKey];
        // console.log(`${isOld ? "old" : "new"} ${name} length: ${length}px`);
        document.documentElement.style.setProperty(
          `--${name}${isOld ? "-old" : ""}-length`,
          `${length}px`,
        );
      }
    });
  }

  _updateHeaderCSSVariables() {
    // console.log("_updateHeaderCSSVariables");
    const header = this.refs.header.value;
    const children = Array.from(header.querySelectorAll(":scope > * > *"));
    // console.log("children", children);
    let maxHeight = 0;
    let maxWidth = 0;
    children.forEach((child) => {
      const { width, height } = child.getBoundingClientRect();
      maxHeight = Math.max(height, maxHeight);
      maxWidth = Math.max(width, maxWidth);
    });
    // console.log({ maxWidth, maxHeight });

    const name = "header";
    document.documentElement.style.setProperty(
      `--${name}-base-width`,
      `${maxWidth}px`,
    );
    document.documentElement.style.setProperty(
      `--${name}-base-height`,
      `${maxHeight}px`,
    );
  }

  _isLeftHandedProvider = createIsLeftHandedContextProvider(this, null, () => {
    this._onIsLeftHandedUpdate();
  });
  get isLeftHanded() {
    return this._isLeftHanded;
  }
  set isLeftHanded(newIsLeftHanded) {
    this._isLeftHandedProvider.value.update({
      isLeftHanded: newIsLeftHanded,
    });
  }
  _onIsLeftHandedUpdate() {
    const { isLeftHanded } = this._isLeftHandedProvider.value.state;
    console.log({ isLeftHanded });
    const update = () => {
      document.documentElement.toggleAttribute(
        "data-left-handed",
        Boolean(isLeftHanded),
      );
      this._updateCSSVariables();
      this._isLeftHanded = isLeftHanded;

      this._updateHeaderSide();

      if (this._overrideAnchorHeader) {
        document.documentElement.removeAttribute("data-anchor-header");
        delete this._overrideAnchorHeader;
      }
    };

    if (this.skipViewTransitions || !this._touchEnabled) {
      this._disableTransitionsBeforeUpdate();
      update();
      this._enableTransitionsAfterUpdate();
    } else {
      const types = [isLeftHanded ? "left-handed" : "right-handed"];
      // console.log("types", types);
      this._updateCSSVariables(true);
      document.startViewTransition({
        update: async () => {
          update();
        },
        types,
      });
    }
  }

  _isTemporarilyDisablingTransitions = false;
  _disableTransitionsBeforeUpdate() {
    if (!this._disableTransitions) {
      if (this._isTemporarilyDisablingTransitions) {
        return;
      }
      this._isTemporarilyDisablingTransitions = true;

      const value = document.documentElement.toggleAttribute(
        "data-disable-transitions",
        true,
      );
      // console.log("temporarily disabling transitions", value);
    }
  }
  async _enableTransitionsAfterUpdate() {
    await waitForAnimationFrames();
    if (!this._isTemporarilyDisablingTransitions) {
      return;
    }
    this._isTemporarilyDisablingTransitions = false;

    const value = document.documentElement.toggleAttribute(
      "data-disable-transitions",
      this._disableTransitions,
    );
    // console.log("re-enabling transitions", value);
  }

  _headerSideProvider = createHeaderSideContextProvider(this, null, () => {
    this._onHeaderSideUpdate();
  });
  _onHeaderSideUpdate() {
    const { headerSide } = this._headerSideProvider.value.state;
    // console.log({ headerSide });
  }
  /** @type {import("../contexts/headerSideContext.js").HeaderSide} */
  get headerSide() {
    return this._headerSideProvider.value.state.headerSide;
  }
  _updateHeaderSide() {
    // console.log("_updateHeaderSide");
    let headerSide = "bottom";
    switch (this._screenOrientationType) {
      case "landscape-primary":
      case "landscape-secondary":
        if (this._anchorHeader) {
          headerSide =
            this._screenOrientationType == "landscape-primary"
              ? "right"
              : "left";
        } else {
          headerSide = this._isLeftHanded ? "left" : "right";
        }
        break;
      case "portrait-primary":
      case "portrait-secondary":
        headerSide = this._touchEnabled ? "bottom" : "top";
        break;
    }
    if (this._viewportOrientation == "landscape") {
      if (this._touchEnabled) {
      } else {
        headerSide = "bottom";
      }
    } else {
    }
    // console.log({ newHeaderSide: headerSide });
    this._headerSideProvider.value.update({ headerSide });
  }

  _isHeaderHiddenProvider = createIsHeaderHiddenContextProvider(
    this,
    null,
    () => {
      this._onIsHeaderHiddenUpdate();
    },
  );
  _onIsHeaderHiddenUpdate() {
    const { isHeaderHidden } = this._isHeaderHiddenProvider.value.state;
    // console.log({ isHeaderHidden });
    const update = () => {
      document.documentElement.toggleAttribute(
        "data-header-hidden",
        Boolean(isHeaderHidden),
      );
      this._updateCSSVariables();
      this._isHeaderHidden = isHeaderHidden;
    };

    if (this.skipViewTransitions || this._viewportOrientation == "portrait") {
      update();
    } else {
      const types = [
        isHeaderHidden ? "header-hidden" : "header-visible",
        `header-${this.headerSide}`,
      ];
      // console.log("types", types);
      this._updateCSSVariables(true);
      document.startViewTransition({
        update: async () => {
          update();
        },
        types,
      });
    }
  }
  _hideHeader() {
    this._isHeaderHiddenProvider.value.update({ isHeaderHidden: true });
  }

  async firstUpdated() {
    console.log("firstUpdated");
    this._didFirstUpdate = true;
    this._updateTabResizeObserver(true);

    await waitForAnimationFrames();
    this._updateCSSVariables();
    if (!CSS.supports("interpolate-size: allow-keywords")) {
      this._updateHeaderCSSVariables();
    }
    this._resetViewport();
    this._getCSSVariables();

    this._disableTransitionsBeforeUpdate();
    this._updateMainOverlayResizeObservers();
    this._enableTransitionsAfterUpdate();
    document.documentElement.setAttribute("data-loaded", true);
  }

  /** @type {CSSStyleDeclaration} */
  _documentComputedStyle;
  _getCSSVariables() {
    this._documentComputedStyle = getComputedStyle(document.documentElement);
    this._themeTransitionDuration = parseFloat(
      this._documentComputedStyle.getPropertyValue(
        "--theme-transition-duration",
      ),
    );
  }

  _updateActiveTab() {
    console.log("_updateActiveTab");
    const { activeTab } = this._activeTabProvider.value.state;
    console.log({ activeTab });
  }

  _batteryManagerProvider = createBatteryManagerContextProvider(
    this,
    null,
    () => {
      // console.log("batteryManagerState", this._batteryManagerState);
      this._batteryManagerState.changes.forEach((change) => {
        switch (change) {
          case "charging":
            this._onBatteryChargingChange();
            break;
          case "level":
            this._onBatteryLevelChange();
            break;
          case "chargingTime":
            this._onBatteryChargingTimeChange();
            break;
          case "dischargingTime":
            this._onBatteryDischargingTimeChange();
            break;
        }
      });
    },
  );

  /** @type {import("../contexts/batteryManagerContext.js").BatteryManagerContextState} */
  get _batteryManagerState() {
    return this._batteryManagerProvider.value.state;
  }
  _charging;
  _onBatteryChargingChange = () => {
    // console.log("_onBatteryChargingChange");
    const { charging } = this._batteryManagerState;
    const firstTime = this._charging == undefined;
    this._charging = charging;
    // console.log({ charging, firstTime });

    document.documentElement.toggleAttribute(
      "data-charging",
      Boolean(charging),
    );

    if (!this._flipOnChargeState.flipOnCharge) {
      return;
    }

    let shouldFlip = false;
    switch (this._screenOrientationType) {
      case "landscape-primary":
        switch (this.headerSide) {
          case "right":
            shouldFlip = charging;
            break;
          case "left":
            shouldFlip = !charging;
            break;
        }
        break;
      case "landscape-secondary":
        switch (this.headerSide) {
          case "right":
            shouldFlip = !charging;
            break;
          case "left":
            shouldFlip = charging;
            break;
        }
        break;
    }
    // console.log({ charging, shouldFlip });
    if (
      this._touchEnabled &&
      charging &&
      shouldFlip &&
      this._didFirstUpdate &&
      !firstTime
    ) {
      this._flip();
    }
  };
  _onBatteryLevelChange = () => {
    // console.log("_onBatteryLevelChange");
    const { level } = this._batteryManagerState;
    // console.log({ level });
  };
  _onBatteryChargingTimeChange = () => {
    // console.log("_onBatteryChargingTimeChange");
    const { chargingTime } = this._batteryManagerState;
    // console.log({ chargingTime });
  };
  _onBatteryDischargingTimeChange = () => {
    // console.log("_onBatteryDischargingTimeChange");
    const { dischargingTime } = this._batteryManagerState;
    // console.log({ dischargingTime });
  };

  _flipOnChargeProvider = createFlipOnChargeContextProvider(this);
  /** @type {import("../contexts/flipOnChargeContext.js").FlipOnChargeContextState} */
  get _flipOnChargeState() {
    return this._flipOnChargeProvider.value.state;
  }

  _scrollAssistProvider = createScrollAssistContextProvider(this, null, () => {
    this._onScrollAssistUpdate();
  });
  /** @type {import("../contexts/scrollAssistContext.js").ScrollAssistContextState} */
  get _scrollAssistState() {
    return this._scrollAssistProvider.value.state;
  }
  get isScrollAssistEnabled() {
    return this._scrollAssistState.enabled;
  }
  _onScrollAssistUpdate() {
    // console.log("_onScrollAssistUpdate");
    document.documentElement.toggleAttribute(
      "data-scroll-assist",
      Boolean(this._scrollAssistState.enabled),
    );
    if (this._viewportOrientation == "portrait") {
      this._updateTabResizeObserver(true);
    }
  }

  _lastTouchTime = 0;
  _doubleTapTimeThreshold = 700;
  _lastTouchPosition;
  _doubleTapDistanceThreshold = 800;
  _allowedNodeNames = ["BUTTON", "SWITCH", "CHECKBOX"];
  /** @type {{identifier: number, screenX: number, screenY: number, timeStamp: number}?} */
  _initialTouchPosition;
  /** @param {TouchEvent} event */
  _onTouchStart = (event) => {
    // console.log("_onTouchStart", event);
    const { changedTouches, targetTouches } = event;

    if (changedTouches.length != 1) {
      return;
    }
    if (targetTouches.length != 1) {
      return;
    }

    const touch = targetTouches[0];
    const { identifier, screenX, screenY } = touch;
    const { timeStamp } = event;
    this._initialTouchPosition = {
      identifier,
      screenX,
      screenY,
      timeStamp,
    };
  };
  /** @param {TouchEvent} event */
  _onTouchEnd = (event) => {
    // console.log("_onTouchEnd", event);
    const { changedTouches, touches, target } = event;

    if (changedTouches.length != 1) {
      return;
    }
    if (touches.length != 0) {
      return;
    }
    this._ignoreTouchIdentifier = false;
    const touch = changedTouches[0];
    // console.log("touch", touch);
    const { screenX, screenY } = touch;

    if (touch.identifier == this._latestTouchMove?.identifier) {
      this._ignoreTouchIdentifier = false;
      this._latestTouchMove = undefined;
    }

    const currentTime = new Date().getTime();
    const tapLength = currentTime - this._lastTouchTime;

    // console.log({
    //   tapLength,
    //   nodeName: target.nodeName,
    //   target: target,
    //   _ignoreTargetDuringNavigation: this._ignoreTargetDuringNavigation,
    // });

    let dblclickTarget = target;
    switch (target.nodeName) {
      case "WA-BUTTON":
        dblclickTarget = target.shadowRoot.querySelector("button");
        break;
    }
    if (dblclickTarget && !dblclickTarget.ondblclick) {
      // console.log("adding ondblclick", dblclickTarget);
      dblclickTarget.ondblclick = (event) => {
        // console.log("intercepted dblclick", event.target);
      };
    }

    if (this._ignoreTargetDuringNavigation == target) {
      // console.log("ignoring target click during navigation");
      event.preventDefault();
    }

    if (
      isIOS &&
      tapLength < this._doubleTapTimeThreshold &&
      tapLength > 0 &&
      !target.nodeName.includes("BUTTON")
    ) {
      const screenDelta = {
        screenX: screenX - this._lastTouchPosition.screenX,
        screenY: screenY - this._lastTouchPosition.screenY,
      };
      const screenDistance = Math.sqrt(
        screenDelta.screenX ** 2 + screenDelta.screenY ** 2,
      );

      // console.log("this._initialTouchPosition", this._initialTouchPosition);
      const initialScreenDelta = {
        screenX: screenX - this._initialTouchPosition.screenX,
        screenY: screenY - this._initialTouchPosition.screenY,
      };
      const initialScreenDistance = Math.sqrt(
        initialScreenDelta.screenX ** 2 + initialScreenDelta.screenY ** 2,
      );

      // console.log({ screenDistance, initialScreenDistance });
      if (true || screenDistance < this._doubleTapDistanceThreshold) {
        const { clientX, clientY } = touch;
        const elementsFromPoint =
          event.composedPath() || document.elementsFromPoint(clientX, clientY);
        // console.log("elementsFromPoint", elementsFromPoint);
        const button = elementsFromPoint.find((element) =>
          this._allowedNodeNames.some((nodeName) =>
            element.nodeName?.includes(nodeName),
          ),
        );
        if (button && initialScreenDistance < 10) {
          button.click();
        }
        console.log("double tap detected", elementsFromPoint);
        event.preventDefault();
        // can detect if accidentally zoomed in via window.visualViewport.scale;
      }
    }
    this._lastTouchTime = currentTime;
    this._lastTouchPosition = { screenX, screenY };
  };

  /** @type {{identifier: number, screenX: number, screenY: number, timeStamp: number, initialScreenX: number, initialScreenY: number, initialTouchedHeader?: boolean, distanceToHeader: number}?} */
  _latestTouchMove;
  _ignoreTouchIdentifier;
  _touchMoveMagnitudeThreshold = 8;
  _touchMoveAngleThreshold = 0.6;
  _touchMoveDistanceToHeaderThreshold = 40;
  /** @param {TouchEvent} event */
  _onTouchMove = (event) => {
    // console.log("_onTouchMove", event);
    const { targetTouches } = event;
    if (targetTouches.length != 1) {
      return;
    }
    const touch = targetTouches[0];
    const { identifier, screenX, screenY } = touch;

    const { timeStamp } = event;
    if (this._ignoreTouchIdentifier) {
      // console.log("ignoring touch identifier");
      return;
    }

    const { clientX, clientY } = touch;
    const elementsFromPoint = document.elementsFromPoint(clientX, clientY);
    const touchedHeader = elementsFromPoint.includes(this.refs.header.value);

    if (identifier != this._latestTouchMove?.identifier) {
      this._latestTouchMove = {
        identifier,
        screenX,
        screenY,
        timeStamp,
        initialScreenX: screenX,
        initialScreenY: screenY,
        initialTouchedHeader: touchedHeader,
        distanceToHeader: touchedHeader ? 0 : Infinity,
      };
      return;
    }

    const touchMoveDelta = {
      screenX: screenX - this._latestTouchMove.screenX,
      screenY: screenY - this._latestTouchMove.screenY,
      initialScreenX: screenX - this._latestTouchMove.initialScreenX,
      initialScreenY: screenY - this._latestTouchMove.initialScreenY,
      timeStamp: timeStamp - this._latestTouchMove.timeStamp,
    };
    Object.assign(this._latestTouchMove, { screenX, screenY, timeStamp });

    if (!touchedHeader) {
      return;
    }

    let angle = Math.atan2(touchMoveDelta.screenY, touchMoveDelta.screenX);
    const twoPI = 2 * Math.PI;
    while (angle < 0) {
      angle += twoPI;
    }
    angle %= twoPI;
    const magnitude = Math.sqrt(
      touchMoveDelta.screenX ** 2 + touchMoveDelta.screenY ** 2,
    );
    if (this._latestTouchMove.distanceToHeader == Infinity) {
      const distanceToHeader = Math.sqrt(
        touchMoveDelta.initialScreenX ** 2 + touchMoveDelta.initialScreenY ** 2,
      );
      // console.log({ distanceToHeader });
      this._latestTouchMove.distanceToHeader = distanceToHeader;
    }
    // console.log({ angle, magnitude });
    if (magnitude < this._touchMoveMagnitudeThreshold) {
      return;
    }
    if (
      !this._latestTouchMove.initialTouchedHeader &&
      this._latestTouchMove.distanceToHeader >
        this._touchMoveDistanceToHeaderThreshold
    ) {
      return;
    }

    let direction;
    for (let i = 0; i < 4; i++) {
      const _angle = (twoPI / 4) * i;
      const difference = Math.min(
        Math.abs(_angle - angle),
        Math.abs(_angle - (angle - twoPI)),
      );
      if (difference < this._touchMoveAngleThreshold) {
        direction = this._directions[i];
      }
    }
    // console.log({ direction, angle });

    if (!direction) {
      return;
    }

    this._ignoreTouchIdentifier = true;
    this._onGestureDirection(direction, true, true, event.target);
  };

  /** @param {KeyboardEvent} event */
  _onKeyDown = (event) => {
    /** @type {Direction} */
    let direction;
    let allowOverflow = true;
    const { key } = event;
    switch (key) {
      case "ArrowUp":
        direction = "up";
        break;
      case "ArrowRight":
        direction = "right";
        break;
      case "ArrowDown":
        direction = "down";
        break;
      case "ArrowLeft":
        direction = "left";
        break;
    }
    if (direction) {
      this._onGestureDirection(direction, false, allowOverflow);
    }
  };

  /** @typedef {"right" | "down" | "left" | "up"} Direction */
  /** @type {Direction[]} */
  _directions = ["right", "down", "left", "up"];
  /**
   * @param {Direction} direction
   * @param {boolean?} isTouch
   * @param {boolean?} allowOverflow
   * @param {HTMLElement?} target
   */
  _onGestureDirection(direction, isTouch, allowOverflow, target) {
    console.log("_onGestureDirection", {
      direction,
      isTouch,
      _touchEnabled: this._touchEnabled,
    });

    const currentTabIndex = tabs.indexOf(this.activeTab);
    let newTabIndex = currentTabIndex;
    let tabIndexOffset = 0;
    const allowSwipeToHideHeader =
      this.isSwipeToHideHeaderGestureEnabled && this._touchEnabled;
    const allowSwipeToChangeTab =
      this.isSwipeToChangeTabGestureEnabled && this._touchEnabled;
    // console.log({ key, currentTabIndex });
    switch (this._viewportOrientation) {
      case "landscape":
        {
          switch (direction) {
            case "up":
              if (isTouch && allowSwipeToChangeTab) {
                tabIndexOffset = -1;
              }
              break;
            case "down":
              if (isTouch && allowSwipeToChangeTab) {
                tabIndexOffset = 1;
              }
              break;
            case "left":
              if (this.headerSide == "left" && allowSwipeToHideHeader) {
                this._hideHeader();
              }
              break;
            case "right":
              if (this.headerSide == "right" && allowSwipeToHideHeader) {
                this._hideHeader();
              }
              break;
          }
          if (isTouch) {
            tabIndexOffset *= -1;
          }
        }
        break;
      case "portrait":
        {
          switch (direction) {
            case "right":
              if (isTouch && allowSwipeToChangeTab) {
                tabIndexOffset = 1;
              }
              break;
            case "left":
              if (isTouch && allowSwipeToChangeTab) {
                tabIndexOffset = -1;
              }
              break;
            case "down":
              if (this.headerSide == "bottom" && allowSwipeToHideHeader) {
                this._hideHeader();
              }
              break;
            case "up":
              if (this.headerSide == "top" && allowSwipeToHideHeader) {
                this._hideHeader();
              }
              break;
          }
          if (this._touchEnabled && this._isLeftHanded == isTouch) {
            tabIndexOffset *= -1;
          }
        }
        break;
    }

    if (tabIndexOffset == 0) {
      return;
    }
    newTabIndex += tabIndexOffset;

    const outOfRange = newTabIndex < 0 || newTabIndex >= tabs.length;
    if (outOfRange && !allowOverflow) {
      return;
    }
    while (newTabIndex < 0) {
      newTabIndex += tabs.length;
    }
    newTabIndex %= tabs.length;

    // console.log({ newTabIndex });
    if (newTabIndex != currentTabIndex) {
      this._ignoreTargetDuringNavigation = target;
      try {
        const type = tabIndexOffset > 0 ? "next-tab" : "previous-tab";
        const types = [type];
        // console.log({ tabIndexOffset, type, types });
        navigation.navigate(`/${tabs[newTabIndex]}`, { info: { types } });
      } catch (error) {
        // console.error(error);
      } finally {
      }
    }
  }

  _swipeToChangeTabGestureProvider =
    createSwipeToChangeTabGestureContextProvider(this);
  /** @type {import("../contexts/swipeToChangeTabGestureContext.js").SwipeToChangeTabGestureContextState} */
  get _swipeToChangeTabGestureState() {
    return this._swipeToChangeTabGestureProvider.value.state;
  }
  get isSwipeToChangeTabGestureEnabled() {
    return this._swipeToChangeTabGestureState.isSwipeToChangeTabEnabled;
  }

  _swipeToHideHeaderGestureProvider =
    createSwipeToHideHeaderGestureContextProvider(this);
  /** @type {import("../contexts/swipeToHideHeaderGestureContext.js").SwipeToHideHeaderGestureContextState} */
  get _swipeToHideHeaderGestureState() {
    return this._swipeToHideHeaderGestureProvider.value.state;
  }
  get isSwipeToHideHeaderGestureEnabled() {
    return this._swipeToHideHeaderGestureState.isSwipeToHideHeaderEnabled;
  }

  _updateTabResizeObserver(updateScroll, waitForResize) {
    const disabled =
      this._viewportOrientation != "portrait" ||
      !this._touchEnabled ||
      !this.isScrollAssistEnabled;
    // console.log("_updateTabResizeObserver", { disabled });
    this.refs.tabContentResizeObserver.value?.toggleAttribute(
      "disabled",
      disabled,
    );
    if (updateScroll) {
      this._updateTabContentScroll(waitForResize);
    }
  }
  _tabContentHeight = 0;
  __tabContentHeight = 0;
  _updateTabContentHeight(height) {
    if (height != undefined) {
      this._tabContentHeight = height;
    }
    this.__tabContentHeight = this._tabContentHeight;
    // console.log("_tabContentHeight", this._tabContentHeight);
    document.documentElement.style.setProperty(
      "--tab-content-height",
      `${this._tabContentHeight}px`,
    );
    if (this._updateTabContentScrollOnResize) {
      this._updateTabContentScrollOnResize = false;
      this._updateTabContentScroll();
    }
  }
  _onTabContentResize(event) {
    /** @type {DOMRectReadOnly} */
    const rect = event.detail.entries[0].contentRect;
    // console.log("_onTabContentResize", rect);
    const { height } = rect;
    this._updateTabContentHeight(height);
  }
  /** @type {AbortController} */
  _scrollOnResizeAbortController;
  _scrollOnResizeAbortControllerTimeoutInterval = 200;
  _updateTabContentScroll = BW.ThrottleUtils.throttle(
    async (waitForResize) => {
      // console.log("_updateTabContentScroll", { waitForResize });

      if (waitForResize) {
        if (this._scrollOnResizeAbortController) {
          this._scrollOnResizeAbortController.abort();
          this._scrollOnResizeAbortController = undefined;
        }
        this._scrollOnResizeAbortController = new AbortController();
        this._scrollOnResizeAbortController.signal.addEventListener(
          "abort",
          () => {
            // console.log("_scrollOnResizeAbortController aborted");
            this._scrollOnResizeAbortController = undefined;
          },
        );

        visualViewport.addEventListener(
          "resize",
          () => {
            this._updateTabContentScroll();
          },
          { signal: this._scrollOnResizeAbortController.signal },
        );

        setTimeout(() => {
          if (!this._scrollOnResizeAbortController) {
            return;
          }
          this._scrollOnResizeAbortController.abort();
          this._scrollOnResizeAbortController = undefined;
        }, this._scrollOnResizeAbortControllerTimeoutInterval);
      }

      if (this._waitingForAnimationFrameToScrollTabContent) {
        // console.log("waiting for animation frame");
        return;
      }
      this._waitingForAnimationFrameToScrollTabContent = true;

      await waitForAnimationFrames(1);
      this._waitingForAnimationFrameToScrollTabContent = false;
      // console.log("tabContent scrollIntoView");
      this.refs.tabContent.value.scrollIntoView();
    },
    50,
    true,
  );

  _onScroll = BW.ThrottleUtils.debounce((event) => {
    if (!isIOS) {
      return;
    }
    console.log("scroll", window.scrollY);
    if (window.scrollY == 1 || window.scrollY == 0) {
      return;
    }
    if (window.scrollY == 0 && getIsFullscreen()) {
      return;
    }
    this._resetViewport();
  }, 100);

  _flipActionButtonProvider = createFlipActionButtonContextProvider(
    this,
    null,
    () => this._onFlipActionButtonUpdate(),
  );
  _onFlipActionButtonUpdate() {
    // console.log("_onFlipActionButtonUpdate");
    document.documentElement.toggleAttribute(
      "data-flip-action-button",
      Boolean(this._flipActionButtonProvider.value.state.visible),
    );
  }
  _toggleThemeActionButtonProvider =
    createToggleThemeActionButtonContextProvider(this, null, () =>
      this._onToggleThemeActionButtonUpdate(),
    );
  _onToggleThemeActionButtonUpdate() {
    // console.log("_onToggleThemeActionButtonUpdate");
    document.documentElement.toggleAttribute(
      "data-toggle-theme-action-button",
      Boolean(this._toggleThemeActionButtonProvider.value.state.visible),
    );
  }
  _toggleFullscreenActionButtonProvider =
    createToggleFullscreenActionButtonContextProvider(this, null, () =>
      this._onToggleFullscreenActionButtonUpdate(),
    );
  _onToggleFullscreenActionButtonUpdate() {
    // console.log("_onToggleFullscreenActionButtonUpdate");
    document.documentElement.toggleAttribute(
      "data-toggle-fullscreen-action-button",
      Boolean(this._toggleFullscreenActionButtonProvider.value.state.visible),
    );
  }
  _toggleHeaderHiddenActionButtonProvider =
    createToggleHeaderHiddenActionButtonContextProvider(this, null, () =>
      this._onToggleHeaderHiddenActionButtonUpdate(),
    );
  _onToggleHeaderHiddenActionButtonUpdate() {
    // console.log("_onToggleHeaderHiddenActionButtonUpdate");
    document.documentElement.toggleAttribute(
      "data-toggle-header-hidden-action-button",
      Boolean(this._toggleHeaderHiddenActionButtonProvider.value.state.visible),
    );
  }

  /** @type {Record<string, import("lit/directives/ref.js").Ref} */
  _mainOverlayRefs = (() => {
    const overlayValues = ["start", "center", "end"];
    const _mainOverlayRefs = {};
    overlayValues.forEach((value1) => {
      overlayValues.forEach((value2) => {
        _mainOverlayRefs[[value1, value2].join("-")] = createRef();
      });
    });
    // console.log("_mainOverlayRefs", _mainOverlayRefs);
    return _mainOverlayRefs;
  })();
  _updateMainOverlayResizeObservers() {
    Object.entries(this._mainOverlayRefs).forEach(([string, ref]) => {
      const [mainAlign, crossAlign] = string.split("-");
      const disabled = false;
      // console.log("_updateMainOverlayResizeObserver", {
      //   mainAlign,
      //   crossAlign,
      //   disabled,
      // });
      ref.value?.toggleAttribute("disabled", disabled);
    });
  }

  _onMainOverlayResize(event) {
    /** @type {DOMRectReadOnly} */
    const rect = event.detail.entries[0].contentRect;
    let { mainAlign, crossAlign, touchOnly, mouseOnly } =
      event.target.children[0].dataset;
    touchOnly = touchOnly != undefined;
    mouseOnly = mouseOnly != undefined;
    // console.log("_onMainOverlayResize", rect, {
    //   mainAlign,
    //   crossAlign,
    // });

    document.documentElement.style.setProperty(
      `--main-overlay-${mainAlign}-${crossAlign}-height`,
      `${rect.height}px`,
    );
  }

  _tabOverlaySizes = {};
  _clearTabOverlaySizes() {
    for (const name in this._tabOverlaySizes) {
      document.documentElement.style.removeProperty(name);
      delete this._tabOverlaySizes[name];
    }
  }
  _onTabOverlayResize(event) {
    /** @type {DOMRectReadOnly} */
    const rect = event.detail.entries[0].contentRect;
    let { mainAlign, crossAlign, touchOnly, mouseOnly } =
      event.target.children[0].dataset;
    touchOnly = touchOnly != undefined;
    mouseOnly = mouseOnly != undefined;
    // console.log("_onTabOverlayResize", rect, {
    //   mainAlign,
    //   crossAlign,
    // });

    const name = `--tab-overlay-${mainAlign}-${crossAlign}-height`;
    const value = rect.height;
    this._tabOverlaySizes[name] = value;
    document.documentElement.style.setProperty(name, `${rect.height}px`);
  }

  _bluetoothProvider = createBluetoothContextProvider(this, null, () =>
    this._onBluetoothUpdate(),
  );

  /** @type {import("../contexts/bluetoothContext.js").BluetoothContextState} */
  get _bluetoothState() {
    return this._bluetoothProvider.value.state;
  }
  _onBluetoothUpdate() {
    const { isBluetoothAvailable, isBluetoothEnabled, isBluetoothScanning } =
      this._bluetoothState;
    console.log({
      isBluetoothAvailable,
      isBluetoothEnabled,
      isBluetoothScanning,
    });
    document.documentElement.toggleAttribute(
      "data-bluetooth-available",
      isBluetoothAvailable,
    );
    document.documentElement.toggleAttribute(
      "data-bluetooth-enabled",
      isBluetoothEnabled,
    );
    document.documentElement.toggleAttribute(
      "data-bluetooth-scanning",
      isBluetoothScanning,
    );
  }

  render() {
    return html`
      <header ${ref(this.refs.header)} id="header" data-axis="cross">
        <nav id="nav" data-axis="cross">
          <bw-nav-button-layers></bw-nav-button-layers>
          <bw-nav-button-apps></bw-nav-button-apps>
          <bw-nav-button-devices></bw-nav-button-devices>
          <bw-nav-button-settings></bw-nav-button-settings>
        </nav>
        <menu id="menu" data-axis="cross">
          <bw-menu-button-flip data-touch-only></bw-menu-button-flip>
          <bw-menu-button-theme data-mouse-only></bw-menu-button-theme>
        </menu>
      </header>

      <div id="main">
        <div id="mainOverlay" @wa-resize=${this._onMainOverlayResize}>
          <wa-resize-observer
            ${ref(this._mainOverlayRefs["start-start"])}
            disabled
          >
            <div
              data-touch-only
              data-main-align="start"
              data-cross-align="start"
            >
              <bw-main-corner-button-toggle-fullscreen
                data-portrait-only
                data-slide-on-enter
              ></bw-main-corner-button-toggle-fullscreen>
              <bw-main-corner-button-toggle-theme
                data-portrait-only
                data-slide-on-enter
              ></bw-main-corner-button-toggle-theme>

              <bw-main-corner-button-toggle-header
                data-portrait-only
                data-slide-on-enter
              ></bw-main-corner-button-toggle-header>
            </div>
          </wa-resize-observer>

          <wa-resize-observer
            ${ref(this._mainOverlayRefs["start-center"])}
            disabled
          >
            <div
              data-touch-only
              data-main-align="start"
              data-cross-align="center"
            ></div>
          </wa-resize-observer>

          <wa-resize-observer
            ${ref(this._mainOverlayRefs["start-end"])}
            disabled
          >
            <div data-touch-only data-main-align="start" data-cross-align="end">
              <bw-main-corner-button-flip
                data-portrait-only
                data-header-hidden-only
                data-slide-on-enter
              ></bw-main-corner-button-flip>

              <bw-main-corner-button-toggle-fullscreen
                data-landscape-only
                data-slide-on-enter
              ></bw-main-corner-button-toggle-fullscreen>
              <bw-main-corner-button-toggle-theme
                data-landscape-only
                data-slide-on-enter
              ></bw-main-corner-button-toggle-theme>
              <bw-main-corner-button-toggle-header
                data-landscape-only
                data-slide-on-enter
              ></bw-main-corner-button-toggle-header>
            </div>
          </wa-resize-observer>

          <wa-resize-observer
            ${ref(this._mainOverlayRefs["center-start"])}
            disabled
          >
            <div
              data-touch-only
              data-main-align="center"
              data-cross-align="start"
            ></div>
          </wa-resize-observer>

          <wa-resize-observer
            ${ref(this._mainOverlayRefs["center-center"])}
            disabled
          >
            <div
              data-touch-only
              data-main-align="center"
              data-cross-align="center"
            ></div>
          </wa-resize-observer>

          <wa-resize-observer
            ${ref(this._mainOverlayRefs["center-end"])}
            disabled
          >
            <div
              data-touch-only
              data-main-align="center"
              data-cross-align="end"
            ></div>
          </wa-resize-observer>

          <wa-resize-observer
            ${ref(this._mainOverlayRefs["end-start"])}
            disabled
          >
            <div
              data-touch-only
              data-main-align="end"
              data-cross-align="start"
            ></div>
          </wa-resize-observer>

          <wa-resize-observer
            ${ref(this._mainOverlayRefs["end-center"])}
            disabled
          >
            <div
              data-touch-only
              data-main-align="end"
              data-cross-align="center"
            ></div>
          </wa-resize-observer>

          <wa-resize-observer ${ref(this._mainOverlayRefs["end-end"])} disabled>
            <div data-touch-only data-main-align="end" data-cross-align="end">
              <bw-main-corner-button-flip
                data-landscape-only
                data-slide-on-enter
              ></bw-main-corner-button-flip>
            </div>
          </wa-resize-observer>
        </div>

        <main>
          <bw-tab-breadcrumb></bw-tab-breadcrumb>
          <div id="tab">
            <div id="tabBefore"></div>
            <wa-resize-observer
              @wa-resize=${this._onTabContentResize}
              ${ref(this.refs.tabContentResizeObserver)}
              disabled
            >
              <div
                id="tabContent"
                ${ref(this.refs.tabContent)}
                @wa-resize=${this._onTabOverlayResize}
              >
                ${this.router.outlet()}
              </div>
            </wa-resize-observer>
            <div id="tabAfter"></div>
          </div>
        </main>
      </div>
    `;
  }
}
customElements.define("bw-app-hub", AppHub);
